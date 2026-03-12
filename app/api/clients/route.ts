import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientSchema } from "@/lib/validations/client";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const petShopId = (session.user as any).petShopId;

    if (!petShopId) {
      return NextResponse.json({ error: "Você não possui um pet shop" }, { status: 403 });
    }

    const role = (session.user as any).role;
    if (role !== "DONO" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso restrito para Donos" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const extraFilters: any = {};
    if (search) {
      extraFilters.OR = [
        { name:  { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    const clients = await db.client.findMany({
      where: { petShopId, ...extraFilters },
      include: {
        pets: {
          include: {
            appointments: { orderBy: { date: "desc" }, take: 1 }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: clients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const petShopId = (session.user as any).petShopId;

    if (role !== "DONO" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso restrito para Donos" }, { status: 403 });
    }

    if (!petShopId) {
      return NextResponse.json({ error: "Você não possui um pet shop associado" }, { status: 403 });
    }

    const body = await request.json();
    const parsedData = clientSchema.parse(body);

    if (parsedData.petShopId !== petShopId && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Você só pode criar clientes para o seu pet shop" }, { status: 403 });
    }

    // Tentar encontrar um usuário com o mesmo e-mail para linkar (se tiver email)
    let linkedUserId = null;
    if (parsedData.email) {
      const existingUser = await db.user.findUnique({
        where: { email: parsedData.email }
      });
      if (existingUser) {
        linkedUserId = existingUser.id;
      }
    }

    const newClient = await db.client.create({
      data: {
        name: parsedData.name,
        email: parsedData.email,
        phone: parsedData.phone,
        petShopId: petShopId,
        userId: linkedUserId,
      },
    });

    return NextResponse.json({ data: newClient }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Erro de validação", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Erro interno", details: error }, { status: 500 });
  }
}
