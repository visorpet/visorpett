"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Badge } from "@/components/ui";
import { cn, formatCurrency } from "@/lib/utils";
import { mockPets } from "@/lib/mocks/pets";

/* ─── Types ─── */
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  duration: string; // "1h", "2h", etc.
}

interface TimeSlot {
  time: string;
  available: boolean;
}

/* ─── Mock data ─── */
const mockServices: Service[] = [
  {
    id: "banho",
    name: "Banho",
    description: "Higiene completa, secagem e perfume",
    price: 50,
    icon: "bathtub",
    duration: "1h",
  },
  {
    id: "tosa-higienica",
    name: "Tosa Higiênica",
    description: "Patinhas, barriga e rosto",
    price: 85,
    icon: "content_cut",
    duration: "1h30",
  },
  {
    id: "tosa-completa",
    name: "Tosa Completa",
    description: "Corte na máquina ou tesoura",
    price: 120,
    icon: "content_cut",
    duration: "2h",
  },
  {
    id: "banho-tosa",
    name: "Banho + Tosa",
    description: "Combo completo com desconto",
    price: 150,
    icon: "spa",
    duration: "2h30",
  },
  {
    id: "consulta",
    name: "Consulta Veterinária",
    description: "Avaliação clínica geral",
    price: 180,
    icon: "medical_services",
    duration: "30min",
  },
];

const timeSlots: TimeSlot[] = [
  { time: "08:00", available: true },
  { time: "09:00", available: true },
  { time: "10:00", available: false },
  { time: "11:00", available: true },
  { time: "13:00", available: false },
  { time: "14:00", available: true },
  { time: "14:30", available: true },
  { time: "15:30", available: false },
  { time: "16:00", available: true },
  { time: "17:00", available: true },
];

/* ─── Generate next 14 days ─── */
function getNextDays(count: number): { iso: string; dayName: string; dayNum: number; isDisabled: boolean }[] {
  const days = [];
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      iso: d.toISOString().split("T")[0],
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
      isDisabled: d.getDay() === 0, // domingo desabilitado
    });
  }
  return days;
}

/* ─── Pet avatar/selector item ─── */
function PetItem({
  pet,
  isSelected,
  onClick,
}: {
  pet: { id: string; name: string; species: string };
  isSelected: boolean;
  onClick: () => void;
}) {
  const icon = pet.species === "gato" ? "cruelty_free" : "pets";
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 w-20 flex-shrink-0 cursor-pointer transition-all duration-200",
      )}
      aria-pressed={isSelected}
    >
      <div className="relative">
        <div
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200",
            isSelected
              ? "bg-primary/15 ring-4 ring-primary ring-offset-2"
              : "bg-gray-100 ring-2 ring-transparent grayscale"
          )}
        >
          <MaterialIcon
            icon={icon}
            size="lg"
            className={cn(isSelected ? "text-primary" : "text-gray-400")}
            fill={isSelected}
          />
        </div>
        {isSelected && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center animate-scale-in">
            <MaterialIcon icon="check" className="text-[13px]!" />
          </span>
        )}
      </div>
      <p
        className={cn(
          "text-sm font-semibold text-center leading-tight",
          isSelected ? "text-primary" : "text-gray-500"
        )}
      >
        {pet.name}
      </p>
    </button>
  );
}

/* ─── Service card ─── */
function ServiceCard({
  service,
  isSelected,
  onClick,
}: {
  service: Service;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 bg-white p-4 rounded-xl border-2 shadow-card transition-all duration-200 text-left w-full",
        isSelected
          ? "border-primary shadow-primary-sm"
          : "border-gray-200 hover:border-primary/30"
      )}
      aria-pressed={isSelected}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
          isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
        )}
      >
        <MaterialIcon icon={service.icon} size="md" fill={isSelected} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-base">{service.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{service.description}</p>
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <MaterialIcon icon="schedule" className="text-[13px]!" />
          {service.duration}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={cn("font-bold", isSelected ? "text-primary" : "text-gray-900")}>
          {formatCurrency(service.price)}
        </p>
        {/* Radio button */}
        <div className="flex justify-end mt-2">
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
              isSelected ? "border-primary bg-primary" : "border-gray-300"
            )}
          >
            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>
        </div>
      </div>
    </button>
  );
}

/* ─── Date card ─── */
function DateCard({
  day,
  isSelected,
  onClick,
}: {
  day: { iso: string; dayName: string; dayNum: number; isDisabled: boolean };
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={!day.isDisabled ? onClick : undefined}
      disabled={day.isDisabled}
      className={cn(
        "flex flex-col items-center justify-center min-w-[64px] h-20 rounded-xl border-2 transition-all duration-200 flex-shrink-0",
        isSelected
          ? "bg-primary border-primary text-white shadow-primary-sm"
          : day.isDisabled
          ? "bg-gray-50 border-gray-100 text-gray-300 opacity-50 cursor-not-allowed"
          : "bg-white border-gray-200 text-gray-700 hover:border-primary/50 shadow-card"
      )}
      aria-pressed={isSelected}
      aria-disabled={day.isDisabled}
    >
      <p
        className={cn(
          "text-[10px] uppercase font-bold",
          isSelected ? "text-white/80" : "text-gray-400"
        )}
      >
        {day.dayName}
      </p>
      <p className="text-2xl font-black mt-0.5">{day.dayNum}</p>
    </button>
  );
}

/* ─── Time slot ─── */
function TimeSlotButton({
  slot,
  isSelected,
  onClick,
}: {
  slot: TimeSlot;
  isSelected: boolean;
  onClick: () => void;
}) {
  if (!slot.available) {
    return (
      <div className="bg-gray-100 text-gray-400 py-3 rounded-xl text-center font-medium line-through text-sm select-none">
        {slot.time}
      </div>
    );
  }
  return (
    <button
      onClick={onClick}
      className={cn(
        "py-3 rounded-xl text-center font-bold text-sm border-2 transition-all duration-200",
        isSelected
          ? "bg-primary border-primary text-white shadow-primary-sm"
          : "bg-white border-gray-200 text-gray-700 hover:border-primary/50 shadow-card"
      )}
      aria-pressed={isSelected}
    >
      {slot.time}
    </button>
  );
}

/* ─── Main page ─── */
const userId = "user-client-001";

export default function AgendamentoPage() {
  const myPets = mockPets.filter((p) => p.ownerId === userId);
  const days = useMemo(() => getNextDays(14), []);

  const [selectedPetId, setSelectedPetId] = useState<string>(myPets[0]?.id ?? "");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedDateIso, setSelectedDateIso] = useState<string>(
    days.find((d) => !d.isDisabled)?.iso ?? ""
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const selectedPet = myPets.find((p) => p.id === selectedPetId);
  const selectedService = mockServices.find((s) => s.id === selectedServiceId);

  const isReady = !!selectedPetId && !!selectedServiceId && !!selectedDateIso && !!selectedTime;

  const selectedDay = days.find((d) => d.iso === selectedDateIso);
  const monthName = selectedDateIso
    ? new Date(selectedDateIso + "T12:00:00").toLocaleDateString("pt-BR", { month: "long" })
    : "";

  function handleConfirm() {
    if (!isReady || isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsConfirmed(true);
    }, 1500);
  }

  if (isConfirmed) {
    return (
      <div className="page-container items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-6 text-center animate-scale-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <MaterialIcon icon="check_circle" size="xl" className="text-green-500" fill />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Agendamento confirmado!</h1>
            <p className="text-gray-500">
              {selectedPet?.name} — {selectedService?.name}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {selectedDay?.dayName}, {selectedDay?.dayNum} de {monthName} às {selectedTime}
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Link href="/cliente/inicio" className="btn-primary w-full justify-center">
              <MaterialIcon icon="home" size="sm" />
              Ir para o início
            </Link>
            <button
              onClick={() => {
                setIsConfirmed(false);
                setSelectedServiceId("");
                setSelectedTime("");
              }}
              className="btn-secondary w-full justify-center"
            >
              <MaterialIcon icon="add" size="sm" />
              Novo agendamento
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-light">
      {/* ── Header ── */}
      <PageHeader title="Novo Agendamento" showBack backHref="/cliente/inicio" />

      {/* ── Content ── */}
      <div className="flex flex-col gap-8 py-6 pb-40">

        {/* ─── 1. Selecione o Pet ─── */}
        <section>
          <div className="flex items-center gap-2 px-4 mb-4">
            <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-black">
              1
            </div>
            <h2 className="text-base font-bold text-gray-900">Selecione o Pet</h2>
          </div>

          <div className="flex gap-4 overflow-x-auto px-4 pb-2 no-scrollbar">
            {myPets.map((pet) => (
              <PetItem
                key={pet.id}
                pet={pet}
                isSelected={selectedPetId === pet.id}
                onClick={() => setSelectedPetId(pet.id)}
              />
            ))}
            {/* Adicionar novo pet */}
            <Link
              href="/cliente/meus-pets/novo"
              className="flex flex-col items-center gap-2 w-20 flex-shrink-0"
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                <MaterialIcon icon="add" size="md" className="text-gray-400" />
              </div>
              <p className="text-xs font-medium text-gray-400 text-center">Novo</p>
            </Link>
          </div>
        </section>

        {/* ─── 2. Selecione o Serviço ─── */}
        <section>
          <div className="flex items-center gap-2 px-4 mb-4">
            <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-black">
              2
            </div>
            <h2 className="text-base font-bold text-gray-900">Selecione o Serviço</h2>
          </div>

          <div className="flex flex-col gap-3 px-4">
            {mockServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={selectedServiceId === service.id}
                onClick={() => setSelectedServiceId(service.id)}
              />
            ))}
          </div>
        </section>

        {/* ─── 3. Selecione a Data ─── */}
        <section>
          <div className="flex items-center justify-between px-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-black">
                3
              </div>
              <h2 className="text-base font-bold text-gray-900">Selecione a Data</h2>
            </div>
            <span className="text-primary text-sm font-semibold capitalize">{monthName}</span>
          </div>

          <div className="flex gap-3 overflow-x-auto px-4 no-scrollbar">
            {days.map((day) => (
              <DateCard
                key={day.iso}
                day={day}
                isSelected={selectedDateIso === day.iso}
                onClick={() => setSelectedDateIso(day.iso)}
              />
            ))}
          </div>
        </section>

        {/* ─── 4. Selecione o Horário ─── */}
        <section>
          <div className="flex items-center gap-2 px-4 mb-4">
            <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-black">
              4
            </div>
            <h2 className="text-base font-bold text-gray-900">Selecione o Horário</h2>
          </div>

          <div className="grid grid-cols-3 gap-3 px-4">
            {timeSlots.map((slot) => (
              <TimeSlotButton
                key={slot.time}
                slot={slot}
                isSelected={selectedTime === slot.time}
                onClick={() => setSelectedTime(slot.time)}
              />
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
            <span className="w-3 h-3 bg-gray-200 rounded-sm inline-block" />
            Horários riscados estão ocupados
          </p>
        </section>
      </div>

      {/* ── Sticky Footer / Resumo ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 p-4 pb-8 z-50">
        {/* Summary row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col gap-0.5">
            <span className="section-label">Resumo</span>
            <span className="font-bold text-gray-900 text-sm">
              {selectedPet ? selectedPet.name : "—"}{" "}
              {selectedService ? `• ${selectedService.name}` : ""}
            </span>
            {selectedDateIso && selectedTime && (
              <span className="text-xs text-gray-500">
                {selectedDay?.dayName}, {selectedDay?.dayNum} de {monthName} às {selectedTime}
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-primary">
              {selectedService ? formatCurrency(selectedService.price) : "—"}
            </span>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!isReady || isSubmitting}
          className={cn(
            "w-full btn-primary justify-center text-base",
            !isReady && "opacity-40 cursor-not-allowed hover:translate-y-0 hover:shadow-primary-sm"
          )}
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Confirmando...
            </>
          ) : (
            <>
              Confirmar Agendamento
              <MaterialIcon icon="chevron_right" size="sm" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
