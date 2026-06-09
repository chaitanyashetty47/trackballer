import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

import { isOnboardingBypassPath } from "@/lib/auth/onboarding-gate"
import { getPostOAuthRedirectPath } from "@/lib/auth/post-oauth-redirect"
import { getServerAuth } from "@/lib/auth/server-session"
import { syncOAuthProfilesFromAuth } from "@/lib/auth/sync-oauth-profiles"
import { getSupabasePublishableConfig } from "@/lib/supabase/env"

const AUTH_QUERY_PARAMS = ["code", "state", "error", "error_description"] as const

function stripAuthParams(url: URL): URL {
  const clean = new URL(url)
  for (const key of AUTH_QUERY_PARAMS) {
    clean.searchParams.delete(key)
  }
  return clean
}

/** Keep refreshed session cookies when proxy returns a redirect. */
function redirectWithSession(target: URL, supabaseResponse: NextResponse) {
  const response = NextResponse.redirect(target)
  for (const cookie of supabaseResponse.cookies.getAll()) {
    response.cookies.set(cookie)
  }
  return response
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
      return redirectWithSession(loginUrl, supabaseResponse)
    }

    await syncOAuthProfilesFromAuth(supabase)
    const destination = await getPostOAuthRedirectPath(supabase)
    const redirectUrl = stripAuthParams(new URL(destination, request.url))
    return redirectWithSession(redirectUrl, supabaseResponse)
  }

  const auth = await getServerAuth(supabase)

  const pathname = request.nextUrl.pathname

  if (auth && !isOnboardingBypassPath(pathname)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed_at, username, country_code")
      .eq("id", auth.userId)
      .maybeSingle()

    const onboardingDone =
      profile?.onboarding_completed_at &&
      profile.username &&
      profile.country_code

    if (!onboardingDone) {
      return redirectWithSession(new URL("/onboarding", request.url), supabaseResponse)
    }
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!auth) {
      return redirectWithSession(new URL("/login", request.url), supabaseResponse)
    }

    if (!auth.isAdmin) {
      return redirectWithSession(new URL("/", request.url), supabaseResponse)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
