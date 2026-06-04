"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { PlayerSearchPicker } from "@/components/admin/player-search-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  fixPlayerCatalog,
  getPlayerCatalogEdit,
} from "@/lib/admin/actions/catalog-fix"
import type { PlayerListItem } from "@/lib/search/types"

function parseFmBaseRating(raw: string): number | null | "invalid" {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const n = Number(trimmed)
  if (!Number.isFinite(n) || n < 1 || n > 99.99) return "invalid"
  return Math.round(n * 100) / 100
}

export function CatalogFixForm() {
  const router = useRouter()
  const [player, setPlayer] = useState<PlayerListItem | null>(null)
  const [name, setName] = useState("")
  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [fmBaseRating, setFmBaseRating] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function selectPlayer(p: PlayerListItem) {
    setPlayer(p)
    setMessage(null)
    startTransition(async () => {
      const result = await getPlayerCatalogEdit(p.id)
      if (!result.ok) {
        setMessage(result.error)
        return
      }
      const d = result.data
      setName(d.name)
      setFirstname(d.firstname ?? "")
      setLastname(d.lastname ?? "")
      setFmBaseRating(d.fmBaseRating != null ? String(d.fmBaseRating) : "")
      setPhotoUrl(d.photoUrl ?? "")
    })
  }

  function save() {
    if (!player) {
      setMessage("Select a player first.")
      return
    }

    const fmParsed = parseFmBaseRating(fmBaseRating)
    if (fmParsed === "invalid") {
      setMessage("Overall rating must be between 1 and 99.99, or leave empty.")
      return
    }

    startTransition(async () => {
      const result = await fixPlayerCatalog({
        playerId: player.id,
        name,
        firstname,
        lastname,
        photoUrl,
        fmBaseRating: fmParsed,
      })
      if (!result.ok) {
        setMessage(result.error)
        return
      }
      setMessage("Saved.")
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <PlayerSearchPicker label="Find player" onSelect={selectPlayer} disabled={pending} />

      {player ? (
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium">Editing player #{player.id}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="catalog-firstname" className="text-sm font-medium">
                First name
              </label>
              <Input
                id="catalog-firstname"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                disabled={pending}
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="catalog-lastname" className="text-sm font-medium">
                Last name
              </label>
              <Input
                id="catalog-lastname"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                disabled={pending}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="catalog-name" className="text-sm font-medium">
              Catalog name
            </label>
            <Input
              id="catalog-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">
              Shown when first and last name are not both set.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="catalog-fm" className="text-sm font-medium">
              Overall rating
            </label>
            <Input
              id="catalog-fm"
              type="number"
              min={1}
              max={99.99}
              step={0.01}
              value={fmBaseRating}
              onChange={(e) => setFmBaseRating(e.target.value)}
              placeholder="e.g. 88.5"
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">
              Drives provisional career score until 10 community ratings. Leave empty to
              clear.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="catalog-photo" className="text-sm font-medium">
              Photo URL
            </label>
            <Input
              id="catalog-photo"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://…"
              disabled={pending}
            />
          </div>

          <Button type="button" disabled={pending} onClick={save}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      ) : null}

      {message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </div>
  )
}
