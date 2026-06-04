import { ProfileEditForm } from "@/components/profile/profile-edit-form"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileStatsRow } from "@/components/profile/profile-stats"
import { RecentCommentsList } from "@/components/profile/recent-comments-list"
import { RecentRatingsList } from "@/components/profile/recent-ratings-list"
import type { ProfilePageData } from "@/lib/profile/types"

type ProfilePageProps = {
  data: ProfilePageData
}

export function ProfilePage({ data }: ProfilePageProps) {
  const { profile, stats, recentRatings, recentComments, isOwner, teamOptions } =
    data

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <ProfileHeader profile={profile} />
      <ProfileStatsRow stats={stats} />

      <section>
        <h2 className="h3 mb-3">Recent ratings</h2>
        <RecentRatingsList ratings={recentRatings} />
      </section>

      <section>
        <h2 className="h3 mb-3">Recent comments</h2>
        <RecentCommentsList comments={recentComments} />
      </section>

      {isOwner ? (
        <ProfileEditForm profile={profile} teamOptions={teamOptions} />
      ) : null}
    </div>
  )
}
