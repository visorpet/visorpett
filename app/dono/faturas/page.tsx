"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Badge } from "@/components/ui";

const PLAN_LABELS: Record<string, string> = {
  FREE: "Free",
  PRO: "Pro",
  PREMIUM: "Premium",
  ENTERPRISE: "Enterprise",
};

const STATUS_MAP: Record<string, { label: string; variant: "success" | "warning" | "danger" | "neutral" }> = {
  ACTIVE:   { label: "Ativa",    variant: "success" },
  TRIALING: { label: "Trial",    variant: "warning" },
  PAST_DUE: { label: "Vencida",  variant: "danger" },
  CANCELED: { label: "Cancelada",variant: "neutral" },
  INACTIVE: { label: "Inativa",  variant: "neutral" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function FaturasPage() {
  const router = useRouter();
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/petshops/me")
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.subscription) setSub(json.data.subscription);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const planLabel = sub ? (PLAN_LABELS[sub.plan] ?? sub.plan) : "Free";
  const statusInfo = sub ? (STATUS_MAP[sub.status] ?? STATUS_MAP["INACTIVE"]) : STATUS_MAP["INACTIVE"];

  return (
    <div className="page-container pb-24 font-sans">
      <PageHeader title="Minha Assinatura" showBack backHref="/dono/perfil" />

      {/* ── Status da assinatura ── */}
      <section className="mt-4 animate-slide-up">
        <div className="bg-gradient-primary rounded-2xl p-5 text-white">
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">Plano atual</p>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">Plano {planLabel}</h2>
              {sub?.currentPeriodEnd && (
                <p className="text-white/70 text-xs mt-1">
                  Válido até {formatDate(sub.currentPeriodEnd)}
                </p>
              )}
            </div>
            <Badge variant={statusInfo.variant} className="text-xs font-black px-3 py-1">
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </section>

      {/* ── Detalhes ── */}
      <section className="mt-5 animate-slide-up">
        <p className="section-label mb-3">Detalhes</p>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          <InfoRow icon="workspace_premium" label="Plano" value={`Plano ${planLabel}`} />
          <InfoRow
            icon="circle"
            label="Status"
            value={statusInfo.label}
            valueClassName={`font-bold ${
              statusInfo.variant === "success" ? "text-emerald-600" :
              statusInfo.variant === "warning" ? "text-amber-600" :
              statusInfo.variant === "danger"  ? "text-red-600" : "text-gray-400"
            }`}
          />
          {sub?.currentPeriodStart && (
            <InfoRow icon="calendar_today" label="Início do período" value={formatDate(sub.currentPeriodStart)} />
          )}
          {sub?.currentPeriodEnd && (
            <InfoRow icon="event" label="Próxima renovação" value={formatDate(sub.currentPeriodEnd)} />
          )}
          {sub?.cancelAtPeriodEnd && (
            <InfoRow
              icon="cancel"
              label="Cancelamento"
              value="Ao fim do período"
              valueClassName="text-red-500 font-bold"
            />
          )}
        </div>
      </section>

      {/* ── Plano free ── */}
      {(!sub || sub.plan === "FREE") && (
        <section className="mt-5 animate-slide-up">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex gap-4 items-start">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <MaterialIcon icon="star" className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Faça upgrade para o Plano Pro</p>
              <p className="text-xs text-gray-500 mt-1">
                Desbloqueie WhatsApp automático, relatórios e muito mais por R$&nbsp;97/mês.
              </p>
              <button
                onClick={() => router.push("/dono/planos")}
                className="mt-3 btn-primary text-xs py-2 px-4"
              >
                Ver planos
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Histórico de faturas placeholder ── */}
      <section className="mt-5 animate-slide-up">
        <p className="section-label mb-3">Histórico de Faturas</p>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center text-center">
          <MaterialIcon icon="receipt_long" size="xl" className="text-gray-200 mb-3" />
          <p className="text-sm font-semibold text-gray-400">
            {sub?.plan === "FREE" || !sub
              ? "Sem faturas — você está no plano gratuito"
              : "Histórico disponível em breve"}
          </p>
        </div>
      </section>

      {/* ── Suporte ── */}
      <section className="mt-5 animate-slide-up">
        <p className="section-label mb-3">Precisa de ajuda?</p>
        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-card-hover transition-all duration-200"
        >
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <MaterialIcon icon="chat" className="text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-sm">Suporte via WhatsApp</p>
            <p className="text-xs text-gray-500">Fale com nossa equipe</p>
          </div>
          <MaterialIcon icon="chevron_right" size="sm" className="text-gray-300" />
        </a>
      </section>
    </div>
  );
}

function InfoRow({ icon, label, value, valueClassName = "" }: {
  icon: string; label: string; value: string; valueClassName?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <MaterialIcon icon={icon} size="sm" className="text-gray-400" />
      <span className="flex-1 text-sm text-gray-600 font-medium">{label}</span>
      <span className={`text-sm font-semibold text-gray-900 ${valueClassName}`}>{value}</span>
    </div>
  );
}
