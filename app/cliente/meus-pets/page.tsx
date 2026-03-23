"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser } from "@/lib/supabase/useUser";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon } from "@/components/ui";

type Pet = {
  id: string;
  name: string;
  species: string;
  breed?: string;
  weight?: number;
  photoUrl?: string | null;
};

function PetCard({ pet }: { pet: Pet }) {
  const icon = pet.species.toLowerCase() === "gato" ? "cruelty_free" : "pets";
  const speciesLabel =
    pet.species.toLowerCase() === "cachorro"
      ? "Cão"
      : pet.species.toLowerCase() === "gato"
      ? "Gato"
      : pet.species;

  return (
    <Link
      href={`/cliente/meus-pets/${pet.id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Foto ou ícone */}
      <div className="w-full aspect-square bg-primary/10 flex items-center justify-center overflow-hidden">
        {pet.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
        ) : (
          <MaterialIcon icon={icon} size="xl" className="text-primary" fill />
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex items-center justify-between">
        <div className="min-w-0">
          <p className="font-bold text-gray-900 truncate">{pet.name}</p>
          <p className="text-xs text-gray-500 truncate">
            {speciesLabel}
            {pet.breed ? ` · ${pet.breed}` : ""}
            {pet.weight ? ` · ${pet.weight}kg` : ""}
          </p>
        </div>
        <MaterialIcon icon="chevron_right" size="sm" className="text-gray-300 flex-shrink-0 ml-1" />
      </div>
    </Link>
  );
}

export default function MeusPetsPage() {
  const { user } = useUser();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pets")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setPets(json.data);
        else if (json.error) setError(json.error);
      })
      .catch(() => setError("Não foi possível carregar seus pets."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container p-5 animate-pulse min-h-screen flex flex-col gap-6">
        <div className="w-1/2 h-8 bg-gray-200 rounded-md" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-44 rounded-2xl bg-gray-200" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pb-24">
      <PageHeader
        title="Meus Pets"
        rightAction={{ icon: "add", label: "Novo Pet", href: "/cliente/meus-pets/novo" }}
        userAvatar={{ name: user?.name || "Tutor", src: user?.image || undefined, href: "/cliente/perfil" }}
      />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm font-medium border border-red-100 flex gap-2 items-center">
          <MaterialIcon icon="error_outline" />
          {error}
        </div>
      )}

      <section className="animate-slide-up">
        <p className="section-label mb-3">
          {pets.length} {pets.length === 1 ? "pet cadastrado" : "pets cadastrados"}
        </p>

        <div className="grid grid-cols-2 gap-4">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}

          {/* Botão adicionar */}
          <Link
            href="/cliente/meus-pets/novo"
            className="flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group aspect-square"
          >
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <MaterialIcon icon="add" size="lg" className="text-gray-400 group-hover:text-primary" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-500 group-hover:text-primary transition-colors text-sm">Adicionar pet</p>
              <p className="text-xs text-gray-400">Cadastre seu companheiro</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
