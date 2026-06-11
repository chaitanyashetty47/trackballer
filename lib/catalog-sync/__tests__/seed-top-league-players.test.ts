import { describe, expect, it } from "vitest";

import { mapPlayersFromClubSquad } from "@/lib/catalog-sync/mappers";
import { mergePlayerStub } from "@/lib/catalog-sync/player-merge";
import type { Database } from "@/lib/database.types";

describe("mapPlayersFromClubSquad", () => {
  it("sets club_team_id, not national_team_id", () => {
    const rows = mapPlayersFromClubSquad({
      team: { id: 33, name: "Manchester United" },
      players: [
        {
          id: 909,
          name: "Marcus Rashford",
          age: 27,
          position: "Attacker",
          photo: "https://example.com/rashford.png",
        },
      ],
    });

    expect(rows).toEqual([
      {
        id: 909,
        name: "Marcus Rashford",
        age: 27,
        photo_url: "https://example.com/rashford.png",
        primary_position: "FWD",
        club_team_id: 33,
      },
    ]);
  });
});

describe("top-league player merge", () => {
  const wcPlayer: Database["public"]["Tables"]["players"]["Row"] = {
    id: 909,
    name: "Marcus Rashford",
    firstname: "Marcus",
    lastname: "Rashford",
    age: 27,
    birth_date: "1997-10-31",
    nationality: "England",
    photo_url: "https://example.com/wc.png",
    primary_position: "FWD",
    club_team_id: null,
    national_team_id: 10,
    fm_base_rating: 5,
    search_vector: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };

  it("adds club without overwriting WC national team", () => {
    const merged = mergePlayerStub(wcPlayer, {
      id: 909,
      name: "Marcus Rashford",
      club_team_id: 33,
      photo_url: "https://example.com/club.png",
    });

    expect(merged.national_team_id).toBe(10);
    expect(merged.club_team_id).toBe(33);
    expect(merged.firstname).toBe("Marcus");
    expect(merged.photo_url).toBe("https://example.com/club.png");
  });
});
