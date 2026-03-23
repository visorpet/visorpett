"use client";

import React, { useState } from "react";
import { useUser } from "@/lib/supabase/useUser";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, PhotoUpload } from "@/components/ui";

const SPECIES_OPTIONS = [
  { value: "cachorro", label: "Cachorro", icon: "pets" },
  { value: "gato", label: "Gato", icon: "cruelty_free" },
  { value: "passaro", label: "Pássaro", icon: "air" },
  { value: "roedor", label: "Roedor", icon: "pest_control_rodent" },
  { value: "outro", label: "Outro", icon: "help_outline" },
];

export default function NovoPetPage() {
  const { user } = useUser();
  const router = useRouter();

  const [species, setSpecies] = useState("");
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !species) {
      setError("Nome e espécie são obrigatórios.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          species,
          breed: breed || undefined,
          birthDate: birthDate || undefined,
          weight: weight ? parseFloat(weight) : undefined,
          notes: notes || undefined,
          photoUrl: photoUrl || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Erro ao cadastrar pet.");
      } else {
        router.push("/cliente/meus-pets");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container font-sans pb-24">
      <PageHeader
        title="Novo Pet"
        showBack
        userAvatar={{
          name: user?.name || "Tutor",
          src: user?.image || undefined,
          href: "/cliente/perfil",
        }}
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-2">
        {/* ── Foto do pet ── */}
        <section className="animate-slide-up flex justify-center">
          <PhotoUpload
            currentUrl={photoUrl}
            name={name || "Pet"}
            folder="pets"
            onUploaded={setPhotoUrl}
            size="xl"
            shape="circle"
            label="Adicionar foto do pet"
          />
        </section>

        {/* ── Escolha da espécie ── */}
        <section className="animate-slide-up">
          <p className="section-label mb-3">Qual o tipo do seu pet?</p>
          <div className="grid grid-cols-3 gap-3">
            {SPECIES_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSpecies(opt.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                  species === opt.value
                    ? "bg-primary/10 border-primary text-primary shadow-sm"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <MaterialIcon icon={opt.icon} size="lg" />
                <span className="text-xs font-bold">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Informações básicas ── */}
        <section className="animate-slide-up bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
          <p className="section-label">Informações do Pet</p>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Nome do pet <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Rex, Mel, Bella..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Raça
            </label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Ex: Golden Retriever, sem raça definida..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Peso (kg)
              </label>
              <input
                type="number"
                min="0.1"
                max="150"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Ex: 5.5"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Observações
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alergias, comportamento, cuidados especiais..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
            />
          </div>
        </section>

        {/* ── Erro ── */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex gap-2 items-center">
            <MaterialIcon icon="error_outline" />
            {error}
          </div>
        )}

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={loading || !name || !species}
          className="btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Cadastrando...
            </>
          ) : (
            <>
              <MaterialIcon icon="pets" size="sm" />
              Cadastrar Pet
            </>
          )}
        </button>
      </form>
    </div>
  );
}
