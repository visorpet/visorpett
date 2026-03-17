"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Badge } from "@/components/ui";

const MOCK_REVIEWS = [
  {
    id: "1",
    petShop: "PetShop Central",
    service: "Banho e Tosa",
    petName: "Rex",
    date: "2024-12-10",
    rating: 5,
    comment: "Excelente atendimento! Rex ficou lindo.",
    status: "respondida",
  },
  {
    id: "2",
    petShop: "Mundo PET",
    service: "Banho",
    petName: "Mel",
    date: "2024-11-20",
    rating: 4,
    comment: "Bom serviço, mas demorou um pouco.",
    status: "publicada",
  },
];

function StarRating({ rating, size = "sm" }: { rating: number; size?: "xs" | "sm" | "md" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <MaterialIcon
          key={s}
          icon="star"
          size={size}
          className={s <= rating ? "text-amber-400" : "text-gray-200"}
          fill={s <= rating}
        />
      ))}
    </div>
  );
}

export default function AvaliacoesPage() {
  const { data: session } = useSession();

  const avgRating =
    MOCK_REVIEWS.length > 0
      ? MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / MOCK_REVIEWS.length
      : 0;

  return (
    <div className="page-container font-sans pb-24">
      <PageHeader
        title="Minhas Avaliações"
        showBack
        userAvatar={{
          name: session?.user?.name || "Tutor",
          src: session?.user?.image || undefined,
          href: "/cliente/perfil",
        }}
      />

      {/* Summary */}
      <section className="mt-4 animate-slide-up">
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-6 text-white flex items-center gap-5">
          <div className="text-center">
            <p className="text-5xl font-black">{avgRating.toFixed(1)}</p>
            <StarRating rating={Math.round(avgRating)} size="sm" />
            <p className="text-white/70 text-xs mt-1">{MOCK_REVIEWS.length} avaliações</p>
          </div>
          <div className="w-px h-16 bg-white/20" />
          <div className="flex-1">
            <p className="text-white/80 text-sm font-medium">Sua média geral</p>
            <p className="text-white font-bold text-base mt-1">
              {avgRating >= 4.5 ? "Excelente! 🏆" : avgRating >= 4 ? "Muito bom! 👍" : "Bom 😊"}
            </p>
            <p className="text-white/60 text-xs mt-1">
              Continue avaliando para ajudar outros tutores
            </p>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="mt-6 animate-slide-up">
        <p className="section-label mb-3">Histórico de avaliações</p>
        <div className="flex flex-col gap-4">
          {MOCK_REVIEWS.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-card p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{review.petShop}</p>
                  <p className="text-xs text-gray-500">
                    {review.service} · {review.petName}
                  </p>
                </div>
                <Badge variant={review.status === "respondida" ? "success" : "neutral"}>
                  {review.status}
                </Badge>
              </div>
              <StarRating rating={review.rating} />
              <p className="text-sm text-gray-700 mt-2 font-medium italic">"{review.comment}"</p>
              <p className="text-[11px] text-gray-400 mt-2 font-bold uppercase tracking-wide">
                {new Date(review.date).toLocaleDateString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
