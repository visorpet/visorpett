import { ReactNode } from "react";
import { SuperAdminSidebar } from "@/components/layout/SuperAdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-light flex">
      <SuperAdminSidebar />
      <main className="flex-1 md:ml-64 bg-background-light min-h-screen">
        {children}
      </main>
    </div>
  );
}
