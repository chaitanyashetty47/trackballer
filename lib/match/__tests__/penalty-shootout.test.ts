import { describe, expect, it } from "vitest"

import { buildPenaltyShootout } from "@/lib/match/penalty-shootout"

const HOME = 10
const AWAY = 20

const names = new Map<number, string>([
  [154, "Lionel Messi"],
  [278, "Kylian Mbappé"],
  [508, "Kingsley Coman"],
  [509, "Aurélien Tchouaméni"],
  [510, "Paulo Dybala"],
  [511, "Leandro Paredes"],
  [512, "Gonzalo Montiel"],
  [513, "Randal Kolo Muani"],
])

describe("buildPenaltyShootout", () => {
  it("builds alternating sequence and per-team summary", () => {
    const shootout = buildPenaltyShootout(
      [
        {
          type: "Goal",
          detail: "Penalty",
          minute: 120,
          extra_minute: 1,
          player_id: 278,
          team_id: AWAY,
        },
        {
          type: "Goal",
          detail: "Penalty",
          minute: 120,
          extra_minute: 2,
          player_id: 154,
          team_id: HOME,
        },
        {
          type: "Goal",
          detail: "Missed Penalty",
          minute: 120,
          extra_minute: 3,
          player_id: 508,
          team_id: AWAY,
        },
        {
          type: "Goal",
          detail: "Penalty",
          minute: 120,
          extra_minute: 4,
          player_id: 510,
          team_id: HOME,
        },
        {
          type: "Goal",
          detail: "Missed Penalty",
          minute: 120,
          extra_minute: 5,
          player_id: 509,
          team_id: AWAY,
        },
        {
          type: "Goal",
          detail: "Penalty",
          minute: 120,
          extra_minute: 6,
          player_id: 511,
          team_id: HOME,
        },
        {
          type: "Goal",
          detail: "Penalty",
          minute: 120,
          extra_minute: 7,
          player_id: 513,
          team_id: AWAY,
        },
        {
          type: "Goal",
          detail: "Penalty",
          minute: 120,
          extra_minute: 8,
          player_id: 512,
          team_id: HOME,
        },
      ],
      HOME,
      names,
    )

    expect(shootout).not.toBeNull()
    expect(shootout!.homePenScore).toBe(4)
    expect(shootout!.awayPenScore).toBe(2)
    expect(shootout!.homeKicks).toEqual([true, true, true, true, null])
    expect(shootout!.awayKicks).toEqual([true, false, false, true, null])
    expect(shootout!.sequence).toHaveLength(8)
    expect(shootout!.sequence[0]?.playerName).toBe("Kylian Mbappé")
    expect(shootout!.sequence[7]?.homeScoreAfter).toBe(4)
    expect(shootout!.sequence[7]?.awayScoreAfter).toBe(2)
  })

  it("returns null when no shootout events", () => {
    expect(buildPenaltyShootout([], HOME, names)).toBeNull()
  })
})
