import { describe, expect, it } from "vitest";

import {
  mapPlayerProfile,
  pickClubStatBlock,
} from "@/lib/catalog-sync/player-profile-picker";

describe("pickClubStatBlock", () => {
  it("prefers a domestic club over the national team stat", () => {
    const stats = [
      { team: { id: 10, name: "France" }, games: { position: "Midfielder" } },
      { team: { id: 85, name: "PSG", logo: "https://logo" }, games: { position: "Attacker" } },
    ];

    expect(pickClubStatBlock(stats, 10)?.team?.id).toBe(85);
  });

  it("falls back to first stat when national team id is unknown", () => {
    const stats = [
      { team: { id: 85, name: "PSG" }, games: { position: "Attacker" } },
    ];

    expect(pickClubStatBlock(stats, null)?.team?.id).toBe(85);
  });
});

describe("mapPlayerProfile", () => {
  it("sets club_team_id from non-national stat block", () => {
    const { player, clubTeam } = mapPlayerProfile(
      {
        player: {
          id: 1,
          name: "K. Mbappé",
          firstname: "Kylian",
          lastname: "Mbappé",
          nationality: "France",
        },
        statistics: [
          { team: { id: 10, name: "France" }, games: { position: "Attacker" } },
          { team: { id: 85, name: "PSG", logo: "x" }, games: { position: "Attacker" } },
        ],
      },
      { nationalTeamId: 10 },
    );

    expect(player.club_team_id).toBe(85);
    expect(clubTeam?.name).toBe("PSG");
    expect(clubTeam?.is_national).toBe(false);
  });
});
