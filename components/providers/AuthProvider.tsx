"use client";

// Supabase gerencia a sessão via cookies automaticamente.
// Este provider não é mais necessário para autenticação,
// mas mantemos o wrapper para facilitar futuras extensões.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
