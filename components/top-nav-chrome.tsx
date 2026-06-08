"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavSearch } from "@/components/search/nav-search"
import { topNavLinks } from "@/components/top-nav-links"
import { TopNavMobileMenu } from "@/components/top-nav-mobile-menu"
import { cn } from "@/lib/utils"

type TopNavChromeProps = {
  showAdminLink?: boolean
}

/** Client: brand, tabs, search (desktop), and mobile menu. */
export function TopNavChrome({ showAdminLink = false }: TopNavChromeProps) {
  const pathname = usePathname()
  const adminActive = pathname === "/admin" || pathname.startsWith("/admin/")

  return (
    <>
      <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Trackballer home">
        <span className="flex size-7 items-center justify-center rounded-md bg-primary">
          <span className="relative size-3.5 rounded-full bg-primary-foreground before:absolute before:inset-[3px] before:rounded-full before:bg-[conic-gradient(var(--primary)_0_20%,transparent_20%_40%,var(--primary)_40%_60%,transparent_60%_80%,var(--primary)_80%_100%)] before:opacity-90" />
        </span>
        <span className="font-display text-[17px] font-bold tracking-tight">Trackballer</span>
      </Link>

      <nav
        className="ml-2 hidden min-w-0 flex-1 gap-0.5 overflow-x-auto md:flex"
        aria-label="Main"
      >
        {topNavLinks.map((tab) => {
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

      {showAdminLink ? (
        <Link
          href="/admin"
          className={cn(
            "relative hidden shrink-0 px-2 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground md:block",
            adminActive &&
              "font-semibold text-foreground after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary",
          )}
        >
          Admin
        </Link>
      ) : null}

      <div className="hidden min-w-0 max-w-[280px] flex-1 md:block">
        <NavSearch variant="header" />
      </div>

      <TopNavMobileMenu showAdminLink={showAdminLink} className="ml-auto md:hidden" />
    </>
  )
}
