import { MaterialIcon, Avatar, Badge } from "@/components/ui";

const tickets = [
  { id: "#TKT-001", shop: "PetLove Moema", title: "Problema com integração de pagamento", status: "Aberto", priority: "Alta", date: "Há 1 hora" },
  { id: "#TKT-002", shop: "Buddy Grooming", title: "Dúvida sobre relatório de impostos", status: "Em Andamento", priority: "Média", date: "Há 3 horas" },
  { id: "#TKT-003", shop: "Vida Veterinária", title: "Novo tosador não está recebendo SMS", status: "Resolvido", priority: "Baixa", date: "Ontem" },
];

export default function SuperAdminSuportePage() {
  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Central de Suporte (SaaS)</h2>
          <p className="text-gray-500 font-medium">Atenda os lojistas, gerencie tickets e resolva solicitações pendentes.</p>
        </div>
        <button className="btn-primary">
          <MaterialIcon icon="headset_mic" size="sm" />
          Fórum / Base de Ajuda
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-medium text-sm">Tickets Abertos</p>
            <p className="text-2xl font-black text-red-500 mt-1">14</p>
          </div>
          <MaterialIcon icon="mark_email_unread" size="xl" className="text-red-100" />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-medium text-sm">Em Atendimento</p>
            <p className="text-2xl font-black text-amber-500 mt-1">5</p>
          </div>
          <MaterialIcon icon="support_agent" size="xl" className="text-amber-100" />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-medium text-sm">Tempo Médio de Resp.</p>
            <p className="text-2xl font-black text-green-500 mt-1">1h 45m</p>
          </div>
          <MaterialIcon icon="timer" size="xl" className="text-green-100" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Tickets Recentes</h3>
          <div className="relative">
            <MaterialIcon icon="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size="sm" />
            <input 
              type="text" 
              placeholder="Buscar por ID..." 
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Pet Shop</th>
                <th className="px-6 py-4">Assunto</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Prioridade</th>
                <th className="px-6 py-4">Atualizado</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{t.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">{t.shop}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 truncate max-w-[200px]">{t.title}</td>
                  <td className="px-6 py-4">
                    <Badge variant={t.status === "Aberto" ? "danger" : t.status === "Resolvido" ? "success" : "warning"} className="text-[10px]">
                      {t.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                      t.priority === "Alta" ? "bg-red-50 text-red-600" : 
                      t.priority === "Média" ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors text-xs font-bold rounded-lg">
                      Responder
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
