import { TopNavAuth } from "@/components/top-nav-auth"
import { TopNavChrome } from "@/components/top-nav-chrome"
import { TopNavMobileTabs } from "@/components/top-nav-mobile-tabs"
import { readSessionClaims } from "@/lib/auth/session-claims"
import { createClient } from "@/lib/supabase/server"

export async function TopNav() {
  const supabase = await createClient()
  const { isAdmin } = await readSessionClaims(supabase)

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="flex h-14 items-center gap-1.5 px-3 sm:gap-2 sm:px-4">
        <TopNavChrome showAdminLink={isAdmin} />
        <TopNavAuth />
      </div>
      <TopNavMobileTabs showAdminLink={isAdmin} />
    </header>
  )
}
