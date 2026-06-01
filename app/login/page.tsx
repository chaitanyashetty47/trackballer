import { LoginView } from "@/components/login/login-view"

type PageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { error } = await searchParams
  return <LoginView authError={error} />
}
