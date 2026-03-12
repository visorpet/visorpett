"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard, BarChart, Badge, ProgressBar, MaterialIcon } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

/* ─── Mock platform data ─── */
const platformMetrics = {
  totalPetShops: 248,
  activePetShops: 231,
  totalClients: 18_740,
  mrr: 124_350,
  mrrGrowth: "+12%",
  newPetShopsThisMonth: 18,
  churnedThisMonth: 3,
  avgRevenuePerShop: 500,
};

const planDistribution = [
  { plan: "Free",       count: 42,  color: "text-gray-500",   pct: 17, barColor: "bg-gray-400"  },
  { plan: "Pro",        count: 126, color: "text-primary",     pct: 51, barColor: "bg-primary"   },
  { plan: "Premium",    count: 58,  color: "text-emerald-600", pct: 23, barColor: "bg-emerald-500"},
  { plan: "Enterprise", count: 22,  color: "text-purple-600",  pct: 9,  barColor: "bg-purple-500"},
];

const recentPetShops = [
  { id: "s1", name: "PetLove Moema",    plan: "pro",     clients: 142, mrr: 500,  status: "ativo"    },
  { id: "s2", name: "BigDog Pinheiros", plan: "premium", clients: 389, mrr: 900,  status: "ativo"    },
  { id: "s3", name: "MiauShop Librdds", plan: "free",    clients: 28,  mrr: 0,    status: "trial"    },
  { id: "s4", name: "Petmania Santos",  plan: "pro",     clients: 201, mrr: 500,  status: "inadimpl" },
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
  return (
    <div className="page-container">
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
              <p className="text-2xl font-black">{platformMetrics.totalPetShops}</p>
              <p className="text-white/60 text-xs">pet shops</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black">
                {(platformMetrics.totalClients / 1000).toFixed(1)}k
              </p>
              <p className="text-white/60 text-xs">clientes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black">
                {formatCurrency(platformMetrics.mrr / 1000).replace("R$", "").trim()}k
              </p>
              <p className="text-white/60 text-xs">MRR</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── KPI Cards ── */}
      <section className="animate-slide-up">
        <p className="section-label mb-3">KPIs do mês</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon="trending_up"
            label="MRR"
            value={formatCurrency(platformMetrics.mrr)}
            trend={platformMetrics.mrrGrowth + " vs mês anterior"}
            trendDirection="up"
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
          />
          <StatCard
            icon="storefront"
            label="Novos pet shops"
            value={platformMetrics.newPetShopsThisMonth}
            trend="-2 vs mês anterior"
            trendDirection="down"
            iconBg="bg-primary/10"
            iconColor="text-primary"
          />
          <StatCard
            icon="person_add"
            label="Clientes ativos"
            value={`${(platformMetrics.totalClients / 1000).toFixed(1)}k`}
            trend="+320 este mês"
            trendDirection="up"
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            icon="cancel"
            label="Churned"
            value={platformMetrics.churnedThisMonth}
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
              <p className="text-xs text-gray-500">Últimos 6 meses</p>
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

      {/* ── Plan distribution ── */}
      <section className="animate-slide-up">
        <div className="card">
          <p className="font-bold text-gray-900 text-sm mb-4">Distribuição por plano</p>
          <div className="space-y-3">
            {planDistribution.map((p) => (
              <div key={p.plan}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${p.color}`}>{p.plan}</span>
                  <span className="text-xs text-gray-500 font-medium">{p.count} pet shops</span>
                </div>
                <ProgressBar value={p.pct} showPercent color={
                  p.plan === "Pro" ? "primary" :
                  p.plan === "Premium" ? "success" :
                  p.plan === "Enterprise" ? "primary" : "neutral"
                } size="sm" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent pet shops ── */}
      <section className="animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <p className="section-label">Pet shops recentes</p>
          <Link href="/admin/petshops" className="text-xs text-primary font-bold">Ver todos</Link>
        </div>
        <div className="card space-y-2">
          {recentPetShops.map((shop) => (
            <Link
              key={shop.id}
              href={`/admin/petshops/${shop.id}`}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <MaterialIcon icon="storefront" size="sm" className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{shop.name}</p>
                <p className="text-xs text-gray-500">
                  {shop.clients} clientes · {shop.mrr > 0 ? formatCurrency(shop.mrr) + "/mês" : "Free"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={(planBadge[shop.plan]?.variant as "primary" | "success" | "neutral") ?? "neutral"}>
                  {planBadge[shop.plan]?.label ?? shop.plan}
                </Badge>
                {shop.status === "inadimpl" && (
                  <Badge variant="danger" dot>Inadimpl.</Badge>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Quick admin actions ── */}
      <section className="animate-slide-up">
        <p className="section-label mb-3">Ações rápidas</p>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/admin/petshops/novo" className="btn-primary text-sm py-3">
            <MaterialIcon icon="add_business" size="sm" />
            Novo pet shop
          </Link>
          <Link href="/admin/usuarios" className="btn-secondary text-sm py-3 text-center">
            <MaterialIcon icon="manage_accounts" size="sm" />
            Usuários
          </Link>
        </div>
      </section>
    </div>
  );
}
