"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavSearch } from "@/components/search/nav-search"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/", label: "Home", match: (path: string) => path === "/" },
  { href: "/players", label: "Players", match: (path: string) => path.startsWith("/players") },
  {
    href: "/world-cup",
    label: "World Cup",
    match: (path: string) => path.startsWith("/world-cup"),
  },
  {
    href: "/league/premier-league",
    label: "Leagues",
    match: (path: string) => path.startsWith("/league"),
  },
] as const

export function TopNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border/80 bg-background/90 px-4 backdrop-blur-md">
      <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Trackballer home">
        <span className="flex size-7 items-center justify-center rounded-md bg-primary">
          <span className="relative size-3.5 rounded-full bg-primary-foreground before:absolute before:inset-[3px] before:rounded-full before:bg-[conic-gradient(var(--primary)_0_20%,transparent_20%_40%,var(--primary)_40%_60%,transparent_60%_80%,var(--primary)_80%_100%)] before:opacity-90" />
        </span>
        <span className="font-display text-[17px] font-bold tracking-tight">Trackballer</span>
      </Link>

      <nav
        className="ml-2 flex min-w-0 flex-1 gap-0.5 overflow-x-auto"
        aria-label="Main"
      >
        {tabs.map((tab) => {
          const active = tab.match(pathname)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative shrink-0 px-2 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground",
                active && "font-semibold text-foreground after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary",
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      <NavSearch />

      <div className="flex shrink-0 items-center gap-1">
        <Link
          href="/login"
          className="size-9 rounded-full border border-border bg-muted"
          aria-label="Sign in"
        />
      </div>
    </header>
  )
}
