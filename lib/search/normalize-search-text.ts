/**
 * Fold accents for search — "kounde" matches "Koundé", "modric" matches "Modrić".
 */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
}
