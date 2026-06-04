import { searchPlayersUncached } from "@/lib/search/search-players"

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")
  const players = await searchPlayersUncached(q)

  return Response.json(players)
}
