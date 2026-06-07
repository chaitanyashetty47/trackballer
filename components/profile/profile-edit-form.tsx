"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { AvatarSourcePicker } from "@/components/profile/avatar-source-picker"
import { ConnectXButton } from "@/components/profile/connect-x-button"
import { PlasticFanDialog } from "@/components/profile/plastic-fan-dialog"
import { Button } from "@/components/ui/button"
import { CountryDropdown } from "@/components/onboarding/country-dropdown"
import { Input } from "@/components/ui/input"
import { SearchCombobox } from "@/components/ui/search-combobox"
import type { AvatarSource } from "@/lib/profile/display-avatar"
import { defaultAvatarSource } from "@/lib/profile/display-avatar"
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
  const [countryCode, setCountryCode] = useState(profile.countryCode)
  const [favouriteClubId, setFavouriteClubId] = useState<number | null>(
    profile.favouriteClub?.id ?? null,
  )
  const [favouriteNationalTeamId, setFavouriteNationalTeamId] = useState<
    number | null
  >(profile.favouriteNationalTeam?.id ?? null)
  const [instagramHandle, setInstagramHandle] = useState(
    profile.instagramHandle ?? "",
  )
  const [avatarSource, setAvatarSource] = useState<AvatarSource>(
    profile.avatarSource ??
      defaultAvatarSource({
        google_avatar_url: profile.googleAvatarUrl,
        x_avatar_url: profile.xAvatarUrl,
      }),
  )

  const showAvatarPicker = Boolean(profile.googleAvatarUrl && profile.xAvatarUrl)

  const [plasticOpen, setPlasticOpen] = useState(false)
  const [plasticConfirmed, setPlasticConfirmed] = useState(false)

  const initialClubId = profile.favouriteClub?.id ?? null

  function submit(plasticFanConfirmed: boolean) {
    if (!countryCode) {
      setMessage("Choose your country of origin.")
      return
    }

    startTransition(async () => {
      const result = await updateProfile({
        displayName,
        countryCode,
        favouriteClubId,
        favouriteNationalTeamId,
        instagramHandle,
        plasticFanConfirmed,
        avatarSource: showAvatarPicker ? avatarSource : undefined,
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
        {profile.username ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Username</span>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>
        ) : null}

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
          <label htmlFor="profile-country" className="text-sm font-medium">
            Country of origin
          </label>
          <CountryDropdown
            id="profile-country"
            valueAlpha2={countryCode}
            onChange={(country) => setCountryCode(country.alpha2.toUpperCase())}
            disabled={pending}
            placeholder="Select your country"
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

        {showAvatarPicker ? (
          <AvatarSourcePicker
            googleAvatarUrl={profile.googleAvatarUrl!}
            xAvatarUrl={profile.xAvatarUrl!}
            value={avatarSource}
            onChange={setAvatarSource}
            disabled={pending}
          />
        ) : null}

        <fieldset className="space-y-3 border-t border-border pt-4">
          <legend className="text-sm font-medium">Social links</legend>

          <div className="space-y-2">
            <p className="text-sm font-medium">X (Twitter)</p>
            <ConnectXButton
              twitterHandle={profile.twitterHandle}
              twitterVerifiedAt={profile.twitterVerifiedAt}
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
            <p className="text-xs text-muted-foreground">
              Not verified — only add a handle you own.
            </p>
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
