import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

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

/**
 * Retorna a sessão do usuário autenticado via Supabase.
 * Usa user_metadata como fonte de verdade (não depende do Prisma para auth).
 * Só usa o DB para petShopId (DONO users).
 */
export async function getSession(): Promise<AppSession | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    const role = (user.user_metadata?.role as string) ?? "CLIENTE";
    const name = (user.user_metadata?.name as string) ?? user.email ?? null;

    let petShopId: string | null = null;

    if (role === "DONO") {
      try {
        const petShop = await db.petShop.findUnique({
          where: { ownerId: user.id },
          select: { id: true },
        });
        petShopId = petShop?.id ?? null;
      } catch {
        // DB indisponível — DONO sem petShopId
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
