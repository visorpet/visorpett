"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Avatar } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

type PetShop = {
  name: string;
  slug: string;
  subscription?: { plan: string; status: string } | null;
};

const PLAN_LABELS: Record<string, string> = {
  FREE: "Plano Free",
  PRO: "Plano Pro",
  PREMIUM: "Plano Premium",
  ENTERPRISE: "Plano Enterprise",
};

function MenuItem({ icon, label, badge, danger, href, onClick }: {
  icon: string; label: string; badge?: string; danger?: boolean; href?: string; onClick?: () => void;
}) {
  const content = (
    <div className={`flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm ${danger ? "text-red-500 hover:border-red-200" : "text-gray-800 hover:shadow-card-hover"} transition-all duration-200 cursor-pointer`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${danger ? "bg-red-50" : "bg-primary/10"}`}>
        <MaterialIcon icon={icon} size="sm" className={danger ? "text-red-500" : "text-primary"} />
      </div>
      <span className="flex-1 font-semibold text-sm">{label}</span>
      {badge && <span className="text-xs bg-primary text-white font-bold px-2 py-0.5 rounded-full">{badge}</span>}
      {!badge && <MaterialIcon icon="chevron_right" size="sm" className="text-gray-300" />}
    </div>
  );
  if (href) return <Link href={href} className="block">{content}</Link>;
  return <button className="w-full text-left block" onClick={onClick || (() => alert("Em breve!"))}>{content}</button>;
}

export default function DonoPerfilPage() {
  const router = useRouter();
  const [shop, setShop] = useState<PetShop | null>(null);
  const [groomerCount, setGroomerCount] = useState(0);

  useEffect(() => {
    fetch("/api/petshops/me")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setShop(json.data);
          setGroomerCount(json.data.groomers?.length ?? 0);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSignOut() {
    if (!confirm("Tem certeza que deseja sair?")) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const shopName = shop?.name ?? "Meu Pet Shop";
  const planLabel = shop?.subscription
    ? PLAN_LABELS[shop.subscription.plan] ?? shop.subscription.plan
    : "Plano Free";
  const bookingUrl = shop?.slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/booking/${shop.slug}`
    : null;

  function copyBookingLink() {
    if (!bookingUrl) return;
    navigator.clipboard.writeText(bookingUrl).then(() => alert("Link copiado!"));
  }

  return (
    <div className="page-container">
      <PageHeader title="Meu Negócio" />

      <section className="animate-slide-up mb-6">
        <div className="bg-gradient-primary rounded-2xl p-6 text-white flex gap-4 items-center">
          <Avatar name={shopName} size="lg" ring ringColor="ring-white/40" />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black truncate">{shopName}</h1>
            <p className="text-white/70 text-xs mt-1">{planLabel} • Ativo</p>
          </div>
          <MaterialIcon icon="qr_code_2" size="xl" className="text-white/80" />
        </div>
      </section>

      {/* Link de agendamento público */}
      {bookingUrl && (
        <section className="animate-slide-up mb-6">
          <p className="section-label mb-3">Link de Agendamento</p>
          <div className="bg-white border border-primary/20 rounded-2xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <MaterialIcon icon="link" size="sm" className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 mb-0.5">Página pública de agendamento</p>
                <p className="text-xs text-gray-500 break-all">{bookingUrl}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyBookingLink}
                className="flex-1 flex items-center justify-center gap-1.5 bg-primary/10 text-primary text-sm font-semibold py-2.5 rounded-xl hover:bg-primary/20 transition-colors"
              >
                <MaterialIcon icon="content_copy" size="sm" /> Copiar link
              </button>
              <Link
                href={bookingUrl}
                target="_blank"
                className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
              >
                <MaterialIcon icon="open_in_new" size="sm" /> Ver página
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="animate-slide-up space-y-6">
        <div>
          <p className="section-label mb-3">Gestão da Loja</p>
          <div className="flex flex-col gap-2">
            <MenuItem icon="storefront" label="Dados do Pet Shop" href="/dono/perfil/dados" />
            <MenuItem icon="inventory_2" label="Serviços e Preços" href="/dono/perfil/servicos" />
            <MenuItem icon="badge" label="Equipe e Tosadores" badge={groomerCount > 0 ? String(groomerCount) : undefined} href="/dono/perfil/equipe" />
            <MenuItem icon="schedule" label="Horários de Funcionamento" href="/dono/perfil/horarios" />
          </div>
        </div>

        <div>
          <p className="section-label mb-3">Minha Assinatura</p>
          <div className="flex flex-col gap-2">
            <MenuItem icon="star" label="Fazer Upgrade de Plano" href="/dono/perfil/plano" />
            <MenuItem icon="receipt_long" label="Faturas da Plataforma" href="/dono/perfil/faturas" />
          </div>
        </div>

        <div>
          <p className="section-label mb-3">Sistema</p>
          <div className="flex flex-col gap-2">
            <MenuItem icon="help" label="Central de Ajuda" href="/dono/ajuda" />
            <MenuItem icon="logout" label="Sair da Conta" danger onClick={handleSignOut} />
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-gray-300 pb-4 mt-6">
        visorpet v1.0 — Área do Dono 🐾
      </p>
    </div>
  );
}
