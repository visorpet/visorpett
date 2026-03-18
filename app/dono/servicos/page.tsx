"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Badge, Avatar } from "@/components/ui";
import { formatCurrency, cn } from "@/lib/utils";

/* ─── Types ─── */
type ServiceType = "banho" | "tosa" | "banho_e_tosa" | "consulta" | "vacina" | "outro";
type Service = { id: string; type: ServiceType; label: string; price: number; durationMin: number; active: boolean };
type Groomer  = { id: string; name: string; phone?: string | null; photoUrl?: string | null };

const SERVICE_ICONS: Record<ServiceType, string> = {
  banho:        "bathtub",
  tosa:         "content_cut",
  banho_e_tosa: "shower",
  consulta:     "medical_services",
  vacina:       "vaccines",
  outro:        "more_horiz",
};
const SERVICE_LABELS: Record<ServiceType, string> = {
  banho:        "Banho",
  tosa:         "Tosa",
  banho_e_tosa: "Banho e Tosa",
  consulta:     "Consulta",
  vacina:       "Vacina",
  outro:        "Outro",
};
const SERVICE_TYPES = Object.keys(SERVICE_LABELS) as ServiceType[];

/* ─── Modal base ─── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-lg">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
            <MaterialIcon icon="close" size="sm" className="text-gray-600" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Service Form Modal ─── */
function ServiceModal({
  initial, onClose, onSave,
}: {
  initial?: Service;
  onClose: () => void;
  onSave: (data: Omit<Service, "id" | "active">) => Promise<void>;
}) {
  const [form, setForm] = useState({
    type:        initial?.type ?? "banho" as ServiceType,
    label:       initial?.label ?? "",
    price:       initial?.price?.toString() ?? "",
    durationMin: initial?.durationMin?.toString() ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
    if (key === "type" && !initial) {
      setForm((p) => ({ ...p, type: value as ServiceType, label: SERVICE_LABELS[value as ServiceType] }));
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSave({
        type:        form.type,
        label:       form.label,
        price:       parseFloat(form.price),
        durationMin: parseInt(form.durationMin, 10),
      });
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={initial ? "Editar Serviço" : "Novo Serviço"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Tipo</label>
          <div className="grid grid-cols-3 gap-2 mt-1.5">
            {SERVICE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setField("type", t)}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-semibold transition-all",
                  form.type === t
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-100 text-gray-500 hover:border-primary/30"
                )}
              >
                <MaterialIcon icon={SERVICE_ICONS[t]} size="sm" />
                {SERVICE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Nome do serviço *</label>
          <input
            className="input w-full"
            value={form.label}
            onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
            placeholder="Ex: Banho Completo"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Preço (R$) *</label>
            <input
              className="input w-full"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              placeholder="0,00"
              required
            />
          </div>
          <div>
            <label className="label">Duração (min) *</label>
            <input
              className="input w-full"
              type="number"
              min="5"
              step="5"
              value={form.durationMin}
              onChange={(e) => setField("durationMin", e.target.value)}
              placeholder="60"
              required
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Salvando..." : "Salvar Serviço"}
        </button>
      </form>
    </Modal>
  );
}

/* ─── Groomer Form Modal ─── */
function GroomerModal({
  initial, onClose, onSave,
}: {
  initial?: Groomer;
  onClose: () => void;
  onSave: (data: Pick<Groomer, "name" | "phone">) => Promise<void>;
}) {
  const [form, setForm] = useState({ name: initial?.name ?? "", phone: initial?.phone ?? "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSave({ name: form.name, phone: form.phone || undefined });
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={initial ? "Editar Tosador" : "Novo Tosador"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Nome completo *</label>
          <input
            className="input w-full"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Ex: João da Silva"
            required
          />
        </div>
        <div>
          <label className="label">Telefone / WhatsApp</label>
          <input
            className="input w-full"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="(11) 99999-9999"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Salvando..." : "Salvar Tosador"}
        </button>
      </form>
    </Modal>
  );
}

/* ─── Main Page ─── */
export default function DonoServicosPage() {
  const [tab, setTab]         = useState<"servicos" | "tosadores">("servicos");
  const [services, setServices]   = useState<Service[]>([]);
  const [groomers, setGroomers]   = useState<Groomer[]>([]);
  const [loading, setLoading]     = useState(true);

  const [svcModal, setSvcModal]   = useState<{ open: boolean; editing?: Service }>({ open: false });
  const [grmModal, setGrmModal]   = useState<{ open: boolean; editing?: Groomer }>({ open: false });

  async function loadData() {
    setLoading(true);
    try {
      const [sRes, gRes] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/groomers"),
      ]);
      const [sJson, gJson] = await Promise.all([sRes.json(), gRes.json()]);
      setServices(sJson.data ?? []);
      setGroomers(gJson.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  /* ── Service actions ── */
  async function saveService(data: Omit<Service, "id" | "active">, id?: string) {
    const url    = id ? `/api/services/${id}` : "/api/services";
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error ?? "Erro ao salvar");
    }
    await loadData();
  }

  async function deleteService(id: string) {
    if (!confirm("Desativar este serviço?")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    await loadData();
  }

  /* ── Groomer actions ── */
  async function saveGroomer(data: Pick<Groomer, "name" | "phone">, id?: string) {
    const url    = id ? `/api/groomers/${id}` : "/api/groomers";
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error ?? "Erro ao salvar");
    }
    await loadData();
  }

  async function deleteGroomer(id: string) {
    if (!confirm("Remover este tosador?")) return;
    await fetch(`/api/groomers/${id}`, { method: "DELETE" });
    await loadData();
  }

  return (
    <div className="page-container pb-24">
      <PageHeader title="Serviços & Equipe" showBack backHref="/dono/inicio" />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {(["servicos", "tosadores"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
              tab === t ? "bg-white text-primary shadow-sm" : "text-gray-500"
            )}
          >
            {t === "servicos" ? "Serviços" : "Tosadores"}
          </button>
        ))}
      </div>

      {/* ── SERVIÇOS ── */}
      {tab === "servicos" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
              {services.length} serviço{services.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => setSvcModal({ open: true })}
              className="btn-primary text-sm px-4 py-2 flex items-center gap-1"
            >
              <MaterialIcon icon="add" size="sm" /> Novo
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="card text-center py-10">
              <MaterialIcon icon="content_cut" size="xl" className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">Nenhum serviço cadastrado</p>
              <p className="text-gray-400 text-sm mt-1">Adicione os serviços que seu pet shop oferece</p>
              <button onClick={() => setSvcModal({ open: true })} className="btn-primary mt-4 mx-auto px-6">
                Adicionar primeiro serviço
              </button>
            </div>
          ) : (
            services.map((svc) => (
              <div key={svc.id} className="card flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MaterialIcon icon={SERVICE_ICONS[svc.type]} size="md" className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{svc.label}</p>
                  <p className="text-xs text-gray-500">{svc.durationMin} min · {formatCurrency(svc.price)}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setSvcModal({ open: true, editing: svc })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-primary/10 transition-colors"
                  >
                    <MaterialIcon icon="edit" size="sm" className="text-gray-500 hover:text-primary" />
                  </button>
                  <button
                    onClick={() => deleteService(svc.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-50 transition-colors"
                  >
                    <MaterialIcon icon="delete" size="sm" className="text-gray-500 hover:text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* ── TOSADORES ── */}
      {tab === "tosadores" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
              {groomers.length} tosador{groomers.length !== 1 ? "es" : ""}
            </p>
            <button
              onClick={() => setGrmModal({ open: true })}
              className="btn-primary text-sm px-4 py-2 flex items-center gap-1"
            >
              <MaterialIcon icon="add" size="sm" /> Novo
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : groomers.length === 0 ? (
            <div className="card text-center py-10">
              <MaterialIcon icon="person" size="xl" className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">Nenhum tosador cadastrado</p>
              <p className="text-gray-400 text-sm mt-1">Adicione sua equipe de tosadores</p>
              <button onClick={() => setGrmModal({ open: true })} className="btn-primary mt-4 mx-auto px-6">
                Adicionar tosador
              </button>
            </div>
          ) : (
            groomers.map((g) => (
              <div key={g.id} className="card flex items-center gap-4">
                <Avatar name={g.name} src={g.photoUrl ?? undefined} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{g.name}</p>
                  {g.phone && <p className="text-xs text-gray-500">{g.phone}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setGrmModal({ open: true, editing: g })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-primary/10 transition-colors"
                  >
                    <MaterialIcon icon="edit" size="sm" className="text-gray-500 hover:text-primary" />
                  </button>
                  <button
                    onClick={() => deleteGroomer(g.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-50 transition-colors"
                  >
                    <MaterialIcon icon="delete" size="sm" className="text-gray-500 hover:text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* Modals */}
      {svcModal.open && (
        <ServiceModal
          initial={svcModal.editing}
          onClose={() => setSvcModal({ open: false })}
          onSave={(data) => saveService(data, svcModal.editing?.id)}
        />
      )}
      {grmModal.open && (
        <GroomerModal
          initial={grmModal.editing}
          onClose={() => setGrmModal({ open: false })}
          onSave={(data) => saveGroomer(data, grmModal.editing?.id)}
        />
      )}
    </div>
  );
}
