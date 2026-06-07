"use client"

import { Combobox } from "@base-ui/react/combobox"
import { countries } from "country-data-list"
import { Check, ChevronDown, Globe } from "lucide-react"
import React, { forwardRef, type ForwardedRef } from "react"
import { CircleFlag } from "react-circle-flags"

import { cn } from "@/lib/utils"

export interface Country {
  alpha2: string
  alpha3: string
  countryCallingCodes: string[]
  currencies: string[]
  emoji?: string
  ioc: string
  languages: string[]
  name: string
  status: string
}

let cachedCountries: Country[] | null = null

/** Filtered once from country-data-list — same rules as Spopeer picker. */
export function getCachedCountries(): Country[] {
  if (cachedCountries) return cachedCountries

  cachedCountries = countries.all.filter(
    (country: Country) =>
      country.emoji && country.status !== "deleted" && country.ioc !== "PRK",
  )

  return cachedCountries
}

export function getCountryNameByAlpha2(
  alpha2: string | null | undefined,
): string | null {
  if (!alpha2) return null
  const code = alpha2.toUpperCase()
  const match = getCachedCountries().find(
    (country) => country.alpha2.toUpperCase() === code,
  )
  return match?.name ?? null
}

interface CountryDropdownProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "onChange" | "value"> {
  options?: Country[]
  onChange?: (country: Country) => void
  /** ISO alpha-2 from DB (e.g. IN, GB). */
  valueAlpha2?: string | null
  defaultValue?: string
  placeholder?: string
  slim?: boolean
}

function findByAlpha2(options: Country[], alpha2: string | null | undefined) {
  if (!alpha2) return undefined
  const code = alpha2.toUpperCase()
  return options.find((country) => country.alpha2.toUpperCase() === code)
}

function resolveSelectedCountry(
  options: Country[],
  valueAlpha2?: string | null,
  defaultValue?: string,
) {
  if (valueAlpha2) {
    return findByAlpha2(options, valueAlpha2) ?? null
  }

  if (defaultValue) {
    return (
      options.find((country) => country.name.trim() === defaultValue.trim()) ??
      null
    )
  }

  return null
}

const CountryDropdownComponent = (
  {
    options = getCachedCountries(),
    onChange,
    valueAlpha2,
    defaultValue,
    disabled = false,
    placeholder = "Select a country",
    slim = false,
    className,
    id,
    ...props
  }: CountryDropdownProps,
  ref: ForwardedRef<HTMLButtonElement>,
) => {
  const items = options.filter((option) => option.name)
  const selected = resolveSelectedCountry(options, valueAlpha2, defaultValue)

  const triggerClasses = cn(
    "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
    slim && "w-20",
    className,
  )

  return (
    <Combobox.Root
      items={items}
      value={selected}
      onValueChange={(country) => {
        if (country) onChange?.(country)
      }}
      itemToStringLabel={(country) => country.name}
      isItemEqualToValue={(a, b) => a.alpha2 === b.alpha2}
      disabled={disabled}
      modal={false}
    >
      <Combobox.Trigger
        ref={ref}
        id={id}
        nativeButton
        className={triggerClasses}
        {...props}
      >
        {selected ? (
          <div className="flex w-0 grow items-center gap-2 overflow-hidden">
            <div className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full">
              <CircleFlag countryCode={selected.alpha2.toLowerCase()} height={20} />
            </div>
            {!slim ? (
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                {selected.name}
              </span>
            ) : null}
          </div>
        ) : (
          <span className="text-muted-foreground">
            {slim ? <Globe size={20} /> : placeholder}
          </span>
        )}
        <ChevronDown size={16} className="shrink-0 text-muted-foreground" />
      </Combobox.Trigger>

      <Combobox.Portal>
        <Combobox.Positioner side="bottom" sideOffset={4} className="z-50 outline-none">
          <Combobox.Popup
            className={cn(
              "w-[var(--anchor-width)] max-h-[min(16rem,var(--available-height))] overflow-hidden rounded-lg border border-border bg-popover p-0 text-popover-foreground shadow-md",
              "origin-[var(--transform-origin)] sm:max-h-[17rem]",
            )}
          >
            <div className="border-b border-border p-2">
              <Combobox.Input
                placeholder="Search country..."
                className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
            <Combobox.Empty className="px-3 py-4 text-sm text-muted-foreground">
              No country found.
            </Combobox.Empty>
            <Combobox.List className="max-h-52 overflow-y-auto overscroll-contain p-1 outline-none sm:max-h-64">
              {(option: Country) => (
                <Combobox.Item
                  key={option.alpha2}
                  value={option}
                  className={cn(
                    "relative flex w-full cursor-default items-center gap-2 rounded-md px-2 py-2 text-sm outline-none select-none",
                    "data-highlighted:bg-muted data-highlighted:text-foreground",
                  )}
                >
                  <div className="flex w-0 grow items-center gap-2 overflow-hidden">
                    <div className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full">
                      <CircleFlag
                        countryCode={option.alpha2.toLowerCase()}
                        height={20}
                      />
                    </div>
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {option.name}
                    </span>
                  </div>
                  <Combobox.ItemIndicator className="flex size-4 shrink-0 items-center justify-center">
                    <Check className="size-4 opacity-0 [[data-selected]_&]:opacity-100" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}

CountryDropdownComponent.displayName = "CountryDropdownComponent"

export const CountryDropdown = forwardRef(CountryDropdownComponent)
