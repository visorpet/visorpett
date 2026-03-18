import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

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

    const churnRate = 1.2;
    const mrr = (activeSubscriptions ?? 0) * 99;

    return NextResponse.json({
      data: {
        totalPetShops: totalPetShops ?? 0,
        activeSubscriptions: activeSubscriptions ?? 0,
        churnRate,
        mrr,
      },
    });
  } catch (error) {
    console.error("Erro em Admin Metrics:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
