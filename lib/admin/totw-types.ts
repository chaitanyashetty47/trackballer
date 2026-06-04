import type { FormationId } from "@/lib/admin/formation-slots"

export type TotwSlotAssignment = {
  playerId: number
  displayName: string
  photoUrl: string | null
}

export type TotwDraft = {
  id: number
  roundId: number
  title: string
  formation: FormationId
  featuredAt: string | null
  assignments: Record<string, TotwSlotAssignment>
}
