"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/supabase/useUser";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Badge } from "@/components/ui";
import { cn, formatDate } from "@/lib/utils";

export default function NotificacoesPage() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock de notificações para UI (já que não há no banco ainda)
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications([
        {
          id: "1",
          title: "Agendamento Confirmado",
          message: "Seu agendamento para Bidu foi confirmado para amanhã às 10:00.",
          date: new Date().toISOString(),
          read: false,
          type: "success",
          icon: "check_circle"
        },
        {
          id: "2",
          title: "Lembrete de Vacina",
          message: "A vacina de Raiva da Luna vence em 5 dias. Agende agora!",
          date: new Date(Date.now() - 86400000).toISOString(),
          read: true,
          type: "warning",
          icon: "medical_services"
        },
        {
          id: "3",
          title: "Promoção Especial",
          message: "Ganhe 20% de desconto no banho e tosa nesta quarta-feira.",
          date: new Date(Date.now() - 172800000).toISOString(),
          read: true,
          type: "info",
          icon: "sell"
        }
      ]);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (loading) {
    return (
      <div className="page-container p-5 animate-pulse min-h-screen flex flex-col gap-6 font-sans">
        <div className="w-1/2 h-8 bg-gray-200 rounded-md" />
        <div className="h-24 bg-gray-200 rounded-2xl" />
        <div className="h-24 bg-gray-200 rounded-2xl" />
        <div className="h-24 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="page-container font-sans pb-20">
      <PageHeader 
        title="Notificações" 
        rightAction={{ icon: "done_all", label: "Ler tudo", onClick: markAllRead }}
        userAvatar={{ 
          name: user?.name || "Tutor", 
          src: user?.image || undefined,
          href: "/cliente/perfil" 
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
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 animate-scale-in",
                n.type === 'success' ? "bg-green-100 text-green-600" :
                n.type === 'warning' ? "bg-amber-100 text-amber-600" :
                "bg-blue-100 text-blue-600"
              )}>
                <MaterialIcon icon={n.icon} size="md" />
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={cn("font-bold text-gray-900 text-base", !n.read ? "text-primary" : "")}>
                    {n.title}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {formatDate(n.date)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  {n.message}
                </p>
              </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <MaterialIcon icon="notifications_off" size="xl" className="mb-4" />
            <p className="font-black uppercase tracking-tighter text-lg">Nada por aqui</p>
            <p className="text-sm font-medium">Você não tem novas notificações.</p>
          </div>
        )}
      </div>

      <button className="btn-secondary w-full mt-8 h-14 rounded-2xl font-black uppercase text-xs tracking-widest">
        Ver notificações antigas
      </button>
    </div>
  );
}
