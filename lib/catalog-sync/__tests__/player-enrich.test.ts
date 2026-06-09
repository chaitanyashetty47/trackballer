import { describe, expect, it } from "vitest";

import { findPlayersNeedingProfileEnrich } from "@/lib/catalog-sync/player-enrich";

function makeDb(tables: Record<string, unknown>) {
  return {
    from: (table: string) => tables[table],
  };
}

describe("findPlayersNeedingProfileEnrich", () => {
  const playersTable = {
    select: () => ({
      order: async () => ({
        data: [
          {
            id: 153,
            firstname: "Ousmane",
            lastname: "Dembélé",
            nationality: "France",
            birth_date: "1997-05-15",
            club_team_id: 529,
            national_team_id: 2,
          },
          {
            id: 184,
            firstname: null,
            lastname: null,
            nationality: null,
            birth_date: null,
            club_team_id: null,
            national_team_id: 10,
          },
          {
            id: 999,
            firstname: null,
            lastname: null,
            nationality: null,
            birth_date: null,
            club_team_id: null,
            national_team_id: 5530,
          },
        ],
        error: null,
      }),
    }),
  };

  it("flags players missing club or name fields", async () => {
    const candidates = await findPlayersNeedingProfileEnrich(
      makeDb({ players: playersTable }) as Parameters<
        typeof findPlayersNeedingProfileEnrich
      >[0],
    );

    expect(candidates.map((c) => c.id)).toEqual([184, 999]);
  });

  it("limits to WC squad when squadSeasonYear is set", async () => {
    const seasonsTable = {
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: { id: 99 }, error: null }),
          }),
        }),
      }),
    };

    const squadsTable = {
      select: () => ({
        eq: async () => ({
          data: [
            { player_id: 184, team_id: 10 },
            { player_id: 153, team_id: 2 },
          ],
          error: null,
        }),
      }),
    };

    const candidates = await findPlayersNeedingProfileEnrich(
      makeDb({
        players: playersTable,
        seasons: seasonsTable,
        player_season_squads: squadsTable,
      }) as Parameters<typeof findPlayersNeedingProfileEnrich>[0],
      { squadSeasonYear: 2026 },
    );

    expect(candidates).toEqual([{ id: 184, national_team_id: 10 }]);
  });

  it("filters to specific national teams when nationalTeamIds is set", async () => {
    const candidates = await findPlayersNeedingProfileEnrich(
      makeDb({ players: playersTable }) as Parameters<
        typeof findPlayersNeedingProfileEnrich
      >[0],
      { nationalTeamIds: [10] },
    );

    expect(candidates).toEqual([{ id: 184, national_team_id: 10 }]);
  });

  it("flags missing national_team_id when syncNationalTeam is true", async () => {
    const playersWithMissingNt = {
      select: () => ({
        order: async () => ({
          data: [
            {
              id: 50,
              firstname: "Harry",
              lastname: "Kane",
              nationality: "England",
              birth_date: "1993-07-28",
              club_team_id: 157,
              national_team_id: null,
            },
          ],
          error: null,
        }),
      }),
    };

    const candidates = await findPlayersNeedingProfileEnrich(
      makeDb({ players: playersWithMissingNt }) as Parameters<
        typeof findPlayersNeedingProfileEnrich
      >[0],
      { syncNationalTeam: true },
    );

    expect(candidates).toEqual([{ id: 50, national_team_id: null }]);
  });
});
