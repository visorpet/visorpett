"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Badge } from "@/components/ui";
import { cn, formatDate, formatCurrency } from "@/lib/utils";
import { mockAppointments } from "@/lib/mocks/appointments";
import type { AppointmentStatus } from "@/types";

const userId = "user-client-001";

const statusConfig: Record<AppointmentStatus, {
  label: string;
  variant: "success" | "warning" | "primary" | "neutral" | "danger" | "orange";
  icon: string;
}> = {
  agendado:       { label: "Agendado",       variant: "primary",  icon: "event" },
  confirmado:     { label: "Confirmado",     variant: "success",  icon: "check_circle" },
  em_atendimento: { label: "Em atendimento", variant: "orange",   icon: "timer" },
  concluido:      { label: "Concluído",      variant: "success",  icon: "task_alt" },
  cancelado:      { label: "Cancelado",      variant: "danger",   icon: "cancel" },
  faltou:         { label: "Faltou",         variant: "neutral",  icon: "event_busy" },
};

export default function HistoricoPage() {
  const myAppointments = mockAppointments
    .filter((a) => a.ownerId === userId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const upcoming = myAppointments.filter(
    (a) => a.status === "agendado" || a.status === "confirmado"
  );
  const past = myAppointments.filter(
    (a) => a.status === "concluido" || a.status === "cancelado" || a.status === "faltou"
  );

  return (
    <div className="page-container">
      <PageHeader
        title="Histórico"
        rightAction={{ icon: "notifications", label: "Notificações" }}
        userAvatar={{ name: "Ana Souza", href: "/cliente/perfil" }}
      />

      {/* ── Próximos agendamentos ── */}
      {upcoming.length > 0 && (
        <section className="animate-slide-up">
          <p className="section-label mb-3">Próximos</p>
          <div className="flex flex-col gap-3">
            {upcoming.map((apt) => {
              const cfg = statusConfig[apt.status];
              return (
                <div key={apt.id} className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900">{apt.serviceLabel}</p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <MaterialIcon icon="pets" className="text-[12px]!" />
                        {apt.petName}
                      </p>
                    </div>
                    <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
                  </div>

                  <div className="flex items-center gap-3 py-3 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MaterialIcon icon="calendar_today" className="text-[13px]!" />
                      {formatDate(apt.date)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MaterialIcon icon="schedule" className="text-[13px]!" />
                      {apt.time}
                    </div>
                    <div className="ml-auto font-bold text-primary text-sm">
                      {formatCurrency(apt.price)}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link
                      href={`https://wa.me/55${apt.ownerPhone}`}
                      target="_blank"
                      className="btn-whatsapp flex-1 text-xs py-2 justify-center"
                    >
                      <MaterialIcon icon="chat" size="xs" />
                      WhatsApp
                    </Link>
                    <Link
                      href={`/cliente/agendamento/${apt.id}`}
                      className="btn-secondary flex-1 text-xs py-2 justify-center"
                    >
                      <MaterialIcon icon="edit_calendar" size="xs" />
                      Detalhes
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Histórico passado ── */}
      {past.length > 0 && (
        <section className="animate-slide-up">
          <p className="section-label mb-3">Anteriores</p>
          <div className="flex flex-col gap-2">
            {past.map((apt) => {
              const cfg = statusConfig[apt.status];
              return (
                <div
                  key={apt.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      apt.status === "concluido" ? "bg-green-100" : "bg-red-50"
                    )}>
                      <MaterialIcon
                        icon={cfg.icon}
                        size="sm"
                        className={apt.status === "concluido" ? "text-green-600" : "text-red-400"}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{apt.serviceLabel}</p>
                      <p className="text-xs text-gray-500">
                        {apt.petName} · {formatDate(apt.date, { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900 text-sm">{formatCurrency(apt.price)}</p>
                      <Badge variant={cfg.variant} className="text-[9px] mt-1">{cfg.label}</Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {myAppointments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <MaterialIcon icon="calendar_today" size="xl" className="text-gray-300 mb-4" />
          <p className="font-bold text-gray-500 mb-1">Nenhum agendamento</p>
          <p className="text-sm text-gray-400 mb-4">Agende o primeiro serviço do seu pet!</p>
          <Link href="/cliente/agendamento" className="btn-primary">
            <MaterialIcon icon="add" size="sm" />
            Agendar agora
          </Link>
        </div>
      )}
    </div>
  );
}
