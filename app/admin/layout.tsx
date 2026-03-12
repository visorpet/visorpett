import { BottomNav } from "@/components/layout/BottomNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-light">
      {children}
      <BottomNav role="admin" />
    </div>
  );
}
