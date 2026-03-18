import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AppSession = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
    petShopId: string | null;
  };
};

export async function getSession(): Promise<AppSession | null> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const role = (user.user_metadata?.role as string) ?? "CLIENTE";
    const name = (user.user_metadata?.name as string) ?? user.email ?? null;

    let petShopId: string | null = null;
    if (role === "DONO") {
      try {
        const db = createAdminClient();
        const { data: shop } = await db
          .from("PetShop")
          .select("id")
          .eq("ownerId", user.id)
          .maybeSingle();
        petShopId = shop?.id ?? null;
      } catch {
        petShopId = null;
      }
    }

    return {
      user: {
        id: user.id,
        name,
        email: user.email ?? null,
        image: user.user_metadata?.avatar_url ?? null,
        role,
        petShopId,
      },
    };
  } catch {
    return null;
  }
}
