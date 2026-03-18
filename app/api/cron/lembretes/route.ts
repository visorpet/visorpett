import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildReminderMessage, sendWhatsAppMessage, buildWhatsAppLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

// Rodado diariamente às 18:00 — confirma agendamentos do dia seguinte
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createAdminClient();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayStart = new Date(tomorrow); dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd   = new Date(tomorrow); dayEnd.setUTCHours(23, 59, 59, 999);

    const { data: appointments } = await db
      .from("Appointment")
      .select("id, date, petShopId, petId, pet:Pet!petId(id,name,species,clientId,client:Client!clientId(id,name,phone)), petShop:PetShop!petShopId(name), service:Service!serviceId(label)")
      .in("status", ["agendado", "confirmado"])
      .gte("date", dayStart.toISOString())
      .lte("date", dayEnd.toISOString());

    let sentCount = 0;
    const logs: any[] = [];

    for (const apt of appointments ?? []) {
      const pet     = Array.isArray(apt.pet)     ? apt.pet[0]     : apt.pet;
      const shop    = Array.isArray(apt.petShop) ? apt.petShop[0] : apt.petShop;
      const service = Array.isArray(apt.service) ? apt.service[0] : apt.service;
      const client  = Array.isArray(pet?.client) ? pet?.client[0] : pet?.client;
      if (!client?.phone || !pet || !shop) continue;

      const hora    = new Date(apt.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const message = buildReminderMessage({ petName: pet.name, petSpecies: pet.species, clientName: client.name, petShopName: shop.name, serviceLabel: service?.label, date: hora });
      const autoSent = await sendWhatsAppMessage(client.phone, message);
      const waLink   = buildWhatsAppLink(client.phone, message);

      await db.from("MessageLog").insert({
        id:        crypto.randomUUID(),
        petShopId: apt.petShopId,
        petId:     pet.id,
        clientId:  client.id,
        type:      "lembrete_d1",
        prompt:    `lembrete D-1 apt ${apt.id}`,
        response:  message,
        status:    autoSent ? "sent" : "pending",
        waLink,
        createdAt: new Date().toISOString(),
      });
      logs.push({ pet: pet.name, hora, autoSent });
      sentCount++;
    }

    return NextResponse.json({ success: true, message: `${sentCount} lembretes D-1 enviados.`, logs });
  } catch (error) {
    console.error("Erro no CRON lembretes:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
