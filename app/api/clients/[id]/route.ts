import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, petShopId } = session.user;
    if (role !== "DONO" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
    }

    const db = createAdminClient();

    const { data: client, error } = await db
      .from("Client")
      .select("id, name, phone, email, createdAt")
      .eq("id", params.id)
      .eq("petShopId", petShopId)
      .maybeSingle();

    if (error || !client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const { data: pets } = await db
      .from("Pet")
      .select("id, name, species, breed")
      .eq("clientId", params.id)
      .order("name");

    const { data: appointments } = await db
      .from("Appointment")
      .select("id, date, status, totalPrice, notes, updatedAt, pet:Pet!petId(id,name,species), service:Service!serviceId(id,label)")
      .eq("petShopId", petShopId)
      .in("petId", (pets ?? []).map((p: { id: string }) => p.id))
      .order("date", { ascending: false });

    return NextResponse.json({ data: { client, pets: pets ?? [], appointments: appointments ?? [] } });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
