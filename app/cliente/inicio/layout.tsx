import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Início",
  description: "Seu painel de pets e agendamentos",
};

export default function ClienteInicioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
