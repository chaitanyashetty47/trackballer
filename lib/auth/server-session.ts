import type { SupabaseClient, User } from "@supabase/supabase-js"

import { parseAppMetadataClaims } from "@/lib/auth/session-claims"

export type ServerAuth = {
  userId: string
  isAdmin: boolean
  isOnboarded: boolean
}

/** Single getClaims() entry for server-side auth reads. */
export async function getServerAuth(
  supabase: SupabaseClient,
): Promise<ServerAuth | null> {
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims) {
    return null
  }

  const sub = data.claims.sub
  if (typeof sub !== "string" || !sub) {
    return null
  }

  const appMetadata = data.claims.app_metadata as
    | Record<string, unknown>
    | undefined

  const { isAdmin, isOnboarded } = parseAppMetadataClaims(appMetadata)

  return {
    userId: sub,
    isAdmin,
    isOnboarded,
  }
}

/** Guard for server actions — returns a generic signed-out error. */
export async function requireServerAuth(
  supabase: SupabaseClient,
): Promise<
  | { ok: true; auth: ServerAuth }
  | { ok: false; error: string }
> {
  const auth = await getServerAuth(supabase)

  if (!auth) {
    return { ok: false, error: "Sign in to continue." }
  }

  return { ok: true, auth }
}

/** Escape hatch: full User from Auth server (OAuth identities/metadata only). */
export async function getFullAuthUser(
  supabase: SupabaseClient,
): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user ?? null
}
