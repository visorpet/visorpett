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
 * Substitui `getServerSession(authOptions)` do NextAuth em todas as API routes.
 */
export async function getSession(): Promise<AppSession | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, image: true, role: true },
    });

    if (!dbUser) return null;

    let petShopId: string | null = null;
    if (dbUser.role === "DONO") {
      try {
        const petShop = await db.petShop.findUnique({
          where: { ownerId: user.id },
          select: { id: true },
        });
        petShopId = petShop?.id ?? null;
      } catch {
        petShopId = null;
      }
    }

    return {
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
        role: dbUser.role,
        petShopId,
      },
    };
  } catch {
    return null;
  }
}
