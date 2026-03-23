import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createAsaasCustomer,
  findAsaasCustomer,
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

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, petShopId } = session.user;
    if (role !== "DONO") return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
    if (!petShopId) return NextResponse.json({ error: "Pet shop não encontrado" }, { status: 404 });

    const body = await request.json();
    const { plan, billingType } = schema.parse(body);

    const price = PLAN_PRICES[plan];

    const db = createAdminClient();
    const { data: shop } = await db
      .from("PetShop")
      .select("id, name, phone, ownerId")
      .eq("id", petShopId)
      .maybeSingle();

    if (!shop) return NextResponse.json({ error: "Pet shop não encontrado" }, { status: 404 });

    // Busca e-mail do dono via Auth Admin
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

    // Cria ou reutiliza cliente Asaas
    let customer = await findAsaasCustomer(petShopId);
    if (!customer) {
      customer = await createAsaasCustomer({
        name: shop.name,
        email: ownerEmail,
        phone: (shop as any).phone ?? undefined,
        externalReference: petShopId,
      });
    }

    // Cria assinatura recorrente mensal
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 1);
    const dueDateStr = nextDueDate.toISOString().split("T")[0];

    const subscription = await createAsaasSubscription({
      customer: customer.id,
      billingType: billingType as "PIX" | "BOLETO" | "CREDIT_CARD",
      value: price,
      nextDueDate: dueDateStr,
      cycle: "MONTHLY",
      description: `Visorpet ${plan} — ${shop.name}`,
      externalReference: petShopId,
    });

    // Atualiza Subscription no banco
    await db
      .from("Subscription")
      .upsert(
        {
          petShopId,
          plan,
          status: "TRIALING",
          asaasCustomerId: customer.id,
          asaasSubscriptionId: subscription.id,
          updatedAt: new Date().toISOString(),
        },
        { onConflict: "petShopId" }
      );

    return NextResponse.json({
      ok: true,
      paymentLink: subscription.url ?? null,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    console.error("[CHECKOUT]", error);
    return NextResponse.json({ error: "Erro ao gerar cobrança" }, { status: 500 });
  }
}
