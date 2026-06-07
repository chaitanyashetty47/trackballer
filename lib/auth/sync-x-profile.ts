import type { SupabaseClient, User } from "@supabase/supabase-js"

import type { Database } from "@/lib/database.types"
import { normalizeSocialHandle } from "@/lib/profile/validate-social-handles"

type AuthUser = User

function readXIdentityData(user: AuthUser): {
  handle: string | null
  avatarUrl: string | null
} {
  const xIdentity = user.identities?.find(
    (identity) => identity.provider === "x" || identity.provider === "twitter",
  )

  const meta = {
    ...(user.user_metadata ?? {}),
    ...((xIdentity?.identity_data as Record<string, unknown> | undefined) ?? {}),
  }

  const rawHandle =
    (typeof meta.user_name === "string" && meta.user_name) ||
    (typeof meta.preferred_username === "string" && meta.preferred_username) ||
    (typeof meta.screen_name === "string" && meta.screen_name) ||
    null

  const normalized = rawHandle
    ? normalizeSocialHandle("twitter", rawHandle)
    : { ok: true as const, handle: null }

  const handle = normalized.ok ? normalized.handle : null

  const avatarUrl =
    (typeof meta.picture === "string" && meta.picture) ||
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.profile_image_url === "string" && meta.profile_image_url) ||
    null

  return { handle, avatarUrl }
}

/** After X sign-in or Connect X, copy verified handle and profile photo into profiles. */
export async function syncXProfileFromAuth(
  supabase: SupabaseClient<Database>,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const { handle, avatarUrl } = readXIdentityData(user)
  if (!handle && !avatarUrl) return

  const updates: Database["public"]["Tables"]["profiles"]["Update"] = {}

  if (handle) {
    updates.twitter_handle = handle
    updates.twitter_verified_at = new Date().toISOString()
  }

  if (avatarUrl?.startsWith("https://")) {
    updates.avatar_url = avatarUrl
  }

  if (Object.keys(updates).length === 0) return

  await supabase.from("profiles").update(updates).eq("id", user.id)
}
