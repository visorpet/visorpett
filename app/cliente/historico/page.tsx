"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/lib/supabase/useUser";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Badge } from "@/components/ui";
import { cn, formatDate, formatCurrency } from "@/lib/utils";
import type { AppointmentStatus } from "@/types";

type BadgeVariant = "primary" | "success" | "warning" | "danger" | "neutral" | "orange" | "purple";

const statusConfig: Record<AppointmentStatus, {
  label: string;
  variant: BadgeVariant;
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
  const { user } = useUser();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        setLoading(true);
        const res = await fetch("/api/appointments");
        const json = await res.json();
        if (json.data) {
          setAppointments(json.data);
        }
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
        setError("Não foi possível carregar seu histórico.");
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  const upcoming = appointments.filter(
    (a: any) => a.status === "agendado" || a.status === "confirmado" || a.status === "em_atendimento"
  );
  const past = appointments.filter(
    (a: any) => a.status === "concluido" || a.status === "cancelado" || a.status === "faltou"
  );

  if (loading) {
    return (
      <div className="page-container p-5 animate-pulse min-h-screen flex flex-col gap-6">
        <div className="w-1/2 h-8 bg-gray-200 rounded-md" />
        <div className="h-32 rounded-2xl bg-gray-200" />
        <div className="h-32 rounded-2xl bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Histórico"
        rightAction={{ icon: "notifications", label: "Notificações", href: "/cliente/notificacoes" }}
        userAvatar={{ 
          name: user?.name || "Tutor", 
          src: user?.image || undefined, 
          href: "/cliente/perfil" 
        }}
      />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm font-medium border border-red-100 flex gap-2 items-center">
            <MaterialIcon icon="error_outline" />
            {error}
        </div>
      )}

      {/* ── Próximos agendamentos ── */}
      {upcoming.length > 0 && (
        <section className="animate-slide-up">
          <p className="section-label mb-3">Próximos</p>
          <div className="flex flex-col gap-3">
            {upcoming.map((apt: any) => {
              const cfg = statusConfig[apt.status as AppointmentStatus];
              return (
                <div key={apt.id} className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900">{apt.service?.label || "Serviço"}</p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <MaterialIcon icon="pets" className="text-[12px]!" />
                        {apt.pet?.name || "Pet"}
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
                      {apt.date.split('T')[1]?.substring(0, 5) || "00:00"}
                    </div>
                    <div className="ml-auto font-bold text-primary text-sm">
                      {formatCurrency(apt.totalPrice)}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link
                      href={`https://wa.me/${apt.petShop?.phone || ""}`}
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
            {past.map((apt: any) => {
              const cfg = statusConfig[apt.status as AppointmentStatus];
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
                      <p className="font-semibold text-gray-900 text-sm">{apt.service?.label || "Serviço"}</p>
                      <p className="text-xs text-gray-500">
                        {apt.pet?.name || "Pet"} · {formatDate(apt.date, { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900 text-sm">{formatCurrency(apt.totalPrice)}</p>
                      <Badge variant={cfg.variant} className="text-[9px] mt-1">{cfg.label}</Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {appointments.length === 0 && !loading && (
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
