"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Badge, Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";

type Appointment = {
  id: string;
  date: string;
  status: string;
  pet: { name: string; breed?: string | null };
  service: { label: string };
  groomer?: { name: string } | null;
};

const STATUS_MAP: Record<string, { label: string; variant: string }> = {
  agendado:       { label: "Agendado",      variant: "primary" },
  confirmado:     { label: "Confirmado",    variant: "primary" },
  em_atendimento: { label: "Em Atendimento", variant: "warning" },
  concluido:      { label: "Concluído",     variant: "success" },
  cancelado:      { label: "Cancelado",     variant: "danger" },
  faltou:         { label: "Faltou",        variant: "neutral" },
};

export default function AgendaPage() {
  const [selectedGroomer, setSelectedGroomer] = useState("Todos");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const weekDays = useMemo(() => {
    const today = new Date();
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay();
    const firstDayOfWeek = new Date(curr);
    firstDayOfWeek.setDate(curr.getDate() - dayOfWeek);

    const days = [];
    const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(firstDayOfWeek);
      d.setDate(firstDayOfWeek.getDate() + i);
      days.push({
        label: labels[i],
        value: d.getDate(),
        fullDate: new Date(d),
        isToday: d.toDateString() === today.toDateString(),
      });
    }
    return days;
  }, [currentDate]);

  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  useEffect(() => {
    const dateStr = selectedDay.toISOString().split("T")[0];
    setLoading(true);
    fetch(`/api/appointments?date=${dateStr}`)
      .then((r) => r.json())
      .then((json) => setAppointments(json.data ?? []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [selectedDay]);

  const groomers = useMemo(() => {
    const names = new Set(appointments.map((a) => a.groomer?.name).filter(Boolean) as string[]);
    return ["Todos", ...Array.from(names)];
  }, [appointments]);

  const filtered = appointments.filter(
    (a) => selectedGroomer === "Todos" || a.groomer?.name === selectedGroomer
  );

  return (
    <div className="flex flex-col min-h-screen bg-bg-light pb-24">
      <PageHeader
        title="Pet Flow"
        showLogo={false}
        rightAction={{ icon: "notifications", label: "Notificações", href: "/dono/notificacoes", badge: 0 }}
      />

      {/* Calendar Header */}
      <div className="bg-white border-b border-primary/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{capitalizedMonth}</h2>
          <div className="flex gap-1">
            <button
              onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); }}
              className="p-1 hover:bg-primary/10 rounded-lg text-gray-500 transition-colors"
            >
              <MaterialIcon icon="chevron_left" size="sm" />
            </button>
            <button
              onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); }}
              className="p-1 hover:bg-primary/10 rounded-lg text-gray-500 transition-colors"
            >
              <MaterialIcon icon="chevron_right" size="sm" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map((d) => (
            <div key={d.label} className="text-xs font-semibold text-gray-400 uppercase">
              {d.label}
            </div>
          ))}
          {weekDays.map((d) => (
            <button
              key={d.value}
              onClick={() => setSelectedDay(d.fullDate)}
              className={cn(
                "p-2 flex flex-col items-center mt-1 transition-all rounded-lg",
                d.fullDate.toDateString() === selectedDay.toDateString()
                  ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                  : "hover:bg-gray-100 text-gray-700 font-medium"
              )}
            >
              {d.isToday && d.fullDate.toDateString() === selectedDay.toDateString() && (
                <span className="text-[10px] opacity-80 uppercase font-bold tracking-widest leading-none mb-0.5">
                  Hoje
                </span>
              )}
              <span className={cn(
                "text-sm font-medium leading-none",
                d.fullDate.toDateString() === selectedDay.toDateString() && "font-bold text-base mt-0.5"
              )}>
                {d.value}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filtros por tosador */}
      <div className="p-4 flex gap-3 overflow-x-auto no-scrollbar">
        {groomers.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGroomer(g)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm flex-shrink-0 transition-colors",
              selectedGroomer === g
                ? "bg-primary/10 text-primary border border-primary/20 font-bold"
                : "bg-white border border-gray-200 text-gray-600 font-medium hover:border-gray-300"
            )}
          >
            {g === "Todos" && <MaterialIcon icon="filter_list" size="sm" />}
            {g}
          </button>
        ))}
      </div>

      {/* Lista de Agendamentos */}
      <div className="px-4 space-y-3">
        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">
          Compromissos · {filtered.length}
        </h3>

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-xl animate-pulse h-20 border border-gray-100" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-10">
            <MaterialIcon icon="event_busy" size="xl" className="text-gray-300 mb-2" />
            <p className="text-gray-500 font-medium">Nenhum agendamento neste dia.</p>
          </div>
        ) : (
          filtered.map((apt) => {
            const time = new Date(apt.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
            const isFinished = apt.status === "concluido" || apt.status === "cancelado" || apt.status === "faltou";
            const statusInfo = STATUS_MAP[apt.status] ?? { label: apt.status, variant: "neutral" };

            return (
              <div
                key={apt.id}
                className={cn(
                  "bg-white p-4 rounded-xl shadow-card flex items-start gap-4 transition-all duration-200",
                  isFinished
                    ? "opacity-70 border border-gray-100 bg-gray-50"
                    : "border border-primary/5 hover:shadow-card-hover hover:-translate-y-0.5"
                )}
              >
                <div className="text-center min-w-[50px] flex flex-col items-center pt-0.5">
                  <p className={cn("text-sm font-bold", isFinished ? "text-gray-400" : "text-primary")}>
                    {time}
                  </p>
                  {!isFinished && <div className="w-px h-12 bg-gray-100 mx-auto my-1.5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={cn("font-bold text-lg truncate", isFinished ? "line-through text-gray-400" : "text-gray-900")}>
                      {apt.pet.name}
                      {apt.pet.breed && (
                        <span className="text-sm font-normal text-gray-500"> — {apt.pet.breed}</span>
                      )}
                    </h4>
                    <Badge variant={statusInfo.variant as any} className="text-[10px] ml-2">
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
                    <MaterialIcon icon={isFinished ? "health_and_safety" : "content_cut"} className="text-[15px]!" />
                    {apt.service.label}
                  </p>

                  {apt.groomer && !isFinished && (
                    <div className="flex items-center gap-2 mt-2 pt-3 border-t border-gray-50">
                      <Avatar name={apt.groomer.name} size="xs" />
                      <span className="text-xs font-semibold text-gray-500">
                        Tosador(a): {apt.groomer.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Link
        href="/dono/agenda/novo"
        className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40"
      >
        <MaterialIcon icon="add" size="lg" />
      </Link>
    </div>
  );
}
