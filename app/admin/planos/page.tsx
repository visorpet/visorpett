import { MaterialIcon } from "@/components/ui";

export default function SuperAdminPlanosPage() {
  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Gerenciamento de Planos</h2>
          <p className="text-gray-500 font-medium mt-1">Controle os tiers, recursos e preços do seu SaaS.</p>
        </div>
        <button className="btn-primary">
          <MaterialIcon icon="add" size="sm" />
          Novo Plano
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plano Free */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:shadow-card-hover transition-all">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-bold text-xl text-gray-900">Gratuito (Free)</h3>
            <p className="text-gray-500 text-sm mt-1">Para iniciantes</p>
          </div>
          <div className="p-6 flex-1 space-y-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-gray-900">R$ 0</span>
              <span className="text-gray-500 text-sm">/mês</span>
            </div>
            <ul className="space-y-3 mt-4">
              <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <MaterialIcon icon="check_circle" className="text-green-500" size="sm" />
                Até 50 pets
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                <MaterialIcon icon="block" size="sm" />
                Sem Relatórios Pro
              </li>
            </ul>
          </div>
          <div className="p-4 bg-gray-50 flex justify-end">
            <button className="p-2 text-gray-500 hover:text-primary transition-colors bg-white border border-gray-200 hover:border-primary/50 rounded-lg">
              <MaterialIcon icon="edit" size="sm" />
            </button>
          </div>
        </div>

        {/* Plano Pro */}
        <div className="bg-white rounded-2xl border-2 border-primary shadow-md flex flex-col relative transform hover:-translate-y-1 transition-all">
          <div className="absolute top-0 right-4 transform -translate-y-1/2 bg-primary text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase">
            Popular
          </div>
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-bold text-xl text-gray-900">Profissional</h3>
            <p className="text-gray-500 text-sm mt-1">Lojas em crescimento</p>
          </div>
          <div className="p-6 flex-1 space-y-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-gray-900">R$ 99,90</span>
              <span className="text-gray-500 text-sm">/mês</span>
            </div>
            <ul className="space-y-3 mt-4">
              <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <MaterialIcon icon="check_circle" className="text-green-500" size="sm" />
                Até 500 pets
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <MaterialIcon icon="check_circle" className="text-green-500" size="sm" />
                Relatórios Avançados
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <MaterialIcon icon="check_circle" className="text-green-500" size="sm" />
                Suporte Prioritário
              </li>
            </ul>
          </div>
          <div className="p-4 bg-primary/5 flex justify-end">
            <button className="p-2 text-primary hover:bg-primary/10 transition-colors bg-white border border-primary/20 rounded-lg">
              <MaterialIcon icon="edit" size="sm" />
            </button>
          </div>
        </div>

        {/* Plano Premium */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:shadow-card-hover transition-all">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-bold text-xl text-gray-900">Premium</h3>
            <p className="text-gray-500 text-sm mt-1">Escala total</p>
          </div>
          <div className="p-6 flex-1 space-y-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-gray-900">R$ 249,90</span>
              <span className="text-gray-500 text-sm">/mês</span>
            </div>
            <ul className="space-y-3 mt-4">
              <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <MaterialIcon icon="check_circle" className="text-green-500" size="sm" />
                Pets Ilimitados
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <MaterialIcon icon="check_circle" className="text-green-500" size="sm" />
                White Label
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <MaterialIcon icon="check_circle" className="text-green-500" size="sm" />
                API Rest Acesso
              </li>
            </ul>
          </div>
          <div className="p-4 bg-gray-50 flex justify-end">
            <button className="p-2 text-gray-500 hover:text-primary transition-colors bg-white border border-gray-200 hover:border-primary/50 rounded-lg">
              <MaterialIcon icon="edit" size="sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
