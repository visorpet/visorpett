"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Avatar } from "@/components/ui/Avatar";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

const adminNavItems: NavItem[] = [
  { href: "/admin/painel",         label: "Visão Geral",  icon: "dashboard" },
  { href: "/admin/petshops",       label: "Pet Shops",    icon: "storefront" },
  { href: "/admin/planos",         label: "Planos",       icon: "monetization_on" },
  { href: "/admin/financeiro",     label: "Financeiro",   icon: "account_balance" },
  { href: "/admin/suporte",        label: "Suporte",      icon: "headset_mic", badge: 3 },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-primary/10 flex flex-col hidden md:flex">
      {/* Logo */}
      <div className="p-6 border-b border-primary/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-md shadow-primary/30">
          V
        </div>
        <div>
          <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none">visorpet</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Super Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 no-scrollbar">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <MaterialIcon 
                icon={item.icon} 
                fill={isActive} 
                className={cn(
                  "transition-colors", 
                  isActive ? "text-white" : "text-gray-400 group-hover:text-primary"
                )} 
              />
              <span className={cn("text-sm font-medium", isActive && "font-bold")}>
                {item.label}
              </span>
              
              {item.badge ? (
                <span className={cn(
                  "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full",
                  isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
                )}>
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User */}
      <div className="p-4 border-t border-primary/5">
        <Link 
          href="/admin/configuracoes"
          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <MaterialIcon icon="settings" className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Configurações</span>
        </Link>
        
        <div className="mt-2 flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50/50 border border-gray-100">
          <Avatar name="Admin" size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">Matheus</p>
            <p className="text-[10px] text-gray-500 truncate">admin@visor.pet</p>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200/50 text-gray-400 transition-colors">
            <MaterialIcon icon="logout" size="sm" />
          </button>
        </div>
      </div>
    </aside>
  );
}
