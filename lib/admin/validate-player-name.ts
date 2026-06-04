/** API sync stub pattern — do not replace a real name with this. */
export function isPlayerStubName(name: string): boolean {
  return /^Player \d+$/.test(name.trim())
}

export function validatePlayerNameUpdate(
  currentName: string,
  nextName: string,
): string | null {
  const trimmed = nextName.trim()
  if (!trimmed) return "Name cannot be empty."
  if (isPlayerStubName(trimmed) && !isPlayerStubName(currentName)) {
    return "Cannot replace a real name with a stub placeholder."
  }
  return null
}
