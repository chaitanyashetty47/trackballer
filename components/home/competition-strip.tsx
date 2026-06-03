import Image from "next/image"
import Link from "next/link"

import type { CompetitionStrip } from "@/lib/home/types"
import { cn } from "@/lib/utils"

type CompetitionStripProps = {
  strip: CompetitionStrip
}

function StripItem({
  item,
  muted = false,
}: {
  item: CompetitionStrip["featured"]
  muted?: boolean
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex w-14 shrink-0 flex-col items-center gap-1.5 transition-opacity",
        muted && "opacity-50 hover:opacity-75",
      )}
    >
      <span
        className={cn(
          "flex size-12 items-center justify-center overflow-hidden rounded-full border text-xs font-bold",
          item.isFeatured
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-muted text-muted-foreground",
        )}
      >
        {item.logoUrl ? (
          <Image
            src={item.logoUrl}
            alt=""
            width={32}
            height={32}
            className="size-8 object-contain"
          />
        ) : (
          item.shortLabel
        )}
      </span>
      <span
        className={cn(
          "max-w-14 truncate text-center text-[10px] font-medium",
          item.isFeatured ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {item.shortLabel}
      </span>
    </Link>
  )
}

export function CompetitionStrip({ strip }: CompetitionStripProps) {
  return (
    <section aria-label="Competitions">
      <h2 className="sr-only">Competitions</h2>
      <p className="eyebrow mb-3">Competitions</p>
      <div className="flex gap-3 overflow-x-auto pb-1">
        <StripItem item={strip.featured} />
        {strip.others.map((item) => (
          <StripItem key={item.id} item={item} muted />
        ))}
      </div>
    </section>
  )
}
