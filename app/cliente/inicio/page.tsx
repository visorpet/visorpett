"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser } from "@/lib/supabase/useUser";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, Badge, ProgressBar, MaterialIcon } from "@/components/ui";
import { formatCurrency, formatDate, getGreeting, pluralize } from "@/lib/utils";
import type { AppointmentStatus } from "@/types";

/* ─── Status badge mapping ─── */
const statusBadge: Record<AppointmentStatus, { label: string; variant: "success" | "warning" | "primary" | "neutral" | "danger" | "orange" }> = {
  agendado:       { label: "Agendado",       variant: "primary" },
  confirmado:     { label: "Confirmado",     variant: "success" },
  em_atendimento: { label: "Em atendimento", variant: "orange" },
  concluido:      { label: "Concluído",      variant: "success" },
  cancelado:      { label: "Cancelado",      variant: "danger" },
  faltou:         { label: "Faltou",         variant: "neutral" },
};

/* ─── Quick action component ─── */
function QuickAction({ icon, label, href, color = "primary" }: {
  icon: string; label: string; href: string; color?: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-${color}/10`}>
        <MaterialIcon icon={icon} size="md" className={`text-${color}`} fill />
      </div>
      <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">
        {label}
      </span>
    </Link>
  );
}

export default function ClienteInicioPage() {
  const { user } = useUser();
  const greeting = getGreeting();
  
  const [pets, setPets] = useState<any[]>([]);
  const [upcomingAppt, setUpcomingAppt] = useState<any>(null);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string>("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await fetch("/api/cliente/dashboard");
        const json = await res.json();
        
        if (json.data) {
          setPets(json.data.pets);
          setUpcomingAppt(json.data.upcomingAppointment);
          setTotalAppointments(json.data.totalAppointments);
          if (json.data.pets.length > 0) {
            setSelectedPetId(json.data.pets[0].id);
          }
        } else if (json.error) {
          setError(json.error);
        }
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        setError("Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  if (loading) {
    return (
      <div className="page-container p-5 animate-pulse min-h-screen flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="w-32 h-6 rounded-md bg-gray-200" />
          <div className="w-10 h-10 rounded-full bg-gray-200" />
        </div>
        <div className="w-full h-32 rounded-2xl bg-gray-200" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded-2xl bg-gray-200" />)}
        </div>
        <div className="h-40 rounded-2xl bg-gray-200" />
      </div>
    );
  }

  const userName = user?.name || "Pet Lover";
  const userPhoto = user?.image;

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <PageHeader
        showLogo
        rightAction={{ 
          icon: "notifications", 
          label: "Notificações", 
          badge: 1,
          href: "/cliente/notificacoes"
        }}
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

      {/* ── Greeting + Summary ── */}
      <section className="px-0 animate-slide-up">
        <div className="bg-gradient-primary rounded-2xl p-5 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm font-medium">{greeting},</p>
              <h2 className="text-xl font-bold">
                {userName.split(" ")[0]}! 👋
              </h2>
            </div>
            <Avatar
              src={userPhoto || undefined}
              name={userName}
              size="md"
              ring
              ringColor="ring-white/40"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-black">{pets.length}</p>
              <p className="text-white/70 text-xs">{pluralize(pets.length, "pet", "pets")}</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-black">{totalAppointments}</p>
              <p className="text-white/70 text-xs">agendamentos</p>
            </div>
            <div className="flex-1 flex justify-end">
              <Link
                href="/cliente/agendamento"
                className="btn-secondary bg-white/15 text-white border-0 hover:bg-white/25 text-xs px-4 py-2"
              >
                + Agendar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className="animate-slide-up">
        <p className="section-label mb-3">Acesso rápido</p>
        <div className="grid grid-cols-3 gap-2">
          <QuickAction icon="calendar_add_on" label="Novo agendamento" href="/cliente/agendamento" color="primary" />
          <QuickAction icon="pets"            label="Meus pets"        href="/cliente/meus-pets"   color="primary" />
          <QuickAction icon="redeem"          label="Indicações"       href="/cliente/indicacoes"  color="primary" />
        </div>
      </section>

      {/* ── Próximo Agendamento ── */}
      {upcomingAppt && (
        <section className="animate-slide-up">
          <p className="section-label mb-3">Próximo agendamento</p>
          <div className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-gray-900">{upcomingAppt.service.label}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(upcomingAppt.date)} às {upcomingAppt.date.split('T')[1].substring(0, 5)}
                </p>
              </div>
              <Badge variant={statusBadge[upcomingAppt.status as AppointmentStatus].variant} dot>
                {String(statusBadge[upcomingAppt.status as AppointmentStatus].label)}
              </Badge>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                <MaterialIcon icon="pets" size="sm" className="text-primary" fill />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{upcomingAppt.pet.name}</p>
                <p className="text-xs text-gray-500 capitalize">{upcomingAppt.pet.species}</p>
              </div>
              <p className="font-bold text-primary text-sm">
                {formatCurrency(upcomingAppt.totalPrice)}
              </p>
            </div>

            {upcomingAppt.groomer && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Profissional: <span className="font-semibold text-gray-700">{upcomingAppt.groomer.name}</span>
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <Link
                href={`https://wa.me/${upcomingAppt.petShop.phone || ""}`}
                target="_blank"
                className="btn-whatsapp flex-1 text-xs py-2"
              >
                <MaterialIcon icon="chat" size="xs" />
                WhatsApp
              </Link>
              <Link
                href={`/cliente/agendamento/${upcomingAppt.id}`}
                className="btn-secondary flex-1 text-xs py-2"
              >
                <MaterialIcon icon="edit_calendar" size="xs" />
                Detalhes
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Meus Pets ── */}
      <section className="animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <p className="section-label">Meus pets</p>
          <Link href="/cliente/meus-pets" className="text-xs text-primary font-bold">
            Ver todos
          </Link>
        </div>

        {/* Pet selector scrollable */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {pets.map((pet: any) => (
            <button
              key={pet.id}
              onClick={() => setSelectedPetId(pet.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${
                selectedPetId === pet.id
                  ? "bg-primary text-white border-primary shadow-primary-sm"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
            >
              <MaterialIcon icon="pets" size="xs" fill={selectedPetId === pet.id} />
              <span className="text-xs font-semibold">{pet.name}</span>
            </button>
          ))}
        </div>

        {/* Selected pet card */}
        {selectedPet && (
          <div className="card mt-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <MaterialIcon icon="pets" size="lg" className="text-primary" fill />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-base">{selectedPet.name}</p>
                <p className="text-sm text-gray-500 capitalize">
                  {selectedPet.breed ?? selectedPet.species}
                </p>
                {selectedPet.weight && (
                  <p className="text-xs text-gray-400">{selectedPet.weight} kg</p>
                )}
              </div>
              <Link
                href={`/cliente/meus-pets/${selectedPet.id}`}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <MaterialIcon icon="chevron_right" size="sm" className="text-gray-500" />
              </Link>
            </div>

            {/* Days since last bath */}
            {selectedPet.daysSinceLastBath !== undefined && (
              <div className="mb-4">
                <ProgressBar
                  value={Math.min(100, (selectedPet.daysSinceLastBath / 30) * 100)}
                  label="Último banho"
                  sublabel={`${selectedPet.daysSinceLastBath} dias atrás${selectedPet.daysSinceLastBath >= 25 ? " · Hora de agendar!" : ""}`}
                  color={selectedPet.daysSinceLastBath >= 25 ? "danger" : selectedPet.daysSinceLastBath >= 15 ? "warning" : "success"}
                  showPercent={false}
                />
              </div>
            )}

            {/* Vaccines */}
            {selectedPet.vaccines && selectedPet.vaccines.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Vacinas</p>
                <div className="space-y-2">
                  {selectedPet.vaccines.slice(0, 2).map((vac: any) => (
                    <div key={vac.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MaterialIcon icon="vaccines" size="xs" className="text-gray-400" />
                        <span className="text-xs text-gray-700 font-medium">{vac.name}</span>
                      </div>
                      <Badge
                        variant={vac.status === "em_dia" ? "success" : vac.status === "vencida" ? "danger" : "warning"}
                        dot
                      >
                        {String(vac.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Referral Banner ── */}
      <section className="animate-slide-up">
        <Link href="/cliente/indicacoes" className="block">
          <div className="bg-gradient-referral rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-wide mb-1">
                  Programa de Indicações
                </p>
                <p className="text-base font-bold">
                  Indique um pet shop 🐾
                </p>
                <p className="text-sm text-white/70 mt-1">
                  Ganhe recompensas por cada indicação
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <MaterialIcon icon="redeem" size="lg" className="text-white" fill />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="text-xs font-semibold text-white/80">Ver detalhes</span>
              <MaterialIcon icon="arrow_forward" size="xs" className="text-white/80" />
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}
