"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/lib/supabase/useUser";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon } from "@/components/ui";

type PetShop = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  logoUrl: string | null;
};

export default function PetShopsPage() {
  const { user } = useUser();
  const [shops, setShops] = useState<PetShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/petshops/list")
      .then((r) => r.json())
      .then((json) => { if (json.data) setShops(json.data); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = shops.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.city ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container font-sans pb-24">
      <PageHeader
        title="Pet Shops"
        showBack
        userAvatar={{
          name: user?.name || "Tutor",
          src: user?.image || undefined,
          href: "/cliente/perfil",
        }}
      />

      {/* Search bar */}
      <section className="mt-4 animate-slide-up">
        <div className="relative">
          <MaterialIcon
            icon="search"
            size="sm"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou cidade..."
            className="w-full border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white transition-all"
          />
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <section className="mt-6 flex flex-col gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl" />
          ))}
        </section>
      )}

      {/* Lista de Pet Shops */}
      {!loading && (
        <section className="mt-6 animate-slide-up">
          <p className="section-label mb-3">
            {filtered.length} pet shop{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </p>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
              <MaterialIcon icon="search_off" size="xl" className="mb-4" />
              <p className="font-black uppercase tracking-tighter text-lg">Nenhum resultado</p>
              <p className="text-sm font-medium">Tente buscar por outro nome ou cidade.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((shop) => (
                <div
                  key={shop.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-200"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-2">
                      {/* Logo */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center">
                        {shop.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-primary font-black text-lg">
                            {shop.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{shop.name}</h3>
                        {(shop.city || shop.state) && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MaterialIcon icon="location_on" className="text-[13px]!" />
                            {[shop.city, shop.state].filter(Boolean).join(", ")}
                          </p>
                        )}
                        {shop.address && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{shop.address}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex border-t border-gray-50">
                    {shop.phone && (
                      <>
                        <a
                          href={`https://wa.me/${shop.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <MaterialIcon icon="chat" size="xs" />
                          WhatsApp
                        </a>
                        <div className="w-px bg-gray-100" />
                      </>
                    )}
                    <Link
                      href="/cliente/agendamento"
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold text-primary hover:bg-primary/5 transition-colors"
                    >
                      <MaterialIcon icon="calendar_add_on" size="xs" />
                      Agendar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
