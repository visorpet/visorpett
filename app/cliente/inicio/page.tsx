"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, Badge, ProgressBar, MaterialIcon } from "@/components/ui";
import { formatCurrency, formatDate, getGreeting, pluralize } from "@/lib/utils";
import { mockPets } from "@/lib/mocks/pets";
import { mockAppointments } from "@/lib/mocks/appointments";
import type { AppointmentStatus } from "@/types";

/* ─── Mock user ─── */
const mockUser = {
  id: "user-client-001",
  name: "Ana Souza",
  photoUrl: undefined as string | undefined,
};

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
  const greeting = getGreeting();
  const pets = mockPets.filter((p) => p.ownerId === mockUser.id);
  const [selectedPetId, setSelectedPetId] = useState<string>(pets[0]?.id ?? "");

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  // Próximo agendamento do usuário
  const upcomingAppt = mockAppointments.find(
    (a) => a.ownerId === mockUser.id && a.status !== "concluido" && a.status !== "cancelado"
  );

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <PageHeader
        showLogo
        rightAction={{
          icon: "notifications",
          label: "Notificações",
          href: "/cliente/notificacoes",
          badge: 2,
        }}
        userAvatar={{
          src: mockUser.photoUrl,
          name: mockUser.name,
          href: "/cliente/perfil",
        }}
      />

      {/* ── Greeting + Summary ── */}
      <section className="px-0 animate-slide-up">
        <div className="bg-gradient-primary rounded-2xl p-5 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm font-medium">{greeting},</p>
              <h2 className="text-xl font-bold">
                {mockUser.name.split(" ")[0]}! 👋
              </h2>
            </div>
            <Avatar
              src={mockUser.photoUrl}
              name={mockUser.name}
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
              <p className="text-2xl font-black">{mockAppointments.filter((a) => a.ownerId === mockUser.id).length}</p>
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
        <div className="grid grid-cols-4 gap-2">
          <QuickAction icon="calendar_add_on" label="Novo agendamento" href="/cliente/agendamento" color="primary" />
          <QuickAction icon="pets"            label="Meus pets"        href="/cliente/meus-pets"   color="primary" />
          <QuickAction icon="store"           label="Pet shops"        href="/cliente/petshops"    color="primary" />
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
                <p className="font-bold text-gray-900">{upcomingAppt.serviceLabel}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(upcomingAppt.date)} às {upcomingAppt.time}
                </p>
              </div>
              <Badge variant={statusBadge[upcomingAppt.status].variant} dot>
                {statusBadge[upcomingAppt.status].label}
              </Badge>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                <MaterialIcon icon="pets" size="sm" className="text-primary" fill />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{upcomingAppt.petName}</p>
                <p className="text-xs text-gray-500 capitalize">{upcomingAppt.petSpecies}</p>
              </div>
              <p className="font-bold text-primary text-sm">
                {formatCurrency(upcomingAppt.price)}
              </p>
            </div>

            {upcomingAppt.groomerName && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Profissional: <span className="font-semibold text-gray-700">{upcomingAppt.groomerName}</span>
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <Link
                href={`https://wa.me/55${upcomingAppt.ownerPhone}`}
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
          {pets.map((pet) => (
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
                  {selectedPet.vaccines.slice(0, 2).map((vac) => (
                    <div key={vac.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MaterialIcon icon="vaccines" size="xs" className="text-gray-400" />
                        <span className="text-xs text-gray-700 font-medium">{vac.name}</span>
                      </div>
                      <Badge
                        variant={vac.status === "em_dia" ? "success" : vac.status === "vencida" ? "danger" : "warning"}
                        dot
                      >
                        {vac.status}
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
