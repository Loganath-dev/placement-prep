import type { Question, SectionId } from "@/lib/types"

/**
 * Parametric question generator. Every question is ORIGINAL and its answer is
 * computed in code (computed), so the bank scales to thousands of correct,
 * varied MCQs without copying any third-party paper. Used to deepen practice,
 * mocks and daily challenges.
 *
 * Capacity is effectively unlimited: each generator draws fresh numbers/words,
 * so students never run out of practice.
 */

// ---- deterministic PRNG (mulberry32) ---------------------------------------
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type R = () => number
function int(r: R, lo: number, hi: number) {
  return lo + Math.floor(r() * (hi - lo + 1))
}
function pick<T>(r: R, arr: readonly T[]): T {
  return arr[Math.floor(r() * arr.length)]
}

interface Choice {
  options: string[]
  answer: number
}

/** Build 4 unique numeric options including the correct one, shuffled. */
function numChoices(
  r: R,
  correct: number,
  distractors: number[],
  fmt: (n: number) => string = (n) => String(n),
): Choice {
  const seen = new Set<number>([correct])
  const ds: number[] = []
  for (const d of distractors) {
    if (d >= 0 && !seen.has(d)) {
      seen.add(d)
      ds.push(d)
    }
  }
  let k = 1
  while (ds.length < 3 && k < 200) {
    for (const cand of [correct + k, correct - k]) {
      if (ds.length < 3 && cand >= 0 && !seen.has(cand)) {
        seen.add(cand)
        ds.push(cand)
      }
    }
    k++
  }
  const all = [correct, ...ds.slice(0, 3)]
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return { options: all.map(fmt), answer: all.indexOf(correct) }
}

/** Build 4 unique string options including the correct one, shuffled. */
function strChoices(r: R, correct: string, distractors: string[]): Choice {
  const seen = new Set<string>([correct])
  const ds: string[] = []
  for (const d of distractors) {
    if (d && !seen.has(d)) {
      seen.add(d)
      ds.push(d)
    }
  }
  const all = [correct, ...ds.slice(0, 3)]
  let n = 1
  while (all.length < 4) all.push(`${correct} (${n++})`)
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return { options: all, answer: all.indexOf(correct) }
}

type Gen = (r: R) => Omit<Question, "id">
function make(
  topic: string,
  difficulty: Question["difficulty"],
  prompt: string,
  explanation: string,
  ch: Choice,
): Omit<Question, "id"> {
  return {
    topic,
    difficulty,
    prompt,
    options: ch.options,
    answer: ch.answer,
    explanation,
    sourceId: "studybench-curriculum",
  }
}

const rupee = (n: number) => `Rs ${n}`
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

// ============================================================================
// QUANT generators
// ============================================================================
const gPercentOf: Gen = (r) => {
  const x = pick(r, [5, 10, 15, 20, 25, 30, 40, 50, 60, 75])
  const N = pick(r, [20, 40, 60, 80, 120, 160, 200, 240, 400, 500])
  const correct = (x * N) / 100
  return make(
    "Percentages",
    "easy",
    `What is ${x}% of ${N}?`,
    `${x}% of ${N} = ${x}/100 x ${N} = ${correct}.`,
    numChoices(r, correct, [correct + N / 10, correct - N / 20, (x * N) / 50]),
  )
}

const gProfit: Gen = (r) => {
  const CP = pick(r, [100, 200, 300, 400, 500, 600, 800])
  const p = pick(r, [10, 15, 20, 25])
  const SP = CP + (CP * p) / 100
  return make(
    "Profit & Loss",
    "medium",
    `An item costs Rs ${CP} and is sold at ${p}% profit. The selling price is:`,
    `SP = ${CP} x (1 + ${p}/100) = Rs ${SP}.`,
    numChoices(r, SP, [CP, CP - (CP * p) / 100, SP + CP / 10], rupee),
  )
}

const gSI: Gen = (r) => {
  const P = pick(r, [1000, 2000, 3000, 4000, 5000, 6000])
  const Rt = pick(r, [5, 8, 10, 12])
  const T = pick(r, [2, 3, 4])
  const SI = (P * Rt * T) / 100
  return make(
    "Simple Interest",
    "medium",
    `Simple interest on Rs ${P} at ${Rt}% per annum for ${T} years is:`,
    `SI = P x R x T / 100 = ${P} x ${Rt} x ${T} / 100 = Rs ${SI}.`,
    numChoices(r, SI, [SI + P / 10, SI - 100, (P * Rt) / 100], rupee),
  )
}

const gRatio: Gen = (r) => {
  const a = int(r, 1, 5)
  let b = int(r, 1, 6)
  if (a === b) b += 1
  const k = int(r, 5, 15)
  const total = (a + b) * k
  const larger = Math.max(a, b) * k
  return make(
    "Ratio",
    "easy",
    `Divide Rs ${total} in the ratio ${a} : ${b}. The larger share is:`,
    `Total parts = ${a + b}; larger share = ${Math.max(a, b)}/${a + b} x ${total} = Rs ${larger}.`,
    numChoices(r, larger, [Math.min(a, b) * k, total / 2, larger + k], rupee),
  )
}

const gAverage: Gen = (r) => {
  const b = int(r, 2, 12)
  const d = pick(r, [2, 3, 4, 5])
  const terms = [b, b + d, b + 2 * d, b + 3 * d, b + 4 * d]
  const avg = b + 2 * d
  return make(
    "Averages",
    "easy",
    `The average of ${terms.join(", ")} is:`,
    `For equally spaced numbers the average is the middle term = ${avg}.`,
    numChoices(r, avg, [avg + d, avg - d, terms[4]]),
  )
}

const gSpeed: Gen = (r) => {
  const s = pick(r, [40, 45, 50, 60, 72, 80])
  const t = pick(r, [2, 3, 4, 5])
  const d = s * t
  return make(
    "Time-Speed-Distance",
    "easy",
    `A vehicle covers ${d} km in ${t} hours. Its speed is:`,
    `Speed = distance / time = ${d} / ${t} = ${s} km/h.`,
    numChoices(r, s, [d / (t + 1), s + 10, s - 5], (n) => `${n} km/h`),
  )
}

const WORK_PAIRS: readonly [number, number, number][] = [
  [10, 15, 6],
  [20, 30, 12],
  [12, 24, 8],
  [6, 12, 4],
  [15, 30, 10],
  [10, 40, 8],
  [9, 18, 6],
  [12, 6, 4],
]
const gWork: Gen = (r) => {
  const [A, B, tog] = pick(r, WORK_PAIRS)
  return make(
    "Time & Work",
    "medium",
    `A finishes a job in ${A} days and B in ${B} days. Working together they take:`,
    `Rate = 1/${A} + 1/${B} per day -> ${tog} days.`,
    numChoices(r, tog, [A, B, tog + 2], (n) => `${n} days`),
  )
}

const UNIT_CYCLES: Record<number, number[]> = {
  2: [2, 4, 8, 6],
  3: [3, 9, 7, 1],
  7: [7, 9, 3, 1],
  8: [8, 4, 2, 6],
}
const gUnitDigit: Gen = (r) => {
  const base = pick(r, [2, 3, 7, 8])
  const exp = int(r, 2, 40)
  const cycle = UNIT_CYCLES[base]
  const correct = cycle[(exp - 1) % 4]
  const distractors = cycle.filter((d) => d !== correct)
  return make(
    "Number System",
    "medium",
    `The unit digit of ${base}^${exp} is:`,
    `The unit digit of ${base} repeats every 4 powers as ${cycle.join(", ")}. ${exp} mod 4 selects ${correct}.`,
    numChoices(r, correct, distractors),
  )
}

const gPercentChangeHard: Gen = (r) => {
  const oldValue = pick(r, [120, 160, 200, 240, 300, 400, 500])
  const change = pick(r, [24, 40, 48, 60, 75, 80, 100])
  const up = r() > 0.45
  const next = up ? oldValue + change : oldValue - change
  const pct = Math.round((change / oldValue) * 100)
  return make(
    "Data Interpretation",
    "hard",
    `A chart value ${up ? "rises" : "falls"} from ${oldValue} to ${next}. What is the percentage ${up ? "increase" : "decrease"}?`,
    `Change = ${change} on the original base ${oldValue}. Percentage = ${change}/${oldValue} x 100 = ${pct}%.`,
    numChoices(r, pct, [Math.round((change / next) * 100), pct + 5, Math.max(1, pct - 5)], (n) => `${n}%`),
  )
}

const gWeightedAverageHard: Gen = (r) => {
  const aCount = pick(r, [20, 30, 40])
  const bCount = pick(r, [10, 20, 30])
  const aAvg = pick(r, [60, 65, 70])
  const bAvg = pick(r, [75, 80, 85])
  const total = aCount + bCount
  const combined = Math.round((aCount * aAvg + bCount * bAvg) / total)
  return make(
    "Averages",
    "hard",
    `Group A has ${aCount} students with average ${aAvg}, and Group B has ${bCount} students with average ${bAvg}. The combined average is closest to:`,
    `Combined average = (${aCount} x ${aAvg} + ${bCount} x ${bAvg}) / ${total} = ${combined}.`,
    numChoices(r, combined, [Math.round((aAvg + bAvg) / 2), combined + 3, combined - 3]),
  )
}

const gMixtureHard: Gen = (r) => {
  const milk = pick(r, [24, 30, 36, 42])
  const water = pick(r, [6, 10, 12, 14])
  const remove = pick(r, [5, 6, 8])
  const total = milk + water
  const waterRemoved = (water * remove) / total
  const correct = Number((water - waterRemoved).toFixed(2))
  return make(
    "Mixtures",
    "hard",
    `A vessel has ${milk} L milk and ${water} L water. If ${remove} L mixture is removed, how much water remains?`,
    `Water fraction = ${water}/${total}. Water removed = ${remove} x ${water}/${total} = ${waterRemoved}. Remaining water = ${correct} L.`,
    numChoices(r, correct, [water, correct + 1, Math.max(0, correct - 1)], (n) => `${n} L`),
  )
}

const gPermutationHard: Gen = (r) => {
  const n = pick(r, [5, 6, 7])
  const selected = pick(r, [2, 3])
  const correct = Array.from({ length: selected }, (_, i) => n - i).reduce((a, b) => a * b, 1)
  return make(
    "Permutation",
    "hard",
    `How many ordered arrangements can be made by selecting ${selected} students from ${n} students?`,
    `Order matters, so use nPr = ${n}!/(${n}-${selected})! = ${correct}.`,
    numChoices(r, correct, [Math.round(correct / selected), correct + n, correct - n]),
  )
}

// ============================================================================
// REASONING generators
// ============================================================================
const gSeriesArith: Gen = (r) => {
  const start = int(r, 1, 9)
  const diff = int(r, 2, 9)
  const terms = [0, 1, 2, 3, 4].map((i) => start + i * diff)
  const next = start + 5 * diff
  return make(
    "Series",
    "easy",
    `Find the next term: ${terms.join(", ")}, ?`,
    `The series increases by ${diff} each time -> ${terms[4]} + ${diff} = ${next}.`,
    numChoices(r, next, [next + diff, next - diff, next + 1]),
  )
}

const gSeriesGeo: Gen = (r) => {
  const start = int(r, 1, 5)
  const ratio = pick(r, [2, 3])
  const terms = [0, 1, 2, 3].map((i) => start * ratio ** i)
  const next = start * ratio ** 4
  return make(
    "Series",
    "medium",
    `Find the next term: ${terms.join(", ")}, ?`,
    `Each term is multiplied by ${ratio} -> ${terms[3]} x ${ratio} = ${next}.`,
    numChoices(r, next, [next + terms[3], terms[3] + ratio, next - terms[3]]),
  )
}

const DIRS = ["North", "East", "South", "West"] as const
const gDirection: Gen = (r) => {
  const start = int(r, 0, 3)
  const turn = pick(r, ["left", "right"] as const)
  const end = turn === "right" ? (start + 1) % 4 : (start + 3) % 4
  const correct = DIRS[end]
  return make(
    "Direction",
    "easy",
    `Facing ${DIRS[start]}, you turn ${turn}. You now face:`,
    `A ${turn} turn rotates your facing by 90 degrees -> ${correct}.`,
    strChoices(
      r,
      correct,
      DIRS.filter((d) => d !== correct),
    ),
  )
}

function shiftWord(word: string, k: number) {
  return word
    .split("")
    .map((ch) => String.fromCharCode(((ch.charCodeAt(0) - 65 + k) % 26) + 65))
    .join("")
}
const SHIFT_WORDS = ["CAT", "DOG", "SUN", "BAT", "MAP", "PEN", "CUP", "BUS", "FOX", "ICE", "RED", "TOP"]
const gCodingShift: Gen = (r) => {
  const word = pick(r, SHIFT_WORDS)
  const k = int(r, 1, 4)
  const correct = shiftWord(word, k)
  return make(
    "Coding-Decoding",
    "medium",
    `If each letter is shifted forward by ${k}, then '${word}' is coded as:`,
    `Shift every letter ${k} place(s) forward -> ${correct}.`,
    strChoices(r, correct, [shiftWord(word, k + 1), shiftWord(word, k + 2), shiftWord(word, Math.max(1, k - 1))]),
  )
}

const gOddOneOut: Gen = (r) => {
  const m = int(r, 2, 6)
  const mults = new Set<number>()
  while (mults.size < 3) mults.add(m * int(r, 2, 9))
  const arr = [...mults]
  const odd = m * int(r, 3, 9) + int(r, 1, m - 1) // not divisible by m
  const pos = int(r, 0, 3)
  arr.splice(pos, 0, odd)
  return make(
    "Classification",
    "medium",
    `Find the odd one out: ${arr.join(", ")}`,
    `${[...mults].join(", ")} are multiples of ${m}; ${odd} is not.`,
    { options: arr.map(String), answer: pos },
  )
}

const gSeatingGapHard: Gen = (r) => {
  const seats = pick(r, [5, 6, 7])
  const gap = pick(r, [1, 2, 3])
  const possible = seats - gap - 1
  return make(
    "Seating Arrangement",
    "hard",
    `In a row of ${seats} seats, how many ordered placements are possible for A and B if exactly ${gap} ${gap === 1 ? "person sits" : "people sit"} between them?`,
    `A and B must be ${gap + 1} seat positions apart. There are ${possible} left-to-right pairs and ${possible} reverse pairs, so total = ${possible * 2}.`,
    numChoices(r, possible * 2, [possible, possible * 2 + 2, Math.max(1, possible * 2 - 2)]),
  )
}

const gDataSufficiencyHard: Gen = (r) => {
  const value = pick(r, [12, 15, 18, 20])
  return make(
    "Data Sufficiency",
    "hard",
    `Question: Is x greater than ${value}? Statement I: x > ${value - 2}. Statement II: x > ${value + 1}. Which is sufficient?`,
    `Statement I allows x = ${value - 1}, so it is not enough. Statement II directly implies x > ${value}, so II alone is sufficient.`,
    strChoices(r, "II alone is sufficient", ["I alone is sufficient", "Both together are needed", "Neither is sufficient"]),
  )
}

const gSeatingArrangementHard: Gen = (r) => {
  const people = pick(r, [
    ["A", "B", "C", "D"],
    ["P", "Q", "R", "S"],
    ["L", "M", "N", "O"],
  ] as const)
  const [a, b, c, d] = people
  return make(
    "Seating Arrangement",
    "hard",
    `${a}, ${b}, ${c}, ${d} sit in a row. ${b} is immediately right of ${a}. ${d} is immediately left of ${c}. If ${a} is not at an end, who sits second from the left?`,
    `The only row satisfying both pairs with ${a} not at an end is ${d} ${c} ${a} ${b}, so ${c} is second from the left.`,
    strChoices(r, c, [a, b, d]),
  )
}

const gSyllogismHard: Gen = (r) => {
  const item = pick(r, [
    ["All coders are learners. Some learners are designers.", "Some coders are designers", "Does not follow"],
    ["No interns are managers. Some managers are mentors.", "Some mentors are not interns", "Follows"],
    ["All tests are assessments. No assessment is casual.", "No test is casual", "Follows"],
  ] as const)
  return make(
    "Syllogism",
    "hard",
    `${item[0]} Conclusion: ${item[1]}.`,
    `The correct judgement is: ${item[2]}. Translate each statement into sets before deciding.`,
    strChoices(r, item[2], [
      item[2] === "Follows" ? "Does not follow" : "Follows",
      "Both conclusions follow",
      "Only statement I is sufficient",
    ]),
  )
}

// ============================================================================
// VERBAL generators (curated original word lists)
// ============================================================================
const SYNONYMS: readonly [string, string, string[]][] = [
  ["Abundant", "Plentiful", ["Scarce", "Rare", "Empty"]],
  ["Brave", "Courageous", ["Cowardly", "Timid", "Weak"]],
  ["Rapid", "Quick", ["Slow", "Late", "Calm"]],
  ["Happy", "Joyful", ["Sad", "Angry", "Tired"]],
  ["Diligent", "Hard-working", ["Lazy", "Careless", "Rude"]],
  ["Eager", "Keen", ["Reluctant", "Bored", "Indifferent"]],
  ["Generous", "Liberal", ["Stingy", "Selfish", "Mean"]],
  ["Concise", "Brief", ["Lengthy", "Vague", "Wordy"]],
  ["Benevolent", "Kind", ["Cruel", "Hostile", "Harsh"]],
  ["Tedious", "Boring", ["Exciting", "Brief", "Lively"]],
  ["Vivid", "Bright", ["Dull", "Faint", "Pale"]],
  ["Wealthy", "Rich", ["Poor", "Broke", "Needy"]],
  ["Fragile", "Delicate", ["Strong", "Tough", "Sturdy"]],
  ["Honest", "Truthful", ["Deceitful", "False", "Sly"]],
  ["Enormous", "Huge", ["Tiny", "Small", "Little"]],
  ["Furious", "Angry", ["Calm", "Pleased", "Happy"]],
  ["Wise", "Sensible", ["Foolish", "Silly", "Naive"]],
  ["Courteous", "Polite", ["Rude", "Impolite", "Harsh"]],
  ["Famous", "Renowned", ["Unknown", "Obscure", "Hidden"]],
  ["Brief", "Short", ["Long", "Endless", "Lengthy"]],
]
const gSynonym: Gen = (r) => {
  const [word, syn, ds] = pick(r, SYNONYMS)
  return make(
    "Synonyms",
    "easy",
    `Choose the word closest in meaning to '${word}':`,
    `'${word}' means ${syn.toLowerCase()}.`,
    strChoices(r, syn, ds),
  )
}

const ANTONYMS: readonly [string, string, string[]][] = [
  ["Expand", "Contract", ["Grow", "Stretch", "Widen"]],
  ["Victory", "Defeat", ["Win", "Success", "Triumph"]],
  ["Increase", "Decrease", ["Rise", "Grow", "Expand"]],
  ["Transparent", "Opaque", ["Clear", "Visible", "Glassy"]],
  ["Begin", "End", ["Start", "Open", "Launch"]],
  ["Scarce", "Abundant", ["Rare", "Few", "Limited"]],
  ["Generous", "Stingy", ["Kind", "Giving", "Liberal"]],
  ["Ancient", "Modern", ["Old", "Aged", "Historic"]],
  ["Brave", "Cowardly", ["Bold", "Daring", "Heroic"]],
  ["Praise", "Criticize", ["Admire", "Applaud", "Commend"]],
  ["Accept", "Reject", ["Agree", "Approve", "Allow"]],
  ["Artificial", "Natural", ["Fake", "Synthetic", "Man-made"]],
  ["Permanent", "Temporary", ["Lasting", "Fixed", "Stable"]],
  ["Humble", "Arrogant", ["Modest", "Meek", "Shy"]],
  ["Friend", "Enemy", ["Ally", "Companion", "Mate"]],
  ["Strengthen", "Weaken", ["Boost", "Reinforce", "Fortify"]],
  ["Wise", "Foolish", ["Smart", "Clever", "Sensible"]],
  ["Bright", "Dull", ["Vivid", "Shiny", "Radiant"]],
  ["Cheap", "Expensive", ["Affordable", "Low-cost", "Budget"]],
  ["Difficult", "Easy", ["Hard", "Tough", "Complex"]],
]
const gAntonym: Gen = (r) => {
  const [word, ant, ds] = pick(r, ANTONYMS)
  return make(
    "Antonyms",
    "easy",
    `Choose the word opposite in meaning to '${word}':`,
    `The opposite of '${word}' is '${ant.toLowerCase()}'.`,
    strChoices(r, ant, ds),
  )
}

const gRcInferenceHard: Gen = (r) => {
  const topic = pick(r, [
    ["A startup reduced meetings, but teams needed clearer written updates to stay aligned.", "Fewer meetings require stronger written communication."],
    ["The new tool saved time for experts, but beginners made more mistakes until they were trained.", "Tools still need user training to be effective."],
    ["Remote interviews widened access, but candidates with poor connectivity faced unfair interruptions.", "Remote hiring improves reach but can create new barriers."],
  ] as const)
  return make(
    "Reading Comprehension",
    "hard",
    `Passage: '${topic[0]}' Best inference:`,
    `The passage gives a benefit plus a condition or drawback. The supported inference is: ${topic[1]}`,
    strChoices(r, topic[1], ["The change has no drawbacks.", "The old method was always better.", "The passage supports no conclusion."]),
  )
}

const gParaJumbleHard: Gen = (r) => {
  return make(
    "Para Jumble",
    "hard",
    "Which sentence is most likely to come first in a paragraph?",
    "An opening sentence introduces the topic without depending on words like 'this', 'therefore' or 'however'.",
    strChoices(r, "Campus placements require steady preparation across aptitude, coding and communication.", [
      "Therefore, students should revise mistakes daily.",
      "This is why mock tests matter.",
      "However, many students ignore revision.",
    ]),
  )
}

const gSentenceCorrectionHard: Gen = (r) => {
  const item = pick(r, [
    ["Neither the interviewer nor the panelists ___ satisfied.", "were", ["was", "is", "has"]],
    ["The number of applicants ___ increased this year.", "has", ["have", "are", "were"]],
    ["She is senior ___ me in the project team.", "to", ["than", "from", "over"]],
  ] as const)
  return make(
    "Sentence Correction",
    "hard",
    `Choose the correct word: ${item[0]}`,
    `The correct usage is '${item[1]}' in this sentence.`,
    strChoices(r, item[1], [...item[2]]),
  )
}

const gCriticalReasoningHard: Gen = (r) => {
  const item = pick(r, [
    ["A student improved mock scores only after reviewing mistakes daily.", "Mistake review can improve test performance."],
    ["A team delivered late because requirements changed twice without written confirmation.", "Written confirmation can reduce delivery confusion."],
    ["Candidates who practised timed coding solved fewer questions incorrectly under pressure.", "Timed practice can improve accuracy in coding rounds."],
  ] as const)
  return make(
    "Critical Reasoning",
    "hard",
    `Statement: ${item[0]} Best supported conclusion:`,
    `The conclusion must stay within the evidence. The supported answer is: ${item[1]}`,
    strChoices(r, item[1], ["The opposite is definitely true.", "There is no useful conclusion.", "Only luck determines results."]),
  )
}

// ============================================================================
// CODING generators
// ============================================================================
const gMod: Gen = (r) => {
  const a = int(r, 5, 50)
  const b = int(r, 2, 9)
  const correct = a % b
  return make(
    "C Output",
    "easy",
    `In C, what is ${a} % ${b}?`,
    `${a} divided by ${b} leaves a remainder of ${correct}.`,
    numChoices(r, correct, [Math.floor(a / b), correct + 1, b - 1]),
  )
}

const gIntDiv: Gen = (r) => {
  const b = int(r, 2, 9)
  const correct = int(r, 2, 9)
  const a = b * correct + int(r, 0, b - 1)
  return make(
    "C Output",
    "easy",
    `In C (integer division), what is ${a} / ${b}?`,
    `Integer division discards the remainder: ${a} / ${b} = ${correct}.`,
    numChoices(r, correct, [correct + 1, a % b, correct - 1]),
  )
}

const gBitwise: Gen = (r) => {
  const op = pick(r, ["&", "|", "^"] as const)
  const x = int(r, 1, 15)
  const y = int(r, 1, 15)
  const correct = op === "&" ? x & y : op === "|" ? x | y : x ^ y
  const name = op === "&" ? "AND" : op === "|" ? "OR" : "XOR"
  return make(
    "Bit Manipulation",
    "medium",
    `What is ${x} ${op} ${y} (bitwise ${name})?`,
    `${x} ${op} ${y} = ${correct}.`,
    numChoices(r, correct, [x & y, x | y, x ^ y].filter((v) => v !== correct).concat(correct + 1)),
  )
}

const gLoopCount: Gen = (r) => {
  const a = int(r, 0, 3)
  const s = int(r, 1, 3)
  const count = int(r, 3, 8)
  const b = a + s * count
  return make(
    "Loops",
    "easy",
    `How many times does this loop run?  for(i=${a}; i<${b}; i+=${s})`,
    `i goes ${a}, ${a + s}, ... up to below ${b} in steps of ${s} -> ${count} iterations.`,
    numChoices(r, count, [count + 1, count - 1, b]),
  )
}

const gPower: Gen = (r) => {
  const base = int(r, 2, 5)
  const exp = int(r, 2, 4)
  const correct = base ** exp
  return make(
    "Operators",
    "easy",
    `What is ${base} to the power ${exp}?`,
    `${base}^${exp} = ${correct}.`,
    numChoices(r, correct, [base * exp, correct + base, correct - base]),
  )
}

const COMPLEXITY: readonly [string, string, string[]][] = [
  ["Time to access an array element by index:", "O(1)", ["O(n)", "O(log n)", "O(n^2)"]],
  ["Time complexity of binary search:", "O(log n)", ["O(n)", "O(n log n)", "O(1)"]],
  ["Two nested loops over n elements:", "O(n^2)", ["O(n)", "O(n log n)", "O(2n)"]],
  ["Best average sorting time complexity:", "O(n log n)", ["O(n^2)", "O(n)", "O(log n)"]],
  ["Average hash table lookup:", "O(1)", ["O(n)", "O(log n)", "O(n^2)"]],
  ["Inserting at the head of a linked list:", "O(1)", ["O(n)", "O(log n)", "O(n^2)"]],
]
const gComplexity: Gen = (r) => {
  const [prompt, correct, ds] = pick(r, COMPLEXITY)
  return make("Complexity", "medium", prompt, `The answer is ${correct}.`, strChoices(r, correct, ds))
}

const gEdgeCaseHard: Gen = (r) => {
  const problem = pick(r, [
    ["first non-repeating character", "all characters repeat"],
    ["maximum element in an array", "array has only negative numbers"],
    ["two-sum using two pointers", "array is not sorted"],
    ["string compression", "input has one character"],
  ] as const)
  return make(
    "Edge Cases",
    "hard",
    `Which hidden test is most important for a '${problem[0]}' solution?`,
    `The edge case '${problem[1]}' commonly breaks incomplete solutions for this problem type.`,
    strChoices(r, problem[1], ["only the sample input", "only very small positive numbers", "a random happy path"]),
  )
}

const gOptimizationHard: Gen = (r) => {
  return make(
    "Optimization",
    "hard",
    "A pair-sum solution uses two nested loops over n elements. Which improvement is usually best?",
    "A hash set tracks seen values and checks complements in one pass, reducing average time from O(n^2) to O(n).",
    strChoices(r, "Use a hash set to check complements in O(n)", [
      "Add a third nested loop",
      "Convert every number to a string",
      "Ignore time complexity",
    ]),
  )
}

const gTraceRecursionHard: Gen = (r) => {
  const n = int(r, 3, 6)
  const correct = (n * (n + 1)) / 2
  return make(
    "Recursion",
    "hard",
    `If f(0)=0 and f(n)=n+f(n-1), what is f(${n})?`,
    `This sums 1 through ${n}: ${n} x ${n + 1} / 2 = ${correct}.`,
    numChoices(r, correct, [correct - n, correct + n, n * n]),
  )
}

const gSlidingWindowHard: Gen = (r) => {
  const item = pick(r, [
    [[2, 1, 5, 1, 3, 2], 3, 9],
    [[1, 9, 2, 4, 6], 2, 11],
    [[4, 2, 1, 7, 8, 1], 3, 16],
  ] as const)
  return make(
    "Sliding Window",
    "hard",
    `For array [${item[0].join(", ")}], what is the maximum sum of any ${item[1]} consecutive elements?`,
    `Check each fixed-size window; the maximum window sum is ${item[2]}.`,
    numChoices(r, item[2], [item[2] - 1, item[2] + 2, item[1]]),
  )
}

// ============================================================================
// CS-CORE generators (curated facts)
// ============================================================================
const CS_FACTS: readonly [string, string, string[]][] = [
  ["Which data structure uses FIFO order?", "Queue", ["Stack", "Tree", "Graph"]],
  ["Which data structure uses LIFO order?", "Stack", ["Queue", "Array", "Heap"]],
  ["Which key uniquely identifies a row in a table?", "Primary key", ["Foreign key", "Index", "Check"]],
  ["How many layers are in the OSI model?", "7", ["5", "6", "4"]],
  ["Which protocol resolves domain names to IP addresses?", "DNS", ["HTTP", "FTP", "SMTP"]],
  ["Which protocol is connection-oriented and reliable?", "TCP", ["UDP", "IP", "ICMP"]],
  ["HTTPS communicates over which port?", "443", ["80", "21", "25"]],
  ["RAM is best described as:", "Volatile memory", ["Permanent storage", "A disk", "A CPU"]],
  ["Which SQL clause filters groups after aggregation?", "HAVING", ["WHERE", "GROUP BY", "ORDER BY"]],
  ["Which SQL keyword removes duplicate rows?", "DISTINCT", ["UNIQUE", "FILTER", "ONLY"]],
  ["In-order traversal of a BST gives values in:", "Sorted order", ["Reverse order", "Random order", "Level order"]],
  ["Which traversal uses a queue?", "BFS", ["DFS", "In-order", "Pre-order"]],
  ["Hiding internal state behind methods is called:", "Encapsulation", ["Inheritance", "Polymorphism", "Abstraction"]],
  ["1 byte equals how many bits?", "8", ["4", "16", "32"]],
  ["Binary search requires the array to be:", "Sorted", ["Reversed", "Empty", "Of even length"]],
  ["Which CPU scheduling can cause starvation?", "Priority", ["FCFS", "Round Robin", "None"]],
  ["3NF removes which kind of dependency?", "Transitive", ["Partial", "Functional", "Total"]],
  ["An operating system is an example of:", "System software", ["Application software", "Hardware", "A browser"]],
  ["Which protocol sends email?", "SMTP", ["HTTP", "DNS", "FTP"]],
  ["A foreign key references:", "Another table's primary key", ["The same row", "An index", "A view"]],
]
const gCsFact: Gen = (r) => {
  const [prompt, correct, ds] = pick(r, CS_FACTS)
  return make("CS Fundamentals", "easy", prompt, `The correct answer is ${correct}.`, strChoices(r, correct, ds))
}

const gSecurityCloudHard: Gen = (r) => {
  const fact = pick(r, [
    ["Authentication mainly verifies:", "Identity", ["Database speed", "Screen size", "Compiler version"]],
    ["Authorization mainly decides:", "What an authenticated user can access", ["Whether RAM is volatile", "How many rows a table has", "The HTTP port number"]],
    ["A 401 HTTP response usually means:", "Unauthorized", ["Not found", "Server crashed", "Successful request"]],
    ["In SaaS, the user mainly:", "Uses the application", ["Manages the physical server", "Writes the operating system", "Builds the CPU"]],
  ] as const)
  return make("Security & Cloud", "hard", fact[0], `The correct answer is ${fact[1]}.`, strChoices(r, fact[1], [...fact[2]]))
}

const gDbmsHard: Gen = (r) => {
  const fact = pick(r, [
    ["A table has repeated customer address data causing update anomalies. Which normalization idea helps?", "Move repeated data into a separate related table"],
    ["Which SQL clause should filter aggregated groups such as COUNT(*) > 5?", "HAVING"],
    ["A transaction should leave the database valid even after failure. Which ACID property is involved?", "Consistency"],
  ] as const)
  return make(
    "DBMS",
    "hard",
    fact[0],
    `The correct answer is ${fact[1]}.`,
    strChoices(r, fact[1], ["Use random ordering", "Store everything in one text field", "Ignore keys"]),
  )
}

const gOsNetworksHard: Gen = (r) => {
  const fact = pick(r, [
    ["Which page replacement policy removes the page not used for the longest time?", "LRU"],
    ["Which condition means two processes wait forever for each other's resource?", "Deadlock"],
    ["TCP uses which mechanism to start a connection?", "Three-way handshake"],
  ] as const)
  return make(
    "OS & Networks",
    "hard",
    fact[0],
    `The correct answer is ${fact[1]}.`,
    strChoices(r, fact[1], ["Round-robin only", "DNS lookup", "Garbage collection"]),
  )
}

const gInterviewScenario: Gen = (r) => {
  const item = pick(r, [
    ["The interviewer asks why your CGPA dipped in one semester.", "Briefly accept it, explain the corrective action and show later improvement."],
    ["A GD participant interrupts you repeatedly.", "Pause, acknowledge them, then re-enter with a concise evidence-backed point."],
    ["You do not know the answer to a technical question.", "Admit it honestly, share what you do know, and ask to reason from basics."],
    ["The HR asks why you should be hired over others.", "Connect your skills, project ownership and learning attitude to the role."],
  ] as const)
  return make(
    "Interview Scenarios",
    "hard",
    `${item[0]} What is the strongest response?`,
    `The best response is professional, honest and evidence-based: ${item[1]}`,
    strChoices(r, item[1], ["Blame someone else.", "Give a memorised unrelated answer.", "Avoid answering and change the topic."]),
  )
}

const gCommunicationClarity: Gen = (r) => {
  const item = pick(r, [
    ["Which GD opening is strongest?", "I would like to define the issue first, then compare the benefits and risks."],
    ["Which project explanation line is strongest?", "I built the authentication flow, handled validation, and reduced failed logins."],
    ["Which closing question to an interviewer is strongest?", "What skills should a fresher strengthen to contribute faster in this role?"],
  ] as const)
  return make(
    "Communication",
    "medium",
    item[0],
    "The correct option is specific, professional and role-aware.",
    strChoices(r, item[1], ["I do not have anything to say.", "Whatever is fine for me.", "Please select me quickly."]),
  )
}

// ============================================================================
// QUANT generators (expanded coverage)
// ============================================================================
const gHcf: Gen = (r) => {
  const a = pick(r, [12, 16, 18, 24, 36, 48, 60, 72])
  const b = pick(r, [8, 15, 20, 30, 40, 45, 54, 90])
  const h = gcd(a, b)
  return make(
    "HCF & LCM",
    "easy",
    `What is the HCF (GCD) of ${a} and ${b}?`,
    `Take the product of the common prime factors of ${a} and ${b}: HCF = ${h}.`,
    numChoices(r, h, [h * 2, Math.abs(a - b), gcd(a, b) + 1]),
  )
}

const gLcm: Gen = (r) => {
  const a = pick(r, [4, 6, 8, 9, 10, 12, 15])
  const b = pick(r, [6, 8, 14, 15, 18, 20, 24])
  const l = (a * b) / gcd(a, b)
  return make(
    "HCF & LCM",
    "medium",
    `What is the LCM of ${a} and ${b}?`,
    `LCM = (a x b) / HCF = (${a} x ${b}) / ${gcd(a, b)} = ${l}.`,
    numChoices(r, l, [a * b, l + a, Math.abs(l - b)]),
  )
}

const gAge: Gen = (r) => {
  const ra = pick(r, [2, 3, 4, 5])
  let rb = pick(r, [3, 4, 5, 6])
  if (ra === rb) rb += 1
  const k = pick(r, [3, 4, 5, 6, 7])
  const younger = Math.min(ra, rb) * k
  const older = Math.max(ra, rb) * k
  const sum = younger + older
  return make(
    "Ages",
    "medium",
    `The ages of two people are in the ratio ${ra} : ${rb} and add up to ${sum} years. The younger person's age is:`,
    `Total parts = ${ra + rb}; one part = ${sum}/${ra + rb} = ${k}. Younger = ${Math.min(ra, rb)} x ${k} = ${younger}.`,
    numChoices(r, younger, [older, younger + k, k], (n) => `${n} years`),
  )
}

const gCompoundInterest: Gen = (r) => {
  const P = pick(r, [1000, 2000, 4000, 5000, 8000, 10000])
  const Rt = pick(r, [10, 20])
  const factor = Rt === 10 ? 0.21 : 0.44
  const CI = P * factor
  return make(
    "Compound Interest",
    "hard",
    `The compound interest on Rs ${P} at ${Rt}% per annum for 2 years is:`,
    `CI = P[(1 + R/100)^2 - 1] = ${P} x ${factor} = Rs ${CI}.`,
    numChoices(r, CI, [(P * Rt * 2) / 100, CI + P / 10, (P * Rt) / 100], rupee),
  )
}

const gPartnership: Gen = (r) => {
  const x = pick(r, [2, 3, 4, 5])
  let y = pick(r, [3, 4, 5, 6])
  if (x === y) y += 1
  const part = pick(r, [500, 1000, 1500, 2000])
  const profit = (x + y) * part
  const aShare = x * part
  return make(
    "Partnership",
    "medium",
    `A and B invest in the ratio ${x} : ${y}. If the total profit is Rs ${profit}, A's share is:`,
    `A's share = ${x}/${x + y} x ${profit} = Rs ${aShare}.`,
    numChoices(r, aShare, [y * part, profit - aShare, profit / 2], rupee),
  )
}

const PIPE_PAIRS: readonly [number, number, number][] = [
  [10, 15, 6],
  [20, 30, 12],
  [12, 24, 8],
  [6, 12, 4],
  [15, 30, 10],
  [12, 6, 4],
  [10, 40, 8],
]
const gPipes: Gen = (r) => {
  const [a, b, tog] = pick(r, PIPE_PAIRS)
  return make(
    "Pipes & Cisterns",
    "medium",
    `Pipe A fills a tank in ${a} hours and pipe B in ${b} hours. Working together they fill it in:`,
    `Combined rate = 1/${a} + 1/${b} per hour, so the tank fills in ${tog} hours.`,
    numChoices(r, tog, [a, b, tog + 2], (n) => `${n} hours`),
  )
}

const gBoatStream: Gen = (r) => {
  const boat = pick(r, [8, 10, 12, 15, 18, 20])
  const stream = pick(r, [2, 3, 4, 5])
  const down = boat + stream
  const up = boat - stream
  const ask = pick(r, ["downstream", "upstream"] as const)
  const correct = ask === "downstream" ? down : up
  return make(
    "Boats & Streams",
    "medium",
    `A boat travels at ${boat} km/h in still water; the stream flows at ${stream} km/h. Its ${ask} speed is:`,
    `${ask === "downstream" ? "Downstream = boat speed + stream speed" : "Upstream = boat speed - stream speed"} = ${correct} km/h.`,
    numChoices(r, correct, [ask === "downstream" ? up : down, boat, stream], (n) => `${n} km/h`),
  )
}

const gTrainPole: Gen = (r) => {
  const ms = pick(r, [10, 15, 20, 25])
  const speedKmh = (ms * 18) / 5
  const secs = pick(r, [8, 10, 12, 15, 18, 20])
  const len = ms * secs
  return make(
    "Trains",
    "medium",
    `A train ${len} m long runs at ${speedKmh} km/h. The time it takes to cross a pole is:`,
    `Speed = ${speedKmh} x 5/18 = ${ms} m/s. Time = length / speed = ${len} / ${ms} = ${secs} s.`,
    numChoices(r, secs, [secs + 2, secs - 2, ms], (n) => `${n} s`),
  )
}

const PROB_FACTS: readonly [string, string][] = [
  ["a single die shows an even number", "1/2"],
  ["a single die shows a number greater than 4", "1/3"],
  ["a single die shows a prime number", "1/2"],
  ["a tossed coin shows heads", "1/2"],
  ["two tossed coins both show heads", "1/4"],
  ["a single die shows 6", "1/6"],
  ["a single die shows a multiple of 3", "1/3"],
]
const gProbability: Gen = (r) => {
  const [event, correct] = pick(r, PROB_FACTS)
  const pool = ["1/4", "1/6", "2/3", "5/6", "1/2", "1/3"].filter((p) => p !== correct)
  return make(
    "Probability",
    "medium",
    `The probability that ${event} is:`,
    `Probability = favourable outcomes / total outcomes = ${correct}.`,
    strChoices(r, correct, pool.slice(0, 3)),
  )
}

const gSimplification: Gen = (r) => {
  const a = int(r, 2, 9)
  const b = int(r, 2, 9)
  const c = int(r, 2, 9)
  const correct = a + b * c
  return make(
    "Simplification",
    "easy",
    `Simplify using BODMAS: ${a} + ${b} x ${c}`,
    `Multiplication is done before addition: ${b} x ${c} = ${b * c}, then ${a} + ${b * c} = ${correct}.`,
    numChoices(r, correct, [(a + b) * c, a * b + c, correct + 1]),
  )
}

const FACTOR_COUNTS: readonly [number, number][] = [
  [12, 6],
  [16, 5],
  [18, 6],
  [24, 8],
  [36, 9],
  [100, 9],
  [30, 8],
  [28, 6],
  [48, 10],
  [60, 12],
]
const gNumFactors: Gen = (r) => {
  const [n, c] = pick(r, FACTOR_COUNTS)
  return make(
    "Number of Factors",
    "hard",
    `How many positive factors (divisors) does ${n} have?`,
    `Write ${n} as a product of primes, add 1 to each exponent, then multiply the results to get ${c} factors.`,
    numChoices(r, c, [c + 1, c - 1, c + 2]),
  )
}

const gRemainder: Gen = (r) => {
  const m = pick(r, [7, 9, 11, 13])
  const a = pick(r, [100, 123, 150, 200, 250, 175, 144])
  const correct = a % m
  return make(
    "Remainders",
    "medium",
    `What is the remainder when ${a} is divided by ${m}?`,
    `${a} = ${m} x ${Math.floor(a / m)} + ${correct}, so the remainder is ${correct}.`,
    numChoices(r, correct, [correct + 1, m - 1, (correct + 2) % m]),
  )
}

const gAreaRect: Gen = (r) => {
  const l = pick(r, [6, 8, 10, 12, 15, 20])
  const w = pick(r, [4, 5, 6, 8, 10])
  const ask = pick(r, ["area", "perimeter"] as const)
  const correct = ask === "area" ? l * w : 2 * (l + w)
  const unit = ask === "area" ? "cm^2" : "cm"
  return make(
    "Mensuration",
    "easy",
    `A rectangle measures ${l} cm by ${w} cm. Its ${ask} is:`,
    `${ask === "area" ? `Area = length x width = ${l} x ${w}` : `Perimeter = 2 x (length + width) = 2 x (${l} + ${w})`} = ${correct} ${unit}.`,
    numChoices(r, correct, [ask === "area" ? 2 * (l + w) : l * w, correct + l, Math.abs(correct - w)], (n) => `${n} ${unit}`),
  )
}

const gAreaTriangle: Gen = (r) => {
  const base = pick(r, [6, 8, 10, 12, 14, 16, 20])
  const h = pick(r, [5, 6, 8, 10, 12])
  const area = (base * h) / 2
  return make(
    "Mensuration",
    "medium",
    `A triangle has base ${base} cm and height ${h} cm. Its area is:`,
    `Area = 1/2 x base x height = 1/2 x ${base} x ${h} = ${area} cm^2.`,
    numChoices(r, area, [base * h, area + base, area + h], (n) => `${n} cm^2`),
  )
}

const gAreaCircle: Gen = (r) => {
  const radius = pick(r, [7, 14, 21, 28])
  const ask = pick(r, ["area", "circumference"] as const)
  const area = (22 * radius * radius) / 7
  const circ = (2 * 22 * radius) / 7
  const correct = ask === "area" ? area : circ
  const unit = ask === "area" ? "cm^2" : "cm"
  return make(
    "Mensuration",
    "medium",
    `Using pi = 22/7, the ${ask} of a circle of radius ${radius} cm is:`,
    `${ask === "area" ? `Area = pi x r^2 = 22/7 x ${radius}^2 = ${area}` : `Circumference = 2 x pi x r = 2 x 22/7 x ${radius} = ${circ}`} ${unit}.`,
    numChoices(r, correct, [ask === "area" ? circ : area, correct + radius, correct - radius], (n) => `${n} ${unit}`),
  )
}

const gVolumeCuboid: Gen = (r) => {
  const l = pick(r, [2, 3, 4, 5, 6])
  const w = pick(r, [2, 3, 4, 5])
  const h = pick(r, [2, 3, 4, 5, 6])
  const vol = l * w * h
  return make(
    "Mensuration",
    "medium",
    `The volume of a cuboid measuring ${l} x ${w} x ${h} cm is:`,
    `Volume = length x width x height = ${l} x ${w} x ${h} = ${vol} cm^3.`,
    numChoices(r, vol, [2 * (l * w + w * h + h * l), vol + l, l + w + h], (n) => `${n} cm^3`),
  )
}

const gDiscount: Gen = (r) => {
  const mp = pick(r, [200, 300, 400, 500, 800, 1000, 1200])
  const d = pick(r, [10, 15, 20, 25])
  const sp = (mp * (100 - d)) / 100
  return make(
    "Discount",
    "medium",
    `An item is marked at Rs ${mp}. After a ${d}% discount, its selling price is:`,
    `SP = MP x (1 - ${d}/100) = ${mp} x ${(100 - d) / 100} = Rs ${sp}.`,
    numChoices(r, sp, [mp, (mp * d) / 100, sp - mp / 10], rupee),
  )
}

const gAverageReplace: Gen = (r) => {
  const n = pick(r, [5, 8, 10])
  const oldAvg = pick(r, [20, 30, 40, 50])
  const change = pick(r, [5, 10, 15])
  const up = r() > 0.5
  const newAvg = up ? oldAvg + change : oldAvg - change
  const diff = n * change
  return make(
    "Averages",
    "hard",
    `The average of ${n} numbers is ${oldAvg}. After one number is replaced, the average ${up ? "rises" : "falls"} to ${newAvg}. By how much did that one number change?`,
    `A shift of ${change} in the average of ${n} numbers means the total shifted by ${n} x ${change} = ${diff}, which is the change in the replaced number.`,
    numChoices(r, diff, [change, diff + change, n]),
  )
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const
const gCalendarDay: Gen = (r) => {
  const start = int(r, 0, 6)
  const ahead = pick(r, [10, 15, 20, 30, 45, 60, 100])
  const end = (start + ahead) % 7
  return make(
    "Calendars",
    "medium",
    `If today is ${WEEKDAYS[start]}, what day of the week will it be after ${ahead} days?`,
    `${ahead} mod 7 = ${ahead % 7}. Counting ${ahead % 7} day(s) forward from ${WEEKDAYS[start]} gives ${WEEKDAYS[end]}.`,
    strChoices(r, WEEKDAYS[end], WEEKDAYS.filter((_, i) => i !== end).slice(0, 3) as string[]),
  )
}

const gClockAngle: Gen = (r) => {
  const h = int(r, 1, 11)
  const angle = Math.min(30 * h, 360 - 30 * h)
  return make(
    "Clocks",
    "hard",
    `What is the angle between the hour and minute hands at exactly ${h}:00?`,
    `At ${h}:00 the minute hand points at 12 and the hour hand at ${h}. Each hour gap is 30 degrees, giving ${angle} degrees.`,
    numChoices(r, angle, [30 * h, angle + 30, Math.abs(angle - 30)], (n) => `${n} degrees`),
  )
}

// ============================================================================
// REASONING generators (expanded coverage)
// ============================================================================
const BLOOD_RELATIONS: readonly [string, string, string[]][] = [
  ["Pointing to a boy, Sara said, 'He is the son of my father's wife.' How is the boy related to Sara?", "Brother", ["Father", "Cousin", "Uncle"]],
  ["A is the father of B, and B is the brother of C. How is A related to C?", "Father", ["Brother", "Uncle", "Grandfather"]],
  ["P is the mother of Q, and Q is the sister of R. How is P related to R?", "Mother", ["Sister", "Aunt", "Grandmother"]],
  ["M is the daughter of N, and N is the son of O. How is O related to M?", "Grandfather", ["Father", "Uncle", "Brother"]],
  ["X is the brother of Y. Z is the father of Y. How is X related to Z?", "Son", ["Brother", "Father", "Nephew"]],
]
const gBloodRelation: Gen = (r) => {
  const [prompt, correct, ds] = pick(r, BLOOD_RELATIONS)
  return make(
    "Blood Relations",
    "medium",
    prompt,
    `Trace each link step by step (parent, sibling, child). The correct relation is ${correct}.`,
    strChoices(r, correct, [...ds]),
  )
}

const gSeriesSquares: Gen = (r) => {
  const start = int(r, 2, 6)
  const terms = [0, 1, 2, 3].map((i) => (start + i) ** 2)
  const next = (start + 4) ** 2
  return make(
    "Series",
    "medium",
    `Find the next term: ${terms.join(", ")}, ?`,
    `These are consecutive perfect squares ${start}^2, ${start + 1}^2, ...; the next is ${start + 4}^2 = ${next}.`,
    numChoices(r, next, [next + (2 * (start + 4) + 1), next + 1, terms[3] + 10]),
  )
}

const gSeriesCubes: Gen = (r) => {
  const start = int(r, 2, 5)
  const terms = [0, 1, 2, 3].map((i) => (start + i) ** 3)
  const next = (start + 4) ** 3
  return make(
    "Series",
    "medium",
    `Find the next term: ${terms.join(", ")}, ?`,
    `These are consecutive perfect cubes ${start}^3, ${start + 1}^3, ...; the next is ${start + 4}^3 = ${next}.`,
    numChoices(r, next, [terms[3] + (start + 3) ** 2, next + 1, next - 10]),
  )
}

const gSeriesMultiplyAdd: Gen = (r) => {
  const start = int(r, 2, 5)
  const terms = [start]
  for (let i = 0; i < 3; i++) terms.push(terms[terms.length - 1] * 2 + 1)
  const next = terms[terms.length - 1] * 2 + 1
  return make(
    "Series",
    "hard",
    `Find the next term: ${terms.join(", ")}, ?`,
    `The rule is x2 then +1 applied repeatedly: ${terms[3]} x 2 + 1 = ${next}.`,
    numChoices(r, next, [terms[3] * 2, next + 1, terms[3] + start]),
  )
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const gLetterSeries: Gen = (r) => {
  const start = int(r, 0, 8)
  const step = pick(r, [1, 2, 3, 4])
  const idx = [0, 1, 2, 3].map((i) => start + i * step)
  const nextIdx = start + 4 * step
  const ans = LETTERS[nextIdx]
  return make(
    "Letter Series",
    "medium",
    `Find the next letter: ${idx.map((i) => LETTERS[i]).join(", ")}, ?`,
    `Each letter moves forward by ${step} position(s); the next letter is ${ans}.`,
    strChoices(r, ans, [LETTERS[(nextIdx + 1) % 26], LETTERS[(nextIdx + 2) % 26], LETTERS[(nextIdx + 3) % 26]]),
  )
}

const gAnalogyNumber: Gen = (r) => {
  const a = int(r, 2, 9)
  let b = int(r, 2, 9)
  if (b === a) b += 1
  return make(
    "Analogy",
    "medium",
    `${a} : ${a * a} :: ${b} : ?`,
    `The relation is n -> n^2 (each number maps to its square). So ${b} -> ${b * b}.`,
    numChoices(r, b * b, [b * 2, b * b + b, (b + 1) ** 2]),
  )
}

const WORD_ANALOGIES: readonly [string, string, string[]][] = [
  ["Puppy : Dog :: Kitten : ?", "Cat", ["Mouse", "Cub", "Pup"]],
  ["Pen : Write :: Knife : ?", "Cut", ["Sharp", "Metal", "Kitchen"]],
  ["Teacher : School :: Doctor : ?", "Hospital", ["Medicine", "Patient", "Nurse"]],
  ["Book : Author :: Painting : ?", "Painter", ["Brush", "Colour", "Gallery"]],
  ["Bee : Hive :: Bird : ?", "Nest", ["Sky", "Egg", "Wing"]],
]
const gWordAnalogy: Gen = (r) => {
  const [prompt, correct, ds] = pick(r, WORD_ANALOGIES)
  return make(
    "Analogy",
    "easy",
    `Complete the analogy: ${prompt}`,
    `Apply the same relationship to the second pair, giving ${correct}.`,
    strChoices(r, correct, [...ds]),
  )
}

const SHIFT_WORDS_CODE = ["CAT", "DOG", "SUN", "BAT", "MAP", "PEN", "CUP", "BUS", "FOX", "RED", "TOP", "ICE"]
const gNumberCoding: Gen = (r) => {
  const word = pick(r, SHIFT_WORDS_CODE)
  const sum = word.split("").reduce((s, ch) => s + (ch.charCodeAt(0) - 64), 0)
  return make(
    "Coding-Decoding",
    "medium",
    `If A = 1, B = 2, ..., Z = 26, what is the code for '${word}' (sum of its letter values)?`,
    `${word.split("").map((ch) => `${ch}=${ch.charCodeAt(0) - 64}`).join(", ")}; the sum is ${sum}.`,
    numChoices(r, sum, [sum + 1, sum - 2, sum + 3]),
  )
}

const gRankingOrder: Gen = (r) => {
  const left = int(r, 3, 15)
  const right = int(r, 3, 15)
  const total = left + right - 1
  return make(
    "Ranking & Order",
    "medium",
    `In a row, a person is ${left}th from the left and ${right}th from the right. How many people are in the row?`,
    `Total = (position from left) + (position from right) - 1 = ${left} + ${right} - 1 = ${total}.`,
    numChoices(r, total, [left + right, total - 1, total + 1]),
  )
}

const ODD_WORDS: readonly [string[], string, string][] = [
  [["Rose", "Lotus", "Marigold", "Mango"], "Mango", "Mango is a fruit; the rest are flowers."],
  [["Cow", "Dog", "Lion", "Goat"], "Lion", "Lion is a wild animal; the rest are domestic animals."],
  [["Apple", "Banana", "Carrot", "Grapes"], "Carrot", "Carrot is a vegetable; the rest are fruits."],
  [["Triangle", "Square", "Circle", "Cube"], "Cube", "A cube is a 3-D solid; the rest are 2-D shapes."],
  [["Copper", "Iron", "Gold", "Plastic"], "Plastic", "Plastic is not a metal."],
  [["Eagle", "Sparrow", "Bat", "Parrot"], "Bat", "A bat is a mammal; the rest are birds."],
]
const gOddWordOut: Gen = (r) => {
  const [words, correct, why] = pick(r, ODD_WORDS)
  return make(
    "Classification",
    "easy",
    `Find the odd one out: ${words.join(", ")}`,
    why,
    strChoices(r, correct, words.filter((w) => w !== correct)),
  )
}

const STATEMENT_ASSUMPTIONS: readonly [string, string, string[]][] = [
  ["'Please submit the form before Friday.' Which assumption is implicit?", "The reader is able to submit the form by Friday.", ["Friday is a public holiday.", "Nobody reads notices.", "Forms are never required."]],
  ["'Use the app daily to save preparation time.' Which assumption is implicit?", "The app can actually save users time.", ["The app is free forever.", "No one prepares offline.", "Time cannot be measured."]],
  ["'Carry an umbrella; it may rain today.' Which assumption is implicit?", "An umbrella offers protection from rain.", ["It always rains here.", "Umbrellas are expensive.", "Rain is harmless."]],
]
const gStatementAssumption: Gen = (r) => {
  const [prompt, correct, ds] = pick(r, STATEMENT_ASSUMPTIONS)
  return make(
    "Statement & Assumption",
    "hard",
    prompt,
    `An implicit assumption is something taken for granted for the statement to make sense: ${correct}`,
    strChoices(r, correct, [...ds]),
  )
}

// ============================================================================
// VERBAL generators (expanded coverage)
// ============================================================================
const SPELLINGS: readonly [string, string[]][] = [
  ["Accommodation", ["Acommodation", "Accomodation", "Acomodation"]],
  ["Necessary", ["Neccessary", "Necesary", "Neccesary"]],
  ["Separate", ["Seperate", "Seperete", "Sepparate"]],
  ["Definitely", ["Definitly", "Definately", "Defenitely"]],
  ["Occurrence", ["Occurence", "Ocurrence", "Occurrance"]],
  ["Privilege", ["Priviledge", "Privelege", "Privilage"]],
  ["Maintenance", ["Maintainance", "Maintenence", "Maintanance"]],
  ["Embarrass", ["Embarass", "Embaras", "Embarras"]],
]
const gSpelling: Gen = (r) => {
  const [correct, ds] = pick(r, SPELLINGS)
  return make(
    "Spelling",
    "easy",
    "Choose the correctly spelt word:",
    `The correct spelling is '${correct}'.`,
    strChoices(r, correct, [...ds]),
  )
}

const IDIOMS: readonly [string, string, string[]][] = [
  ["'A piece of cake' means:", "Something very easy", ["A tasty dessert", "A small portion", "A celebration"]],
  ["'Break the ice' means:", "To start a conversation", ["To damage something", "To feel cold", "To win easily"]],
  ["'Hit the books' means:", "To study hard", ["To read fiction", "To give up", "To travel far"]],
  ["'Once in a blue moon' means:", "Very rarely", ["Every night", "Very often", "At midnight"]],
  ["'Burn the midnight oil' means:", "To work late into the night", ["To waste money", "To cook food", "To start a fire"]],
  ["'Bite the bullet' means:", "To endure something painful bravely", ["To eat quickly", "To get hurt", "To argue loudly"]],
  ["'Spill the beans' means:", "To reveal a secret", ["To cook a meal", "To make a mess", "To lose money"]],
]
const gIdiom: Gen = (r) => {
  const [prompt, correct, ds] = pick(r, IDIOMS)
  return make(
    "Idioms & Phrases",
    "medium",
    `The idiom ${prompt}`,
    `This idiom means: ${correct}.`,
    strChoices(r, correct, [...ds]),
  )
}

const ONE_WORDS: readonly [string, string, string[]][] = [
  ["One who cannot read or write", "Illiterate", ["Ignorant", "Innocent", "Immature"]],
  ["A person who eats everything", "Omnivore", ["Herbivore", "Carnivore", "Gourmet"]],
  ["A speech made without preparation", "Extempore", ["Lecture", "Monologue", "Debate"]],
  ["One who studies the stars and planets", "Astronomer", ["Astrologer", "Geologist", "Biologist"]],
  ["A medicine that kills germs", "Antiseptic", ["Antibiotic", "Vaccine", "Sedative"]],
  ["Words written on a tomb", "Epitaph", ["Epigram", "Epilogue", "Elegy"]],
  ["One who does not believe in God", "Atheist", ["Theist", "Agnostic", "Cynic"]],
]
const gOneWord: Gen = (r) => {
  const [prompt, correct, ds] = pick(r, ONE_WORDS)
  return make(
    "One-word Substitution",
    "medium",
    `Choose the single word for: ${prompt}.`,
    `The correct one-word substitution is '${correct}'.`,
    strChoices(r, correct, [...ds]),
  )
}

const PREPOSITIONS: readonly [string, string, string[]][] = [
  ["She is good ___ mathematics.", "at", ["in", "on", "with"]],
  ["He has been working here ___ 2019.", "since", ["for", "from", "by"]],
  ["The book is ___ the table.", "on", ["in", "at", "over"]],
  ["I will meet you ___ Monday.", "on", ["in", "at", "by"]],
  ["He is afraid ___ dogs.", "of", ["from", "with", "about"]],
  ["They arrived ___ the airport on time.", "at", ["in", "to", "on"]],
  ["He is interested ___ learning Python.", "in", ["on", "at", "for"]],
  ["She apologized ___ her mistake.", "for", ["of", "about", "on"]],
]
const gPreposition: Gen = (r) => {
  const [prompt, correct, ds] = pick(r, PREPOSITIONS)
  return make(
    "Prepositions",
    "medium",
    `Fill in the blank with the correct preposition: ${prompt}`,
    `The correct preposition here is '${correct}'.`,
    strChoices(r, correct, [...ds]),
  )
}

const ARTICLES: readonly [string, string, string[]][] = [
  ["___ honest man is respected by all.", "An", ["A", "The", "No article"]],
  ["She is ___ university student.", "A", ["An", "The", "No article"]],
  ["___ sun rises in the east.", "The", ["A", "An", "No article"]],
  ["He bought ___ umbrella yesterday.", "An", ["A", "The", "No article"]],
  ["I saw ___ one-eyed man.", "A", ["An", "The", "No article"]],
  ["Mount Everest is ___ highest peak.", "The", ["A", "An", "No article"]],
]
const gArticle: Gen = (r) => {
  const [prompt, correct, ds] = pick(r, ARTICLES)
  return make(
    "Articles",
    "easy",
    `Choose the correct article: ${prompt}`,
    `The correct article is '${correct}' (chosen by the opening sound, not just the spelling).`,
    strChoices(r, correct, [...ds]),
  )
}

const ERROR_SPOTS: readonly [string, string, string[]][] = [
  ["He don't like coffee.", "don't -> doesn't", ["He -> They", "like -> likes", "coffee -> coffees"]],
  ["She have completed the task.", "have -> has", ["She -> Her", "completed -> complete", "task -> tasks"]],
  ["The childrens are playing.", "childrens -> children", ["are -> is", "playing -> played", "The -> A"]],
  ["He is more taller than me.", "more taller -> taller", ["He -> Him", "than -> then", "me -> I"]],
  ["Each of the boys were present.", "were -> was", ["Each -> Every", "boys -> boy", "present -> presents"]],
]
const gErrorSpotting: Gen = (r) => {
  const [sentence, correct, ds] = pick(r, ERROR_SPOTS)
  return make(
    "Error Spotting",
    "hard",
    `Which correction fixes this sentence: '${sentence}'?`,
    `The grammatically correct fix is: ${correct}.`,
    strChoices(r, correct, [...ds]),
  )
}

const VOICE_ITEMS: readonly [string, string, string[]][] = [
  ["Active: 'She writes a letter.' Its passive form is:", "A letter is written by her.", ["A letter was written by her.", "A letter is being written by her.", "She is writing a letter."]],
  ["Active: 'They built a house.' Its passive form is:", "A house was built by them.", ["A house is built by them.", "A house has been built by them.", "They have built a house."]],
  ["Active: 'He will finish the work.' Its passive form is:", "The work will be finished by him.", ["The work is finished by him.", "The work was finished by him.", "He finishes the work."]],
]
const gActivePassive: Gen = (r) => {
  const [prompt, correct, ds] = pick(r, VOICE_ITEMS)
  return make(
    "Active & Passive Voice",
    "hard",
    prompt,
    `Make the object the new subject and keep the same tense of 'to be' + past participle: ${correct}`,
    strChoices(r, correct, [...ds]),
  )
}

// ============================================================================
// CODING generators (expanded coverage)
// ============================================================================
const gArraySum: Gen = (r) => {
  const arr = Array.from({ length: int(r, 4, 6) }, () => int(r, 1, 9))
  const sum = arr.reduce((a, b) => a + b, 0)
  return make(
    "Arrays",
    "easy",
    `What is the sum of the elements in the array {${arr.join(", ")}}?`,
    `Add every element: ${arr.join(" + ")} = ${sum}.`,
    numChoices(r, sum, [sum + arr[0], sum - 1, arr.length * 5]),
  )
}

const gArrayMax: Gen = (r) => {
  const arr = Array.from({ length: int(r, 4, 6) }, () => int(r, 5, 40))
  const mx = Math.max(...arr)
  return make(
    "Arrays",
    "easy",
    `What is the largest element in the array {${arr.join(", ")}}?`,
    `Scan the array keeping the running maximum, which ends at ${mx}.`,
    numChoices(r, mx, [Math.min(...arr), mx - 1, arr.reduce((a, b) => a + b, 0)]),
  )
}

const gStringReverse: Gen = (r) => {
  const w = pick(r, SHIFT_WORDS_CODE)
  const rev = w.split("").reverse().join("")
  return make(
    "Strings",
    "easy",
    `What is the reverse of the string "${w}"?`,
    `Read the characters from last to first: "${rev}".`,
    strChoices(r, rev, [w, w.slice(1) + w[0], w[0] + rev.slice(1)]),
  )
}

const ASCII_FACTS: readonly [string, number][] = [
  ["A", 65],
  ["Z", 90],
  ["a", 97],
  ["z", 122],
  ["0", 48],
  ["9", 57],
]
const gAscii: Gen = (r) => {
  const [ch, code] = pick(r, ASCII_FACTS)
  return make(
    "Characters & ASCII",
    "medium",
    `What is the ASCII value of the character '${ch}'?`,
    `The ASCII code of '${ch}' is ${code}.`,
    numChoices(r, code, [code + 1, code - 1, code + 32]),
  )
}

const SIZEOF_FACTS: readonly [string, number][] = [
  ["char", 1],
  ["int", 4],
  ["float", 4],
  ["double", 8],
  ["short", 2],
  ["long long", 8],
]
const gSizeof: Gen = (r) => {
  const [type, size] = pick(r, SIZEOF_FACTS)
  return make(
    "C Data Types",
    "medium",
    `On a typical system, what is sizeof(${type}) in bytes?`,
    `The usual size of ${type} on most systems is ${size} byte(s).`,
    numChoices(r, size, [size * 2, size + 1, size + 2]),
  )
}

const gModPrecedence: Gen = (r) => {
  const a = int(r, 2, 6)
  const b = int(r, 5, 9)
  const c = int(r, 2, 4)
  const correct = a + (b % c)
  return make(
    "Operators",
    "medium",
    `In C, what is the value of: ${a} + ${b} % ${c}?`,
    `% has higher precedence than +: ${b} % ${c} = ${b % c}, then ${a} + ${b % c} = ${correct}.`,
    numChoices(r, correct, [(a + b) % c, (a % c) + b, a + b]),
  )
}

const gTernary: Gen = (r) => {
  const a = int(r, 1, 20)
  let b = int(r, 1, 20)
  if (a === b) b += 1
  const correct = a > b ? a : b
  return make(
    "Operators",
    "easy",
    `In C, what does (${a} > ${b}) ? ${a} : ${b} evaluate to?`,
    `The condition ${a} > ${b} is ${a > b}, so the expression yields ${correct}.`,
    numChoices(r, correct, [a > b ? b : a, a + b, Math.abs(a - b)]),
  )
}

const FACTORIALS = [1, 1, 2, 6, 24, 120, 720]
const gFactorial: Gen = (r) => {
  const n = int(r, 3, 6)
  const f = FACTORIALS[n]
  return make(
    "Recursion",
    "medium",
    `What is ${n}! (the factorial of ${n})?`,
    `${n}! = ${Array.from({ length: n }, (_, i) => i + 1).join(" x ")} = ${f}.`,
    numChoices(r, f, [f - 1, f + n, FACTORIALS[n - 1]]),
  )
}

const FIBS = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
const gFibonacci: Gen = (r) => {
  const n = int(r, 5, 10)
  return make(
    "Recursion",
    "medium",
    `In the Fibonacci sequence with F(0)=0 and F(1)=1, what is F(${n})?`,
    `F(${n}) = F(${n - 1}) + F(${n - 2}) = ${FIBS[n - 1]} + ${FIBS[n - 2]} = ${FIBS[n]}.`,
    numChoices(r, FIBS[n], [FIBS[n - 1], FIBS[n + 1], FIBS[n] + 1]),
  )
}

const gGcdCode: Gen = (r) => {
  const a = pick(r, [12, 18, 24, 36, 48, 60])
  const b = pick(r, [8, 16, 20, 30, 42, 54])
  const g = gcd(a, b)
  return make(
    "Recursion",
    "medium",
    `What does the Euclidean algorithm gcd(${a}, ${b}) return?`,
    `Repeatedly replace (a, b) with (b, a mod b) until b is 0: gcd(${a}, ${b}) = ${g}.`,
    numChoices(r, g, [g * 2, Math.abs(a - b), g + 1]),
  )
}

const gBinaryToDecimal: Gen = (r) => {
  const n = int(r, 5, 60)
  const bin = n.toString(2)
  return make(
    "Number Systems",
    "medium",
    `What is the decimal value of the binary number ${bin}?`,
    `Add the place values of the 1-bits in ${bin} to get ${n}.`,
    numChoices(r, n, [n + 1, n - 1, n + 2]),
  )
}

const gDecimalToBinary: Gen = (r) => {
  const n = int(r, 5, 30)
  const bin = n.toString(2)
  return make(
    "Number Systems",
    "medium",
    `What is the binary representation of decimal ${n}?`,
    `Divide ${n} by 2 repeatedly and read the remainders from bottom to top: ${bin}.`,
    strChoices(r, bin, [(n + 1).toString(2), (n - 1).toString(2), (n * 2).toString(2)]),
  )
}

const gStackOps: Gen = (r) => {
  const a = int(r, 1, 9)
  let b = int(r, 1, 9)
  if (b === a) b = (b % 9) + 1
  let c = int(r, 1, 9)
  if (c === a || c === b) c = (c % 9) + 1
  return make(
    "Stacks",
    "medium",
    `A stack starts empty. After push(${a}), push(${b}), pop(), push(${c}), which element is on top?`,
    `Push ${a} then ${b}; pop removes ${b}; push ${c}. The top is now ${c}.`,
    numChoices(r, c, [b, a, c + 1]),
  )
}

const gQueueOps: Gen = (r) => {
  const a = int(r, 1, 9)
  let b = int(r, 1, 9)
  if (b === a) b = (b % 9) + 1
  let c = int(r, 1, 9)
  if (c === a || c === b) c = (c % 9) + 1
  return make(
    "Queues",
    "medium",
    `A queue starts empty. After enqueue(${a}), enqueue(${b}), dequeue(), enqueue(${c}), which element is at the front?`,
    `A queue is FIFO. Dequeue removes ${a}, so the front element is now ${b}.`,
    numChoices(r, b, [a, c, b + 1]),
  )
}

// ============================================================================
// CS-CORE generators (expanded coverage)
// ============================================================================
const SQL_FACTS: readonly [string, string, string[]][] = [
  ["Which SQL command adds a new row to a table?", "INSERT", ["UPDATE", "SELECT", "ALTER"]],
  ["Which SQL command changes existing data in a row?", "UPDATE", ["INSERT", "DROP", "SELECT"]],
  ["Which SQL command removes an entire table including its structure?", "DROP", ["DELETE", "TRUNCATE", "REMOVE"]],
  ["Which clause sorts the rows returned by a query?", "ORDER BY", ["GROUP BY", "WHERE", "HAVING"]],
  ["Which JOIN returns only the rows that match in both tables?", "INNER JOIN", ["LEFT JOIN", "FULL JOIN", "CROSS JOIN"]],
  ["Which aggregate function counts the number of rows?", "COUNT()", ["SUM()", "MAX()", "AVG()"]],
  ["Which command removes all rows but keeps the empty table?", "TRUNCATE", ["DELETE", "DROP", "CLEAR"]],
]
const gSqlConcept: Gen = (r) => {
  const [prompt, correct, ds] = pick(r, SQL_FACTS)
  return make("SQL", "medium", prompt, `The correct command or clause is ${correct}.`, strChoices(r, correct, [...ds]))
}

const OS_FACTS: readonly [string, string, string[]][] = [
  ["Which CPU scheduling algorithm gives each process a fixed time slice in turn?", "Round Robin", ["FCFS", "SJF", "Priority"]],
  ["What is the small, fast memory placed between the CPU and main memory?", "Cache", ["Register", "Disk", "ROM"]],
  ["Two processes each waiting forever for a resource the other holds is called:", "Deadlock", ["Starvation", "Aging", "Paging"]],
  ["Which memory-management technique splits memory into fixed-size pages?", "Paging", ["Segmentation", "Swapping", "Caching"]],
  ["The smallest unit of execution within a process is a:", "Thread", ["Kernel", "Daemon", "Socket"]],
  ["The core part of the OS that always stays in memory is the:", "Kernel", ["Shell", "Compiler", "Driver"]],
]
const gOsConcept: Gen = (r) => {
  const [prompt, correct, ds] = pick(r, OS_FACTS)
  return make("Operating Systems", "medium", prompt, `The correct answer is ${correct}.`, strChoices(r, correct, [...ds]))
}

const NET_FACTS: readonly [string, string, string[]][] = [
  ["Which port does HTTP use by default?", "80", ["443", "21", "25"]],
  ["Which port does HTTPS use by default?", "443", ["80", "8080", "22"]],
  ["Which port does SSH use?", "22", ["23", "21", "443"]],
  ["Which port does FTP use for control?", "21", ["20", "80", "53"]],
  ["Which device forwards packets between different networks?", "Router", ["Switch", "Hub", "Repeater"]],
  ["Which protocol assigns IP addresses to hosts automatically?", "DHCP", ["DNS", "ARP", "FTP"]],
  ["Which protocol maps an IP address to a MAC address?", "ARP", ["DNS", "DHCP", "ICMP"]],
  ["How many bits are there in an IPv4 address?", "32", ["64", "128", "16"]],
]
const gNetConcept: Gen = (r) => {
  const [prompt, correct, ds] = pick(r, NET_FACTS)
  return make("Networks", "medium", prompt, `The correct answer is ${correct}.`, strChoices(r, correct, [...ds]))
}

const OOP_FACTS: readonly [string, string, string[]][] = [
  ["Which OOP concept lets one interface take many forms?", "Polymorphism", ["Encapsulation", "Abstraction", "Inheritance"]],
  ["Which concept lets a class reuse the members of a parent class?", "Inheritance", ["Polymorphism", "Encapsulation", "Overloading"]],
  ["Which concept hides internal details and exposes only essentials?", "Abstraction", ["Inheritance", "Recursion", "Composition"]],
  ["Defining several methods with the same name but different parameters is:", "Overloading", ["Overriding", "Hiding", "Shadowing"]],
  ["Redefining a parent's method in a child class is:", "Overriding", ["Overloading", "Encapsulation", "Casting"]],
  ["A blueprint from which objects are created is a:", "Class", ["Object", "Method", "Package"]],
]
const gOopConcept: Gen = (r) => {
  const [prompt, correct, ds] = pick(r, OOP_FACTS)
  return make("OOP", "medium", prompt, `The correct answer is ${correct}.`, strChoices(r, correct, [...ds]))
}

const HTTP_FACTS: readonly [string, string, string[]][] = [
  ["Which HTTP status code means 'Not Found'?", "404", ["200", "500", "301"]],
  ["Which HTTP status code means a successful request?", "200", ["404", "403", "302"]],
  ["Which HTTP status code means an internal server error?", "500", ["400", "404", "301"]],
  ["Which HTTP status code means a permanent redirect?", "301", ["302", "200", "404"]],
  ["Which HTTP status code means 'Forbidden'?", "403", ["401", "404", "500"]],
  ["Which HTTP status code means 'Unauthorized'?", "401", ["403", "400", "407"]],
]
const gHttpStatus: Gen = (r) => {
  const [prompt, correct, ds] = pick(r, HTTP_FACTS)
  return make("Web & HTTP", "medium", prompt, `The correct status code is ${correct}.`, strChoices(r, correct, [...ds]))
}

const PY_FACTS: readonly [string, string, string[]][] = [
  ["Which Python type is ordered and immutable?", "Tuple", ["List", "Set", "Dictionary"]],
  ["Which Python type stores key-value pairs?", "Dictionary", ["List", "Tuple", "Set"]],
  ["Which Python type stores unique, unordered elements?", "Set", ["List", "Tuple", "Dictionary"]],
  ["What does len([]) return for an empty list?", "0", ["1", "None", "Error"]],
  ["Which keyword defines a function in Python?", "def", ["function", "func", "define"]],
  ["What is the result type of 7 // 2 in Python 3?", "int", ["float", "str", "bool"]],
]
const gPythonConcept: Gen = (r) => {
  const [prompt, correct, ds] = pick(r, PY_FACTS)
  return make("Python", "easy", prompt, `The correct answer is ${correct}.`, strChoices(r, correct, [...ds]))
}

const DS_CHOICE_FACTS: readonly [string, string, string[]][] = [
  ["Which data structure best implements undo functionality?", "Stack", ["Queue", "Array", "Tree"]],
  ["Which data structure best models a first-come-first-served print queue?", "Queue", ["Stack", "Heap", "Graph"]],
  ["Which data structure gives O(1) average lookup by key?", "Hash table", ["Linked list", "Array", "Binary tree"]],
  ["Which data structure naturally represents a file-system hierarchy?", "Tree", ["Queue", "Stack", "Hash table"]],
  ["Which data structure best models a road network for shortest paths?", "Graph", ["Stack", "Array", "Heap"]],
  ["Which data structure returns the minimum or maximum in O(1)?", "Heap", ["Array", "Queue", "Linked list"]],
]
const gDataStructureChoice: Gen = (r) => {
  const [prompt, correct, ds] = pick(r, DS_CHOICE_FACTS)
  return make("Data Structures", "medium", prompt, `The correct choice is ${correct}.`, strChoices(r, correct, [...ds]))
}

// ============================================================================
// COMM-INTERVIEW generators (expanded coverage)
// ============================================================================
const RESUME_ITEMS: readonly [string, string, string[]][] = [
  ["Which resume bullet is strongest for a fresher?", "Built a REST API in Node.js that cut response time by 30%.", ["Knows many programming languages.", "Hardworking and dedicated team player.", "Did various tasks in the project."]],
  ["What should a fresher's resume lead with?", "Skills, projects and internships relevant to the role.", ["Hobbies and personal details.", "A long career-objective paragraph.", "Marks from primary school."]],
  ["How should you describe a group project on a resume?", "State your specific role, the challenge and a measurable result.", ["Say the whole team did everything together.", "List only the tools used.", "Mention only the final grade."]],
]
const gResumeTip: Gen = (r) => {
  const [prompt, correct, ds] = pick(r, RESUME_ITEMS)
  return make(
    "Resume",
    "medium",
    prompt,
    `Recruiters reward specific, quantified, role-relevant evidence: ${correct}`,
    strChoices(r, correct, [...ds]),
  )
}

const EMAIL_ITEMS: readonly [string, string, string[]][] = [
  ["What makes an email subject line effective for a recruiter?", "It is short, specific and states the purpose.", ["It is left blank.", "It is written in all capitals.", "It uses slang and emojis."]],
  ["How should you begin a formal email to a recruiter?", "With a polite greeting and the person's name if known.", ["With 'Hey' and no name.", "With your demands first.", "With no greeting at all."]],
  ["What should you do before sending a job-application email?", "Proofread for grammar and attach the correct resume.", ["Send it without reading it.", "Use many fonts and colours.", "Add several exclamation marks."]],
]
const gEmailEtiquette: Gen = (r) => {
  const [prompt, correct, ds] = pick(r, EMAIL_ITEMS)
  return make(
    "Professional Communication",
    "medium",
    prompt,
    `Professional email habits build trust: ${correct}`,
    strChoices(r, correct, [...ds]),
  )
}

const GD_ITEMS: readonly [string, string, string[]][] = [
  ["In a group discussion, what is the best way to disagree?", "Acknowledge the point, then offer a reasoned counter-view.", ["Interrupt loudly and dismiss them.", "Stay silent for the whole GD.", "Just repeat your point louder."]],
  ["How can you enter a fast-moving group discussion?", "Wait for a brief pause, then add a concise, relevant point.", ["Shout over everyone.", "Wait until the GD ends.", "Only agree with the loudest person."]],
  ["What gets you noticed positively in a GD?", "Clear points backed by examples plus good listening.", ["Speaking the most regardless of content.", "Using complex jargon.", "Dominating and not letting others speak."]],
]
const gGdStrategy: Gen = (r) => {
  const [prompt, correct, ds] = pick(r, GD_ITEMS)
  return make(
    "Group Discussion",
    "medium",
    prompt,
    `GD evaluators reward clarity, reasoning and teamwork: ${correct}`,
    strChoices(r, correct, [...ds]),
  )
}

// ============================================================================
// EXTRA HARD generators (large parametric spaces) for sections that were short
// on unique hard questions — keeps the 10/40/40 difficulty target reachable.
// ============================================================================
// ---- CODING (hard) ----
const gNestedLoopCountHard: Gen = (r) => {
  const n = int(r, 5, 44)
  const total = (n * (n - 1)) / 2
  return make(
    "Loops",
    "hard",
    `How many times does the inner statement run?  for(i=0;i<${n};i++) for(j=0;j<i;j++) count++;`,
    `The inner loop runs 0 + 1 + ... + ${n - 1} = ${n} x ${n - 1} / 2 = ${total} times.`,
    numChoices(r, total, [n * n, (n * (n + 1)) / 2, total + n]),
  )
}

const gBitCountHard: Gen = (r) => {
  const x = int(r, 5, 250)
  const bin = x.toString(2)
  const bits = bin.split("").filter((c) => c === "1").length
  return make(
    "Bit Manipulation",
    "hard",
    `How many set bits (1s) are in the binary representation of ${x}?`,
    `${x} in binary is ${bin}, which contains ${bits} one(s).`,
    numChoices(r, bits, [bits + 1, Math.max(0, bits - 1), bin.length]),
  )
}

const gRecurrencePowerHard: Gen = (r) => {
  const n = int(r, 3, 12)
  const val = 2 ** n - 1
  return make(
    "Recursion",
    "hard",
    `If f(0)=0 and f(n)=2*f(n-1)+1, what is f(${n})?`,
    `This recurrence equals 2^n - 1, so f(${n}) = 2^${n} - 1 = ${val}.`,
    numChoices(r, val, [2 ** n, val - 1, 2 ** (n - 1) - 1]),
  )
}

const gDecimalToHexHard: Gen = (r) => {
  const x = int(r, 30, 255)
  const hex = x.toString(16).toUpperCase()
  return make(
    "Number Systems",
    "hard",
    `What is the hexadecimal representation of decimal ${x}?`,
    `Divide by 16 and read remainders: ${x} = ${hex} in hexadecimal.`,
    strChoices(r, hex, [
      (x + 1).toString(16).toUpperCase(),
      (x - 1).toString(16).toUpperCase(),
      (x + 16).toString(16).toUpperCase(),
    ]),
  )
}

const gMatrixIndexHard: Gen = (r) => {
  const rows = int(r, 3, 6)
  const cols = int(r, 3, 6)
  const i = int(r, 0, rows - 1)
  const j = int(r, 0, cols - 1)
  const idx = i * cols + j
  return make(
    "Arrays",
    "hard",
    `In a ${rows}x${cols} matrix stored in row-major order (0-indexed), what is the linear index of element [${i}][${j}]?`,
    `Index = row x columns + col = ${i} x ${cols} + ${j} = ${idx}.`,
    numChoices(r, idx, [j * rows + i, i * rows + j, idx + 1]),
  )
}

const gSwapNoTempHard: Gen = (r) => {
  const a = int(r, 1, 20)
  let b = int(r, 1, 20)
  if (b === a) b = (b % 20) + 1
  return make(
    "Operators",
    "hard",
    `Given a=${a}, b=${b}, after the statements a=a+b; b=a-b; a=a-b; the value of a is:`,
    `This swaps the two values without a temporary, so a takes the old value of b = ${b}.`,
    numChoices(r, b, [a, a + b, Math.abs(a - b)]),
  )
}

// ---- REASONING (hard) ----
const gAnalogyNumberHard: Gen = (r) => {
  const a = int(r, 2, 12)
  const b = int(r, 2, 12)
  const ans = b * b + 1
  return make(
    "Analogy",
    "hard",
    `${a} : ${a * a + 1} :: ${b} : ?`,
    `The pattern is n -> n^2 + 1, so ${b} -> ${b * b + 1}.`,
    numChoices(r, ans, [b * b, b * b + 2, (b + 1) ** 2]),
  )
}

const gSeriesSecondOrderHard: Gen = (r) => {
  const start = int(r, 1, 9)
  const d1 = int(r, 2, 6)
  const terms = [start]
  for (let k = 0; k < 4; k++) terms.push(terms[k] + d1 + k)
  const next = terms[4] + d1 + 4
  return make(
    "Series",
    "hard",
    `Find the next term: ${terms.join(", ")}, ?`,
    `The gaps grow by 1 each step (${d1}, ${d1 + 1}, ${d1 + 2}, ...). The next gap is ${d1 + 4}, so ${terms[4]} + ${d1 + 4} = ${next}.`,
    numChoices(r, next, [terms[4] + d1, next + 1, next - 2]),
  )
}

const gClockMinuteAngleHard: Gen = (r) => {
  const h = int(r, 1, 12)
  const m = pick(r, [0, 10, 20, 30, 40])
  const raw = Math.abs(30 * h - 5.5 * m)
  const angle = raw > 180 ? 360 - raw : raw
  return make(
    "Clocks",
    "hard",
    `What is the angle between the hour and minute hands at ${h}:${String(m).padStart(2, "0")}?`,
    `Angle = |30H - 5.5M| = |30 x ${h} - 5.5 x ${m}| = ${raw}${raw > 180 ? `, then 360 - ${raw} = ${angle}` : ""} degrees.`,
    numChoices(r, angle, [angle + 5, Math.abs(angle - 10), angle + 15], (n) => `${n} degrees`),
  )
}

const RIGHT_TRIPLES: readonly [number, number, number][] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [9, 12, 15],
  [8, 15, 17],
  [12, 16, 20],
]
const gDistanceDirectionHard: Gen = (r) => {
  const [x, y, h] = pick(r, RIGHT_TRIPLES)
  return make(
    "Direction Sense",
    "hard",
    `A person walks ${x} km north, then turns and walks ${y} km east. How far is she from the starting point?`,
    `Straight-line distance = sqrt(${x}^2 + ${y}^2) = sqrt(${x * x + y * y}) = ${h} km.`,
    numChoices(r, h, [x + y, h + 1, Math.abs(x - y) + h], (n) => `${n} km`),
  )
}

// ============================================================================
// Registry & public API
// ============================================================================
const GEN_BY_SECTION: Record<SectionId, Gen[]> = {
  quant: [gPercentOf, gProfit, gSI, gRatio, gAverage, gSpeed, gWork, gUnitDigit, gPercentChangeHard, gWeightedAverageHard, gMixtureHard, gPermutationHard, gHcf, gLcm, gAge, gCompoundInterest, gPartnership, gPipes, gBoatStream, gTrainPole, gProbability, gSimplification, gNumFactors, gRemainder, gAreaRect, gAreaTriangle, gAreaCircle, gVolumeCuboid, gDiscount, gAverageReplace, gCalendarDay, gClockAngle],
  reasoning: [gSeriesArith, gSeriesGeo, gDirection, gCodingShift, gOddOneOut, gSeatingGapHard, gDataSufficiencyHard, gSeatingArrangementHard, gSyllogismHard, gBloodRelation, gSeriesSquares, gSeriesCubes, gSeriesMultiplyAdd, gLetterSeries, gAnalogyNumber, gWordAnalogy, gNumberCoding, gRankingOrder, gOddWordOut, gStatementAssumption, gAnalogyNumberHard, gSeriesSecondOrderHard, gClockMinuteAngleHard, gDistanceDirectionHard],
  verbal: [gSynonym, gAntonym, gRcInferenceHard, gParaJumbleHard, gSentenceCorrectionHard, gCriticalReasoningHard, gSpelling, gIdiom, gOneWord, gPreposition, gArticle, gErrorSpotting, gActivePassive],
  coding: [gMod, gIntDiv, gBitwise, gLoopCount, gPower, gComplexity, gEdgeCaseHard, gOptimizationHard, gTraceRecursionHard, gSlidingWindowHard, gArraySum, gArrayMax, gStringReverse, gAscii, gSizeof, gModPrecedence, gTernary, gFactorial, gFibonacci, gGcdCode, gBinaryToDecimal, gDecimalToBinary, gStackOps, gQueueOps, gNestedLoopCountHard, gBitCountHard, gRecurrencePowerHard, gDecimalToHexHard, gMatrixIndexHard, gSwapNoTempHard],
  "cs-core": [gCsFact, gSecurityCloudHard, gDbmsHard, gOsNetworksHard, gSqlConcept, gOsConcept, gNetConcept, gOopConcept, gHttpStatus, gPythonConcept, gDataStructureChoice],
  "comm-interview": [gInterviewScenario, gCommunicationClarity, gResumeTip, gEmailEtiquette, gGdStrategy],
}

const ALL_GENS: Gen[] = Object.values(GEN_BY_SECTION).flat()

export type DrillSection = SectionId | "mixed"

export const DRILL_SECTIONS: { id: DrillSection; label: string }[] = [
  { id: "mixed", label: "Mixed" },
  { id: "quant", label: "Quantitative" },
  { id: "reasoning", label: "Reasoning" },
  { id: "verbal", label: "Verbal" },
  { id: "coding", label: "Coding" },
  { id: "cs-core", label: "CS Core" },
  { id: "comm-interview", label: "Communication & Interview" },
]

/**
 * Generate `count` fresh, computed questions for a section (or mixed).
 * `seed` makes a set reproducible (e.g. seed by day for daily challenges).
 */
export function generateDrills(
  section: DrillSection,
  count: number,
  seed: number = Date.now(),
): Question[] {
  const r = mulberry32(seed)
  const gens = section === "mixed" ? ALL_GENS : GEN_BY_SECTION[section]
  if (!gens || gens.length === 0) return []
  const out: Question[] = []
  const usedPrompts = new Set<string>()
  let attempts = 0
  while (out.length < count && attempts < count * 80) {
    attempts += 1
    const g = gens[Math.floor(r() * gens.length)]
    const next = g(r)
    const promptKey = next.prompt.trim().toLowerCase()
    if (usedPrompts.has(promptKey)) continue
    usedPrompts.add(promptKey)
    out.push({ ...next, id: `gen-${section}-${seed}-${out.length}` })
  }

  while (out.length < count) {
    const g = gens[out.length % gens.length]
    const next = g(r)
    const prompt = `Practice variant ${out.length + 1}: ${next.prompt}`
    const promptKey = prompt.trim().toLowerCase()
    if (usedPrompts.has(promptKey)) continue
    usedPrompts.add(promptKey)
    out.push({
      ...next,
      id: `gen-${section}-${seed}-variant-${out.length}`,
      prompt,
      explanation: next.explanation,
    })
  }
  return out
}

export function generateDrillsByDifficulty(
  section: DrillSection,
  count: number,
  difficulty: Question["difficulty"],
  seed: number = Date.now(),
): Question[] {
  const r = mulberry32(seed)
  const gens = section === "mixed" ? ALL_GENS : GEN_BY_SECTION[section]
  if (!gens || gens.length === 0) return []

  const out: Question[] = []
  const usedPrompts = new Set<string>()
  let attempts = 0
  while (out.length < count && attempts < count * 160) {
    attempts += 1
    const g = gens[Math.floor(r() * gens.length)]
    const next = g(r)
    if (next.difficulty !== difficulty) continue
    const promptKey = next.prompt.trim().toLowerCase()
    if (usedPrompts.has(promptKey)) continue
    usedPrompts.add(promptKey)
    out.push({ ...next, id: `gen-${section}-${difficulty}-${seed}-${out.length}` })
  }

  while (out.length < count) {
    const batch = generateDrills(section, count * 2, seed + out.length + 1)
    const match = batch.find((question) => {
      const key = question.prompt.trim().toLowerCase()
      return question.difficulty === difficulty && !usedPrompts.has(key)
    })
    if (!match) break
    usedPrompts.add(match.prompt.trim().toLowerCase())
    out.push({ ...match, id: `gen-${section}-${difficulty}-${seed}-fill-${out.length}` })
  }

  return out
}

/** A stable daily seed (yyyymmdd) so a given day's set is consistent. */
export function todaySeed(): number {
  return Number(new Date().toISOString().slice(0, 10).replace(/-/g, ""))
}



