import { MaterialIcon, Badge } from "@/components/ui";

const mockPetshops = [
  { id: 1, name: "Paws e Cores Pet Shop", city: "São Paulo, SP", date: "Há 2 horas", plan: "Plano Pro", active: true },
  { id: 2, name: "Buddy Grooming", city: "Curitiba, PR", date: "Há 5 horas", plan: "Plano Free", active: true },
  { id: 3, name: "VetCare Premium", city: "Rio de Janeiro, RJ", date: "Há 1 dia", plan: "Plano Premium", active: true },
  { id: 4, name: "Banho & Tosa Cia", city: "Belo Horizonte, MG", date: "Há 2 dias", plan: "Plano Pro", active: false },
];

export default function SuperAdminPetshopsPage() {
  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Gestão de Pet Shops</h2>
          <p className="text-gray-500 font-medium mt-1">Lojistas, aprovações e controle de tenants.</p>
        </div>
        <button className="btn-primary">
          <MaterialIcon icon="add" size="sm" />
          Novo Tenant (Manual)
        </button>
      </header>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Lista de Pet Shops ({mockPetshops.length})</h3>
          <div className="relative">
            <MaterialIcon icon="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size="sm" />
            <input 
              type="text" 
              placeholder="Buscar loja..." 
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-64"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Nome da Loja</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4">Cadastro / Atividade</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockPetshops.map((shop) => (
                <tr key={shop.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {shop.name.charAt(0)}
                      </div>
                      <p className="font-bold text-sm text-gray-900">{shop.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">{shop.city}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{shop.date}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-[10px] font-bold bg-blue-50 text-blue-600 rounded uppercase">
                      {shop.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={shop.active ? "success" : "danger"} className="text-[10px]">
                      {shop.active ? "Ativo" : "Bloqueado"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-lg">
                      <MaterialIcon icon="edit" size="sm" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg">
                      <MaterialIcon icon={shop.active ? "block" : "settings_backup_restore"} size="sm" />
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
