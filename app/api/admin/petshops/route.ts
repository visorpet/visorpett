import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso restrito ao Super Admin" }, { status: 403 });
    }

    const shops = await db.petShop.findMany({
      include: {
        owner: { select: { name: true, email: true, phone: true } },
        subscription: true,
        _count: { select: { clients: true, appointments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: shops });
  } catch (error) {
    console.error("Erro buscar PetShops:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
