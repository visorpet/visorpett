import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, id: userId, petShopId } = session.user;
    const db = createAdminClient();

    const { data: pet } = await db
      .from("Pet")
      .select("id, ownerId, clientId, client:Client!clientId(petShopId)")
      .eq("id", params.id)
      .maybeSingle();

    if (!pet) return NextResponse.json({ error: "Pet não encontrado" }, { status: 404 });

    if (role === "CLIENTE" && pet.ownerId !== userId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    if (role === "DONO" && (pet.client as any)?.petShopId !== petShopId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const { name, appliedAt, nextDueAt, vetName } = body;

    if (!name || !appliedAt) {
      return NextResponse.json({ error: "Nome e data de aplicação são obrigatórios" }, { status: 400 });
    }

    const { data: vaccine, error } = await db
      .from("Vaccine")
      .insert({
        petId: params.id,
        name: name.trim(),
        appliedAt: new Date(appliedAt).toISOString(),
        nextDueAt: nextDueAt ? new Date(nextDueAt).toISOString() : null,
        vetName: vetName?.trim() || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: vaccine }, { status: 201 });
  } catch (error) {
    console.error("Error creating vaccine:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, id: userId, petShopId } = session.user;
    const db = createAdminClient();

    const url = new URL(request.url);
    const vaccineId = url.searchParams.get("vaccineId");
    if (!vaccineId) return NextResponse.json({ error: "vaccineId obrigatório" }, { status: 400 });

    const { data: pet } = await db
      .from("Pet")
      .select("id, ownerId, clientId, client:Client!clientId(petShopId)")
      .eq("id", params.id)
      .maybeSingle();

    if (!pet) return NextResponse.json({ error: "Pet não encontrado" }, { status: 404 });

    if (role === "CLIENTE" && pet.ownerId !== userId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    if (role === "DONO" && (pet.client as any)?.petShopId !== petShopId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { error } = await db
      .from("Vaccine")
      .delete()
      .eq("id", vaccineId)
      .eq("petId", params.id);

    if (error) throw error;

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Error deleting vaccine:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
