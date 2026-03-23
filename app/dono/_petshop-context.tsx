"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ShopMeta = { logoUrl?: string | null; name?: string };

const PetShopContext = createContext<{
  shopMeta: ShopMeta;
  refreshShop: () => Promise<void>;
}>({
  shopMeta: {},
  refreshShop: async () => {},
});

export function PetShopProvider({ children }: { children: React.ReactNode }) {
  const [shopMeta, setShopMeta] = useState<ShopMeta>({});

  const refreshShop = useCallback(async () => {
    try {
      const res = await fetch("/api/petshops/me");
      const json = await res.json();
      if (json.data) {
        setShopMeta({ logoUrl: json.data.logoUrl, name: json.data.name });
      }
    } catch { /* silencioso */ }
  }, []);

  useEffect(() => { refreshShop(); }, [refreshShop]);

  return (
    <PetShopContext.Provider value={{ shopMeta, refreshShop }}>
      {children}
    </PetShopContext.Provider>
  );
}

export const usePetShop = () => useContext(PetShopContext);
