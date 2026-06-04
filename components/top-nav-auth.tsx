import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

function initials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
}

/** Server: sign-in link for guests, profile avatar for signed-in users. */
export async function TopNavAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Link
        href="/login"
        className={cn(buttonVariants({ size: "sm", variant: "default" }), "shrink-0")}
      >
        Sign in
      </Link>
    )
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle()

  const name = profile?.display_name?.trim() || "Fan"
  const avatarUrl = profile?.avatar_url

  return (
    <Link
      href={`/profile/${user.id}`}
      className={cn(
        "relative flex size-9 shrink-0 overflow-hidden rounded-full border border-border bg-muted",
        "transition-opacity hover:opacity-90",
      )}
      aria-label={`Your profile (${name})`}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- OAuth avatar hosts vary
        <img
          src={avatarUrl}
          alt=""
          className="size-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="flex size-full items-center justify-center text-xs font-semibold text-muted-foreground">
          {initials(name)}
        </span>
      )}
    </Link>
  )
}
