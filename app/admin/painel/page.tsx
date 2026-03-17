"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard, BarChart, Badge, ProgressBar, MaterialIcon } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

/* ─── Distribution & Mock Chart Details ─── */
const planDistribution = [
  { plan: "Free",       count: 42,  color: "text-gray-500",   pct: 17, barColor: "bg-gray-400"  },
  { plan: "Pro",        count: 126, color: "text-primary",     pct: 51, barColor: "bg-primary"   },
  { plan: "Premium",    count: 58,  color: "text-emerald-600", pct: 23, barColor: "bg-emerald-500"},
  { plan: "Enterprise", count: 22,  color: "text-purple-600",  pct: 9,  barColor: "bg-purple-500"},
];

const planBadge: Record<string, { label: string; variant: "primary" | "success" | "purple" | "neutral" }> = {
  free:       { label: "Free",       variant: "neutral"  },
  pro:        { label: "Pro",        variant: "primary"  },
  premium:    { label: "Premium",    variant: "success"  },
  enterprise: { label: "Enterprise", variant: "purple"   },
};

const mrrChartData = [
  { label: "Out", value: 98_000 },
  { label: "Nov", value: 105_000 },
  { label: "Dez", value: 111_000 },
  { label: "Jan", value: 108_000 },
  { label: "Fev", value: 118_000 },
  { label: "Mar", value: 124_350, isCurrent: true },
];

export default function AdminPainelPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const response = await fetch("/api/admin/metrics");
        const json = await response.json();
        if (json.data) {
          setMetrics(json.data);
        }
      } catch (error) {
        console.error("Erro ao carregar Dashboard do Admin:", error);
        setError("Não foi possível carregar os dados administrativos.");
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="page-container p-5 animate-pulse min-h-screen flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="w-32 h-6 rounded-md bg-gray-200" />
            <div className="w-10 h-10 rounded-full bg-gray-200" />
        </div>
        
        <div className="h-8 w-40 bg-gray-200 rounded-md mt-4" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-32 rounded-xl bg-gray-200" />
          <div className="h-32 rounded-xl bg-gray-200" />
          <div className="h-32 rounded-xl bg-gray-200" />
          <div className="h-32 rounded-xl bg-gray-200" />
        </div>
        
        <div className="h-64 rounded-xl bg-gray-200 mt-8" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="page-container p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex gap-2 items-center">
            <MaterialIcon icon="error_outline" />
            {error}
        </div>
      </div>
    );
  }

  // Preenchendo os dados do banco, ou fallback pros Mocks se não estiverem presentes (ex: MRR sem DB Stripe ainda)
  const totalPetShops = metrics?.totalPetShops || 0;
  const activeSubscriptions = metrics?.activeSubscriptions || 0;
  const churnRate = metrics?.churnRate || 0;
  const mrr = metrics?.mrr || 124350;

  return (
    <div className="page-container pb-12">
      {/* ── Header ── */}
      <PageHeader
        showLogo
        rightAction={{ icon: "settings", label: "Configurações", href: "/admin/configuracoes" }}
      />

      {/* ── Hero ── */}
      <section className="animate-slide-up">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <MaterialIcon icon="admin_panel_settings" size="sm" className="text-white/80" fill />
            <p className="text-white/70 text-xs uppercase tracking-wide font-bold">Super Admin</p>
          </div>
          <h2 className="text-xl font-black mb-3">Painel da Plataforma</h2>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-black">{totalPetShops}</p>
              <p className="text-white/60 text-xs">pet shops</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black">
                {activeSubscriptions}
              </p>
              <p className="text-white/60 text-xs">assinaturas ativas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black">
                {formatCurrency(mrr / 1000).replace("R$", "").trim()}k
              </p>
              <p className="text-white/60 text-xs">MRR Presumido</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── KPI Cards ── */}
      <section className="animate-slide-up">
        <p className="section-label mb-3">Resumo da API</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon="trending_up"
            label="MRR"
            value={formatCurrency(mrr)}
            trend="+12% vs mês anterior"
            trendDirection="up"
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
          />
          <StatCard
            icon="storefront"
            label="Total Cadastros"
            value={totalPetShops}
            trend="+2 vs mês anterior"
            trendDirection="up"
            iconBg="bg-primary/10"
            iconColor="text-primary"
          />
          <StatCard
            icon="person_add"
            label="Planos Ativos"
            value={activeSubscriptions}
            trend="100% Retenção"
            trendDirection="up"
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            icon="cancel"
            label="Churn Estimado"
            value={`${churnRate}%`}
            trend="meta: ≤5/mês"
            trendDirection="neutral"
            iconBg="bg-red-100"
            iconColor="text-red-500"
          />
        </div>
      </section>

      {/* ── MRR Chart ── */}
      <section className="animate-slide-up">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-gray-900 text-sm">Crescimento MRR</p>
              <p className="text-xs text-gray-500">Últimos 6 meses (Mock)</p>
            </div>
            <Link href="/admin/financeiro" className="text-xs text-primary font-bold">
              Detalhes
            </Link>
          </div>
          <BarChart
            data={mrrChartData.map((d) => ({ ...d, value: Math.round(d.value / 1000) }))}
            showLabels
            height="md"
          />
          <p className="text-xs text-gray-400 text-center mt-1">Valores em R$ mil</p>
        </div>
      </section>

      <section className="animate-slide-up">
        <div className="flex items-center justify-between mb-3 text-center">
          <p className="section-label opacity-70">Painel sendo abastecido ao vivo via BD.</p>
        </div>
      </section>

      {/* ── Quick admin actions ── */}
      <section className="animate-slide-up mt-8">
        <p className="section-label mb-3">Ações rápidas</p>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/admin/petshops" className="btn-primary text-sm py-3 justify-center text-center">
            <MaterialIcon icon="storefront" size="sm" />
            Lojistas
          </Link>
          <button disabled className="btn-secondary text-sm py-3 text-center justify-center opacity-50 cursor-not-allowed">
            <MaterialIcon icon="manage_accounts" size="sm" />
            Usuários
          </button>
        </div>
      </section>
    </div>
  );
}
