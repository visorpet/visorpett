"use client";

import React from "react";
import { useUser } from "@/lib/supabase/useUser";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon } from "@/components/ui";

export default function IndicacoesPage() {
  const { user } = useUser();

  const referralCode = "VISO-" + (user?.name?.toUpperCase().slice(0, 4) || "USER");

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
  };

  return (
    <div className="page-container font-sans pb-24">
      <PageHeader
        title="Indicações"
        showBack
        userAvatar={{
          name: user?.name || "Tutor",
          src: user?.image || undefined,
          href: "/cliente/perfil",
        }}
      />

      {/* Hero */}
      <section className="mt-4 animate-slide-up">
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -left-4 -bottom-6 w-24 h-24 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MaterialIcon icon="redeem" size="xl" className="text-white" fill />
            </div>
            <h2 className="text-2xl font-black mb-2">Programa de Indicações</h2>
            <p className="text-white/80 text-sm font-medium">
              Indique amigos e ganhe descontos exclusivos em serviços para o seu pet!
            </p>
          </div>
        </div>
      </section>

      {/* Código de indicação */}
      <section className="mt-6 animate-slide-up">
        <p className="section-label mb-3">Seu código de indicação</p>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 mb-3">
            <span className="font-black text-xl text-primary tracking-widest">{referralCode}</span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors"
            >
              <MaterialIcon icon="content_copy" size="sm" />
              Copiar
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center font-medium">
            Compartilhe esse código com seus amigos para ganhar recompensas
          </p>
        </div>
      </section>

      {/* Como funciona */}
      <section className="mt-6 animate-slide-up">
        <p className="section-label mb-3">Como funciona</p>
        <div className="flex flex-col gap-3">
          {[
            { icon: "share", title: "Compartilhe seu código", desc: "Envie seu código único para um amigo" },
            { icon: "person_add", title: "Amigo se cadastra", desc: "Seu amigo usa o código ao criar a conta" },
            { icon: "star", title: "Vocês dois ganham", desc: "Ambos recebem desconto no próximo serviço" },
          ].map((step, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MaterialIcon icon={step.icon} size="sm" className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{step.title}</p>
                <p className="text-xs text-gray-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Histórico */}
      <section className="mt-6 animate-slide-up">
        <p className="section-label mb-3">Suas indicações</p>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <MaterialIcon icon="group" size="xl" className="text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium text-sm">Nenhuma indicação ainda</p>
          <p className="text-gray-400 text-xs mt-1">Comece compartilhando seu código!</p>
        </div>
      </section>
    </div>
  );
}
