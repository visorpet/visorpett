import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAsaasSubscriptions } from "@/lib/asaas";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso restrito ao Super Admin" }, { status: 403 });
    }

    const db = createAdminClient();

    const [{ count: totalPetShops }, { count: activeSubscriptions }] = await Promise.all([
      db.from("PetShop").select("id", { count: "exact", head: true }),
      db
        .from("Subscription")
        .select("id", { count: "exact", head: true })
        .in("status", ["ACTIVE", "TRIALING"]),
    ]);

    // MRR real do Asaas
    let mrr = 0;
    let mrrSource: "asaas" | "estimate" = "estimate";
    try {
      const asaasData = await listAsaasSubscriptions();
      const activeAsaas = (asaasData?.data ?? []).filter(
        (s: any) => s.status === "ACTIVE"
      );
      if (activeAsaas.length > 0) {
        mrr = activeAsaas.reduce((sum: number, s: any) => sum + (s.value ?? 0), 0);
        mrrSource = "asaas";
      } else {
        mrr = (activeSubscriptions ?? 0) * 97;
      }
    } catch {
      mrr = (activeSubscriptions ?? 0) * 97;
    }

    // Churn real: canceladas nos últimos 30 dias
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const { count: cancelledRecent } = await db
      .from("Subscription")
      .select("id", { count: "exact", head: true })
      .eq("status", "CANCELLED")
      .gte("updatedAt", thirtyDaysAgo);

    const churnBase = (activeSubscriptions ?? 0) + (cancelledRecent ?? 0);
    const churnRate =
      churnBase > 0
        ? Math.round(((cancelledRecent ?? 0) / churnBase) * 100 * 10) / 10
        : 0;

    return NextResponse.json({
      data: {
        totalPetShops: totalPetShops ?? 0,
        activeSubscriptions: activeSubscriptions ?? 0,
        churnRate,
        mrr,
        mrrSource,
      },
    });
  } catch (error) {
    console.error("Erro em Admin Metrics:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
