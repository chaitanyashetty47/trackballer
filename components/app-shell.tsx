"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

import { TopNav } from "@/components/top-nav"

const bareRoutes = ["/login", "/onboarding", "/admin"]

type AppShellProps = {
  children: React.ReactNode
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background py-8 mt-auto">
      <div className="mx-auto max-w-5xl px-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Trackballer. All rights reserved.
        </p>
        <nav className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/guidelines" className="hover:text-foreground transition-colors">
            Guidelines
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  )
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const hideNav = bareRoutes.some((route) => pathname.startsWith(route))

  if (hideNav) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-svh flex-col">
      <TopNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
