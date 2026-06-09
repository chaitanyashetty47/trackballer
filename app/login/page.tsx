import { redirect } from "next/navigation"

import { LoginView } from "@/components/login/login-view"
import { getPostOAuthRedirectPath } from "@/lib/auth/post-oauth-redirect"
import { getServerAuth } from "@/lib/auth/server-session"
import { createClient } from "@/lib/supabase/server"

type PageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const auth = await getServerAuth(supabase)

  if (auth) {
    redirect(await getPostOAuthRedirectPath(supabase))
  }

  const { error } = await searchParams
  return <LoginView authError={error} />
}
