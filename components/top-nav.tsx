import { TopNavAuth } from "@/components/top-nav-auth"
import { TopNavChrome } from "@/components/top-nav-chrome"

export function TopNav() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border/80 bg-background/90 px-4 backdrop-blur-md">
      <TopNavChrome />
      <div className="flex shrink-0 items-center gap-1">
        <TopNavAuth />
      </div>
    </header>
  )
}
