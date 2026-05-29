import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/** Elevated key: new `sb_secret_...` or legacy `service_role` JWT. Server-only. */
function getSupabaseSecretKey(): string | undefined {
  return (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = getSupabaseSecretKey();

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or a server secret key (SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY)",
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
