"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  iconFilled?: string;  // ícone filled (ativo)
  badge?: number;
}

const clientNavItems: NavItem[] = [
  { href: "/cliente/inicio",      label: "Início",    icon: "home" },
  { href: "/cliente/agendamento", label: "Agendar",   icon: "calendar_add_on" },
  { href: "/cliente/historico",   label: "Histórico", icon: "history" },
  { href: "/cliente/meus-pets",   label: "Meus Pets", icon: "pets" },
  { href: "/cliente/perfil",      label: "Perfil",    icon: "person" },
];

const donoNavItems: NavItem[] = [
  { href: "/dono/inicio",          label: "Início",       icon: "home" },
  { href: "/dono/agenda",          label: "Agenda",       icon: "calendar_view_week" },
  { href: "/dono/clientes",        label: "Clientes",     icon: "group" },
  { href: "/dono/servicos",        label: "Serviços",     icon: "content_cut" },
  { href: "/dono/perfil",          label: "Perfil",       icon: "storefront" },
];

const adminNavItems: NavItem[] = [
  { href: "/admin/painel",         label: "Painel",       icon: "dashboard" },
  { href: "/admin/petshops",       label: "Pet Shops",    icon: "storefront" },
  // { href: "/admin/usuarios",       label: "Usuários",     icon: "group" },
  // { href: "/admin/financeiro",     label: "Financeiro",   icon: "account_balance" },
  { href: "/admin/configuracoes",  label: "Config",       icon: "settings" },
];

type Role = "cliente" | "dono" | "admin";

interface BottomNavProps {
  role?: Role;
}

function getItems(role: Role): NavItem[] {
  if (role === "dono")  return donoNavItems;
  if (role === "admin") return adminNavItems;
  return clientNavItems;
}

function BottomNavItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-col items-center gap-0.5 px-2 pt-1 pb-0.5 rounded-xl",
        "transition-all duration-200 flex-1",
        isActive
          ? "text-primary"
          : "text-gray-400 hover:text-gray-600"
      )}
      aria-current={isActive ? "page" : undefined}
      aria-label={item.label}
    >
      {/* Icon with filled state when active */}
      <div className="relative">
        <MaterialIcon
          icon={item.icon}
          size="md"
          fill={isActive}
          className={cn(
            "transition-all duration-200",
            isActive ? "scale-110" : "scale-100"
          )}
        />
        {item.badge ? (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {item.badge > 9 ? "9+" : item.badge}
          </span>
        ) : null}
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-[10px] font-medium leading-none",
          isActive ? "font-bold" : ""
        )}
      >
        {item.label}
      </span>

      {/* Active dot */}
      {isActive && (
        <span className="w-1 h-1 rounded-full bg-primary animate-scale-in" />
      )}
    </Link>
  );
}

/**
 * Bottom navigation bar — detecta role e renderiza os itens corretos.
 * Uso: <BottomNav role="cliente" />
 */
export function BottomNav({ role = "cliente" }: BottomNavProps) {
  const pathname = usePathname();
  const items = getItems(role);

  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      <div className="flex items-end justify-around max-w-md mx-auto">
        {items.map((item) => (
          <BottomNavItem
            key={item.href}
            item={item}
            isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
          />
        ))}
      </div>
    </nav>
  );
}
