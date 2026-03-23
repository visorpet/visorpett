"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/supabase/useUser";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon } from "@/components/ui";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  icon: string;
  type: "success" | "warning" | "info";
};

function appointmentToNotification(appt: any): Notification {
  const apptDate = new Date(appt.date);
  const now = new Date();
  const diffMs = apptDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let when = "";
  if (diffDays === 0) when = "hoje";
  else if (diffDays === 1) when = "amanhã";
  else when = `em ${diffDays} dias`;

  const hour = apptDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return {
    id: appt.id,
    title: `Agendamento ${when}`,
    message: `${appt.service?.label ?? "Serviço"} para ${appt.pet?.name ?? "seu pet"} ${when} às ${hour}${appt.petShop?.name ? ` — ${appt.petShop.name}` : ""}.`,
    date: appt.date,
    read: false,
    icon: "calendar_month",
    type: diffDays <= 1 ? "warning" : "info",
  };
}

export default function NotificacoesPage() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/appointments?status=agendado`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          const upcoming = (json.data as any[]).filter(
            (a) => new Date(a.date) >= new Date()
          );
          setNotifications(upcoming.map(appointmentToNotification));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (loading) {
    return (
      <div className="page-container p-5 animate-pulse min-h-screen flex flex-col gap-6 font-sans">
        <div className="w-1/2 h-8 bg-gray-200 rounded-md" />
        <div className="h-24 bg-gray-200 rounded-2xl" />
        <div className="h-24 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="page-container font-sans pb-20">
      <PageHeader
        title="Notificações"
        rightAction={
          notifications.some((n) => !n.read)
            ? { icon: "done_all", label: "Ler tudo", onClick: markAllRead }
            : undefined
        }
        userAvatar={{
          name: user?.name || "Tutor",
          src: user?.image || undefined,
          href: "/cliente/perfil",
        }}
      />

      <div className="flex flex-col gap-3 mt-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              "card p-5 relative overflow-hidden transition-all hover:border-primary/20",
              !n.read ? "bg-primary/5 border-primary/10" : "bg-white"
            )}
          >
            {!n.read && <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-bl-lg" />}

            <div className="flex gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
                  n.type === "success"
                    ? "bg-green-100 text-green-600"
                    : n.type === "warning"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-blue-100 text-blue-600"
                )}
              >
                <MaterialIcon icon={n.icon} size="md" />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={cn("font-bold text-gray-900 text-base", !n.read ? "text-primary" : "")}>
                    {n.title}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {new Date(n.date).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">{n.message}</p>
              </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <MaterialIcon icon="notifications_off" size="xl" className="mb-4" />
            <p className="font-black uppercase tracking-tighter text-lg">Nada por aqui</p>
            <p className="text-sm font-medium">Você não tem agendamentos futuros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
