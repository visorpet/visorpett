"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Badge } from "@/components/ui";
import { cn, formatCurrency } from "@/lib/utils";

function getNext14Days() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    days.push({
      iso: d.toISOString().split("T")[0],
      dayName: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
      dayNum: d.getDate(),
      isDisabled: isWeekend,
    });
  }
  return days;
}

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const days = useMemo(() => getNext14Days(), []);

  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [groomers, setGroomers] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<{ time: string; available: boolean }[]>([]);

  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedPetId, setSelectedPetId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedGroomerId, setSelectedGroomerId] = useState("");
  const [selectedDate, setSelectedDate] = useState(days.find(d => !d.isDisabled)?.iso ?? "");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [clientSearch, setClientSearch] = useState("");

  const [petShopId, setPetShopId] = useState("");
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load clients, services, groomers and petShopId
  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then(r => r.json()),
      fetch("/api/services").then(r => r.json()),
      fetch("/api/groomers").then(r => r.json()),
      fetch("/api/petshops/me").then(r => r.json()),
    ]).then(([cJson, sJson, gJson, shopJson]) => {
      setClients(cJson.data ?? []);
      setServices(sJson.data ?? []);
      setGroomers(gJson.data ?? []);
      if (shopJson.data?.id) setPetShopId(shopJson.data.id);
    }).finally(() => setLoadingInit(false));
  }, []);

  // Load time slots when date changes
  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedTime("");
    const qs = petShopId ? `petShopId=${petShopId}&date=${selectedDate}` : `date=${selectedDate}`;
    fetch(`/api/appointments/availability?${qs}`)
      .then(r => r.json())
      .then(json => {
        const raw = json.data ?? [];
        // API returns array of {time, available} or just strings
        if (raw.length > 0 && typeof raw[0] === "string") {
          setTimeSlots(raw.map((t: string) => ({ time: t, available: true })));
        } else {
          setTimeSlots(raw);
        }
      })
      .catch(() => setTimeSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, petShopId]);

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const clientPets = selectedClient?.pets ?? [];
  const selectedService = services.find(s => s.id === selectedServiceId);
  const filteredClients = clientSearch.trim()
    ? clients.filter(c =>
        c.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.phone?.includes(clientSearch)
      )
    : clients;

  const isReady = !!selectedPetId && !!selectedServiceId && !!selectedDate && !!selectedTime;

  async function handleSubmit() {
    if (!isReady) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: selectedPetId,
          petShopId,
          serviceId: selectedServiceId,
          groomerId: selectedGroomerId || undefined,
          date: new Date(`${selectedDate}T${selectedTime}:00`).toISOString(),
          notes: notes || undefined,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        router.push("/dono/agenda");
      } else {
        setSubmitError(json.error ?? "Erro ao criar agendamento");
      }
    } catch {
      setSubmitError("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingInit) {
    return (
      <div className="page-container p-5 animate-pulse flex flex-col gap-5">
        <div className="w-1/2 h-8 bg-gray-200 rounded-md" />
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="page-container pb-36 font-sans">
      <PageHeader title="Novo Agendamento" showBack />

      <div className="flex flex-col gap-6 py-4">

        {/* 1. Cliente */}
        <section>
          <p className="section-label mb-3">Cliente</p>
          <div className="relative mb-3">
            <MaterialIcon icon="search" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={clientSearch}
              onChange={e => setClientSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl pl-9 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
            {filteredClients.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum cliente encontrado</p>
            )}
            {filteredClients.map(c => (
              <button
                key={c.id}
                onClick={() => { setSelectedClientId(c.id); setSelectedPetId(""); }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl border text-left transition-all",
                  selectedClientId === c.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-gray-100 bg-white hover:border-primary/30"
                )}
              >
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MaterialIcon icon="person" size="sm" className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{c.name}</p>
                  {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
                </div>
                {c.pets?.length > 0 && (
                  <Badge variant="neutral" className="text-[10px]">{c.pets.length} pet{c.pets.length > 1 ? "s" : ""}</Badge>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* 2. Pet */}
        {selectedClientId && (
          <section className="animate-slide-up">
            <p className="section-label mb-3">Pet</p>
            {clientPets.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-2xl">Este cliente não tem pets cadastrados</p>
            ) : (
              <div className="flex gap-3 flex-wrap">
                {clientPets.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPetId(p.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-bold text-sm transition-all",
                      selectedPetId === p.id
                        ? "bg-primary text-white border-primary shadow-md"
                        : "bg-white text-gray-700 border-gray-200 hover:border-primary/50"
                    )}
                  >
                    <MaterialIcon icon="pets" size="xs" fill={selectedPetId === p.id} />
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 3. Serviço */}
        <section>
          <p className="section-label mb-3">Serviço</p>
          <div className="flex flex-col gap-2">
            {services.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedServiceId(s.id)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border text-left transition-all",
                  selectedServiceId === s.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-gray-100 bg-white hover:border-primary/30"
                )}
              >
                <div>
                  <p className="font-bold text-gray-900 text-sm">{s.label}</p>
                  <p className="text-xs text-gray-400">{s.durationMin} min</p>
                </div>
                <p className="font-black text-primary">{formatCurrency(s.price)}</p>
              </button>
            ))}
          </div>
        </section>

        {/* 4. Tosador (opcional) */}
        {groomers.length > 0 && (
          <section>
            <p className="section-label mb-3">Tosador <span className="text-gray-400 normal-case font-normal">(opcional)</span></p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedGroomerId("")}
                className={cn(
                  "px-4 py-2 rounded-2xl border text-sm font-bold transition-all",
                  !selectedGroomerId ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200"
                )}
              >
                Qualquer
              </button>
              {groomers.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGroomerId(g.id)}
                  className={cn(
                    "px-4 py-2 rounded-2xl border text-sm font-bold transition-all",
                    selectedGroomerId === g.id ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200"
                  )}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 5. Data */}
        <section>
          <p className="section-label mb-3">Data</p>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
            {days.map(d => (
              <button
                key={d.iso}
                disabled={d.isDisabled}
                onClick={() => setSelectedDate(d.iso)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[60px] h-[72px] rounded-2xl border transition-all flex-shrink-0",
                  d.isDisabled
                    ? "bg-gray-50 border-gray-100 opacity-20 cursor-not-allowed"
                    : selectedDate === d.iso
                    ? "bg-primary border-primary text-white shadow-md scale-105"
                    : "bg-white border-gray-100 text-gray-500 hover:border-primary/50"
                )}
              >
                <span className="text-[9px] font-black uppercase tracking-wider">{d.dayName}</span>
                <span className="text-lg font-black">{d.dayNum}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 6. Horário */}
        <section>
          <p className="section-label mb-3">Horário</p>
          {loadingSlots ? (
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-11 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : timeSlots.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-2xl">Nenhum horário disponível</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map(slot => (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => setSelectedTime(slot.time)}
                  className={cn(
                    "py-2.5 rounded-xl border font-bold text-sm transition-all",
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
        </section>

        {/* 7. Observações */}
        <section>
          <label className="section-label mb-2 block">Observações <span className="text-gray-400 normal-case font-normal">(opcional)</span></label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ex: tosa na tesoura, cliente prefere horário cedo..."
            className="input w-full min-h-[80px] resize-none"
          />
        </section>
      </div>

      {/* Error */}
      {submitError && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <MaterialIcon icon="error" size="sm" className="text-red-500 flex-shrink-0" />
          <p className="text-red-600 text-sm">{submitError}</p>
        </div>
      )}

      {/* Resumo + Botão fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-3 pb-6 shadow-lg">
        <div className="max-w-md mx-auto">
          {isReady && selectedService && (
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-3 px-1">
              <span>{selectedService.label} · {selectedDate} às {selectedTime}</span>
              <span className="text-primary">{formatCurrency(selectedService.price)}</span>
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={!isReady || submitting}
            className={cn(
              "w-full h-13 btn-primary flex items-center justify-center gap-2 py-4 rounded-2xl transition-all",
              !isReady ? "opacity-30 cursor-not-allowed" : "hover:scale-[1.01] active:scale-[0.99]"
            )}
          >
            {submitting
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <MaterialIcon icon="check" size="sm" />
            }
            {submitting ? "Agendando..." : "Confirmar agendamento"}
          </button>
        </div>
      </div>
    </div>
  );
}
