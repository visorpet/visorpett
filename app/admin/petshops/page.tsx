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
  subscription?: { plan: string; status: string } | null;
  _count: { clients: number; appointments: number };
};

const PLAN_LABELS: Record<string, string> = {
  FREE: "Free",
  PRO: "Pro",
  PREMIUM: "Premium",
  ENTERPRISE: "Enterprise",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Agora";
  if (h < 24) return `Há ${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Há 1 dia";
  return `Há ${d} dias`;
}

export default function SuperAdminPetshopsPage() {
  const [shops, setShops] = useState<PetShop[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/petshops");
      const json = await res.json();
      setShops(json.data ?? []);
    } catch {
      setShops([]);
    } finally {
      setLoading(false);
    }
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
    const newStatus = isActive ? "CANCELLED" : "ACTIVE";
    setActionLoading(shop.id);
    try {
      await fetch(`/api/admin/petshops/${shop.id}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchShops();
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Gestão de Pet Shops</h2>
          <p className="text-gray-500 font-medium mt-1">
            {loading ? "Carregando..." : `${shops.length} loja${shops.length !== 1 ? "s" : ""} cadastrada${shops.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button className="btn-primary" onClick={() => alert("Em breve!")}>
          <MaterialIcon icon="add" size="sm" />
          Novo Tenant (Manual)
        </button>
      </header>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            Lista de Pet Shops ({filtered.length})
          </h3>
          <div className="relative">
            <MaterialIcon icon="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size="sm" />
            <input
              type="text"
              placeholder="Buscar loja ou dono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-64"
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
                <th className="px-6 py-4">Clientes / Agend.</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-6 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                    Nenhum pet shop encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((shop) => {
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
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                        {[shop.city, shop.state].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {timeAgo(shop.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-[10px] font-bold bg-blue-50 text-blue-600 rounded uppercase">
                          {PLAN_LABELS[shop.subscription?.plan ?? ""] ?? "Free"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {shop._count.clients} / {shop._count.appointments}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={isActive ? "success" : "danger"} className="text-[10px]">
                          {isActive ? "Ativo" : "Bloqueado"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleBlock(shop)}
                          disabled={actionLoading === shop.id}
                          title={isActive ? "Bloquear" : "Reativar"}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg disabled:opacity-50"
                        >
                          {actionLoading === shop.id ? (
                            <MaterialIcon icon="progress_activity" size="sm" className="animate-spin" />
                          ) : (
                            <MaterialIcon icon={isActive ? "block" : "settings_backup_restore"} size="sm" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
