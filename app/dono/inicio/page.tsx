"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard, BarChart, Badge, Avatar, MaterialIcon } from "@/components/ui";
import { formatCurrency, formatDate, formatDateShort } from "@/lib/utils";
import { mockAppointments } from "@/lib/mocks/appointments";
import type { AppointmentStatus } from "@/types";

/* ─── Mock pet shop ─── */
const mockPetShop = {
  id: "shop-001",
  name: "PetLove Moema",
  logoUrl: undefined as string | undefined,
  ownerName: "Roberto Alves",
};

/* ─── Weekly chart data ─── */
const weeklyData = [
  { label: "Seg", value: 8 },
  { label: "Ter", value: 12 },
  { label: "Qua", value: 6 },
  { label: "Qui", value: 15, isHighlight: true },
  { label: "Sex", value: 10, isCurrent: true },
  { label: "Sáb", value: 18 },
  { label: "Dom", value: 4 },
];

/* ─── Status config ─── */
const statusConfig: Record<AppointmentStatus, { label: string; variant: "success" | "warning" | "primary" | "neutral" | "danger" | "orange" }> = {
  agendado:       { label: "Agendado",       variant: "primary"  },
  confirmado:     { label: "Confirmado",     variant: "success"  },
  em_atendimento: { label: "Em atendimento", variant: "orange"   },
  concluido:      { label: "Concluído",      variant: "success"  },
  cancelado:      { label: "Cancelado",      variant: "danger"   },
  faltou:         { label: "Faltou",         variant: "neutral"  },
};

/* ─── Appointment row ─── */
function AppointmentRow({ appointment }: { appointment: typeof mockAppointments[0] }) {
  const cfg = statusConfig[appointment.status];
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
          <p className="font-semibold text-sm text-gray-900 truncate">{appointment.petName}</p>
          <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
        </div>
        <p className="text-xs text-gray-500 truncate">{appointment.serviceLabel} · {appointment.time}</p>
      </div>
      <p className="text-sm font-bold text-gray-700 flex-shrink-0">
        {formatCurrency(appointment.price)}
      </p>
    </Link>
  );
}

export default function DonoInicioPage() {
  const today = mockAppointments.filter((a) => a.petShopId === mockPetShop.id);
  const monthRevenue = today.reduce((s, a) => s + a.price, 0);
  const inService = today.filter((a) => a.status === "em_atendimento").length;

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <PageHeader
        showLogo
        rightAction={{ icon: "notifications", label: "Notificações", href: "/dono/notificacoes", badge: 3 }}
        userAvatar={{ src: mockPetShop.logoUrl, name: mockPetShop.name, href: "/dono/perfil" }}
      />

      {/* ── Shop banner ── */}
      <section className="animate-slide-up">
        <div className="bg-gradient-primary rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Avatar
              src={mockPetShop.logoUrl}
              name={mockPetShop.name}
              size="md"
              ring
              ringColor="ring-white/30"
            />
            <div className="flex-1">
              <h2 className="font-bold text-base leading-tight">{mockPetShop.name}</h2>
              <p className="text-white/70 text-xs">Bem-vindo, {mockPetShop.ownerName.split(" ")[0]}!</p>
            </div>
            <Link href="/dono/agenda" className="btn-secondary bg-white/15 border-0 text-white text-xs py-2 px-3">
              Ver agenda
            </Link>
          </div>
          <p className="text-white/60 text-xs">
            Hoje, {formatDate(new Date().toISOString(), { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
      </section>

      {/* ── Stat Cards ── */}
      <section className="animate-slide-up">
        <p className="section-label mb-3">Resumo de hoje</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon="calendar_today"
            label="Agendamentos"
            value={today.length}
            trend="+2 vs ontem"
            trendDirection="up"
            iconBg="bg-primary/10"
            iconColor="text-primary"
          />
          <StatCard
            icon="account_balance_wallet"
            label="Receita hoje"
            value={formatCurrency(monthRevenue)}
            trend="+R$ 120"
            trendDirection="up"
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
            value={3}
            trend="há 30+ dias"
            trendDirection="down"
            iconBg="bg-red-100"
            iconColor="text-red-500"
            onClick={() => {}}
          />
        </div>
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
          <BarChart data={weeklyData} showLabels showValues height="md" />
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
          {today.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">
              Nenhum agendamento para hoje.
            </p>
          ) : (
            today.map((apt) => <AppointmentRow key={apt.id} appointment={apt} />)
          )}
        </div>
      </section>

      {/* ── Retorno Automation Section ── */}
      <section className="animate-slide-up space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <MaterialIcon icon="auto_mode" size="md" className="text-primary" />
            Automação de Retorno
          </h2>
          <button className="text-primary text-sm font-semibold hover:underline">
            Ver todos
          </button>
        </div>

        <div className="space-y-3">
          {/* Pet Card 1 */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar name="Thor" size="md" />
                <span className="absolute bottom-0 right-0 bg-emerald-500 w-3 h-3 rounded-full border-2 border-white" />
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">Thor</p>
                <div className="flex items-center gap-1 text-red-500">
                  <MaterialIcon icon="schedule" size="xs" />
                  <p className="text-sm font-medium leading-none">28 dias sem banho</p>
                </div>
              </div>
            </div>
            <Link
              href="https://wa.me/5511999999999"
              target="_blank"
              className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-[#25D366] hover:bg-[#20bd5a]"
            >
              <MaterialIcon icon="chat" size="xs" />
              Enviar
            </Link>
          </div>

          {/* Pet Card 2 */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar name="Bela" size="md" />
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">Bela</p>
                <div className="flex items-center gap-1 text-red-600">
                  <MaterialIcon icon="schedule" size="xs" />
                  <p className="text-sm font-medium leading-none">32 dias sem banho</p>
                </div>
              </div>
            </div>
            <Link
              href="https://wa.me/5511999999999"
              target="_blank"
              className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-[#25D366] hover:bg-[#20bd5a]"
            >
              <MaterialIcon icon="chat" size="xs" />
              Enviar
            </Link>
          </div>

          {/* Pet Card 3 */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm opacity-80">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar name="Max" size="md" />
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">Max</p>
                <div className="flex items-center gap-1 text-gray-500">
                  <MaterialIcon icon="schedule" size="xs" />
                  <p className="text-sm font-medium leading-none">15 dias sem banho</p>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm font-semibold cursor-not-allowed">
              <MaterialIcon icon="check_circle" size="xs" />
              Agendado
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
