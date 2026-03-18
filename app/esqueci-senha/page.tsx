"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    if (resetError) {
      setError("Erro ao enviar e-mail. Verifique o endereço e tente novamente.");
    } else {
      setSent(true);
    }
    setLoading(false);
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
        <h1 className="text-2xl font-bold mb-2">Recuperar senha</h1>
        <p className="text-white/70 text-sm max-w-xs mx-auto">
          Enviaremos um link para redefinir sua senha
        </p>
      </div>

      <div className="flex-1 -mt-6 bg-bg-light rounded-t-3xl px-6 pt-8 pb-12">
        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <MaterialIcon icon="mark_email_read" size="lg" className="text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">E-mail enviado!</h2>
            <p className="text-sm text-gray-500">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
            <Link href="/login" className="btn-primary w-full mt-4 block text-center">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-xs font-semibold text-gray-600 mb-1.5 block">
                E-mail cadastrado
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

            {error && (
              <p className="text-red-500 text-xs font-semibold text-center bg-red-50 p-2 rounded-lg">{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <><MaterialIcon icon="progress_activity" size="sm" className="animate-spin" />Enviando…</>
              ) : (
                <>Enviar link de recuperação<MaterialIcon icon="send" size="sm" /></>
              )}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Lembrou a senha?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">Voltar ao login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
