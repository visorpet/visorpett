import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { updatePetSchema } from "@/lib/validations/pet";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, id: userId, petShopId } = session.user;
    const db = createAdminClient();

    const { data: pet, error } = await db
      .from("Pet")
      .select("*, client:Client!clientId(*), vaccines:Vaccine!petId(*), medicalNotes:MedicalNote!petId(*), appointments:Appointment!petId(*)")
      .eq("id", params.id)
      .maybeSingle();

    if (error) throw error;
    if (!pet) return NextResponse.json({ error: "Pet não encontrado" }, { status: 404 });

    if (role === "CLIENTE" && pet.ownerId !== userId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    if (role === "DONO" && pet.client?.petShopId !== petShopId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    return NextResponse.json({ data: pet });
  } catch (error) {
    console.error("Error fetching pet details:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, id: userId, petShopId } = session.user;
    const db = createAdminClient();

    const { data: existingPet } = await db
      .from("Pet")
      .select("id, ownerId, clientId")
      .eq("id", params.id)
      .maybeSingle();

    if (!existingPet) return NextResponse.json({ error: "Pet não encontrado" }, { status: 404 });

    if (role === "CLIENTE" && existingPet.ownerId !== userId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    if (role === "DONO" && existingPet.clientId) {
      const { data: client } = await db
        .from("Client")
        .select("petShopId")
        .eq("id", existingPet.clientId)
        .maybeSingle();
      if (client?.petShopId !== petShopId) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }
    }

    const body = await request.json();
    const parsedData = updatePetSchema.parse(body);

    const { data: updatedPet, error } = await db
      .from("Pet")
      .update({
        name: parsedData.name,
        species: parsedData.species,
        breed: parsedData.breed ?? null,
        birthDate: parsedData.birthDate ?? null,
        weight: parsedData.weight ?? null,
        notes: parsedData.notes ?? null,
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: updatedPet });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Erro de validação", details: error.issues }, { status: 400 });
    }
    console.error("Error updating pet:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, id: userId, petShopId } = session.user;
    const db = createAdminClient();

    const { data: existingPet } = await db
      .from("Pet")
      .select("id, ownerId, clientId")
      .eq("id", params.id)
      .maybeSingle();

    if (!existingPet) return NextResponse.json({ error: "Pet não encontrado" }, { status: 404 });

    if (role === "CLIENTE" && existingPet.ownerId !== userId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    if (role === "DONO" && existingPet.clientId) {
      const { data: client } = await db
        .from("Client")
        .select("petShopId")
        .eq("id", existingPet.clientId)
        .maybeSingle();
      if (client?.petShopId !== petShopId) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }
    }

    const { error } = await db.from("Pet").delete().eq("id", params.id);
    if (error) throw error;

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Error deleting pet:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
