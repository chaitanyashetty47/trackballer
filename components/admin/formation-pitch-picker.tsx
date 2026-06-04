"use client"

import {
  FORMATION_TEMPLATES,
  type FormationId,
} from "@/lib/admin/formation-slots"
import { FormationPitch } from "@/components/formation/formation-pitch"
import type { PlayerListItem } from "@/lib/search/types"

export type SlotAssignment = {
  playerId: number
  displayName: string
  photoUrl: string | null
}

type FormationPitchPickerProps = {
  formation: FormationId
  assignments: Record<string, SlotAssignment | undefined>
  activeSlot: string | null
  onSlotClick: (slotKey: string) => void
}

export function FormationPitchPicker({
  formation,
  assignments,
  activeSlot,
  onSlotClick,
}: FormationPitchPickerProps) {
  return (
    <FormationPitch
      formation={formation}
      assignments={assignments}
      mode="edit"
      activeSlot={activeSlot}
      onSlotClick={onSlotClick}
    />
  )
}

export function FormationSelect({
  value,
  onChange,
}: {
  value: FormationId
  onChange: (id: FormationId) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as FormationId)}
      className="flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
    >
      {FORMATION_TEMPLATES.map((f) => (
        <option key={f.id} value={f.id}>
          {f.label}
        </option>
      ))}
    </select>
  )
}

export function playerToSlotAssignment(player: PlayerListItem): SlotAssignment {
  return {
    playerId: player.id,
    displayName: player.displayName,
    photoUrl: player.photoUrl,
  }
}
