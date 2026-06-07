"use client"

import { useRouter } from "nextjs-toploader/app"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function ProfileSignOutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleSignOut() {
    setPending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) {
        setPending(false)
        return
      }
      router.push("/login")
      router.refresh()
    } catch {
      setPending(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      disabled={pending}
      className="shrink-0"
    >
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  )
}
