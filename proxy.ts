import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

import { getPostOAuthRedirectPath } from "@/lib/auth/post-oauth-redirect"
import { readSessionClaims } from "@/lib/auth/session-claims"
import { getSupabasePublishableConfig } from "@/lib/supabase/env"

const AUTH_QUERY_PARAMS = ["code", "state", "error", "error_description"] as const

function stripAuthParams(url: URL): URL {
  const clean = new URL(url)
  for (const key of AUTH_QUERY_PARAMS) {
    clean.searchParams.delete(key)
  }
  return clean
}

export async function proxy(request: NextRequest) {
  const { url, key } = getSupabasePublishableConfig()

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
      },
    },
  })

  const code = request.nextUrl.searchParams.get("code")

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("error", "auth")
      return NextResponse.redirect(loginUrl)
    }

    const destination = await getPostOAuthRedirectPath(supabase)
    const redirectUrl = stripAuthParams(new URL(destination, request.url))
    const redirectResponse = NextResponse.redirect(redirectUrl)

    // Session cookies were written to supabaseResponse during exchange.
    for (const cookie of supabaseResponse.cookies.getAll()) {
      redirectResponse.cookies.set(cookie)
    }

    return redirectResponse
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url)
      return NextResponse.redirect(loginUrl)
    }

    const { isAdmin } = await readSessionClaims(supabase)
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
