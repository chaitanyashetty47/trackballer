import Image from "next/image"

type WorldCupPageHeaderProps = {
  logoUrl: string | null
  activeRound: string
}

export function WorldCupPageHeader({ logoUrl, activeRound }: WorldCupPageHeaderProps) {
  return (
    <>
      <div className="mb-2 flex items-center gap-3">
        <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary bg-primary/10 text-sm font-bold text-primary">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt=""
              width={40}
              height={40}
              className="size-10 object-contain"
              unoptimized
            />
          ) : (
            "WC"
          )}
        </span>
        <h1 className="h-display">World Cup 2026</h1>
      </div>
      <p className="body-sm mb-6 text-muted-foreground"><span className="font-semibold text-black">Ongoing Round:</span> {activeRound}</p>
    </>
  )
}
