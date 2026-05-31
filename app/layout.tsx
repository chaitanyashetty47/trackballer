import { Figtree, Geist_Mono, Outfit } from "next/font/google"

import "./globals.css"
import { AppShell } from "@/components/app-shell"
import { cn } from "@/lib/utils"

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title: "Penaltyboxd",
  description: "Rate the beautiful game",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "antialiased",
        figtree.variable,
        outfit.variable,
        geistMono.variable,
      )}
    >
      <body className="min-h-svh bg-background font-sans text-foreground">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
