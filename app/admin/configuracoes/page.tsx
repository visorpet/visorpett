"use client";

import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui";

type Config = {
  CRON_SECRET?: string;
  ASAAS_API_KEY?: string;
  ASAAS_API_KEY_MASKED?: string;
  ASAAS_SANDBOX?: string;
};

export default function SuperAdminConfiguracoesPage() {
  const [config, setConfig]         = useState<Config>({});
  const [form, setForm]             = useState<Config>({});
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [showAsaasKey, setShowAsaasKey] = useState(false);
  const [asaasTestStatus, setAsaasTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((data) => {
        setConfig(data);
        setForm({
          CRON_SECRET:   data.CRON_SECRET   ?? "",
          ASAAS_API_KEY: "",
          ASAAS_SANDBOX: data.ASAAS_SANDBOX ?? "true",
        });
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    const payload: Config = {
      CRON_SECRET:   form.CRON_SECRET,
      ASAAS_SANDBOX: form.ASAAS_SANDBOX,
    };
    if (form.ASAAS_API_KEY) payload.ASAAS_API_KEY = form.ASAAS_API_KEY;
    await fetch("/api/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleTestAsaas() {
    setAsaasTestStatus("testing");
    try {
      const res = await fetch("/api/admin/config/test-asaas", { method: "POST" });
      setAsaasTestStatus(res.ok ? "ok" : "fail");
    } catch { setAsaasTestStatus("fail"); }
    setTimeout(() => setAsaasTestStatus("idle"), 4000);
  }

  const isAsaasConfigured = !!config.ASAAS_API_KEY_MASKED;

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-gray-100 rounded-2xl" />)}
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

        {/* Asaas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MaterialIcon icon="credit_card" className="text-primary" /> Gateway de Pagamento — Asaas
              </h3>
              <p className="text-gray-500 text-sm mt-1">Cobrança automática via PIX, boleto ou cartão.</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isAsaasConfigured ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
              {isAsaasConfigured ? "Configurado" : "Pendente"}
            </span>
          </div>

          <div className="p-6 space-y-5">
            {!isAsaasConfigured && (
              <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <MaterialIcon icon="info" className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Configure a <strong>API Key do Asaas</strong> para habilitar cobranças automáticas.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                API Key
                {config.ASAAS_API_KEY_MASKED && (
                  <span className="ml-2 text-xs font-normal text-gray-400">(salvo: {config.ASAAS_API_KEY_MASKED})</span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showAsaasKey ? "text" : "password"}
                  value={form.ASAAS_API_KEY ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, ASAAS_API_KEY: e.target.value }))}
                  placeholder={config.ASAAS_API_KEY_MASKED ? "Deixe em branco para manter" : "$aact_..."}
                  className="w-full border border-gray-200 rounded-lg text-sm p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
                <button type="button" onClick={() => setShowAsaasKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <MaterialIcon icon={showAsaasKey ? "visibility_off" : "visibility"} size="sm" />
                </button>
              </div>
            </div>

            <div
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer"
              onClick={() => setForm((f) => ({ ...f, ASAAS_SANDBOX: f.ASAAS_SANDBOX === "true" ? "false" : "true" }))}
            >
              <div>
                <p className="font-bold text-sm text-gray-900">Modo Sandbox (Testes)</p>
                <p className="text-xs text-gray-500">
                  {form.ASAAS_SANDBOX === "true" ? "Ativo — cobranças não são processadas de verdade." : "Desativado — cobranças reais."}
                </p>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${form.ASAAS_SANDBOX === "true" ? "bg-primary" : "bg-gray-300"}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${form.ASAAS_SANDBOX === "true" ? "translate-x-6" : "translate-x-0.5"}`} />
              </div>
            </div>

            {isAsaasConfigured && (
              <button
                onClick={handleTestAsaas}
                disabled={asaasTestStatus === "testing"}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                <MaterialIcon
                  icon={asaasTestStatus === "testing" ? "sync" : asaasTestStatus === "ok" ? "check_circle" : asaasTestStatus === "fail" ? "error" : "wifi_tethering"}
                  className={asaasTestStatus === "ok" ? "text-green-600" : asaasTestStatus === "fail" ? "text-red-500" : "text-gray-500"}
                  size="sm"
                />
                {asaasTestStatus === "testing" ? "Verificando..." : asaasTestStatus === "ok" ? "Conta conectada!" : asaasTestStatus === "fail" ? "Falhou — verifique a chave" : "Testar conexão"}
              </button>
            )}
          </div>
        </div>

        {/* Cron */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MaterialIcon icon="schedule" className="text-primary" /> Cron Jobs
            </h3>
            <p className="text-gray-500 text-sm mt-1">Chave de segurança para rotas de cron da Vercel.</p>
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
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 flex items-center gap-2 disabled:opacity-70">
            {saving ? <><MaterialIcon icon="sync" size="sm" /> Salvando...</> : saved ? <><MaterialIcon icon="check_circle" size="sm" /> Salvo!</> : "Salvar Configurações"}
          </button>
        </div>
      </div>
    </div>
  );
}
