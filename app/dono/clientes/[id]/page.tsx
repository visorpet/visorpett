"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Avatar, Badge } from "@/components/ui";

/* ─── tipos ─── */
type Pet = { id: string; name: string; species: string; breed?: string | null };
type Appointment = {
  id: string;
  date: string;
  status: string;
  totalPrice: number;
  notes?: string | null;
  pet: { id: string; name: string; species: string };
  service: { id: string; label: string };
};
type ClientDetail = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  createdAt: string;
};

/* ─── helpers ─── */
const STATUS_MAP: Record<string, { label: string; color: "primary" | "success" | "warning" | "danger" | "neutral" }> = {
  agendado:        { label: "Agendado",       color: "primary" },
  confirmado:      { label: "Confirmado",     color: "success" },
  em_atendimento:  { label: "Em atendimento", color: "warning" },
  concluido:       { label: "Concluído",      color: "success" },
  cancelado:       { label: "Cancelado",      color: "danger" },
  faltou:          { label: "Faltou",         color: "neutral" },
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }) +
    " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function generateSlots() {
  const slots: string[] = [];
  for (let h = 8; h <= 17; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 17) slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}

function next14Days() {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  }).filter((d) => d.getDay() !== 0);
}

/* ─── Modal de reagendamento ─── */
function RescheduleModal({
  apt,
  onClose,
  onDone,
}: {
  apt: Appointment;
  onClose: () => void;
  onDone: () => void;
}) {
  const days = next14Days();
  const [selDay, setSelDay] = useState(days[0]);
  const [selTime, setSelTime] = useState("");
  const [saving, setSaving] = useState(false);

  async function confirm() {
    if (!selTime) return;
    setSaving(true);
    const [h, m] = selTime.split(":").map(Number);
    const dt = new Date(selDay);
    dt.setHours(h, m, 0, 0);
    await fetch(`/api/appointments/${apt.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dt.toISOString() }),
    });
    setSaving(false);
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Reagendar</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <MaterialIcon icon="close" size="sm" />
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Serviço</p>
        <p className="text-sm font-semibold text-gray-800 mb-4">
          {apt.service.label} · {apt.pet.name}
        </p>

        <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Escolha o dia</p>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {days.map((d) => {
            const isSelected = d.toDateString() === selDay.toDateString();
            return (
              <button
                key={d.toISOString()}
                onClick={() => { setSelDay(d); setSelTime(""); }}
                className={`flex-shrink-0 w-14 py-2 rounded-xl text-center text-xs font-semibold transition-colors ${
                  isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="block uppercase text-[10px] opacity-70">
                  {d.toLocaleDateString("pt-BR", { weekday: "short" })}
                </span>
                <span className="block text-base font-black">{d.getDate()}</span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Escolha o horário</p>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {generateSlots().map((t) => (
            <button
              key={t}
              onClick={() => setSelTime(t)}
              className={`py-2 rounded-xl text-sm font-semibold transition-colors ${
                selTime === t ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={confirm}
          disabled={!selTime || saving}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-opacity"
        >
          {saving ? "Salvando…" : "Confirmar reagendamento"}
        </button>
      </div>
    </div>
  );
}

/* ─── Modal novo agendamento ─── */
function NewBookingModal({
  clientId,
  pets,
  petShopId,
  onClose,
  onDone,
}: {
  clientId: string;
  pets: Pet[];
  petShopId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const days = next14Days();
  const [services, setServices] = useState<{ id: string; label: string; price: number }[]>([]);
  const [petId, setPetId] = useState(pets[0]?.id ?? "");
  const [serviceId, setServiceId] = useState("");
  const [selDay, setSelDay] = useState(days[0]);
  const [selTime, setSelTime] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((j) => {
        setServices(j.data ?? []);
        if (j.data?.length) setServiceId(j.data[0].id);
      })
      .catch(() => {});
  }, []);

  async function confirm() {
    if (!petId || !serviceId || !selTime) return;
    setSaving(true);
    const [h, m] = selTime.split(":").map(Number);
    const dt = new Date(selDay);
    dt.setHours(h, m, 0, 0);
    await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        petId,
        petShopId,
        serviceId,
        date: dt.toISOString(),
      }),
    });
    setSaving(false);
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Novo Agendamento</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <MaterialIcon icon="close" size="sm" />
          </button>
        </div>

        {pets.length > 1 && (
          <>
            <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Pet</p>
            <div className="flex gap-2 flex-wrap mb-4">
              {pets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPetId(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                    petId === p.id ? "bg-primary text-white" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </>
        )}

        <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Serviço</p>
        <div className="flex flex-col gap-2 mb-4">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => setServiceId(s.id)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                serviceId === s.id ? "border-primary bg-primary/5 text-primary" : "border-gray-100 text-gray-700"
              }`}
            >
              <span>{s.label}</span>
              <span className="text-xs opacity-70">R$ {s.price.toFixed(2).replace(".", ",")}</span>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Dia</p>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {days.map((d) => {
            const isSelected = d.toDateString() === selDay.toDateString();
            return (
              <button
                key={d.toISOString()}
                onClick={() => { setSelDay(d); setSelTime(""); }}
                className={`flex-shrink-0 w-14 py-2 rounded-xl text-center text-xs font-semibold transition-colors ${
                  isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="block uppercase text-[10px] opacity-70">
                  {d.toLocaleDateString("pt-BR", { weekday: "short" })}
                </span>
                <span className="block text-base font-black">{d.getDate()}</span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Horário</p>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {generateSlots().map((t) => (
            <button
              key={t}
              onClick={() => setSelTime(t)}
              className={`py-2 rounded-xl text-sm font-semibold transition-colors ${
                selTime === t ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={confirm}
          disabled={!petId || !serviceId || !selTime || saving}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-opacity"
        >
          {saving ? "Agendando…" : "Confirmar agendamento"}
        </button>
      </div>
    </div>
  );
}

/* ─── Página principal ─── */
export default function ClienteDetalhe() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{ client: ClientDetail; pets: Pet[]; appointments: Appointment[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [petShopId, setPetShopId] = useState("");
  const [reschedule, setReschedule] = useState<Appointment | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [concludeId, setConcludeId] = useState<string | null>(null);
  const [concluding, setConcluding] = useState(false);
  const [concludeDone, setConcludeDone] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [clientRes, meRes] = await Promise.all([
        fetch(`/api/clients/${id}`),
        fetch("/api/petshops/me"),
      ]);
      const clientJson = await clientRes.json();
      const meJson = await meRes.json();
      if (clientJson.data) setData(clientJson.data);
      if (meJson.data?.id) setPetShopId(meJson.data.id);
    } catch {}
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function cancelApt() {
    if (!cancelId) return;
    setCancelling(true);
    await fetch(`/api/appointments/${cancelId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelado" }),
    });
    setCancelling(false);
    setCancelId(null);
    load();
  }

  async function concludeApt() {
    if (!concludeId) return;
    setConcluding(true);
    await fetch(`/api/appointments/${concludeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "concluido" }),
    });
    setConcluding(false);
    setConcludeId(null);
    setConcludeDone(true);
    load();
    setTimeout(() => setConcludeDone(false), 3000);
  }

  const upcoming = (data?.appointments ?? []).filter((a) =>
    ["agendado", "confirmado", "em_atendimento"].includes(a.status)
  );
  const past = (data?.appointments ?? []).filter((a) =>
    !["agendado", "confirmado", "em_atendimento"].includes(a.status)
  );

  if (loading) {
    return (
      <div className="page-container">
        <PageHeader title="Cliente" showBack backHref="/dono/clientes" />
        <div className="space-y-3 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 h-20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-container">
        <PageHeader title="Cliente" showBack backHref="/dono/clientes" />
        <div className="text-center py-16 text-gray-500">Cliente não encontrado.</div>
      </div>
    );
  }

  const { client, pets } = data;
  const waPhone = `55${client.phone.replace(/\D/g, "")}`;

  return (
    <div className="page-container pb-28">
      <PageHeader title="Cliente" showBack backHref="/dono/clientes" />

      {/* Header do cliente */}
      <section className="animate-slide-up mb-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-4 mb-4">
            <Avatar name={client.name} size="lg" />
            <div className="flex-1 min-w-0">
              <h2 className="font-black text-gray-900 text-lg truncate">{client.name}</h2>
              <p className="text-sm text-gray-500">{client.phone}</p>
              {client.email && <p className="text-xs text-gray-400 truncate">{client.email}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={`https://wa.me/${waPhone}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-50 text-green-600 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors"
            >
              <MaterialIcon icon="chat" size="sm" /> WhatsApp
            </a>
            <button
              onClick={() => setShowNew(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors"
            >
              <MaterialIcon icon="event_add" size="sm" /> Novo agendamento
            </button>
          </div>
        </div>
      </section>

      {/* Pets */}
      {pets.length > 0 && (
        <section className="animate-slide-up mb-5">
          <p className="section-label mb-2">Pets</p>
          <div className="flex gap-2 flex-wrap">
            {pets.map((p) => (
              <div key={p.id} className="bg-white border border-gray-100 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                <span className="text-base">{p.species === "gato" ? "🐱" : "🐶"}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                  {p.breed && <p className="text-xs text-gray-400">{p.breed}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Agendamentos futuros */}
      {upcoming.length > 0 && (
        <section className="animate-slide-up mb-5">
          <p className="section-label mb-2">Próximos agendamentos</p>
          <div className="space-y-2">
            {upcoming.map((apt) => {
              const st = STATUS_MAP[apt.status] ?? { label: apt.status, color: "neutral" as const };
              return (
                <div key={apt.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{apt.service.label}</p>
                      <p className="text-xs text-gray-500">{apt.pet.name} · {fmtDate(apt.date)}</p>
                      <p className="text-xs text-gray-400">R$ {apt.totalPrice.toFixed(2).replace(".", ",")}</p>
                    </div>
                    <Badge variant={st.color} className="text-[10px] ml-2 flex-shrink-0">{st.label}</Badge>
                  </div>
                  {apt.notes && (
                    <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2 mb-2">📝 {apt.notes}</p>
                  )}
                  {/* Botão principal: Concluído */}
                  <button
                    onClick={() => setConcludeId(apt.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors mb-2 mt-1"
                  >
                    <MaterialIcon icon="check_circle" size="sm" /> Pet concluído ✓
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setReschedule(apt)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary/10 text-primary rounded-xl text-xs font-semibold hover:bg-primary/20 transition-colors"
                    >
                      <MaterialIcon icon="event" size="xs" /> Reagendar
                    </button>
                    <button
                      onClick={() => setCancelId(apt.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors"
                    >
                      <MaterialIcon icon="cancel" size="xs" /> Cancelar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Histórico */}
      <section className="animate-slide-up">
        <p className="section-label mb-2">Histórico</p>
        {past.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            <MaterialIcon icon="history" size="xl" className="mb-2 text-gray-300" />
            <p>Nenhum atendimento anterior.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {past.map((apt) => {
              const st = STATUS_MAP[apt.status] ?? { label: apt.status, color: "neutral" as const };
              return (
                <div key={apt.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{apt.service.label}</p>
                      <p className="text-xs text-gray-500">{apt.pet.name} · {fmtDate(apt.date)}</p>
                      <p className="text-xs text-gray-400">R$ {apt.totalPrice.toFixed(2).replace(".", ",")}</p>
                    </div>
                    <Badge variant={st.color} className="text-[10px] ml-2 flex-shrink-0">{st.label}</Badge>
                  </div>
                  {apt.status === "cancelado" && (
                    <button
                      onClick={() => setShowNew(true)}
                      className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 bg-primary/10 text-primary rounded-xl text-xs font-semibold hover:bg-primary/20 transition-colors"
                    >
                      <MaterialIcon icon="refresh" size="xs" /> Reagendar novamente
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal reagendamento */}
      {reschedule && (
        <RescheduleModal
          apt={reschedule}
          onClose={() => setReschedule(null)}
          onDone={() => { setReschedule(null); load(); }}
        />
      )}

      {/* Modal novo agendamento */}
      {showNew && (
        <NewBookingModal
          clientId={client.id}
          pets={pets}
          petShopId={petShopId}
          onClose={() => setShowNew(false)}
          onDone={() => { setShowNew(false); load(); }}
        />
      )}

      {/* Toast de conclusão */}
      {concludeDone && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-slide-up">
          <MaterialIcon icon="check_circle" size="sm" /> Pet concluído! WhatsApp enviado ao cliente 🐾
        </div>
      )}

      {/* Dialog concluir */}
      {concludeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConcludeId(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
              🛁
            </div>
            <h3 className="text-center font-bold text-gray-900 mb-1">Marcar como concluído?</h3>
            <p className="text-center text-sm text-gray-500 mb-5">
              O atendimento será concluído e o cliente receberá uma mensagem de WhatsApp automática.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConcludeId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={concludeApt}
                disabled={concluding}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50 transition-colors"
              >
                {concluding ? "Concluindo…" : "✓ Concluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog cancelar */}
      {cancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCancelId(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MaterialIcon icon="cancel" className="text-red-500" />
            </div>
            <h3 className="text-center font-bold text-gray-900 mb-1">Cancelar agendamento?</h3>
            <p className="text-center text-sm text-gray-500 mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={cancelApt}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {cancelling ? "Cancelando…" : "Sim, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
