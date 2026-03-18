"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Avatar, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

type Message = {
  id:         string;
  type:       string;
  typeLabel:  string;
  message:    string;
  waLink:     string;
  status:     "pending" | "sent";
  createdAt:  string;
  petName:    string;
  clientName: string;
  phone:      string;
};

const TYPE_ICONS: Record<string, string> = {
  retorno:         "schedule",
  lembrete_d1:     "event",
  pos_atendimento: "thumb_up",
};
const TYPE_COLORS: Record<string, string> = {
  retorno:         "bg-amber-100 text-amber-600",
  lembrete_d1:     "bg-blue-100 text-blue-600",
  pos_atendimento: "bg-green-100 text-green-600",
};

function MessageCard({ msg, onMarkSent }: { msg: Message; onMarkSent: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [marking, setMarking]   = useState(false);

  async function handleMarkSent() {
    setMarking(true);
    try {
      await fetch("/api/dono/mensagens", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id: msg.id }),
      });
      onMarkSent(msg.id);
    } finally {
      setMarking(false);
    }
  }

  const icon  = TYPE_ICONS[msg.type]  ?? "chat";
  const color = TYPE_COLORS[msg.type] ?? "bg-gray-100 text-gray-600";
  const date  = new Date(msg.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  return (
    <div className="card space-y-3">
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
          <MaterialIcon icon={icon} size="sm" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-gray-900 text-sm truncate">{msg.clientName}</p>
            <span className="text-xs text-gray-400 flex-shrink-0">{date}</span>
          </div>
          <p className="text-xs text-gray-500">{msg.petName} · {msg.typeLabel}</p>
        </div>
      </div>

      {/* Mensagem (expansível) */}
      <div
        className={cn(
          "bg-gray-50 rounded-xl p-3 text-sm text-gray-700 leading-relaxed cursor-pointer",
          !expanded && "line-clamp-2"
        )}
        onClick={() => setExpanded((e) => !e)}
      >
        {msg.message}
        {!expanded && (
          <span className="text-primary font-semibold ml-1">ver mais</span>
        )}
      </div>

      {/* Ações */}
      <div className="flex gap-2">
        <Link
          href={msg.waLink}
          target="_blank"
          onClick={handleMarkSent}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-bold hover:bg-[#20bd5a] transition-colors"
        >
          <MaterialIcon icon="chat" size="sm" />
          Enviar WhatsApp
        </Link>
        <button
          onClick={handleMarkSent}
          disabled={marking}
          title="Marcar como enviado sem abrir WhatsApp"
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
        >
          <MaterialIcon icon="check" size="sm" className="text-gray-500" />
        </button>
      </div>
    </div>
  );
}

export default function DonoNotificacoesPage() {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [sentCount, setSentCount] = useState(0);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<"pending" | "sent">("pending");

  async function load(status: "pending" | "sent") {
    setLoading(true);
    try {
      const res  = await fetch(`/api/dono/mensagens?status=${status}`);
      const json = await res.json();
      if (status === "pending") {
        setMessages(json.data ?? []);
      } else {
        setSentCount((json.data ?? []).length);
        setMessages(json.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(tab); }, [tab]);

  function handleMarkSent(id: string) {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setSentCount((c) => c + 1);
  }

  const pendingMessages = messages.filter((m) => m.status === "pending" || tab === "pending");

  return (
    <div className="page-container pb-24">
      <PageHeader title="Notificações WhatsApp" showBack backHref="/dono/inicio" />

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
        <MaterialIcon icon="info" size="sm" className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Envio via WhatsApp Web</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Clique em "Enviar" para abrir a mensagem pronta no WhatsApp.
            Configure a <span className="font-bold">Evolution API</span> no painel para envio automático.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
        <button
          onClick={() => setTab("pending")}
          className={cn("flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5",
            tab === "pending" ? "bg-white text-primary shadow-sm" : "text-gray-500")}
        >
          Pendentes
          {messages.length > 0 && tab === "pending" && (
            <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
              {messages.length > 9 ? "9+" : messages.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("sent")}
          className={cn("flex-1 py-2 rounded-lg text-sm font-bold transition-all",
            tab === "sent" ? "bg-white text-primary shadow-sm" : "text-gray-500")}
        >
          Enviadas
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MaterialIcon icon={tab === "pending" ? "mark_chat_read" : "chat"} size="xl" className="text-gray-300" />
          </div>
          <p className="font-semibold text-gray-500">
            {tab === "pending" ? "Nenhuma mensagem pendente" : "Nenhuma mensagem enviada ainda"}
          </p>
          {tab === "pending" && (
            <p className="text-xs text-gray-400 mt-1">
              As mensagens aparecem aqui quando o cron automático rodar
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <MessageCard key={msg.id} msg={msg} onMarkSent={handleMarkSent} />
          ))}
        </div>
      )}
    </div>
  );
}
