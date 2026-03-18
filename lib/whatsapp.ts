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

/* ─── WhatsApp link (fallback para auto-envio) ─── */
export function buildWhatsAppLink(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, "");
  const formatted = clean.startsWith("55") ? clean : `55${clean}`;
  return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
}

/* ─── Auto-envio via Evolution API (quando configurado) ─── */
export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  const apiUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE ?? "visorpet";

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
