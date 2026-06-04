import { ProfileEditForm } from "@/components/profile/profile-edit-form"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileSignOutButton } from "@/components/profile/profile-sign-out-button"
import { ProfileStatsRow } from "@/components/profile/profile-stats"
import { RecentCommentsList } from "@/components/profile/recent-comments-list"
import { RecentRatingsList } from "@/components/profile/recent-ratings-list"
import type { ProfilePageData } from "@/lib/profile/types"
import { cn } from "@/lib/utils"

type ProfilePageProps = {
  data: ProfilePageData
}

export function ProfilePage({ data }: ProfilePageProps) {
  const { profile, stats, recentRatings, recentComments, isOwner, teamOptions } =
    data

  const topRatings = recentRatings.slice(0, 3)
  const topComments = recentComments.slice(0, 3)

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <ProfileHeader profile={profile} />
        {isOwner ? <ProfileSignOutButton /> : null}
      </div>
      <ProfileStatsRow stats={stats} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] lg:items-start">
        {isOwner ? (
          <div className="min-w-0">
            <ProfileEditForm profile={profile} teamOptions={teamOptions} />
          </div>
        ) : null}

        <aside
          className={cn(
            "space-y-6 lg:sticky lg:top-[calc(3.5rem+1.5rem)]",
            !isOwner && "lg:col-start-2",
          )}
        >
          <section>
            <h2 className="h3 mb-3">Top ratings</h2>
            <RecentRatingsList ratings={topRatings} />
          </section>

          <section>
            <h2 className="h3 mb-3">Recent comments</h2>
            <RecentCommentsList comments={topComments} />
          </section>
        </aside>
      </div>
    </div>
  )
}
