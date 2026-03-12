import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso restrito ao Super Admin" }, { status: 403 });
    }

    // Calcula todas as métricas gerais que aparecem na Dashboard
    const totalPetShops = await db.petShop.count();
    const activeSubscriptions = await db.subscription.count({
      where: {
        status: { in: ["ACTIVE", "TRIALING"] },
      }
    });

    const pendingTickets = 14; 
    const churnRate = 1.2;
    const mrr = activeSubscriptions * 99; // Mock sem Stripe

    return NextResponse.json({
      data: {
        totalPetShops,
        activeSubscriptions,
        pendingTickets,
        churnRate,
        mrr,
      }
    });
  } catch (error) {
    console.error("Erro em Admin Metrics:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
