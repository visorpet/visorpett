import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Visorpet — Gestão Inteligente para Pet Shops",
    template: "%s | Visorpet",
  },
  description:
    "Plataforma SaaS para pet shops: agendamentos, prontuários de pets, financeiro e automação WhatsApp.",
  keywords: ["pet shop", "agendamento", "banho e tosa", "SaaS pet"],
  authors: [{ name: "Visorpet" }],
  metadataBase: new URL("https://visorpet.com.br"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Visorpet",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
