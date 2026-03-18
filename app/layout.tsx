import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { PWAProvider } from "@/components/providers/PWAProvider";
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
  metadataBase: new URL("https://visorpet.vercel.app"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable:       true,
    statusBarStyle: "default",
    title:         "Visorpet",
  },
  openGraph: {
    type:     "website",
    locale:   "pt_BR",
    siteName: "Visorpet",
    images:   [{ url: "/icons/icon-512x512.png" }],
  },
  icons: {
    icon:   [
      { url: "/icons/icon-96x96.png",  sizes: "96x96"  },
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
    ],
    apple:  [
      { url: "/icons/icon-152x152.png", sizes: "152x152" },
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
    ],
  },
};

export const viewport: Viewport = {
  width:                "device-width",
  initialScale:         1,
  maximumScale:         1,
  userScalable:         false,
  themeColor:           "#7C3AED",
  viewportFit:          "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* iOS PWA */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <PWAProvider>
            {children}
          </PWAProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
