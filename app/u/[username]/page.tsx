import { notFound, redirect } from "next/navigation"

import { ProfilePage } from "@/components/profile/profile-page"
import {
  getProfileByUsername,
  getProfilePageData,
} from "@/lib/profile/queries"
import { createClient } from "@/lib/supabase/server"

type PageProps = {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params
  const profile = await getProfileByUsername(username)
  return {
    title: profile
      ? `${profile.displayName} (@${profile.username}) | Trackballer`
      : "Profile | Trackballer",
  }
}

export default async function UserProfileByUsernamePage({ params }: PageProps) {
  const { username } = await params
  const profile = await getProfileByUsername(username)

  if (!profile?.username) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser()

  if (sessionUser?.id === profile.id) {
    redirect("/profile")
  }

  const data = await getProfilePageData(profile, sessionUser?.id)

  return <ProfilePage data={data} />
}
