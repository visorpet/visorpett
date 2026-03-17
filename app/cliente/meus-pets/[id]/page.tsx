"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, Badge, MaterialIcon, ProgressBar } from "@/components/ui";
import { cn, formatDate } from "@/lib/utils";

export default function PetProntuarioPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"historico" | "vacinas" | "obs">("historico");

  useEffect(() => {
    async function fetchPet() {
      try {
        setLoading(true);
        const res = await fetch(`/api/pets/${params.id}`);
        const json = await res.json();
        if (json.data) {
          setPet(json.data);
        } else if (json.error) {
          setError(json.error);
        }
      } catch (err) {
        console.error("Erro ao carregar prontuário:", err);
        setError("Não foi possível carregar os dados do pet.");
      } finally {
        setLoading(false);
      }
    }
    fetchPet();
  }, [params.id]);

  if (loading) {
    return (
      <div className="page-container p-5 animate-pulse min-h-screen flex flex-col gap-6 font-sans">
        <div className="w-1/2 h-8 bg-gray-200 rounded-md" />
        <div className="w-full h-48 bg-gray-200 rounded-2xl" />
        <div className="flex gap-2">
           <div className="flex-1 h-10 bg-gray-200 rounded-md" />
           <div className="flex-1 h-10 bg-gray-200 rounded-md" />
           <div className="flex-1 h-10 bg-gray-200 rounded-md" />
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="page-container flex flex-col items-center justify-center p-10 text-center font-sans">
        <MaterialIcon icon="error_outline" size="xl" className="text-red-300 mb-4" />
        <h2 className="text-lg font-bold text-gray-900">Ops! Algo deu errado.</h2>
        <p className="text-gray-500 mb-6">{error || "Pet não encontrado."}</p>
        <Link href="/cliente/meus-pets" className="btn-primary px-6">Voltar</Link>
      </div>
    );
  }

  const age = pet.birthDate 
    ? (new Date().getFullYear() - new Date(pet.birthDate).getFullYear()) 
    : 0;

  const history = pet.appointments || [];
  const vaccines = pet.vaccines || [];
  const medicalNotes = pet.medicalNotes || [];

  return (
    <div className="page-container font-sans">
      <PageHeader 
        title="Prontuário" 
        userAvatar={{ 
          name: session?.user?.name || "Tutor", 
          src: session?.user?.image || undefined,
          href: "/cliente/perfil" 
        }} 
      />

      {/* ── Pet Hero ── */}
      <section className="animate-slide-up">
        <div className="bg-gradient-primary rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
          <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
            <MaterialIcon icon="pets" size="xl" className="text-[120px]!" />
          </div>
          
          <div className="flex items-center gap-5 relative z-10">
            <Avatar
              src={pet.photoUrl || undefined}
              name={pet.name}
              size="xl"
              ring
              ringColor="ring-white/40"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">{pet.name}</h1>
                <Badge variant="success" className="bg-white/20 text-white border-0 text-[10px] py-0 px-2 uppercase font-bold tracking-wider">Ativo</Badge>
              </div>
              <p className="text-white/80 text-sm font-medium">{pet.breed || "Sem raça definida"} · {pet.species}</p>
              
              <div className="flex gap-6 mt-4">
                <div>
                  <p className="text-xl font-black">{age} <span className="text-[10px] font-medium opacity-80 uppercase tracking-widest ml-1">anos</span></p>
                  <p className="text-white/60 text-[9px] uppercase font-bold tracking-widest">Idade</p>
                </div>
                <div className="w-px h-8 bg-white/20 my-auto" />
                <div>
                  <p className="text-xl font-black">{pet.weight || "--"} <span className="text-[10px] font-medium opacity-80 uppercase tracking-widest ml-1">kg</span></p>
                  <p className="text-white/60 text-[9px] uppercase font-bold tracking-widest">Peso</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs navigation ── */}
      <section className="mt-6">
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab("historico")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300",
              activeTab === "historico" ? "bg-white text-primary shadow-md transform scale-[1.02]" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <MaterialIcon icon="history" size="sm" />
            Histórico
          </button>
          <button 
            onClick={() => setActiveTab("vacinas")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300",
              activeTab === "vacinas" ? "bg-white text-primary shadow-md transform scale-[1.02]" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <MaterialIcon icon="medical_services" size="sm" />
            Vacinas
          </button>
          <button 
            onClick={() => setActiveTab("obs")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300",
              activeTab === "obs" ? "bg-white text-primary shadow-md transform scale-[1.02]" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <MaterialIcon icon="description" size="sm" />
            Obs.
          </button>
        </div>
      </section>

      {/* ── Tab content ── */}
      <section className="animate-slide-up mt-6 pb-20">
        {activeTab === "historico" && (
          <div className="flex flex-col gap-4">
            {history.map((item: any) => (
              <div key={item.id} className="card p-4 flex items-center gap-4 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                  <MaterialIcon icon={item.service?.type === 'banho' ? 'bathtub' : 'content_cut'} size="md" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-base">{item.service?.label || "Serviço"}</p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5 font-medium">
                    <MaterialIcon icon="event" className="text-[14px]!" />
                    {formatDate(item.date)}
                    <span className="opacity-30">|</span>
                    <MaterialIcon icon="person" className="text-[14px]!" />
                    {item.groomer?.name || "Pet Shop"}
                  </p>
                </div>
                <Badge variant={item.status === 'concluido' ? 'success' : 'primary'} className="text-[10px] uppercase font-black px-2.5">{item.status}</Badge>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <MaterialIcon icon="history" size="xl" className="text-gray-300 mb-3" />
                <p className="text-gray-400 text-sm font-medium">Nenhum histórico encontrado.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "vacinas" && (
          <div className="flex flex-col gap-4">
            {vaccines.map((v: any) => (
              <div key={v.id} className="card p-5 hover:border-blue-200 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                      <MaterialIcon icon="vaccines" size="sm" />
                    </div>
                    <p className="font-bold text-gray-900 text-base">{v.name}</p>
                  </div>
                  <Badge variant={v.nextDueAt ? "success" : "neutral"} className="px-3">
                    {v.nextDueAt ? "Em dia" : "Aplicada"}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs font-medium text-gray-500 pt-3 border-t border-gray-50">
                  <p className="flex items-center gap-1"><MaterialIcon icon="done_all" className="text-[14px]!" /> Aplicada em: {formatDate(v.appliedAt)}</p>
                  {v.nextDueAt && <p className="text-primary flex items-center gap-1"><MaterialIcon icon="event" className="text-[14px]!" /> Próxima: {formatDate(v.nextDueAt)}</p>}
                </div>
              </div>
            ))}
            {vaccines.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <MaterialIcon icon="vaccines" size="xl" className="text-gray-300 mb-3" />
                <p className="text-gray-400 text-sm font-medium">Nenhuma vacina registrada.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "obs" && (
          <div className="flex flex-col gap-4">
            {medicalNotes.map((note: any) => (
              <div key={note.id} className="card p-5 bg-amber-50/10 border-amber-100 hover:bg-amber-50/20 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MaterialIcon icon="account_circle" size="xs" className="text-primary" />
                    <p className="text-sm font-bold text-primary">{note.author}</p>
                  </div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(note.createdAt)}</p>
                </div>
                <div className="bg-white/50 rounded-2xl p-4 border border-amber-50">
                   <p className="text-sm text-gray-700 leading-relaxed font-medium italic">
                    "{note.note}"
                  </p>
                </div>
              </div>
            ))}
            {medicalNotes.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <MaterialIcon icon="description" size="xl" className="text-gray-300 mb-3" />
                <p className="text-gray-400 text-sm font-medium">Nenhuma observação registrada.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
