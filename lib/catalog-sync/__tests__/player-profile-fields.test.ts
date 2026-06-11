import { describe, expect, it } from "vitest";

import { findPlayersNeedingIdentityEnrich } from "@/lib/catalog-sync/player-profile-fields";
import { mergePlayerIdentityFields } from "@/lib/catalog-sync/player-merge";
import type { Database } from "@/lib/database.types";

function makeDb(batches: Array<Array<{ id: number }>>) {
  let call = 0;
  return {
    from: (table: string) => {
      if (table !== "players") throw new Error(`unexpected table ${table}`);
      return {
        select: () => ({
          or: () => ({
            order: () => ({
              range: async () => {
                const batch = batches[call] ?? [];
                call += 1;
                return { data: batch, error: null };
              },
            }),
          }),
        }),
      };
    },
  };
}

describe("findPlayersNeedingIdentityEnrich", () => {
  it("paginates past the PostgREST 1000-row cap", async () => {
    const page1 = Array.from({ length: 1000 }, (_, i) => ({ id: i + 1 }));
    const page2 = [{ id: 1001 }, { id: 1002 }];

    const candidates = await findPlayersNeedingIdentityEnrich(
      makeDb([page1, page2]) as unknown as Parameters<
        typeof findPlayersNeedingIdentityEnrich
        >[0],
    );

    expect(candidates).toHaveLength(1002);
    expect(candidates[0]).toEqual({ id: 1 });
    expect(candidates.at(-1)).toEqual({ id: 1002 });
  });
});

describe("mergePlayerIdentityFields", () => {
  const existing: Database["public"]["Tables"]["players"]["Row"] = {
    id: 909,
    name: "Marcus Rashford",
    firstname: null,
    lastname: null,
    nationality: null,
    birth_date: null,
    age: 27,
    photo_url: "https://example.com/wc.png",
    primary_position: "FWD",
    club_team_id: 33,
    national_team_id: 10,
    fm_base_rating: 5,
    search_vector: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };

  it("fills identity gaps without changing club or national team", () => {
    const merged = mergePlayerIdentityFields(existing, {
      id: 909,
      name: "Marcus Rashford",
      firstname: "Marcus",
      lastname: "Rashford",
      nationality: "England",
      birth_date: "1997-10-31",
      club_team_id: 999,
      national_team_id: 99,
    });

    expect(merged.firstname).toBe("Marcus");
    expect(merged.nationality).toBe("England");
    expect(merged.club_team_id).toBe(33);
    expect(merged.national_team_id).toBe(10);
    expect(merged.primary_position).toBe("FWD");
  });

  it("does not overwrite identity fields already set", () => {
    const merged = mergePlayerIdentityFields(
      { ...existing, firstname: "Marcus", nationality: "England" },
      {
        id: 909,
        name: "Marcus Rashford",
        firstname: "Wrong",
        lastname: "Rashford",
        nationality: "Wrong",
        birth_date: "1997-10-31",
      },
    );

    expect(merged.firstname).toBe("Marcus");
    expect(merged.nationality).toBe("England");
    expect(merged.birth_date).toBe("1997-10-31");
  });
});
