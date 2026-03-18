import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";

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

    const shopIds = (shops ?? []).map((s: { id: string }) => s.id);
    const ownerIdSet = new Set((shops ?? []).map((s: { ownerId: string }) => s.ownerId).filter(Boolean));
    const ownerIds = Array.from(ownerIdSet);

    // Fetch counts and owner profiles in parallel
    const [{ data: clientRows }, { data: appointmentRows }, { data: authData }] = await Promise.all([
      shopIds.length > 0
        ? db.from("Client").select("petShopId").in("petShopId", shopIds)
        : Promise.resolve({ data: [] }),
      shopIds.length > 0
        ? db.from("Appointment").select("petShopId").in("petShopId", shopIds)
        : Promise.resolve({ data: [] }),
      ownerIds.length > 0
        ? db.auth.admin.listUsers()
        : Promise.resolve({ data: { users: [] } }),
    ]);

    const clientCount: Record<string, number> = {};
    const appointmentCount: Record<string, number> = {};
    (clientRows ?? []).forEach((r: { petShopId: string }) => {
      clientCount[r.petShopId] = (clientCount[r.petShopId] ?? 0) + 1;
    });
    (appointmentRows ?? []).forEach((r: { petShopId: string }) => {
      appointmentCount[r.petShopId] = (appointmentCount[r.petShopId] ?? 0) + 1;
    });

    const authUsers: Record<string, { name?: string; email?: string }> = {};
    ((authData as { users: User[] } | null)?.users ?? [])
      .filter((u: User) => ownerIdSet.has(u.id))
      .forEach((u: User) => {
        authUsers[u.id] = {
          name: (u.user_metadata?.name as string | undefined) ?? u.email,
          email: u.email,
        };
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
