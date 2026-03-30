"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/supabase/useUser";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, PhotoUpload } from "@/components/ui";

export default function EditarPerfilPage() {
  const { user: authUser } = useUser();
  const router = useRouter();

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (authUser) {
      setName(authUser.name || "");
      setAvatarUrl(authUser.image || null);
    }
  }, [authUser]);

  const handleAvatarUploaded = async (url: string) => {
    setAvatarUrl(url);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, string> = { name: name.trim() };
      if (avatarUrl) payload.image = avatarUrl;
      await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSaved(true);
      setTimeout(() => router.push("/cliente/perfil"), 800);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container font-sans pb-24">
      <PageHeader
        title="Editar Perfil"
        showBack
        userAvatar={{ name: authUser?.name || "Tutor", src: authUser?.image || undefined }}
      />

      <section className="mt-4 animate-slide-up flex flex-col gap-6">
        {/* Foto */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center">
          <PhotoUpload
            currentUrl={avatarUrl}
            name={name || authUser?.name || "Tutor"}
            folder="users"
            onUploaded={handleAvatarUploaded}
            size="xl"
            shape="circle"
            label="Alterar foto"
          />
        </div>

        {/* Campos */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-5">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Nome</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">E-mail</label>
            <input
              type="email"
              value={authUser?.email || ""}
              disabled
              className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-sm font-medium text-gray-400 cursor-not-allowed"
            />
            <p className="text-[11px] text-gray-400 mt-1.5 ml-1">O e-mail não pode ser alterado aqui.</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || saved || !name.trim()}
          className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {saved && <MaterialIcon icon="check_circle" size="sm" />}
          {saved ? "Salvo!" : saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </section>
    </div>
  );
}
