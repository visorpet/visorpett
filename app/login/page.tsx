"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function LoginPage() {
  const router = useRouter();
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
      {/* Hero gradient top */}
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
            <p className="text-red-500 text-xs font-semibold text-center mt-2 bg-red-50 p-2 rounded-lg">
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
    </div>
  );
}
