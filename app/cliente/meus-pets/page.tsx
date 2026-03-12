"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, ProgressBar } from "@/components/ui";

type Pet = {
  id: string;
  name: string;
  species: string;
  breed?: string;
  weight?: number;
};

function PetCard({ pet }: { pet: Pet }) {
  const icon = pet.species.toLowerCase() === "gato" ? "cruelty_free" : "pets";
  const speciesLabel = pet.species.toLowerCase() === "cachorro" ? "Cão" : pet.species.toLowerCase() === "gato" ? "Gato" : pet.species;

  return (
    <Link
      href={`/cliente/meus-pets/${pet.id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 p-4 flex items-center gap-4"
    >
      {/* Pet icon */}
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
        <MaterialIcon icon={icon} size="lg" className="text-primary" fill />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-base">{pet.name}</p>
        <p className="text-sm text-gray-500">
          {speciesLabel}
          {pet.breed ? ` • ${pet.breed}` : ""}
          {pet.weight ? ` • ${pet.weight}kg` : ""}
        </p>
      </div>

      <MaterialIcon icon="chevron_right" size="sm" className="text-gray-300 flex-shrink-0" />
    </Link>
  );
}

export default function MeusPetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPets() {
      try {
        const response = await fetch("/api/pets");
        const json = await response.json();
        if (json.data) {
          setPets(json.data);
        }
      } catch (error) {
        console.error("Erro ao buscar pets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPets();
  }, []);

  return (
    <div className="page-container">
      <PageHeader
        title="Meus Pets"
        showLogo={false}
        rightAction={{ icon: "notifications", label: "Notificações", badge: 1 }}
        userAvatar={{ name: "Tutor", href: "/cliente/perfil" }}
      />

      <section className="animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <p className="section-label">
            {loading ? "Carregando..." : `${pets.length} ${pets.length === 1 ? "pet cadastrado" : "pets cadastrados"}`}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {!loading && pets.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">Você ainda não possui pets cadastrados.</p>
          )}

          {!loading && pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}

          {/* Add pet button */}
          <Link
            href="/cliente/meus-pets/novo" // NOTE: This route needs to be created next
            className="flex items-center gap-3 bg-white rounded-2xl border-2 border-dashed border-gray-200 p-4 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group mt-2"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <MaterialIcon icon="add" size="lg" className="text-gray-400 group-hover:text-primary" />
            </div>
            <div>
              <p className="font-bold text-gray-500 group-hover:text-primary transition-colors">Adicionar novo pet</p>
              <p className="text-xs text-gray-400">Cadastre seu companheiro</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
