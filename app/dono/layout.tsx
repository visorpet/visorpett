import { BottomNav } from "@/components/layout/BottomNav";

export default function DonoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-light">
      {children}
      <BottomNav role="dono" />
    </div>
  );
}
