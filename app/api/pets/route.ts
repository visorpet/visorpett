import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { petSchema } from "@/lib/validations/pet";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { role, id: userId, petShopId } = session.user;
    const db = createAdminClient();
    let query;

    if (role === "CLIENTE") {
      query = db
        .from("Pet")
        .select("*, vaccines:Vaccine!petId(*)")
        .eq("ownerId", userId)
        .order("createdAt", { ascending: false });
    } else if (role === "DONO" && petShopId) {
      // Busca pets cujos clientes pertencem ao pet shop
      const { data: clients } = await db
        .from("Client")
        .select("id")
        .eq("petShopId", petShopId);
      const clientIds = (clients ?? []).map((c: { id: string }) => c.id);
      if (clientIds.length === 0) return NextResponse.json({ data: [] });
      query = db
        .from("Pet")
        .select("*, client:Client!clientId(*)")
        .in("clientId", clientIds)
        .order("createdAt", { ascending: false });
    } else if (role === "SUPER_ADMIN") {
      query = db
        .from("Pet")
        .select("*, client:Client!clientId(*)")
        .order("createdAt", { ascending: false })
        .limit(50);
    } else {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { data: pets, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: pets ?? [] });
  } catch (error: unknown) {
    console.error("Error fetching pets:", error);
    return NextResponse.json(
      { error: "Erro interno", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: userId, role } = session.user;
    const body = await request.json();
    const parsedData = petSchema.parse(body);

    const db = createAdminClient();
    const { data: pet, error } = await db
      .from("Pet")
      .insert({
        id: crypto.randomUUID(),
        name: parsedData.name,
        species: parsedData.species,
        breed: parsedData.breed ?? null,
        birthDate: parsedData.birthDate ?? null,
        weight: parsedData.weight ?? null,
        notes: parsedData.notes ?? null,
        photoUrl: parsedData.photoUrl ?? null,
        clientId: parsedData.clientId ?? null,
        ownerId: role === "CLIENTE" ? userId : null,
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: pet }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Erro de validação", details: error.issues }, { status: 400 });
    }
    console.error("Error creating pet:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
