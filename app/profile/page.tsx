import { redirect } from "next/navigation"

import { ProfilePage } from "@/components/profile/profile-page"
import {
  getProfileById,
  getProfilePageData,
} from "@/lib/profile/queries"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Your profile | Trackballer",
}

export default async function OwnProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const profile = await getProfileById(user.id)
  if (!profile) {
    redirect("/login")
  }

  const data = await getProfilePageData(profile, user.id, { isOwner: true })

  return <ProfilePage data={data} />
}
