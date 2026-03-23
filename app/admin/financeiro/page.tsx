"use client";

import { useEffect, useState } from "react";
import { MaterialIcon, Badge, StatCard } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

type Metrics = {
  totalPetShops: number;
  activeSubscriptions: number;
  mrr: number;
  churnRate: number;
  mrrSource?: "asaas" | "estimate";
};

type Payment = {
  id: string;
  petShopName: string;
  plan: string;
  value: number;
  status: string;
  dueDate: string;
  paymentDate: string | null;
  billingType: string;
  invoiceUrl: string | null;
};

const PAYMENT_STATUS: Record<string, { label: string; variant: "success" | "danger" | "warning" | "neutral" }> = {
  RECEIVED:        { label: "Recebido",  variant: "success" },
  CONFIRMED:       { label: "Confirmado",variant: "success" },
  PENDING:         { label: "Pendente",  variant: "warning" },
  OVERDUE:         { label: "Atrasado",  variant: "danger"  },
  REFUNDED:        { label: "Devolvido", variant: "neutral" },
  CANCELLED:       { label: "Cancelado", variant: "neutral" },
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default function SuperAdminFinanceiroPage() {
  const [metrics, setMetrics]   = useState<Metrics | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingM, setLoadingM] = useState(true);
  const [loadingP, setLoadingP] = useState(true);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((r) => r.json())
      .then((json) => setMetrics(json.data ?? null))
      .finally(() => setLoadingM(false));

    fetch("/api/admin/asaas/payments")
      .then((r) => r.json())
      .then((json) => setPayments(json.data ?? []))
      .finally(() => setLoadingP(false));
  }, []);

  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Financeiro da Plataforma</h2>
        <p className="text-gray-500 font-medium">Faturamento e pagamentos via Asaas.</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="query_stats"
          label={`MRR ${metrics?.mrrSource === "asaas" ? "(Asaas)" : "(Estimado)"}`}
          value={loadingM ? "—" : formatCurrency(metrics?.mrr ?? 0)}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          icon="groups"
          label="Assinantes Ativos"
          value={loadingM ? "—" : metrics?.activeSubscriptions ?? 0}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatCard
          icon="store"
          label="Pet Shops"
          value={loadingM ? "—" : metrics?.totalPetShops ?? 0}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          icon="trending_down"
          label="Churn Rate (30d)"
          value={loadingM ? "—" : `${metrics?.churnRate ?? 0}%`}
          iconBg="bg-red-100"
          iconColor="text-red-500"
        />
      </div>

      {/* Histórico de pagamentos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Histórico de Pagamentos</h3>
            <p className="text-xs text-gray-400 mt-0.5">Dados em tempo real do Asaas</p>
          </div>
          <Badge variant={metrics?.mrrSource === "asaas" ? "success" : "warning"} className="text-[10px]">
            {metrics?.mrrSource === "asaas" ? "Asaas conectado" : "MRR estimado"}
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Pet Shop</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Pagamento</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingP ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-6 py-4"><div className="h-5 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <MaterialIcon icon="receipt_long" size="xl" />
                      <p className="font-semibold text-sm">Nenhum pagamento encontrado</p>
                      <p className="text-xs">Crie assinaturas na aba Pet Shops para começar.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const st = PAYMENT_STATUS[p.status] ?? { label: p.status, variant: "neutral" as const };
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{p.petShopName}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 rounded uppercase">{p.plan}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatCurrency(p.value)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(p.paymentDate)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(p.dueDate)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400 font-medium">{p.billingType}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
