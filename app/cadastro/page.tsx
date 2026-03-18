"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function CadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CLIENTE" as "CLIENTE" | "DONO",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (form.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao criar conta. Tente novamente.");
        return;
      }

      // Auto-login após cadastro
      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push("/login");
      } else {
        router.push(form.role === "DONO" ? "/dono/inicio" : "/cliente/inicio");
        router.refresh();
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-light">
      <div className="bg-gradient-primary px-6 pt-16 pb-12 text-white text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <MaterialIcon icon="pets" size="md" className="text-white" fill />
          </div>
          <span className="text-3xl font-black tracking-tight">visorpet</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Criar conta grátis</h1>
        <p className="text-white/70 text-sm max-w-xs mx-auto">
          Comece a usar a plataforma de gestão para pet shops
        </p>
      </div>

      <div className="flex-1 -mt-6 bg-bg-light rounded-t-3xl px-6 pt-8 pb-12">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Nome completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="input"
              placeholder="Seu nome"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="text-xs font-semibold text-gray-600 mb-1.5 block">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="seu@email.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Tipo de conta
            </label>
            <select
              id="role"
              name="role"
              className="input"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="CLIENTE">Tutor de pet</option>
              <option value="DONO">Dono de pet shop</option>
            </select>
          </div>

          <div>
            <label htmlFor="password" className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Confirmar senha
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="input"
              placeholder="Repita a senha"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-semibold text-center bg-red-50 p-2 rounded-lg">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? (
              <>
                <MaterialIcon icon="progress_activity" size="sm" className="animate-spin" />
                Criando conta…
              </>
            ) : (
              <>
                Criar conta
                <MaterialIcon icon="arrow_forward" size="sm" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
