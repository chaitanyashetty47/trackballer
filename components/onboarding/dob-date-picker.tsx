"use client"

import { Popover } from "@base-ui/react/popover"
import { format, subYears } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useEffect, useId, useState } from "react"

import { Calendar } from "@/components/ui/calendar"
import {
  formatDateOfBirth,
  parseDateOfBirth,
} from "@/lib/onboarding/dob-format"
import { cn } from "@/lib/utils"

type DobDatePickerProps = {
  value: string | null
  onChange: (value: string | null) => void
  error?: string | null
  id?: string
}

export function DobDatePicker({
  value,
  onChange,
  error,
  id: idProp,
}: DobDatePickerProps) {
  const generatedId = useId()
  const fieldId = idProp ?? generatedId
  const [open, setOpen] = useState(false)
  const [timeZone, setTimeZone] = useState<string | undefined>(undefined)

  const selected = parseDateOfBirth(value)
  const today = new Date()
  const defaultMonth = selected ?? subYears(today, 25)

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  const triggerLabel = selected
    ? format(selected, "d MMMM yyyy")
    : "Select date of birth"

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        id={fieldId}
        aria-invalid={error != null}
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-lg border border-border bg-background px-3 text-left text-sm shadow-xs transition-colors",
          "hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          !selected && "text-muted-foreground",
          error && "border-destructive ring-destructive/20",
        )}
      >
        <CalendarIcon className="size-4 shrink-0 opacity-60" aria-hidden />
        <span className="min-w-0 flex-1 truncate">{triggerLabel}</span>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner sideOffset={8} align="start" className="z-50 outline-none">
          <Popover.Popup className="rounded-lg border border-border bg-popover p-0 shadow-md">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={(date) => {
                onChange(formatDateOfBirth(date))
                setOpen(false)
              }}
              timeZone={timeZone}
              disabled={{ after: today }}
              captionLayout="dropdown"
              defaultMonth={defaultMonth}
              startMonth={subYears(today, 100)}
              endMonth={today}
              className="rounded-lg"
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
