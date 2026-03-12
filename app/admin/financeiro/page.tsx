import { MaterialIcon, Badge, StatCard } from "@/components/ui";

const transactions = [
  { id: "PF-8842", name: "Dog Style Boutique", tenant: "PB", plan: "Profissional", value: "R$ 99,90", status: "Confirmado", date: "Hoje, 14:32", color: "blue" },
  { id: "PF-8841", name: "Amigo Cão Grooming", tenant: "AC", plan: "Premium", value: "R$ 249,90", status: "Confirmado", date: "Ontem, 09:15", color: "purple" },
  { id: "PF-8840", name: "Vida Veterinária", tenant: "VV", plan: "Profissional", value: "R$ 99,90", status: "Pendente", date: "Ontem, 18:45", color: "amber" },
  { id: "PF-8839", name: "Gato & Peixe Aquário", tenant: "GP", plan: "Profissional", value: "R$ 99,90", status: "Falha", date: "12 Out, 11:20", color: "red" },
];

export default function SuperAdminFinanceiroPage() {
  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* ── Header ── */}
      <header className="flex flex-col gap-2 mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Financeiro da Plataforma</h2>
        <p className="text-gray-500 font-medium">Monitore o faturamento, LTV, MRR Projetado e retenção do seu SaaS.</p>
      </header>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="analytics"
          label="Lifetime Value (LTV)"
          value="R$ 12.450"
          trend="+5.2% vs mês anterior"
          trendDirection="up"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          icon="query_stats"
          label="MRR Projetado"
          value="R$ 45.800"
          trend="+12.8% este mês"
          trendDirection="up"
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          icon="groups"
          label="Assinantes Ativos"
          value={342}
          trend="+24 novos"
          trendDirection="up"
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatCard
          icon="trending_down"
          label="Churn Rate"
          value="2.1%"
          trend="-0.4% (melhoria)"
          trendDirection="neutral"
          iconBg="bg-red-100"
          iconColor="text-red-500"
        />
      </div>

      {/* ── Tabela de Transações ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Transações Recentes (Stripe)</h3>
          <button className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
            Ver todas <MaterialIcon icon="arrow_forward" size="sm" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Lojista (Tenant)</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-${tx.color}-100 flex items-center justify-center text-${tx.color}-700 font-bold text-sm shadow-sm`}>
                        {tx.tenant}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{tx.name}</p>
                        <p className="text-xs text-gray-500 font-medium">ID: {tx.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{tx.plan}</td>
                  <td className="px-6 py-4 text-sm font-black text-gray-900">{tx.value}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{tx.date}</td>
                  <td className="px-6 py-4">
                    <Badge 
                      variant={tx.status === "Confirmado" ? "success" : tx.status === "Pendente" ? "warning" : "danger"} 
                      className="text-[10px]"
                    >
                      {tx.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors rounded-lg">
                      <MaterialIcon icon="receipt_long" size="sm" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
