import { format, parse } from "date-fns"

const STORAGE_FORMAT = "yyyy-MM-dd"

/** Parse draft DOB string (YYYY-MM-DD) to a local calendar date. */
export function parseDateOfBirth(value: string | null): Date | undefined {
  if (!value) return undefined
  const parsed = parse(value, STORAGE_FORMAT, new Date())
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

/** Store selected calendar day as YYYY-MM-DD for the draft and API. */
export function formatDateOfBirth(date: Date | undefined): string | null {
  if (!date) return null
  return format(date, STORAGE_FORMAT)
}
