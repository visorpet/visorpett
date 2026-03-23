/**
 * Webhook Asaas → atualiza status de assinaturas automaticamente
 *
 * Configurar no painel Asaas Sandbox:
 * URL: https://visorpett.vercel.app/api/webhooks/asaas
 * Eventos: PAYMENT_RECEIVED, PAYMENT_OVERDUE, PAYMENT_DELETED,
 *           SUBSCRIPTION_DELETED, PAYMENT_REFUNDED
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Mapa de evento Asaas → status interno
const EVENT_STATUS: Record<string, string | null> = {
  PAYMENT_RECEIVED:     "ACTIVE",
  PAYMENT_CONFIRMED:    "ACTIVE",
  PAYMENT_OVERDUE:      "PAST_DUE",
  PAYMENT_DELETED:      null,         // ignora
  PAYMENT_REFUNDED:     "PAST_DUE",
  SUBSCRIPTION_DELETED: "CANCELLED",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, payment, subscription } = body;

    const newStatus = EVENT_STATUS[event as string];
    if (newStatus === undefined) {
      // Evento desconhecido — responde 200 para Asaas não retentar
      return NextResponse.json({ ok: true, skipped: true });
    }
    if (newStatus === null) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const db = createAdminClient();

    // Identifica via externalReference (petShopId) ou asaasSubscriptionId
    const extRef =
      payment?.externalReference ??
      subscription?.externalReference ??
      null;

    const asaasSubId =
      payment?.subscription ??
      subscription?.id ??
      null;

    let query = db.from("Subscription").update({
      status:    newStatus,
      updatedAt: new Date().toISOString(),
      // Se pagamento recebido, atualiza período
      ...(newStatus === "ACTIVE" && payment?.dueDate
        ? {
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd:   getNextMonth(payment.dueDate),
          }
        : {}),
    });

    if (extRef) {
      await query.eq("petShopId", extRef);
    } else if (asaasSubId) {
      await query.eq("asaasSubscriptionId", asaasSubId);
    } else {
      console.warn("[ASAAS_WEBHOOK] Sem referência para identificar assinatura", body);
    }

    console.log(`[ASAAS_WEBHOOK] ${event} → ${newStatus} (ref: ${extRef ?? asaasSubId})`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[ASAAS_WEBHOOK_ERROR]", error);
    // Retorna 200 mesmo em erro para Asaas não retentar infinitamente
    return NextResponse.json({ ok: false, error: String(error) });
  }
}

function getNextMonth(dueDateStr: string): string {
  const d = new Date(dueDateStr);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}
