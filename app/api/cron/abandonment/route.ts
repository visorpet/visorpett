import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildWhatsAppLink, sendWhatsAppMessage } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

// GET /api/cron/abandonment — envia WhatsApp para leads abandonados (> 2h, não notificados, não convertidos)
export async function GET(request: Request) {
  const secret = request.headers.get("x-cron-secret") ?? new URL(request.url).searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const db = createAdminClient();
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    // Busca leads abandonados: criados há mais de 2h, não convertidos, não notificados
    const { data: leads } = await db
      .from("BookingLead")
      .select("id, clientName, clientPhone, petName, petShopId")
      .is("convertedAt", null)
      .is("notifiedAt", null)
      .lte("createdAt", twoHoursAgo)
      .limit(50);

    if (!leads?.length) {
      return NextResponse.json({ data: { processed: 0 } });
    }

    // Busca dados dos pet shops em batch
    const petShopIds = Array.from(new Set(leads.map((l: { petShopId: string }) => l.petShopId)));
    const { data: shops } = await db
      .from("PetShop")
      .select("id, name, slug, phone")
      .in("id", petShopIds);

    const shopMap = Object.fromEntries((shops ?? []).map((s: { id: string; name: string; slug: string; phone: string }) => [s.id, s]));

    let notified = 0;
    const notifiedIds: string[] = [];

    for (const lead of leads) {
      const shop = shopMap[lead.petShopId];
      if (!shop) continue;

      const petLabel = lead.petName ? ` para o(a) *${lead.petName}*` : "";
      const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://visorpett.vercel.app"}/booking/${shop.slug}`;

      const msg =
        `Oi ${lead.clientName ?? ""}! 🐾 Você começou a agendar${petLabel} no *${shop.name}* mas não finalizou.\n\n` +
        `Ainda tem horários disponíveis! Finalize seu agendamento agora:\n${bookingUrl}`;

      const sent = await sendWhatsAppMessage(lead.clientPhone, msg);
      if (!sent) {
        // Se não conseguiu enviar via API, gera link wa.me e loga
        const waLink = buildWhatsAppLink(lead.clientPhone, msg);
        await db.from("MessageLog").insert({
          id:        crypto.randomUUID(),
          petShopId: lead.petShopId,
          type:      "abandono_booking",
          prompt:    `lead ${lead.id}`,
          response:  msg,
          status:    "pending",
        }).then(() => null, () => null);
        void waLink; // disponível para futura feature
      }

      notifiedIds.push(lead.id);
      notified++;
    }

    // Marca todos como notificados em batch
    if (notifiedIds.length > 0) {
      await db.from("BookingLead")
        .update({ notifiedAt: new Date().toISOString() })
        .in("id", notifiedIds);
    }

    return NextResponse.json({ data: { processed: notified } });
  } catch (error) {
    console.error("Cron abandonment error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
