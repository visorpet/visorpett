"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";

type Appointment = {
  id: string;
  date: string;
  status: string;
  notes?: string | null;
  pet: { name: string; breed?: string | null; species: string };
  service: { label: string };
  groomer?: { name: string } | null;
};

export default function AreaTosadorPage() {
  const [activeTab, setActiveTab] = useState<"pendentes" | "concluidos">("pendentes");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/appointments?date=${today}`)
      .then((r) => r.json())
      .then((json) => setAppointments(json.data ?? []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  const pending = appointments.filter(
    (a) => a.status === "agendado" || a.status === "confirmado"
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const done = appointments.filter((a) => a.status === "concluido" || a.status === "em_atendimento");

  const nextAppointment = pending[0];
  const remaining = pending.slice(1);

  return (
    <div className="flex flex-col min-h-screen bg-bg-light pb-24">
      <PageHeader
        title="Área do Tosador"
        showLogo={false}
        rightAction={{ icon: "person", label: "Perfil do Tosador" }}
      />

      <div className="px-4 pt-6 pb-2 animate-fade-in">
        <h2 className="text-2xl font-bold leading-tight text-gray-900">Sua agenda de hoje</h2>
        <p className="text-gray-500 font-medium mt-1">
          {loading ? "Carregando..." : `${pending.length} pendente${pending.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Tabs */}
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
            Pendentes ({pending.length})
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
            Concluídos hoje ({done.length})
          </button>
        </div>
      </div>

      {/* Tab: Pendentes */}
      {activeTab === "pendentes" && (
        <div className="animate-slide-up mt-4">
          {loading ? (
            <div className="px-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-24 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : pending.length === 0 ? (
            <div className="px-4 py-10 text-center text-gray-500">
              <MaterialIcon icon="event_available" size="xl" className="text-green-400/50 mb-3" />
              <p className="font-bold text-gray-800">Sem pendências hoje!</p>
              <p className="text-sm mt-1">Todos os agendamentos foram atendidos. 🎉</p>
            </div>
          ) : (
            <>
              <div className="px-4">
                <p className="text-[11px] font-bold text-primary tracking-widest uppercase mb-2">
                  Próximo Horário
                </p>
                {/* Próximo Atendimento Card */}
                <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
                  <div className="relative h-48 w-full bg-blue-50 flex items-center justify-center">
                    <div className="relative flex flex-col items-center">
                      <MaterialIcon icon="pets" className="!text-[120px] text-primary" fill />
                    </div>
                    <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      {new Date(nextAppointment.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{nextAppointment.pet.name}</h3>
                        <p className="text-gray-500 font-medium">
                          {nextAppointment.pet.breed ?? nextAppointment.pet.species} • {nextAppointment.service.label}
                        </p>
                      </div>
                    </div>

                    {nextAppointment.notes && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 flex items-center gap-3">
                        <MaterialIcon icon="warning" className="text-amber-500" />
                        <p className="text-amber-800 text-sm font-semibold">{nextAppointment.notes}</p>
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <button className="w-full py-4 bg-primary text-white rounded-lg font-bold text-lg shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                        <MaterialIcon icon="play_arrow" />
                        Iniciar Atendimento
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {remaining.length > 0 && (
                <div className="px-4 py-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Mais tarde</h3>
                  <div className="space-y-3">
                    {remaining.map((apt) => (
                      <div key={apt.id} className="bg-white p-4 rounded-xl shadow-card border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <MaterialIcon icon="pets" size="md" fill />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900 text-lg">{apt.pet.name}</h4>
                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-bold text-gray-500 uppercase tracking-tighter">
                              {new Date(apt.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-gray-500 text-sm truncate">
                            {apt.pet.breed ?? apt.pet.species} • {apt.service.label}
                          </p>
                        </div>
                        <MaterialIcon icon="chevron_right" className="text-gray-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab: Concluídos */}
      {activeTab === "concluidos" && (
        <div className="px-4 py-4 animate-fade-in">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-16 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : done.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <MaterialIcon icon="task_alt" size="xl" className="text-green-500/50 mb-3" />
              <p className="font-bold text-gray-800">Você ainda não concluiu atendimentos hoje.</p>
              <p className="text-sm mt-1">Inicie o seu próximo! 🐾</p>
            </div>
          ) : (
            <div className="space-y-3">
              {done.map((apt) => (
                <div key={apt.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 opacity-80">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <MaterialIcon icon="check" className="text-green-600" size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm line-through">{apt.pet.name}</p>
                    <p className="text-gray-400 text-xs">{apt.service.label}</p>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {new Date(apt.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
