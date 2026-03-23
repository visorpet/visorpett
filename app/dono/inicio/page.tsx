"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { usePetShop } from "../_petshop-context";
import { StatCard, BarChart, Badge, Avatar, MaterialIcon } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import type { AppointmentStatus } from "@/types";

/* ─── Status config ─── */
const statusConfig: Record<AppointmentStatus, { label: string; variant: "success" | "warning" | "primary" | "neutral" | "danger" | "orange" }> = {
  agendado:       { label: "Agendado",       variant: "primary"  },
  confirmado:     { label: "Confirmado",     variant: "success"  },
  em_atendimento: { label: "Em atendimento", variant: "orange"   },
  concluido:      { label: "Concluído",      variant: "success"  },
  cancelado:      { label: "Cancelado",      variant: "danger"   },
  faltou:         { label: "Faltou",         variant: "neutral"  },
};

type ChartDay = { label: string; value: number; isCurrent?: boolean; isHighlight?: boolean };
type InactiveClient = { clientId: string; clientName: string; phone: string; petName: string; daysSince: number | null };

/* ─── Appointment row ─── */
function AppointmentRow({ appointment }: { appointment: any }) {
  const cfg = statusConfig[appointment.status as AppointmentStatus] ?? statusConfig["agendado"];
  const time = new Date(appointment.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <Link
      href={`/dono/agenda/${appointment.id}`}
      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
    >
      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
        <MaterialIcon icon="pets" size="sm" className="text-primary" fill />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm text-gray-900 truncate">{appointment.pet?.name ?? "Pet"}</p>
          <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
        </div>
        <p className="text-xs text-gray-500 truncate">{appointment.service?.label ?? "Serviço"} · {time}</p>
      </div>
      <p className="text-sm font-bold text-gray-700 flex-shrink-0">
        {formatCurrency(appointment.totalPrice)}
      </p>
    </Link>
  );
}

/* ─── Skeleton ─── */
function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-gray-200 rounded-xl animate-pulse ${className}`} />;
}

export default function DonoInicioPage() {
  const [petShop, setPetShop]                 = useState<any>(null);
  const [appointments, setAppointments]       = useState<any[]>([]);
  const [metrics, setMetrics]                 = useState<any>(null);
  const [chartData, setChartData]             = useState<ChartDay[]>([]);
  const [inactiveClients, setInactiveClients] = useState<InactiveClient[]>([]);
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const today = new Date().toISOString().split("T")[0];

        const [shopRes, apptRes, metricsRes, chartRes, inactiveRes] = await Promise.all([
          fetch("/api/petshops/me"),
          fetch(`/api/appointments?date=${today}`),
          fetch("/api/dono/metrics"),
          fetch("/api/dono/weekly-chart"),
          fetch("/api/dono/inactive-clients"),
        ]);

        const [shopJson, apptJson, metricsJson, chartJson, inactiveJson] = await Promise.all([
          shopRes.json(),
          apptRes.json(),
          metricsRes.json(),
          chartRes.json(),
          inactiveRes.json(),
        ]);

        setPetShop(shopJson.data ?? null);
        setAppointments(apptJson.data ?? []);
        setMetrics(metricsJson.data ?? null);
        setChartData(chartJson.data ?? []);
        setInactiveClients(inactiveJson.data ?? []);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const { shopMeta } = usePetShop();
  const shopName      = shopMeta.name ?? petShop?.name ?? "Meu PetShop";
  const shopLogo      = shopMeta.logoUrl ?? petShop?.logoUrl;
  const monthRevenue  = metrics?.monthRevenue ?? 0;
  const inService     = metrics?.inService ?? 0;
  const inactiveCount = metrics?.inactiveClients ?? 0;

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <PageHeader
        title={shopName}
        subtitle="Visão Geral"
        userAvatar={{ src: shopLogo, name: shopName, href: "/dono/perfil" }}
        rightAction={{ icon: "notifications", label: "Notificações", href: "/dono/perfil" }}
      />

      {/* ── KPI Cards ── */}
      <section className="animate-slide-up">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon="event"
              label="Hoje"
              value={appointments.length}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />
            <StatCard
              icon="attach_money"
              label="Receita do mês"
              value={formatCurrency(monthRevenue)}
              iconBg="bg-emerald-100"
              iconColor="text-emerald-600"
            />
            <StatCard
              icon="content_cut"
              label="Em atendimento"
              value={inService}
              iconBg="bg-amber-100"
              iconColor="text-amber-600"
            />
            <StatCard
              icon="warning"
              label="Reativar clientes"
              value={inactiveCount}
              trend="há 30+ dias"
              trendDirection="down"
              iconBg="bg-red-100"
              iconColor="text-red-500"
              onClick={() => {}}
            />
          </div>
        )}
      </section>

      {/* ── Weekly chart ── */}
      <section className="animate-slide-up">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-gray-900 text-sm">Agendamentos</p>
              <p className="text-xs text-gray-500">Esta semana</p>
            </div>
            <Link href="/dono/financeiro" className="text-xs text-primary font-bold">
              Ver relatório
            </Link>
          </div>
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <BarChart data={chartData} showLabels showValues height="md" />
          )}
        </div>
      </section>

      {/* ── Today's agenda ── */}
      <section className="animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <p className="section-label">Agenda de hoje</p>
          <Link href="/dono/agenda" className="text-xs text-primary font-bold">
            Ver tudo
          </Link>
        </div>
        <div className="card space-y-2">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : appointments.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">
              Nenhum agendamento para hoje.
            </p>
          ) : (
            appointments.map((apt) => <AppointmentRow key={apt.id} appointment={apt} />)
          )}
        </div>
      </section>

      {/* ── Automação de Retorno (dados reais) ── */}
      {!loading && inactiveClients.length > 0 && (
        <section className="animate-slide-up space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <MaterialIcon icon="auto_mode" size="md" className="text-primary" />
              Automação de Retorno
            </h2>
            <Link href="/dono/clientes?filter=inactive" className="text-primary text-sm font-semibold hover:underline">
              Ver todos ({inactiveCount})
            </Link>
          </div>

          <div className="space-y-3">
            {inactiveClients.slice(0, 3).map((client) => (
              <div
                key={client.clientId}
                className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar name={client.petName} size="md" />
                    <span className="absolute bottom-0 right-0 bg-emerald-500 w-3 h-3 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900">{client.petName}</p>
                    <div className="flex items-center gap-1 text-red-500">
                      <MaterialIcon icon="schedule" size="xs" />
                      <p className="text-sm font-medium leading-none">
                        {client.daysSince !== null
                          ? `${client.daysSince} dias sem visita`
                          : "Sem visita registrada"}
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  href={`https://wa.me/${client.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Olá ${client.clientName}, notamos que o ${client.petName} está há ${client.daysSince ?? "alguns"} dias sem visita no nosso PetShop. Que tal agendar?`
                  )}`}
                  target="_blank"
                  className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-[#25D366] hover:bg-[#20bd5a]"
                >
                  <MaterialIcon icon="chat" size="xs" />
                  Enviar
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
