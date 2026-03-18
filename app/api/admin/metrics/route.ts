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

    const totalPetShops = await db.petShop.count();
    const activeSubscriptions = await db.subscription.count({
      where: { status: { in: ["ACTIVE", "TRIALING"] } },
    });

    const pendingTickets = 14;
    const churnRate = 1.2;
    const mrr = activeSubscriptions * 99;

    return NextResponse.json({ data: { totalPetShops, activeSubscriptions, pendingTickets, churnRate, mrr } });
  } catch (error) {
    console.error("Erro em Admin Metrics:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
