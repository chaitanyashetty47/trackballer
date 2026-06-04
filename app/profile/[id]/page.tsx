import { notFound } from "next/navigation"
import { z } from "zod"

import { ProfilePage } from "@/components/profile/profile-page"
import {
  getProfileById,
  getProfileStats,
  getProfileTeamOptions,
  getRecentComments,
  getRecentRatings,
} from "@/lib/profile/queries"
import { createClient } from "@/lib/supabase/server"

const profileIdSchema = z.string().uuid()

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const parsed = profileIdSchema.safeParse(id)
  if (!parsed.success) {
    return { title: "Profile | Trackballer" }
  }

  const profile = await getProfileById(parsed.data)
  return {
    title: profile
      ? `${profile.displayName} | Trackballer`
      : "Profile | Trackballer",
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const { id } = await params
  const parsed = profileIdSchema.safeParse(id)
  if (!parsed.success) {
    notFound()
  }

  const userId = parsed.data
  const supabase = await createClient()
  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser()

  const [profile, stats, recentRatings, recentComments, teamOptions] =
    await Promise.all([
      getProfileById(userId),
      getProfileStats(userId),
      getRecentRatings(userId),
      getRecentComments(userId),
      getProfileTeamOptions(),
    ])

  if (!profile) {
    notFound()
  }

  const isOwner = sessionUser?.id === userId

  return (
    <ProfilePage
      data={{
        profile,
        stats,
        recentRatings,
        recentComments,
        isOwner,
        teamOptions,
      }}
    />
  )
}
