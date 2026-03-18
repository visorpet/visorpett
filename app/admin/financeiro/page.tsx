"use client";

import { useEffect, useState } from "react";
import { MaterialIcon, Badge, StatCard } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

type Metrics = {
  totalPetShops: number;
  activeSubscriptions: number;
  mrr: number;
  churnRate: number;
};

export default function SuperAdminFinanceiroPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((r) => r.json())
      .then((json) => setMetrics(json.data ?? null))
      .catch(() => setMetrics(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col gap-2 mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Financeiro da Plataforma</h2>
        <p className="text-gray-500 font-medium">Monitore o faturamento, MRR e retenção do seu SaaS.</p>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="query_stats"
          label="MRR (Receita Mensal)"
          value={loading ? "—" : formatCurrency(metrics?.mrr ?? 0)}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          icon="groups"
          label="Assinantes Ativos"
          value={loading ? "—" : metrics?.activeSubscriptions ?? 0}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatCard
          icon="store"
          label="Pet Shops Cadastrados"
          value={loading ? "—" : metrics?.totalPetShops ?? 0}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          icon="trending_down"
          label="Churn Rate"
          value={loading ? "—" : `${metrics?.churnRate ?? 0}%`}
          iconBg="bg-red-100"
          iconColor="text-red-500"
        />
      </div>

      {/* Resumo */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo da Plataforma</h3>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-sm font-semibold text-gray-600">Pet Shops Ativos</span>
              <span className="font-black text-gray-900">{metrics?.activeSubscriptions ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-sm font-semibold text-gray-600">Total Cadastrados</span>
              <span className="font-black text-gray-900">{metrics?.totalPetShops ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-sm font-semibold text-gray-600">MRR Estimado</span>
              <span className="font-black text-emerald-600">{formatCurrency(metrics?.mrr ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-semibold text-gray-600">Taxa de Churn</span>
              <Badge variant={((metrics?.churnRate ?? 0) > 3) ? "danger" : "success"} className="text-[11px]">
                {metrics?.churnRate ?? 0}%
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Nota sobre integração */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
        <MaterialIcon icon="info" className="text-amber-500 mt-0.5" />
        <div>
          <p className="font-bold text-amber-800 text-sm">Integração com Stripe pendente</p>
          <p className="text-amber-600 text-xs mt-1">
            O MRR e transações reais serão exibidos após configurar o Stripe nos campos acima.
            Atualmente o MRR é calculado como: assinantes × R$99.
          </p>
        </div>
      </div>
    </div>
  );
}
