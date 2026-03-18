import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { z } from "zod";

const petshopUpdateSchema = z.object({
  name:    z.string().min(2).optional(),
  slug:    z.string().min(3).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  phone:   z.string().optional(),
  address: z.string().optional(),
  city:    z.string().optional(),
  state:   z.string().optional(),
});

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, petShopId } = session.user;

    if (role !== "DONO" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso restrito para Donos" }, { status: 403 });
    }
    if (!petShopId) return NextResponse.json({ error: "Você não possui um pet shop" }, { status: 404 });

    const petShop = await db.petShop.findUnique({
      where: { id: petShopId },
      include: { subscription: true, groomers: true, services: { where: { active: true } } },
    });

    return NextResponse.json({ data: petShop });
  } catch (error) {
    console.error("Error fetching pet shop info:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, petShopId } = session.user;

    if (role !== "DONO" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso restrito para Donos" }, { status: 403 });
    }
    if (!petShopId) return NextResponse.json({ error: "Você não possui um pet shop" }, { status: 404 });

    const body = await request.json();
    const parsedData = petshopUpdateSchema.parse(body);

    const petShop = await db.petShop.update({ where: { id: petShopId }, data: parsedData });

    return NextResponse.json({ data: petShop });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Erro de validação", details: error.issues }, { status: 400 });
    }
    console.error("Error updating pet shop info:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
