"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Badge } from "@/components/ui";

type Plan = {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  highlight?: boolean;
  features: string[];
  notIncluded?: string[];
};

const PLANS: Plan[] = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    period: "grátis",
    description: "Para começar a testar",
    features: [
      "1 tosador",
      "Até 30 agendamentos/mês",
      "Página de agendamento público",
      "Gestão de clientes e pets",
    ],
    notIncluded: [
      "Notificações WhatsApp",
      "Relatórios financeiros",
      "Suporte prioritário",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 97,
    period: "mês",
    description: "Para pet shops em crescimento",
    highlight: true,
    features: [
      "Até 5 tosadores",
      "Agendamentos ilimitados",
      "Página de agendamento público",
      "Gestão de clientes e pets",
      "Notificações WhatsApp automáticas",
      "Relatórios financeiros",
      "Suporte por e-mail",
    ],
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: 197,
    period: "mês",
    description: "Para pet shops consolidados",
    features: [
      "Tosadores ilimitados",
      "Agendamentos ilimitados",
      "Página de agendamento público",
      "Gestão de clientes e pets",
      "Notificações WhatsApp automáticas",
      "Relatórios financeiros avançados",
      "Multi-unidades",
      "Suporte prioritário (WhatsApp)",
      "Onboarding personalizado",
    ],
  },
];

export default function PlanosPage() {
  const [currentPlan, setCurrentPlan] = useState<string>("FREE");
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/petshops/me")
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.subscription?.plan) {
          setCurrentPlan(json.data.subscription.plan);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade(planId: string) {
    if (planId === currentPlan || checkingOut) return;
    setCheckingOut(planId);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/petshops/me/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, billingType: "PIX" }),
      });
      const json = await res.json();
      if (!res.ok) {
        setCheckoutError(json.error || "Erro ao gerar cobrança.");
        return;
      }
      if (json.paymentLink) {
        window.location.href = json.paymentLink;
      } else {
        // Sandbox sem link — atualiza plano e mostra confirmação
        setCurrentPlan(planId);
      }
    } catch {
      setCheckoutError("Erro de conexão. Tente novamente.");
    } finally {
      setCheckingOut(null);
    }
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container pb-24 font-sans">
      <PageHeader title="Planos" showBack backHref="/dono/perfil" />

      <p className="text-sm text-gray-500 mt-1 mb-6">
        Escolha o plano ideal para o seu pet shop.
      </p>

      <div className="flex flex-col gap-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isHighlight = plan.highlight;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
                isHighlight
                  ? "border-primary shadow-lg shadow-primary/10"
                  : "border-gray-100 shadow-sm"
              }`}
            >
              {/* Badge topo */}
              {isHighlight && (
                <div className="bg-primary text-white text-center text-xs font-black py-1.5 uppercase tracking-widest">
                  Mais popular
                </div>
              )}

              <div className="bg-white p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-lg font-black text-gray-900">Plano {plan.name}</h3>
                      {isCurrent && (
                        <Badge variant="success" className="text-[10px] uppercase font-black px-2">
                          Atual
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    {plan.price === 0 ? (
                      <p className="text-2xl font-black text-gray-900">Grátis</p>
                    ) : (
                      <>
                        <p className="text-2xl font-black text-gray-900">
                          R$ {plan.price}
                        </p>
                        <p className="text-xs text-gray-400">/{plan.period}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <MaterialIcon icon="check_circle" size="xs" className="text-emerald-500 flex-shrink-0" fill />
                      {f}
                    </li>
                  ))}
                  {plan.notIncluded?.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                      <MaterialIcon icon="cancel" size="xs" className="text-gray-300 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent || checkingOut === plan.id}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                    isCurrent
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : isHighlight
                      ? "btn-primary disabled:opacity-70"
                      : "bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-70"
                  }`}
                >
                  {checkingOut === plan.id ? (
                    <>
                      <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      Aguarde...
                    </>
                  ) : isCurrent ? (
                    "Plano atual"
                  ) : (
                    `Assinar ${plan.name}`
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {checkoutError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium text-center">
          {checkoutError}
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-6">
        Dúvidas? Fale conosco pelo WhatsApp.
      </p>
    </div>
  );
}
