"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type PetShop = {
  id: string; name: string; slug: string;
  phone?: string; address?: string; city?: string; state?: string; logoUrl?: string;
};
type Service = { id: string; type: string; label: string; price: number; durationMin: number };

type Step = 1 | 2 | 3 | 4 | 5;

const SERVICE_ICONS: Record<string, string> = {
  banho: "water_drop", tosa: "content_cut", banho_e_tosa: "spa",
  consulta: "stethoscope", vacina: "syringe", outro: "pets",
};

const SPECIES = [
  { value: "cachorro", label: "Cachorro", icon: "🐶" },
  { value: "gato",     label: "Gato",     icon: "🐱" },
  { value: "outro",    label: "Outro",    icon: "🐾" },
];

// Gera próximos 14 dias (exceto domingo)
function getNext14Days() {
  const days: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (days.length < 14) {
    if (d.getDay() !== 0) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_LABELS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function formatDateISO(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>();

  const [step, setStep] = useState<Step>(1);
  const [petShop, setPetShop] = useState<PetShop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingShop, setLoadingShop] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Form state
  const [petName,    setPetName]    = useState("");
  const [petSpecies, setPetSpecies] = useState<"cachorro"|"gato"|"outro">("cachorro");
  const [petBreed,   setPetBreed]   = useState("");
  const [service,    setService]    = useState<Service | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [timeSlots,   setTimeSlots]   = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [clientName,    setClientName]    = useState("");
  const [clientPhone,   setClientPhone]   = useState("");
  const [clientEmail,   setClientEmail]   = useState("");
  const [notes,         setNotes]         = useState("");
  const [deliveryType,  setDeliveryType]  = useState<"levar" | "buscar">("levar");
  const [clientAddress, setClientAddress] = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState<string | null>(null);
  // Abandonment tracking
  const [leadId, setLeadId] = useState<string | null>(null);
  // Waitlist
  const [showWaitlist,    setShowWaitlist]    = useState(false);
  const [waitlistName,    setWaitlistName]    = useState("");
  const [waitlistPhone,   setWaitlistPhone]   = useState("");
  const [waitlistPet,     setWaitlistPet]     = useState("");
  const [waitlistSending, setWaitlistSending] = useState(false);
  const [waitlistDone,    setWaitlistDone]    = useState(false);
  const [confirmed, setConfirmed] = useState<{
    appointment: { id: string; date: string; totalPrice: number };
    petShopName: string; serviceLabel: string; clientName: string; petName: string;
    ownerWaLink?: string | null;
  } | null>(null);

  const days = getNext14Days();

  // Abandonment: salva lead quando telefone tem 8+ dígitos no step 4
  useEffect(() => {
    if (step !== 4 || clientPhone.replace(/\D/g, "").length < 8) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/booking/${slug}/lead`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientPhone, clientName: clientName || undefined,
            petName: petName || undefined,
            serviceId: service?.id,
            step: 4,
            leadId,
          }),
        });
        const json = await res.json();
        if (json.data?.leadId && !leadId) setLeadId(json.data.leadId);
      } catch {}
    }, 1500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientPhone, step]);

  // Carrega petshop
  useEffect(() => {
    fetch(`/api/booking/${slug}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) { setNotFound(true); return; }
        setPetShop(json.data.petShop);
        setServices(json.data.services);
      })
      .finally(() => setLoadingShop(false));
  }, [slug]);

  // Carrega horários ao selecionar dia
  useEffect(() => {
    if (!selectedDay || !petShop) return;
    setTimeSlots([]);
    setSelectedTime(null);
    setLoadingSlots(true);
    fetch(`/api/booking/${slug}/availability?date=${formatDateISO(selectedDay)}`)
      .then(r => r.json())
      .then(json => setTimeSlots(json.data ?? []))
      .finally(() => setLoadingSlots(false));
  }, [selectedDay, slug, petShop]);

  async function handleSubmit() {
    if (!service || !selectedDay || !selectedTime || !petShop) return;
    setSubmitting(true);
    setSubmitError(null);

    const [h] = selectedTime.split(":");
    const dateObj = new Date(selectedDay);
    dateObj.setUTCHours(Number(h), 0, 0, 0);

    const deliveryNote = deliveryType === "buscar"
      ? `🚗 Buscar em casa: ${clientAddress}`
      : `🏪 Cliente leva o pet`;
    const fullNotes = [deliveryNote, notes.trim()].filter(Boolean).join("\n");

    const res = await fetch(`/api/booking/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName, clientPhone, clientEmail,
        petName, petSpecies, petBreed,
        serviceId: service.id,
        date: dateObj.toISOString(),
        notes: fullNotes,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setSubmitError(json.error ?? "Erro ao agendar");
      setSubmitting(false);
      return;
    }

    setConfirmed(json.data);
    setStep(5);
    setSubmitting(false);
    // Marca lead como convertido (fire & forget)
    if (leadId) {
      fetch(`/api/booking/${slug}/lead?leadId=${leadId}`, { method: "DELETE" }).catch(() => {});
    }
  }

  // ── Loading ──────────────────────────────────────────────────────
  if (loadingShop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (notFound || !petShop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Pet shop não encontrado</h1>
          <p className="text-gray-500 text-sm">Verifique o link e tente novamente.</p>
        </div>
      </div>
    );
  }

  // ── Confirmação final ────────────────────────────────────────────
  if (step === 5 && confirmed) {
    const aptDate = new Date(confirmed.appointment.date);
    return (
      <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <MaterialIcon icon="check_circle" size="xl" className="text-green-500" fill />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">Agendado!</h1>
            <p className="text-gray-500 text-sm mb-6">Seu horário está confirmado</p>

            <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-3 mb-6">
              <Row icon="storefront"     label="Pet shop"  value={confirmed.petShopName} />
              <Row icon="pets"           label="Pet"       value={confirmed.petName} />
              <Row icon="content_cut"    label="Serviço"   value={confirmed.serviceLabel} />
              <Row icon="calendar_today" label="Data"      value={aptDate.toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long" })} />
              <Row icon="schedule"       label="Horário"   value={aptDate.toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" })} />
              <Row icon="payments"       label="Valor"     value={`R$ ${confirmed.appointment.totalPrice.toFixed(2).replace(".", ",")}`} />
              <Row icon={deliveryType === "buscar" ? "directions_car" : "storefront"} label="Entrega" value={deliveryType === "buscar" ? `Busca em casa — ${clientAddress}` : "Você leva o pet"} />
            </div>

            <p className="text-xs text-gray-400 mb-2">
              Leve o comprovante de vacinação do seu pet.
            </p>

            {/* Botão WhatsApp do dono (fallback se auto-envio não configurado) */}
            {confirmed.ownerWaLink && (
              <a
                href={confirmed.ownerWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-semibold py-3 rounded-2xl hover:bg-[#1ebe5d] transition-colors mt-2"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.083.535 4.043 1.472 5.756L0 24l6.437-1.449A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.004-1.372l-.36-.214-3.718.836.875-3.63-.235-.374A9.818 9.818 0 0112 2.182c5.422 0 9.818 4.396 9.818 9.818 0 5.423-4.396 9.818-9.818 9.818z"/></svg>
                Enviar confirmação ao pet shop
              </a>
            )}
          </div>

          {/* CTA cadastro */}
          <div className="bg-primary/10 rounded-3xl p-6 text-center">
            <div className="text-3xl mb-2">🐶</div>
            <h2 className="font-bold text-gray-900 mb-1 text-sm">Acompanhe a saúde do seu pet</h2>
            <p className="text-xs text-gray-500 mb-4">
              Crie sua conta grátis e veja histórico de banhos, vacinas e consultas em um só lugar.
            </p>
            <Link
              href={`/cadastro?prefill=${encodeURIComponent(JSON.stringify({ name: confirmed.clientName, role: "CLIENTE" }))}`}
              className="btn-primary w-full block text-center text-sm"
            >
              Criar minha conta grátis
            </Link>
            <p className="text-xs text-gray-400 mt-3">Já tem conta? <Link href="/login" className="text-primary font-semibold">Entrar</Link></p>
          </div>
        </div>
      </div>
    );
  }

  // ── Header do pet shop ────────────────────────────────────────────
  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-bg-light flex flex-col">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-primary to-purple-700 px-5 pt-10 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <MaterialIcon icon="storefront" size="md" className="text-white" fill />
          </div>
          <div>
            <p className="text-white/60 text-xs">Agendar em</p>
            <h1 className="text-white font-bold text-lg leading-tight">{petShop.name}</h1>
            {petShop.city && (
              <p className="text-white/60 text-xs">{petShop.city}, {petShop.state}</p>
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white/50 text-xs mt-1.5">Passo {step} de 4</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-6">

        {/* ── Step 1: Dados do pet ──────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5 max-w-lg mx-auto">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Seu pet</h2>
              <p className="text-gray-500 text-sm">Nos conte um pouco sobre ele</p>
            </div>

            {/* Espécie */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de animal</label>
              <div className="grid grid-cols-3 gap-2">
                {SPECIES.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setPetSpecies(s.value as typeof petSpecies)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${
                      petSpecies === s.value
                        ? "border-primary bg-primary/5"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <span className="text-2xl">{s.icon}</span>
                    <span className="text-xs font-semibold text-gray-700">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nome do pet <span className="text-red-500">*</span>
              </label>
              <input
                className="input w-full"
                placeholder="Ex: Rex, Mel, Bolinha..."
                value={petName}
                onChange={e => setPetName(e.target.value)}
              />
            </div>

            {/* Raça (opcional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Raça <span className="text-gray-400 font-normal text-xs">(opcional)</span>
              </label>
              <input
                className="input w-full"
                placeholder="Ex: Labrador, Persa..."
                value={petBreed}
                onChange={e => setPetBreed(e.target.value)}
              />
            </div>

            <button
              type="button"
              disabled={!petName.trim()}
              onClick={() => setStep(2)}
              className="btn-primary w-full"
            >
              Continuar
              <MaterialIcon icon="arrow_forward" size="sm" />
            </button>
          </div>
        )}

        {/* ── Step 2: Serviço ──────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4 max-w-lg mx-auto">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Qual serviço?</h2>
              <p className="text-gray-500 text-sm">Escolha o que você precisa</p>
            </div>

            {services.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <MaterialIcon icon="sentiment_dissatisfied" size="xl" className="mb-2" />
                <p className="text-sm">Nenhum serviço disponível no momento</p>
              </div>
            ) : (
              <div className="space-y-2">
                {services.map(svc => (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => setService(svc)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      service?.id === svc.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      service?.id === svc.id ? "bg-primary/20" : "bg-gray-100"
                    }`}>
                      <MaterialIcon
                        icon={SERVICE_ICONS[svc.type] ?? "pets"}
                        size="md"
                        className={service?.id === svc.id ? "text-primary" : "text-gray-500"}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 text-sm">{svc.label}</p>
                      <p className="text-xs text-gray-500">{svc.durationMin} min</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">
                        R$ {svc.price.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                <MaterialIcon icon="arrow_back" size="sm" /> Voltar
              </button>
              <button
                type="button"
                disabled={!service}
                onClick={() => setStep(3)}
                className="btn-primary flex-1"
              >
                Continuar <MaterialIcon icon="arrow_forward" size="sm" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Data e horário ──────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5 max-w-lg mx-auto">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Quando?</h2>
              <p className="text-gray-500 text-sm">Escolha o melhor dia e horário</p>
            </div>

            {/* Calendário horizontal */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Data</label>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {days.map(day => {
                  const isSelected = selectedDay && formatDateISO(day) === formatDateISO(selectedDay);
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`flex-shrink-0 w-14 flex flex-col items-center gap-0.5 py-3 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-gray-100 bg-white text-gray-700 hover:border-gray-200"
                      }`}
                    >
                      <span className={`text-xs font-semibold ${isSelected ? "text-white/70" : "text-gray-400"}`}>
                        {DAY_LABELS[day.getDay()]}
                      </span>
                      <span className="text-lg font-black leading-none">{day.getDate()}</span>
                      <span className={`text-xs ${isSelected ? "text-white/70" : "text-gray-400"}`}>
                        {MONTH_LABELS[day.getMonth()]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Horários */}
            {selectedDay && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Horário disponível</label>
                {loadingSlots ? (
                  <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                    Verificando disponibilidade...
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="py-4">
                    <p className="text-sm text-gray-400 mb-3">Nenhum horário disponível neste dia.</p>
                    {!waitlistDone ? (
                      <button
                        type="button"
                        onClick={() => setShowWaitlist(true)}
                        className="flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/20 transition-colors"
                      >
                        🔔 Avise-me quando abrir uma vaga
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-semibold bg-green-50 px-4 py-2.5 rounded-xl">
                        ✅ Você está na lista de espera para este dia!
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                          selectedTime === slot
                            ? "border-primary bg-primary text-white"
                            : "border-gray-100 bg-white text-gray-700 hover:border-gray-200"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">
                <MaterialIcon icon="arrow_back" size="sm" /> Voltar
              </button>
              <button
                type="button"
                disabled={!selectedDay || !selectedTime}
                onClick={() => setStep(4)}
                className="btn-primary flex-1"
              >
                Continuar <MaterialIcon icon="arrow_forward" size="sm" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Dados do cliente + confirmar ─────────────── */}
        {step === 4 && (
          <div className="space-y-4 max-w-lg mx-auto">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Seus dados</h2>
              <p className="text-gray-500 text-sm">Para confirmar o agendamento</p>
            </div>

            {/* Resumo */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-2">
              <Row icon="pets"           label="Pet"      value={`${petName} (${petSpecies})`} small />
              <Row icon="content_cut"    label="Serviço"  value={service?.label ?? ""} small />
              <Row icon="calendar_today" label="Data"     value={selectedDay ? `${DAY_LABELS[selectedDay.getDay()]}, ${selectedDay.getDate()} de ${MONTH_LABELS[selectedDay.getMonth()]}` : ""} small />
              <Row icon="schedule"       label="Horário"  value={selectedTime ?? ""} small />
              <Row icon="payments"       label="Valor"    value={`R$ ${service?.price.toFixed(2).replace(".", ",") ?? "0,00"}`} small />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Seu nome <span className="text-red-500">*</span>
              </label>
              <input
                className="input w-full"
                placeholder="Nome completo"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                WhatsApp / Telefone <span className="text-red-500">*</span>
              </label>
              <input
                className="input w-full"
                placeholder="(62) 99999-9999"
                type="tel"
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
              />
            </div>

            {/* Entrega */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Como será a entrega do pet? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryType("levar")}
                  className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all ${
                    deliveryType === "levar"
                      ? "border-primary bg-primary/5"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <span className="text-2xl">🏪</span>
                  <span className={`text-xs font-semibold ${deliveryType === "levar" ? "text-primary" : "text-gray-700"}`}>
                    Vou levar
                  </span>
                  <span className="text-[10px] text-gray-400 text-center leading-tight">Levo meu pet ao pet shop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType("buscar")}
                  className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all ${
                    deliveryType === "buscar"
                      ? "border-primary bg-primary/5"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <span className="text-2xl">🚗</span>
                  <span className={`text-xs font-semibold ${deliveryType === "buscar" ? "text-primary" : "text-gray-700"}`}>
                    Buscar em casa
                  </span>
                  <span className="text-[10px] text-gray-400 text-center leading-tight">Pet shop busca e entrega</span>
                </button>
              </div>
            </div>

            {/* Endereço — obrigatório se buscar em casa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Seu endereço{" "}
                {deliveryType === "buscar"
                  ? <span className="text-red-500">*</span>
                  : <span className="text-gray-400 font-normal text-xs">(opcional)</span>
                }
              </label>
              <input
                className="input w-full"
                placeholder="Rua, número, bairro, cidade..."
                value={clientAddress}
                onChange={e => setClientAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                E-mail <span className="text-gray-400 font-normal text-xs">(opcional)</span>
              </label>
              <input
                className="input w-full"
                placeholder="seu@email.com"
                type="email"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Observações <span className="text-gray-400 font-normal text-xs">(opcional)</span>
              </label>
              <textarea
                className="input w-full resize-none"
                rows={2}
                placeholder="Ex: pet tem alergia, precisa de atenção especial..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {submitError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <MaterialIcon icon="error" size="sm" className="text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{submitError}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(3)} className="btn-secondary flex-1" disabled={submitting}>
                <MaterialIcon icon="arrow_back" size="sm" /> Voltar
              </button>
              <button
                type="button"
                disabled={!clientName.trim() || !clientPhone.trim() || (deliveryType === "buscar" && !clientAddress.trim()) || submitting}
                onClick={handleSubmit}
                className="btn-primary flex-1"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Agendando...
                  </span>
                ) : (
                  <>Confirmar <MaterialIcon icon="check" size="sm" /></>
                )}
              </button>
            </div>

            <p className="text-xs text-center text-gray-400 pb-4">
              Ao confirmar, você concorda com os termos do serviço
            </p>
          </div>
        )}
      </div>

      {/* ── Modal Waitlist ──────────────────────────────────────── */}
      {showWaitlist && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowWaitlist(false)} />
          <div className="relative bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-900">Lista de espera 🔔</h3>
              <button onClick={() => setShowWaitlist(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Te avisamos pelo WhatsApp quando abrir um horário para o dia selecionado.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Seu nome <span className="text-red-500">*</span></label>
                <input
                  className="input w-full"
                  placeholder="Nome completo"
                  value={waitlistName}
                  onChange={e => setWaitlistName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">WhatsApp <span className="text-red-500">*</span></label>
                <input
                  className="input w-full"
                  placeholder="(62) 99999-9999"
                  type="tel"
                  value={waitlistPhone}
                  onChange={e => setWaitlistPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nome do pet <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input
                  className="input w-full"
                  placeholder="Ex: Rex"
                  value={waitlistPet}
                  onChange={e => setWaitlistPet(e.target.value)}
                />
              </div>
            </div>

            <button
              type="button"
              disabled={!waitlistName.trim() || waitlistPhone.replace(/\D/g,"").length < 8 || waitlistSending}
              onClick={async () => {
                if (!selectedDay || !petShop) return;
                setWaitlistSending(true);
                try {
                  await fetch(`/api/booking/${slug}/waitlist`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      clientName:    waitlistName,
                      clientPhone:   waitlistPhone,
                      petName:       waitlistPet || undefined,
                      serviceId:     service?.id,
                      preferredDate: formatDateISO(selectedDay),
                    }),
                  });
                  setWaitlistDone(true);
                  setShowWaitlist(false);
                } catch {}
                setWaitlistSending(false);
              }}
              className="w-full mt-4 bg-primary text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-opacity"
            >
              {waitlistSending ? "Salvando…" : "Entrar na lista de espera"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente auxiliar de linha de resumo
function Row({ icon, label, value, small }: { icon: string; label: string; value: string; small?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <MaterialIcon icon={icon} size="sm" className="text-primary flex-shrink-0" />
      <span className={`text-gray-500 ${small ? "text-xs" : "text-sm"}`}>{label}:</span>
      <span className={`font-semibold text-gray-900 ${small ? "text-xs" : "text-sm"}`}>{value}</span>
    </div>
  );
}
