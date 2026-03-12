import { BottomNav } from "@/components/layout/BottomNav";

export default function AgendamentoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-light">
      {children}
    </div>
  );
}
