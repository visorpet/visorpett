"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon } from "@/components/ui";

type FAQ = { question: string; answer: string };

const FAQS: FAQ[] = [
  {
    question: "Como adiciono um novo tosador?",
    answer: "Vá em Meu Negócio → Equipe e Tosadores → clique em '+ Novo Tosador'. Preencha o nome e telefone e salve.",
  },
  {
    question: "Como o cliente agenda pelo meu pet shop?",
    answer: "Você tem uma página pública de agendamento. Compartilhe o link que aparece em Meu Negócio. O cliente acessa, escolhe o serviço, pet, data e confirma.",
  },
  {
    question: "Como altero os preços dos serviços?",
    answer: "Vá em Meu Negócio → Serviços e Preços. Clique no serviço que deseja editar, altere o preço ou a duração e salve.",
  },
  {
    question: "Como funciona o envio de mensagens pelo WhatsApp?",
    answer: "No plano Pro e Premium, a plataforma envia automaticamente mensagens de lembrete 1 dia antes do agendamento, retorno quando passa 30+ dias sem visita, e pós-atendimento após o serviço.",
  },
  {
    question: "Como vejo o histórico financeiro?",
    answer: "Acesse a aba Financeiro no menu. Lá você vê o faturamento mensal, agendamentos concluídos e comparativos.",
  },
  {
    question: "Posso cancelar um agendamento?",
    answer: "Sim. Na aba Agenda, clique no agendamento e selecione 'Cancelar'. O status é atualizado e o cliente pode ser notificado.",
  },
  {
    question: "Como faço upgrade do meu plano?",
    answer: "Vá em Meu Negócio → Minha Assinatura → Ver planos. Escolha o plano desejado. Nossa equipe entrará em contato pelo WhatsApp para processar o pagamento.",
  },
  {
    question: "Meu slug/link pode ser alterado?",
    answer: "Sim, mas com cuidado: ao alterar o slug, links antigos deixam de funcionar. Acesse Dados do Pet Shop para editar.",
  },
];

const CONTACTS = [
  { icon: "chat", label: "WhatsApp", sub: "Seg–Sex, 9h–18h", href: "https://wa.me/5511999999999", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: "mail", label: "E-mail", sub: "suporte@visorpet.com", href: "mailto:suporte@visorpet.com", color: "text-blue-600", bg: "bg-blue-50" },
];

function FAQItem({ item }: { item: FAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-semibold text-sm text-gray-900 pr-2">{item.question}</span>
        <MaterialIcon
          icon={open ? "expand_less" : "expand_more"}
          size="sm"
          className={`flex-shrink-0 transition-transform text-gray-400`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function AjudaPage() {
  return (
    <div className="page-container pb-24 font-sans">
      <PageHeader title="Central de Ajuda" showBack backHref="/dono/perfil" />

      {/* ── Contato rápido ── */}
      <section className="mt-4 animate-slide-up">
        <p className="section-label mb-3">Fale com a gente</p>
        <div className="flex flex-col gap-2">
          {CONTACTS.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-card-hover transition-all duration-200"
            >
              <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center`}>
                <MaterialIcon icon={c.icon} className={c.color} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm">{c.label}</p>
                <p className="text-xs text-gray-500">{c.sub}</p>
              </div>
              <MaterialIcon icon="chevron_right" size="sm" className="text-gray-300" />
            </a>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mt-6 animate-slide-up">
        <p className="section-label mb-3">Perguntas Frequentes</p>
        <div className="flex flex-col gap-2">
          {FAQS.map((faq) => (
            <FAQItem key={faq.question} item={faq} />
          ))}
        </div>
      </section>

      <p className="text-center text-xs text-gray-300 mt-8">
        Visorpet · Todos os direitos reservados
      </p>
    </div>
  );
}
