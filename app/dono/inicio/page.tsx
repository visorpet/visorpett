"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard, BarChart, Badge, Avatar, MaterialIcon } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppointmentStatus } from "@/types";

/* ─── Weekly chart data (Mock for chart visual purposes) ─── */
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
function AppointmentRow({ appointment }: { appointment: any }) {
  const cfg = statusConfig[appointment.status as AppointmentStatus] || statusConfig["agendado"];
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
          <p className="font-semibold text-sm text-gray-900 truncate">{appointment.pet?.name || "Pet"}</p>
          <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
        </div>
        <p className="text-xs text-gray-500 truncate">{appointment.service?.label || "Serviço"} · {time}</p>
      </div>
      <p className="text-sm font-bold text-gray-700 flex-shrink-0">
        {formatCurrency(appointment.totalPrice)}
      </p>
    </Link>
  );
}

export default function DonoInicioPage() {
  const [petShop, setPetShop] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [shopRes, apptRes] = await Promise.all([
          fetch("/api/petshops/me"),
          fetch(`/api/appointments?date=${new Date().toISOString().split("T")[0]}`)
        ]);
        
        const shopJson = await shopRes.json();
        const apptJson = await apptRes.json();
        
        if (shopJson.data) setPetShop(shopJson.data);
        if (apptJson.data) setAppointments(apptJson.data);
      } catch (error) {
        console.error("Erro ao carregar Dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const todayAppointments = appointments;
  const monthRevenue = todayAppointments.reduce((s, a) => s + (a.totalPrice || 0), 0);
  const inService = todayAppointments.filter((a) => a.status === "em_atendimento").length;

  if (loading) {
    return <div className="page-container flex items-center justify-center min-h-screen text-gray-500 font-semibold">Carregando painel...</div>;
  }

  const shopName = petShop?.name || "Meu PetShop";
  const shopLogo = petShop?.logoUrl;
  const ownerName = petShop?.ownerName || "Dono"; // Em produção: pegar da sessão do usuário logado

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <PageHeader
        showLogo
        rightAction={{ icon: "notifications", label: "Notificações", href: "/dono/notificacoes", badge: 3 }}
        userAvatar={{ src: shopLogo, name: shopName, href: "/dono/perfil" }}
      />

      {/* ── Shop banner ── */}
      <section className="animate-slide-up">
        <div className="bg-gradient-primary rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Avatar
              src={shopLogo}
              name={shopName}
              size="md"
              ring
              ringColor="ring-white/30"
            />
            <div className="flex-1">
              <h2 className="font-bold text-base leading-tight">{shopName}</h2>
              <p className="text-white/70 text-xs">Bem-vindo(a)!</p>
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
            value={todayAppointments.length}
            trend="+2 vs ontem"
            trendDirection="up"
            iconBg="bg-primary/10"
            iconColor="text-primary"
          />
          <StatCard
            icon="account_balance_wallet"
            label="Receita prevista"
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
            value={3} // Mock fixado temporariamente
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
          <p className="section-label">Agenda de hoje (Tempo Real)</p>
          <Link href="/dono/agenda" className="text-xs text-primary font-bold">
            Ver tudo
          </Link>
        </div>
        <div className="card space-y-2">
          {todayAppointments.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">
              Nenhum agendamento para hoje.
            </p>
          ) : (
            todayAppointments.map((apt) => <AppointmentRow key={apt.id} appointment={apt} />)
          )}
        </div>
      </section>

      {/* ── Retorno Automation Section (Mocks mantidos visuais) ── */}
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
        </div>
      </section>
    </div>
  );
}
