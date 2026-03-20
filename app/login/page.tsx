"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type RoleOption = {
  key: "CLIENTE" | "DONO" | "SUPER_ADMIN";
  label: string;
  icon: string;
  description: string;
  color: string;
};

const ROLES: RoleOption[] = [
  {
    key: "CLIENTE",
    label: "Tutor",
    icon: "person",
    description: "Agendar serviços e gerenciar meus pets",
    color: "primary",
  },
  {
    key: "DONO",
    label: "Pet Shop",
    icon: "store",
    description: "Gerenciar minha loja e agendamentos",
    color: "primary",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleOption["key"] | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      setErrorMsg("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }

    const role = data.user.user_metadata?.role;
    const redirectMap: Record<string, string> = {
      CLIENTE:     "/cliente/inicio",
      DONO:        "/dono/inicio",
      SUPER_ADMIN: "/admin/painel",
    };

    router.push(redirectMap[role] ?? "/cliente/inicio");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-light">
      {/* Hero */}
      <div className="bg-gradient-primary px-6 pt-16 pb-12 text-white text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <MaterialIcon icon="pets" size="md" className="text-white" fill />
          </div>
          <span className="text-3xl font-black tracking-tight">visorpet</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Bem-vindo de volta! 👋</h1>
        <p className="text-white/70 text-sm max-w-xs mx-auto">
          Acesse sua plataforma de gestão inteligente para pet shops
        </p>
      </div>

      {/* Card */}
      <div className="flex-1 -mt-6 bg-bg-light rounded-t-3xl px-6 pt-8 pb-12">

        {/* Seletor de perfil */}
        {!selectedRole ? (
          <div className="space-y-4">
            <p className="text-sm font-bold text-gray-500 text-center mb-6 uppercase tracking-widest">
              Como deseja entrar?
            </p>
            <div className="space-y-3">
              {ROLES.map((role) => (
                <button
                  key={role.key}
                  onClick={() => setSelectedRole(role.key)}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-primary hover:shadow-md transition-all duration-200 group text-left"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <MaterialIcon icon={role.icon} size="md" className="text-primary" fill />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-base">{role.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                  </div>
                  <MaterialIcon icon="chevron_right" size="sm" className="text-gray-300 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Não tem conta?{" "}
              <Link href="/cadastro" className="text-primary font-bold hover:underline">
                Criar conta grátis
              </Link>
            </p>
          </div>
        ) : (
          /* Formulário de login */
          <div>
            {/* Voltar + perfil selecionado */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => { setSelectedRole(null); setErrorMsg(""); }}
                className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <MaterialIcon icon="arrow_back" size="sm" className="text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MaterialIcon
                    icon={ROLES.find((r) => r.key === selectedRole)!.icon}
                    size="sm"
                    className="text-primary"
                    fill
                  />
                </div>
                <span className="font-bold text-gray-800">
                  Entrar como {ROLES.find((r) => r.key === selectedRole)!.label}
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="input pr-11"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <MaterialIcon icon={showPassword ? "visibility_off" : "visibility"} size="sm" />
                  </button>
                </div>
              </div>

              {errorMsg && (
                <p className="text-red-500 text-xs font-semibold text-center bg-red-50 p-2 rounded-lg">
                  {errorMsg}
                </p>
              )}

              <div className="flex justify-end">
                <Link href="/esqueci-senha" className="text-xs text-primary font-semibold hover:underline">
                  Esqueci minha senha
                </Link>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? (
                  <>
                    <MaterialIcon icon="progress_activity" size="sm" className="animate-spin" />
                    Entrando…
                  </>
                ) : (
                  <>
                    Entrar
                    <MaterialIcon icon="arrow_forward" size="sm" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Não tem conta?{" "}
              <Link href="/cadastro" className="text-primary font-bold hover:underline">
                Criar conta grátis
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
