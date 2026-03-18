import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, petShopId } = session.user;
    if (role !== "DONO" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    if (!petShopId) return NextResponse.json({ error: "Pet shop não encontrado" }, { status: 404 });

    // Últimos 7 dias
    const days: { date: string; label: string; isToday: boolean }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({
        date:    dateStr,
        label:   DAY_LABELS[d.getDay()],
        isToday: i === 0,
      });
    }

    const startDate = days[0].date;
    const endDate = days[days.length - 1].date;

    const db = createAdminClient();
    const { data: appointments } = await db
      .from("Appointment")
      .select("date")
      .eq("petShopId", petShopId)
      .gte("date", `${startDate}T00:00:00`)
      .lte("date", `${endDate}T23:59:59`);

    // Conta por dia
    const countByDate: Record<string, number> = {};
    for (const apt of appointments ?? []) {
      const d = apt.date.split("T")[0];
      countByDate[d] = (countByDate[d] ?? 0) + 1;
    }

    const maxValue = Math.max(...days.map((d) => countByDate[d.date] ?? 0), 1);

    const chartData = days.map((d, idx) => ({
      label:       d.label,
      value:       countByDate[d.date] ?? 0,
      isCurrent:   d.isToday,
      isHighlight: !d.isToday && (countByDate[d.date] ?? 0) === maxValue && idx < days.length - 1,
    }));

    return NextResponse.json({ data: chartData });
  } catch (error) {
    console.error("Erro em dono/weekly-chart:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
