"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function AreaTosadorPage() {
  const [activeTab, setActiveTab] = useState<"pendentes" | "concluidos">("pendentes");

  return (
    <div className="flex flex-col min-h-screen bg-bg-light pb-24">
      {/* ── Header ── */}
      <PageHeader
        title="Área do Tosador"
        showLogo={false}
        rightAction={{ icon: "person", label: "Perfil do Tosador" }}
        userAvatar={{ name: "Cleonice" }}
      />

      <div className="px-4 pt-6 pb-2 animate-fade-in">
        <h2 className="text-2xl font-bold leading-tight text-gray-900">Olá, Cleonice! 👋</h2>
        <p className="text-gray-500 font-medium mt-1">Sua agenda de hoje</p>
      </div>

      {/* ── Tabs ── */}
      <div className="px-4 mt-4">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("pendentes")}
            className={cn(
              "flex-1 py-3 font-bold text-sm transition-colors",
              activeTab === "pendentes"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-400 hover:text-gray-600 border-b-2 border-transparent"
            )}
          >
            Pendentes (3)
          </button>
          <button
            onClick={() => setActiveTab("concluidos")}
            className={cn(
              "flex-1 py-3 font-bold text-sm transition-colors",
              activeTab === "concluidos"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-400 hover:text-gray-600 border-b-2 border-transparent"
            )}
          >
            Concluídos hoje
          </button>
        </div>
      </div>

      {/* ── Tab View: Pendentes ── */}
      {activeTab === "pendentes" && (
        <div className="animate-slide-up mt-4">
          <div className="px-4">
            <p className="text-[11px] font-bold text-primary tracking-widest uppercase mb-2">
              Próximo Horário
            </p>
            {/* Próximo Atendimento Card */}
            <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
              <div className="relative h-48 w-full bg-blue-50 flex items-center justify-center">
                <div className="flex items-center justify-center w-full h-full text-blue-100">
                  <MaterialIcon icon="potted_plant" size="xl" className="!text-9xl opacity-20 absolute select-none" fill />
                  <div className="relative flex flex-col items-center">
                    <MaterialIcon icon="pets" className="!text-[120px] text-primary" fill />
                    <div className="absolute -top-4 -right-2 bg-white rounded-full p-2 shadow-sm">
                      <MaterialIcon icon="favorite" className="text-pink-400" fill />
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  10:30
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Jade</h3>
                    <p className="text-gray-500 font-medium">Poodle • Tosa Verão</p>
                  </div>
                </div>

                {/* Alerta */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 flex items-center gap-3">
                  <MaterialIcon icon="warning" className="text-amber-500" />
                  <p className="text-amber-800 text-sm font-semibold">⚠️ Alergia a perfume</p>
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-3">
                  <button className="w-full py-4 bg-primary text-white rounded-lg font-bold text-lg shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                    <MaterialIcon icon="play_arrow" />
                    Iniciar Atendimento
                  </button>
                  <button className="w-full py-3 bg-gray-100 text-gray-600 rounded-lg font-semibold text-base active:scale-[0.98] transition-transform hover:bg-gray-200">
                    Ver Detalhes do Pet
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Mais tarde</h3>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-xl shadow-card border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <MaterialIcon icon="cruelty_free" size="md" fill />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 text-lg">Thor</h4>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-bold text-gray-500 uppercase tracking-tighter">14:00</span>
                  </div>
                  <p className="text-gray-500 text-sm truncate">Golden Retriever • Banho</p>
                </div>
                <MaterialIcon icon="chevron_right" className="text-gray-300" />
              </div>

              <div className="bg-white p-4 rounded-xl shadow-card border border-gray-100 flex items-center gap-4 opacity-70">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <MaterialIcon icon="sound_detection_dog_barking" size="md" fill />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 text-lg">Mel</h4>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-bold text-gray-500 uppercase tracking-tighter">15:30</span>
                  </div>
                  <p className="text-gray-500 text-sm truncate">Shih Tzu • Tosa Higiênica</p>
                </div>
                <MaterialIcon icon="chevron_right" className="text-gray-300" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab View: Concluidos ── */}
      {activeTab === "concluidos" && (
        <div className="px-4 py-8 text-center animate-fade-in text-gray-500">
          <MaterialIcon icon="task_alt" size="xl" className="text-green-500/50 mb-3" />
          <p className="font-bold text-gray-800">Você ainda não concluiu atendimentos hoje.</p>
          <p className="text-sm mt-1">Inicie o seu próximo! 🐾</p>
        </div>
      )}
    </div>
  );
}
