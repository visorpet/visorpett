"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/lib/supabase/useUser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Badge, Avatar } from "@/components/ui";
import { formatCurrency, cn, formatDate } from "@/lib/utils";

/* ─── Utils ─── */
function getNextDays(count: number) {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayName = date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
    const dayNum = date.getDate();
    const iso = date.toISOString().split("T")[0];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    days.push({ dayName, dayNum, iso, isDisabled: isWeekend });
  }
  return days;
}

const timeSlots: { time: string; available: boolean }[] = [
  { time: "08:00", available: true },
  { time: "09:00", available: true },
  { time: "10:00", available: false },
  { time: "11:00", available: true },
  { time: "13:00", available: true },
  { time: "14:00", available: true },
  { time: "15:00", available: true },
  { time: "16:00", available: false },
  { time: "17:00", available: true },
];

export default function AgendamentoPage() {
  const { user } = useUser();
  const router = useRouter();
  
  const days = useMemo(() => getNextDays(14), []);
  
  const [pets, setPets] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form State
  const [selectedPet, setSelectedPet] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDateIso, setSelectedDateIso] = useState<string>(days.find((d) => !d.isDisabled)?.iso ?? "");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoadingInitial(true);
        const [petsRes, servicesRes] = await Promise.all([
          fetch("/api/pets"),
          fetch("/api/services")
        ]);
        
        const petsJson = await petsRes.json();
        const servicesJson = await servicesRes.json();
        
        if (petsJson.data) setPets(petsJson.data);
        if (servicesJson.data) setServices(servicesJson.data);

        if (petsJson.data?.length > 0) setSelectedPet(petsJson.data[0].id);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadInitialData();
  }, []);

  const pet = pets.find(p => p.id === selectedPet);
  const service = services.find(s => s.id === selectedService);
  const isReady = !!selectedPet && !!selectedService && !!selectedDateIso && !!selectedTime;

  async function handleConfirm() {
    if (!isReady) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: selectedPet,
          petShopId: pet?.client?.petShopId || "default", 
          serviceId: selectedService, 
          date: new Date(`${selectedDateIso}T${selectedTime}:00`).toISOString(),
          notes
        }),
      });
      if (res.ok) {
        setIsConfirmed(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isConfirmed) {
    return (
      <div className="page-container flex flex-col items-center justify-center text-center p-6 min-h-screen font-sans">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <MaterialIcon icon="check_circle" size="xl" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Agendamento Confirmado!</h1>
        <p className="text-gray-500 mb-8 max-w-xs leading-relaxed">
          Tudo pronto para o atendimento de <span className="font-bold text-gray-900">{pet?.name}</span>.
        </p>
        <button onClick={() => router.push("/cliente/inicio")} className="btn-primary w-full max-w-xs">Voltar para o Início</button>
      </div>
    );
  }

  return (
    <div className="page-container font-sans pb-32">
      <PageHeader title="Agendar" userAvatar={{ name: user?.name || "Tutor", src: user?.image || undefined, href: "/cliente/perfil" }} />

      <div className="flex flex-col gap-8 py-4">
        {/* 1. Selecionar Pet */}
        <section className="animate-slide-up">
          <p className="section-label mb-4">Para qual pet?</p>
          <div className="flex gap-4 overflow-x-auto pb-4 px-1 -mx-4 container-no-scrollbar">
            {pets.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPet(p.id)}
                className={cn(
                  "flex flex-col items-center gap-2 min-w-[80px] transition-all duration-300",
                  selectedPet === p.id ? "scale-110 opacity-100" : "opacity-40 grayscale-[50%]"
                )}
              >
                <div className={cn("rounded-full p-1", selectedPet === p.id ? "bg-primary" : "bg-transparent")}>
                   <Avatar src={p.photoUrl || undefined} name={p.name} size="lg" className="border-2 border-white" />
                </div>
                <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">{p.name}</p>
              </button>
            ))}
            <Link href="/cliente/meus-pets/novo" className="flex flex-col items-center gap-2 min-w-[80px]">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                <MaterialIcon icon="add" />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Novo pet</p>
            </Link>
          </div>
        </section>

        {/* 2. Selecionar Serviço */}
        <section className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          <p className="section-label mb-4">Qual o serviço?</p>
          <div className="flex flex-col gap-3">
            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => setSelectedService(svc.id)}
                className={cn(
                  "card p-5 text-left flex items-center justify-between group transition-all duration-300",
                  selectedService === svc.id ? "border-primary ring-2 ring-primary bg-primary/5" : "hover:border-primary/30"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", selectedService === svc.id ? "bg-primary text-white" : "bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary")}>
                    <MaterialIcon icon={svc.type === 'banho' ? 'bathtub' : 'content_cut'} size="md" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-base">{svc.label}</p>
                    <p className="text-xs text-gray-500 font-medium">{svc.durationMin} minutos</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="font-black text-primary text-lg">{formatCurrency(svc.price)}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 3. Selecionar Data */}
        <section className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          <p className="section-label mb-4">Quando?</p>
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 container-no-scrollbar">
            {days.map((d) => (
              <button
                key={d.iso}
                disabled={d.isDisabled}
                onClick={() => setSelectedDateIso(d.iso)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[64px] h-20 rounded-2xl border transition-all duration-300",
                  d.isDisabled ? "bg-gray-50 border-gray-100 opacity-20 cursor-not-allowed" :
                  selectedDateIso === d.iso ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105" : "bg-white border-gray-100 text-gray-500 hover:border-primary/50"
                )}
              >
                <span className="text-[10px] font-black uppercase tracking-widest mb-1">{d.dayName}</span>
                <span className="text-xl font-black">{d.dayNum}</span>
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-3 mt-4">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => setSelectedTime(slot.time)}
                className={cn(
                  "py-3 rounded-xl border font-bold text-sm transition-all duration-200",
                  !slot.available ? "bg-gray-50 border-gray-100 text-gray-300 line-through cursor-not-allowed" :
                  selectedTime === slot.time ? "bg-primary border-primary text-white shadow-md shadow-primary/10" : "bg-white border-gray-100 text-gray-600 hover:border-primary/30"
                )}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Floating Confirm Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button
            disabled={!isReady || isSubmitting}
            onClick={handleConfirm}
            className={cn(
              "btn-primary w-full h-14 shadow-2xl transition-all duration-300 flex items-center justify-center gap-3",
              !isReady ? "opacity-30 cursor-not-allowed grayscale" : "hover:scale-[1.02] active:scale-95 shadow-primary/40"
            )}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                Agendando...
              </>
            ) : (
              <>
                Confirmar Agendamento {service ? `(${formatCurrency(service.price)})` : ""}
                <MaterialIcon icon="arrow_forward" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
