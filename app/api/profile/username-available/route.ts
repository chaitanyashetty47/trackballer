import { NextResponse } from "next/server"

import {
  normalizeUsername,
  validateUsernameFormat,
} from "@/lib/profile/validate-username"
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
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", normalized)
    .maybeSingle()

  if (existing && existing.id !== user?.id) {
    return NextResponse.json({ available: false, error: "That username is taken." })
  }

  return NextResponse.json({ available: true })
}
