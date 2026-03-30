"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Avatar } from "@/components/ui";

export default function NovoClientePage() {
  const router = useRouter();

  const [petShopId, setPetShopId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetch("/api/petshops/me")
      .then(r => r.json())
      .then(json => { if (json.data?.id) setPetShopId(json.data.id); });
  }, []);

  async function handleSave() {
    setError(null);
    if (!name.trim() || !phone.trim()) {
      setError("Nome e telefone são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.replace(/\D/g, ""),
          email: email.trim() || undefined,
          petShopId,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setCreated({ id: json.data.id, name: json.data.name });
      } else {
        setError(json.error ?? "Erro ao cadastrar cliente.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  /* ── Tela de sucesso ── */
  if (created) {
    return (
      <div className="page-container font-sans flex flex-col items-center justify-center min-h-[80vh] px-6 text-center gap-6 animate-slide-up">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <MaterialIcon icon="check_circle" size="xl" className="text-green-500" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-gray-900">Cliente cadastrado!</h2>
          <p className="text-gray-500 mt-1">{created.name} foi adicionado com sucesso.</p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => router.push(`/dono/agenda/novo?clientId=${created.id}`)}
            className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2"
          >
            <MaterialIcon icon="event_add" size="sm" />
            Agendar agora
          </button>
          <button
            onClick={() => router.push(`/dono/clientes/${created.id}`)}
            className="btn-secondary w-full py-4 rounded-2xl flex items-center justify-center gap-2"
          >
            <MaterialIcon icon="person" size="sm" />
            Ver perfil do cliente
          </button>
          <button
            onClick={() => router.push("/dono/clientes")}
            className="text-sm text-gray-400 font-medium py-2"
          >
            Voltar para clientes
          </button>
        </div>
      </div>
    );
  }

  /* ── Formulário ── */
  return (
    <div className="page-container font-sans pb-32">
      <PageHeader title="Novo Cliente" showBack />

      <div className="flex flex-col gap-6 py-4 animate-slide-up">

        {/* Avatar preview */}
        <div className="flex justify-center">
          <Avatar name={name || "?"} size="2xl" />
        </div>

        {/* Campos */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">
              Nome *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nome completo"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">
              Telefone / WhatsApp *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="(62) 99999-9999"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">
              E-mail <span className="text-gray-400 normal-case font-normal">(opcional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
            <MaterialIcon icon="error_outline" size="sm" className="text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* Botão fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-3 pb-6">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || !phone.trim() || !petShopId}
            className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {saving
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <MaterialIcon icon="person_add" size="sm" />
            }
            {saving ? "Cadastrando..." : "Cadastrar cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}
