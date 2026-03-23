"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SuperAdminSidebar } from "@/components/layout/SuperAdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Tela de login (/admin) não tem sidebar
  if (pathname === "/admin") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-bg-light flex">
      <SuperAdminSidebar />
      <main className="flex-1 md:ml-64 bg-background-light min-h-screen">
        {children}
      </main>
    </div>
  );
}
