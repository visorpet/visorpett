import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
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
    let pets;

    if (role === "CLIENTE") {
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
        where: { client: { petShopId } },
        include: { client: true, owner: true },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "SUPER_ADMIN") {
      pets = await db.pet.findMany({
        include: { client: true, owner: true },
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
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: userId, role } = session.user;
    const body = await request.json();
    const parsedData = petSchema.parse(body);

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
      return NextResponse.json({ error: "Erro de validação", details: error.issues }, { status: 400 });
    }
    console.error("Error creating pet:", error);
    return NextResponse.json({ error: "Erro interno", details: error }, { status: 500 });
  }
}
