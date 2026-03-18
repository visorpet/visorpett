import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { updateAppointmentStatusSchema } from "@/lib/validations/appointment";
import { z } from "zod";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, petShopId } = session.user;

    if (role !== "DONO" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso restrito para Donos" }, { status: 403 });
    }

    const appointment = await db.appointment.findUnique({ where: { id: params.id } });
    if (!appointment) return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });

    if (role === "DONO" && petShopId !== appointment.petShopId) {
      return NextResponse.json({ error: "Este agendamento pertence a outro pet shop" }, { status: 403 });
    }

    const body = await request.json();
    const parsedData = updateAppointmentStatusSchema.parse(body);

    const updatedAppointment = await db.appointment.update({
      where: { id: params.id },
      data: { status: parsedData.status },
    });

    return NextResponse.json({ data: updatedAppointment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Erro de validação", details: error.issues }, { status: 400 });
    }
    console.error("Error updating appointment status:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
