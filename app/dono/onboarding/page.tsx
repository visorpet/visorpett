"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/ui";

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export default function DonoOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name:    "",
    phone:   "",
    address: "",
    city:    "",
    state:   "SP",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/petshops", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erro ao criar pet shop");
        return;
      }

      // Força refresh da sessão para atualizar user_metadata
      router.refresh();
      router.push("/dono/inicio");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-light flex flex-col">
      {/* Header */}
      <div className="bg-primary px-5 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <MaterialIcon icon="storefront" size="md" className="text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium">Bem-vindo ao Visorpet</p>
            <h1 className="text-white font-bold text-lg leading-tight">Configure seu Pet Shop</h1>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-white" : "bg-white/30"}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-white" : "bg-white/30"}`} />
        </div>
        <p className="text-white/70 text-xs mt-2">Passo {step} de 2</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 px-5 py-6 space-y-4">
        {step === 1 && (
          <>
            <div>
              <p className="text-gray-900 font-bold text-xl mb-1">Como se chama seu pet shop?</p>
              <p className="text-gray-500 text-sm mb-5">Este nome aparecerá para seus clientes.</p>

              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nome do Pet Shop <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ex: PetShop do João"
                required
                minLength={2}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Telefone / WhatsApp
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
                className="input w-full"
              />
            </div>

            <div className="pt-4">
              <button
                type="button"
                disabled={!form.name.trim()}
                onClick={() => setStep(2)}
                className="btn-primary w-full"
              >
                Continuar
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <p className="text-gray-900 font-bold text-xl mb-1">Onde fica seu pet shop?</p>
              <p className="text-gray-500 text-sm mb-5">Ajuda seus clientes a encontrarem você.</p>

              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Cidade <span className="text-red-500">*</span>
              </label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="São Paulo"
                required
                minLength={2}
                className="input w-full mb-3"
              />

              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                className="input w-full mb-3"
              >
                {ESTADOS_BR.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>

              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Endereço completo
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Rua, número, bairro"
                className="input w-full"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <MaterialIcon icon="error" size="sm" className="text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading || !form.city.trim()}
                className="btn-primary flex-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Criando...
                  </span>
                ) : (
                  "Criar Pet Shop"
                )}
              </button>
            </div>
          </>
        )}
      </form>

      {/* Footer hint */}
      <div className="px-5 pb-8 text-center">
        <p className="text-xs text-gray-400">
          Você pode editar essas informações depois em{" "}
          <span className="text-primary font-semibold">Configurações</span>
        </p>
      </div>
    </div>
  );
}
