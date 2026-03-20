import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildPostServiceMessage, sendWhatsAppMessage } from "@/lib/whatsapp";
import { updateAppointmentSchema } from "@/lib/validations/appointment";
import { z } from "zod";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { role, petShopId } = session.user;

    if (role !== "DONO" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso restrito para Donos" }, { status: 403 });
    }

    const db = createAdminClient();

    const { data: appointment } = await db
      .from("Appointment")
      .select("id, petShopId, petId, serviceId")
      .eq("id", params.id)
      .maybeSingle();

    if (!appointment) return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });

    if (role === "DONO" && petShopId !== appointment.petShopId) {
      return NextResponse.json({ error: "Este agendamento pertence a outro pet shop" }, { status: 403 });
    }

    const body = await request.json();
    const parsedData = updateAppointmentSchema.parse(body);

    const updateFields: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if ("status" in parsedData) updateFields.status = parsedData.status;
    if ("date" in parsedData) updateFields.date = new Date(parsedData.date).toISOString();

    const { data: updatedAppointment, error } = await db
      .from("Appointment")
      .update(updateFields)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    // ── Quando concluído: envia WhatsApp para o cliente (fire & forget) ──
    if ("status" in parsedData && parsedData.status === "concluido") {
      try {
        const [{ data: pet }, { data: petShop }, { data: service }] = await Promise.all([
          db.from("Pet").select("name, species, client:Client!clientId(name, phone)").eq("id", appointment.petId).maybeSingle(),
          db.from("PetShop").select("name").eq("id", appointment.petShopId).maybeSingle(),
          db.from("Service").select("label").eq("id", appointment.serviceId).maybeSingle(),
        ]);

        const client = (pet as { client?: { name: string; phone: string } } | null)?.client;

        if (client?.phone && pet && petShop) {
          const msg = buildPostServiceMessage({
            clientName:   client.name,
            petName:      (pet as { name: string }).name,
            petSpecies:   (pet as { species: string }).species,
            petShopName:  petShop.name,
            serviceLabel: service?.label,
          });

          sendWhatsAppMessage(client.phone, msg).then((sent) => {
            if (!sent) return;
            db.from("MessageLog").insert({
              id:        crypto.randomUUID(),
              petShopId: appointment.petShopId,
              petId:     appointment.petId,
              clientId:  null,
              type:      "pos_atendimento",
              prompt:    `apt concluido ${params.id}`,
              response:  msg,
              status:    "sent",
            }).then(() => null, () => null);
          }).catch(() => null);
        }
      } catch {
        // notificação falhou — não afeta a resposta
      }
    }

    return NextResponse.json({ data: updatedAppointment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Erro de validação", details: error.issues }, { status: 400 });
    }
    console.error("Error updating appointment:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
