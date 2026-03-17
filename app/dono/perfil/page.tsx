"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Avatar } from "@/components/ui";

function MenuItem({ icon, label, badge, danger, href, onClick }: { icon: string, label: string, badge?: string, danger?: boolean, href?: string, onClick?: () => void }) {
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
  return (
    <div className="page-container">
      <PageHeader title="Meu Negócio" />

      <section className="animate-slide-up mb-6">
        <div className="bg-gradient-primary rounded-2xl p-6 text-white flex gap-4 items-center">
          <Avatar name="PetLove Moema" size="lg" ring ringColor="ring-white/40" />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black truncate">PetLove Moema</h1>
            <p className="text-white/70 text-xs mt-1">Plano Pro • Ativo</p>
          </div>
          <MaterialIcon icon="qr_code_2" size="xl" className="text-white/80" />
        </div>
      </section>

      <section className="animate-slide-up space-y-6">
        <div>
          <p className="section-label mb-3">Gestão da Loja</p>
          <div className="flex flex-col gap-2">
            <MenuItem icon="storefront" label="Dados do Pet Shop" href="/dono/perfil/dados" />
            <MenuItem icon="inventory_2" label="Serviços e Preços" href="/dono/perfil/servicos" />
            <MenuItem icon="badge" label="Equipe e Tosadores" badge="3" href="/dono/perfil/equipe" />
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
            <MenuItem icon="logout" label="Sair da Conta" danger onClick={() => { if(confirm("Tem certeza que deseja sair?")) { window.location.href="/login"; } }} />
          </div>
        </div>
      </section>
      
      <p className="text-center text-xs text-gray-300 pb-4 mt-6">
        visorpet v1.0 — Área do Dono 🐾
      </p>
    </div>
  );
}
