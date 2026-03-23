"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, err } = await supabase.auth.signInWithPassword({ email, password }) as any;
    const loginError = (err as any) ?? null;

    if (loginError || !data?.user) {
      setError("Credenciais inválidas.");
      setLoading(false);
      return;
    }

    const role = data.user.user_metadata?.role;
    if (role !== "SUPER_ADMIN") {
      await supabase.auth.signOut();
      setError("Acesso negado. Apenas administradores podem entrar aqui.");
      setLoading(false);
      return;
    }

    router.push("/admin/painel");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      {/* Logo discreta */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <MaterialIcon icon="admin_panel_settings" size="sm" className="text-white" fill />
          </div>
          <span className="text-white text-xl font-black tracking-tight">
            visorpet
            <span className="text-indigo-400">.</span>
          </span>
        </div>
        <p className="text-gray-500 text-xs tracking-widest uppercase">Área restrita</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-2xl">
        <h1 className="text-white font-bold text-lg mb-1">Acesso administrativo</h1>
        <p className="text-gray-500 text-sm mb-6">Somente para administradores da plataforma.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="text-gray-400 text-xs font-semibold mb-1.5 block uppercase tracking-wide">
              E-mail
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@exemplo.com"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Senha */}
          <div>
            <label className="text-gray-400 text-xs font-semibold mb-1.5 block uppercase tracking-wide">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 pr-12 text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <MaterialIcon icon={showPassword ? "visibility_off" : "visibility"} size="sm" />
              </button>
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <MaterialIcon icon="error_outline" size="sm" />
              {error}
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <MaterialIcon icon="lock_open" size="sm" />
                Entrar
              </>
            )}
          </button>
        </form>
      </div>

      {/* Rodapé discreto */}
      <p className="text-gray-700 text-xs mt-8">
        © {new Date().getFullYear()} Visorpet · Acesso interno
      </p>
    </div>
  );
}
