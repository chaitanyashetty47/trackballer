import { createLucideIcon, type LucideIcon } from "lucide-react"

/** Brand marks as Lucide icons (stroke, 24×24). */
export const GoogleIcon = createLucideIcon("Google", [
  [
    "path",
    {
      d: "M21.35 11.1h-8.74v2.51h5.03c-.43 2.33-2.31 4.06-5.03 4.06a5.5 5.5 0 0 1-5.5-5.5 5.5 5.5 0 0 1 5.5-5.5c1.25 0 2.4.42 3.32 1.12l1.88-1.88A7.48 7.48 0 0 0 12 4.5 7.5 7.5 0 0 0 4.5 12 7.5 7.5 0 0 0 12 19.5c4.28 0 7.86-3.5 7.84-7.85z",
      key: "0",
    },
  ],
])

export const FacebookIcon = createLucideIcon("Facebook", [
  [
    "path",
    {
      d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
      key: "0",
    },
  ],
])

export const AppleIcon = createLucideIcon("Apple", [
  [
    "path",
    {
      d: "M16.365 3.43c0 1.14-.493 2.27-1.177 3.08-.79.96-2.04 1.71-3.28 1.61-.12-1.09.48-2.26 1.15-3.04.83-.94 2.31-1.64 3.31-1.65ZM20.5 17.25c-.57 1.3-.83 1.88-1.56 3.03-1.01 1.57-2.44 3.52-4.22 3.54-1.58.02-1.98-1.02-4.12-1.01-2.14.01-2.6 1.03-4.18 1.01-1.78-.02-3.14-1.72-4.15-3.28C1.07 18.09.19 14.62 2.01 12.03c1.31-1.88 3.38-2.99 5.32-2.99 1.98 0 3.23 1.02 4.87 1.02 1.58 0 2.54-1.02 4.81-1.02 1.72 0 3.54.94 4.85 2.57-4.27 2.33-3.57 8.39.65 10.14Z",
      key: "0",
    },
  ],
])

import type { OAuthProviderId } from "@/lib/auth/oauth-providers"

export const oauthProviderIcons: Record<OAuthProviderId, LucideIcon> = {
  google: GoogleIcon,
  facebook: FacebookIcon,
  apple: AppleIcon,
}
