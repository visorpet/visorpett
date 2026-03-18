"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type ClientUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

/**
 * Hook cliente que substitui `useSession` do NextAuth.
 * Retorna o usuário logado com name/email/image.
 */
export function useUser() {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.name ?? data.user.email ?? "",
          email: data.user.email ?? "",
          image: data.user.user_metadata?.avatar_url ?? null,
        });
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name ?? session.user.email ?? "",
          email: session.user.email ?? "",
          image: session.user.user_metadata?.avatar_url ?? null,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
