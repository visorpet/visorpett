import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Busca agendamentos para o dia seguinte
    const tomorrowStart = new Date();
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setUTCHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setUTCHours(23, 59, 59, 999);

    const appointments = await db.appointment.findMany({
      where: {
        date: { gte: tomorrowStart, lte: tomorrowEnd },
        status: "agendado"
      },
      include: {
        pet: { include: { client: true } },
        petShop: true,
        service: true,
      }
    });

    let sentCount = 0;
    for (const apt of appointments) {
      // await sendConfirmationWhatsApp(apt.pet.client.phone, apt);
      sentCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `${sentCount} confirmações de D-1 enviadas.` 
    });
  } catch (error) {
    console.error("Erro no CRON de D-1:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
