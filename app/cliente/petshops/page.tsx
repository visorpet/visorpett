"use client";

import React from "react";
import { useUser } from "@/lib/supabase/useUser";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon } from "@/components/ui";

const MOCK_PETSHOPS = [
  {
    id: "1",
    name: "PetShop Central",
    address: "Rua das Flores, 123 - Centro",
    rating: 4.8,
    reviews: 142,
    distance: "0.8 km",
    services: ["Banho", "Tosa", "Veterinário"],
    phone: "11999990000",
    open: true,
  },
  {
    id: "2",
    name: "Mundo PET",
    address: "Av. Paulista, 456 - Bela Vista",
    rating: 4.6,
    reviews: 98,
    distance: "1.4 km",
    services: ["Banho", "Tosa", "Hotel"],
    phone: "11988880000",
    open: true,
  },
  {
    id: "3",
    name: "PetCare Premium",
    address: "Rua Oscar Freire, 789 - Jardins",
    rating: 4.9,
    reviews: 215,
    distance: "2.1 km",
    services: ["Banho", "Tosa", "Creche", "Veterinário"],
    phone: "11977770000",
    open: false,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <MaterialIcon
          key={s}
          icon="star"
          size="xs"
          className={s <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}
          fill={s <= Math.round(rating)}
        />
      ))}
    </div>
  );
}

export default function PetShopsPage() {
  const { user } = useUser();

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
            placeholder="Buscar pet shops..."
            className="w-full border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white transition-all"
          />
        </div>
      </section>

      {/* Lista de Pet Shops */}
      <section className="mt-6 animate-slide-up">
        <p className="section-label mb-3">{MOCK_PETSHOPS.length} pet shops encontrados</p>
        <div className="flex flex-col gap-4">
          {MOCK_PETSHOPS.map((shop) => (
            <div
              key={shop.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-200"
            >
              {/* Header do card */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{shop.name}</h3>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide ${shop.open ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {shop.open ? "Aberto" : "Fechado"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MaterialIcon icon="location_on" className="text-[13px]!" />
                      {shop.address}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                    {shop.distance}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <StarRating rating={shop.rating} />
                  <span className="text-xs font-bold text-gray-700">{shop.rating}</span>
                  <span className="text-xs text-gray-400">({shop.reviews} avaliações)</span>
                </div>

                {/* Serviços */}
                <div className="flex flex-wrap gap-1.5">
                  {shop.services.map((svc) => (
                    <span key={svc} className="text-[11px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex border-t border-gray-50">
                <a
                  href={`https://wa.me/${shop.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  <MaterialIcon icon="chat" size="xs" />
                  WhatsApp
                </a>
                <div className="w-px bg-gray-100" />
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
      </section>
    </div>
  );
}
