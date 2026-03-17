"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon } from "@/components/ui";
import { cn, formatCurrency } from "@/lib/utils";

/* ─── Types ─── */
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  duration: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

type FetchedPet = {
  id: string;
  name: string;
  species: string;
  client: {
    petShopId: string;
  };
};

/* ─── Mock data for Services & Time (these would eventually come from the Pet Shop API) ─── */
// Array original (removido para usar API)
// const mockServices: Service[] = [...];

const timeSlots: TimeSlot[] = [
  { time: "08:00", available: true },
  { time: "09:00", available: true },
  { time: "10:00", available: false },
  { time: "11:00", available: true },
  { time: "14:00", available: true },
  { time: "15:00", available: false },
  { time: "16:00", available: true },
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

function PetItem({ pet, isSelected, onClick }: { pet: FetchedPet; isSelected: boolean; onClick: () => void }) {
  const icon = pet.species === "gato" ? "cruelty_free" : "pets";
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 w-20 flex-shrink-0 cursor-pointer transition-all duration-200"
    >
      <div className="relative">
        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200", isSelected ? "bg-primary/15 ring-4 ring-primary ring-offset-2" : "bg-gray-100 ring-2 ring-transparent grayscale")}>
          <MaterialIcon icon={icon} size="lg" className={cn(isSelected ? "text-primary" : "text-gray-400")} fill={isSelected} />
        </div>
        {isSelected && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center animate-scale-in">
            <MaterialIcon icon="check" className="text-[13px]!" />
          </span>
        )}
      </div>
      <p className={cn("text-sm font-semibold text-center leading-tight", isSelected ? "text-primary" : "text-gray-500")}>{pet.name}</p>
    </button>
  );
}

function ServiceCard({ service, isSelected, onClick }: { service: Service; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn("flex items-center gap-4 bg-white p-4 rounded-xl border-2 shadow-card transition-all duration-200 text-left w-full", isSelected ? "border-primary shadow-primary-sm" : "border-gray-200 hover:border-primary/30")}
    >
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200", isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-500")}>
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
        <p className={cn("font-bold", isSelected ? "text-primary" : "text-gray-900")}>{formatCurrency(service.price)}</p>
        <div className="flex justify-end mt-2">
          <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200", isSelected ? "border-primary bg-primary" : "border-gray-300")}>
            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>
        </div>
      </div>
    </button>
  );
}

function DateCard({ day, isSelected, onClick }: { day: { iso: string; dayName: string; dayNum: number; isDisabled: boolean }; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={!day.isDisabled ? onClick : undefined}
      disabled={day.isDisabled}
      className={cn("flex flex-col items-center justify-center min-w-[64px] h-20 rounded-xl border-2 transition-all duration-200 flex-shrink-0", isSelected ? "bg-primary border-primary text-white" : day.isDisabled ? "bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed" : "bg-white border-gray-200 shadow-card")}
    >
      <p className={cn("text-[10px] uppercase font-bold", isSelected ? "text-white/80" : "text-gray-400")}>{day.dayName}</p>
      <p className="text-2xl font-black mt-0.5">{day.dayNum}</p>
    </button>
  );
}

function TimeSlotButton({ slot, isSelected, onClick }: { slot: TimeSlot; isSelected: boolean; onClick: () => void }) {
  if (!slot.available) {
    return <div className="bg-gray-100 text-gray-400 py-3 rounded-xl text-center font-medium line-through text-sm select-none">{slot.time}</div>;
  }
  return (
    <button onClick={onClick} className={cn("py-3 rounded-xl text-center font-bold text-sm border-2 transition-all duration-200", isSelected ? "bg-primary border-primary text-white" : "bg-white border-gray-200 text-gray-700")}>
      {slot.time}
    </button>
  );
}

export default function AgendamentoPage() {
  const days = useMemo(() => getNextDays(14), []);
  const [myPets, setMyPets] = useState<FetchedPet[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedDateIso, setSelectedDateIso] = useState<string>(days.find((d) => !d.isDisabled)?.iso ?? "");
  const [selectedTime, setSelectedTime] = useState<string>("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchPets() {
      try {
        const response = await fetch("/api/pets");
        const json = await response.json();
        if (json.data && json.data.length > 0) {
          setMyPets(json.data);
          setSelectedPetId(json.data[0].id);
        }
      } catch (error) {
        console.error("Erro ao buscar pets:", error);
      } finally {
        setLoadingPets(false);
      }
    }
    
    async function fetchServices() {
      try {
        const res = await fetch("/api/services");
        const json = await res.json();
        if (json.data) {
          const mappedServices = json.data.map((s: any) => ({
            id: s.id,
            name: s.label,
            description: s.type === "banho" ? "Higiene completa" : "Acabamento especial",
            price: s.price,
            icon: s.type === "banho" ? "bathtub" : "content_cut",
            duration: `${s.durationMin} min`,
          }));
          setServices(mappedServices);
        }
      } catch (err) {
        console.error("Erro ao carregar serviços:", err);
      } finally {
        setLoadingServices(false);
      }
    }
    
    fetchPets();
    fetchServices();
  }, []);

  // Em produção, você deverá listar os serviços na API do Pet Shop. Use o mock com CUIDs falsos com cautela, a API pode quebrar.
  // Já que mockamos os CUIDs pros serviços, a API retornará 404 Service Not Found.
  // Para fins demonstração da interface, a chamada via API abaixo pode ser ajustada.

  const selectedPet = myPets.find((p) => p.id === selectedPetId);
  const selectedService = services.find((s) => s.id === selectedServiceId);

  const isReady = !!selectedPetId && !!selectedServiceId && !!selectedDateIso && !!selectedTime;

  const selectedDay = days.find((d) => d.iso === selectedDateIso);
  const monthName = selectedDateIso ? new Date(selectedDateIso + "T12:00:00").toLocaleDateString("pt-BR", { month: "long" }) : "";

  async function handleConfirm() {
    if (!isReady || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: selectedPetId,
          petShopId: selectedPet?.client?.petShopId ?? "cm85jxxxb00021xyzv1", // Default to mocked pet shop ID if fails
          serviceId: selectedServiceId, 
          date: new Date(`${selectedDateIso}T${selectedTime}:00`).toISOString(),
        }),
      });

      const json = await response.json();
      
      if (!response.ok) {
        throw new Error(json.error || "Erro ao agendar.");
      }

      setIsConfirmed(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
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
            <p className="text-gray-500">{selectedPet?.name} — {selectedService?.name}</p>
            <p className="text-gray-400 text-sm mt-1">{selectedDay?.dayName}, {selectedDay?.dayNum} de {monthName} às {selectedTime}</p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Link href="/cliente/inicio" className="btn-primary w-full justify-center">
              <MaterialIcon icon="home" size="sm" />
              Ir para o início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-light">
      <PageHeader title="Novo Agendamento" showBack backHref="/cliente/inicio" />

      <div className="flex flex-col gap-8 py-6 pb-40">
        {/* 1. Selecionar Pet */}
        <section>
          <div className="flex items-center gap-2 px-4 mb-4">
            <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-black">1</div>
            <h2 className="text-base font-bold text-gray-900">Selecione o Pet</h2>
          </div>

          <div className="flex gap-4 overflow-x-auto px-4 pb-2 no-scrollbar">
            {loadingPets ? (
              <p className="text-sm text-gray-500">Carregando seus pets...</p>
            ) : myPets.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum pet encontrado.</p>
            ) : (
              myPets.map((pet) => (
                <PetItem
                  key={pet.id}
                  pet={pet}
                  isSelected={selectedPetId === pet.id}
                  onClick={() => setSelectedPetId(pet.id)}
                />
              ))
            )}
            {!loadingPets && (
              <Link href="/cliente/meus-pets/novo" className="flex flex-col items-center gap-2 w-20 flex-shrink-0">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-primary/50 transition-all duration-200">
                  <MaterialIcon icon="add" size="md" className="text-gray-400" />
                </div>
                <p className="text-xs font-medium text-gray-400 text-center">Novo</p>
              </Link>
            )}
          </div>
        </section>

        {/* 2. Selecionar Serviço */}
        <section>
          <div className="flex items-center gap-2 px-4 mb-4">
            <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-black">2</div>
            <h2 className="text-base font-bold text-gray-900">Selecione o Serviço</h2>
          </div>
          <div className="flex flex-col gap-3 max-h-56 overflow-y-auto no-scrollbar scroll-smooth relative">
            {loadingServices ? (
              <p className="text-sm text-gray-500 py-2">Carregando serviços...</p>
            ) : services.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">Nenhum serviço disponível.</p>
            ) : services.map((service) => (
              <ServiceCard key={service.id} service={service} isSelected={selectedServiceId === service.id} onClick={() => setSelectedServiceId(service.id)} />
            ))}
          </div>
        </section>

        {/* 3. Selecionar Data */}
        <section>
          <div className="flex items-center justify-between px-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-black">3</div>
              <h2 className="text-base font-bold text-gray-900">Selecione a Data</h2>
            </div>
            <span className="text-primary text-sm font-semibold capitalize">{monthName}</span>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 no-scrollbar">
            {days.map((day) => (
              <DateCard key={day.iso} day={day} isSelected={selectedDateIso === day.iso} onClick={() => setSelectedDateIso(day.iso)} />
            ))}
          </div>
        </section>

        {/* 4. Selecionar Horário */}
        <section>
          <div className="flex items-center gap-2 px-4 mb-4">
            <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-black">4</div>
            <h2 className="text-base font-bold text-gray-900">Selecione o Horário</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 px-4">
            {timeSlots.map((slot) => (
              <TimeSlotButton key={slot.time} slot={slot} isSelected={selectedTime === slot.time} onClick={() => setSelectedTime(slot.time)} />
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 p-4 pb-8 z-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col gap-0.5">
            <span className="section-label">Resumo</span>
            <span className="font-bold text-gray-900 text-sm">
              {selectedPet ? selectedPet.name : "—"} {selectedService ? `• ${selectedService.name}` : ""}
            </span>
            {selectedDateIso && selectedTime && (
              <span className="text-xs text-gray-500">
                {selectedDay?.dayName}, {selectedDay?.dayNum} de {monthName} às {selectedTime}
              </span>
            )}
            {errorMsg && <span className="text-xs text-red-500 mt-1">{errorMsg}</span>}
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-primary">
              {selectedService ? formatCurrency(selectedService.price) : "—"}
            </span>
          </div>
        </div>

        <button onClick={handleConfirm} disabled={!isReady || isSubmitting} className={cn("w-full btn-primary justify-center text-base flex items-center gap-2", !isReady && "opacity-40 cursor-not-allowed hover:translate-y-0")}>
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Agendando...
            </>
          ) : "Confirmar Agendamento"}
        </button>
      </div>
    </div>
  );
}
