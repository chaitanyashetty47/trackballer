"use client"

import { SearchCombobox } from "@/components/ui/search-combobox"
import { getCountryOptions } from "@/lib/countries/iso-countries"
import type { TeamOption } from "@/lib/onboarding/types"

const countryOptions: TeamOption[] = getCountryOptions().map((country) => ({
  id: country.id,
  label: country.label,
  logo_url: null,
  code: country.id,
}))

type CountrySelectProps = {
  id?: string
  label?: string
  value: string | null
  onChange: (countryCode: string | null) => void
  disabled?: boolean
  required?: boolean
}

export function CountrySelect({
  label = "Country of origin",
  value,
  onChange,
  disabled = false,
  required = false,
}: CountrySelectProps) {
  return (
    <SearchCombobox
      label={required ? `${label} *` : label}
      placeholder="Search countries…"
      options={countryOptions}
      valueId={value}
      onValueIdChange={onChange}
      disabled={disabled}
    />
  )
}
