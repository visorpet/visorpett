"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialIcon } from "@/components/ui";
import { useUser } from "@/lib/supabase/useUser";

const sections = [
  {
    icon: "gavel",
    title: "1. Aceitação dos Termos",
    content:
      "Ao utilizar o aplicativo Visorpet, você concorda com estes Termos de Uso e com nossa Política de Privacidade. Se não concordar com qualquer parte destes termos, não utilize o aplicativo.",
  },
  {
    icon: "pets",
    title: "2. Sobre o Visorpet",
    content:
      "O Visorpet é uma plataforma que conecta tutores de pets a pet shops e serviços veterinários. Somos intermediários e não nos responsabilizamos diretamente pela execução dos serviços prestados pelos estabelecimentos parceiros.",
  },
  {
    icon: "manage_accounts",
    title: "3. Cadastro e Conta",
    content:
      "Você é responsável por manter a confidencialidade de suas credenciais de acesso. Qualquer atividade realizada com sua conta é de sua responsabilidade. Notifique-nos imediatamente em caso de uso não autorizado.",
  },
  {
    icon: "calendar_month",
    title: "4. Agendamentos",
    content:
      "Os agendamentos realizados pelo aplicativo estão sujeitos à disponibilidade e confirmação dos estabelecimentos parceiros. Cancelamentos devem ser feitos com antecedência mínima de 2 horas.",
  },
  {
    icon: "lock",
    title: "5. Privacidade e Dados",
    content:
      "Coletamos apenas os dados necessários para o funcionamento da plataforma: nome, e-mail, informações dos pets e histórico de agendamentos. Seus dados nunca são vendidos a terceiros.",
  },
  {
    icon: "photo_camera",
    title: "6. Fotos e Conteúdo",
    content:
      "As fotos de perfil e dos pets enviadas para o aplicativo são armazenadas de forma segura. Ao enviar uma imagem, você declara ter os direitos sobre ela e autoriza seu uso dentro da plataforma.",
  },
  {
    icon: "notifications",
    title: "7. Notificações",
    content:
      "Podemos enviar notificações sobre agendamentos, promoções e atualizações do serviço. Você pode gerenciar suas preferências de notificação nas configurações do aplicativo.",
  },
  {
    icon: "security",
    title: "8. Segurança dos Dados",
    content:
      "Utilizamos criptografia e boas práticas de segurança para proteger suas informações. Em caso de incidente de segurança, você será notificado conforme exigido pela LGPD (Lei nº 13.709/2018).",
  },
  {
    icon: "edit_note",
    title: "9. Alterações nos Termos",
    content:
      "Podemos atualizar estes termos periodicamente. Alterações significativas serão comunicadas pelo aplicativo. O uso continuado após as alterações implica na aceitação dos novos termos.",
  },
  {
    icon: "support_agent",
    title: "10. Contato",
    content:
      "Dúvidas sobre privacidade ou termos de uso? Entre em contato conosco pelo WhatsApp (62) 98481-0290 ou pelo suporte no aplicativo.",
  },
];

export default function TermosPage() {
  const { user } = useUser();

  return (
    <div className="page-container font-sans pb-24">
      <PageHeader
        title="Termos e Privacidade"
        showBack
        userAvatar={{ name: user?.name || "Tutor", src: user?.image || undefined }}
      />

      {/* Hero */}
      <section className="mt-4 animate-slide-up">
        <div className="bg-gradient-primary rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <MaterialIcon icon="verified_user" size="lg" />
            </div>
            <div>
              <h2 className="font-black text-lg leading-tight">Seus dados estão seguros</h2>
              <p className="text-white/80 text-sm mt-0.5">Última atualização: março de 2024</p>
            </div>
          </div>
        </div>
      </section>

      {/* Seções */}
      <section className="mt-6 flex flex-col gap-4 animate-slide-up">
        {sections.map((s) => (
          <div key={s.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                <MaterialIcon icon={s.icon} size="sm" />
              </div>
              <h3 className="font-black text-gray-900 text-sm">{s.title}</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">{s.content}</p>
          </div>
        ))}
      </section>

      <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-10">
        Visorpet · CNPJ 00.000.000/0001-00
      </p>
    </div>
  );
}
