import { redirect } from "next/navigation"

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { getOnboardingOptions } from "@/lib/onboarding/options"
import { createClient } from "@/lib/supabase/server"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.onboarding_completed_at) {
    redirect("/")
  }

  const options = await getOnboardingOptions()

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <OnboardingWizard options={options} />
    </div>
  )
}
