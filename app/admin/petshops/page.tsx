"use client";

import { useState, useEffect, useCallback } from "react";
import { MaterialIcon, Badge } from "@/components/ui";

type PetShop = {
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
  createdAt: string;
  owner: { name?: string | null; email?: string | null };
  subscription?: { plan: string; status: string; asaasSubscriptionId?: string | null } | null;
  _count: { clients: number; appointments: number };
};

const PLAN_OPTIONS = [
  { value: "PRO",        label: "Pro — R$ 97/mês" },
  { value: "PREMIUM",    label: "Premium — R$ 197/mês" },
  { value: "ENTERPRISE", label: "Enterprise — R$ 497/mês" },
];

const BILLING_OPTIONS = [
  { value: "PIX",         label: "PIX" },
  { value: "BOLETO",      label: "Boleto" },
  { value: "CREDIT_CARD", label: "Cartão" },
];

const STATUS_LABELS: Record<string, { label: string; variant: "success" | "danger" | "warning" | "neutral" }> = {
  ACTIVE:   { label: "Ativo",     variant: "success" },
  TRIALING: { label: "Trial",     variant: "warning" },
  PAST_DUE: { label: "Atrasado",  variant: "danger"  },
  CANCELLED:{ label: "Cancelado", variant: "danger"  },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Agora";
  if (h < 24) return `Há ${h}h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Há 1 dia" : `Há ${d} dias`;
}

export default function SuperAdminPetshopsPage() {
  const [shops, setShops]               = useState<PetShop[]>([]);
  const [search, setSearch]             = useState("");
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [modalShop, setModalShop]     = useState<PetShop | null>(null);
  const [plan, setPlan]               = useState("PRO");
  const [billingType, setBillingType] = useState("PIX");
  const [subLoading, setSubLoading]   = useState(false);
  const [subResult, setSubResult]     = useState<{ ok: boolean; paymentLink?: string; error?: string } | null>(null);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/petshops");
      const json = await res.json();
      setShops(json.data ?? []);
    } catch { setShops([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchShops(); }, [fetchShops]);

  const filtered = shops.filter((s) =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.owner?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.owner?.email?.toLowerCase().includes(search.toLowerCase())
  );

  async function toggleBlock(shop: PetShop) {
    const isActive = shop.subscription?.status === "ACTIVE" || shop.subscription?.status === "TRIALING";
    setActionLoading(shop.id + "-block");
    try {
      await fetch(`/api/admin/petshops/${shop.id}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: isActive ? "CANCELLED" : "ACTIVE" }),
      });
      await fetchShops();
    } finally { setActionLoading(null); }
  }

  function openModal(shop: PetShop) {
    setModalShop(shop);
    setPlan("PRO");
    setBillingType("PIX");
    setSubResult(null);
  }

  async function handleSubscribe() {
    if (!modalShop) return;
    setSubLoading(true);
    setSubResult(null);
    try {
      const res = await fetch("/api/admin/asaas/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petShopId: modalShop.id, plan, billingType }),
      });
      const json = await res.json();
      if (!res.ok) setSubResult({ ok: false, error: json.error ?? "Erro ao criar assinatura." });
      else { setSubResult({ ok: true, paymentLink: json.paymentLink }); await fetchShops(); }
    } catch (e) { setSubResult({ ok: false, error: String(e) }); }
    finally { setSubLoading(false); }
  }

  async function handleCancelSub(shop: PetShop) {
    if (!confirm(`Cancelar assinatura de ${shop.name}?`)) return;
    setActionLoading(shop.id + "-cancel");
    try {
      await fetch("/api/admin/asaas/subscriptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petShopId: shop.id }),
      });
      await fetchShops();
    } finally { setActionLoading(null); }
  }

  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Gestão de Pet Shops</h2>
        <p className="text-gray-500 font-medium mt-1">
          {loading ? "Carregando..." : `${shops.length} loja${shops.length !== 1 ? "s" : ""} cadastrada${shops.length !== 1 ? "s" : ""}`}
        </p>
      </header>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Lista ({filtered.length})</h3>
          <div className="relative">
            <MaterialIcon icon="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size="sm" />
            <input
              type="text"
              placeholder="Buscar loja ou dono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Nome da Loja</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4">Cadastro</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Clientes / Agend.</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-6 py-4"><div className="h-6 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">Nenhum pet shop encontrado.</td></tr>
              ) : (
                filtered.map((shop) => {
                  const statusInfo = STATUS_LABELS[shop.subscription?.status ?? ""] ?? { label: "Free", variant: "neutral" as const };
                  const hasAsaas = !!shop.subscription?.asaasSubscriptionId;
                  const isActive = shop.subscription?.status === "ACTIVE" || shop.subscription?.status === "TRIALING";
                  return (
                    <tr key={shop.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {shop.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900">{shop.name}</p>
                            <p className="text-xs text-gray-400">{shop.owner?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{[shop.city, shop.state].filter(Boolean).join(", ") || "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{timeAgo(shop.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-[10px] font-bold bg-blue-50 text-blue-600 rounded uppercase">
                          {shop.subscription?.plan ?? "FREE"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusInfo.variant} className="text-[10px]">{statusInfo.label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{shop._count.clients} / {shop._count.appointments}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {!hasAsaas && (
                            <button
                              onClick={() => openModal(shop)}
                              className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors text-xs font-bold rounded-lg"
                            >
                              Assinar
                            </button>
                          )}
                          {hasAsaas && isActive && (
                            <button
                              onClick={() => handleCancelSub(shop)}
                              disabled={actionLoading === shop.id + "-cancel"}
                              title="Cancelar assinatura"
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                            >
                              {actionLoading === shop.id + "-cancel"
                                ? <MaterialIcon icon="progress_activity" size="sm" className="animate-spin" />
                                : <MaterialIcon icon="do_not_disturb_on" size="sm" />}
                            </button>
                          )}
                          <button
                            onClick={() => toggleBlock(shop)}
                            disabled={actionLoading === shop.id + "-block"}
                            title={isActive ? "Bloquear acesso" : "Reativar acesso"}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          >
                            {actionLoading === shop.id + "-block"
                              ? <MaterialIcon icon="progress_activity" size="sm" className="animate-spin" />
                              : <MaterialIcon icon={isActive ? "block" : "settings_backup_restore"} size="sm" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Assinatura */}
      {modalShop && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Criar Assinatura Asaas</h3>
                <p className="text-sm text-gray-500 mt-0.5">{modalShop.name}</p>
              </div>
              <button onClick={() => setModalShop(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
                <MaterialIcon icon="close" size="sm" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Plano</label>
                <div className="grid grid-cols-3 gap-2">
                  {PLAN_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPlan(p.value)}
                      className={`p-3 rounded-xl border-2 text-sm font-bold transition-all text-center ${
                        plan === p.value ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {p.value}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">{PLAN_OPTIONS.find(p => p.value === plan)?.label}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Forma de Pagamento</label>
                <div className="grid grid-cols-3 gap-2">
                  {BILLING_OPTIONS.map((b) => (
                    <button
                      key={b.value}
                      onClick={() => setBillingType(b.value)}
                      className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                        billingType === b.value ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {subResult && (
                <div className={`rounded-xl p-4 ${subResult.ok ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                  {subResult.ok ? (
                    <>
                      <p className="text-green-800 font-bold text-sm flex items-center gap-1">
                        <MaterialIcon icon="check_circle" size="sm" /> Assinatura criada com sucesso!
                      </p>
                      {subResult.paymentLink && (
                        <a href={subResult.paymentLink} target="_blank" rel="noopener noreferrer"
                          className="mt-2 flex items-center gap-1 text-xs text-green-700 underline font-semibold">
                          <MaterialIcon icon="open_in_new" size="sm" /> Link de pagamento para o cliente
                        </a>
                      )}
                    </>
                  ) : (
                    <p className="text-red-700 text-sm font-semibold flex items-center gap-1">
                      <MaterialIcon icon="error" size="sm" /> {subResult.error}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button onClick={() => setModalShop(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">
                Fechar
              </button>
              {!subResult?.ok && (
                <button
                  onClick={handleSubscribe}
                  disabled={subLoading}
                  className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {subLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Criando...</> : "Criar Assinatura"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
