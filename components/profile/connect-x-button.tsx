"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { XIcon } from "@/components/login/oauth-provider-icons"
import { Button } from "@/components/ui/button"
import { getOAuthRedirectUrl } from "@/lib/auth/oauth-providers"
import {
  buildAvatarCacheUpdate,
  type AvatarSource,
} from "@/lib/profile/display-avatar"
import { createClient } from "@/lib/supabase/client"

type ConnectXButtonProps = {
  twitterHandle: string | null
  twitterVerifiedAt: string | null
}

export function ConnectXButton({
  twitterHandle,
  twitterVerifiedAt,
}: ConnectXButtonProps) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isVerified = Boolean(twitterVerifiedAt && twitterHandle)

  async function connectX() {
    setError(null)
    setPending(true)

    const supabase = createClient()
    const { error: linkError } = await supabase.auth.linkIdentity({
      provider: "x",
      options: {
        redirectTo: getOAuthRedirectUrl(window.location.origin),
      },
    })

    if (linkError) {
      setPending(false)
      setError(linkError.message)
    }
  }

  async function disconnectX() {
    setError(null)
    setPending(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const xIdentity = user?.identities?.find(
      (identity) => identity.provider === "x" || identity.provider === "twitter",
    )

    if (xIdentity) {
      const { error: unlinkError } = await supabase.auth.unlinkIdentity(xIdentity)
      if (unlinkError) {
        setPending(false)
        setError(unlinkError.message)
        return
      }
    }

    const { data: existing } = await supabase
      .from("profiles")
      .select("avatar_source, google_avatar_url, x_avatar_url, avatar_url")
      .eq("id", user?.id ?? "")
      .maybeSingle()

    const nextSource: AvatarSource | null =
      existing?.avatar_source === "x"
        ? "google"
        : existing?.avatar_source === "google"
          ? "google"
          : null

    const avatarCache = buildAvatarCacheUpdate({
      avatar_source: nextSource ?? null,
      google_avatar_url: existing?.google_avatar_url,
      x_avatar_url: null,
      avatar_url: existing?.avatar_url,
    })

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        twitter_handle: null,
        twitter_verified_at: null,
        x_avatar_url: null,
        ...avatarCache,
      })
      .eq("id", user?.id ?? "")

    setPending(false)

    if (updateError) {
      setError("Could not disconnect X. Try again.")
      return
    }

    router.refresh()
  }

  if (isVerified) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">@{twitterHandle}</span>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Verified via X
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={disconnectX}
        >
          {pending ? "Disconnecting…" : "Disconnect X"}
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Connect your X account to verify your handle and use your X profile photo.
      </p>
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={connectX}
        className="gap-2"
      >
        <XIcon className="size-4" />
        {pending ? "Redirecting…" : "Connect X account"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
