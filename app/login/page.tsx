"use client";

import Link from "next/link";
import { useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

/**
 * Tela de Login — Google OAuth (produção) + Email/Senha (fallback)
 * Rotas demo:
 *   /cliente/inicio   — acesso como cliente
 *   /dono/inicio      — acesso como dono de pet shop
 *   /admin/painel     — acesso como super admin
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO: integrate backend auth
    setTimeout(() => setLoading(false), 1200);
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-light">
      {/* Hero gradient top */}
      <div className="bg-gradient-primary px-6 pt-16 pb-12 text-white text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <MaterialIcon icon="pets" size="md" className="text-white" fill />
          </div>
          <span className="text-3xl font-black tracking-tight">
            visorpet
          </span>
        </div>

        <h1 className="text-2xl font-bold mb-2">
          Bem-vindo de volta! 👋
        </h1>
        <p className="text-white/70 text-sm max-w-xs mx-auto">
          Acesse sua plataforma de gestão inteligente para pet shops
        </p>
      </div>

      {/* Card */}
      <div className="flex-1 -mt-6 bg-bg-light rounded-t-3xl px-6 pt-8 pb-12">

        {/* Google Login */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 shadow-card rounded-xl py-3.5 font-semibold text-gray-700 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 mb-6"
        >
          {/* Google G SVG */}
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M19.6 10.23c0-.68-.06-1.36-.17-2H10v3.79h5.4a4.62 4.62 0 01-2 3.04v2.52h3.24c1.9-1.75 3-4.32 3-7.35z"
              fill="#4285F4"
            />
            <path
              d="M10 20c2.7 0 4.97-.9 6.63-2.43l-3.24-2.51c-.9.6-2.05.96-3.39.96-2.6 0-4.81-1.76-5.6-4.13H1.08v2.6A10 10 0 0010 20z"
              fill="#34A853"
            />
            <path
              d="M4.4 11.89A6.01 6.01 0 014.1 10c0-.66.12-1.3.3-1.89V5.51H1.08A10 10 0 000 10c0 1.61.38 3.14 1.08 4.49l3.32-2.6z"
              fill="#FBBC05"
            />
            <path
              d="M10 3.98c1.47 0 2.79.5 3.83 1.5L16.7 2.6C14.97.99 12.7 0 10 0A10 10 0 001.08 5.5l3.32 2.6C5.19 5.74 7.4 3.98 10 3.98z"
              fill="#EA4335"
            />
          </svg>
          Entrar com Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">ou use seu e-mail</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Email form */}
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
                <MaterialIcon
                  icon={showPassword ? "visibility_off" : "visibility"}
                  size="sm"
                />
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              href="/esqueci-senha"
              className="text-xs text-primary font-semibold hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
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

        {/* Demo access */}
        <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
          <p className="text-xs font-bold text-primary mb-3 text-center uppercase tracking-wide">
            🚀 Acesso Rápido (Demo)
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/cliente/inicio"
              className="flex items-center justify-between px-4 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-card-hover transition-all duration-200 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MaterialIcon icon="pets" size="xs" className="text-primary" />
                </div>
                <span className="text-sm font-semibold text-gray-800">Tutor / Cliente</span>
              </div>
              <MaterialIcon icon="chevron_right" size="sm" className="text-gray-400 group-hover:text-primary transition-colors" />
            </Link>

            <Link
              href="/dono/inicio"
              className="flex items-center justify-between px-4 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-card-hover transition-all duration-200 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <MaterialIcon icon="storefront" size="xs" className="text-emerald-600" />
                </div>
                <span className="text-sm font-semibold text-gray-800">Dono de Pet Shop</span>
              </div>
              <MaterialIcon icon="chevron_right" size="sm" className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </Link>

            <Link
              href="/admin/painel"
              className="flex items-center justify-between px-4 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-card-hover transition-all duration-200 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MaterialIcon icon="admin_panel_settings" size="xs" className="text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-gray-800">Super Admin</span>
              </div>
              <MaterialIcon icon="chevron_right" size="sm" className="text-gray-400 group-hover:text-purple-600 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Register */}
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
