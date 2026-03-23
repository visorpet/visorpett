"use client";

import React from "react";
import { useUser } from "@/lib/supabase/useUser";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon } from "@/components/ui";

export default function AvaliacoesPage() {
  const { user } = useUser();
  const router = useRouter();

  return (
    <div className="page-container font-sans pb-24">
      <PageHeader
        title="Minhas Avaliações"
        showBack
        userAvatar={{
          name: user?.name || "Tutor",
          src: user?.image || undefined,
          href: "/cliente/perfil",
        }}
      />

      <div className="flex flex-col items-center justify-center py-24 text-center px-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center mb-5">
          <MaterialIcon icon="star" size="xl" className="text-amber-400" />
        </div>
        <h2 className="font-black text-gray-900 text-xl mb-2">Sem avaliações ainda</h2>
        <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xs">
          Após concluir um serviço, você poderá avaliar o pet shop. Suas avaliações ajudam outros tutores.
        </p>
        <button
          onClick={() => router.push("/cliente/agendamento")}
          className="mt-8 btn-primary px-8 py-3"
        >
          <MaterialIcon icon="calendar_add_on" size="sm" />
          Agendar um serviço
        </button>
      </div>
    </div>
  );
}
