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

    const { data: shops, error } = await db
      .from("PetShop")
      .select("id, name, city, state, createdAt, ownerId, subscription:Subscription!petShopId(plan,status)")
      .order("createdAt", { ascending: false });

    if (error) throw error;

    // Fetch client and appointment counts
    const shopIds = (shops ?? []).map((s: { id: string }) => s.id);
    const [{ data: clientRows }, { data: appointmentRows }] = await Promise.all([
      shopIds.length > 0
        ? db.from("Client").select("petShopId").in("petShopId", shopIds)
        : Promise.resolve({ data: [] }),
      shopIds.length > 0
        ? db.from("Appointment").select("petShopId").in("petShopId", shopIds)
        : Promise.resolve({ data: [] }),
    ]);

    const clientCount: Record<string, number> = {};
    const appointmentCount: Record<string, number> = {};
    (clientRows ?? []).forEach((r: { petShopId: string }) => {
      clientCount[r.petShopId] = (clientCount[r.petShopId] ?? 0) + 1;
    });
    (appointmentRows ?? []).forEach((r: { petShopId: string }) => {
      appointmentCount[r.petShopId] = (appointmentCount[r.petShopId] ?? 0) + 1;
    });

    // Busca owner via auth.admin para não depender da tabela User pública
    const { data: authData } = await db.auth.admin.listUsers();
    const authUsers: Record<string, { name?: string; email?: string }> = {};
    (authData?.users ?? []).forEach((u: any) => {
      authUsers[u.id] = { name: u.user_metadata?.name ?? u.email, email: u.email };
    });

    const result = (shops ?? []).map((s: any) => ({
      ...s,
      owner: authUsers[s.ownerId] ?? null,
      _count: {
        clients: clientCount[s.id] ?? 0,
        appointments: appointmentCount[s.id] ?? 0,
      },
    }));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Erro buscar PetShops:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
