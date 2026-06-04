import type { SupabaseClient } from "@supabase/supabase-js"

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

/** Read session claims from the current access token via getClaims(). */
export async function readSessionClaims(
  supabase: SupabaseClient,
): Promise<SessionClaims> {
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims) {
    return { isAdmin: false, isOnboarded: false }
  }

  const appMetadata = data.claims.app_metadata as
    | Record<string, unknown>
    | undefined

  return parseAppMetadataClaims(appMetadata)
}
