/** Prefer full first + last name when both exist; otherwise fall back to catalog name. */
export function formatPlayerDisplayName(
  firstname: string | null | undefined,
  lastname: string | null | undefined,
  name: string,
): string {
  const first = firstname?.trim()
  const last = lastname?.trim()
  if (first && last) return `${first} ${last}`
  return name
}
