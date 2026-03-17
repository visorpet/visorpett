"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Badge, Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";

/* ─── Mock dados de agenda ─── */
const groomers = ["Todos Tosadores", "Ana Silva", "João Pedro"];

const appointments = [
  {
    id: "ap-1",
    time: "09:00",
    petName: "Jade",
    breed: "Buldog",
    status: "Confirmado",
    statusColor: "primary",
    service: "Banho e Tosa Completa",
    groomer: "Ana Silva",
    isFinished: false,
  },
  {
    id: "ap-2",
    time: "10:30",
    petName: "Luna",
    breed: "Persa",
    status: "Aguardando",
    statusColor: "warning",
    service: "Apenas Banho",
    groomer: "João Pedro",
    isFinished: false,
  },
  {
    id: "ap-3",
    time: "08:00",
    petName: "Bento",
    breed: "Beagle",
    status: "Concluído",
    statusColor: "success",
    service: "Corte de Unhas",
    groomer: "Ana Silva",
    isFinished: true,
  },
];

/* ─── Componentes ─── */
export default function AgendaPage() {
  const [selectedGroomer, setSelectedGroomer] = useState("Todos Tosadores");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());

  const weekDays = useMemo(() => {
    const today = new Date();
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay(); // 0-6
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
           isToday: d.toDateString() === today.toDateString(),
        });
    }
    return days;
  }, [currentDate]);
  
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return (
    <div className="flex flex-col min-h-screen bg-bg-light pb-24">
      <PageHeader
        title="Pet Flow"
        showLogo={false}
        rightAction={{ icon: "notifications", label: "Notificações", href: "/dono/notificacoes", badge: 1 }}
      >
        {/* Usamos absolute/flex para sobrescrever o estilo padrão se necessário ou só deixar padrão */}
      </PageHeader>

      {/* ── Calendar Header ── */}
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

        {/* Row de semana */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map((d) => (
            <div key={d.label} className="text-xs font-semibold text-gray-400 uppercase">
              {d.label}
            </div>
          ))}
          {weekDays.map((d) => (
            <button
              key={d.value}
              onClick={() => setSelectedDay(d.value)}
              className={cn(
                "p-2 flex flex-col items-center mt-1 transition-all rounded-lg",
                d.value === selectedDay
                  ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                  : "hover:bg-gray-100 text-gray-700 font-medium"
              )}
            >
              {d.isToday && d.value === selectedDay && (
                <span className="text-[10px] opacity-80 uppercase font-bold tracking-widest leading-none mb-0.5">
                  Hoje
                </span>
              )}
              <span className={cn(
                "text-sm font-medium leading-none",
                d.value === selectedDay && "font-bold text-base mt-0.5"
              )}>
                {d.value}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Filtros horizontais ── */}
      <div className="p-4 flex gap-3 overflow-x-auto no-scrollbar">
        {groomers.map((g, idx) => (
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
            {idx === 0 && <MaterialIcon icon="filter_list" size="sm" />}
            {g}
          </button>
        ))}
      </div>

      {/* ── Lista de Agendamentos ── */}
      <div className="px-4 space-y-3">
        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">
          Compromissos
        </h3>

        {appointments
          // filtra simplificado baseado no groomer
          .filter((a) => selectedGroomer === "Todos Tosadores" || a.groomer === selectedGroomer)
          .map((apt) => (
            <div
              key={apt.id}
              className={cn(
                "bg-white p-4 rounded-xl shadow-card flex items-start gap-4 transition-all duration-200",
                apt.isFinished ? "opacity-70 border border-gray-100 bg-gray-50" : "border border-primary/5 hover:shadow-card-hover hover:-translate-y-0.5"
              )}
            >
              {/* Timeline left */}
              <div className="text-center min-w-[50px] flex flex-col items-center pt-0.5">
                <p className={cn(
                  "text-sm font-bold",
                  apt.isFinished ? "text-gray-400" : "text-primary"
                )}>
                  {apt.time}
                </p>
                {!apt.isFinished && <div className="w-px h-12 bg-gray-100 mx-auto my-1.5" />}
              </div>

              {/* Content box */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={cn("font-bold text-lg truncate", apt.isFinished ? "line-through text-gray-400" : "text-gray-900")}>
                    {apt.petName} <span className="text-sm font-normal text-gray-500">— {apt.breed}</span>
                  </h4>
                  <Badge variant={apt.statusColor as any} className="text-[10px] ml-2">
                    {apt.status}
                  </Badge>
                </div>
                <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
                  <MaterialIcon icon={apt.isFinished ? "health_and_safety" : "content_cut"} className="text-[15px]!" />
                  {apt.service}
                </p>

                {!apt.isFinished && (
                  <div className="flex items-center gap-2 mt-2 pt-3 border-t border-gray-50">
                    <Avatar name={apt.groomer} size="xs" />
                    <span className="text-xs font-semibold text-gray-500">
                      Tosador(a): {apt.groomer}
                    </span>
                  </div>
                )}
              </div>
            </div>
        ))}
      </div>

      {/* ── FAB Add ── */}
      <Link
        href="/dono/agenda/novo"
        className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40"
      >
        <MaterialIcon icon="add" size="lg" />
      </Link>
    </div>
  );
}
