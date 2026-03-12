"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Avatar } from "@/components/ui/Avatar";

interface PageHeaderProps {
  /** Título principal da página */
  title?: string;
  /** Subtítulo / saudação */
  subtitle?: string;
  /** Se verdadeiro, mostra botão de voltar */
  showBack?: boolean;
  /** Override do href do botão de voltar */
  backHref?: string;
  /** Ação no botão direito */
  rightAction?: {
    icon: string;
    label: string;
    href?: string;
    onClick?: () => void;
    badge?: number;
  };
  /** Avatar do usuário (canto direito opcional) */
  userAvatar?: {
    src?: string;
    name: string;
    href?: string;
  };
  /** Renderiza conteúdo extra abaixo do título */
  children?: React.ReactNode;
  className?: string;
  /** Mostra logo Visorpet em vez de título */
  showLogo?: boolean;
}

/**
 * Header sticky para todas as páginas.
 * Uso:
 *   <PageHeader title="Meus Pets" showBack />
 *   <PageHeader showLogo rightAction={{ icon: "notifications", label: "Notificações", href: "/cliente/notificacoes" }} />
 */
export function PageHeader({
  title,
  subtitle,
  showBack = false,
  backHref,
  rightAction,
  userAvatar,
  children,
  className,
  showLogo = false,
}: PageHeaderProps) {
  return (
    <header className={cn("sticky-header px-4 py-3", className)}>
      <div className="flex items-center gap-3">

        {/* Back button */}
        {showBack && (
          <Link
            href={backHref ?? "#"}
            onClick={backHref ? undefined : (e) => { e.preventDefault(); window.history.back(); }}
            aria-label="Voltar"
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <MaterialIcon icon="arrow_back" size="md" className="text-gray-700" />
          </Link>
        )}

        {/* Logo or Title */}
        <div className="flex-1 min-w-0">
          {showLogo ? (
            <span className="text-xl font-black text-primary tracking-tight">
              visorpet
              <span className="text-primary/40">.</span>
            </span>
          ) : (
            <>
              {title && (
                <h1 className="text-base font-bold text-gray-900 leading-tight truncate">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs text-gray-500 truncate">{subtitle}</p>
              )}
            </>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {rightAction && (
            rightAction.href ? (
              <Link
                href={rightAction.href}
                aria-label={rightAction.label}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <MaterialIcon icon={rightAction.icon} size="md" className="text-gray-700" />
                {rightAction.badge ? (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                ) : null}
              </Link>
            ) : (
              <button
                onClick={rightAction.onClick}
                aria-label={rightAction.label}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <MaterialIcon icon={rightAction.icon} size="md" className="text-gray-700" />
                {rightAction.badge ? (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                ) : null}
              </button>
            )
          )}

          {userAvatar && (
            userAvatar.href ? (
              <Link href={userAvatar.href} aria-label="Meu perfil">
                <Avatar
                  src={userAvatar.src}
                  name={userAvatar.name}
                  size="sm"
                  ring
                />
              </Link>
            ) : (
              <Avatar
                src={userAvatar.src}
                name={userAvatar.name}
                size="sm"
                ring
              />
            )
          )}
        </div>
      </div>

      {children}
    </header>
  );
}
