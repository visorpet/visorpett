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
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    if (!petShopId) return NextResponse.json({ error: "Pet shop não encontrado" }, { status: 404 });

    const db = createAdminClient();
    const today = new Date().toISOString().split("T")[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { data: todayApts },
      { data: monthApts },
      { data: inServiceApts },
      { data: allPets },
      { data: recentPets },
    ] = await Promise.all([
      // Agendamentos de hoje
      db.from("Appointment")
        .select("id, status, totalPrice")
        .eq("petShopId", petShopId)
        .gte("date", `${today}T00:00:00`)
        .lte("date", `${today}T23:59:59`),

      // Agendamentos do mês (para receita)
      db.from("Appointment")
        .select("totalPrice, status")
        .eq("petShopId", petShopId)
        .gte("date", startOfMonth)
        .in("status", ["concluido"]),

      // Em atendimento agora
      db.from("Appointment")
        .select("id")
        .eq("petShopId", petShopId)
        .eq("status", "em_atendimento"),

      // Total de pets cadastrados no petshop
      db.from("Pet")
        .select("id, clientId")
        .in("clientId",
          (await db.from("Client").select("id").eq("petShopId", petShopId)).data?.map((c: { id: string }) => c.id) ?? []
        ),

      // Pets com visita nos últimos 30 dias
      db.from("Appointment")
        .select("petId")
        .eq("petShopId", petShopId)
        .gte("date", thirtyDaysAgo),
    ]);

    const monthRevenue = (monthApts ?? []).reduce((sum, a) => sum + (a.totalPrice ?? 0), 0);
    const todayCount = (todayApts ?? []).length;
    const inServiceCount = (inServiceApts ?? []).length;

    // Clientes inativos: pets sem visita nos últimos 30 dias
    const recentPetIds = new Set((recentPets ?? []).map((r: { petId: string }) => r.petId));
    const allPetIds = (allPets ?? []).map((p: { id: string }) => p.id);
    const inactiveCount = allPetIds.filter((id: string) => !recentPetIds.has(id)).length;

    return NextResponse.json({
      data: {
        todayAppointments: todayCount,
        monthRevenue,
        inService: inServiceCount,
        inactiveClients: inactiveCount,
        totalPets: allPetIds.length,
      },
    });
  } catch (error) {
    console.error("Erro em dono/metrics:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
