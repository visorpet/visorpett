import { MaterialIcon } from "@/components/ui";

export default function SuperAdminConfiguracoesPage() {
  return (
    <div className="p-8 pb-24 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Configurações da Plataforma</h2>
        <p className="text-gray-500 font-medium">Ajuste regras globais, integrações e permissões de segurança.</p>
      </header>

      <div className="space-y-6">
        {/* Seção 1 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MaterialIcon icon="credit_card" className="text-primary" /> Gateway de Pagamento
            </h3>
            <p className="text-gray-500 text-sm mt-1">Integração do Stripe e split de pagamentos.</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Stripe Secret Key</label>
              <input 
                type="password" 
                value="sk_live_xxxxxxxxxxxxxxxxxxxxxx" 
                readOnly
                className="w-full bg-gray-50 border border-gray-200 rounded-lg text-sm p-3 text-gray-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="font-bold text-sm text-gray-900">Modo de Teste (Sandbox)</p>
                <p className="text-xs text-gray-500">Transações não serão cobradas de verdade.</p>
              </div>
              <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 2 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MaterialIcon icon="security" className="text-primary" /> Segurança
            </h3>
            <p className="text-gray-500 text-sm mt-1">Controle de acesso à rede e logs da plataforma.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                  <MaterialIcon icon="shield_lock" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">Autenticação de Dois Fatores (2FA)</p>
                  <p className="text-xs text-gray-500">Obrigatório para contas Super Admin.</p>
                </div>
              </div>
              <MaterialIcon icon="chevron_right" className="text-gray-300" />
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                  <MaterialIcon icon="history" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">Logs de Auditoria</p>
                  <p className="text-xs text-gray-500">Histórico de ações de admin e tenants.</p>
                </div>
              </div>
              <MaterialIcon icon="chevron_right" className="text-gray-300" />
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button className="px-6 py-2.5 rounded-xl font-bold text-sm bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar Alterações
          </button>
          <button className="px-6 py-2.5 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30">
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}
