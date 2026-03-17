import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { petSchema } from "@/lib/validations/pet";
import { z } from "zod";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;
    const petShopId = (session.user as any).petShopId;

    let pets;

    if (role === "CLIENTE") {
      // Verificando se userId existe para não passar undefined no Prisma
      if (!userId) {
         return NextResponse.json({ error: "Sessão inválida" }, { status: 400 });
      }
      pets = await db.pet.findMany({
        where: { ownerId: userId },
        include: {
          client: true,
          vaccines: { orderBy: { appliedAt: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "DONO" && petShopId) {
      pets = await db.pet.findMany({
        where: { client: { petShopId: petShopId } },
        include: {
          client: true,
          owner: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "SUPER_ADMIN") {
      pets = await db.pet.findMany({
        include: {
          client: true,
          owner: true,
        },
        take: 50,
        orderBy: { createdAt: "desc" },
      });
    } else {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    return NextResponse.json({ data: pets });
  } catch (error: any) {
    console.error("Error fetching pets:", error);
    return NextResponse.json(
      { error: "Erro interno", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const parsedData = petSchema.parse(body);

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    // TODO: Adicionar checagem de Quota se for DONO

    const pet = await db.pet.create({
      data: {
        name: parsedData.name,
        species: parsedData.species,
        breed: parsedData.breed,
        birthDate: parsedData.birthDate ? new Date(parsedData.birthDate) : undefined,
        weight: parsedData.weight,
        notes: parsedData.notes,
        clientId: parsedData.clientId,
        ownerId: role === "CLIENTE" ? userId : undefined,
      },
    });

    return NextResponse.json({ data: pet }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Erro de validação", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating pet:", error);
    return NextResponse.json(
      { error: "Erro interno", details: error },
      { status: 500 }
    );
  }
}
