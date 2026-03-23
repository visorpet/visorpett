"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon } from "@/components/ui";

type DayKey = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";

type DayConfig = { active: boolean; open: string; close: string };
type Hours = Record<DayKey, DayConfig>;

const DAY_LABELS: Record<DayKey, string> = {
  seg: "Segunda-feira",
  ter: "Terça-feira",
  qua: "Quarta-feira",
  qui: "Quinta-feira",
  sex: "Sexta-feira",
  sab: "Sábado",
  dom: "Domingo",
};

const DEFAULT_HOURS: Hours = {
  seg: { active: true,  open: "08:00", close: "18:00" },
  ter: { active: true,  open: "08:00", close: "18:00" },
  qua: { active: true,  open: "08:00", close: "18:00" },
  qui: { active: true,  open: "08:00", close: "18:00" },
  sex: { active: true,  open: "08:00", close: "18:00" },
  sab: { active: true,  open: "08:00", close: "13:00" },
  dom: { active: false, open: "08:00", close: "13:00" },
};

const TIME_OPTIONS: string[] = [];
for (let h = 6; h <= 23; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:00`);
  TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:30`);
}

export default function HorariosPage() {
  const router = useRouter();
  const [hours, setHours] = useState<Hours>(DEFAULT_HOURS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/petshops/me")
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.businessHours) {
          setHours({ ...DEFAULT_HOURS, ...json.data.businessHours });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function toggleDay(day: DayKey) {
    setHours((h) => ({ ...h, [day]: { ...h[day], active: !h[day].active } }));
    setSuccess(false);
  }

  function setTime(day: DayKey, field: "open" | "close", value: string) {
    setHours((h) => ({ ...h, [day]: { ...h[day], [field]: value } }));
    setSuccess(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/petshops/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessHours: hours }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Erro ao salvar."); return; }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container pb-28 font-sans">
      <PageHeader title="Horários de Funcionamento" showBack onBack={() => router.push("/dono/perfil")} />

      <p className="text-sm text-gray-500 mb-5 mt-1">
        Configure os dias e horários em que seu pet shop atende.
      </p>

      <div className="flex flex-col gap-3">
        {(Object.keys(DAY_LABELS) as DayKey[]).map((day) => {
          const cfg = hours[day];
          return (
            <div
              key={day}
              className={`bg-white rounded-2xl border shadow-sm p-4 transition-all duration-200 ${
                cfg.active ? "border-gray-100" : "border-gray-100 opacity-60"
              }`}
            >
              {/* Cabeçalho do dia */}
              <div className="flex items-center justify-between mb-3">
                <span className={`font-bold text-sm ${cfg.active ? "text-gray-900" : "text-gray-400"}`}>
                  {DAY_LABELS[day]}
                </span>
                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                    cfg.active ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      cfg.active ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Horários */}
              {cfg.active && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">
                      Abertura
                    </label>
                    <select
                      value={cfg.open}
                      onChange={(e) => setTime(day, "open", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">
                      Fechamento
                    </label>
                    <select
                      value={cfg.close}
                      onChange={(e) => setTime(day, "close", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    >
                      {TIME_OPTIONS.filter((t) => t > cfg.open).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {!cfg.active && (
                <p className="text-xs text-gray-400 font-medium">Fechado</p>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex gap-2 items-center">
          <MaterialIcon icon="error_outline" />
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-medium border border-emerald-100 flex gap-2 items-center">
          <MaterialIcon icon="check_circle" />
          Horários salvos com sucesso!
        </div>
      )}

      {/* Botão fixo no rodapé */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur border-t border-gray-100 safe-area-bottom">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full py-4 text-base disabled:opacity-50"
        >
          {saving ? (
            <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Salvando...</>
          ) : (
            <><MaterialIcon icon="save" size="sm" /> Salvar Horários</>
          )}
        </button>
      </div>
    </div>
  );
}
