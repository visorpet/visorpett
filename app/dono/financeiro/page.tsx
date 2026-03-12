"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard, BarChart, MaterialIcon } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

const monthlyData = [
  { label: "Jun", value: 4500 },
  { label: "Jul", value: 5200 },
  { label: "Ago", value: 4800 },
  { label: "Set", value: 6100 },
  { label: "Out", value: 5800 },
  { label: "Nov", value: 6500 },
];

export default function DonoFinanceiroPage() {
  return (
    <div className="page-container">
      <PageHeader
        title="Financeiro"
        rightAction={{ icon: "download", label: "Relatório" }}
      />

      <section className="animate-slide-up mb-6">
        <div className="bg-gradient-primary rounded-2xl p-6 text-white text-center">
          <p className="text-white/80 text-sm font-medium mb-1">Faturamento Atual</p>
          <h2 className="text-4xl font-black">{formatCurrency(6500)}</h2>
          <div className="inline-flex items-center gap-1 mt-3 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
            <MaterialIcon icon="trending_up" size="xs" />
            <span>+12% vs mês passado</span>
          </div>
        </div>
      </section>

      <section className="animate-slide-up space-y-3 mb-6">
        <p className="section-label">Métricas Gerais</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon="payments"
            label="Recebimentos"
            value={formatCurrency(6800)}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
          />
          <StatCard
            icon="money_off"
            label="Despesas"
            value={formatCurrency(1200)}
            iconBg="bg-red-100"
            iconColor="text-red-500"
          />
        </div>
      </section>

      <section className="animate-slide-up">
        <div className="card">
          <p className="font-bold text-gray-900 text-sm mb-4">Evolução Mensal</p>
          <BarChart data={monthlyData} showLabels height="md" />
        </div>
      </section>
    </div>
  );
}
