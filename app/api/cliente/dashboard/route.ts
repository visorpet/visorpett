import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.user.role !== "CLIENTE") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const db = createAdminClient();

    const { data: pets } = await db
      .from("Pet")
      .select("*, vaccines:Vaccine!petId(id, name, appliedAt, nextDueAt)")
      .eq("ownerId", userId)
      .order("createdAt", { ascending: false });

    const petIds = (pets ?? []).map((p: { id: string }) => p.id);

    const [upcomingRow, totalRow] = await Promise.all([
      petIds.length > 0
        ? db
            .from("Appointment")
            .select(
              "*, pet:Pet!petId(*), service:Service!serviceId(id,label,price), petShop:PetShop!petShopId(id,name), groomer:Groomer!groomerId(id,name)"
            )
            .in("petId", petIds)
            .in("status", ["agendado", "confirmado", "em_atendimento"])
            .gte("date", new Date().toISOString())
            .order("date", { ascending: true })
            .limit(1)
        : Promise.resolve({ data: [] }),
      petIds.length > 0
        ? db
            .from("Appointment")
            .select("id", { count: "exact", head: true })
            .in("petId", petIds)
        : Promise.resolve({ count: 0 }),
    ]);

    return NextResponse.json({
      data: {
        pets: pets ?? [],
        upcomingAppointment: upcomingRow.data?.[0] ?? null,
        totalAppointments: (totalRow as { count: number | null }).count ?? 0,
      },
    });
  } catch (error) {
    console.error("[API_CLIENTE_DASHBOARD_GET]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
