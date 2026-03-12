import { BottomNav } from "@/components/layout/BottomNav";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-light">
      {children}
      <BottomNav role="cliente" />
    </div>
  );
}
