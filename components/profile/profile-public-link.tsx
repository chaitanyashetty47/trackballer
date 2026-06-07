"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

type ProfilePublicLinkProps = {
  username: string
}

export function ProfilePublicLink({ username }: ProfilePublicLinkProps) {
  const [copied, setCopied] = useState(false)
  const path = `/u/${username}`

  async function copyLink() {
    const url = `${window.location.origin}${path}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">Public profile</span>
        <p className="text-sm text-muted-foreground">
          Share this link — others see your ratings and comments, not edit controls.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <code className="rounded-md bg-background px-2 py-1 text-sm">{path}</code>
        <Button type="button" variant="outline" size="sm" onClick={copyLink}>
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
    </div>
  )
}
