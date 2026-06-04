"use client"

import { usePathname } from "next/navigation"

const bareRoutes = ["/login", "/onboarding", "/admin"]

type AppShellClientProps = {
  children: React.ReactNode
  nav: React.ReactNode
  footer: React.ReactNode
}

export function AppShellClient({ children, nav, footer }: AppShellClientProps) {
  const pathname = usePathname()
  const hideNav = bareRoutes.some((route) => pathname.startsWith(route))

  if (hideNav) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-svh flex-col">
      {nav}
      <main className="flex-1">{children}</main>
      {footer}
    </div>
  )
}
