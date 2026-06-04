import { TopNavAuth } from "@/components/top-nav-auth"
import { TopNavChrome } from "@/components/top-nav-chrome"
import { readSessionClaims } from "@/lib/auth/session-claims"
import { createClient } from "@/lib/supabase/server"

export async function TopNav() {
  const supabase = await createClient()
  const { isAdmin } = await readSessionClaims(supabase)

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border/80 bg-background/90 px-4 backdrop-blur-md">
      <TopNavChrome showAdminLink={isAdmin} />
      <div className="flex shrink-0 items-center gap-1">
        <TopNavAuth />
      </div>
    </header>
  )
}
