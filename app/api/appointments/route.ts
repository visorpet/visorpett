import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { appointmentSchema } from "@/lib/validations/appointment";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, id: userId, petShopId } = session.user;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const statusParam = searchParams.get("status");

    const extraFilters: any = {};
    if (dateParam) {
      const startOfDay = new Date(dateParam);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(dateParam);
      endOfDay.setUTCHours(23, 59, 59, 999);
      extraFilters.date = { gte: startOfDay, lte: endOfDay };
    }
    if (statusParam) extraFilters.status = statusParam;

    let appointments;

    if (role === "CLIENTE") {
      const pets = await db.pet.findMany({ where: { ownerId: userId }, select: { id: true } });
      const petIds = pets.map((p: { id: string }) => p.id);
      appointments = await db.appointment.findMany({
        where: { petId: { in: petIds }, ...extraFilters },
        include: { pet: true, petShop: true, service: true, groomer: true },
        orderBy: { date: "asc" },
      });
    } else if (role === "DONO" && petShopId) {
      appointments = await db.appointment.findMany({
        where: { petShopId, ...extraFilters },
        include: { pet: { include: { client: true } }, service: true, groomer: true },
        orderBy: { date: "asc" },
      });
    } else {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    return NextResponse.json({ data: appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, id: userId } = session.user;
    const body = await request.json();
    const parsedData = appointmentSchema.parse(body);

    const pet = await db.pet.findUnique({
      where: { id: parsedData.petId },
      include: { client: true },
    });

    if (!pet) return NextResponse.json({ error: "Pet não encontrado" }, { status: 404 });

    if (role === "CLIENTE" && pet.ownerId !== userId) {
      return NextResponse.json({ error: "Acesso negado", message: "Este pet não pertence a você" }, { status: 403 });
    }

    const service = await db.service.findUnique({ where: { id: parsedData.serviceId } });
    if (!service) return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });

    const appointment = await db.appointment.create({
      data: {
        petId: parsedData.petId,
        petShopId: parsedData.petShopId,
        serviceId: parsedData.serviceId,
        groomerId: parsedData.groomerId,
        date: new Date(parsedData.date),
        notes: parsedData.notes,
        totalPrice: service.price,
        status: "agendado",
      },
    });

    return NextResponse.json({ data: appointment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Erro de validação", details: error.issues }, { status: 400 });
    }
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
