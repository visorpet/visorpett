import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildPostServiceMessage, sendWhatsAppMessage, buildWhatsAppLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

// Rodado a cada hora — envia agradecimento 2h após conclusão do atendimento
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db  = createAdminClient();
    const now = new Date();

    // Janela: concluídos entre 2h e 3h atrás
    const windowEnd   = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const windowStart = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    const { data: appointments } = await db
      .from("Appointment")
      .select("id, date, petShopId, petId, pet:Pet!petId(id,name,species,clientId,client:Client!clientId(id,name,phone)), petShop:PetShop!petShopId(name), service:Service!serviceId(label)")
      .eq("status", "concluido")
      .gte("date", windowStart.toISOString())
      .lte("date", windowEnd.toISOString());

    let sentCount = 0;
    const logs: any[] = [];

    for (const apt of appointments ?? []) {
      const pet    = Array.isArray(apt.pet)     ? apt.pet[0]     : apt.pet;
      const shop   = Array.isArray(apt.petShop) ? apt.petShop[0] : apt.petShop;
      const client = Array.isArray(pet?.client) ? pet?.client[0] : pet?.client;
      if (!client?.phone || !pet || !shop) continue;

      // Não duplicar: já enviou agradecimento para este agendamento?
      const { data: existing } = await db
        .from("MessageLog")
        .select("id")
        .eq("petId", pet.id)
        .eq("type", "pos_atendimento")
        .eq("prompt", `pos apt ${apt.id}`)
        .maybeSingle();
      if (existing) continue;

      const message  = buildPostServiceMessage({ petName: pet.name, petSpecies: pet.species, clientName: client.name, petShopName: shop.name });
      const autoSent = await sendWhatsAppMessage(client.phone, message);
      const waLink   = buildWhatsAppLink(client.phone, message);

      await db.from("MessageLog").insert({
        id:        crypto.randomUUID(),
        petShopId: apt.petShopId,
        petId:     pet.id,
        clientId:  client.id,
        type:      "pos_atendimento",
        prompt:    `pos apt ${apt.id}`,
        response:  message,
        status:    autoSent ? "sent" : "pending",
        waLink,
        createdAt: new Date().toISOString(),
      });
      logs.push({ pet: pet.name, autoSent });
      sentCount++;
    }

    return NextResponse.json({ success: true, message: `${sentCount} agradecimentos enviados.`, logs });
  } catch (error) {
    console.error("Erro no CRON pós-atendimento:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
