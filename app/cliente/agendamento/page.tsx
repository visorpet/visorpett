"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/lib/supabase/useUser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Avatar } from "@/components/ui";
import { formatCurrency, cn } from "@/lib/utils";

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

const SERVICE_ICONS: Record<string, string> = {
  banho:        "bathtub",
  tosa:         "content_cut",
  banho_e_tosa: "shower",
  consulta:     "medical_services",
  vacina:       "vaccines",
  outro:        "more_horiz",
};

export default function AgendamentoPage() {
  const { user } = useUser();
  const router   = useRouter();
  const days     = useMemo(() => getNextDays(14), []);

  // Data
  const [petshops, setPetshops]       = useState<any[]>([]);
  const [pets, setPets]               = useState<any[]>([]);
  const [services, setServices]       = useState<any[]>([]);
  const [timeSlots, setTimeSlots]     = useState<{ time: string; available: boolean }[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSlots, setLoadingSlots]     = useState(false);

  // Form state
  const [selectedPetshop, setSelectedPetshop] = useState<string>("");
  const [selectedPet, setSelectedPet]         = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDateIso, setSelectedDateIso] = useState<string>(
    days.find((d) => !d.isDisabled)?.iso ?? ""
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes]               = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed]   = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);

  // Load petshops + pets on mount
  useEffect(() => {
    async function load() {
      try {
        const [shopsRes, petsRes] = await Promise.all([
          fetch("/api/petshops/list"),
          fetch("/api/pets"),
        ]);
        const [shopsJson, petsJson] = await Promise.all([shopsRes.json(), petsRes.json()]);
        setPetshops(shopsJson.data ?? []);
        setPets(petsJson.data ?? []);
        if (petsJson.data?.length > 0) setSelectedPet(petsJson.data[0].id);
        if (shopsJson.data?.length === 1) setSelectedPetshop(shopsJson.data[0].id);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoadingInitial(false);
      }
    }
    load();
  }, []);

  // Load services when petshop changes
  useEffect(() => {
    if (!selectedPetshop) { setServices([]); return; }
    fetch(`/api/services?petShopId=${selectedPetshop}`)
      .then((r) => r.json())
      .then((json) => setServices(json.data ?? []))
      .catch(() => setServices([]));
  }, [selectedPetshop]);

  // Load availability when date or petshop changes
  useEffect(() => {
    if (!selectedPetshop || !selectedDateIso) { setTimeSlots([]); return; }
    setLoadingSlots(true);
    setSelectedTime("");
    fetch(`/api/appointments/availability?petShopId=${selectedPetshop}&date=${selectedDateIso}`)
      .then((r) => r.json())
      .then((json) => setTimeSlots(json.data ?? []))
      .catch(() => setTimeSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedPetshop, selectedDateIso]);

  const pet     = pets.find((p) => p.id === selectedPet);
  const service = services.find((s) => s.id === selectedService);
  const isReady = !!selectedPetshop && !!selectedPet && !!selectedService && !!selectedDateIso && !!selectedTime;

  async function handleConfirm() {
    if (!isReady) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/appointments", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId:      selectedPet,
          petShopId:  selectedPetshop,
          serviceId:  selectedService,
          date:       new Date(`${selectedDateIso}T${selectedTime}:00`).toISOString(),
          notes:      notes || undefined,
        }),
      });
      if (res.ok) {
        setIsConfirmed(true);
      } else {
        const json = await res.json();
        setSubmitError(json.error ?? "Erro ao agendar");
      }
    } catch (err) {
      setSubmitError("Erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ── Success screen ── */
  if (isConfirmed) {
    return (
      <div className="page-container flex flex-col items-center justify-center text-center p-6 min-h-screen">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <MaterialIcon icon="check_circle" size="xl" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Agendamento Confirmado!</h1>
        <p className="text-gray-500 mb-8 max-w-xs leading-relaxed">
          Tudo pronto para o atendimento de{" "}
          <span className="font-bold text-gray-900">{pet?.name}</span>.
        </p>
        <button onClick={() => router.push("/cliente/inicio")} className="btn-primary w-full max-w-xs">
          Voltar para o Início
        </button>
      </div>
    );
  }

  return (
    <div className="page-container pb-32">
      <PageHeader
        title="Agendar"
        userAvatar={{ name: user?.name ?? "Tutor", src: user?.image ?? undefined, href: "/cliente/perfil" }}
      />

      <div className="flex flex-col gap-8 py-4">

        {/* 0. Selecionar Pet Shop */}
        <section className="animate-slide-up">
          <p className="section-label mb-3">Onde?</p>
          {loadingInitial ? (
            <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ) : petshops.length === 0 ? (
            <div className="card text-center py-6">
              <p className="text-gray-400 text-sm">Nenhum pet shop disponível</p>
            </div>
          ) : (
            <div className="space-y-2">
              {petshops.map((shop) => (
                <button
                  key={shop.id}
                  onClick={() => setSelectedPetshop(shop.id)}
                  className={cn(
                    "card w-full text-left flex items-center gap-4 transition-all duration-200",
                    selectedPetshop === shop.id
                      ? "border-primary ring-2 ring-primary bg-primary/5"
                      : "hover:border-primary/30"
                  )}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MaterialIcon icon="storefront" size="sm" className="text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{shop.name}</p>
                    <p className="text-xs text-gray-500">{shop.city}, {shop.state}</p>
                  </div>
                  {selectedPetshop === shop.id && (
                    <MaterialIcon icon="check_circle" size="sm" className="text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 1. Selecionar Pet */}
        <section className="animate-slide-up">
          <p className="section-label mb-4">Para qual pet?</p>
          {pets.length === 0 ? (
            <div className="card text-center py-6">
              <p className="text-gray-400 text-sm mb-3">Você ainda não tem pets cadastrados</p>
              <Link href="/cliente/meus-pets/novo" className="btn-primary px-6 inline-block">
                Cadastrar Pet
              </Link>
            </div>
          ) : (
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
                    <Avatar src={p.photoUrl ?? undefined} name={p.name} size="lg" className="border-2 border-white" />
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
          )}
        </section>

        {/* 2. Selecionar Serviço */}
        {selectedPetshop && (
          <section className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <p className="section-label mb-4">Qual o serviço?</p>
            {services.length === 0 ? (
              <div className="card text-center py-6">
                <p className="text-gray-400 text-sm">Este pet shop ainda não cadastrou serviços</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {services.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedService(svc.id)}
                    className={cn(
                      "card p-5 text-left flex items-center justify-between group transition-all duration-300",
                      selectedService === svc.id
                        ? "border-primary ring-2 ring-primary bg-primary/5"
                        : "hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                        selectedService === svc.id
                          ? "bg-primary text-white"
                          : "bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary"
                      )}>
                        <MaterialIcon icon={SERVICE_ICONS[svc.type] ?? "pets"} size="md" />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-base">{svc.label}</p>
                        <p className="text-xs text-gray-500 font-medium">{svc.durationMin} minutos</p>
                      </div>
                    </div>
                    <p className="font-black text-primary text-lg">{formatCurrency(svc.price)}</p>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 3. Selecionar Data + Horário */}
        {selectedPetshop && (
          <section className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <p className="section-label mb-4">Quando?</p>

            {/* Dias */}
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 container-no-scrollbar">
              {days.map((d) => (
                <button
                  key={d.iso}
                  disabled={d.isDisabled}
                  onClick={() => setSelectedDateIso(d.iso)}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[64px] h-20 rounded-2xl border transition-all duration-300",
                    d.isDisabled
                      ? "bg-gray-50 border-gray-100 opacity-20 cursor-not-allowed"
                      : selectedDateIso === d.iso
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                      : "bg-white border-gray-100 text-gray-500 hover:border-primary/50"
                  )}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest mb-1">{d.dayName}</span>
                  <span className="text-xl font-black">{d.dayNum}</span>
                </button>
              ))}
            </div>

            {/* Horários reais */}
            <div className="mt-4">
              {loadingSlots ? (
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : timeSlots.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  Nenhum horário disponível para esta data
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={cn(
                        "py-3 rounded-xl border font-bold text-sm transition-all duration-200",
                        !slot.available
                          ? "bg-gray-50 border-gray-100 text-gray-300 line-through cursor-not-allowed"
                          : selectedTime === slot.time
                          ? "bg-primary border-primary text-white shadow-md"
                          : "bg-white border-gray-100 text-gray-600 hover:border-primary/30"
                      )}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 4. Observações */}
        {isReady && (
          <section className="animate-slide-up">
            <label className="section-label mb-2 block">Observações (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: o pet é nervoso com outros animais..."
              className="input w-full min-h-[80px] resize-none"
            />
          </section>
        )}
      </div>

      {/* Error */}
      {submitError && (
        <div className="mx-4 mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <MaterialIcon icon="error" size="sm" className="text-red-500 flex-shrink-0" />
          <p className="text-red-600 text-sm">{submitError}</p>
        </div>
      )}

      {/* Floating Confirm Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button
            disabled={!isReady || isSubmitting}
            onClick={handleConfirm}
            className={cn(
              "btn-primary w-full h-14 shadow-2xl transition-all duration-300 flex items-center justify-center gap-3",
              !isReady
                ? "opacity-30 cursor-not-allowed grayscale"
                : "hover:scale-[1.02] active:scale-95 shadow-primary/40"
            )}
          >
            {isSubmitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Agendando...
              </>
            ) : (
              <>
                Confirmar{service ? ` · ${formatCurrency(service.price)}` : ""}
                <MaterialIcon icon="arrow_forward" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
