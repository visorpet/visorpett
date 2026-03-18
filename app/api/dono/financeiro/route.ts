import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, petShopId } = session.user;
    if (role !== "DONO" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso restrito para Donos" }, { status: 403 });
    }
    if (!petShopId) {
      return NextResponse.json({ error: "Sem pet shop associado" }, { status: 403 });
    }

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const db = createAdminClient();

    const [{ data: recentAppts }, { data: allAppts }] = await Promise.all([
      db
        .from("Appointment")
        .select("date, totalPrice")
        .eq("petShopId", petShopId)
        .eq("status", "concluido")
        .gte("date", sixMonthsAgo.toISOString()),
      db
        .from("Appointment")
        .select("totalPrice")
        .eq("petShopId", petShopId)
        .eq("status", "concluido"),
    ]);

    // Build monthly map
    const monthlyMap: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[key] = 0;
    }
    for (const appt of recentAppts ?? []) {
      const d = new Date(appt.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in monthlyMap) monthlyMap[key] += appt.totalPrice ?? 0;
    }

    const monthLabels = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    const monthly = Object.entries(monthlyMap).map(([key, value]) => {
      const month = parseInt(key.split("-")[1]) - 1;
      return { label: monthLabels[month], value };
    });

    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

    const currentRevenue = monthlyMap[currentKey] ?? 0;
    const prevRevenue = monthlyMap[prevKey] ?? 0;
    const percentChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const totalReceived = (allAppts ?? []).reduce(
      (sum: number, a: { totalPrice: number | null }) => sum + (a.totalPrice ?? 0),
      0
    );

    return NextResponse.json({
      data: { monthly, currentRevenue, prevRevenue, percentChange, totalReceived },
    });
  } catch (error) {
    console.error("[dono/financeiro]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
