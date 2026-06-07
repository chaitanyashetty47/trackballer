import { notFound, redirect } from "next/navigation"
import { z } from "zod"

import { getProfileById } from "@/lib/profile/queries"

const profileIdSchema = z.string().uuid()

type PageProps = {
  params: Promise<{ id: string }>
}

/** Legacy UUID profile URLs redirect to /@username when available. */
export default async function LegacyUserProfilePage({ params }: PageProps) {
  const { id } = await params
  const parsed = profileIdSchema.safeParse(id)
  if (!parsed.success) {
    notFound()
  }

  const profile = await getProfileById(parsed.data)
  if (!profile) {
    notFound()
  }

  if (profile.username) {
    redirect(`/u/${profile.username}`)
  }

  notFound()
}
