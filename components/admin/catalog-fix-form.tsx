"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { PlayerSearchPicker } from "@/components/admin/player-search-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchCombobox } from "@/components/ui/search-combobox"
import {
  fixPlayerCatalog,
  getPlayerCatalogEdit,
} from "@/lib/admin/actions/catalog-fix"
import { teamsToComboboxOptions } from "@/lib/search/combobox-options"
import type { BrowseClubOption, PlayerListItem } from "@/lib/search/types"

const selectClass =
  "flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

type CatalogFixFormProps = {
  clubOptions: BrowseClubOption[]
  positions: string[]
}

function parseFmBaseRating(raw: string): number | null | "invalid" {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const n = Number(trimmed)
  if (!Number.isFinite(n) || n < 1 || n > 100 || !Number.isInteger(n)) return "invalid"
  return n
}

export function CatalogFixForm({ clubOptions, positions }: CatalogFixFormProps) {
  const router = useRouter()
  const clubComboboxOptions = teamsToComboboxOptions(clubOptions)
  const [player, setPlayer] = useState<PlayerListItem | null>(null)
  const [name, setName] = useState("")
  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [fmBaseRating, setFmBaseRating] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [clubTeamId, setClubTeamId] = useState<string | null>(null)
  const [primaryPosition, setPrimaryPosition] = useState("")
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
      setClubTeamId(d.clubTeamId != null ? String(d.clubTeamId) : null)
      setPrimaryPosition(d.primaryPosition ?? "")
    })
  }

  function save() {
    if (!player) {
      setMessage("Select a player first.")
      return
    }

    const fmParsed = parseFmBaseRating(fmBaseRating)
    if (fmParsed === "invalid") {
      setMessage("Overall rating must be a whole number between 1 and 100, or leave empty.")
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
        clubTeamId:
          clubTeamId != null ? Number.parseInt(clubTeamId, 10) : null,
        primaryPosition: primaryPosition || null,
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

          <div className="grid gap-4 sm:grid-cols-2">
            <SearchCombobox
              options={clubComboboxOptions}
              valueId={clubTeamId}
              onValueIdChange={setClubTeamId}
              label="Club"
              placeholder="Search club…"
              emptyMessage="No clubs found."
              disabled={pending}
            />

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="catalog-position">Position</Label>
              <select
                id="catalog-position"
                value={primaryPosition}
                onChange={(e) => setPrimaryPosition(e.target.value)}
                className={selectClass}
                disabled={pending}
              >
                <option value="">Not set</option>
                {positions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="catalog-fm" className="text-sm font-medium">
              Overall rating
            </label>
            <Input
              id="catalog-fm"
              type="number"
              min={1}
              max={100}
              step={1}
              value={fmBaseRating}
              onChange={(e) => setFmBaseRating(e.target.value)}
              placeholder="e.g. 88"
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
