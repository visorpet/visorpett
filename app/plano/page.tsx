import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function SaaSPlansPage() {
  return (
    <div className="min-h-screen bg-bg-light font-sans text-gray-800">
      {/* Header / Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-[#6B8DFF] to-[#3A5BCE] text-white pt-20 pb-24 px-6 overflow-hidden rounded-b-[3rem] shadow-lg">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
            <MaterialIcon icon="arrow_back" size="sm" />
            <span className="text-sm font-semibold">Voltar para Login</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight drop-shadow-md">
            Whip up seu Pet Shop, <br className="hidden md:block" /> com a melhor plataforma.
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium">
            Escolha o plano perfeito para o tamanho do seu negócio. Comece de graça e mude quando precisar.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* FREE Plan */}
          <div className="bg-white rounded-3xl p-8 shadow-card border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Básico</h3>
            <p className="text-sm text-gray-500 mb-6">Para negócios começando e profissionais independentes.</p>
            <div className="mb-6">
              <span className="text-4xl font-black text-primary">Grátis</span>
              <span className="text-gray-400 font-medium">/para sempre</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <MaterialIcon icon="check_circle" className="text-emerald-500 mt-0.5" size="sm" />
                <span className="text-sm font-medium text-gray-600">Até 50 Pets cadastrados</span>
              </li>
              <li className="flex items-start gap-3">
                <MaterialIcon icon="check_circle" className="text-emerald-500 mt-0.5" size="sm" />
                <span className="text-sm font-medium text-gray-600">Agendamentos ilimitados</span>
              </li>
              <li className="flex items-start gap-3">
                <MaterialIcon icon="check_circle" className="text-emerald-500 mt-0.5" size="sm" />
                <span className="text-sm font-medium text-gray-600">Suporte por email</span>
              </li>
            </ul>
            <Link href="/cadastro" className="w-full py-3 px-6 rounded-xl font-bold text-center border-2 border-primary text-primary hover:bg-primary/5 transition-colors">
              Começar Grátis
            </Link>
          </div>

          {/* PRO Plan */}
          <div className="bg-white rounded-3xl p-8 shadow-card border-2 border-primary relative hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col transform scale-105 z-10">
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-primary text-white text-xs font-black uppercase tracking-widest py-1.5 px-4 rounded-full shadow-md">
              Mais Popular
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Pro</h3>
            <p className="text-sm text-gray-500 mb-6">A ferramenta ideal para pet shops em crescimento.</p>
            <div className="mb-6">
              <span className="text-sm text-gray-400 font-medium align-top">R$</span>
              <span className="text-4xl font-black text-gray-900">79</span>
              <span className="text-gray-400 font-medium">/mês</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <MaterialIcon icon="check_circle" className="text-emerald-500 mt-0.5" size="sm" />
                <span className="text-sm font-medium text-gray-600">Tudo do Básico</span>
              </li>
              <li className="flex items-start gap-3">
                <MaterialIcon icon="check_circle" className="text-emerald-500 mt-0.5" size="sm" />
                <span className="text-sm font-medium text-gray-900">Pets Ilimitados</span>
              </li>
              <li className="flex items-start gap-3">
                <MaterialIcon icon="check_circle" className="text-emerald-500 mt-0.5" size="sm" />
                <span className="text-sm font-medium text-gray-600">Alertas de Vacina Automáticos</span>
              </li>
              <li className="flex items-start gap-3">
                <MaterialIcon icon="check_circle" className="text-emerald-500 mt-0.5" size="sm" />
                <span className="text-sm font-medium text-gray-600">Suporte prioritário via WhatsApp</span>
              </li>
            </ul>
            <Link href="/cadastro?plan=pro" className="w-full py-3 px-6 rounded-xl font-bold text-center bg-primary text-white hover:bg-primary-dark shadow-md transition-colors">
              Assinar Pro
            </Link>
          </div>

          {/* PREMIUM Plan */}
          <div className="bg-white rounded-3xl p-8 shadow-card border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Premium</h3>
            <p className="text-sm text-gray-500 mb-6">Para pet shops com alta demanda e multitarefas.</p>
            <div className="mb-6">
              <span className="text-sm text-gray-400 font-medium align-top">R$</span>
              <span className="text-4xl font-black text-gray-900">149</span>
              <span className="text-gray-400 font-medium">/mês</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <MaterialIcon icon="check_circle" className="text-emerald-500 mt-0.5" size="sm" />
                <span className="text-sm font-medium text-gray-600">Tudo do Pro</span>
              </li>
              <li className="flex items-start gap-3">
                <MaterialIcon icon="check_circle" className="text-emerald-500 mt-0.5" size="sm" />
                <span className="text-sm font-medium text-gray-900">Integração IA para Atendimento</span>
              </li>
              <li className="flex items-start gap-3">
                <MaterialIcon icon="check_circle" className="text-emerald-500 mt-0.5" size="sm" />
                <span className="text-sm font-medium text-gray-600">Relatórios Financeiros Avançados</span>
              </li>
              <li className="flex items-start gap-3">
                <MaterialIcon icon="check_circle" className="text-emerald-500 mt-0.5" size="sm" />
                <span className="text-sm font-medium text-gray-600">Múltiplos Tosadores</span>
              </li>
            </ul>
            <Link href="/cadastro?plan=premium" className="w-full py-3 px-6 rounded-xl font-bold text-center bg-gray-900 text-white hover:bg-black shadow-md transition-colors">
              Assinar Premium
            </Link>
          </div>

          {/* ENTERPRISE Plan */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl p-8 shadow-xl border border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
            <p className="text-sm text-gray-400 mb-6">Solução definitiva para redes de franquias e clínicas.</p>
            <div className="mb-6">
              <span className="text-4xl font-black">Personalizado</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <MaterialIcon icon="star" className="text-amber-400 mt-0.5" size="sm" />
                <span className="text-sm font-medium text-gray-300">Tudo do Premium</span>
              </li>
              <li className="flex items-start gap-3">
                <MaterialIcon icon="star" className="text-amber-400 mt-0.5" size="sm" />
                <span className="text-sm font-medium text-white">Múltiplas Filiais/Unidades</span>
              </li>
              <li className="flex items-start gap-3">
                <MaterialIcon icon="star" className="text-amber-400 mt-0.5" size="sm" />
                <span className="text-sm font-medium text-gray-300">API Exclusiva & Webhooks</span>
              </li>
              <li className="flex items-start gap-3">
                <MaterialIcon icon="star" className="text-amber-400 mt-0.5" size="sm" />
                <span className="text-sm font-medium text-gray-300">Gerente de Sucesso Dedicado</span>
              </li>
            </ul>
            <Link href="mailto:contato@visorpet.app" className="w-full py-3 px-6 rounded-xl font-bold text-center bg-white text-gray-900 hover:bg-gray-100 shadow-md transition-colors">
              Falar com Consultor
            </Link>
          </div>

        </div>
      </section>

      {/* Feature Comparison or FAQ can go here */}
      <section className="bg-white py-24 px-6 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Ainda com dúvidas?</h2>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">
            Nossa equipe de especialistas está pronta para ajudar você a escolher o melhor plano para o seu pet shop.
          </p>
          <a href="mailto:ajuda@visorpet.app" className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-3 rounded-full font-bold transition-colors">
            <MaterialIcon icon="mail" size="sm" />
            Entrar em Contato
          </a>
        </div>
      </section>
    </div>
  );
}
