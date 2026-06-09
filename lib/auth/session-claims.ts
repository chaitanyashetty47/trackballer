import type { SupabaseClient } from "@supabase/supabase-js"

import { getServerAuth } from "@/lib/auth/server-session"

export type SessionClaims = {
  isAdmin: boolean
  isOnboarded: boolean
}

function readBooleanClaim(value: unknown): boolean {
  return value === true
}

/** Parse is_admin / is_onboarded from JWT app_metadata (custom access token hook). */
export function parseAppMetadataClaims(
  appMetadata: Record<string, unknown> | undefined,
): SessionClaims {
  return {
    isAdmin: readBooleanClaim(appMetadata?.is_admin),
    isOnboarded: readBooleanClaim(appMetadata?.is_onboarded),
  }
}

/** Read session claims from the current access token via getServerAuth(). */
export async function readSessionClaims(
  supabase: SupabaseClient,
): Promise<SessionClaims> {
  const auth = await getServerAuth(supabase)

  return auth
    ? { isAdmin: auth.isAdmin, isOnboarded: auth.isOnboarded }
    : { isAdmin: false, isOnboarded: false }
}
