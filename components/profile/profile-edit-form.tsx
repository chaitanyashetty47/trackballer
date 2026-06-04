"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { PlasticFanDialog } from "@/components/profile/plastic-fan-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchCombobox } from "@/components/ui/search-combobox"
import { updateProfile } from "@/lib/profile/actions/update-profile"
import type { ProfileView } from "@/lib/profile/types"
import type { OnboardingOptions } from "@/lib/onboarding/types"

type ProfileEditFormProps = {
  profile: ProfileView
  teamOptions: OnboardingOptions
}

export function ProfileEditForm({ profile, teamOptions }: ProfileEditFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState(profile.displayName)
  const [location, setLocation] = useState(profile.location ?? "")
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "")
  const [favouriteClubId, setFavouriteClubId] = useState<number | null>(
    profile.favouriteClub?.id ?? null,
  )
  const [favouriteNationalTeamId, setFavouriteNationalTeamId] = useState<
    number | null
  >(profile.favouriteNationalTeam?.id ?? null)
  const [twitterHandle, setTwitterHandle] = useState(profile.twitterHandle ?? "")
  const [instagramHandle, setInstagramHandle] = useState(
    profile.instagramHandle ?? "",
  )
  const [tiktokHandle, setTiktokHandle] = useState(profile.tiktokHandle ?? "")
  const [redditHandle, setRedditHandle] = useState(profile.redditHandle ?? "")

  const [plasticOpen, setPlasticOpen] = useState(false)
  const [plasticConfirmed, setPlasticConfirmed] = useState(false)

  const initialClubId = profile.favouriteClub?.id ?? null

  function submit(plasticFanConfirmed: boolean) {
    startTransition(async () => {
      const result = await updateProfile({
        displayName,
        location,
        avatarUrl,
        favouriteClubId,
        favouriteNationalTeamId,
        twitterHandle,
        instagramHandle,
        tiktokHandle,
        redditHandle,
        plasticFanConfirmed,
      })

      if (!result.ok) {
        setMessage(result.error)
        return
      }

      setMessage("Profile saved.")
      setPlasticConfirmed(false)
      router.refresh()
    })
  }

  function onSaveClick() {
    setMessage(null)
    const clubChanged =
      initialClubId != null && favouriteClubId !== initialClubId

    if (clubChanged && !plasticConfirmed) {
      setPlasticOpen(true)
      return
    }

    submit(plasticConfirmed)
  }

  function onPlasticConfirm() {
    setPlasticConfirmed(true)
    setPlasticOpen(false)
    submit(true)
  }

  function onPlasticCancel() {
    setPlasticOpen(false)
    setFavouriteClubId(initialClubId)
  }

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h2 className="h3 mb-4">Edit profile</h2>

      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-display-name" className="text-sm font-medium">
            Display name
          </label>
          <Input
            id="profile-display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={pending}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-location" className="text-sm font-medium">
            Location
          </label>
          <Input
            id="profile-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, country"
            disabled={pending}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-avatar" className="text-sm font-medium">
            Avatar URL
          </label>
          <Input
            id="profile-avatar"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…"
            disabled={pending}
          />
        </div>

        <SearchCombobox
          label="Favourite club"
          placeholder="Search clubs…"
          options={teamOptions.clubs}
          valueId={favouriteClubId != null ? String(favouriteClubId) : null}
          onValueIdChange={(id) =>
            setFavouriteClubId(id != null ? Number(id) : null)
          }
          disabled={pending}
        />

        <SearchCombobox
          label="Favourite national team"
          placeholder="Search countries…"
          options={teamOptions.nationalTeams}
          valueId={
            favouriteNationalTeamId != null
              ? String(favouriteNationalTeamId)
              : null
          }
          onValueIdChange={(id) =>
            setFavouriteNationalTeamId(id != null ? Number(id) : null)
          }
          disabled={pending}
        />

        <fieldset className="space-y-3 border-t border-border pt-4">
          <legend className="text-sm font-medium">Social links</legend>
          <p className="text-xs text-muted-foreground">
            Paste a handle or full profile URL. We store handles only.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="profile-twitter" className="text-sm font-medium">
                X (Twitter)
              </label>
              <Input
                id="profile-twitter"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                placeholder="@handle or profile URL"
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="profile-instagram" className="text-sm font-medium">
                Instagram
              </label>
              <Input
                id="profile-instagram"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="@handle or profile URL"
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="profile-tiktok" className="text-sm font-medium">
                TikTok
              </label>
              <Input
                id="profile-tiktok"
                value={tiktokHandle}
                onChange={(e) => setTiktokHandle(e.target.value)}
                placeholder="@handle or profile URL"
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="profile-reddit" className="text-sm font-medium">
                Reddit
              </label>
              <Input
                id="profile-reddit"
                value={redditHandle}
                onChange={(e) => setRedditHandle(e.target.value)}
                placeholder="u/name or profile URL"
                disabled={pending}
              />
            </div>
          </div>
        </fieldset>

        {message ? (
          <p className="text-sm text-muted-foreground" role="status">
            {message}
          </p>
        ) : null}

        <Button type="button" disabled={pending} onClick={onSaveClick}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </div>

      <PlasticFanDialog
        open={plasticOpen}
        onOpenChange={setPlasticOpen}
        onConfirm={onPlasticConfirm}
        onCancel={onPlasticCancel}
      />
    </section>
  )
}
