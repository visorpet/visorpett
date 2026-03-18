"use client";

import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui";

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showBanner, setShowBanner]       = useState(false);

  useEffect(() => {
    // Registra o service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => console.log("[SW] Registered:", reg.scope))
        .catch((err) => console.warn("[SW] Registration failed:", err));
    }

    // Captura o prompt de instalação PWA
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Mostra banner após 3 segundos se ainda não instalado
      const dismissed = sessionStorage.getItem("pwa-banner-dismissed");
      if (!dismissed) {
        setTimeout(() => setShowBanner(true), 3000);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
    setShowBanner(false);
  }

  function dismiss() {
    setShowBanner(false);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  }

  return (
    <>
      {children}

      {/* Banner de instalação */}
      {showBanner && (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🐾</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm">Instalar Visorpet</p>
              <p className="text-xs text-gray-500">Acesse mais rápido, funciona offline</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleInstall}
                className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg"
              >
                Instalar
              </button>
              <button onClick={dismiss} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100">
                <MaterialIcon icon="close" size="sm" className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
