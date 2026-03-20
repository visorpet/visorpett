import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildWhatsAppLink, sendWhatsAppMessage } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

// GET /api/cron/waitlist — notifica lista de espera quando há vagas abertas
export async function GET(request: Request) {
  const secret = request.headers.get("x-cron-secret") ?? new URL(request.url).searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const db = createAdminClient();
    const today = new Date().toISOString().split("T")[0];

    // Busca entradas na waitlist para hoje ou datas futuras, não notificadas ainda
    const { data: waitlist } = await db
      .from("Waitlist")
      .select("id, clientName, clientPhone, petName, petShopId, preferredDate, serviceId")
      .is("notifiedAt", null)
      .gte("preferredDate", today)
      .limit(100);

    if (!waitlist?.length) {
      return NextResponse.json({ data: { processed: 0 } });
    }

    // Para cada entrada, verifica se há slots disponíveis no dia preferido
    const petShopIds = [...new Set(waitlist.map((w: { petShopId: string }) => w.petShopId))];
    const { data: shops } = await db
      .from("PetShop")
      .select("id, name, slug")
      .in("id", petShopIds);

    const shopMap = Object.fromEntries((shops ?? []).map((s: { id: string; name: string; slug: string }) => [s.id, s]));

    // Busca agendamentos para verificar slots ocupados por data
    const dates = [...new Set(waitlist.map((w: { preferredDate: string }) => w.preferredDate))];
    const occupiedByDateAndShop: Record<string, number> = {};

    for (const date of dates) {
      const { data: apts } = await db
        .from("Appointment")
        .select("petShopId, date")
        .gte("date", `${date}T00:00:00Z`)
        .lte("date", `${date}T23:59:59Z`)
        .not("status", "eq", "cancelado");

      for (const apt of (apts ?? [])) {
        const key = `${apt.petShopId}:${date}`;
        occupiedByDateAndShop[key] = (occupiedByDateAndShop[key] ?? 0) + 1;
      }
    }

    const MAX_SLOTS = 10; // slots por dia por pet shop
    let notified = 0;
    const notifiedIds: string[] = [];

    for (const entry of waitlist) {
      const key = `${entry.petShopId}:${entry.preferredDate}`;
      const occupied = occupiedByDateAndShop[key] ?? 0;

      if (occupied >= MAX_SLOTS) continue; // ainda sem vaga

      const shop = shopMap[entry.petShopId];
      if (!shop) continue;

      const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://visorpett.vercel.app"}/booking/${shop.slug}`;
      const dateLabel = new Date(entry.preferredDate + "T12:00:00Z").toLocaleDateString("pt-BR", {
        weekday: "short", day: "numeric", month: "short",
      });
      const petLabel = entry.petName ? ` para o(a) *${entry.petName}*` : "";

      const msg =
        `Oi ${entry.clientName}! 🐾 Boas notícias!\n\n` +
        `Abriu uma vaga${petLabel} no *${shop.name}* para *${dateLabel}*! 🎉\n\n` +
        `Corre agendar antes que acabe:\n${bookingUrl}`;

      const sent = await sendWhatsAppMessage(entry.clientPhone, msg);
      if (!sent) {
        const waLink = buildWhatsAppLink(entry.clientPhone, msg);
        await db.from("MessageLog").insert({
          id:        crypto.randomUUID(),
          petShopId: entry.petShopId,
          type:      "waitlist_vaga",
          prompt:    `waitlist ${entry.id}`,
          response:  msg,
          status:    "pending",
        }).then(() => null, () => null);
        void waLink;
      }

      notifiedIds.push(entry.id);
      notified++;
    }

    if (notifiedIds.length > 0) {
      await db.from("Waitlist")
        .update({ notifiedAt: new Date().toISOString() })
        .in("id", notifiedIds);
    }

    return NextResponse.json({ data: { processed: notified } });
  } catch (error) {
    console.error("Cron waitlist error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
