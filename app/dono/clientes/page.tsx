"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Avatar, Badge } from "@/components/ui";

type Client = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  pets: { id: string }[];
};

export default function DonoClientesPage() {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const url = q ? `/api/clients?search=${encodeURIComponent(q)}` : "/api/clients";
      const res = await fetch(url);
      const json = await res.json();
      setClients(json.data ?? []);
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients("");
  }, [fetchClients]);

  useEffect(() => {
    const t = setTimeout(() => fetchClients(search), 400);
    return () => clearTimeout(t);
  }, [search, fetchClients]);

  return (
    <div className="page-container">
      <PageHeader title="Meus Clientes" />

      <section className="animate-slide-up mb-4">
        <div className="relative">
          <MaterialIcon icon="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 pl-10 pr-4 py-3 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-gray-900"
          />
        </div>
      </section>

      <section className="animate-slide-up space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-pulse h-16" />
          ))
        ) : clients.length === 0 ? (
          <div className="text-center py-10">
            <MaterialIcon icon="group_off" size="xl" className="text-gray-300 mb-2" />
            <p className="text-gray-500 font-medium">
              {search ? "Nenhum cliente encontrado." : "Ainda não há clientes cadastrados."}
            </p>
          </div>
        ) : (
          clients.map((cliente) => (
            <div
              key={cliente.id}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar name={cliente.name} size="md" />
                <div>
                  <p className="font-bold text-gray-900 text-sm">{cliente.name}</p>
                  <p className="text-gray-500 text-xs">
                    {cliente.pets.length} {cliente.pets.length === 1 ? "pet" : "pets"} cadastrado
                    {cliente.pets.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-gray-400 text-xs">{cliente.phone}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="success" className="text-[10px]">ativo</Badge>
                <a
                  href={`https://wa.me/55${cliente.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary bg-primary/10 p-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <MaterialIcon icon="chat" size="sm" />
                </a>
              </div>
            </div>
          ))
        )}
      </section>

      <Link
        href="/dono/clientes/novo"
        className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40"
      >
        <MaterialIcon icon="person_add" size="lg" />
      </Link>
    </div>
  );
}
