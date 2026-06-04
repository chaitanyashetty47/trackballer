import { describe, expect, it } from "vitest"

import {
  countFilledSlots,
  FORMATION_TEMPLATES,
  formationSlotKeys,
  getFormationTemplate,
  getSlotPosition,
} from "../formation-slots"

describe("formation-slots", () => {
  it("each template has eleven unique slots", () => {
    for (const template of FORMATION_TEMPLATES) {
      expect(template.slots).toHaveLength(11)
      const keys = template.slots.map((s) => s.key)
      expect(new Set(keys).size).toBe(11)
    }
  })

  it("formationSlotKeys matches template", () => {
    expect(formationSlotKeys("4-4-2")).toEqual(
      getFormationTemplate("4-4-2").slots.map((s) => s.key),
    )
  })

  it("getSlotPosition maps horizontal coords from vertical", () => {
    const gk = getFormationTemplate("4-3-3").slots.find((s) => s.key === "gk")!
    expect(getSlotPosition(gk, "vertical")).toEqual({ top: 88, left: 50 })
    expect(getSlotPosition(gk, "horizontal")).toEqual({ top: 50, left: 12 })
  })

  it("countFilledSlots counts assigned keys only", () => {
    const keys = formationSlotKeys("4-3-3")
    expect(countFilledSlots(keys, { gk: {}, st: {} })).toBe(2)
  })
})
