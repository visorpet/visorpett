/**
 * GET /api/admin/asaas/payments — lista pagamentos do Asaas (todos ou por assinatura)
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAsaasPayments } from "@/lib/asaas";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const db = createAdminClient();

    // Busca todas as assinaturas com asaasSubscriptionId
    const { data: subs } = await db
      .from("Subscription")
      .select("asaasSubscriptionId, plan, petShopId, PetShop:petShopId(name)")
      .not("asaasSubscriptionId", "is", null);

    if (!subs || subs.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Busca pagamentos de cada assinatura em paralelo (limite 5 por assinatura)
    const results = await Promise.allSettled(
      subs.map(async (sub) => {
        const payments = await listAsaasPayments(sub.asaasSubscriptionId!);
        const shopName = Array.isArray(sub.PetShop)
          ? sub.PetShop[0]?.name
          : (sub.PetShop as any)?.name;
        return (payments?.data ?? []).map((p: any) => ({
          id: p.id,
          petShopId: sub.petShopId,
          petShopName: shopName ?? "—",
          plan: sub.plan,
          value: p.value,
          status: p.status,
          dueDate: p.dueDate,
          paymentDate: p.paymentDate ?? null,
          billingType: p.billingType,
          invoiceUrl: p.invoiceUrl ?? null,
        }));
      })
    );

    const payments = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => (r as PromiseFulfilledResult<any[]>).value)
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

    return NextResponse.json({ data: payments });
  } catch (e) {
    console.error("[ADMIN_PAYMENTS]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
