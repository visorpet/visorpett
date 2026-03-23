"use client";

import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon } from "@/components/ui";
import { usePetShop } from "../_petshop-context";

type ShopData = {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  logoUrl: string;
};

const BRAZIL_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export default function DadosPetShopPage() {
  const [form, setForm] = useState<ShopData>({
    name: "", phone: "", address: "", city: "", state: "", logoUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { refreshShop } = usePetShop();

  useEffect(() => {
    fetch("/api/petshops/me")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          const d = json.data;
          setForm({
            name:    d.name    ?? "",
            phone:   d.phone   ?? "",
            address: d.address ?? "",
            city:    d.city    ?? "",
            state:   d.state   ?? "",
            logoUrl: d.logoUrl ?? "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function set(field: keyof ShopData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setSuccess(false);
    setError(null);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      // 1. Upload do arquivo
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "logos");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) return;

      const url = uploadJson.url;

      // 2. Salva imediatamente no banco (não espera o botão Salvar)
      await fetch("/api/petshops/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: url }),
      });

      // 3. Atualiza form local e contexto global
      set("logoUrl", url);
      refreshShop();
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Nome é obrigatório."); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/petshops/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    form.name,
          phone:   form.phone   || undefined,
          address: form.address || undefined,
          city:    form.city    || undefined,
          state:   form.state   || undefined,
          logoUrl: form.logoUrl || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Erro ao salvar."); return; }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      refreshShop();
    } catch {
      setError("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <PageHeader title="Dados do Pet Shop" showBack backHref="/dono/perfil" />
        <div className="flex flex-col gap-4 mt-4 animate-pulse px-4">
          <div className="h-32 bg-gray-100 rounded-2xl" />
          <div className="h-40 bg-gray-100 rounded-2xl" />
          <div className="h-40 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pb-32 font-sans">
      <PageHeader title="Dados do Pet Shop" showBack backHref="/dono/perfil" />

      <form onSubmit={handleSave} className="flex flex-col gap-4 px-4 mt-2">

        {/* ── Logo hero ── */}
        <section className="animate-slide-up bg-gradient-to-br from-primary/90 to-primary rounded-2xl p-5 flex items-center gap-4">
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={logoUploading}
              className="relative group w-16 h-16 rounded-full overflow-hidden bg-white/20 border-2 border-white/40 flex items-center justify-center focus:outline-none disabled:opacity-70"
            >
              {form.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logoUrl} alt={form.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-black text-2xl select-none">
                  {(form.name || "P").charAt(0).toUpperCase()}
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all rounded-full">
                {logoUploading ? (
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <MaterialIcon icon="photo_camera" size="sm" className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </span>
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>
          <div className="flex-1 min-w-0 text-white">
            <p className="font-black text-lg leading-tight truncate">
              {form.name || "Meu Pet Shop"}
            </p>
            <p className="text-white/70 text-xs mt-0.5">
              {[form.city, form.state].filter(Boolean).join(", ") || "Sem localização definida"}
            </p>
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={logoUploading}
              className="mt-2 text-[11px] font-bold text-white/80 bg-white/15 px-3 py-1 rounded-full disabled:opacity-50"
            >
              {logoUploading ? "Enviando..." : "Alterar logo"}
            </button>
          </div>
        </section>

        {/* ── Informações da loja ── */}
        <section className="animate-slide-up bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-gray-50">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <MaterialIcon icon="storefront" size="sm" className="text-primary" />
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Informações da Loja</p>
          </div>

          <div className="p-5 flex flex-col gap-4">
            <div>
              <label className="field-label">
                Nome do Pet Shop <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ex: Pet Shop do João"
                className="field-input"
                required
              />
            </div>

            <div>
              <label className="field-label">Telefone / WhatsApp</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  <MaterialIcon icon="phone" size="sm" className="text-gray-400" />
                </span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="field-input pl-9"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Endereço ── */}
        <section className="animate-slide-up bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-gray-50">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <MaterialIcon icon="location_on" size="sm" className="text-primary" />
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Endereço</p>
          </div>

          <div className="p-5 flex flex-col gap-4">
            <div>
              <label className="field-label">Endereço completo</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Rua, número, bairro..."
                className="field-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Cidade</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="São Paulo"
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Estado</label>
                <select
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  className="field-input"
                >
                  <option value="">UF</option>
                  {BRAZIL_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Feedback */}
        {error && (
          <div className="animate-slide-up bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 flex gap-2 items-center">
            <MaterialIcon icon="error_outline" size="sm" />
            {error}
          </div>
        )}

        {success && (
          <div className="animate-slide-up bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium border border-emerald-100 flex gap-2 items-center">
            <MaterialIcon icon="check_circle" size="sm" />
            Dados salvos com sucesso!
          </div>
        )}
      </form>

      {/* Botão fixo no rodapé */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-white/90 backdrop-blur-sm border-t border-gray-100 z-10">
        <button
          type="submit"
          form="dados-form"
          disabled={saving}
          onClick={handleSave}
          className="btn-primary w-full py-4 text-base disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          {saving ? (
            <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Salvando...</>
          ) : success ? (
            <><MaterialIcon icon="check_circle" size="sm" /> Salvo!</>
          ) : (
            <><MaterialIcon icon="save" size="sm" /> Salvar Alterações</>
          )}
        </button>
      </div>
    </div>
  );
}
