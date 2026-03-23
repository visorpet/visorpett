"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, PhotoUpload } from "@/components/ui";

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
  const router = useRouter();
  const [form, setForm] = useState<ShopData>({
    name: "", phone: "", address: "", city: "", state: "", logoUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/petshops/me")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          const d = json.data;
          setForm({
            name: d.name ?? "",
            phone: d.phone ?? "",
            address: d.address ?? "",
            city: d.city ?? "",
            state: d.state ?? "",
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
          name: form.name,
          phone: form.phone || undefined,
          address: form.address || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          logoUrl: form.logoUrl || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Erro ao salvar."); return; }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container pb-24 font-sans">
      <PageHeader title="Dados do Pet Shop" showBack onBack={() => router.push("/dono/perfil")} />

      <form onSubmit={handleSave} className="flex flex-col gap-6 mt-2">
        {/* ── Logo ── */}
        <section className="animate-slide-up flex justify-center py-2">
          <PhotoUpload
            currentUrl={form.logoUrl || null}
            name={form.name || "Pet Shop"}
            folder="logos"
            onUploaded={(url) => set("logoUrl", url)}
            size="2xl"
            shape="circle"
            label="Adicionar logo"
          />
        </section>

        {/* ── Informações básicas ── */}
        <section className="animate-slide-up bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
          <p className="section-label">Informações da Loja</p>

          <div>
            <label className="field-label">Nome do Pet Shop <span className="text-red-400">*</span></label>
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
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="(11) 99999-9999"
              className="field-input"
            />
          </div>
        </section>

        {/* ── Endereço ── */}
        <section className="animate-slide-up bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
          <p className="section-label">Endereço</p>

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
        </section>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex gap-2 items-center">
            <MaterialIcon icon="error_outline" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-medium border border-emerald-100 flex gap-2 items-center">
            <MaterialIcon icon="check_circle" />
            Dados salvos com sucesso!
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full py-4 text-base disabled:opacity-50"
        >
          {saving ? (
            <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Salvando...</>
          ) : (
            <><MaterialIcon icon="save" size="sm" /> Salvar Alterações</>
          )}
        </button>
      </form>
    </div>
  );
}
