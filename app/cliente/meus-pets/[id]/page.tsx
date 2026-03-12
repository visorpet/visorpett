"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Badge, ProgressBar } from "@/components/ui";
import { cn, formatDate, daysSince } from "@/lib/utils";
import { mockPets } from "@/lib/mocks/pets";

/* ─── Tab definitions ─── */
type Tab = "historico" | "vacinas" | "observacoes";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "historico", label: "Histórico", icon: "history" },
  { id: "vacinas", label: "Vacinas", icon: "vaccines" },
  { id: "observacoes", label: "Observações", icon: "note" },
];

/* ─── Mock grooming history ─── */
const groomingHistory = [
  {
    id: "gh-001",
    type: "banho-tosa",
    label: "Banho + Tosa Completa",
    date: "2024-03-01",
    price: 150,
    note: "Ficou muito cheiroso e feliz! Corte impecável.",
    groomer: "Carla",
    icon: "content_cut",
  },
  {
    id: "gh-002",
    type: "banho",
    label: "Banho",
    date: "2024-02-01",
    price: 50,
    note: "Serviço realizado com muito carinho.",
    groomer: "Carla",
    icon: "bathtub",
  },
  {
    id: "gh-003",
    type: "consulta",
    label: "Consulta Veterinária",
    date: "2024-01-15",
    price: 180,
    note: "Check-up geral. Peso estável em 28kg. Recomendado limpeza de tártaro.",
    groomer: "Dr. Paulo",
    icon: "medical_services",
  },
  {
    id: "gh-004",
    type: "vacina",
    label: "Vacina Antirrábica",
    date: "2023-08-15",
    price: 120,
    note: "Reforço anual aplicado. Lote: VAX-2023-BR.",
    groomer: "Dr. Paulo",
    icon: "vaccines",
  },
];

/* ─── Allergy / behavior tags ─── */
const allergyTags = [
  { label: "Alergia: Shampoo Neutro", icon: "warning", color: "text-red-500 bg-red-50 border-red-200" },
];
const behaviorTags = [
  { label: "Comportamento: Tranquilo", icon: "mood", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
];

/* ─── Observation section placeholder ─── */
const observations = [
  "Prefere água morna no banho.",
  "Fica ansioso com secador — usar velocidade baixa.",
  "Não gostar de ter as patas tocadas — paciência necessária.",
];

/* ─── HistoryTimeline ─── */
function HistoryTimeline() {
  return (
    <div className="flex flex-col gap-0">
      {groomingHistory.map((item, idx) => (
        <div key={item.id} className="flex gap-4 relative">
          {/* Timeline line + icon */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary z-10 flex-shrink-0">
              <MaterialIcon icon={item.icon} size="sm" />
            </div>
            {idx < groomingHistory.length - 1 && (
              <div className="w-0.5 flex-1 bg-primary/10 my-1" />
            )}
          </div>

          {/* Card */}
          <div className={cn("flex-1", idx < groomingHistory.length - 1 ? "pb-6" : "")}>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-card">
              <div className="flex justify-between items-start mb-1.5">
                <h3 className="font-bold text-gray-900 text-sm">{item.label}</h3>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg flex-shrink-0 ml-2">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price)}
                </span>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                <MaterialIcon icon="calendar_today" className="text-[12px]!" />
                {formatDate(item.date, { day: "2-digit", month: "2-digit", year: "numeric" })}
                {" · "}
                <MaterialIcon icon="person" className="text-[12px]!" />
                {item.groomer}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">{item.note}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── VaccineCard ─── */
function VaccineSection({ vaccines }: { vaccines: NonNullable<typeof mockPets[0]["vaccines"]> }) {
  return (
    <div className="flex flex-col gap-3">
      {vaccines.map((vac) => {
        const isOk = vac.status === "em_dia";
        const isExpired = vac.status === "vencida";
        return (
          <div
            key={vac.id}
            className="bg-white border border-gray-100 rounded-xl p-4 shadow-card"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center",
                    isOk ? "bg-green-100" : isExpired ? "bg-red-100" : "bg-amber-100"
                  )}
                >
                  <MaterialIcon
                    icon="vaccines"
                    size="sm"
                    className={cn(
                      isOk ? "text-green-600" : isExpired ? "text-red-500" : "text-amber-600"
                    )}
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{vac.name}</p>
                  <p className="text-xs text-gray-500">{formatDate(vac.date, { day: "2-digit", month: "2-digit", year: "numeric" })}</p>
                </div>
              </div>
              <Badge
                variant={isOk ? "success" : isExpired ? "danger" : "warning"}
                dot
              >
                {vac.status === "em_dia" ? "Em dia" : vac.status === "vencida" ? "Vencida" : "Próxima"}
              </Badge>
            </div>
            {vac.nextDueDate && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <MaterialIcon icon="event_upcoming" className="text-[12px]!" />
                Próxima dose: {formatDate(vac.nextDueDate, { day: "2-digit", month: "2-digit", year: "numeric" })}
              </p>
            )}
          </div>
        );
      })}

      {vaccines.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <MaterialIcon icon="vaccines" size="xl" className="mb-2 opacity-40" />
          <p className="text-sm">Nenhuma vacina registrada</p>
        </div>
      )}
    </div>
  );
}

/* ─── Main page ─── */
export default function ProntuarioPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<Tab>("historico");

  const pet = mockPets.find((p) => p.id === id);

  if (!pet) {
    return (
      <div className="page-container items-center justify-center">
        <div className="text-center py-12 text-gray-400">
          <MaterialIcon icon="pets" size="xl" className="mb-3 opacity-40" />
          <p className="font-semibold text-gray-500">Pet não encontrado</p>
          <Link href="/cliente/meus-pets" className="text-primary text-sm font-bold mt-2 inline-block">
            Voltar para Meus Pets
          </Link>
        </div>
      </div>
    );
  }

  const daysLastBath = pet.lastBath ? daysSince(pet.lastBath) : undefined;
  const bathWarningLevel =
    daysLastBath !== undefined
      ? daysLastBath >= 30 ? "danger"
      : daysLastBath >= 20 ? "warning"
      : "success"
      : undefined;

  const speciesIcon = pet.species === "gato" ? "cruelty_free" : "pets";
  const speciesLabel = pet.species === "cachorro" ? "Cão" : pet.species === "gato" ? "Gato" : pet.species;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ── Header ── */}
      <PageHeader
        title="Prontuário"
        showBack
        backHref="/cliente/meus-pets"
        rightAction={{ icon: "more_vert", label: "Opções" }}
      />

      {/* ── Pet hero ── */}
      <div className="flex flex-col items-center gap-3 px-4 pt-6 pb-4 bg-white">
        {/* Avatar */}
        <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center ring-4 ring-primary/20 shadow-primary-sm">
          <MaterialIcon icon={speciesIcon} size="xl" className="text-primary" fill />
        </div>

        {/* Name + info */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900">{pet.name}</h1>
          <p className="text-gray-500 text-base mt-0.5">
            {speciesLabel}
            {pet.breed ? ` • ${pet.breed}` : ""}
            {pet.weight ? ` • ${pet.weight}kg` : ""}
          </p>
        </div>

        {/* Tag chips */}
        <div className="flex flex-wrap gap-2 justify-center">
          {allergyTags.map((tag) => (
            <div
              key={tag.label}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold",
                tag.color
              )}
            >
              <MaterialIcon icon={tag.icon} className="text-[14px]!" />
              {tag.label}
            </div>
          ))}
          {behaviorTags.map((tag) => (
            <div
              key={tag.label}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold",
                tag.color
              )}
            >
              <MaterialIcon icon={tag.icon} className="text-[14px]!" />
              {tag.label}
            </div>
          ))}
        </div>

        {/* Bath progress */}
        {daysLastBath !== undefined && (
          <div className="w-full mt-2">
            <ProgressBar
              value={Math.min(100, (daysLastBath / 30) * 100)}
              label="Último banho"
              sublabel={`${daysLastBath} dias atrás${daysLastBath >= 25 ? " · Hora de agendar!" : ""}`}
              color={bathWarningLevel}
              showPercent={false}
            />
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="sticky top-14 z-30 bg-white border-b border-gray-100">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-3 border-b-[3px] transition-all duration-200 gap-0.5",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              )}
              aria-selected={activeTab === tab.id}
            >
              <MaterialIcon icon={tab.icon} size="sm" fill={activeTab === tab.id} />
              <span className="text-xs font-bold">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 p-4 bg-bg-light">
        {activeTab === "historico" && <HistoryTimeline />}

        {activeTab === "vacinas" && (
          <VaccineSection vaccines={pet.vaccines ?? []} />
        )}

        {activeTab === "observacoes" && (
          <div className="flex flex-col gap-3">
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-card">
              <p className="section-label mb-3">Notas do veterinário / tosador</p>
              <ul className="space-y-2">
                {observations.map((obs, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <MaterialIcon icon="adjust" size="xs" className="text-primary mt-0.5 flex-shrink-0" />
                    {obs}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom CTA ── */}
      <div className="p-4 bg-white border-t border-gray-100">
        <Link
          href="/cliente/agendamento"
          className="btn-primary w-full justify-center"
        >
          <MaterialIcon icon="add_circle" size="sm" />
          Novo Agendamento
        </Link>
      </div>
    </div>
  );
}
