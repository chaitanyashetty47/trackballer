import { Progress as ProgressPrimitive } from "@base-ui/react/progress"

import { cn } from "@/lib/utils"

type ProgressProps = {
  value: number
  className?: string
}

function Progress({ value, className }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <ProgressPrimitive.Root
      value={clamped}
      className={cn("w-full", className)}
      data-slot="progress"
    >
      <ProgressPrimitive.Track className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <ProgressPrimitive.Indicator className="h-full bg-primary transition-[width] duration-300 ease-out" />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}

export { Progress }
