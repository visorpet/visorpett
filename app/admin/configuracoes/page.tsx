"use client";

import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui";

export default function SuperAdminConfiguracoesPage() {
  const [cronSecret, setCronSecret] = useState("");
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [asaasOk, setAsaasOk]       = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((data) => {
        setCronSecret(data.CRON_SECRET ?? "");
        setAsaasOk(!!data.ASAAS_API_KEY_MASKED);
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ CRON_SECRET: cronSecret }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4 animate-pulse">
        {[1, 2].map((i) => <div key={i} className="h-40 bg-gray-100 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="p-8 pb-24 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Configurações da Plataforma</h2>
        <p className="text-gray-500 font-medium">Integrações e regras globais do SaaS.</p>
      </header>

      <div className="space-y-6">

        {/* Asaas — somente status (chave gerenciada nas env vars do servidor) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MaterialIcon icon="credit_card" className="text-primary" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Gateway de Pagamento — Asaas</h3>
                <p className="text-gray-500 text-sm mt-0.5">Cobrança automática via PIX, boleto ou cartão.</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 mt-1 ${
              asaasOk ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
            }`}>
              {asaasOk ? "Conectado" : "Pendente"}
            </span>
          </div>

          <div className="px-6 pb-6">
            <div className={`flex gap-3 p-4 rounded-xl border ${
              asaasOk
                ? "bg-green-50 border-green-100"
                : "bg-yellow-50 border-yellow-100"
            }`}>
              <MaterialIcon
                icon={asaasOk ? "check_circle" : "info"}
                className={asaasOk ? "text-green-600 flex-shrink-0 mt-0.5" : "text-yellow-600 flex-shrink-0 mt-0.5"}
              />
              <p className={`text-sm ${asaasOk ? "text-green-800" : "text-yellow-800"}`}>
                {asaasOk
                  ? "API Key configurada via variável de ambiente no servidor. Nenhuma ação necessária."
                  : "Configure a variável de ambiente ASAAS_API_KEY no painel da Vercel para habilitar cobranças."}
              </p>
            </div>
          </div>
        </div>

        {/* Cron Jobs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MaterialIcon icon="schedule" className="text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Cron Jobs</h3>
              <p className="text-gray-500 text-sm mt-0.5">Chave de segurança para rotas de cron da Vercel.</p>
            </div>
          </div>
          <div className="p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">CRON_SECRET</label>
            <input
              type="password"
              value={cronSecret}
              onChange={(e) => setCronSecret(e.target.value)}
              placeholder="vsp_cron_..."
              className="w-full border border-gray-200 rounded-lg text-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 flex items-center gap-2 disabled:opacity-70"
          >
            {saving ? (
              <><MaterialIcon icon="sync" size="sm" /> Salvando...</>
            ) : saved ? (
              <><MaterialIcon icon="check_circle" size="sm" /> Salvo!</>
            ) : (
              "Salvar Configurações"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
