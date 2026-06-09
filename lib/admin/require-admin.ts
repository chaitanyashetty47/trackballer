import { redirect } from "next/navigation"

import { getServerAuth } from "@/lib/auth/server-session"
import { createClient } from "@/lib/supabase/server"

export type AdminSession = {
  userId: string
}

/** Returns admin session or null (no redirect). */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient()
  const auth = await getServerAuth(supabase)

  if (!auth) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", auth.userId)
    .single()

  if (!profile?.is_admin) return null

  return { userId: auth.userId }
}

/** Gate for server pages: guests to login, non-admins to home. */
export async function requireAdmin(): Promise<AdminSession> {
  const supabase = await createClient()
  const auth = await getServerAuth(supabase)

  if (!auth) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", auth.userId)
    .single()

  if (!profile?.is_admin) {
    redirect("/")
  }

  return { userId: auth.userId }
}
