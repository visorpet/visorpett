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
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Busca clients do petshop
    const { data: clients } = await db
      .from("Client")
      .select("id, name, phone")
      .eq("petShopId", petShopId);

    if (!clients?.length) return NextResponse.json({ data: [] });

    const clientIds = clients.map((c: { id: string }) => c.id);

    // Busca pets com visita recente — PostgREST retorna pet como array
    const { data: recentApts } = await db
      .from("Appointment")
      .select("petId, date, pet:Pet!petId(clientId)")
      .eq("petShopId", petShopId)
      .gte("date", thirtyDaysAgo);

    const activeClientIds = new Set(
      (recentApts ?? [])
        .flatMap((a: { pet: Array<{ clientId: string | null }> | { clientId: string | null } | null }) => {
          if (!a.pet) return [];
          return Array.isArray(a.pet) ? a.pet.map((p) => p.clientId) : [a.pet.clientId];
        })
        .filter(Boolean)
    );

    // Clientes sem visita nos últimos 30 dias
    const inactiveClients = clients
      .filter((c: { id: string }) => !activeClientIds.has(c.id))
      .slice(0, 5); // retorna até 5 para exibir na automação

    // Para cada cliente inativo, busca o último pet
    const result = await Promise.all(
      inactiveClients.map(async (client: { id: string; name: string; phone: string }) => {
        const { data: pets } = await db
          .from("Pet")
          .select("id, name")
          .eq("clientId", client.id)
          .limit(1);

        const { data: lastApt } = await db
          .from("Appointment")
          .select("date")
          .eq("petShopId", petShopId)
          .in("petId", pets?.map((p: { id: string }) => p.id) ?? [])
          .order("date", { ascending: false })
          .limit(1)
          .maybeSingle();

        const daysSince = lastApt
          ? Math.floor((Date.now() - new Date(lastApt.date).getTime()) / (1000 * 60 * 60 * 24))
          : null;

        return {
          clientId:   client.id,
          clientName: client.name,
          phone:      client.phone,
          petName:    pets?.[0]?.name ?? "Pet",
          daysSince,
        };
      })
    );

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Erro em dono/inactive-clients:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
