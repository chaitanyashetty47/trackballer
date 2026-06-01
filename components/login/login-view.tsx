import Link from "next/link"

import { SocialAuthButtons } from "@/components/login/social-auth-buttons"

type LoginViewProps = {
  authError?: string
}

export function LoginView({ authError }: LoginViewProps) {
  return (
    <div className="mx-auto flex min-h-svh max-w-sm flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary"
          aria-label="Penaltyboxd home"
        >
          <span className="relative size-6 rounded-full bg-primary-foreground before:absolute before:inset-[5px] before:rounded-full before:bg-[conic-gradient(var(--primary)_0_20%,transparent_20%_40%,var(--primary)_40%_60%,transparent_60%_80%,var(--primary)_80%_100%)] before:opacity-90" />
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight">Penaltyboxd</h1>
        <p className="mt-1 text-sm text-muted-foreground">Rate the beautiful game</p>
      </div>

      {authError && (
        <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-center text-sm text-destructive">
          Sign-in did not complete. Please try again.
        </p>
      )}

      <SocialAuthButtons />

      <p className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Browse as guest
        </Link>
      </p>

      <p className="caption mt-10 text-center text-muted-foreground">
        <Link href="/terms" className="underline-offset-4 hover:underline">
          Terms
        </Link>
        <span className="mx-2">·</span>
        <Link href="/privacy" className="underline-offset-4 hover:underline">
          Privacy
        </Link>
      </p>
    </div>
  )
}
