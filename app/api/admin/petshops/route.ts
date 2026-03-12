import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const role = (session.user as any).role;

    // Apenas Super Admin pode listar todas as lojas do aplicativo
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso restrito ao Super Admin" }, { status: 403 });
    }

    const shops = await db.petShop.findMany({
      include: {
        owner: { select: { name: true, email: true, phone: true } },
        subscription: true,
        _count: { select: { clients: true, appointments: true } }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: shops });
  } catch (error) {
    console.error("Erro buscar PetShops:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
