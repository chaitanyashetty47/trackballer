"use client"

import { useRouter } from "nextjs-toploader/app"
import { FormEvent, useState } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type SearchFormProps = {
  initialQuery?: string
  autoFocus?: boolean
  className?: string
}

export function SearchForm({ initialQuery = "", autoFocus = false, className }: SearchFormProps) {
  const router = useRouter()
  const [value, setValue] = useState(initialQuery)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = value.trim()
    if (query.length < 1) return
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative flex items-center gap-2">
        <Search
          className="pointer-events-none absolute left-3 size-4 text-muted-foreground"
          aria-hidden
        />
        <Input
          name="q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search players…"
          className="pl-9"
          autoFocus={autoFocus}
          aria-label="Search players"
        />
        <Button type="submit" size="sm">
          Search
        </Button>
      </div>
    </form>
  )
}
