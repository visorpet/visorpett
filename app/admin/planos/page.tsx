"use client";

import { MaterialIcon } from "@/components/ui";

const PLANS = [
  {
    key: "PRO",
    label: "Profissional",
    price: 97,
    description: "Lojas em crescimento",
    popular: true,
    features: ["Pets ilimitados", "Agenda completa", "Relatórios básicos", "Suporte por e-mail"],
    missing: [],
  },
  {
    key: "PREMIUM",
    label: "Premium",
    price: 197,
    description: "Lojas consolidadas",
    popular: false,
    features: ["Tudo do Pro", "Relatórios avançados", "Multi-tosadores", "Suporte prioritário"],
    missing: [],
  },
  {
    key: "ENTERPRISE",
    label: "Enterprise",
    price: 497,
    description: "Redes e franquias",
    popular: false,
    features: ["Tudo do Premium", "API REST", "White Label", "Gerente de conta"],
    missing: [],
  },
];

export default function SuperAdminPlanosPage() {
  return (
    <div className="p-8 pb-24 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Planos da Plataforma</h2>
        <p className="text-gray-500 font-medium mt-1">
          Preços e funcionalidades de cada tier. Para assinar um shop, acesse{" "}
          <a href="/admin/petshops" className="text-primary underline">Pet Shops → Assinar</a>.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((p) => (
          <div
            key={p.key}
            className={`bg-white rounded-2xl shadow-sm flex flex-col relative overflow-hidden ${
              p.popular ? "border-2 border-primary" : "border border-gray-100"
            }`}
          >
            {p.popular && (
              <div className="absolute top-0 right-4 -translate-y-1/2 bg-primary text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase">
                Popular
              </div>
            )}
            <div className="p-6 border-b border-gray-50">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{p.key}</p>
              <h3 className="font-bold text-xl text-gray-900">{p.label}</h3>
              <p className="text-gray-500 text-sm mt-0.5">{p.description}</p>
            </div>
            <div className="p-6 flex-1">
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-4xl font-black text-gray-900">R$ {p.price}</span>
                <span className="text-gray-500 text-sm">/mês</span>
              </div>
              <ul className="space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <MaterialIcon icon="check_circle" className="text-green-500 flex-shrink-0" size="sm" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`px-6 py-4 text-xs font-semibold text-gray-400 ${p.popular ? "bg-primary/5" : "bg-gray-50"}`}>
              Para assinar: Pet Shops → botão Assinar
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-3">
        <MaterialIcon icon="info" className="text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-bold text-blue-800 text-sm">Como funciona</p>
          <p className="text-blue-700 text-xs mt-1">
            As assinaturas são criadas diretamente no Asaas. Vá em{" "}
            <a href="/admin/petshops" className="underline font-bold">Pet Shops</a>, localize o shop
            e clique em <strong>Assinar</strong> para escolher o plano e gerar o link de pagamento.
            O webhook do Asaas atualiza o status automaticamente após o pagamento.
          </p>
        </div>
      </div>
    </div>
  );
}
