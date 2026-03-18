"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Supabase injeta a sessão via hash na URL automaticamente
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // Sessão de recuperação ativa — pode redefinir
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
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
        <h1 className="text-2xl font-bold mb-2">Nova senha</h1>
        <p className="text-white/70 text-sm max-w-xs mx-auto">Defina uma nova senha para sua conta</p>
      </div>

      <div className="flex-1 -mt-6 bg-bg-light rounded-t-3xl px-6 pt-8 pb-12">
        {success ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <MaterialIcon icon="check_circle" size="lg" className="text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Senha atualizada!</h2>
            <p className="text-sm text-gray-500">Redirecionando para o login…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="text-xs font-semibold text-gray-600 mb-1.5 block">Nova senha</label>
              <input id="password" type="password" className="input" placeholder="Mínimo 6 caracteres"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="confirm" className="text-xs font-semibold text-gray-600 mb-1.5 block">Confirmar senha</label>
              <input id="confirm" type="password" className="input" placeholder="Repita a senha"
                value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>

            {error && (
              <p className="text-red-500 text-xs font-semibold text-center bg-red-50 p-2 rounded-lg">{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <><MaterialIcon icon="progress_activity" size="sm" className="animate-spin" />Salvando…</>
              ) : (
                <>Salvar nova senha<MaterialIcon icon="lock_reset" size="sm" /></>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
