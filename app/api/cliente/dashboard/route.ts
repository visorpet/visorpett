import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.user.role !== "CLIENTE") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;

    const [pets, upcomingAppointment] = await Promise.all([
      db.pet.findMany({
        where: { ownerId: userId },
        include: {
          vaccines: {
            orderBy: { appliedAt: "desc" },
            take: 2,
          },
        },
      }),
      db.appointment.findFirst({
        where: {
          pet: { ownerId: userId },
          status: { in: ["agendado", "confirmado", "em_atendimento"] },
          date: { gte: new Date() },
        },
        orderBy: { date: "asc" },
        include: { pet: true, service: true, petShop: true, groomer: true },
      }),
    ]);

    const totalAppointments = await db.appointment.count({
      where: { pet: { ownerId: userId } },
    });

    return NextResponse.json({ data: { pets, upcomingAppointment, totalAppointments } });
  } catch (error) {
    console.error("[API_CLIENTE_DASHBOARD_GET]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
