"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon, Avatar, Badge } from "@/components/ui";

const clientesList = [
  { id: "c1", name: "Ana Souza", phone: "11999998888", status: "ativo", pets: 2 },
  { id: "c2", name: "Pedro Costa", phone: "11988887777", status: "ativo", pets: 1 },
  { id: "c3", name: "Mariana Lima", phone: "11977776666", status: "inativo", pets: 3 },
];

export default function DonoClientesPage() {
  const [search, setSearch] = useState("");

  const filtered = clientesList.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container">
      <PageHeader title="Meus Clientes" />

      <section className="animate-slide-up mb-4">
        <div className="relative">
          <MaterialIcon icon="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 pl-10 pr-4 py-3 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-gray-900"
          />
        </div>
      </section>

      <section className="animate-slide-up space-y-3">
        {filtered.map(cliente => (
          <div key={cliente.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={cliente.name} size="md" />
              <div>
                <p className="font-bold text-gray-900 text-sm">{cliente.name}</p>
                <p className="text-gray-500 text-xs">{cliente.pets} {cliente.pets === 1 ? 'pet' : 'pets'} cadastrados</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={cliente.status === "ativo" ? "success" : "neutral"} className="text-[10px]">
                {cliente.status}
              </Badge>
              <button className="text-primary bg-primary/10 p-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                <MaterialIcon icon="chat" size="sm" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-10">
            <MaterialIcon icon="group_off" size="xl" className="text-gray-300 mb-2" />
            <p className="text-gray-500 font-medium">Nenhum cliente encontrado.</p>
          </div>
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
