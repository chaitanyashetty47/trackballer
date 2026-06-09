"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const adminTabs = [
  {
    href: "/admin",
    label: "Overview",
    match: (path: string) => path === "/admin",
  },
  {
    href: "/admin/trending",
    label: "Trending",
    match: (path: string) => path.startsWith("/admin/trending"),
  },
  {
    href: "/admin/team-of-the-stage",
    label: "Team of the Stage",
    match: (path: string) => path.startsWith("/admin/team-of-the-stage"),
  },
  {
    href: "/admin/comments",
    label: "Comments",
    match: (path: string) => path.startsWith("/admin/comments"),
  },
  {
    href: "/admin/data",
    label: "Fix data",
    match: (path: string) => path.startsWith("/admin/data"),
  },
] as const

type AdminShellProps = {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border/80 bg-background/90 px-4 backdrop-blur-md">
        <Link
          href="/admin"
          className="flex shrink-0 items-center gap-2"
          aria-label="Admin home"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary">
            <span className="relative size-3.5 rounded-full bg-primary-foreground before:absolute before:inset-[3px] before:rounded-full before:bg-[conic-gradient(var(--primary)_0_20%,transparent_20%_40%,var(--primary)_40%_60%,transparent_60%_80%,var(--primary)_80%_100%)] before:opacity-90" />
          </span>
          <span className="font-display text-[17px] font-bold tracking-tight">
            Trackballer
          </span>
        </Link>

        <nav
          className="ml-2 flex min-w-0 flex-1 justify-center gap-0.5 overflow-x-auto"
          aria-label="Admin"
        >
          {adminTabs.map((tab) => {
            const active = tab.match(pathname)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative shrink-0 px-2 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground",
                  active &&
                    "font-semibold text-foreground after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary",
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>

        <Link
          href="/"
          className="shrink-0 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Exit to home
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
    </div>
  )
}
