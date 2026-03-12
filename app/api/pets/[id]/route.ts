import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { updatePetSchema } from "@/lib/validations/pet";
import { z } from "zod";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;
    const petShopId = (session.user as any).petShopId;

    const pet = await db.pet.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        vaccines: { orderBy: { appliedAt: "desc" } },
        medicalNotes: { orderBy: { createdAt: "desc" } },
        appointments: { orderBy: { date: "desc" }, take: 5 },
      },
    });

    if (!pet) {
      return NextResponse.json({ error: "Pet não encontrado" }, { status: 404 });
    }

    // Autorização
    if (role === "CLIENTE" && pet.ownerId !== userId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    if (role === "DONO" && pet.client.petShopId !== petShopId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    return NextResponse.json({ data: pet });
  } catch (error) {
    console.error("Error fetching pet details:", error);
    return NextResponse.json(
      { error: "Erro interno", details: error },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;
    const petShopId = (session.user as any).petShopId;

    const existingPet = await db.pet.findUnique({
      where: { id: params.id },
      include: { client: true },
    });

    if (!existingPet) {
      return NextResponse.json({ error: "Pet não encontrado" }, { status: 404 });
    }

    // Autorização
    if (role === "CLIENTE" && existingPet.ownerId !== userId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    if (role === "DONO" && existingPet.client.petShopId !== petShopId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const parsedData = updatePetSchema.parse(body);

    const updatedPet = await db.pet.update({
      where: { id: params.id },
      data: {
        name: parsedData.name,
        species: parsedData.species,
        breed: parsedData.breed,
        birthDate: parsedData.birthDate ? new Date(parsedData.birthDate) : undefined,
        weight: parsedData.weight,
        notes: parsedData.notes,
      },
    });

    return NextResponse.json({ data: updatedPet });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Erro de validação", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating pet:", error);
    return NextResponse.json(
      { error: "Erro interno", details: error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;
    const petShopId = (session.user as any).petShopId;

    const existingPet = await db.pet.findUnique({
      where: { id: params.id },
      include: { client: true },
    });

    if (!existingPet) {
      return NextResponse.json({ error: "Pet não encontrado" }, { status: 404 });
    }

    // Autorização
    if (role === "CLIENTE" && existingPet.ownerId !== userId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    if (role === "DONO" && existingPet.client.petShopId !== petShopId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    await db.pet.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Error deleting pet:", error);
    return NextResponse.json(
      { error: "Erro interno", details: error },
      { status: 500 }
    );
  }
}
