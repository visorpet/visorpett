"use client";

import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui";

type Config = {
  EVOLUTION_API_URL?: string;
  EVOLUTION_API_KEY?: string;
  EVOLUTION_API_KEY_MASKED?: string;
  EVOLUTION_INSTANCE?: string;
  CRON_SECRET?: string;
  ASAAS_API_KEY?: string;
  ASAAS_API_KEY_MASKED?: string;
  ASAAS_SANDBOX?: string;
};

export default function SuperAdminConfiguracoesPage() {
  const [config, setConfig]     = useState<Config>({});
  const [form, setForm]         = useState<Config>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAsaasKey, setShowAsaasKey] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [asaasTestStatus, setAsaasTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((data) => {
        setConfig(data);
        setForm({
          EVOLUTION_API_URL:  data.EVOLUTION_API_URL  ?? "",
          EVOLUTION_API_KEY:  "",
          EVOLUTION_INSTANCE: data.EVOLUTION_INSTANCE ?? "visorpet",
          CRON_SECRET:        data.CRON_SECRET        ?? "",
          ASAAS_API_KEY:      "",
          ASAAS_SANDBOX:      data.ASAAS_SANDBOX      ?? "true",
        });
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    const payload: Config = {
      EVOLUTION_API_URL:  form.EVOLUTION_API_URL,
      EVOLUTION_INSTANCE: form.EVOLUTION_INSTANCE,
      CRON_SECRET:        form.CRON_SECRET,
      ASAAS_SANDBOX:      form.ASAAS_SANDBOX,
    };
    // Only send API keys if user typed something new
    if (form.EVOLUTION_API_KEY) {
      payload.EVOLUTION_API_KEY = form.EVOLUTION_API_KEY;
    }
    if (form.ASAAS_API_KEY) {
      payload.ASAAS_API_KEY = form.ASAAS_API_KEY;
    }
    await fetch("/api/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleTestWhatsApp() {
    setTestStatus("testing");
    try {
      const res = await fetch("/api/admin/config/test-whatsapp", { method: "POST" });
      setTestStatus(res.ok ? "ok" : "fail");
    } catch {
      setTestStatus("fail");
    }
    setTimeout(() => setTestStatus("idle"), 4000);
  }

  async function handleTestAsaas() {
    setAsaasTestStatus("testing");
    try {
      const res = await fetch("/api/admin/config/test-asaas", { method: "POST" });
      setAsaasTestStatus(res.ok ? "ok" : "fail");
    } catch {
      setAsaasTestStatus("fail");
    }
    setTimeout(() => setAsaasTestStatus("idle"), 4000);
  }

  const isEvolutionConfigured = !!(config.EVOLUTION_API_URL && config.EVOLUTION_API_KEY_MASKED);
  const isAsaasConfigured = !!config.ASAAS_API_KEY_MASKED;

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-8 pb-24 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Configurações da Plataforma</h2>
        <p className="text-gray-500 font-medium">Ajuste regras globais, integrações e permissões de segurança.</p>
      </header>

      <div className="space-y-6">

        {/* WhatsApp / Evolution API */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MaterialIcon icon="chat" className="text-green-600" /> WhatsApp — Evolution API
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Envio automático de lembretes, retornos e pós-atendimento via WhatsApp.
              </p>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                isEvolutionConfigured
                  ? "bg-green-50 text-green-700"
                  : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {isEvolutionConfigured ? "Configurado" : "Pendente"}
            </span>
          </div>

          <div className="p-6 space-y-5">
            {/* Aviso quando não configurado */}
            {!isEvolutionConfigured && (
              <div className="flex gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <MaterialIcon icon="info" className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Sem a Evolution API, os crons geram <strong>links wa.me</strong> que você envia manualmente
                  pela tela de <strong>Notificações</strong>. Configure aqui para envio automático.
                </p>
              </div>
            )}

            {/* URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                URL da Evolution API
              </label>
              <input
                type="url"
                value={form.EVOLUTION_API_URL ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, EVOLUTION_API_URL: e.target.value }))}
                placeholder="https://sua-evolution.api.com"
                className="w-full border border-gray-200 rounded-lg text-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                API Key
                {config.EVOLUTION_API_KEY_MASKED && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    (salvo: {config.EVOLUTION_API_KEY_MASKED})
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={form.EVOLUTION_API_KEY ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, EVOLUTION_API_KEY: e.target.value }))}
                  placeholder={config.EVOLUTION_API_KEY_MASKED ? "Deixe em branco para manter a atual" : "Cole sua API Key aqui"}
                  className="w-full border border-gray-200 rounded-lg text-sm p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <MaterialIcon icon={showApiKey ? "visibility_off" : "visibility"} size="sm" />
                </button>
              </div>
            </div>

            {/* Instance */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nome da Instância
              </label>
              <input
                type="text"
                value={form.EVOLUTION_INSTANCE ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, EVOLUTION_INSTANCE: e.target.value }))}
                placeholder="visorpet"
                className="w-full border border-gray-200 rounded-lg text-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
              <p className="text-xs text-gray-400 mt-1">Nome da instância configurada no servidor Evolution API.</p>
            </div>

            {/* Botão de teste */}
            {isEvolutionConfigured && (
              <button
                onClick={handleTestWhatsApp}
                disabled={testStatus === "testing"}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                <MaterialIcon
                  icon={
                    testStatus === "testing" ? "sync" :
                    testStatus === "ok"      ? "check_circle" :
                    testStatus === "fail"    ? "error" :
                    "wifi_tethering"
                  }
                  className={
                    testStatus === "ok"   ? "text-green-600" :
                    testStatus === "fail" ? "text-red-500"   :
                    "text-gray-500"
                  }
                  size="sm"
                />
                {testStatus === "testing" ? "Testando..." :
                 testStatus === "ok"      ? "Conectado!" :
                 testStatus === "fail"    ? "Falhou — verifique os dados" :
                 "Testar conexão"}
              </button>
            )}
          </div>
        </div>

        {/* Cron Secret */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MaterialIcon icon="schedule" className="text-primary" /> Cron Jobs
            </h3>
            <p className="text-gray-500 text-sm mt-1">Chave de segurança para proteger as rotas de cron da Vercel.</p>
          </div>
          <div className="p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">CRON_SECRET</label>
            <input
              type="password"
              value={form.CRON_SECRET ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, CRON_SECRET: e.target.value }))}
              placeholder="vsp_cron_..."
              className="w-full border border-gray-200 rounded-lg text-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
            <p className="text-xs text-gray-400 mt-1">
              Deve ser idêntico à variável <code className="bg-gray-100 px-1 rounded">CRON_SECRET</code> configurada na Vercel.
            </p>
          </div>
        </div>

        {/* Gateway de Pagamento — Asaas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MaterialIcon icon="credit_card" className="text-primary" /> Gateway de Pagamento — Asaas
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Cobrança automática das assinaturas via PIX, boleto ou cartão de crédito.
              </p>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                isAsaasConfigured
                  ? "bg-green-50 text-green-700"
                  : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {isAsaasConfigured ? "Configurado" : "Pendente"}
            </span>
          </div>

          <div className="p-6 space-y-5">
            {!isAsaasConfigured && (
              <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <MaterialIcon icon="info" className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Configure sua <strong>API Key do Asaas</strong> para habilitar a cobrança automática dos planos PRO e Premium.
                  Acesse{" "}
                  <a href="https://app.asaas.com/config/integrations" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                    asaas.com → Configurações → Integrações
                  </a>{" "}
                  para obter a chave.
                </p>
              </div>
            )}

            {/* API Key */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                API Key
                {config.ASAAS_API_KEY_MASKED && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    (salvo: {config.ASAAS_API_KEY_MASKED})
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showAsaasKey ? "text" : "password"}
                  value={form.ASAAS_API_KEY ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, ASAAS_API_KEY: e.target.value }))}
                  placeholder={config.ASAAS_API_KEY_MASKED ? "Deixe em branco para manter a atual" : "$aact_... (cole sua chave aqui)"}
                  className="w-full border border-gray-200 rounded-lg text-sm p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
                <button
                  type="button"
                  onClick={() => setShowAsaasKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <MaterialIcon icon={showAsaasKey ? "visibility_off" : "visibility"} size="sm" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Chave de produção começa com <code className="bg-gray-100 px-1 rounded">$aact_</code> — chave sandbox começa com <code className="bg-gray-100 px-1 rounded">$aact_YTU5YTE0M</code>.
              </p>
            </div>

            {/* Sandbox toggle */}
            <div
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer"
              onClick={() => setForm((f) => ({ ...f, ASAAS_SANDBOX: f.ASAAS_SANDBOX === "true" ? "false" : "true" }))}
            >
              <div>
                <p className="font-bold text-sm text-gray-900">Modo Sandbox (Testes)</p>
                <p className="text-xs text-gray-500">
                  {form.ASAAS_SANDBOX === "true"
                    ? "Ativo — cobranças não são processadas de verdade."
                    : "Desativado — cobranças reais serão processadas."}
                </p>
              </div>
              <div
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  form.ASAAS_SANDBOX === "true" ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${
                    form.ASAAS_SANDBOX === "true" ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </div>
            </div>

            {/* Botão de teste */}
            {isAsaasConfigured && (
              <button
                onClick={handleTestAsaas}
                disabled={asaasTestStatus === "testing"}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                <MaterialIcon
                  icon={
                    asaasTestStatus === "testing" ? "sync" :
                    asaasTestStatus === "ok"      ? "check_circle" :
                    asaasTestStatus === "fail"    ? "error" :
                    "wifi_tethering"
                  }
                  className={
                    asaasTestStatus === "ok"   ? "text-green-600" :
                    asaasTestStatus === "fail" ? "text-red-500"   :
                    "text-gray-500"
                  }
                  size="sm"
                />
                {asaasTestStatus === "testing" ? "Verificando..." :
                 asaasTestStatus === "ok"      ? "Conta conectada!" :
                 asaasTestStatus === "fail"    ? "Falhou — verifique a chave" :
                 "Testar conexão"}
              </button>
            )}
          </div>
        </div>

        {/* Segurança */}
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

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar Alterações
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 flex items-center gap-2 disabled:opacity-70"
          >
            {saving ? (
              <>
                <MaterialIcon icon="sync" size="sm" /> Salvando...
              </>
            ) : saved ? (
              <>
                <MaterialIcon icon="check_circle" size="sm" /> Salvo!
              </>
            ) : (
              "Salvar Configurações"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
