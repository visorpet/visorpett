"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Avatar, Badge } from "@/components/ui";

const mockUser = {
  name: "Ana Souza",
  email: "ana.souza@email.com",
  phone: "11999998888",
  photoUrl: undefined as string | undefined,
  plan: "Pro" as const,
  memberSince: "Janeiro 2024",
  referralCode: "ANA2024",
  referralCount: 3,
};

interface MenuItemProps {
  icon: string;
  label: string;
  href?: string;
  badge?: string;
  danger?: boolean;
}

function MenuItem({ icon, label, href, badge, danger }: MenuItemProps) {
  const content = (
    <div
      className={`flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 ${
        danger ? "hover:border-red-200" : ""
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          danger ? "bg-red-50" : "bg-primary/10"
        }`}
      >
        <MaterialIcon icon={icon} size="sm" className={danger ? "text-red-500" : "text-primary"} />
      </div>
      <span className={`flex-1 font-semibold text-sm ${danger ? "text-red-500" : "text-gray-800"}`}>
        {label}
      </span>
      {badge && (
        <Badge variant="primary" className="text-[10px]">{badge}</Badge>
      )}
      {!badge && (
        <MaterialIcon icon="chevron_right" size="sm" className="text-gray-300" />
      )}
    </div>
  );
  if (href) return <Link href={href}>{content}</Link>;
  return <button className="w-full text-left">{content}</button>;
}

export default function PerfilPage() {
  return (
    <div className="page-container">
      <PageHeader title="Meu Perfil" />

      {/* ── Profile hero ── */}
      <section className="animate-slide-up">
        <div className="bg-gradient-primary rounded-2xl p-5 text-white">
          <div className="flex items-center gap-4">
            <Avatar
              src={mockUser.photoUrl}
              name={mockUser.name}
              size="lg"
              ring
              ringColor="ring-white/40"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black">{mockUser.name}</h1>
              <p className="text-white/70 text-sm">{mockUser.email}</p>
              <p className="text-white/70 text-xs mt-1 flex items-center gap-1">
                <MaterialIcon icon="calendar_today" className="text-[11px]!" />
                Membro desde {mockUser.memberSince}
              </p>
            </div>
            <div className="flex-shrink-0">
              <Badge variant="primary" className="bg-white/20 text-white border-0 text-xs">
                {mockUser.plan}
              </Badge>
            </div>
          </div>

          {/* Referral code */}
          <div className="mt-4 bg-white/15 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs mb-0.5">Código de indicação</p>
              <p className="text-white font-black text-lg tracking-widest">{mockUser.referralCode}</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs mb-0.5">Indicou</p>
              <p className="text-white font-black text-lg">{mockUser.referralCount} pets</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Menu items ── */}
      <section className="animate-slide-up">
        <p className="section-label mb-3">Conta</p>
        <div className="flex flex-col gap-2">
          <MenuItem icon="person" label="Editar perfil" href="/cliente/perfil/editar" />
          <MenuItem icon="notifications" label="Notificações" href="/cliente/notificacoes" />
          <MenuItem icon="lock" label="Segurança e senha" href="/cliente/perfil/seguranca" />
          <MenuItem icon="credit_card" label="Pagamentos" href="/cliente/perfil/pagamentos" />
        </div>
      </section>

      <section className="animate-slide-up">
        <p className="section-label mb-3">Meus pets e serviços</p>
        <div className="flex flex-col gap-2">
          <MenuItem icon="pets" label="Meus pets" href="/cliente/meus-pets" />
          <MenuItem icon="history" label="Histórico de serviços" href="/cliente/historico" />
          <MenuItem icon="redeem" label="Programa de indicações" href="/cliente/indicacoes" badge={`${mockUser.referralCount} indic.`} />
          <MenuItem icon="star" label="Avaliações" href="/cliente/perfil/avaliacoes" />
        </div>
      </section>

      <section className="animate-slide-up">
        <p className="section-label mb-3">Suporte</p>
        <div className="flex flex-col gap-2">
          <MenuItem icon="help" label="Central de ajuda" href="/cliente/ajuda" />
          <MenuItem icon="feedback" label="Enviar feedback" href="/cliente/feedback" />
          <MenuItem icon="policy" label="Política de privacidade" href="/privacidade" />
          <MenuItem icon="logout" label="Sair da conta" danger />
        </div>
      </section>

      {/* Version */}
      <p className="text-center text-xs text-gray-300 pb-4">
        visorpet v1.0 — feito com 🐾
      </p>
    </div>
  );
}
