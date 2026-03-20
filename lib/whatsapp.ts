/**
 * WhatsApp helpers — gera mensagens e links wa.me
 * Sem API externa: mensagens ficam no MessageLog para DONO disparar manualmente.
 * Quando EVOLUTION_API_URL + EVOLUTION_API_KEY estiverem configurados, auto-envio é ativado.
 */

const BOOKING_URL = "https://visorpett.vercel.app/cliente/agendamento";

export type MessageContext = {
  petName:         string;
  petSpecies:      string;
  clientName:      string;
  petShopName:     string;
  daysSinceVisit?: number;
  serviceLabel?:   string;
  date?:           string;   // data do agendamento (legível)
};

/* ─── Template messages (fallback quando Gemini não configurado) ─── */
export function buildReturnMessage(ctx: MessageContext): string {
  const days = ctx.daysSinceVisit ?? 28;
  const animal = ctx.petSpecies === "gato" ? "🐱" : "🐾";
  return (
    `Oi ${ctx.clientName}! ${animal} Aqui é do *${ctx.petShopName}*.\n\n` +
    `Já faz *${days} dias* desde que o(a) *${ctx.petName}* veio tomar um banho com a gente... ` +
    `aposto que ele(a) já quer ficar cheiroso(a) de novo! 😍\n\n` +
    `Que tal agendar essa semana? 👇\n${BOOKING_URL}`
  );
}

export function buildReminderMessage(ctx: MessageContext): string {
  const animal = ctx.petSpecies === "gato" ? "🐱" : "🐶";
  return (
    `Olá ${ctx.clientName}! ${animal} Uma lembrança do *${ctx.petShopName}*.\n\n` +
    `Amanhã você tem *${ctx.serviceLabel ?? "atendimento"}* marcado para o(a) *${ctx.petName}* ` +
    `${ctx.date ? `às *${ctx.date}*` : ""}.\n\n` +
    `Até logo! 🐾`
  );
}

export function buildPostServiceMessage(ctx: MessageContext): string {
  const animal = ctx.petSpecies === "gato" ? "🐱" : "🐶";
  return (
    `Oi ${ctx.clientName}! ${animal} Aqui é do *${ctx.petShopName}*.\n\n` +
    `Esperamos que o(a) *${ctx.petName}* tenha adorado o atendimento de hoje! ` +
    `Se quiser avaliar nosso serviço, ficamos muito felizes com seu feedback. 😊\n\n` +
    `Até a próxima! 🐾`
  );
}

/* ─── Notificação ao DONO quando novo agendamento público chega ─── */
export function buildOwnerNewBookingMessage(ctx: {
  clientName:   string;
  clientPhone:  string;
  petName:      string;
  petSpecies:   string;
  petBreed?:    string;
  serviceLabel: string;
  date:         string; // legível, ex: "Qui, 26 de Mar às 13:00"
  price:        number;
  notes?:       string;
}): string {
  const animal = ctx.petSpecies === "gato" ? "🐱" : ctx.petSpecies === "cachorro" ? "🐶" : "🐾";
  const breed = ctx.petBreed ? ` (${ctx.petBreed})` : "";
  const notesLine = ctx.notes ? `\n📝 Obs: ${ctx.notes}` : "";
  return (
    `🔔 *Novo agendamento recebido!*\n\n` +
    `${animal} *Pet:* ${ctx.petName}${breed}\n` +
    `✂️ *Serviço:* ${ctx.serviceLabel}\n` +
    `📅 *Data/Hora:* ${ctx.date}\n` +
    `💰 *Valor:* R$ ${ctx.price.toFixed(2).replace(".", ",")}\n\n` +
    `👤 *Cliente:* ${ctx.clientName}\n` +
    `📱 *Telefone:* ${ctx.clientPhone}${notesLine}\n\n` +
    `_Agendamento recebido via Visorpet_ 🐾`
  );
}

/* ─── WhatsApp link (fallback para auto-envio) ─── */
export function buildWhatsAppLink(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, "");
  const formatted = clean.startsWith("55") ? clean : `55${clean}`;
  return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
}

/* ─── Lê config da DB quando env vars não estiverem definidas ─── */
async function getEvolutionConfig() {
  const envUrl = process.env.EVOLUTION_API_URL;
  const envKey = process.env.EVOLUTION_API_KEY;
  const envInst = process.env.EVOLUTION_INSTANCE;

  if (envUrl && envKey) {
    return { apiUrl: envUrl, apiKey: envKey, instance: envInst ?? "visorpet" };
  }

  // Fallback: lê do banco (SystemConfig)
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const db = createAdminClient();
    const { data } = await db
      .from("SystemConfig")
      .select("key, value")
      .in("key", ["EVOLUTION_API_URL", "EVOLUTION_API_KEY", "EVOLUTION_INSTANCE"]);
    const map = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
    return {
      apiUrl:   map["EVOLUTION_API_URL"]  || "",
      apiKey:   map["EVOLUTION_API_KEY"]  || "",
      instance: map["EVOLUTION_INSTANCE"] || "visorpet",
    };
  } catch {
    return { apiUrl: "", apiKey: "", instance: "visorpet" };
  }
}

/* ─── Auto-envio via Evolution API (quando configurado) ─── */
export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  const { apiUrl, apiKey, instance } = await getEvolutionConfig();

  if (!apiUrl || !apiKey) return false; // fallback: envio manual

  try {
    const clean = phone.replace(/\D/g, "");
    const number = clean.startsWith("55") ? clean : `55${clean}`;

    const res = await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "apikey": apiKey },
      body:    JSON.stringify({ number, options: { delay: 1200 }, textMessage: { text: message } }),
    });

    return res.ok;
  } catch {
    return false;
  }
}
