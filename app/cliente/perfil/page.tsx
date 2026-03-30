"use client";

import React, { useState } from "react";
import { useUser } from "@/lib/supabase/useUser";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge, MaterialIcon, PhotoUpload } from "@/components/ui";

export default function PerfilPage() {
  const { user: authUser } = useUser();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const user = {
    name: authUser?.name || "Tutor",
    email: authUser?.email || "usuario@email.com",
    avatar: avatarUrl ?? authUser?.image ?? null,
    referralCount: 5,
    joinedDate: "Março 2024"
  };

  const handleAvatarUploaded = async (url: string) => {
    setAvatarUrl(url);
    await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: url }),
    });
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="page-container font-sans pb-24">
      <PageHeader 
        title="Meu Perfil"
        userAvatar={{ 
          name: user.name, 
          src: user.avatar || undefined 
        }}
      />

      {/* ── Perfil Card ── */}
      <section className="mt-4 animate-slide-up">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <PhotoUpload
            currentUrl={user.avatar}
            name={user.name}
            folder="users"
            onUploaded={handleAvatarUploaded}
            size="xl"
            shape="circle"
            label="Adicionar foto"
          />
          <h2 className="mt-4 text-xl font-black text-gray-900">{user.name}</h2>
          <p className="text-gray-500 text-sm font-medium">{user.email}</p>
          <Badge variant="primary" className="mt-3 px-4 py-1 uppercase font-black text-[10px] tracking-widest">
            {`Tutor desde ${user.joinedDate}`}
          </Badge>
        </div>
      </section>

      {/* ── Configurações ── */}
      <section className="mt-8 flex flex-col gap-6">
        <div>
          <p className="section-label mb-3 ml-2">Minha Conta</p>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            <MenuAction icon="person" label="Editar Perfil" onClick={() => router.push("/cliente/perfil/editar")} />
            <MenuAction icon="notifications" label="Notificações" onClick={() => router.push("/cliente/notificacoes")} />
            <MenuAction icon="security" label="Segurança" onClick={() => {}} />
            <MenuAction icon="credit_card" label="Pagamentos" onClick={() => {}} />
          </div>
        </div>

        <div>
          <p className="section-label mb-3 ml-2">Pets e Serviços</p>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            <MenuAction icon="pets" label="Meus Pets" onClick={() => router.push("/cliente/meus-pets")} />
            <MenuAction icon="history" label="Histórico de Serviços" onClick={() => router.push("/cliente/historico")} />
            <MenuAction icon="redeem" label="Indicações" badge={`${user.referralCount} indic.`} onClick={() => router.push("/cliente/indicacoes")} />
            <MenuAction icon="star" label="Avaliações" onClick={() => router.push("/cliente/avaliacoes")} />
          </div>
        </div>

        <div>
          <p className="section-label mb-3 ml-2">Outros</p>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            <MenuAction icon="help" label="Ajuda e Suporte" onClick={() => window.open("https://wa.me/5562984810290", "_blank")} />
            <MenuAction icon="description" label="Termos e Privacidade" onClick={() => router.push("/cliente/termos")} />
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors group"
            >
              <div className="flex items-center gap-4 text-red-500 font-bold">
                <MaterialIcon icon="logout" size="md" />
                <span>Sair da conta</span>
              </div>
              <MaterialIcon icon="chevron_right" size="sm" className="text-red-200 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>
      </section>
      
      <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-10">
        Visorpet App v1.0.4
      </p>
    </div>
  );
}

function MenuAction({ icon, label, onClick, badge }: { icon: string; label: string; onClick: () => void; badge?: string }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <MaterialIcon icon={icon} size="sm" />
        </div>
        <span className="text-gray-700 font-bold text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <Badge variant="success" className="text-[9px] uppercase font-black px-2">{badge || ""}</Badge>
        )}
        <MaterialIcon icon="chevron_right" size="sm" className="text-gray-300 group-hover:text-primary transition-colors" />
      </div>
    </button>
  );
}
