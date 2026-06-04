"use client"

import { usePathname } from "next/navigation"

import { TopNav } from "@/components/top-nav"

const bareRoutes = ["/login", "/onboarding", "/admin"]

type AppShellProps = {
  children: React.ReactNode
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
    </div>
  )
}
