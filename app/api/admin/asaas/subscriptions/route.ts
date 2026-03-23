/**
 * Admin: gerencia assinaturas Asaas dos pet shops
 *
 * POST   /api/admin/asaas/subscriptions  — cria cliente + assinatura para um pet shop
 * GET    /api/admin/asaas/subscriptions  — lista assinaturas Asaas
 * DELETE /api/admin/asaas/subscriptions  — cancela assinatura de um pet shop
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createAsaasCustomer,
  findAsaasCustomer,
  createAsaasSubscription,
  cancelAsaasSubscription,
  listAsaasSubscriptions,
  PLAN_PRICES,
} from "@/lib/asaas";

export const dynamic = "force-dynamic";

// ── GET — lista assinaturas Asaas ─────────────────────────────────────────────
export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await listAsaasSubscriptions();
    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── POST — cria cliente + assinatura no Asaas para um pet shop ────────────────
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { petShopId, plan, billingType = "PIX" } = await req.json();

  if (!petShopId || !plan) {
    return NextResponse.json({ error: "petShopId e plan são obrigatórios" }, { status: 400 });
  }

  const price = PLAN_PRICES[plan as string];
  if (!price) {
    return NextResponse.json({ error: `Plano inválido: ${plan}` }, { status: 400 });
  }

  const db = createAdminClient();

  // Busca dados do pet shop e dono
  const { data: shop } = await db
    .from("PetShop")
    .select("id, name, phone, owner:User!ownerId(name, email)")
    .eq("id", petShopId)
    .maybeSingle();

  if (!shop) {
    return NextResponse.json({ error: "Pet shop não encontrado" }, { status: 404 });
  }

  const owner = Array.isArray(shop.owner) ? shop.owner[0] : shop.owner;

  try {
    // 1. Verifica se já tem cliente Asaas (pelo externalReference = petShopId)
    let customer = await findAsaasCustomer(petShopId);

    if (!customer) {
      customer = await createAsaasCustomer({
        name:              shop.name,
        email:             owner?.email ?? undefined,
        phone:             shop.phone   ?? undefined,
        externalReference: petShopId,
      });
    }

    // 2. Cria a assinatura recorrente mensal
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 1);
    const dueDateStr = nextDueDate.toISOString().split("T")[0];

    const subscription = await createAsaasSubscription({
      customer:          customer.id,
      billingType:       billingType as "PIX" | "BOLETO" | "CREDIT_CARD",
      value:             price,
      nextDueDate:       dueDateStr,
      cycle:             "MONTHLY",
      description:       `Visorpet ${plan} — ${shop.name}`,
      externalReference: petShopId,
    });

    // 3. Atualiza Subscription no banco com IDs Asaas + plano
    await db
      .from("Subscription")
      .update({
        plan,
        status:               "TRIALING",
        asaasCustomerId:      customer.id,
        asaasSubscriptionId:  subscription.id,
        updatedAt:            new Date().toISOString(),
      })
      .eq("petShopId", petShopId);

    return NextResponse.json({
      ok: true,
      customerId:     customer.id,
      subscriptionId: subscription.id,
      paymentLink:    subscription.url ?? null,
    });
  } catch (e: unknown) {
    console.error("[ASAAS_SUBSCRIBE]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── DELETE — cancela assinatura Asaas de um pet shop ─────────────────────────
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { petShopId } = await req.json();
  if (!petShopId) {
    return NextResponse.json({ error: "petShopId obrigatório" }, { status: 400 });
  }

  const db = createAdminClient();
  const { data: sub } = await db
    .from("Subscription")
    .select("asaasSubscriptionId")
    .eq("petShopId", petShopId)
    .maybeSingle();

  if (!sub?.asaasSubscriptionId) {
    return NextResponse.json({ error: "Assinatura Asaas não encontrada" }, { status: 404 });
  }

  try {
    await cancelAsaasSubscription(sub.asaasSubscriptionId);

    await db
      .from("Subscription")
      .update({ status: "CANCELLED", updatedAt: new Date().toISOString() })
      .eq("petShopId", petShopId);

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
