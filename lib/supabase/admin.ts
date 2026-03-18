import { createClient } from "@supabase/supabase-js";

// Cliente com service_role — usar APENAS no servidor, nunca expor ao cliente
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
