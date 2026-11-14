import { describe, expect, it } from "vitest"
import { generateDrills } from "@/lib/data/question-bank"

/** Independent oracle: infer percentage change from the displayed old/new values. */
describe("parametric quantitative answer-key verification", () => {
  it("calculates percentage changes from the original base for 150 deterministic seeds", () => {
    let checked = 0
    for (let seed = 1; seed <= 150; seed++) {
      for (const question of generateDrills("quant", 100, seed)) {
        if (question.topic !== "Data Interpretation") continue
        const match = question.prompt.match(/from (\d+) to (\d+)/)
        expect(match, question.prompt).not.toBeNull()
        const oldValue = Number(match![1])
        const newValue = Number(match![2])
        const expected = (Math.round((Math.abs(newValue - oldValue) / oldValue) * 10000) / 100).toFixed(2) + "%"
        expect(question.options[question.answer], question.prompt).toBe(expected)
        expect(new Set(question.options).size, question.prompt).toBe(4)
        checked++
      }
    }
    expect(checked).toBeGreaterThan(150)
  })

  it("verifies unit-digit answers independently with modular exponentiation", () => {
    let checked = 0
    for (let seed = 1; seed <= 120; seed++) {
      for (const question of generateDrills("quant", 90, seed)) {
        if (question.topic !== "Number System" || !question.prompt.startsWith("The unit digit")) continue
        const match = question.prompt.match(/of (\d+)\^(\d+)/)
        expect(match, question.prompt).not.toBeNull()
        const base = BigInt(match![1])
        const exponent = BigInt(match![2])
        const expected = String((base ** exponent) % 10n)
        expect(question.options[question.answer], question.prompt).toBe(expected)
        expect(new Set(question.options).size, question.prompt).toBe(4)
        checked++
      }
    }
    expect(checked).toBeGreaterThan(100)
  })
})
