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

    // Query 1: clientes + agendamentos recentes em paralelo
    const [{ data: clients }, { data: recentApts }] = await Promise.all([
      db.from("Client").select("id, name, phone").eq("petShopId", petShopId),
      db.from("Appointment")
        .select("petId, date, pet:Pet!petId(clientId)")
        .eq("petShopId", petShopId)
        .gte("date", thirtyDaysAgo),
    ]);

    if (!clients?.length) return NextResponse.json({ data: [] });

    const activeClientIds = new Set(
      (recentApts ?? [])
        .flatMap((a: { pet: Array<{ clientId: string | null }> | { clientId: string | null } | null }) => {
          if (!a.pet) return [];
          return Array.isArray(a.pet) ? a.pet.map((p) => p.clientId) : [a.pet.clientId];
        })
        .filter(Boolean)
    );

    const inactiveClients = clients
      .filter((c: { id: string }) => !activeClientIds.has(c.id))
      .slice(0, 5);

    if (!inactiveClients.length) return NextResponse.json({ data: [] });

    const inactiveIds = inactiveClients.map((c: { id: string }) => c.id);

    // Query 2+3: busca pets e últimos agendamentos em paralelo (batch único)
    const [{ data: allPets }, { data: allLastApts }] = await Promise.all([
      db.from("Pet").select("id, name, clientId").in("clientId", inactiveIds),
      db.from("Appointment")
        .select("petId, date")
        .eq("petShopId", petShopId)
        .order("date", { ascending: false }),
    ]);

    // Mapeia petId → date para lookup O(1)
    const lastAptByPet = new Map<string, string>();
    for (const apt of allLastApts ?? []) {
      if (!lastAptByPet.has(apt.petId)) lastAptByPet.set(apt.petId, apt.date);
    }

    // Mapeia clientId → primeiro pet
    const petByClient = new Map<string, { id: string; name: string }>();
    for (const pet of allPets ?? []) {
      if (!petByClient.has(pet.clientId)) petByClient.set(pet.clientId, { id: pet.id, name: pet.name });
    }

    const result = inactiveClients.map((client: { id: string; name: string; phone: string }) => {
      const pet = petByClient.get(client.id);
      const lastAptDate = pet ? lastAptByPet.get(pet.id) : undefined;
      const daysSince = lastAptDate
        ? Math.floor((Date.now() - new Date(lastAptDate).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        clientId:   client.id,
        clientName: client.name,
        phone:      client.phone,
        petName:    pet?.name ?? "Pet",
        daysSince,
      };
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Erro em dono/inactive-clients:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
