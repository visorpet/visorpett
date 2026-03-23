import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createAsaasCustomer,
  findAsaasCustomer,
  updateAsaasCustomer,
  createAsaasSubscription,
  PLAN_PRICES,
} from "@/lib/asaas";
import { createClient as createAuthClient } from "@supabase/supabase-js";
import { z } from "zod";

const schema = z.object({
  plan: z.enum(["PRO", "PREMIUM", "ENTERPRISE"]),
  billingType: z.enum(["PIX", "BOLETO", "CREDIT_CARD"]).default("PIX"),
});

export const dynamic = "force-dynamic";

/** Extrai mensagem legível de erros da API Asaas */
function parseAsaasError(error: unknown): { message: string; status: number } {
  const msg = error instanceof Error ? error.message : String(error);

  // ASAAS_API_KEY não configurada
  if (msg.includes("ASAAS_API_KEY não configurada")) {
    return { message: "Gateway de pagamento não configurado. Entre em contato com o suporte.", status: 503 };
  }

  // Erros HTTP do Asaas: "Asaas 4XX: {...}"
  const httpMatch = msg.match(/Asaas (\d+): (.+)/);
  if (httpMatch) {
    const statusCode = parseInt(httpMatch[1]);
    try {
      const body = JSON.parse(httpMatch[2]);
      const descriptions: string[] = (body.errors ?? [])
        .map((e: { description?: string }) => e.description)
        .filter(Boolean);

      if (descriptions.length > 0) {
        return { message: descriptions.join(" | "), status: statusCode >= 500 ? 502 : 422 };
      }

      if (statusCode === 401) return { message: "Chave de API inválida. Contate o suporte.", status: 502 };
      if (statusCode === 429) return { message: "Muitas tentativas. Aguarde alguns segundos e tente novamente.", status: 429 };
    } catch { /* JSON inválido — usa mensagem genérica abaixo */ }
  }

  return { message: "Erro ao processar pagamento. Tente novamente.", status: 500 };
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { role, petShopId } = session.user;
  if (role !== "DONO") return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
  if (!petShopId) return NextResponse.json({ error: "Pet shop não encontrado" }, { status: 404 });

  // Valida body
  let plan: string, billingType: string;
  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    plan = parsed.plan;
    billingType = parsed.billingType;
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const price = PLAN_PRICES[plan];
  const db = createAdminClient();

  // Busca pet shop
  const { data: shop } = await db
    .from("PetShop")
    .select("id, name, phone, cpfCnpj, ownerId")
    .eq("id", petShopId)
    .maybeSingle();

  if (!shop) return NextResponse.json({ error: "Pet shop não encontrado" }, { status: 404 });

  // Busca e-mail do dono via Auth Admin (opcional)
  let ownerEmail: string | undefined;
  try {
    const authAdmin = createAuthClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: { user: ownerUser } } = await authAdmin.auth.admin.getUserById(
      (shop as any).ownerId
    );
    ownerEmail = ownerUser?.email ?? undefined;
  } catch { /* e-mail é opcional */ }

  // Valida CPF/CNPJ antes de qualquer chamada ao Asaas
  const cpfCnpj = (shop as any).cpfCnpj?.replace(/\D/g, "") || undefined;
  if (!cpfCnpj) {
    return NextResponse.json({
      error: "Preencha o CPF ou CNPJ do pet shop em Dados do Pet Shop antes de assinar.",
    }, { status: 422 });
  }

  // ─── Asaas: cria/atualiza cliente ────────────────────────
  let customer: any;
  try {
    customer = await findAsaasCustomer(petShopId);
    if (!customer) {
      customer = await createAsaasCustomer({
        name: shop.name,
        email: ownerEmail,
        phone: (shop as any).phone ?? undefined,
        cpfCnpj,
        externalReference: petShopId,
      });
    } else {
      // Garante que o cliente existente tem CPF/CNPJ atualizado
      if (!customer.cpfCnpj) {
        await updateAsaasCustomer(customer.id, { cpfCnpj });
      }
    }
  } catch (err) {
    const { message, status } = parseAsaasError(err);
    console.error("[CHECKOUT] cliente Asaas:", err);
    return NextResponse.json({ error: message }, { status });
  }

  // ─── Asaas: cria assinatura ───────────────────────────────
  let subscription: any;
  try {
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 1);
    const dueDateStr = nextDueDate.toISOString().split("T")[0];

    subscription = await createAsaasSubscription({
      customer: customer.id,
      billingType: billingType as "PIX" | "BOLETO" | "CREDIT_CARD",
      value: price,
      nextDueDate: dueDateStr,
      cycle: "MONTHLY",
      description: `Visorpet ${plan} — ${shop.name}`,
      externalReference: petShopId,
    });
  } catch (err) {
    const { message, status } = parseAsaasError(err);
    console.error("[CHECKOUT] assinatura Asaas:", err);
    return NextResponse.json({ error: message }, { status });
  }

  // ─── Banco: atualiza Subscription ────────────────────────
  try {
    const { data: existing } = await db
      .from("Subscription")
      .select("id")
      .eq("petShopId", petShopId)
      .maybeSingle();

    const payload = {
      plan,
      status: "TRIALING",
      asaasCustomerId: customer.id,
      asaasSubscriptionId: subscription.id,
      updatedAt: new Date().toISOString(),
    };

    if (existing) {
      await db.from("Subscription").update(payload).eq("petShopId", petShopId);
    } else {
      await db.from("Subscription").insert({ petShopId, ...payload });
    }
  } catch (dbErr) {
    // Assinatura foi criada no Asaas mas falhou ao salvar no banco.
    // Retorna sucesso mesmo assim para não bloquear o checkout.
    console.error("[CHECKOUT] erro ao salvar no banco (assinatura já criada no Asaas):", dbErr);
  }

  return NextResponse.json({
    ok: true,
    paymentLink: subscription.url ?? null,
    subscriptionId: subscription.id,
  });
}
