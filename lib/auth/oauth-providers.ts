import type { Provider } from "@supabase/supabase-js"

export type OAuthProviderId = "google" | "x" | "facebook" | "apple"

export type OAuthProviderConfig = {
  id: OAuthProviderId
  supabaseProvider: Provider
  label: string
  /** When false, button is visible but sign-in is not offered yet. */
  enabled: boolean
}

/** Google + X when configured in Supabase; FB/Apple UI only until dashboard setup. */
export const oauthProviders: OAuthProviderConfig[] = [
  {
    id: "google",
    supabaseProvider: "google",
    label: "Continue with Google",
    enabled: true,
  },
  {
    id: "x",
    supabaseProvider: "x",
    label: "Continue with X",
    enabled: true,
  },
  {
    id: "facebook",
    supabaseProvider: "facebook",
    label: "Continue with Facebook",
    enabled: false,
  },
  {
    id: "apple",
    supabaseProvider: "apple",
    label: "Continue with Apple",
    enabled: false,
  },
]

/** Must match Supabase → Authentication → URL Configuration (Site URL / redirect allow list). */
export function getOAuthRedirectUrl(origin: string): string {
  return `${origin}/`
}
