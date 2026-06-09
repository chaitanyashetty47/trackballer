import { NextResponse } from "next/server"

import {
  normalizeUsername,
  validateUsernameFormat,
} from "@/lib/profile/validate-username"
import { getServerAuth } from "@/lib/auth/server-session"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const raw = searchParams.get("username") ?? ""
  const normalized = normalizeUsername(raw)

  const formatError = validateUsernameFormat(normalized)
  if (formatError) {
    return NextResponse.json({ available: false, error: formatError })
  }

  const supabase = await createClient()
  const auth = await getServerAuth(supabase)

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", normalized)
    .maybeSingle()

  if (existing && existing.id !== auth?.userId) {
    return NextResponse.json({ available: false, error: "That username is taken." })
  }

  return NextResponse.json({ available: true })
}
