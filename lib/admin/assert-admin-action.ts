import { createClient } from "@/lib/supabase/server"

import type { AdminSession } from "./require-admin"

export type AdminActionResult<T> =
  | { ok: true; admin: AdminSession; data: T }
  | { ok: false; error: string }

/** Gate for server actions — no redirect, returns error string. */
export async function assertAdminAction(): Promise<
  { ok: true; admin: AdminSession } | { ok: false; error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "Sign in to continue." }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!profile?.is_admin) {
    return { ok: false, error: "You do not have admin access." }
  }

  return { ok: true, admin: { userId: user.id } }
}
