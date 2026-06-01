import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="h-display mb-3">Terms of service</h1>
      <p className="body-sm text-muted-foreground">
        Placeholder — draft legal copy will replace this before launch.
      </p>
      <p className="mt-6">
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
