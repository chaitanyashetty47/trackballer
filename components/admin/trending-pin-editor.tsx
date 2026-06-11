"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react"

import { PlayerSearchPicker } from "@/components/admin/player-search-picker"
import { PlayerAvatar } from "@/components/player-avatar"
import { Button } from "@/components/ui/button"
import { removeTrendingPin, saveTrendingPins } from "@/lib/admin/actions/trending-pins"
import type { TrendingPinRow } from "@/lib/admin/trending-pins"
import type { PlayerListItem } from "@/lib/search/types"

type TrendingPinEditorProps = {
  initialPins: TrendingPinRow[]
}

export function TrendingPinEditor({ initialPins }: TrendingPinEditorProps) {
  const router = useRouter()
  const [pins, setPins] = useState(initialPins)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function movePin(index: number, direction: -1 | 1) {
    const next = [...pins]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    const tmp = next[index]!
    next[index] = next[target]!
    next[target] = tmp
    setPins(next)
  }

  function addPlayer(player: PlayerListItem) {
    if (pins.some((p) => p.playerId === player.id)) {
      setMessage("That player is already pinned.")
      return
    }
    setPins([
      ...pins,
      {
        id: -player.id,
        playerId: player.id,
        sortOrder: pins.length,
        displayName: player.displayName,
        photoUrl: player.photoUrl,
      },
    ])
    setMessage(null)
  }

  function persistPins() {
    startTransition(async () => {
      const result = await saveTrendingPins({
        playerIds: pins.map((p) => p.playerId),
      })
      if (!result.ok) {
        setMessage(result.error)
        return
      }
      setMessage("Saved. Home trending will update.")
      router.refresh()
    })
  }

  function removePin(pin: TrendingPinRow) {
    if (pin.id > 0) {
      startTransition(async () => {
        const result = await removeTrendingPin(pin.id)
        if (!result.ok) {
          setMessage(result.error)
          return
        }
        setPins((list) => list.filter((p) => p.id !== pin.id))
        router.refresh()
      })
      return
    }
    setPins((list) => list.filter((p) => p.playerId !== pin.playerId))
  }

  return (
    <div className="space-y-6">
      <PlayerSearchPicker label="Add player" onSelect={addPlayer} disabled={pending} />

      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Pinned order</h2>
        {pins.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pins yet. Add players above.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {pins.map((pin, index) => (
              <li
                key={pin.playerId}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <span className="w-6 text-center font-mono text-sm text-muted-foreground">
                  {index + 1}
                </span>
                <PlayerAvatar
                  name={pin.displayName}
                  photoUrl={pin.photoUrl}
                  size="md"
                  className="rounded-full"
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {pin.displayName}
                </span>
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={pending || index === 0}
                    onClick={() => movePin(index, -1)}
                    aria-label="Move up"
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={pending || index === pins.length - 1}
                    onClick={() => movePin(index, 1)}
                    aria-label="Move down"
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={pending}
                    onClick={() => removePin(pin)}
                    aria-label="Remove"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}

      <Button type="button" disabled={pending} onClick={persistPins}>
        {pending ? "Saving…" : "Save order"}
      </Button>
    </div>
  )
}
