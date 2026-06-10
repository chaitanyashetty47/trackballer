export type WcPlayerLeaderRow = {
  id: number
  name: string
  photoUrl: string | null
  nationality: string | null
  /** Match avg (1–10) or career OVR (1–100) depending on mode. */
  score: number
  careerTier: string | null
}

export type WcPlayerLeaders = {
  mode: "recent" | "trending"
  players: WcPlayerLeaderRow[]
}
