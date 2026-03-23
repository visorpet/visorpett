import { BottomNav } from "@/components/layout/BottomNav";
import { PetShopProvider } from "./_petshop-context";

export default function DonoLayout({ children }: { children: React.ReactNode }) {
  return (
    <PetShopProvider>
      <div className="min-h-screen bg-bg-light">
        {children}
        <BottomNav role="dono" />
      </div>
    </PetShopProvider>
  );
}
