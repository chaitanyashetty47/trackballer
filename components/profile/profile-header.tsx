import { TeamFlag } from "@/components/team-flag"
import type { ProfileView } from "@/lib/profile/types"
import { socialProfileUrl } from "@/lib/profile/validate-social-handles"

function formatMemberSince(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      month: "short",
      year: "numeric",
    }).format(new Date(iso))
  } catch {
    return ""
  }
}

function SocialLink({
  label,
  href,
}: {
  label: string
  href: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-primary underline-offset-4 hover:underline"
    >
      {label}
    </a>
  )
}

type ProfileHeaderProps = {
  profile: ProfileView
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const teams = [profile.favouriteClub, profile.favouriteNationalTeam].filter(
    Boolean,
  ) as NonNullable<ProfileView["favouriteClub"]>[]

  const socials: { label: string; href: string }[] = []
  if (profile.twitterHandle) {
    socials.push({
      label: `@${profile.twitterHandle}`,
      href: socialProfileUrl("twitter", profile.twitterHandle),
    })
  }
  if (profile.instagramHandle) {
    socials.push({
      label: `@${profile.instagramHandle}`,
      href: socialProfileUrl("instagram", profile.instagramHandle),
    })
  }
  if (profile.tiktokHandle) {
    socials.push({
      label: `@${profile.tiktokHandle}`,
      href: socialProfileUrl("tiktok", profile.tiktokHandle),
    })
  }
  if (profile.redditHandle) {
    socials.push({
      label: `u/${profile.redditHandle}`,
      href: socialProfileUrl("reddit", profile.redditHandle),
    })
  }

  return (
    <header className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- OAuth avatar hosts vary
          <img
            src={profile.avatarUrl}
            alt=""
            className="size-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-lg font-semibold text-muted-foreground">
            {profile.displayName.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      <div className="mt-4 min-w-0 sm:mt-0">
        <h1 className="h-display text-2xl">{profile.displayName}</h1>

        {teams.length > 0 ? (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            {teams.map((team) => (
              <span
                key={team.id}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <TeamFlag
                  team={{
                    name: team.name,
                    logo_url: team.logoUrl,
                    code: team.code,
                  }}
                  size="sm"
                />
                {team.name}
              </span>
            ))}
          </div>
        ) : null}

        {profile.location ? (
          <p className="body-sm mt-1 text-muted-foreground">{profile.location}</p>
        ) : null}

        <p className="body-sm mt-1 text-muted-foreground">
          Member since {formatMemberSince(profile.memberSince)}
        </p>

        {socials.length > 0 ? (
          <div className="mt-3 flex flex-wrap justify-center gap-3 sm:justify-start">
            {socials.map((s) => (
              <SocialLink key={s.href} label={s.label} href={s.href} />
            ))}
          </div>
        ) : null}
      </div>
    </header>
  )
}
