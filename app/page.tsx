import { redirect } from "next/navigation";

/**
 * Root page — redireciona para o login.
 * Após autenticação, o middleware redireciona por papel:
 *   CLIENTE    → /cliente/inicio
 *   DONO       → /dono/inicio
 *   SUPER_ADMIN → /admin/painel
 */
export default function RootPage() {
  redirect("/login");
}
