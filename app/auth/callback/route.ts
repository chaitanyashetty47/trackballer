import { NextResponse } from "next/server"

import { getPostOAuthRedirectPath } from "@/lib/auth/post-oauth-redirect"
import { createClient } from "@/lib/supabase/server"

/**
 * Optional callback route if Supabase redirect allow list includes /auth/callback.
 * Primary flow uses Site URL (/) and middleware code exchange.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  const destination = await getPostOAuthRedirectPath(supabase)
  return NextResponse.redirect(`${origin}${destination}`)
}
