"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard, BarChart, MaterialIcon } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

type FinanceiroData = {
  monthly: { label: string; value: number }[];
  currentRevenue: number;
  prevRevenue: number;
  percentChange: number;
  totalReceived: number;
};

export default function DonoFinanceiroPage() {
  const [data, setData] = useState<FinanceiroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dono/financeiro")
      .then((r) => r.json())
      .then((json) => setData(json.data ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const percentChange = data?.percentChange ?? 0;
  const isPositive = percentChange >= 0;

  return (
    <div className="page-container">
      <PageHeader
        title="Financeiro"
        rightAction={{ icon: "download", label: "Relatório", onClick: () => alert("Relatório em breve!") }}
      />

      <section className="animate-slide-up mb-6">
        <div className="bg-gradient-primary rounded-2xl p-6 text-white text-center">
          <p className="text-white/80 text-sm font-medium mb-1">Faturamento do Mês</p>
          {loading ? (
            <div className="h-10 w-40 bg-white/20 rounded-lg animate-pulse mx-auto" />
          ) : (
            <h2 className="text-4xl font-black">{formatCurrency(data?.currentRevenue ?? 0)}</h2>
          )}
          {!loading && (
            <div className="inline-flex items-center gap-1 mt-3 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
              <MaterialIcon icon={isPositive ? "trending_up" : "trending_down"} size="xs" />
              <span>
                {isPositive ? "+" : ""}
                {percentChange.toFixed(1)}% vs mês passado
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="animate-slide-up space-y-3 mb-6">
        <p className="section-label">Métricas Gerais</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon="payments"
            label="Total Recebido"
            value={loading ? "—" : formatCurrency(data?.totalReceived ?? 0)}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
          />
          <StatCard
            icon="calendar_month"
            label="Mês Anterior"
            value={loading ? "—" : formatCurrency(data?.prevRevenue ?? 0)}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
        </div>
      </section>

      <section className="animate-slide-up">
        <div className="card">
          <p className="font-bold text-gray-900 text-sm mb-4">Evolução Mensal</p>
          {loading ? (
            <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <BarChart data={data?.monthly ?? []} showLabels height="md" />
          )}
        </div>
      </section>
    </div>
  );
}
