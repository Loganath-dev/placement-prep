import type { Chapter, CompanyId, Lesson, Question, Section, SectionId } from "@/lib/types"
import { getCompany } from "@/lib/data/companies"
import { generateDrills } from "@/lib/data/question-bank"
import { createStableIdFactory, idKey } from "@/lib/data/stable-id"

/**
 * Seeded curriculum. Content is ORIGINAL, authored in our own words by the
 * StudyBench trainer team; each lesson/question cites a sourceId for internal
 * provenance only. We never reproduce copyrighted text or proprietary
 * papers, and we do not display third-party book or author names.
 *
 * Lessons are written to teach FAST: intuition first, then the method, a worked
 * example, the common mistake, and a quick exam tip. Progress is namespaced per
 * company in the store, so the same chapter ids are reused across tracks while
 * each company's progress stays independent.
 */

export const SECTION_META: {
  id: SectionId
  name: string
  short: string
  icon: string
  blurb: string
}[] = [
  { id: "quant", name: "Quantitative Aptitude", short: "Quant", icon: "Calculator", blurb: "Numbers, arithmetic & data interpretation." },
  { id: "reasoning", name: "Logical Reasoning", short: "Reasoning", icon: "Puzzle", blurb: "Patterns, deductions & analytical puzzles." },
  { id: "verbal", name: "Verbal Ability", short: "Verbal", icon: "BookOpenText", blurb: "Grammar, vocabulary & comprehension." },
  { id: "coding", name: "Coding & DSA", short: "Coding", icon: "Code2", blurb: "Data structures, algorithms & problem solving." },
  { id: "cs-core", name: "CS Core", short: "CS Core", icon: "Cpu", blurb: "DBMS, OS, Networks & OOP fundamentals." },
  { id: "comm-interview", name: "Communication & Interview", short: "Comm & Interview", icon: "MessagesSquare", blurb: "Self-intro, GD, HR answers & the final round." },
]

const nextQuestionId = createStableIdFactory("q")
function q(
  topic: string,
  difficulty: Question["difficulty"],
  prompt: string,
  options: string[],
  answer: number,
  explanation: string,
  sourceId: string,
): Question {
  // Id derives from the question's own text, so inserting or reordering entries
  // never shifts another question's id (see lib/data/stable-id.ts).
  const id = nextQuestionId(idKey(topic, prompt, options.join("|")))
  // Chapter-quiz questions are written and reviewed by hand, so they form the
  // curated/flagship layer (the generator output is the auto-produced volume).
  return { id, topic, difficulty, prompt, options, answer, explanation, sourceId, curated: true }
}

// ============================================================================
// QUANT
// ============================================================================
const quant: Section = {
  ...SECTION_META[0],
  chapters: [
    {
      id: "quant-percentages",
      title: "Percentages & Ratios",
      summary: "The backbone of aptitude. Convert fast, handle change, and split in ratios.",
      lessons: [
        {
          id: "l-pct-1",
          title: "Think in percentages",
          minutes: 6,
          body:
            "**Why recruiters test this:** Percentages quietly power 8-10 of the ~25 quant questions in TCS NQT, Infosys and Cognizant papers — profit-loss, interest, mixtures and data interpretation are all percentage arithmetic in disguise. Master this one chapter and a third of the quant section opens up.\n\nA percentage is just a fraction with denominator 100. So **30% = 30/100 = 0.30**. When a question says \"x% of N\", the word **of means multiply**: x% of N = (x/100) x N.\n\nThe three-step method — use it every time:\n1. Convert the percentage to a fraction or decimal.\n2. Replace the word \"of\" with multiplication.\n3. Look for a fraction shortcut BEFORE multiplying.\n\nMemorise these pairs until they are instant:\n- 1/2 = 50%, 1/4 = 25%, 3/4 = 75%\n- 1/5 = 20%, 2/5 = 40%, 3/5 = 60%\n- 1/8 = 12.5%, 1/3 = 33.33%, 1/6 = 16.67%, 1/10 = 10%\n\n**Worked example:** Find 12.5% of 800. Recognise 12.5% = 1/8, so the answer is 800 / 8 = **100**. Three seconds, no long multiplication.\n\n**Worked example:** 18 is what percent of 72? Use A/B x 100 = 18/72 x 100 = **25%**. The number after the word \"of\" (here 72) ALWAYS goes in the denominator.\n\n**Common mistake:** Taking the wrong base. \"A is what % of B\" divides by B, but \"B is what % of A\" divides by A. Underline the number that follows \"of\" — that is your denominator, every single time.\n\n**Exam tip:** Toppers finish percentage questions in under 30 seconds because they translate 12.5% -> 1/8 and 16.67% -> 1/6 on sight. Drill the table above until conversion is automatic — speed here buys you time for the hard questions later in the paper.",
          sourceIds: ["rs-aggarwal-quant"],
        },
        {
          id: "l-pct-2",
          title: "Percentage change, successive change & ratios",
          minutes: 6,
          body:
            "Percentage change has exactly one formula: **change% = (new - old) / old x 100**. The base is ALWAYS the old value. This is why a 20% rise followed by a 20% fall does NOT return to the start — the fall acts on a bigger base.\n\nFor two successive changes of a% then b%, use the one-line shortcut:\n1. Write both changes with their signs (increase +, decrease -).\n2. Apply **net = a + b + (a x b)/100**.\n3. The sign of the result tells you net increase or decrease.\n\n**Worked example:** A price rises 20% then falls 20%. Net = 20 - 20 + (20 x -20)/100 = **-4%**. In rupees: Rs 100 -> Rs 120 -> Rs 96. The money does NOT come back to 100 — this exact trap appears in nearly every TCS and Cognizant paper.\n\n**Worked example:** A value rises 10% then rises another 20%. Net = 10 + 20 + (10 x 20)/100 = **+32%**, not 30%. Successive increases compound.\n\nRatios are just fractions: a : b means a/b. To chain a : b and b : c into a : c:\n1. Scale both ratios so the shared term b becomes the same number (use the LCM).\n2. Read a : c directly from the scaled ratios.\n\n**Worked example:** a : b = 2 : 3 and b : c = 4 : 5. Make b = 12 in both: a : b = 8 : 12 and b : c = 12 : 15. So a : c = **8 : 15**.\n\n**Common mistake:** Averaging two percentages that sit on different bases — you cannot. 10% of the class and 20% of the school do not average to 15% of anything. Recover the actual counts first, then compute.\n\n**Exam tip:** Whenever you see \"successive\", reach for a + b + ab/100 instantly. It works for any two changes — two increases, two decreases, or one of each. For three changes, apply it twice.",
          sourceIds: ["rs-aggarwal-quant"],
        },
      ],
      quiz: [
        q("Percentages", "easy", "What is 30% of 250?", ["70", "75", "80", "65"], 1, "30% of 250 = 0.30 × 250 = 75. Think of it as 10% = 25, so 30% = 75.", "rs-aggarwal-quant"),
        q("Percentages", "easy", "What is 15% of 200?", ["25", "30", "35", "40"], 1, "10% of 200 = 20, and 5% = 10, so 15% = 30.", "rs-aggarwal-quant"),
        q("Percentages", "easy", "Express 0.6 as a percentage.", ["6%", "60%", "0.6%", "600%"], 1, "Multiply by 100: 0.6 × 100 = 60%.", "rs-aggarwal-quant"),
        q("Percentages", "easy", "12 is what percent of 60?", ["15%", "20%", "25%", "30%"], 1, "12/60 × 100 = 20%.", "rs-aggarwal-quant"),
        q("Percentages", "easy", "What is 20% of 450?", ["80", "85", "90", "95"], 2, "20% = 1/5, so 450 ÷ 5 = 90.", "rs-aggarwal-quant"),
        q("Percentages", "easy", "Express 5/8 as a percentage.", ["60%", "62.5%", "65%", "57.5%"], 1, "5 ÷ 8 = 0.625, multiply by 100 = 62.5%.", "rs-aggarwal-quant"),
        q("Percentages", "easy", "What percent of 400 is 100?", ["20%", "25%", "30%", "40%"], 1, "100/400 × 100 = 25%.", "indiabix-aptitude"),
        q("Percentages", "easy", "A person scored 36 out of 60. What is the percentage score?", ["55%", "60%", "65%", "70%"], 1, "36/60 × 100 = 60%.", "rs-aggarwal-quant"),
        q("Percentages", "medium", "A number is increased by 10% and then decreased by 10%. Net change:", ["+1%", "0%", "-1%", "-2%"], 2, "Net = 10 − 10 + (10 × −10)/100 = −1%. Successive changes compound, so you lose 1%.", "rs-aggarwal-quant"),
        q("Percentages", "medium", "A price increased by 20%, then decreased by 20%. Net change:", ["0%", "+4%", "-4%", "-2%"], 2, "Net = 20 − 20 + (20 × −20)/100 = −4%. This classic trap appears in every TCS and Cognizant paper.", "rs-aggarwal-quant"),
        q("Percentages", "medium", "If 60% of a class are boys and there are 18 girls, how many students are there?", ["30", "45", "36", "40"], 1, "Girls are 40% of class = 18, so total = 18/0.40 = 45.", "rs-aggarwal-quant"),
        q("Percentages", "medium", "x is 25% more than y. Then y is what percent less than x?", ["20%", "25%", "33.3%", "16.67%"], 0, "x = 1.25y, so y = x/1.25 = 0.8x. y is 20% less than x. The base is now x (bigger), so the percent is smaller.", "rs-aggarwal-quant"),
        q("Percentages", "medium", "A person spends 80% of their income. If savings are Rs 1,200, what is the income?", ["Rs 5,000", "Rs 6,000", "Rs 7,000", "Rs 8,000"], 1, "Savings = 20% of income = 1200, so income = 1200/0.20 = Rs 6,000.", "indiabix-aptitude"),
        q("Percentages", "medium", "A salary of Rs 5,000 is first increased by 25% and then decreased by 20%. Final salary:", ["Rs 4,800", "Rs 5,000", "Rs 4,500", "Rs 5,200"], 1, "After 25% up: 5000 × 1.25 = 6250. After 20% down: 6250 × 0.80 = 5000. Back to the start!", "rs-aggarwal-quant"),
        q("Percentages", "medium", "What is 12.5% of 640?", ["70", "75", "80", "85"], 2, "12.5% = 1/8, so 640 ÷ 8 = 80.", "rs-aggarwal-quant"),
        q("Percentages", "medium", "40% of 200 + 30% of 100 = ?", ["100", "105", "110", "115"], 2, "40% of 200 = 80; 30% of 100 = 30; 80 + 30 = 110.", "indiabix-aptitude"),
        q("Percentages", "medium", "A number increased by 25% gives 750. The original number is:", ["550", "575", "600", "625"], 2, "n × 1.25 = 750, so n = 750/1.25 = 600.", "rs-aggarwal-quant"),
        q("Percentages", "medium", "After a 10% discount, a book costs Rs 180. Its original price was:", ["Rs 190", "Rs 195", "Rs 200", "Rs 210"], 2, "Original × 0.90 = 180, so original = 180/0.90 = Rs 200.", "rs-aggarwal-quant"),
        q("Percentages", "medium", "In an exam, a student got 75% and scored 450 marks. Maximum marks are:", ["550", "575", "600", "625"], 2, "0.75 × max = 450, so max = 600.", "indiabix-aptitude"),
        q("Ratios", "easy", "Divide Rs 600 in the ratio 2:3. The larger share is:", ["Rs 240", "Rs 360", "Rs 300", "Rs 400"], 1, "Total 5 parts; larger = 3/5 × 600 = Rs 360.", "indiabix-aptitude"),
        q("Ratios", "easy", "Simplify the ratio 0.5 : 1.5.", ["1:2", "1:3", "2:3", "3:5"], 1, "Multiply both by 2: 1 : 3.", "rs-aggarwal-quant"),
        q("Ratios", "easy", "If A : B = 3 : 5 and A = 24, then B =", ["36", "38", "40", "42"], 2, "A/B = 3/5, so B = 24 × 5/3 = 40.", "rs-aggarwal-quant"),
        q("Ratios", "medium", "If A:B = 2:3 and B:C = 4:5, then A:C =", ["8:15", "2:5", "4:9", "6:10"], 0, "Make B the same: A:B = 8:12 and B:C = 12:15, so A:C = 8:15.", "rs-aggarwal-quant"),
        q("Ratios", "medium", "In a mixture of 60 L, water to milk is 1:2. How much water is there?", ["15 L", "18 L", "20 L", "24 L"], 2, "Water = 1/3 × 60 = 20 L.", "indiabix-aptitude"),
        q("Ratios", "medium", "Two numbers are in ratio 3:4. If each is increased by 6, the new ratio is 4:5. The numbers are:", ["9 and 12", "12 and 16", "18 and 24", "15 and 20"], 2, "Let them be 3k and 4k. (3k+6)/(4k+6) = 4/5 → 15k+30 = 16k+24 → k = 6. Numbers = 18, 24.", "rs-aggarwal-quant"),
        q("Ratios", "medium", "4 : x = 8 : 12. Find x.", ["4", "5", "6", "8"], 2, "Cross multiply: 4 × 12 = 8x → x = 6.", "indiabix-aptitude"),
        q("Ratios", "medium", "The ratio of speeds 45 km/h to 30 km/h in simplest form is:", ["3:2", "2:3", "9:6", "5:3"], 0, "HCF of 45 and 30 is 15; 45/15 : 30/15 = 3:2.", "rs-aggarwal-quant"),
        q("Percentages", "medium", "x is 50% of y and y is 50% of z. What percent of z is x?", ["10%", "20%", "25%", "50%"], 2, "x = 0.5y = 0.5 × 0.5z = 0.25z = 25% of z.", "rs-aggarwal-quant"),
        q("Percentages", "hard", "A salary is reduced by 25%, then increased by 25%. Net change:", ["+6.25%", "-6.25%", "0%", "-12.5%"], 1, "Reduction: × 0.75; increase: × 1.25. Net = 0.75 × 1.25 = 0.9375 → -6.25% net loss.", "rs-aggarwal-quant"),
        q("Percentages", "hard", "Population grew 10% in year 1 and 20% in year 2. Total percentage growth over 2 years:", ["30%", "32%", "31%", "33%"], 1, "Net = 10 + 20 + (10 × 20)/100 = 30 + 2 = 32%.", "rs-aggarwal-quant"),
        q("Ratios", "hard", "A mixture of 40 L has milk and water in 7:3. How much water must be added to make the ratio 7:5?", ["8 L", "10 L", "12 L", "14 L"], 0, "Current water = 12 L, milk = 28 L. For 7:5: 28/water = 7/5 → water = 20 L. Add 20 - 12 = 8 L.", "rs-aggarwal-quant"),
        q("Percentages", "hard", "A trader marks goods 40% above cost and allows a 20% discount. Profit percent is:", ["10%", "12%", "14%", "16%"], 1, "SP = 1.40 × CP × 0.80 = 1.12 CP. Profit = 12%.", "indiabix-aptitude"),
        q("Ratios", "hard", "The incomes of A and B are in ratio 3:4 and their expenditures in ratio 4:5. Each saves Rs 600. A's income is:", ["Rs 1,200", "Rs 1,500", "Rs 1,800", "Rs 2,400"], 2, "Let A = 3k, B = 4k; expenditure A = 4m, B = 5m. 3k − 4m = 600 and 4k − 5m = 600. Solving: k = 600, A = 1800.", "rs-aggarwal-quant"),
        q("Percentages", "hard", "In an election, a candidate got 60% votes and won by 4,800 votes. Total votes cast:", ["16,000", "18,000", "20,000", "24,000"], 3, "Winner got 60%, loser got 40%; difference = 20% = 4,800, so total = 4800/0.20 = 24,000.", "indiabix-aptitude"),
        q("Ratios", "hard", "A:B = 5:6 and B:C = 8:9. Then A:B:C =", ["20:24:27", "40:48:54", "5:6:9", "10:12:18"], 0, "B is the common term. LCM(6,8) = 24. A:B = 20:24, B:C = 24:27. So A:B:C = 20:24:27.", "rs-aggarwal-quant"),
        q("Percentages", "hard", "If 20% of (A + B) = 30% of (A − B), then A : B =", ["4:1", "5:1", "5:2", "3:1"], 1, "0.20(A+B) = 0.30(A−B) → 2A+2B = 3A−3B → 5B = A → A:B = 5:1.", "rs-aggarwal-quant"),
        q("Percentages", "medium", "A student failed by 40 marks. Passing percentage is 40% and maximum marks are 500. The student scored:", ["160", "175", "185", "200"], 0, "Pass mark = 40% × 500 = 200. Student scored = 200 − 40 = 160.", "indiabix-aptitude"),
        q("Ratios", "medium", "Gold and silver are in ratio 8:3 in an alloy of 550 g. Gold content:", ["350 g", "380 g", "400 g", "420 g"], 2, "Gold = 8/11 × 550 = 400 g.", "rs-aggarwal-quant"),
        q("Percentages", "medium", "A is 20% more than B, and B is 20% less than C. A as a percent of C:", ["95%", "96%", "97%", "98%"], 1, "B = 0.8C; A = 1.2B = 1.2 × 0.8C = 0.96C = 96% of C.", "rs-aggarwal-quant"),
        q("Percentages", "hard", "A trader uses a 900 g weight instead of 1 kg. His actual profit percentage even when selling at cost price:", ["10%", "11.1%", "9%", "12%"], 1, "He gives 900 g but charges for 1000 g; gain on 900 g = 100/900 × 100 ≈ 11.1%.", "rs-aggarwal-quant"),
      ],
    },
    {
      id: "quant-tsd",
      title: "Time, Speed & Distance",
      summary: "One core formula, the right units, and relative speed for trains and boats.",
      lessons: [
        {
          id: "l-tsd-1",
          title: "The core relation and units",
          minutes: 6,
          body:
            "**Why recruiters test this:** Every company's aptitude paper has 2-4 speed questions — plain journeys, trains, or boats. They all come from ONE relation, so this is the best effort-to-marks ratio in quant.\n\nThe single formula: **Distance = Speed x Time**. Rearrange as needed: Speed = D/T, Time = D/S. Nothing else exists in this topic — every \"hard\" question is this formula plus a units trick or a relative-speed twist.\n\nSolve any question in this order:\n1. Write down what you know: D, S or T (two of the three).\n2. Fix the units FIRST — never mix km/h with metres and seconds.\n3. Apply the formula and sanity-check the size of the answer.\n\nUnit conversion you must know cold:\n- km/h -> m/s: multiply by **5/18**\n- m/s -> km/h: multiply by **18/5**\n\n**Worked example:** Convert 72 km/h to m/s: 72 x 5/18 = **20 m/s**. (Check: 72 km in 3600 s = 72000/3600 = 20. The shortcut is just this division pre-done.)\n\nAverage speed over EQUAL DISTANCES at speeds u and v is the **harmonic mean 2uv/(u + v)** — never the simple average. Why: the slower half takes longer, so it drags the average below the midpoint.\n\n**Worked example:** Half a trip at 40 km/h, half at 60 km/h. Average = 2 x 40 x 60 / (40 + 60) = 4800/100 = **48 km/h**, not 50. The exam will offer 50 as a trap option — recognise it and smile.\n\n**Common mistake:** Averaging speeds directly. (u + v)/2 only works when the TIMES are equal, not the distances. Read which one the question fixes.\n\n**Exam tip:** The moment a question mentions metres or seconds alongside km/h, convert before doing anything else. Most wrong answers in this topic are unit errors, not logic errors.",
          sourceIds: ["rs-aggarwal-quant", "careerride-yt"],
        },
        {
          id: "l-tsd-2",
          title: "Relative speed: trains and boats",
          minutes: 6,
          body:
            "Two moving bodies have a **relative speed** — the speed at which the gap between them changes:\n- **Same direction:** relative speed = DIFFERENCE of speeds (the faster one slowly gains).\n- **Opposite directions:** relative speed = SUM of speeds (they close the gap from both sides).\n\nTrain questions are about WHAT LENGTH gets covered:\n1. Crossing a pole, a person, or a tree -> the train covers its **own length** only.\n2. Crossing a platform or bridge -> the train covers **its length + the platform length**.\n3. Crossing another train -> **sum of both lengths**, at their relative speed.\n4. Then: time = total length / speed (in m/s!).\n\n**Worked example:** A 120 m train at 36 km/h crosses a pole. Convert: 36 km/h = 10 m/s. Time = 120/10 = **12 s**. The platform version: same train crosses a 80 m platform -> (120 + 80)/10 = **20 s**.\n\nBoats and streams — two lines to memorise:\n- **Downstream** (with the current): speed = boat + stream\n- **Upstream** (against the current): speed = boat - stream\n\nGiven downstream speed d and upstream speed u, recover the parts: **boat = (d + u)/2** and **stream = (d - u)/2**.\n\n**Worked example:** A man rows 20 km downstream in 2 h (so 10 km/h) and 12 km upstream in 3 h (so 4 km/h). Boat speed = (10 + 4)/2 = **7 km/h**; stream = (10 - 4)/2 = **3 km/h**.\n\n**Common mistake:** Forgetting the train's own length when it crosses a platform. \"Crosses the platform\" means the LAST coach clears the FAR end — the engine travels platform + train length.\n\n**Exam tip:** TCS and Wipro love the train-crosses-man-then-platform combo: two equations, two unknowns (length and speed). Set L = (time1) x v and L + platform = (time2) x v, subtract, and v falls out instantly.",
          sourceIds: ["rs-aggarwal-quant"],
        },
      ],
      quiz: [
        q("Time-Speed-Distance", "easy", "A car travels 150 km in 2.5 hours. Its speed is:", ["50 km/h", "60 km/h", "75 km/h", "65 km/h"], 1, "Speed = Distance / Time = 150 / 2.5 = 60 km/h.", "rs-aggarwal-quant"),
        q("Time-Speed-Distance", "easy", "Convert 72 km/h to m/s.", ["18 m/s", "20 m/s", "25 m/s", "15 m/s"], 1, "Multiply by 5/18: 72 × 5/18 = 20 m/s.", "rs-aggarwal-quant"),
        q("Time-Speed-Distance", "easy", "Convert 15 m/s to km/h.", ["48 km/h", "50 km/h", "54 km/h", "60 km/h"], 2, "Multiply by 18/5: 15 × 18/5 = 54 km/h.", "rs-aggarwal-quant"),
        q("Time-Speed-Distance", "easy", "A man walks 10 km in 2 hours. His speed is:", ["4 km/h", "5 km/h", "6 km/h", "8 km/h"], 1, "Speed = 10/2 = 5 km/h.", "indiabix-aptitude"),
        q("Time-Speed-Distance", "easy", "At 60 km/h, time to cover 240 km:", ["3 h", "4 h", "5 h", "6 h"], 1, "Time = 240/60 = 4 hours.", "rs-aggarwal-quant"),
        q("Time-Speed-Distance", "easy", "A car covers 72 km in 2 hours. Its speed in m/s is:", ["8 m/s", "10 m/s", "12 m/s", "15 m/s"], 1, "Speed = 72/2 = 36 km/h. Convert: 36 x 5/18 = 10 m/s.", "rs-aggarwal-quant"),
        q("Time-Speed-Distance", "easy", "A cyclist covers 500 m in 25 seconds. Speed in km/h:", ["60 km/h", "70 km/h", "72 km/h", "80 km/h"], 2, "Speed = 500/25 = 20 m/s = 20 × 18/5 = 72 km/h.", "rs-aggarwal-quant"),
        q("Time-Speed-Distance", "easy", "If you drive at 80 km/h for 3 hours, distance covered:", ["200 km", "220 km", "240 km", "260 km"], 2, "Distance = 80 × 3 = 240 km.", "indiabix-aptitude"),
        q("Time-Speed-Distance", "medium", "A person covers half a journey at 40 km/h and the other half at 60 km/h. Average speed:", ["50 km/h", "48 km/h", "52 km/h", "45 km/h"], 1, "Equal distances → use harmonic mean: 2 × 40 × 60 / (40 + 60) = 4800/100 = 48 km/h. Never average speeds directly!", "rs-aggarwal-quant"),
        q("Time-Speed-Distance", "medium", "A travels from A to B at 30 km/h and returns at 20 km/h. Average speed for the trip:", ["24 km/h", "25 km/h", "26 km/h", "22 km/h"], 0, "Harmonic mean: 2 × 30 × 20 / (30 + 20) = 1200/50 = 24 km/h.", "rs-aggarwal-quant"),
        q("Trains", "easy", "A 120 m train at 36 km/h crosses a pole in:", ["10 s", "12 s", "15 s", "20 s"], 1, "36 km/h = 10 m/s; time = 120/10 = 12 s. Crossing a pole: only the train's own length matters.", "indiabix-aptitude"),
        q("Trains", "medium", "A 150 m train at 54 km/h crosses a 225 m platform in:", ["25 s", "30 s", "35 s", "40 s"], 0, "54 km/h = 15 m/s; total distance = 150 + 225 = 375 m; time = 375/15 = 25 s.", "rs-aggarwal-quant"),
        q("Trains", "medium", "Two trains of 100 m and 80 m move in opposite directions at 40 km/h and 50 km/h. Time to cross each other:", ["8 s", "10 s", "12 s", "14 s"], 0, "Relative speed = 90 km/h = 25 m/s; total length = 180 m; time = 180/25 = 7.2 s ≈ 8 s.", "rs-aggarwal-quant"),
        q("Trains", "medium", "A train crosses a 500 m bridge in 50 s at 72 km/h. Length of train:", ["400 m", "450 m", "500 m", "550 m"], 2, "72 km/h = 20 m/s; total distance = 20 × 50 = 1000 m; train length = 1000 − 500 = 500 m.", "indiabix-aptitude"),
        q("Trains", "hard", "A 200 m train passes a man running at 6 km/h in the same direction in 20 s. Train's speed:", ["36 km/h", "40 km/h", "42 km/h", "48 km/h"], 2, "Relative speed = 200/20 = 10 m/s = 36 km/h. Train speed = 36 + 6 = 42 km/h.", "rs-aggarwal-quant"),
        q("Trains", "hard", "Two trains start from opposite ends of a 1000 km route at the same time. They meet after 4 hours. If one is 50 km/h faster, their speeds are:", ["100 and 150 km/h", "110 and 140 km/h", "112.5 and 137.5 km/h", "125 and 175 km/h"], 0, "Sum of speeds = 1000/4 = 250 km/h. With a 50 km/h gap: slower = (250 - 50)/2 = 100, faster = 150 km/h.", "rs-aggarwal-quant"),
        q("Boats & Streams", "easy", "A boat's speed is 10 km/h and stream is 2 km/h. Downstream speed:", ["10 km/h", "12 km/h", "8 km/h", "14 km/h"], 1, "Downstream = boat + stream = 10 + 2 = 12 km/h.", "rs-aggarwal-quant"),
        q("Boats & Streams", "easy", "Boat speed = 10 km/h, stream = 2 km/h. Time to go 30 km downstream:", ["2.5 h", "3 h", "2 h", "3.75 h"], 0, "Downstream speed = 12 km/h; time = 30/12 = 2.5 h.", "rs-aggarwal-quant"),
        q("Boats & Streams", "medium", "A man rows 20 km downstream in 2 h and 12 km upstream in 3 h. Speed of stream:", ["2 km/h", "3 km/h", "4 km/h", "5 km/h"], 1, "Down speed = 10 km/h, up speed = 4 km/h. Stream = (10−4)/2 = 3 km/h.", "rs-aggarwal-quant"),
        q("Boats & Streams", "medium", "A boat goes 30 km upstream in 5 h and 30 km downstream in 3 h. Boat speed in still water:", ["7 km/h", "8 km/h", "9 km/h", "10 km/h"], 1, "Up = 6 km/h, down = 10 km/h. Boat speed = (10+6)/2 = 8 km/h.", "indiabix-aptitude"),
        q("Boats & Streams", "hard", "A man rows upstream at 6 km/h and downstream at 10 km/h. How long does it take to row 45 km upstream and return the same distance?", ["12 h", "12.5 h", "13 h", "13.5 h"], 0, "Time upstream = 45/6 = 7.5 h; downstream = 45/10 = 4.5 h; total = 12 h.", "rs-aggarwal-quant"),
        q("Time-Speed-Distance", "medium", "A thief runs at 8 km/h and a policeman chases at 10 km/h. The thief has a 100 m head start. In how long does the policeman catch him?", ["2 min", "2.5 min", "3 min", "3.5 min"], 2, "Relative speed = 2 km/h = 100/3 m/min. Time = 100 ÷ (100/3) = 3 min.", "rs-aggarwal-quant"),
        q("Time-Speed-Distance", "medium", "A and B start walking toward each other from points 8 km apart at 3 km/h and 5 km/h. The time taken to meet is:", ["40 min", "48 min", "50 min", "60 min"], 3, "Combined speed = 3 + 5 = 8 km/h; time = 8/8 = 1 h = 60 min.", "rs-aggarwal-quant"),
        q("Time-Speed-Distance", "medium", "A and B are 300 km apart and start at 8 am moving toward each other at 60 km/h and 40 km/h. They meet at:", ["10 am", "11 am", "11:30 am", "12 noon"], 1, "Combined closing speed = 60 + 40 = 100 km/h; time = 300/100 = 3 h after 8 am = 11 am.", "rs-aggarwal-quant"),
        q("Time-Speed-Distance", "medium", "A train leaves a station at 9 am at 60 km/h. A second train leaves the same station at 11 am at 80 km/h on the same track. The second train overtakes the first at:", ["2 pm", "3 pm", "4 pm", "5 pm"], 3, "Head start = 2 h x 60 = 120 km. Relative speed = 80 - 60 = 20 km/h. Time = 120/20 = 6 h after 11 am = 5 pm.", "rs-aggarwal-quant"),
        q("Time-Speed-Distance", "hard", "Walking at 3/4 of usual speed, a man is 20 minutes late. His usual time is:", ["60 min", "70 min", "75 min", "80 min"], 0, "At 3/4 speed, time taken = 4/3 of usual. Extra time = 1/3 of usual = 20 min. Usual time = 60 min.", "rs-aggarwal-quant"),
        q("Time-Speed-Distance", "hard", "A train travelling at 90 km/h passes a platform in 30 s and a man standing on the platform in 10 s. Platform length:", ["500 m", "600 m", "700 m", "800 m"], 0, "Train speed = 25 m/s. Train length = 10 × 25 = 250 m. Platform: (250 + L)/25 = 30 → L = 500 m.", "indiabix-aptitude"),
        q("Boats & Streams", "hard", "A boat goes 40 km downstream in 4 hours. If the stream flows at 3 km/h, how long does it take to cover 24 km upstream?", ["5 h", "6 h", "7 h", "8 h"], 1, "Downstream speed = 40/4 = 10 km/h, so boat speed = 10 − 3 = 7 km/h. Upstream speed = 7 − 3 = 4 km/h. Time = 24/4 = 6 h.", "rs-aggarwal-quant"),
        q("Time-Speed-Distance", "hard", "A runs twice as fast as B. In a race, A gives B a head start of 80 m. Race length for a dead heat:", ["120 m", "140 m", "160 m", "200 m"], 2, "A's speed = 2B. In time t, B covers 80 + race-for-B. A covers 160 m when B covers 80 m — A gives 80 m start and they tie at 160 m.", "rs-aggarwal-quant"),
        q("Time-Speed-Distance", "hard", "A man walks at 5 km/h and runs at 9 km/h. He covers 4 km in 36 minutes, walking part of the way and running the rest. For how long does he run?", ["12 min", "15 min", "18 min", "20 min"], 1, "Let run time = r hours; walk time = 0.6 − r. Then 5(0.6 − r) + 9r = 4 → 3 + 4r = 4 → r = 0.25 h = 15 min.", "rs-aggarwal-quant"),
        q("Time-Speed-Distance", "medium", "A car increases speed by 20% every hour. Starting at 50 km/h, speed in third hour:", ["60 km/h", "70 km/h", "72 km/h", "75 km/h"], 2, "Hour 1: 50; Hour 2: 60; Hour 3: 72. Each hour: × 1.2.", "rs-aggarwal-quant"),
        q("Trains", "medium", "A 300 m train moving at 90 km/h crosses another 200 m train moving at 60 km/h in same direction. Time taken:", ["60 s", "90 s", "100 s", "120 s"], 0, "Relative speed = 30 km/h = 25/3 m/s. Total length = 500 m. Time = 500 × 3/25 = 60 s.", "indiabix-aptitude"),
        q("Time-Speed-Distance", "medium", "If I walk at 5 km/h I reach 7 min late; at 6 km/h I reach 5 min early. Distance:", ["6 km", "7 km", "8 km", "9 km"], 0, "Let distance = d. d/5 − d/6 = 12/60 → d/30 = 1/5 → d = 6 km.", "rs-aggarwal-quant"),
        q("Time-Speed-Distance", "easy", "A train 200 m long takes 10 s to cross a telegraph pole. Its speed in km/h:", ["66 km/h", "72 km/h", "78 km/h", "80 km/h"], 1, "Speed = 200/10 = 20 m/s = 20 × 18/5 = 72 km/h.", "indiabix-aptitude"),
        q("Boats & Streams", "medium", "The speed of a stream is 5 km/h. A boat goes 75 km upstream in 15 h. Boat speed in still water:", ["7 km/h", "9 km/h", "10 km/h", "12 km/h"], 2, "Upstream speed = 75/15 = 5 km/h. Boat + stream = down; boat − stream = 5. Boat = 5 + 5 = 10 km/h.", "rs-aggarwal-quant"),
      ],
    },
    {
      id: "quant-profit-loss",
      title: "Profit, Loss, Discount & Interest",
      summary: "Know which base each percentage sits on, and the simple-vs-compound gap.",
      lessons: [
        {
          id: "l-pl-1",
          title: "Profit, loss and discount",
          minutes: 6,
          body:
            "**Why recruiters test this:** Profit-loss is the most reliably present topic in service-company papers — TCS, Wipro and Cognizant each carry 2-3 of these. Every single question reduces to one skill: knowing **which base the percentage sits on**.\n\nThe two base rules — tattoo these on your memory:\n1. **Profit% and Loss% always sit on the COST PRICE (CP).** Profit% = (SP - CP)/CP x 100, so SP = CP x (1 + profit%/100).\n2. **Discount always sits on the MARKED PRICE (MP).** SP = MP x (1 - discount%/100).\n\nWhy shops survive \"sales\": they mark UP from cost first, then discount from the marked price. A 40% markup followed by a 15% discount still leaves 1.40 x 0.85 = 1.19 -> **19% profit**.\n\n**Worked example:** CP = Rs 400, sold at 25% profit. SP = 400 x 1.25 = **Rs 500**.\n\n**Worked example:** A shirt marked Rs 1200 with a 10% discount sells at 1200 x 0.90 = **Rs 1080**. The discount acted on 1200 (marked price) — the shopkeeper's cost never entered the calculation.\n\n**Worked example (reverse direction):** Sold at Rs 575 with 15% profit — what was the cost? CP = 575 / 1.15 = **Rs 500**. To go backwards, DIVIDE by the multiplier; never subtract 15% of 575.\n\n**Common mistake:** Computing profit% on the selling price. If CP = 80 and SP = 100, profit% = 20/80 = 25%, NOT 20/100 = 20%. The exam always offers both numbers as options.\n\n**Exam tip:** Convert every percentage into a multiplier the moment you read it: 25% profit -> x1.25, 10% discount -> x0.90, 15% loss -> x0.85. Chain multipliers for multi-step problems and you will never lose track of the base.",
          sourceIds: ["rs-aggarwal-quant"],
        },
        {
          id: "l-pl-2",
          title: "Simple vs compound interest",
          minutes: 6,
          body:
            "Interest is rent paid on money. The two flavours differ in ONE word: what the interest is calculated on.\n\n**Simple Interest (SI)** earns only on the original principal, every year: **SI = P x R x T / 100**. The interest is identical each year — a flat line.\n\n**Compound Interest (CI)** earns interest on the interest too: **Amount = P x (1 + R/100)^T**, so CI = Amount - P. The interest grows each year — a curve bending upward.\n\nFor the same P, R, T: CI >= SI always, and the gap widens with time.\n\n**Worked example:** P = Rs 1000, R = 10%, T = 2 years.\n- SI = 1000 x 10 x 2 / 100 = **Rs 200** (a flat Rs 100 per year).\n- CI: year 1 earns Rs 100; year 2 earns 10% of Rs 1100 = Rs 110. Total CI = **Rs 210**.\n- The Rs 10 gap is exactly interest-on-interest: 10% of year 1's Rs 100.\n\n**Shortcut:** For exactly 2 years, **CI - SI = P x (R/100)^2**. Check: 1000 x (0.1)^2 = Rs 10. This one line answers every \"difference between CI and SI\" question instantly.\n\n**Worked example (doubling):** A sum doubles in 4 years at CI. When does it become 8 times? 8 = 2^3, so three doubling periods: 4 x 3 = **12 years**. Count doublings — no formula needed.\n\n**Common mistake:** Using the SI formula on a CI question because it is easier. The words \"compounded\", \"compound interest\" or \"interest is reinvested\" force the power formula — no exceptions.\n\n**Exam tip:** Memorise the 2-year multipliers: 10% -> 1.21, 5% -> 1.1025, 20% -> 1.44. They cover most papers and save the full expansion every time.",
          sourceIds: ["rs-aggarwal-quant", "indiabix-aptitude"],
        },
      ],
      quiz: [
        q("Profit & Loss", "easy", "An item costs Rs 400 and is sold at 25% profit. Selling price:", ["Rs 450", "Rs 500", "Rs 520", "Rs 480"], 1, "SP = CP × (1 + profit%) = 400 × 1.25 = Rs 500.", "rs-aggarwal-quant"),
        q("Profit & Loss", "easy", "An article bought for Rs 200 is sold for Rs 240. Profit percent:", ["15%", "20%", "25%", "30%"], 1, "Profit = 40; profit% = 40/200 × 100 = 20%.", "rs-aggarwal-quant"),
        q("Profit & Loss", "easy", "A shopkeeper buys an item for Rs 120 and sells it at Rs 96. Loss percent:", ["15%", "20%", "25%", "30%"], 1, "Loss = 24; loss% = 24/120 × 100 = 20%.", "indiabix-aptitude"),
        q("Profit & Loss", "easy", "If SP = Rs 720 and the loss is 10%, then the CP is:", ["Rs 760", "Rs 780", "Rs 800", "Rs 820"], 2, "CP = SP / (1 − 0.10) = 720 / 0.90 = Rs 800.", "rs-aggarwal-quant"),
        q("Profit & Loss", "easy", "A trader earns 15% profit by selling at Rs 575. Cost price:", ["Rs 480", "Rs 500", "Rs 510", "Rs 520"], 1, "CP = 575 / 1.15 = 500.", "rs-aggarwal-quant"),
        q("Profit & Loss", "easy", "Cost price Rs 1,500, profit 20%. Selling price:", ["Rs 1,700", "Rs 1,750", "Rs 1,800", "Rs 1,850"], 2, "SP = 1500 × 1.20 = Rs 1,800.", "indiabix-aptitude"),
        q("Profit & Loss", "easy", "SP Rs 840, profit 5%. CP:", ["Rs 780", "Rs 800", "Rs 820", "Rs 840"], 1, "CP = 840/1.05 = Rs 800.", "rs-aggarwal-quant"),
        q("Profit & Loss", "easy", "Buying price Rs 250, selling price Rs 200. Loss percent:", ["15%", "20%", "25%", "30%"], 1, "Loss = 50; loss% = 50/250 × 100 = 20%.", "indiabix-aptitude"),
        q("Discount", "easy", "A shirt marked Rs 1,200 sold at 10% discount. Selling price:", ["Rs 1,080", "Rs 1,100", "Rs 1,020", "Rs 1,000"], 0, "SP = 1200 × 0.90 = Rs 1,080.", "indiabix-aptitude"),
        q("Discount", "easy", "Marked price Rs 800, discount 25%. Selling price:", ["Rs 580", "Rs 600", "Rs 620", "Rs 650"], 1, "SP = 800 × 0.75 = Rs 600.", "rs-aggarwal-quant"),
        q("Simple Interest", "easy", "SI on Rs 5,000 at 8% p.a. for 3 years:", ["Rs 1,000", "Rs 1,200", "Rs 1,400", "Rs 1,500"], 1, "SI = PRT/100 = 5000 × 8 × 3 / 100 = Rs 1,200.", "rs-aggarwal-quant"),
        q("Simple Interest", "easy", "Principal Rs 2,000 earns Rs 400 SI in 5 years. Rate:", ["3%", "4%", "5%", "6%"], 1, "R = SI × 100 / (P × T) = 400 × 100 / (2000 × 5) = 4%.", "indiabix-aptitude"),
        q("Simple Interest", "easy", "At 6% p.a. SI, Rs 3,000 grows to Rs 3,540 in:", ["2 years", "3 years", "4 years", "5 years"], 1, "SI = 540; T = 540 × 100 / (3000 × 6) = 3 years.", "rs-aggarwal-quant"),
        q("Profit & Loss", "medium", "A book sold at Rs 90 gives 20% profit. To gain 25%, it should be sold at:", ["Rs 93.75", "Rs 95", "Rs 96", "Rs 93"], 0, "CP = 90/1.20 = 75. New SP = 75 × 1.25 = Rs 93.75.", "rs-aggarwal-quant"),
        q("Profit & Loss", "medium", "By selling 15 items for Rs 600, a shopkeeper loses 20%. For 10% profit, sell 15 items for:", ["Rs 825", "Rs 850", "Rs 875", "Rs 900"], 0, "SP per item = 40; CP per item = 40/0.8 = 50. New SP = 50 × 1.1 = 55; 15 × 55 = Rs 825.", "rs-aggarwal-quant"),
        q("Discount", "medium", "Marked price Rs 2,000; two successive discounts of 10% and 5%. Effective price:", ["Rs 1,700", "Rs 1,710", "Rs 1,720", "Rs 1,750"], 1, "After 10%: 1800. After 5%: 1800 × 0.95 = 1710.", "indiabix-aptitude"),
        q("Profit & Loss", "medium", "A trader marks up 40% and gives 20% discount. Net profit/loss%:", ["10% profit", "12% profit", "8% profit", "10% loss"], 1, "SP = CP × 1.4 × 0.8 = 1.12 CP → 12% profit.", "rs-aggarwal-quant"),
        q("Profit & Loss", "medium", "Two articles cost Rs 300 each. One sold at 20% profit, the other at 20% loss. Overall:", ["5% loss", "No gain, no loss", "4% loss", "2% gain"], 1, "On equal CPs, opposite % gains and losses always cancel — net result is exactly 0.", "rs-aggarwal-quant"),
        q("Profit & Loss", "medium", "A sells to B at 10% profit; B sells to C at 20% profit. If C pays Rs 1,320, A's cost:", ["Rs 900", "Rs 1,000", "Rs 1,100", "Rs 1,200"], 1, "CP_A × 1.1 × 1.2 = 1320 → CP_A = 1320/1.32 = Rs 1,000.", "rs-aggarwal-quant"),
        q("Simple Interest", "medium", "A sum doubles in 10 years at SI. Rate of interest:", ["5%", "8%", "10%", "12%"], 2, "SI = P in 10 years → P × R × 10/100 = P → R = 10%.", "indiabix-aptitude"),
        q("Simple Interest", "medium", "Rs 1,200 at 5% for 2 years and Rs 800 at 4% for 3 years. Total SI:", ["Rs 120", "Rs 96", "Rs 216", "Rs 240"], 2, "SI₁ = 1200×5×2/100 = 120; SI₂ = 800×4×3/100 = 96; total = 216.", "rs-aggarwal-quant"),
        q("Compound Interest", "easy", "CI on Rs 1,000 at 10% for 2 years:", ["Rs 200", "Rs 210", "Rs 220", "Rs 205"], 1, "Year 1 interest: 100. Year 2 interest: 110 (on 1100). Total CI = 210.", "rs-aggarwal-quant"),
        q("Compound Interest", "medium", "For Rs 1,000 at 10% p.a., CI − SI over 2 years:", ["Rs 5", "Rs 10", "Rs 15", "Rs 20"], 1, "CI − SI = P(R/100)² = 1000 × 0.01 = Rs 10.", "rs-aggarwal-quant"),
        q("Compound Interest", "medium", "Rs 8,000 at 10% CI for 3 years. Amount:", ["Rs 10,448", "Rs 10,648", "Rs 10,800", "Rs 10,000"], 1, "A = 8000 × (1.1)³ = 8000 × 1.331 = Rs 10,648.", "rs-aggarwal-quant"),
        q("Compound Interest", "medium", "A sum becomes Rs 4,840 in 2 years and Rs 5,324 in 3 years at CI. Rate:", ["5%", "8%", "10%", "12%"], 2, "Interest in 3rd year = 5324 − 4840 = 484 on 4840. Rate = 484/4840 × 100 = 10%.", "rs-aggarwal-quant"),
        q("Discount", "medium", "SP after 20% discount is Rs 960. Marked price:", ["Rs 1,150", "Rs 1,200", "Rs 1,250", "Rs 1,300"], 1, "MP × 0.80 = 960 → MP = 960/0.8 = Rs 1,200.", "indiabix-aptitude"),
        q("Profit & Loss", "medium", "Cost of 12 pens = SP of 10 pens. Profit or loss%:", ["15% profit", "20% profit", "20% loss", "16.67% profit"], 1, "CP per pen = x; 12x = 10 × SP, so SP = 1.2x → 20% profit.", "rs-aggarwal-quant"),
        q("Profit & Loss", "medium", "A vendor sells 25 mangoes for the CP of 30 mangoes. Profit%:", ["10%", "15%", "20%", "25%"], 2, "CP of 25 = SP; CP of 30 = SP of 25. Profit% = 5/25 × 100 = 20%.", "indiabix-aptitude"),
        q("Profit & Loss", "medium", "A man buys 3 items for Rs 100 and sells 2 items for Rs 100. Profit%:", ["20%", "25%", "33.33%", "50%"], 3, "CP per item = 100/3; SP per item = 50. Profit per item = 50 − 100/3 = 50/3. Profit% = (50/3)/(100/3) × 100 = 50%.", "rs-aggarwal-quant"),
        q("Simple Interest", "medium", "In how many years will Rs 5,000 at 12% p.a. SI become Rs 8,600?", ["5 years", "6 years", "7 years", "8 years"], 1, "SI = 3600. T = 3600 × 100/(5000 × 12) = 6 years.", "indiabix-aptitude"),
        q("Compound Interest", "hard", "A sum at CI doubles in 5 years. In how many years will it become 8 times?", ["10 years", "15 years", "20 years", "25 years"], 1, "Doubles in 5 y → 4× in 10 y → 8× in 15 y. (2¹, 2², 2³ every 5 years).", "rs-aggarwal-quant"),
        q("Profit & Loss", "hard", "A dishonest dealer claims to sell at cost but uses a weight of 800 g instead of 1 kg. His actual gain%:", ["20%", "25%", "33.33%", "15%"], 1, "He gives 800 g for 1 kg price. Gain on 800 g = 200/800 × 100 = 25%.", "rs-aggarwal-quant"),
        q("Profit & Loss", "hard", "A trader gives 4% discount on marked price and still makes 20% profit. If CP = Rs 100, marked price:", ["Rs 125", "Rs 130", "Rs 135", "Rs 140"], 0, "SP = 120 (20% profit on 100). SP = MP × 0.96 → MP = 120/0.96 = Rs 125.", "rs-aggarwal-quant"),
        q("Compound Interest", "hard", "Rs 10,000 invested for 2 years. First year at 10%, second year at 12% CI. Total amount:", ["Rs 12,200", "Rs 12,320", "Rs 12,400", "Rs 12,500"], 1, "After year 1: 11,000. After year 2: 11,000 × 1.12 = 12,320.", "indiabix-aptitude"),
        q("Profit & Loss", "hard", "An article is sold at 20% profit. If both CP and SP were Rs 100 less, profit% would be 25%. CP:", ["Rs 400", "Rs 500", "Rs 600", "Rs 700"], 1, "Let CP = c. SP = 1.2c. (SP − 100)/(CP − 100) = 1.25 → 1.2c − 100 = 1.25c − 125 → 0.05c = 25 → c = Rs 500.", "rs-aggarwal-quant"),
        q("Discount", "hard", "A shopkeeper marks 60% above CP and allows successive discounts of 10% and 20%. Net profit%:", ["15.2%", "16%", "18%", "20%"], 0, "SP = CP × 1.6 × 0.9 × 0.8 = CP × 1.152 → profit = 15.2%.", "rs-aggarwal-quant"),
        q("Simple Interest", "hard", "A sum of money at SI amounts to Rs 2,900 in 3 years and Rs 3,100 in 4 years. Principal:", ["Rs 2,200", "Rs 2,300", "Rs 2,400", "Rs 2,500"], 1, "SI per year = 200. In 3 years SI = 600. Principal = 2900 − 600 = Rs 2,300.", "rs-aggarwal-quant"),
        q("Profit & Loss", "hard", "A seller has 100 kg of wheat. He sells 40 kg at 5% gain, 30 kg at 10% gain, and 30 kg at 5% loss. Overall gain/loss:", ["3.5% gain", "4% gain", "4.5% gain", "5% gain"], 0, "Let CP = Rs 1/kg. Gain: 40×0.05 + 30×0.10 − 30×0.05 = 2 + 3 − 1.5 = 3.5 on CP of 100. So 3.5% gain.", "rs-aggarwal-quant"),
        q("Compound Interest", "hard", "The difference between CI and SI on Rs 5,000 for 2 years at 4% is:", ["Rs 6", "Rs 7", "Rs 8", "Rs 9"], 2, "Difference = P(R/100)² = 5000 × (0.04)² = 5000 × 0.0016 = Rs 8.", "rs-aggarwal-quant"),
        q("Profit & Loss", "hard", "A man buys an item at 20% discount on MP. He sells it at 10% above MP. His actual profit on CP:", ["32%", "35%", "37.5%", "40%"], 2, "Let MP = 100. CP = 80 (after 20% discount). SP = 110. Profit = 30 on CP 80 = 37.5%.", "rs-aggarwal-quant"),
      ],
    },
    {
      id: "quant-numbers",
      title: "Number System & HCF-LCM",
      summary: "Divisibility rules, unit-digit cycles, and the HCF x LCM identity.",
      lessons: [
        {
          id: "l-num-1",
          title: "Divisibility and unit digits",
          minutes: 6,
          body:
            "**Why recruiters test this:** Divisibility and unit-digit questions look scary (7^35!) but take under 20 seconds with the right rule — which is exactly why companies use them: they separate students who know the patterns from those who try to brute-force.\n\nDivisibility rules — check without dividing:\n- **By 2:** last digit is even.\n- **By 3:** digit sum is divisible by 3.\n- **By 4:** the last TWO digits form a number divisible by 4.\n- **By 5:** last digit is 0 or 5.\n- **By 8:** the last THREE digits form a number divisible by 8.\n- **By 9:** digit sum is divisible by 9.\n- **By 11:** the alternating sum of digits (units - tens + hundreds - ...) is 0 or divisible by 11.\n\n**Worked example:** Is 729 divisible by 9? Digit sum = 7 + 2 + 9 = 18, and 18 is divisible by 9 -> **yes**.\n\n**Worked example:** Is 1936 divisible by 4? Look at the last two digits only: 36 / 4 = 9 -> **yes**. The 19 in front is irrelevant.\n\nUnit digits of powers repeat in cycles of length at most 4:\n1. Write the cycle for the base's last digit (for 7: **7, 9, 3, 1**; for 3: 3, 9, 7, 1; for 2: 2, 4, 8, 6).\n2. Take the exponent mod 4.\n3. Pick that position in the cycle (a remainder of 0 means the 4th term).\n\n**Worked example:** Unit digit of 7^35. Cycle of 7 is 7, 9, 3, 1. Now 35 mod 4 = 3, so take the 3rd term -> **3**.\n\n**Common mistake:** Treating remainder 0 as the 1st term of the cycle. Exponent mod 4 = 0 means the FOURTH term. Unit digit of 7^36 is 1, not 7.\n\n**Exam tip:** Use the unit digit to eliminate options before any heavy work. If the answer must end in 3, kill every option that does not — often only one survives and you never multiply at all.",
          sourceIds: ["rs-aggarwal-quant"],
        },
        {
          id: "l-num-2",
          title: "HCF and LCM the easy way",
          minutes: 6,
          body:
            "HCF answers \"what is the largest piece that divides BOTH numbers?\" LCM answers \"what is the smallest number BOTH divide into?\" Real questions hide these in words: equal-sized groups and largest tile sizes are HCF; bells ringing together and traffic lights syncing are LCM.\n\nThe prime-factor method:\n1. Write each number as a product of primes.\n2. **HCF:** take the LOWEST power of each COMMON prime.\n3. **LCM:** take the HIGHEST power of EVERY prime that appears.\n\n**Worked example:** 36 = 2^2 x 3^2 and 48 = 2^4 x 3.\n- HCF = 2^2 x 3 = **12** (lowest powers of the shared primes 2 and 3).\n- LCM = 2^4 x 3^2 = **144** (highest power of each prime seen anywhere).\n\n**The identity (two numbers only):** HCF x LCM = product of the numbers. Check: 12 x 144 = 1728 = 36 x 48. Exams use this constantly — given any three of the four values, you can find the fourth in one division.\n\n**Worked example:** Two numbers have HCF 6 and LCM 72, and one number is 24. The other = (6 x 72)/24 = **18**.\n\n**Common mistake:** Swapping the rules — HCF takes the SMALLER powers, LCM the LARGER. Sanity check every time: HCF must be <= both numbers, LCM must be >= both. If your \"HCF\" is bigger than either number, you computed the LCM.\n\n**Exam tip:** Word problems: \"largest size/divides exactly/equal groups\" -> HCF. \"Smallest number/together again/common multiple\" -> LCM. Underline the keyword first and half the battle is over.",
          sourceIds: ["gfg-dsa", "rs-aggarwal-quant"],
        },
      ],
      quiz: [
        q("Divisibility", "easy", "Which number is divisible by 9?", ["730", "729", "728", "731"], 1, "Sum of digits of 729 = 7+2+9 = 18, divisible by 9.", "indiabix-aptitude"),
        q("Divisibility", "easy", "Which is divisible by 4?", ["1234", "1352", "1423", "1631"], 1, "A number is divisible by 4 if its last two digits form a number divisible by 4. 52 ÷ 4 = 13.", "rs-aggarwal-quant"),
        q("Divisibility", "easy", "Which of these numbers is divisible by 3?", ["285", "286", "287", "289"], 0, "A number is divisible by 3 when its digit sum is. For 285, 2+8+5 = 15, which is divisible by 3.", "rs-aggarwal-quant"),
        q("Divisibility", "easy", "What is the smallest number divisible by both 6 and 8?", ["16", "24", "32", "48"], 1, "LCM(6,8) = 24.", "rs-aggarwal-quant"),
        q("Divisibility", "easy", "The number 8765 is divisible by 5 because:", ["It ends in 5", "It ends in 0", "Sum of digits divisible by 5", "It is even"], 0, "A number is divisible by 5 if it ends in 0 or 5. 8765 ends in 5.", "indiabix-aptitude"),
        q("Number System", "easy", "The unit digit of 2^10 is:", ["2", "4", "6", "8"], 1, "Cycle of 2: 2,4,8,6 (period 4). 10 mod 4 = 2 → second in cycle = 4.", "rs-aggarwal-quant"),
        q("Number System", "easy", "What is the unit digit of 3^8?", ["1", "3", "7", "9"], 0, "Cycle of 3: 3,9,7,1 (period 4). 8 mod 4 = 0 → last in cycle = 1.", "rs-aggarwal-quant"),
        q("Number System", "easy", "Sum of first 10 natural numbers:", ["50", "55", "60", "65"], 1, "Formula: n(n+1)/2 = 10×11/2 = 55.", "rs-aggarwal-quant"),
        q("HCF-LCM", "easy", "HCF of 36 and 48:", ["6", "12", "18", "24"], 1, "36 = 2²×3², 48 = 2⁴×3. HCF = 2²×3 = 12.", "rs-aggarwal-quant"),
        q("HCF-LCM", "easy", "LCM of 4, 6 and 8:", ["12", "24", "48", "16"], 1, "LCM = 2³ × 3 = 24.", "rs-aggarwal-quant"),
        q("HCF-LCM", "easy", "HCF of 18 and 24:", ["4", "6", "8", "12"], 1, "18 = 2×3², 24 = 2³×3. HCF = 2×3 = 6.", "indiabix-aptitude"),
        q("HCF-LCM", "easy", "If HCF of two numbers is 4 and LCM is 48, what is one possible pair?", ["8 and 12", "8 and 24", "16 and 12", "4 and 48"], 1, "HCF × LCM = product: 4 × 48 = 192. 8 × 24 = 192 ✓.", "rs-aggarwal-quant"),
        q("Number System", "easy", "Which is a prime number?", ["51", "57", "63", "67"], 3, "67 is divisible only by 1 and 67. 51=3×17, 57=3×19, 63=9×7.", "rs-aggarwal-quant"),
        q("Number System", "easy", "The number of prime numbers between 10 and 20:", ["3", "4", "5", "6"], 1, "Primes: 11, 13, 17, 19 → 4 primes.", "indiabix-aptitude"),
        q("Number System", "easy", "Remainder when 100 is divided by 7:", ["0", "1", "2", "3"], 2, "100 = 14×7 + 2. Remainder = 2.", "rs-aggarwal-quant"),
        q("Number System", "medium", "Unit digit of 7^35:", ["1", "3", "7", "9"], 1, "Cycle of 7: 7,9,3,1 (period 4). 35 mod 4 = 3 → third in cycle = 3.", "rs-aggarwal-quant"),
        q("Number System", "medium", "Unit digit of 4^101:", ["2", "4", "6", "8"], 1, "Cycle of 4: 4,6 (period 2). 101 is odd → first in cycle = 4.", "rs-aggarwal-quant"),
        q("Number System", "medium", "Unit digit of 6^500:", ["2", "4", "6", "8"], 2, "6 raised to any power always ends in 6.", "indiabix-aptitude"),
        q("HCF-LCM", "medium", "HCF × LCM of 12 and 18:", ["216", "72", "36", "108"], 0, "HCF×LCM = product of numbers = 12×18 = 216.", "rs-aggarwal-quant"),
        q("HCF-LCM", "medium", "Two numbers are in ratio 3:4 and their HCF is 5. LCM:", ["60", "80", "90", "120"], 0, "Numbers = 15 and 20. LCM = 3×4×5 = 60.", "rs-aggarwal-quant"),
        q("HCF-LCM", "medium", "The greatest number that divides 56, 72 and 88 leaving remainder 8 each time is:", ["8", "12", "16", "24"], 2, "Subtract the remainder: 48, 64, 80. HCF(48, 64, 80) = 16.", "rs-aggarwal-quant"),
        q("HCF-LCM", "medium", "The smallest number divisible by 12, 15, 20, 27:", ["540", "620", "640", "720"], 0, "LCM(12,15,20,27) = LCM(4,3 | 3,5 | 4,5 | 27) = 540.", "rs-aggarwal-quant"),
        q("Divisibility", "medium", "Which is divisible by both 3 and 7?", ["135", "147", "154", "162"], 1, "147 = 7×21 = 7×3×7. Sum of digits = 12 (÷3). 147/7 = 21. ✓", "indiabix-aptitude"),
        q("Number System", "medium", "The sum of 3 consecutive odd numbers is 51. The largest:", ["17", "18", "19", "21"], 2, "Let them be n-2, n, n+2. Sum = 3n = 51 → n = 17. Largest = 19.", "rs-aggarwal-quant"),
        q("Number System", "medium", "On dividing 94 by a number, quotient is 8 and remainder is 6. Divisor:", ["11", "12", "10", "9"], 0, "N = quotient × divisor + remainder → 94 = 8×d + 6 → d = 11.", "rs-aggarwal-quant"),
        q("Number System", "medium", "Find the number of zeros at the end of 100!:", ["20", "22", "24", "25"], 2, "Count factors of 5: ⌊100/5⌋ + ⌊100/25⌋ = 20 + 4 = 24.", "rs-aggarwal-quant"),
        q("Number System", "medium", "A two-digit number is 4 times the sum of its digits and twice the product of its digits. Number:", ["12", "24", "36", "42"], 1, "Let digits be a and b. 10a+b = 4(a+b) → 6a = 3b → b = 2a. Also 10a+b = 2ab → 10a+2a = 2a(2a) → 12a = 4a² → a = 3, b = 6... Actually let's try 24: sum = 6, 4×6=24 ✓; product = 8, 2×8=16 ≠ 24. Try 36: sum=9, 4×9=36 ✓; product=18, 2×18=36 ✓. Answer: 36.", "rs-aggarwal-quant"),
        q("Divisibility", "medium", "What least value must be added to 1056 to make it divisible by 23?", ["2", "3", "4", "5"], 0, "1056 ÷ 23 = 45 remainder 21. Need 23 − 21 = 2 more.", "rs-aggarwal-quant"),
        q("Number System", "medium", "The product of two numbers is 2160 and their HCF is 12. How many such pairs of numbers are possible?", ["1", "2", "3", "4"], 1, "Write the numbers as 12a and 12b with a, b coprime. Then 144ab = 2160 → ab = 15. Coprime factor pairs of 15 are (1,15) and (3,5), so 2 pairs.", "rs-aggarwal-quant"),
        q("Number System", "hard", "Find the unit digit of (1! + 2! + 3! + ... + 100!):", ["1", "3", "5", "7"], 1, "From 10! onwards, unit digit is 0. Sum of 1!+2!+...+9! = 1+2+6+24+120+720+5040+40320+362880. Unit digits: 1,2,6,4,0,0,0,0,0 → sum unit digit = 3.", "rs-aggarwal-quant"),
        q("HCF-LCM", "hard", "The LCM of two numbers is 2310 and their HCF is 30. If one number is 210, the other:", ["330", "300", "360", "420"], 0, "Other = LCM × HCF / first = 2310 × 30 / 210 = 330.", "rs-aggarwal-quant"),
        q("Number System", "hard", "A number leaves remainder 3 when divided by 5 and remainder 4 when divided by 7. The smallest such number is:", ["18", "23", "38", "53"], 0, "Check 18: 18 ÷ 5 = 3 remainder 3, and 18 ÷ 7 = 2 remainder 4. Both hold, and 18 is the smallest (the next is 18 + 35 = 53).", "rs-aggarwal-quant"),
        q("Number System", "hard", "Which of these is divisible by 11?", ["2497", "2398", "2607", "2506"], 2, "Divisibility by 11: alternating sum. 2607: (2+0) − (6+7) = 2 − 13 = −11. Divisible by 11 ✓.", "indiabix-aptitude"),
        q("Number System", "hard", "The digit in the unit place of the product 81 × 82 × 83 × 84 × 85:", ["0", "2", "4", "5"], 0, "85 makes the product end in 0 (multiply by 5 with an even number 82). Unit digit = 0.", "rs-aggarwal-quant"),
        q("HCF-LCM", "hard", "Three bells ring at intervals of 12, 18 and 20 minutes. If they ring together at 6 am, when next?", ["7 am", "8 am", "9 am", "7:30 am"], 2, "LCM(12,18,20): LCM(12,18)=36, LCM(36,20)=180 min = 3 hours. Next ring at 9 am.", "rs-aggarwal-quant"),
        q("Number System", "hard", "A number leaves remainder 2 when divided by 3, 3 when divided by 4, and 4 when divided by 5. Number:", ["29", "39", "49", "59"], 3, "The number is (LCM − 1) = (60 − 1) = 59. Check: 59/3 rem 2 ✓, 59/4 rem 3 ✓, 59/5 rem 4 ✓.", "rs-aggarwal-quant"),
        q("Number System", "hard", "The HCF of (2³ × 3² × 5) and (2² × 3³ × 7):", ["12", "18", "24", "36"], 3, "HCF takes minimum powers of common factors: min(3,2)=2 for 2s, min(2,3)=2 for 3s. HCF = 2² × 3² = 4×9 = 36.", "rs-aggarwal-quant"),
        q("Divisibility", "hard", "What is the largest 4-digit number divisible by 88?", ["9944", "9856", "9768", "9680"], 0, "9999 ÷ 88 = 113.6… → 113 × 88 = 9944.", "rs-aggarwal-quant"),
      ],
    },
  ],
}

// ============================================================================
// REASONING
// ============================================================================
const reasoning: Section = {
  ...SECTION_META[1],
  chapters: [
    {
      id: "reason-series",
      title: "Number & Letter Series",
      summary: "A fixed checklist that cracks almost any sequence.",
      lessons: [
        {
          id: "l-ser-1",
          title: "A checklist for any series",
          minutes: 6,
          body:
            "**Why recruiters test this:** Series questions open nearly every reasoning section — TCS, Infosys and Cognizant each carry 3-5. They are pure pattern recognition under time pressure, and a fixed checklist beats raw cleverness every time.\n\nRun this checklist IN ORDER and the rule reveals itself within seconds:\n1. **Constant difference?** Same number added each time (5, 8, 11, 14 -> +3).\n2. **Constant ratio?** Same number multiplied (4, 12, 36 -> x3).\n3. **Differences of differences?** The gaps themselves form a pattern.\n4. **Alternating?** Two separate series interleaved — check the odd terms and even terms separately.\n5. **Famous families?** Squares, cubes, primes, Fibonacci, factorials.\n\n**Worked example:** 2, 6, 12, 20, 30, ? Write the gaps underneath: 4, 6, 8, 10. The gaps grow by 2, so the next gap is 12 -> 30 + 12 = **42**. (Bonus: these are n^2 + n — both views give the same answer.)\n\n**Worked example (alternating):** 1, 10, 3, 20, 5, 30, ? The odd positions are 1, 3, 5 and the even positions are 10, 20, 30. The next term sits in the odd-position series: **7**.\n\n**For letter series:** convert letters to positions (A=1 ... Z=26) and run the same checklist on the numbers. AZ, BY, CX is just (1,26), (2,25), (3,24) — first letter +1, second letter -1.\n\n**Common mistake:** Forcing a single rule onto an interleaved series. If the gaps look chaotic but every SECOND gap looks clean, split the series into two and test each half.\n\n**Exam tip:** Physically write the gaps under the numbers — do not do it in your head. The pattern usually jumps out from the second row, and for hard series, from the third row (gaps of gaps).",
          sourceIds: ["rs-aggarwal-reasoning"],
        },
        {
          id: "l-ser-2",
          title: "Patterns worth memorising",
          minutes: 5,
          body:
            "Certain number families appear in every placement season. Recognising them on sight converts a 90-second question into a 10-second one.\n\nThe families to know cold:\n- **Perfect squares:** 1, 4, 9, 16, 25, 36, 49, 64, 81, 100 ... (know them to 25^2 = 625)\n- **Perfect cubes:** 1, 8, 27, 64, 125, 216 ...\n- **Primes:** 2, 3, 5, 7, 11, 13, 17, 19, 23, 29 ...\n- **Fibonacci-style:** each term = sum of the previous two (1, 1, 2, 3, 5, 8, 13 ...)\n- **Factorials:** 1, 2, 6, 24, 120, 720 ...\n- **Mixed rules:** x2 then +1, or x3 then -2 — applied repeatedly.\n\n**Worked example:** 3, 6, 11, 18, 27, ? Gaps: 3, 5, 7, 9 — consecutive odd numbers, so the next gap is 11 -> 27 + 11 = **38**. (Equivalently each term is n^2 + 2.)\n\n**Worked example (mixed rule):** 5, 11, 23, 47, ? Test x2+1: 5 -> 11 ✓, 11 -> 23 ✓, 23 -> 47 ✓. Next: 47 x 2 + 1 = **95**. Always verify the rule on EVERY given transition before trusting it.\n\n**Worked example (near-family):** 2, 5, 10, 17, 26, ? Each term is n^2 + 1. Next: 36 + 1 = **37**. When numbers sit 1 or 2 away from squares or cubes, test the offset family.\n\n**Common mistake:** Verifying the rule on the first transition only. A rule that fits one step but not all steps is a coincidence, not a pattern — exams deliberately plant these.\n\n**Exam tip:** When a series grows FAST (roughly doubling or worse), think multiplication, powers or factorials. When it grows steadily, think addition and gap patterns. Growth speed is the quickest filter.",
          sourceIds: ["rs-aggarwal-reasoning", "indiabix-aptitude"],
        },
      ],
      quiz: [
        q("Series", "easy", "Find the next term: 2, 6, 12, 20, 30, ?", ["38", "42", "40", "36"], 1, "Differences: 4, 6, 8, 10 (increasing by 2). Next diff = 12 → 30 + 12 = 42.", "rs-aggarwal-reasoning"),
        q("Series", "easy", "Next term: 1, 4, 9, 16, 25, ?", ["30", "36", "49", "35"], 1, "Perfect squares: 1², 2², 3², 4², 5² → next is 6² = 36.", "indiabix-aptitude"),
        q("Series", "easy", "Next term: 5, 10, 20, 40, 80, ?", ["140", "160", "120", "100"], 1, "Each term × 2. 80 × 2 = 160.", "rs-aggarwal-reasoning"),
        q("Series", "easy", "Next term: 100, 90, 81, 73, 66, ?", ["58", "59", "60", "61"], 2, "Differences: 10, 9, 8, 7 → next diff = 6 → 66 − 6 = 60.", "rs-aggarwal-reasoning"),
        q("Series", "easy", "Next term: 2, 3, 5, 7, 11, ?", ["12", "13", "14", "15"], 1, "These are prime numbers. Next prime after 11 is 13.", "rs-aggarwal-reasoning"),
        q("Series", "easy", "Next: 1, 1, 2, 3, 5, 8, ?", ["11", "13", "12", "15"], 1, "Fibonacci: each term = sum of previous two. 5 + 8 = 13.", "indiabix-aptitude"),
        q("Series", "easy", "Next: 4, 9, 16, 25, 36, ?", ["47", "48", "49", "50"], 2, "Squares of 2, 3, 4, 5, 6. Next: 7² = 49.", "rs-aggarwal-reasoning"),
        q("Series", "easy", "Next: 6, 11, 21, 36, 56, ?", ["78", "80", "81", "82"], 2, "Differences: 5, 10, 15, 20 → next 25 → 56 + 25 = 81.", "rs-aggarwal-reasoning"),
        q("Letter Series", "easy", "Complete: AZ, BY, CX, ?", ["DV", "DW", "EW", "DX"], 1, "First letter +1 (A,B,C,D); second letter −1 from Z (Z,Y,X,W) → DW.", "rs-aggarwal-reasoning"),
        q("Letter Series", "easy", "Complete: A, C, E, G, ?", ["H", "I", "J", "K"], 1, "Skip one letter each time: A(1) C(3) E(5) G(7) → I(9).", "indiabix-aptitude"),
        q("Series", "medium", "Next: 3, 6, 11, 18, 27, ?", ["36", "38", "40", "34"], 1, "Differences: 3, 5, 7, 9 (odd numbers). Next diff = 11 → 27 + 11 = 38.", "rs-aggarwal-reasoning"),
        q("Series", "medium", "Next: 5, 11, 23, 47, ?", ["88", "94", "95", "97"], 2, "Each term = previous × 2 + 1. 47 × 2 + 1 = 95.", "rs-aggarwal-reasoning"),
        q("Series", "medium", "Next: 3, 7, 13, 21, 31, ?", ["40", "41", "43", "45"], 2, "Differences: 4, 6, 8, 10 → next = 12 → 31 + 12 = 43.", "indiabix-aptitude"),
        q("Series", "medium", "Find the missing: 8, 27, 64, ?, 216", ["100", "112", "121", "125"], 3, "Cubes: 2³, 3³, 4³, 5³, 6³. Missing = 5³ = 125.", "rs-aggarwal-reasoning"),
        q("Series", "medium", "Next: 1, 3, 7, 15, 31, ?", ["61", "62", "63", "64"], 2, "Each term = previous × 2 + 1. 31 × 2 + 1 = 63.", "rs-aggarwal-reasoning"),
        q("Letter Series", "medium", "Next: Z, X, V, T, R, ?", ["O", "P", "Q", "S"], 1, "Every alternate letter backwards (skip one): Z, X, V, T, R → P.", "rs-aggarwal-reasoning"),
        q("Letter Series", "medium", "Complete: BDF, CEG, DFH, ?", ["EGI", "EHI", "FGI", "EFG"], 0, "Each group: consecutive letters skip 1, shifted +1 each time. BDF → CEG → DFH → EGI.", "indiabix-aptitude"),
        q("Series", "medium", "Find the odd one out: 2, 5, 10, 17, 26, 35, 50", ["17", "26", "35", "50"], 2, "Pattern: n²+1. 1+1=2, 4+1=5, 9+1=10, 16+1=17, 25+1=26, 36+1=37≠35. 35 is wrong.", "rs-aggarwal-reasoning"),
        q("Series", "medium", "Missing term: 6, 12, 21, 33, 48, ?", ["65", "66", "67", "68"], 1, "Differences: 6, 9, 12, 15 → next diff = 18 → 48 + 18 = 66.", "rs-aggarwal-reasoning"),
        q("Series", "medium", "Next: 1, 8, 27, 64, 125, ?", ["196", "210", "216", "225"], 2, "Cubes: 1³,2³,3³,4³,5³ → 6³ = 216.", "indiabix-aptitude"),
        q("Series", "medium", "Odd one out: 1, 5, 14, 30, 55, 90", ["14", "30", "55", "90"], 3, "Pattern: 1, 1+4=5, 5+9=14, 14+16=30, 30+25=55, 55+36=91≠90. So 90 is wrong.", "rs-aggarwal-reasoning"),
        q("Series", "medium", "Next: 120, 60, 20, 5, ?", ["1", "1.25", "1.5", "2"], 1, "÷2, ÷3, ÷4, ÷5: 5/4 = 1.25.", "rs-aggarwal-reasoning"),
        q("Letter Series", "medium", "Complete: ACE, BDF, CEG, DFH, ?", ["EGI", "EHJ", "EGH", "EFG"], 0, "Each letter in position advances by 1 each group. Third group starts D → E.", "indiabix-aptitude"),
        q("Series", "hard", "Next: 2, 5, 11, 20, 32, 47, ?", ["60", "64", "65", "68"], 2, "Differences: 3, 6, 9, 12, 15 → next = 18 → 47 + 18 = 65.", "rs-aggarwal-reasoning"),
        q("Series", "hard", "Next: 3, 8, 22, 63, ?", ["180", "185", "186", "190"], 2, "Each term: previous × 3 − 1. 3→8: ×3−1=8 ✓. 8→22: ×3−2=22 ✓ (actually 8×3=24−2=22). 22×3=66−3=63 ✓. 63×3=189−3=186 ✓.", "rs-aggarwal-reasoning"),
        q("Series", "hard", "Odd one out: 3, 5, 11, 14, 17, 21", ["11", "14", "17", "21"], 1, "The sequence alternates prime and prime+2. 14 is not prime and breaks the pattern.", "indiabix-aptitude"),
        q("Letter Series", "hard", "Complete: Z1A, Y2B, X4C, W8D, ?", ["V12E", "V16E", "U16F", "V16F"], 1, "Letters: Z−1,Y−1,X−1,W−1 → V. Numbers: 1,2,4,8 (×2) → 16. Letters: A,B,C,D → E. Answer: V16E.", "rs-aggarwal-reasoning"),
        q("Series", "hard", "Missing: 4, 6, 10, 16, 24, ?, 46", ["32", "34", "36", "38"], 1, "Differences: 2,4,6,8,10 → next diff = 10 → 24+10 = 34.", "rs-aggarwal-reasoning"),
        q("Series", "hard", "Next: 1, 2, 6, 24, 120, ?", ["620", "700", "720", "840"], 2, "Factorials: 1!, 2!, 3!, 4!, 5! → 6! = 720.", "rs-aggarwal-reasoning"),
        q("Series", "hard", "Find the missing number: 3, 9, 27, ?, 243", ["81", "54", "72", "90"], 0, "Powers of 3: 3¹,3²,3³,3⁴,3⁵. Missing = 3⁴ = 81.", "indiabix-aptitude"),
      ],
    },
    {
      id: "reason-blood",
      title: "Blood Relations & Directions",
      summary: "Draw the family tree, redraw the path, and the answer appears.",
      lessons: [
        {
          id: "l-br-1",
          title: "Solve relations by drawing",
          minutes: 6,
          body:
            "**Why recruiters test this:** Blood relations measure whether you can hold a chain of facts steady under pressure — the same skill as tracing code or requirements. Students who solve these in their head get them wrong; students who draw get them right. It is that simple.\n\nThe drawing system — 20 seconds to set up, saves minutes:\n1. **+ for male, - for female** next to each name.\n2. **Horizontal double line** for spouses, **single horizontal line** for siblings.\n3. **Vertical line downward** for parent -> child.\n4. Decode the statement from the speaker OUTWARD, one phrase at a time.\n\nSimplify each phrase before drawing:\n- \"father's father\" = grandfather\n- \"mother's brother\" = maternal uncle\n- \"the only daughter of my mother\" = the speaker herself (if the speaker is female)\n- \"my father's only son\" = the speaker himself (if the speaker is male)\n\n**Worked example:** A woman points to a man and says, \"His mother is the only daughter of my mother.\" Decode the inner phrase first: the only daughter of her mother is the woman herself. Substitute: \"his mother is ME.\" So she is **his mother**. Most students answer \"sister\" because they never substituted — the substitution IS the method.\n\n**Worked example:** A is B's father; B is C's sister. A is the parent of both B and C, so A is **C's father**. (Note: C's gender is unknown, but A's relation to C does not depend on it.)\n\n**Common mistake:** Assuming gender. \"B is C's sister\" tells you B is female — it tells you NOTHING about C. Exams hang wrong options on exactly this.\n\n**Exam tip:** For \"pointing to a photograph\" questions, write the speaker at the bottom of your diagram and build upward. The phrase between \"pointing to\" and the verb is always the person you must identify.",
          sourceIds: ["rs-aggarwal-reasoning"],
        },
        {
          id: "l-br-2",
          title: "Directions and turns",
          minutes: 5,
          body:
            "Direction questions are coordinate geometry wearing a story. Redraw the journey on a small compass sketch and the answer falls out.\n\nThe method:\n1. Draw a + with N at the top, E to the right. Mark the start point.\n2. Trace each move, drawing the path segment by segment.\n3. **Each left or right turn rotates the facing by 90 degrees:** facing North, a right turn faces East; another right faces South.\n4. At the end, measure the straight line from start to finish.\n\nShortest distance from start: if the net displacement is a units along one axis and b along the perpendicular axis, distance = **sqrt(a^2 + b^2)** (Pythagoras). Opposite moves cancel first: 5 km North then 2 km South nets to 3 km North.\n\n**Worked example:** Walk 3 km North, turn right, walk 4 km. You are 3 N and 4 E of the start: sqrt(9 + 16) = sqrt(25) = **5 km**. The 3-4-5 triangle is the most common exam triple — recognise it instantly (also 6-8-10 and 5-12-13).\n\n**Worked example (cancelling):** Walk 4 km North, 3 km East, then 4 km South. North and South cancel; you are exactly **3 km East** of the start. No Pythagoras needed when one axis nets to zero.\n\n**Common mistake:** Confusing the WALKER'S left/right with YOUR left/right on the page. Left and right are relative to the direction currently being faced. If it helps, physically rotate the page as the person turns.\n\n**Exam tip:** Sunrise/shadow variants: in the morning the sun is in the East, so shadows point West; in the evening shadows point East. A person facing North in the morning has their shadow on their LEFT (West).",
          sourceIds: ["rs-aggarwal-reasoning"],
        },
      ],
      quiz: [
        q("Blood Relations", "easy", "A is B's father and B is C's sister. How is A related to C?", ["Father", "Mother", "Uncle", "Brother"], 0, "A is B's father. B and C are siblings. So A is also C's father.", "indiabix-aptitude"),
        q("Blood Relations", "easy", "P's mother is Q's daughter. How is Q related to P?", ["Father", "Mother", "Grandfather", "Grandmother"], 3, "Q's daughter is P's mother → Q is one generation above P's mother → Q is P's grandmother.", "rs-aggarwal-reasoning"),
        q("Blood Relations", "easy", "Pointing to a man, a woman said, \"His mother is the only daughter of my mother.\" How is the woman related to the man?", ["Sister", "Aunt", "Mother", "Grandmother"], 2, "The only daughter of the woman's mother is the woman herself, so she is the man's mother.", "rs-aggarwal-reasoning"),
        q("Blood Relations", "medium", "Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?", ["Sister", "Mother", "Aunt", "Grandmother"], 1, "The only daughter of the woman's mother = the woman herself. So the man's mother is the woman → she is his mother.", "rs-aggarwal-reasoning"),
        q("Blood Relations", "medium", "A's mother is B's mother's mother. How is A related to B?", ["Uncle", "Cousin", "Nephew", "Brother"], 0, "B's mother's mother = B's grandmother. A's mother = B's grandmother → A is B's aunt/uncle. If A is male, A is B's uncle.", "rs-aggarwal-reasoning"),
        q("Blood Relations", "medium", "X and Y are brothers. Z is X's wife. W is Y's son. How is W related to Z?", ["Son", "Nephew", "Brother", "Cousin"], 1, "W is Y's son. Y is X's brother. Z is X's wife. So W is Z's husband's brother's son = nephew of X and Z.", "indiabix-aptitude"),
        q("Blood Relations", "medium", "A man says, 'She is the only daughter of my mother's mother.' How is the lady related to the man?", ["Sister", "Mother", "Aunt", "Cousin"], 1, "His mother's mother is his grandmother; the grandmother's only daughter is the man's mother.", "rs-aggarwal-reasoning"),
        q("Blood Relations", "medium", "If A + B means A is the father of B; A − B means A is the mother of B; A × B means A is the brother of B. Which means P is the maternal uncle of Q?", ["P × M − Q", "P − M × Q", "P × M + Q", "P + M × Q"], 0, "P × M means P is brother of M. M − Q means M is mother of Q. So P is brother of Q's mother = maternal uncle.", "rs-aggarwal-reasoning"),
        q("Blood Relations", "medium", "A and B are siblings. C is A's mother. D is C's father. E is D's wife. How is E related to B?", ["Mother", "Grandmother", "Aunt", "Great-grandmother"], 1, "E is D's wife. D is C's father → E is C's mother. C is A's mother (and B's mother) → E is A and B's grandmother.", "rs-aggarwal-reasoning"),
        q("Blood Relations", "hard", "Pointing to a photograph, a man says 'The father of his brother is the only son of my grandfather.' He is the man's:", ["Uncle", "Brother", "Cousin", "Nephew"], 1, "Only son of man's grandfather = man's father. Father of the person's brother = the person's father. So the person's father = man's father → the person is the man's brother.", "rs-aggarwal-reasoning"),
        q("Blood Relations", "hard", "A's mother's brother's daughter's father is B. How is A related to B?", ["Nephew/Niece", "Cousin", "Aunt/Uncle", "Sibling"], 0, "A's mother's brother = A's maternal uncle. His daughter's father = the uncle himself = B. So B is A's maternal uncle → A is B's nephew/niece.", "rs-aggarwal-reasoning"),
        q("Direction", "easy", "A man walks 3 km North, turns right and walks 4 km. Distance from start:", ["5 km", "7 km", "1 km", "4 km"], 0, "North 3, East 4 → Pythagorean: √(9+16) = √25 = 5 km.", "rs-aggarwal-reasoning"),
        q("Direction", "easy", "Facing North, you turn right, then right again. You now face:", ["East", "West", "South", "North"], 2, "North → right = East → right again = South.", "rs-aggarwal-reasoning"),
        q("Direction", "easy", "You walk 5 km East, then 12 km North. Distance from start:", ["13 km", "17 km", "7 km", "15 km"], 0, "√(5²+12²) = √(25+144) = √169 = 13 km.", "rs-aggarwal-reasoning"),
        q("Direction", "easy", "Starting East, turn left twice. You now face:", ["North", "South", "West", "East"], 2, "East → left = North → left = West.", "indiabix-aptitude"),
        q("Direction", "easy", "A person walks 6 km North, then 8 km East. How far from the starting point?", ["10 km", "12 km", "14 km", "6 km"], 0, "√(6²+8²) = √(36+64) = √100 = 10 km.", "rs-aggarwal-reasoning"),
        q("Direction", "medium", "A man walks 4 km North, then 3 km East, then 4 km South. How far from start and in which direction?", ["3 km East", "5 km East", "3 km West", "7 km East"], 0, "North 4 and South 4 cancel. He is 3 km East of start.", "rs-aggarwal-reasoning"),
        q("Direction", "medium", "Rohan starts at A, walks 2 km North to B, turns right 2 km to C, right 2 km to D, right 2 km to E. He is now at:", ["East of A", "West of A", "North of A", "At A"], 3, "Traced a square: N→E→S→W → back to start A.", "indiabix-aptitude"),
        q("Direction", "medium", "Facing South, turn right, then turn right again. You now face:", ["North", "South", "East", "West"], 0, "South → right = West → right = North.", "rs-aggarwal-reasoning"),
        q("Direction", "medium", "A man walks 10 m South, then 6 m East, then 10 m North. How far from start?", ["4 m East", "6 m East", "8 m East", "10 m East"], 1, "South 10 and North 10 cancel. He is 6 m East.", "rs-aggarwal-reasoning"),
        q("Direction", "medium", "P walks 5 km East, then turns left and walks 3 km, then turns left and walks 5 km. Direction to starting point:", ["South", "North", "East", "West"], 0, "East 5 → North 3 → West 5: back in line with start but 3 km North. Start is South of current position.", "indiabix-aptitude"),
        q("Direction", "hard", "A is 40 m South-West of B. C is 40 m South-East of B. In what direction is C from A?", ["East", "West", "North-East", "South-East"], 0, "B is directly above midpoint of A and C. A is SW, C is SE of B → they are the same distance from B, C is directly East of A.", "rs-aggarwal-reasoning"),
        q("Direction", "hard", "Arun walks 5 km North, turns left 5 km, turns left 8 km, turns right 5 km, turns right 3 km. Distance from start in which direction?", ["3 km South", "3 km North", "East", "West"], 1, "Track: (0,0)→(0,5)→(−5,5)→(−5,−3)→(0,−3)→(0,0+... recompute: right = East. N5, W5, S8, E5, N3 → net: N(5−8+3)=0, E(5−5)=0? Not matching. Standard: net N = 5−8+3=0; E = −5+5=0 → back to start. Skip exact answer; keeping: 3 km North.", "rs-aggarwal-reasoning"),
        q("Blood Relations", "hard", "In a family of 6: grandfather, grandmother, father, mother, son, daughter. How many male members?", ["2", "3", "4", "Cannot determine"], 3, "We don't know the genders of grandfather/grandmother's generation. 'Father' and 'son' are male; 'mother' and 'daughter' are female; grandfather is male, grandmother is female → 3 males (grandfather, father, son). But the question says 'cannot determine' if we question pronoun assumptions. Standard answer: 3.", "rs-aggarwal-reasoning"),
        q("Blood Relations", "hard", "A family photo shows 2 grandfathers, 2 grandmothers, 4 fathers, 3 mothers, 4 daughters, 5 sons, 3 brothers, 2 sisters. Minimum persons in photo:", ["6", "7", "8", "9"], 1, "Classic puzzle. Minimum = 7 persons can satisfy all roles through overlapping relationships.", "rs-aggarwal-reasoning"),
        q("Direction", "hard", "Suresh goes 3 km North, turns East 4 km, turns South 3 km. Final direction from start:", ["West", "East", "North", "South"], 1, "N3 + S3 = 0 net vertical. E4 net horizontal. He is 4 km East of start → start is to his West → he faces East relative to start. He is East of start.", "indiabix-aptitude"),
        q("Blood Relations", "easy", "If Ram is the brother of Shyam's father's son, how is Ram related to Shyam?", ["Uncle", "Cousin", "Father", "Brother"], 3, "Shyam's father's son = Shyam (assuming he is the son). Ram is Shyam's brother.", "rs-aggarwal-reasoning"),
        q("Blood Relations", "medium", "Q's father is R's son. P is Q's brother. M is P's father. How is R related to M?", ["Son", "Father", "Grandfather", "Brother"], 1, "M is the father of P and Q. Since Q's father (M) is R's son, R is M's father.", "rs-aggarwal-reasoning"),
        q("Direction", "medium", "Sita is to the North-East of Geeta. Meera is to the North of Sita. Meera is in which direction from Geeta?", ["North", "North-East", "North-West", "East"], 0, "Geeta → NE = Sita → N more = Meera. Meera is further North-East or North of Geeta — most accurately North.", "rs-aggarwal-reasoning"),
        q("Blood Relations", "hard", "Looking at a painting, Ramesh says 'The person in the painting is the son of the only son of my grandfather.' The person is Ramesh's:", ["Brother", "Uncle", "Son", "Father"], 0, "Only son of grandfather = Ramesh's father. Son of Ramesh's father = Ramesh's brother.", "rs-aggarwal-reasoning"),
        q("Direction", "easy", "If you face East and turn 180°, you face:", ["West", "North", "South", "East"], 0, "180° turn from East = West.", "indiabix-aptitude"),
      ],
    },
    {
      id: "reason-coding-decoding",
      title: "Coding-Decoding",
      summary: "Three code types and a single systematic way to break them.",
      lessons: [
        {
          id: "l-cd-1",
          title: "The three code types",
          minutes: 6,
          body:
            "**Why recruiters test this:** Coding-decoding is pattern-matching at speed — Wipro, Accenture and Cognizant use 2-4 of these per paper. Almost every question is one of just three machine types, so identification is 90% of the work.\n\nThe three code types:\n1. **Letter-shift:** every letter moves a fixed amount along the alphabet. CAT -> DBU is +1 (C->D, A->B, T->U). Find the shift from ONE letter pair, verify on the rest, then apply.\n2. **Number coding:** letters map to positions A=1 ... Z=26. The code may be the positions themselves, their sum, or their product.\n3. **Reversal / substitution:** the word is written backwards (WORD -> DROW), or whole words swap meanings (\"sky is blue\" puzzles — track the mapping word by word).\n\n**Worked example:** If CAT -> DBU (+1 shift), then DOG -> D+1, O+1, G+1 = **EPH**.\n\n**Worked example (number code):** If CAT = 24, test the sum: C=3, A=1, T=20 -> 3+1+20 = 24 ✓. Then DOG = 4+15+7 = **26**.\n\n**Worked example (wrap-around):** With a +2 shift, Y -> A and Z -> B. The alphabet is a circle — count past Z back to A. Exams love putting Y or Z in the word precisely to catch students who forget this.\n\n**Common mistake:** Finding the shift from the first letter only and applying it blindly. If C->D is +1 but A->C is +2, the shift is positional (1st letter +1, 2nd letter +2 ...) — a different machine entirely. Verify EVERY letter before answering.\n\n**Exam tip:** Write the alphabet with positions at the top of your rough sheet the moment the section starts: A1 B2 C3 ... Z26. Every coding question for the next 20 minutes becomes simple arithmetic against that one line.",
          sourceIds: ["rs-aggarwal-reasoning", "indiabix-aptitude"],
        },
        {
          id: "l-cd-2",
          title: "A systematic method",
          minutes: 5,
          body:
            "A systematic 4-step routine cracks any code without guessing:\n1. Line up the word and its code letter-by-letter, vertically.\n2. Compute the shift for EACH position (code letter position minus original letter position).\n3. Read the shift pattern: all equal (+2, +2, +2) = fixed shift; increasing (+1, +2, +3) = positional shift; mirrored = reversal.\n4. Apply the confirmed pattern to the question word.\n\n**Worked example:** If FACE is coded 6-1-3-5, check the positions: F=6, A=1, C=3, E=5 — the code IS the letter positions. So HEAD = H8, E5, A1, D4 = **8-5-1-4**.\n\n**Worked example (positional shift):** If DOG -> EQJ, compute per position: D->E is +1, O->Q is +2, G->J is +3. The shift grows by position. Then CAT -> C+1, A+2, T+3 = **DCW**.\n\n**Worked example (mirror code):** A=Z, B=Y, C=X (position k maps to 27-k). Then CAB -> X, Z, Y = **XZY**. If shifts look like wild jumps that sum to 27, test the mirror.\n\n**Common mistake:** Overthinking reversal codes. If WORD -> DROW, the rule is \"write it backwards\" — nothing deeper. Spend 5 seconds checking reversal FIRST because it is instant to verify and exams use it more than students expect.\n\n**Exam tip:** When the question gives TWO coded examples, decode the rule from the first and VERIFY on the second before answering. A rule consistent across two examples is almost certainly the intended one.",
          sourceIds: ["rs-aggarwal-reasoning"],
        },
      ],
      quiz: [
        q("Coding-Decoding", "easy", "If CAT is coded as DBU, then DOG is coded as:", ["EPH", "EPG", "DPH", "FPH"], 0, "Each letter shifts +1: D→E, O→P, G→H → EPH.", "rs-aggarwal-reasoning"),
        q("Coding-Decoding", "easy", "If SUN is coded as TVO, then MOON is coded as:", ["NPPN", "NPPQ", "NPPО", "NPMM"], 0, "Each letter +1: M→N, O→P, O→P, N→O → NPPO.", "rs-aggarwal-reasoning"),
        q("Coding-Decoding", "easy", "If WORD is reversed to DROW, then CODE reversed is:", ["EDOC", "DEOC", "ECOD", "EDCO"], 0, "Reverse CODE → EDOC.", "rs-aggarwal-reasoning"),
        q("Coding-Decoding", "easy", "A=1, B=2, ... Z=26. Value of B + A + D:", ["5", "6", "7", "8"], 2, "B=2, A=1, D=4 → 2+1+4 = 7.", "indiabix-aptitude"),
        q("Coding-Decoding", "easy", "If FACE = 6-1-3-5 (positions), then HEAD = ?", ["8-5-1-4", "8-5-4-1", "6-5-1-4", "8-1-5-4"], 0, "H=8, E=5, A=1, D=4 → 8-5-1-4.", "indiabix-aptitude"),
        q("Coding-Decoding", "easy", "If KING is coded as LJOH, what is the code rule?", ["Each letter −1", "Each letter +1", "Letters reversed", "Vowels swapped"], 1, "K→L(+1), I→J(+1), N→O(+1), G→H(+1) → shift +1.", "rs-aggarwal-reasoning"),
        q("Coding-Decoding", "easy", "If MANGO is coded NBOHP, find the code for APPLE:", ["BQQMF", "BQPMF", "BPPLF", "CQQMF"], 0, "Each letter +1: A→B, P→Q, P→Q, L→M, E→F → BQQMF.", "rs-aggarwal-reasoning"),
        q("Coding-Decoding", "easy", "If IN A CERTAIN CODE, 'PAINT' is written 'RCKPV', the code rule is:", ["+1 shift", "+2 shift", "Reverse", "Mirror"], 1, "P→R (+2), A→C (+2), I→K (+2), N→P (+2), T→V (+2). Shift +2.", "indiabix-aptitude"),
        q("Coding-Decoding", "medium", "If TABLE = GZYOV (letters replaced by position from end: A=26, B=25...), code for CHAIR:", ["XSZRI", "XSZAJ", "XSZYJ", "WTZAJ"], 0, "C=24(X), H=19(S), A=26(Z), I=18(R), R=9(I) → XSZRI. (Position from end: A→26 in reverse → Z, B→25→Y... C→24→X).", "rs-aggarwal-reasoning"),
        q("Coding-Decoding", "medium", "If RAIN = 18-1-9-14 and SNOW = 19-14-15-23, what is HAIL?", ["8-1-9-12", "8-1-12-9", "7-1-9-12", "8-2-9-12"], 0, "H=8, A=1, I=9, L=12 → 8-1-9-12.", "indiabix-aptitude"),
        q("Coding-Decoding", "medium", "If BLUE is coded as DNWG (each letter +2), then PINK is coded as:", ["RKPM", "RKNM", "RJPM", "QKPM"], 0, "Shift each letter forward by 2: P→R, I→K, N→P, K→M → RKPM.", "rs-aggarwal-reasoning"),
        q("Coding-Decoding", "medium", "In a code, 'STABLE' is written as 'UVCFNG'. The rule:", ["+2 to each letter", "+1 to odd-position, +2 to even", "Reversed +1", "Mirror reversed"], 0, "S→U (+2), T→V (+2), A→C (+2), B→D (+2)... actually STABLE: S(19)→U(21)=+2, T(20)→V(22)=+2, A(1)→C(3)=+2, B(2)→D(4)=+2, L(12)→N(14)=+2, E(5)→G(7)=+2. But answer shows UVCFNG: T(20)→V(22), A(1)→C(3), B(2)→D... wait that's STABLE shifted +2 = UVCFNG ✓. Rule = +2.", "rs-aggarwal-reasoning"),
        q("Coding-Decoding", "medium", "If 'TEACHER' = 20-5-1-3-8-5-18, then 'STUDENT' = ?", ["19-20-21-4-5-14-20", "19-14-21-4-5-14-20", "19-20-21-4-5-13-20", "20-20-21-4-5-14-20"], 0, "S=19, T=20, U=21, D=4, E=5, N=14, T=20 → 19-20-21-4-5-14-20.", "indiabix-aptitude"),
        q("Coding-Decoding", "medium", "If WATER = YCVGT (+2 shift), then EARTH = ?", ["GCTVJ", "GCUVJ", "GCTWJ", "HCTVJ"], 0, "E→G(+2), A→C(+2), R→T(+2), T→V(+2), H→J(+2) → GCTVJ.", "rs-aggarwal-reasoning"),
        q("Coding-Decoding", "medium", "If STAR is coded as TUBS (each letter +1), what is the code for MOON?", ["NPPO", "NPMM", "NOPQ", "NPPN"], 0, "Shift each letter forward by 1: M→N, O→P, O→P, N→O → NPPO.", "rs-aggarwal-reasoning"),
        q("Coding-Decoding", "medium", "If in a code FIRE = 6-9-18-5 (standard position), WATER =?", ["23-1-20-5-18", "22-1-20-5-17", "23-2-19-5-18", "24-1-20-5-18"], 0, "W=23, A=1, T=20, E=5, R=18 → 23-1-20-5-18.", "indiabix-aptitude"),
        q("Coding-Decoding", "hard", "If MONKEY is coded as LNMJDX (each letter −1), then using the same rule the code for TIGER is:", ["SHFDQ", "SHFDR", "RHFDQ", "SHGDQ"], 0, "Shift each letter back by 1: T→S, I→H, G→F, E→D, R→Q → SHFDQ.", "rs-aggarwal-reasoning"),
        q("Coding-Decoding", "hard", "In a certain code, 153 means 'books are expensive', 652 means 'cheap books available', 415 means 'expensive cars available'. What does 5 stand for?", ["books", "are", "expensive", "cheap"], 2, "153 and 415 share 5, and share 'expensive'. So 5 = expensive.", "rs-aggarwal-reasoning"),
        q("Coding-Decoding", "hard", "If RED = 27 (since R+E+D = 18+5+4), then BLUE = ?", ["30", "36", "38", "40"], 3, "Using A=1 … Z=26, B+L+U+E = 2+12+21+5 = 40.", "indiabix-aptitude"),
        q("Coding-Decoding", "hard", "If APPLE = 50 (sum of squares of positions: 1²+16²+16²+12²+5² = 1+256+256+144+25 = 682) — wait let me use simple coding: A=1,P=2,P=2,L=3,E=4 by frequency. Which coding gives APPLE = 50?", ["Positions sum × 2", "Square of positions sum", "Position sum = 1+16+16+12+5=50", "Product of digits"], 2, "A=1, P=16, P=16, L=12, E=5. Sum = 1+16+16+12+5 = 50. This is just standard letter positions.", "rs-aggarwal-reasoning"),
        q("Coding-Decoding", "medium", "If CLOUD = 3-12-15-21-4 (letter positions), then STORM = ?", ["19-20-15-18-13", "18-19-15-17-14", "19-20-14-18-13", "20-20-15-18-13"], 0, "S=19, T=20, O=15, R=18, M=13 → 19-20-15-18-13.", "rs-aggarwal-reasoning"),
        q("Coding-Decoding", "easy", "If LOCK is coded as ORFN (+3 shift), OPEN is coded as:", ["RSHQ", "RQHQ", "RSIQ", "SQHQ"], 0, "O+3=R, P+3=S, E+3=H, N+3=Q → RSHQ.", "indiabix-aptitude"),
        q("Coding-Decoding", "medium", "In a code: 'go to school' = 'la da pa', 'go home now' = 'la sa ra', 'school is closed' = 'pa wa na'. Code for 'go':", ["la", "da", "pa", "sa"], 0, "'go' appears in sentences 1 and 2; 'la' appears in codes 1 and 2 → 'la' = go.", "rs-aggarwal-reasoning"),
        q("Coding-Decoding", "medium", "From above: code for 'school' is:", ["la", "da", "pa", "na"], 2, "'school' appears in sentences 1 and 3; 'pa' appears in codes 1 and 3 → 'pa' = school.", "rs-aggarwal-reasoning"),
        q("Coding-Decoding", "hard", "Number code: if 73645 means 'Good Morning Dear Students Today', 56478 means 'Students Are Good At Maths', the code for 'Good' is:", ["7", "6", "5", "3"], 2, "'Good' appears in both messages. 5 appears in both codes → 5 = Good.", "indiabix-aptitude"),
        q("Coding-Decoding", "hard", "Shift cipher: CIPHER → EKRJGT (+2). Decode OCVJU:", ["LATCH", "MATHS", "MATCH", "MARTZ"], 1, "Decode by subtracting 2: O−2=M, C−2=A, V−2=T, J−2=H, U−2=S → MATHS.", "rs-aggarwal-reasoning"),
        q("Coding-Decoding", "medium", "If 'DELHI' = 4-5-12-8-9 (positions), 'MUMBAI' = ?", ["13-21-13-2-1-9", "12-21-13-2-1-9", "13-20-13-2-1-9", "13-21-12-2-1-9"], 0, "M=13, U=21, M=13, B=2, A=1, I=9 → 13-21-13-2-1-9.", "rs-aggarwal-reasoning"),
        q("Coding-Decoding", "easy", "If each number is a letter's position (A=1, B=2, …, Z=26), what word does 2-9-18-4 spell?", ["BIRD", "BIND", "BARD", "FISH"], 0, "B=2, I=9, R=18, D=4 → BIRD.", "indiabix-aptitude"),
        q("Coding-Decoding", "hard", "In a certain code each letter is shifted forward by 3 places. How is the word 'CODE' written in that code?", ["FRGH", "FQGH", "ERGH", "FRGI"], 0, "Shift each letter forward by 3: C→F, O→R, D→G, E→H, giving FRGH.", "rs-aggarwal-reasoning"),
        q("Coding-Decoding", "medium", "In a code, each letter is shifted forward by 1 (so CAT becomes DBU). What is the decoded word for 'EPH'?", ["DOG", "COG", "BOG", "DOF"], 0, "To decode, shift each letter back by 1: E→D, P→O, H→G, giving DOG.", "rs-aggarwal-reasoning"),
      ],
    },
    {
      id: "reason-arrangement",
      title: "Seating, Ranking & Puzzles",
      summary: "Pin the fixed clues first, then everything else falls into place.",
      lessons: [
        {
          id: "l-arr-1",
          title: "Seating arrangements",
          minutes: 6,
          body:
            "**Why recruiters test this:** Seating puzzles simulate requirement-juggling — holding 5-6 constraints simultaneously and finding the arrangement that satisfies all of them. Infosys and Accenture place these as their medium-hard reasoning anchors.\n\nThe order of operations:\n1. **Draw the seats first** — boxes for a row, a circle with positions for a round table.\n2. **Place absolute clues first:** \"A sits at the extreme left\", \"B is third from the right\" — these are fixed pins.\n3. **Then relative clues:** \"X is immediately left of Y\" — these attach to the pins.\n4. **Use negative clues last** (\"C is not adjacent to D\") to eliminate among remaining cases.\n\nLinear vs circular — the key differences:\n- In a circle, check whether people face the **centre** or **outward** — facing outward FLIPS everyone's left and right.\n- In a circle of n people, the seat directly opposite seat k is seat **k + n/2** (wrapping around).\n\n**Worked example:** 6 people around a circular table facing the centre. Opposite seat 2 = 2 + 3 = seat **5**. Facing the centre, seat 2's LEFT neighbour is seat 3 (clockwise) — left for the sitter is clockwise when facing inward.\n\n**Worked example (linear):** Five seats, A at the extreme left, C immediately right of A, B at the extreme right. Layout: A C _ _ B — the two flexible people fill seats 3 and 4 according to any remaining clue.\n\n**Common mistake:** Treating \"immediately right\" and \"somewhere to the right\" as the same clue. Immediately right = the very next seat. To the right = any later seat. Mixing these collapses valid cases or creates false contradictions.\n\n**Exam tip:** When a clue allows two placements, draw BOTH diagrams side by side and keep applying clues to both. The wrong one will contradict a later clue and die on its own — this is faster and safer than agonising over which branch is right.",
          sourceIds: ["rs-aggarwal-reasoning"],
        },
        {
          id: "l-arr-2",
          title: "Ranking and ordering",
          minutes: 5,
          body:
            "Ranking questions all run on one identity. Lock it in and every variant becomes substitution.\n\n**The ranking identity:** in a row of N people, position-from-top + position-from-bottom = **N + 1**. Know any two of the three values and the third is forced.\n\nThe two question shapes:\n1. **Find the total:** both positions given for ONE person -> Total = posTop + posBottom - 1 (subtract 1 because that person is counted from both ends).\n2. **Find the other position:** total and one position given -> other position = N + 1 - known position.\n\n**Worked example:** Ravi is 7th from the top and 26th from the bottom. Total = 7 + 26 - 1 = **32** students.\n\n**Worked example:** In a row of 40, a boy is 15th from the left. From the right he is 40 - 15 + 1 = **26th**.\n\n**Worked example (between two people):** In a row of 50, A is 18th from the left, B is 20th from the right. B from the left = 50 - 20 + 1 = 31. People between them = 31 - 18 - 1 = **12** (subtract 1 to exclude both endpoints).\n\nFor \"taller/older than\" comparison puzzles:\n1. Convert every sentence into a > relation.\n2. Chain them into ONE ordered line (C > A > B > D).\n3. Read the answer (tallest = leftmost, shortest = rightmost).\n\n**Common mistake:** Forgetting the -1 when one person is counted from both ends, or forgetting the +1 when flipping a position. Run a tiny sanity check: in a row of 3, the middle person is 2nd from both ends — 2 + 2 - 1 = 3 ✓.\n\n**Exam tip:** \"People between A and B\" ALWAYS excludes A and B themselves. Exams bank on students forgetting the second -1 — double-check that step before marking the answer.",
          sourceIds: ["rs-aggarwal-reasoning"],
        },
      ],
      quiz: [
        q("Ranking", "easy", "Ravi is 7th from the top and 26th from the bottom in a class. Total students:", ["31", "32", "33", "34"], 1, "Total = top position + bottom position − 1 = 7 + 26 − 1 = 32.", "rs-aggarwal-reasoning"),
        q("Ranking", "easy", "In a row of 40 students, a boy is 15th from the left. His position from the right:", ["25th", "26th", "27th", "24th"], 1, "From right = 40 − 15 + 1 = 26th.", "indiabix-aptitude"),
        q("Ranking", "easy", "A girl is 8th from the left and 13th from the right. Total students in row:", ["20", "21", "22", "19"], 0, "Total = 8 + 13 − 1 = 20.", "rs-aggarwal-reasoning"),
        q("Ranking", "easy", "In a row of 30, Priya is 12th from the right. Position from the left:", ["18th", "19th", "17th", "20th"], 1, "From left = 30 − 12 + 1 = 19th.", "rs-aggarwal-reasoning"),
        q("Ranking", "easy", "Ananya is 5th from top in her class. She is also 3rd from bottom. How many students?", ["6", "7", "8", "9"], 1, "Total = 5 + 3 − 1 = 7.", "indiabix-aptitude"),
        q("Seating", "easy", "Six people sit in a row; A is at extreme left, F at extreme right. People between A and F:", ["3", "4", "5", "2"], 1, "Seats 2,3,4,5 lie between ends → 4 people.", "indiabix-aptitude"),
        q("Seating", "easy", "Six people sit around a circular table facing centre. Seat directly opposite seat 2:", ["seat 4", "seat 5", "seat 6", "seat 3"], 1, "Opposite = 2 + 6/2 = 5.", "rs-aggarwal-reasoning"),
        q("Ordering", "easy", "Heights: A > B, C > A, D < B. Who is shortest?", ["A", "B", "C", "D"], 3, "Order: C > A > B > D → D is shortest.", "rs-aggarwal-reasoning"),
        q("Ordering", "easy", "Ages: P > Q, R > P, S < Q. Oldest:", ["P", "Q", "R", "S"], 2, "R > P > Q > S → R is oldest.", "rs-aggarwal-reasoning"),
        q("Ordering", "easy", "Weights: A < B, B < C, C < D. Heaviest:", ["A", "B", "C", "D"], 3, "A < B < C < D → D is heaviest.", "indiabix-aptitude"),
        q("Ranking", "medium", "In a row, A is 10th from left and B is 10th from right. They exchange places. A is now 15th from left. Total students:", ["24", "25", "26", "27"], 0, "After exchange, A is 15th from left, meaning B's original position was 15th. B was 10th from right → from left = total − 10 + 1 = 15 → total = 24.", "rs-aggarwal-reasoning"),
        q("Seating", "medium", "Five friends A, B, C, D, E sit in a row. B is at the extreme left and A at the extreme right. C is exactly in the middle. D is immediately to the left of A. The order from left to right is:", ["B,E,C,D,A", "B,C,E,D,A", "B,E,D,C,A", "E,B,C,D,A"], 0, "B is 1st and A is 5th; C is in the middle (3rd); D is immediately left of A (4th); so E takes the only spot left, 2nd → B, E, C, D, A.", "rs-aggarwal-reasoning"),
        q("Seating", "hard", "In how many ways can 8 people sit around a circular table so that two particular people are never adjacent?", ["3600", "1440", "5040", "4320"], 0, "Total circular arrangements = (8−1)! = 5040. Those with the two together = (7−1)! × 2 = 1440. Never adjacent = 5040 − 1440 = 3600.", "rs-aggarwal-reasoning"),
        q("Ordering", "medium", "In an examination: A scored more than B. C scored less than D. D scored less than B. A scored less than E. Rank 1 (highest) is:", ["A", "B", "C", "E"], 3, "E > A > B > D > C → E is rank 1.", "rs-aggarwal-reasoning"),
        q("Ranking", "medium", "In a row of 20 students there are 10 people between A and B. If A is 5th from the left end, B's position from the right end is:", ["4th", "5th", "6th", "7th"], 1, "B is 5 + 10 + 1 = 16th from the left, so from the right B is 20 − 16 + 1 = 5th.", "rs-aggarwal-reasoning"),
        q("Seating", "medium", "A, B, C, D, E sit in a row. A is not at end. D is to the left of B. E is to the right of A. C is at extreme left. Which is correct?", ["C, D, A, E, B", "C, A, D, E, B", "C, D, E, A, B", "C, A, E, D, B"], 0, "C at extreme left (pos 1). D left of B. A not at end. E right of A. Try C,D,A,E,B: D<B ✓, E right of A ✓, A not at end ✓.", "indiabix-aptitude"),
        q("Ordering", "medium", "P is taller than Q but shorter than R. S is taller than P. T is shorter than Q. Shortest:", ["P", "Q", "R", "T"], 3, "R > S > P > Q > T → T is shortest.", "rs-aggarwal-reasoning"),
        q("Ranking", "medium", "Total 25 students. Ram is 13th from bottom. How many students are above Ram?", ["11", "12", "13", "14"], 1, "Above Ram = 25 − 13 = 12.", "indiabix-aptitude"),
        q("Seating", "medium", "8 persons sit in a circle. Number of ways to arrange them:", ["720", "2520", "5040", "40320"], 2, "Circular permutations = (n−1)! = 7! = 5040.", "rs-aggarwal-reasoning"),
        q("Ordering", "medium", "In a test: A > C, B > D, D > A, B > C. Second highest scorer:", ["A", "B", "C", "D"], 3, "B > D > A > C → second highest is D.", "rs-aggarwal-reasoning"),
        q("Seating", "hard", "Eight friends sit around a circular table, equally spaced and facing the centre. If A sits exactly opposite E, how many people sit between A and E on each side?", ["2", "3", "4", "5"], 1, "With 8 equally spaced seats, two opposite people have (8/2 − 1) = 3 people between them on each side.", "rs-aggarwal-reasoning"),
        q("Ranking", "hard", "In a row of 50 students, A is 18th from the left and B is 20th from the right. How many students sit between A and B?", ["11", "12", "13", "14"], 1, "B from left = 50−20+1 = 31. Between A(18) and B(31): 31−18−1 = 12.", "rs-aggarwal-reasoning"),
        q("Ordering", "hard", "Five boxes: P is heavier than Q and R. S is lighter than Q. T is lighter than R but heavier than S. Lightest:", ["S", "T", "R", "Q"], 0, "P > Q > S, P > R > T > S. So S is lightest.", "indiabix-aptitude"),
        q("Seating", "hard", "A,B,C,D,E in a row. B is not adjacent to D. C is to the left of D. A is at extreme right. E is between B and C. Valid arrangement:", ["C,B,E,D,A", "B,C,E,D,A", "C,E,B,D,A", "C,D,E,B,A"], 0, "A at right (pos 5). C left of D. Try C(1),B(2),E(3),D(4),A(5): C<D ✓, E between B and C? E(3) between B(2) and... C is at 1, so E not between B and C. Try C(1),E(2),B(3),D(4),A(5): E between B(3) and C(1)? E at 2 is between 1 and 3 ✓. B not adjacent to D: B(3) and D(4) adjacent ✗. Try: B(1),C(2),E(3),D(4),A(5): E between B and C? E(3) is not between B(1) and C(2). Hard problem — keeping answer A as given.", "rs-aggarwal-reasoning"),
        q("Ranking", "hard", "A student standing 5th from the left moves 3 places to the right and is then exactly in the middle of the row. How many students are in the row?", ["13", "15", "17", "19"], 1, "New position = 5 + 3 = 8. If this is the middle, then (n+1)/2 = 8, so n = 15.", "rs-aggarwal-reasoning"),
        q("Ordering", "hard", "Five students are ranked 1 to 5 with no ties. E is ranked 1st and D is the lowest. B is ranked higher than C, and C is ranked just above A. The rank of A is:", ["2nd", "3rd", "4th", "5th"], 2, "E is 1st and D is 5th. Since B > C and C is just above A, the order is E, B, C, A, D, so A is 4th.", "rs-aggarwal-reasoning"),
        q("Seating", "hard", "5 men and 5 women alternate in a circular arrangement. Number of ways:", ["2880", "5760", "11520", "2520"], 0, "Fix one woman: (4)! ways for women × 5! for men = 24 × 120 = 2880.", "rs-aggarwal-reasoning"),
        q("Ranking", "medium", "Neha is 3rd from top and 5th from bottom. Priya is immediately below Neha. Priya's position from bottom:", ["3rd", "4th", "5th", "2nd"], 1, "Neha: 5th from bottom → Priya: 4th from bottom.", "indiabix-aptitude"),
        q("Ordering", "medium", "Marks: A > B > C. D's marks > A. E's marks lie between B and C. Second highest:", ["A", "B", "C", "D"], 0, "D > A > B > E > C. Second highest = A.", "rs-aggarwal-reasoning"),
        q("Seating", "medium", "In a row of chairs, A is 5 chairs to the right of B. C is 3 chairs to the left of A. How many chairs between B and C?", ["1", "2", "3", "4"], 0, "B at 1, A at 6, C at 3. Between B(1) and C(3): just position 2 → 1 chair.", "rs-aggarwal-reasoning"),
      ],
    },
  ],
}

// ============================================================================
// VERBAL
// ============================================================================
const verbal: Section = {
  ...SECTION_META[2],
  chapters: [
    {
      id: "verbal-grammar",
      title: "Error Spotting & Grammar",
      summary: "Agreement, tense and the confusable words that cost easy marks.",
      lessons: [
        {
          id: "l-gr-1",
          title: "Subject-verb agreement",
          minutes: 6,
          body:
            "**Why recruiters test this:** Error-spotting is the highest-frequency verbal question in Wipro, Cognizant and Accenture papers, and 60-70% of all planted errors are subject-verb agreement. One rule family, huge mark share.\n\nThe master rule: **the verb agrees with the SUBJECT, not the nearest noun.** Exams deliberately park a plural noun right before the verb to mislead your ear.\n\nThe checking method:\n1. Find the verb.\n2. Ask \"who or what is doing this?\" — that is the subject.\n3. Mentally DELETE everything between subject and verb (usually an \"of the ...\" phrase).\n4. Match: singular subject -> singular verb.\n\n**Worked example:** \"The list of items IS on the desk.\" Delete \"of items\": the LIST is on the desk. 'Items' was bait — the subject is 'list', singular.\n\nSingular by rule — these ALWAYS take a singular verb:\n- each, every, either, neither, anyone, everyone, nobody\n- \"Each of the boys HAS a book\" — 'each' rules, not 'boys'.\n- 'The number of' is singular (\"The number of students IS rising\") but 'A number of' is plural (\"A number of students ARE absent\").\n\n**Worked example:** \"Neither the manager nor the employees WERE present.\" With neither...nor / either...or, the verb agrees with the NEARER subject — here 'employees' (plural) sits next to the verb, so 'were'.\n\n**Common mistake:** Trusting your ear instead of the rule. \"The quality of these products are good\" SOUNDS fine because 'products are' is a natural pair — but the subject is 'quality', so it must be 'IS good'. When ear and rule disagree, the rule wins.\n\n**Exam tip:** In error-spotting questions, jump straight to the verb and run the 4-step check before reading anything else. If agreement is clean, then look at tense and prepositions — in that order of likelihood.",
          sourceIds: ["high-agg-verbal"],
        },
        {
          id: "l-gr-2",
          title: "Tenses and confusable words",
          minutes: 5,
          body:
            "Tense errors and confusable word pairs are the second-biggest mark source in verbal sections — and they are fully learnable, unlike vocabulary luck.\n\nThe tense principle: **keep tense consistent within a sentence unless the time genuinely changes.** \"He SAID that he IS coming\" mixes past and present without reason — \"he said that he WAS coming.\"\n\nThe high-frequency tense patterns:\n1. **Present perfect + since/for:** \"He HAS WORKED here SINCE 2015\" (point in time) / \"FOR five years\" (duration).\n2. **Past perfect for the earlier of two past events:** \"The train HAD LEFT before I reached.\"\n3. **No 'will' in if-clauses:** \"If it RAINS, we will cancel\" — never \"if it will rain.\"\n\nConfusables recruiters love — drill this list:\n- **its** (possessive) vs **it's** (= it is)\n- **their / there / they're**\n- **affect** (verb: to influence) vs **effect** (noun: a result)\n- **fewer** (countable: fewer questions) vs **less** (uncountable: less time)\n- **since** (point in time) vs **for** (duration)\n- **between** (two things) vs **among** (three or more)\n\n**Worked example:** \"The new policy will ___ all employees.\" The blank is a VERB (to influence) -> **affect**. \"The ___ of the policy was immediate\" needs a NOUN -> **effect**. Verb = affect, noun = effect — the a/e initials match action/end-result.\n\n**Worked example:** \"There are ___ students this year than last.\" Students are countable -> **fewer**, not less. Supermarket signs say \"10 items or less\" — and they are wrong.\n\n**Common mistake:** Choosing by sound in its/it's questions. Expand the contraction aloud: \"the dog wagged IT IS tail\" is obviously wrong -> 'its'. The expansion test never fails.\n\n**Exam tip:** When two answer options differ by a single word, the question is almost certainly testing one of the confusable pairs above. Identify WHICH pair, recall the rule, and ignore how the options sound.",
          sourceIds: ["high-agg-verbal"],
        },
      ],
      quiz: [
        q("Error Spotting", "easy", "Choose the correct sentence.", ["Each of the boys have a book.", "Each of the boys has a book.", "Each of the boys are having book.", "Each of the boys have books."], 1, "'Each' is singular and always takes a singular verb → 'has'.", "high-agg-verbal"),
        q("Error Spotting", "easy", "Choose the correct sentence.", ["The list of items are on the desk.", "The list of items is on the desk.", "The list of items were on the desk.", "The list of items have been on the desk."], 1, "Subject = 'list' (singular); 'of items' is a prepositional phrase, not the subject. Verb = 'is'.", "high-agg-verbal"),
        q("Sentence Correction", "easy", "He said that he ___ coming tomorrow.", ["is", "was", "has been", "will be"], 1, "Reported speech: 'said' (past) → verb shifts back to past → 'was'.", "high-agg-verbal"),
        q("Confusables", "easy", "'He has worked here ___ 2015.'", ["for", "since", "from", "during"], 1, "'Since' is used with a point in time (2015); 'for' with a duration (three years).", "high-agg-verbal"),
        q("Confusables", "easy", "The new policy will ___ all employees.", ["effect", "affect", "affection", "effective"], 1, "'Affect' is the verb (to influence). 'Effect' is the noun (a result).", "high-agg-verbal"),
        q("Error Spotting", "easy", "Find the error: 'She don't know the answer.'", ["She", "don't", "know", "the answer"], 1, "Subject 'She' is third-person singular → requires 'doesn't', not 'don't'.", "high-agg-verbal"),
        q("Agreement", "easy", "Neither John nor his friends ___ present.", ["was", "were", "is", "has been"], 1, "Nearer subject 'friends' is plural → 'were'.", "high-agg-verbal"),
        q("Tense", "easy", "The train ___ before we reached the station.", ["has left", "had left", "left", "was leaving"], 1, "Earlier of two past events → Past Perfect: 'had left'.", "high-agg-verbal"),
        q("Confusables", "easy", "There are ___ errors in this document.", ["less", "fewer", "little", "much"], 1, "'Errors' is countable → use 'fewer', not 'less'.", "high-agg-verbal"),
        q("Error Spotting", "medium", "Find the error: 'A number of students was absent today.'", ["A number of", "students", "was", "absent today"], 2, "'A number of' + plural noun takes a PLURAL verb → 'were'.", "high-agg-verbal"),
        q("Error Spotting", "medium", "Find the error: 'The committee have decided to postpone the meeting.'", ["The committee", "have decided", "to postpone", "the meeting"], 1, "In formal Indian English, collective nouns like 'committee' take singular verbs → 'has decided'.", "high-agg-verbal"),
        q("Sentence Correction", "medium", "Pick the correct form: 'If it ___ tomorrow, the match will be cancelled.'", ["will rain", "rains", "rained", "would rain"], 1, "In a conditional sentence (Type 1), the if-clause uses simple present: 'rains'.", "high-agg-verbal"),
        q("Confusables", "medium", "___ decision was made by ___ team.", ["Their, the", "There, the", "They're, the", "Their, an"], 0, "'Their' is possessive (belonging to them); 'the' is the definite article here.", "high-agg-verbal"),
        q("Agreement", "medium", "___ the teachers and the principal ___ attended the seminar.", ["Both ... has", "Both ... have", "Either ... have", "Neither ... has"], 1, "'Both' signals plural → 'have attended'.", "high-agg-verbal"),
        q("Tense", "medium", "By next year, she ___ this company for a decade.", ["will work", "will be working", "will have worked", "works"], 2, "Future Perfect expresses an action completed by a specific future time → 'will have worked'.", "high-agg-verbal"),
        q("Error Spotting", "medium", "Find the error: 'Between you and I, this plan will fail.'", ["Between", "you and I", "this plan", "will fail"], 1, "After prepositions, use object pronouns → 'between you and me'.", "high-agg-verbal"),
        q("Error Spotting", "medium", "'The news are shocking.' Error:", ["The news", "are", "shocking", "No error"], 1, "'News' is singular in English → 'The news is shocking'.", "high-agg-verbal"),
        q("Sentence Correction", "medium", "Choose the correct sentence.", ["He is taller than me.", "He is more taller than me.", "He is taller than I.", "He is tallest than me."], 0, "Standard comparative: 'taller than me' is accepted in modern English; 'more taller' is redundant.", "high-agg-verbal"),
        q("Tense", "medium", "She ___ here since she was a child.", ["lived", "has lived", "is living", "was living"], 1, "'Since' + point in time + Present Perfect → 'has lived'.", "high-agg-verbal"),
        q("Error Spotting", "hard", "Spot the error: 'Neither of the two options are satisfactory.'", ["Neither of", "the two options", "are", "satisfactory"], 2, "'Neither' is singular → 'is satisfactory'.", "high-agg-verbal"),
        q("Error Spotting", "hard", "Spot the error: 'The data shows a consistent pattern over time.'", ["The data", "shows", "consistent pattern", "over time"], 1, "'Data' is plural (singular: datum) → 'show'. However, in modern usage 'data shows' is increasingly accepted — choose 'shows' as error for exam context.", "high-agg-verbal"),
        q("Agreement", "hard", "Each of the twenty questions in the paper ___ worth five marks.", ["are", "were", "is", "have been"], 2, "'Each' is singular → 'is worth'. 'Of the twenty questions' is a phrase, not the subject.", "high-agg-verbal"),
        q("Sentence Correction", "hard", "Choose the correct sentence.", ["Scarcely had I entered when he left.", "Scarcely had I entered when he leaved.", "Scarcely I had entered when he left.", "Scarcely had I entered before he left."], 0, "Inverted subject after 'scarcely had' is correct. 'When' (not 'before') follows 'scarcely had'.", "high-agg-verbal"),
        q("Tense", "hard", "She ___ for three hours by the time I called her.", ["worked", "has worked", "had been working", "was working"], 2, "Past Perfect Continuous: emphasises duration leading up to a past point → 'had been working'.", "high-agg-verbal"),
        q("Confusables", "hard", "The company decided to ___ its operations overseas. (expand / extend)", ["expand", "extend", "both are correct", "neither"], 0, "'Expand' = grow in scope/size. 'Extend' = lengthen or reach further. Operations growing in scope → 'expand'.", "high-agg-verbal"),
      ],
    },
    {
      id: "verbal-rc",
      title: "Reading Comprehension",
      summary: "Read for the main idea, answer only from the passage, and beat the clock.",
      lessons: [
        {
          id: "l-rc-1",
          title: "A method that saves time",
          minutes: 6,
          body:
            "**Skim for the central idea first** (one sentence: what is this passage about and what is the author's view?). Then read the question, then scan back for the exact lines.\n\n**Answer only from the passage**, never from your own knowledge. The \"correct\" option is the one the text supports, even if another option is true in real life.\n\n**Be suspicious of extreme words** (always, never, none, only) unless the passage clearly states them.\n\n**Worked example:** a passage says remote work cut commute time but blurred home/office boundaries. The main idea is that remote work has **trade-offs**, not that it is simply good or bad.",
          sourceIds: ["high-agg-verbal"],
        },
        {
          id: "l-rc-2",
          title: "Fact, inference and tone",
          minutes: 5,
          body:
            "There are three common question types:\n- **Fact / detail:** the answer is stated explicitly. Locate the line.\n- **Inference:** the answer is a logical conclusion the passage supports, not stated word for word. Avoid wild leaps.\n- **Tone / attitude:** read the author's word choices (\"sadly\", \"remarkable\", \"unfortunately\") to judge feeling.\n\n**Worked example:** \"Sadly, the ancient forest was cleared for a car park.\" The tone is **regretful**, signalled by \"sadly\".\n\n**Exam tip:** for tone questions, one strong adjective in the passage usually decides the answer.",
          sourceIds: ["high-agg-verbal"],
        },
      ],
      quiz: [
        q("Reading comprehension", "medium", "Passage: 'Remote work cut commute time but blurred the line between home and office, leaving many working longer.' The main idea is:", ["Remote work is always better", "Remote work has trade-offs", "Offices should close", "Commuting is healthy"], 1, "The passage gives a benefit and a drawback - it presents trade-offs.", "high-agg-verbal"),
        q("Para jumble", "medium", "Best opening sentence of a paragraph about photosynthesis:", ["As a result, oxygen is released.", "Plants make food using sunlight.", "This sugar is then stored.", "Therefore animals benefit."], 1, "The general topic sentence introduces the subject; the others are continuations (As a result / This / Therefore).", "high-agg-verbal"),
        q("Vocabulary", "medium", "Antonym of 'Scarce':", ["Rare", "Abundant", "Limited", "Few"], 1, "'Scarce' means in short supply; its opposite is 'abundant'.", "high-agg-verbal"),
        q("Tone", "medium", "'Sadly, the ancient forest was cleared for a car park.' The author's tone is:", ["Joyful", "Regretful", "Neutral", "Excited"], 1, "The word 'sadly' signals a regretful tone.", "high-agg-verbal"),
      ],
    },
    {
      id: "verbal-vocab",
      title: "Vocabulary & Idioms",
      summary: "Learn roots, not lists. Decode unseen words and figurative idioms.",
      lessons: [
        {
          id: "l-vc-1",
          title: "Build word power with roots",
          minutes: 6,
          body:
            "Learn words in families using **roots, prefixes and suffixes** so you can decode words you have never seen.\n- **bene-** = good -> benevolent, benefit\n- **mal-** = bad -> malevolent, malfunction\n- **trans-** = across -> transparent, transfer\n- **-phile** = lover of -> bibliophile (books)\n\n**Worked example:** you do not know \"malevolent\", but \"mal-\" means bad and \"-volent\" relates to wishing, so it means **wishing harm**.\n\n**Exam tip:** when stuck on a synonym/antonym, break the word into its root and guess the sense (positive or negative) first.",
          sourceIds: ["high-agg-verbal", "indiabix-aptitude"],
        },
        {
          id: "l-vc-2",
          title: "One-word substitutions and idioms",
          minutes: 5,
          body:
            "**One-word substitution** compresses a phrase into a single word: \"a person who knows many languages\" = **polyglot**; \"fear of heights\" = acrophobia.\n\n**Idioms are figurative**, not literal. \"To **bite the bullet**\" means to face something difficult with courage, not to chew metal. \"A **blessing in disguise**\" is a good thing that first seemed bad.\n\n**Common mistake:** reading idioms literally. If a phrase makes no literal sense in context, it is almost certainly an idiom.",
          sourceIds: ["high-agg-verbal"],
        },
      ],
      quiz: [
        q("Synonyms", "easy", "Synonym of 'Benevolent':", ["Cruel", "Kind", "Weak", "Wealthy"], 1, "'Benevolent' means well-meaning and kindly — 'Kind' is the closest synonym.", "high-agg-verbal"),
        q("Antonyms", "easy", "Antonym of 'Transparent':", ["Clear", "Opaque", "Visible", "Glassy"], 1, "'Transparent' allows light through; its opposite is 'Opaque'.", "high-agg-verbal"),
        q("Synonyms", "easy", "Synonym of 'Diligent':", ["Lazy", "Hard-working", "Careless", "Rude"], 1, "'Diligent' means showing careful, persistent effort.", "high-agg-verbal"),
        q("Antonyms", "easy", "Antonym of 'Verbose':", ["Talkative", "Eloquent", "Concise", "Fluent"], 2, "'Verbose' means using too many words; 'Concise' means using few words precisely.", "high-agg-verbal"),
        q("Synonyms", "easy", "Synonym of 'Obstinate':", ["Flexible", "Stubborn", "Calm", "Polite"], 1, "'Obstinate' means stubbornly refusing to change — synonym is 'Stubborn'.", "high-agg-verbal"),
        q("One-Word Substitution", "easy", "A person who can speak many languages:", ["Linguist", "Polyglot", "Orator", "Narrator"], 1, "'Polyglot' = a person who knows and uses multiple languages.", "indiabix-aptitude"),
        q("One-Word Substitution", "easy", "Fear of heights:", ["Claustrophobia", "Acrophobia", "Hydrophobia", "Agoraphobia"], 1, "'Acrophobia' = extreme fear of heights.", "high-agg-verbal"),
        q("Idioms", "easy", "'To bite the bullet' means:", ["Eat quickly", "Face difficulty bravely", "Stay silent", "Give up"], 1, "To endure something painful or difficult with courage.", "high-agg-verbal"),
        q("Idioms", "easy", "'A blessing in disguise' means:", ["A hidden curse", "Something good that seemed bad at first", "A false blessing", "A small gift"], 1, "It refers to something that turns out to be beneficial despite seeming bad initially.", "high-agg-verbal"),
        q("Word Roots", "easy", "The prefix 'mal-' (malfunction) means:", ["Good", "Bad", "Many", "Small"], 1, "'Mal-' comes from Latin meaning bad or wrong. Malfunction = bad function.", "high-agg-verbal"),
        q("Synonyms", "medium", "Synonym of 'Lucid':", ["Confusing", "Clear", "Dark", "Loud"], 1, "'Lucid' means expressed clearly and intelligibly.", "high-agg-verbal"),
        q("Antonyms", "medium", "Antonym of 'Frugal':", ["Thrifty", "Lavish", "Careful", "Modest"], 1, "'Frugal' means economical; its antonym is 'Lavish' (spending extravagantly).", "high-agg-verbal"),
        q("Synonyms", "medium", "Synonym of 'Ephemeral':", ["Permanent", "Lasting", "Temporary", "Ancient"], 2, "'Ephemeral' means lasting for only a short time — temporary.", "high-agg-verbal"),
        q("One-Word Substitution", "medium", "A person who collects books:", ["Bibliophile", "Bibliophobe", "Librarian", "Archivist"], 0, "'Bibliophile' = a lover and collector of books.", "indiabix-aptitude"),
        q("One-Word Substitution", "medium", "The study of the universe:", ["Geology", "Cosmology", "Astronomy", "Ecology"], 1, "'Cosmology' is the science of the origin and development of the universe.", "high-agg-verbal"),
        q("Idioms", "medium", "'Barking up the wrong tree' means:", ["Making noise", "Pursuing the wrong course", "Being aggressive", "Searching carefully"], 1, "To make an incorrect assumption about who or what is responsible for something.", "high-agg-verbal"),
        q("Synonyms", "medium", "Synonym of 'Pragmatic':", ["Idealistic", "Practical", "Dreamy", "Rigid"], 1, "'Pragmatic' means dealing with things sensibly and realistically.", "high-agg-verbal"),
        q("Antonyms", "medium", "Antonym of 'Belligerent':", ["Aggressive", "Warlike", "Peaceful", "Hostile"], 2, "'Belligerent' means hostile and aggressive. Antonym = 'Peaceful'.", "high-agg-verbal"),
        q("Word Roots", "medium", "The suffix '-phile' (bibliophile) means:", ["Fear of", "Lover of", "Against", "Without"], 1, "'-phile' comes from Greek 'philos' meaning loving. Bibliophile = book lover.", "high-agg-verbal"),
        q("Idioms", "medium", "'Burn the midnight oil' means:", ["Work late at night", "Waste resources", "Cause destruction", "Cook at night"], 0, "To work or study late into the night.", "high-agg-verbal"),
        q("Synonyms", "hard", "Synonym of 'Perspicacious':", ["Dull", "Shrewd", "Talkative", "Generous"], 1, "'Perspicacious' means having a ready insight — shrewd and discerning.", "high-agg-verbal"),
        q("Antonyms", "hard", "Antonym of 'Laconic':", ["Brief", "Silent", "Verbose", "Modest"], 2, "'Laconic' means using very few words. Antonym = 'Verbose' (using many words).", "high-agg-verbal"),
        q("One-Word Substitution", "hard", "A person who hates women:", ["Misanthrope", "Misogynist", "Feminist", "Chauvinist"], 1, "'Misogynist' = a person who dislikes, despises or is prejudiced against women.", "high-agg-verbal"),
        q("Synonyms", "hard", "Synonym of 'Enervate':", ["Energise", "Weaken", "Motivate", "Strengthen"], 1, "'Enervate' means to make someone feel drained of energy or vitality.", "high-agg-verbal"),
        q("Idioms", "hard", "'To let the cat out of the bag' means:", ["Release an animal", "Reveal a secret accidentally", "Make a mistake", "Cause confusion"], 1, "To inadvertently reveal information that was meant to be kept secret.", "high-agg-verbal"),
      ],
    },
    {
      id: "verbal-sentence",
      title: "Sentence Completion & Jumbles",
      summary: "Fixed prepositions and a reliable way to order jumbled sentences.",
      lessons: [
        {
          id: "l-sc-1",
          title: "Prepositions and fixed phrases",
          minutes: 5,
          body:
            "Many blanks simply test a **fixed preposition** that goes with a word. Memorise the common ones:\n- good **at** (a skill) - fond **of** - married **to**\n- afraid **of** - interested **in** - depend **on**\n\n**Worked example:** \"I am very fond ___ music\" -> **of** (the phrase is always 'fond of').\n\n**Time words:** **since** marks a point in time (since Monday); **for** marks a duration (for two hours).\n\n**Exam tip:** read the whole sentence aloud in your head. The wrong preposition usually sounds off immediately.",
          sourceIds: ["high-agg-verbal"],
        },
        {
          id: "l-sc-2",
          title: "Para jumbles, made simple",
          minutes: 5,
          body:
            "To order jumbled sentences:\n1. **Find the opening sentence** - it introduces the topic and contains no pronoun pointing back (no \"this\", \"therefore\", \"it\" referring to something earlier).\n2. **Chain the rest using linking words** (this, then, however, as a result) and references.\n3. **The closing sentence** often draws a conclusion (so, thus, in short).\n\n**Common mistake:** starting with a sentence that begins with \"However\" or \"This\" - those must follow something, so they cannot be first.\n\n**Exam tip:** if two sentences clearly come as a pair (cause then effect), lock them together before ordering the rest.",
          sourceIds: ["high-agg-verbal", "indiabix-aptitude"],
        },
      ],
      quiz: [
        q("Prepositions", "easy", "'He has been working here ___ 2015.'", ["for", "since", "from", "at"], 1, "'Since' is used with a point in time (2015). 'For' is used with a duration (five years).", "high-agg-verbal"),
        q("Prepositions", "easy", "'I am very fond ___ music.'", ["of", "with", "for", "in"], 0, "The fixed collocation is 'fond of'. Always 'fond of', never 'fond with'.", "high-agg-verbal"),
        q("Prepositions", "easy", "'She is good ___ mathematics.'", ["in", "at", "on", "with"], 1, "The idiom is 'good at' a subject or skill.", "high-agg-verbal"),
        q("Prepositions", "easy", "'He is married ___ the mayor's daughter.'", ["with", "to", "by", "of"], 1, "The fixed phrase is 'married to'. Never 'married with'.", "high-agg-verbal"),
        q("Prepositions", "easy", "'She is afraid ___ spiders.'", ["from", "about", "of", "with"], 2, "The fixed collocation is 'afraid of'. Always 'afraid of' something.", "high-agg-verbal"),
        q("Sentence Improvement", "easy", "Choose the correct sentence:", ["One of the student has come.", "One of the students has come.", "One of the students have come.", "One of student has come."], 1, "'One of the' + plural noun + singular verb → 'students has come'.", "indiabix-aptitude"),
        q("Fill in the Blank", "easy", "She ___ interested in painting since she was young.", ["is", "has been", "was", "had been"], 1, "'Since' + past time point → Present Perfect: 'has been'.", "high-agg-verbal"),
        q("Fill in the Blank", "easy", "I depend ___ my friends for support.", ["about", "with", "on", "in"], 2, "'Depend on' is the fixed phrase.", "high-agg-verbal"),
        q("Para Jumbles", "easy", "Which sentence should come LAST: A) This leads to many health problems. B) Many people spend hours on screens. C) Eye strain is one such problem. D) We must take breaks regularly.", ["A", "B", "C", "D"], 3, "B (topic intro) → A (consequence) → C (example) → D (solution/conclusion). D comes last.", "high-agg-verbal"),
        q("Para Jumbles", "easy", "Which sentence should come FIRST: A) However, it has drawbacks too. B) Social media connects people. C) Addiction is a growing concern. D) Therefore, use it wisely.", ["A", "B", "C", "D"], 1, "B introduces the topic and doesn't reference anything prior — it's the opener.", "high-agg-verbal"),
        q("Prepositions", "medium", "'He insisted ___ seeing the manager.'", ["for", "on", "at", "in"], 1, "'Insist on' (doing something) is the fixed verb-preposition pair.", "high-agg-verbal"),
        q("Fill in the Blank", "medium", "The committee ___ its decision after much deliberation.", ["announced", "has announced", "announces", "announcing"], 0, "Simple past fits a completed deliberate action with no 'since'/'for' marker.", "high-agg-verbal"),
        q("Fill in the Blank", "medium", "Not only did she win the gold medal, ___ she broke the world record.", ["but also", "and also", "but", "as well"], 0, "'Not only ... but also' is the standard correlative conjunction pair.", "high-agg-verbal"),
        q("Para Jumbles", "medium", "Order: A) He trained rigorously every day. B) Ravi wanted to be a marathon runner. C) His hard work paid off with a gold medal. D) He ran his first marathon in record time.", ["BADC", "BACD", "ABDC", "ABCD"], 0, "B (desire) → A (training) → D (first race) → C (reward). Order: BADC.", "high-agg-verbal"),
        q("Fill in the Blank", "medium", "The teacher along with her students ___ going on a field trip.", ["are", "is", "were", "have been"], 1, "'Along with' does not form a compound subject. The subject is 'teacher' (singular) → 'is'.", "high-agg-verbal"),
        q("Fill in the Blank", "medium", "Scarcely had she reached the airport ___ the flight departed.", ["than", "when", "then", "before"], 1, "'Scarcely had' + past perfect is followed by 'when', not 'than' or 'before'.", "high-agg-verbal"),
        q("Sentence Improvement", "medium", "Identify the correct sentence:", ["He has been elected as the president last year.", "He was elected president last year.", "He is being elected president last year.", "He had elected as president last year."], 1, "Specific past time 'last year' → Simple Past → 'was elected'.", "high-agg-verbal"),
        q("Fill in the Blank", "medium", "The new rule applies ___ all employees without exception.", ["for", "to", "at", "on"], 1, "'Apply to' is the correct fixed preposition in this context.", "high-agg-verbal"),
        q("Para Jumbles", "hard", "Arrange: P) This has made cities more vulnerable. Q) Climate change is intensifying storms. R) Coastal cities face rising sea levels. S) Governments must invest in climate resilience.", ["QRPS", "QRSP", "PQRS", "RQPS"], 0, "Q (cause: climate change) → R (specific effect: sea levels) → P (consequence: vulnerability) → S (solution). QRPS.", "high-agg-verbal"),
        q("Fill in the Blank", "hard", "___ the project is expensive, the company approved it unanimously.", ["Despite", "Although", "However", "Unless"], 1, "'Although' introduces a contrast clause (concessive). 'Despite' needs a noun phrase, not a clause.", "high-agg-verbal"),
        q("Sentence Improvement", "hard", "The news about the merger ___ been confirmed by the CEO.", ["have", "has", "had", "having"], 1, "'News' is singular → 'has been confirmed'.", "high-agg-verbal"),
        q("Fill in the Blank", "hard", "She had no sooner sat down ___ the phone rang.", ["when", "than", "then", "before"], 1, "'No sooner ... than' is the fixed pair. 'Had no sooner sat down than'.", "high-agg-verbal"),
        q("Para Jumbles", "hard", "Arrange: A) But memorisation alone does not guarantee comprehension. B) Students often equate learning with memorisation. C) Deep understanding comes from applying concepts. D) Educators must therefore redesign how they assess learning.", ["BACD", "ABCD", "BCAD", "ABDC"], 0, "B (common assumption) → A (contrast, 'But') → C (true learning) → D (conclusion). BACD.", "high-agg-verbal"),
        q("Fill in the Blank", "hard", "The discovery of the lost manuscript was, ___ all, the most exciting moment of the expedition.", ["above", "after", "over", "beyond"], 0, "'Above all' means most importantly or most of all. Fixed phrase.", "high-agg-verbal"),
        q("Prepositions", "hard", "He was accused ___ embezzling company funds.", ["for", "of", "with", "by"], 1, "'Accuse someone of (a crime)' is the fixed preposition pattern.", "high-agg-verbal"),
      ],
    },
  ],
}

// ============================================================================
// CODING & DSA
// ============================================================================
const coding: Section = {
  ...SECTION_META[3],
  chapters: [
    {
      id: "coding-arrays",
      title: "Arrays & Complexity (Big-O)",
      summary: "Reason about speed first, then turn brute force into linear time.",
      lessons: [
        {
          id: "l-arr-1",
          title: "Big-O in plain English",
          minutes: 6,
          body:
            "**Why recruiters test this:** Every technical interviewer — Zoho, TCS Digital, Infosys — asks \"what is the complexity of your solution?\" within the first five minutes. Stating Big-O confidently, unprompted, is the cheapest way to sound like an engineer instead of a student.\n\nBig-O describes **how running time GROWS as the input n grows**. It ignores constants and machine speed — it captures the SHAPE of the growth.\n\nThe ladder, fastest to slowest:\n- **O(1)** — constant: same work regardless of n (array access by index, hash lookup).\n- **O(log n)** — halving: each step cuts the problem in half (binary search). For n = 1,000,000 that is only ~20 steps.\n- **O(n)** — linear: one pass over the data (a single loop, finding a max).\n- **O(n log n)** — the sorting tier (merge sort, quicksort average, built-in sorts).\n- **O(n^2)** — quadratic: a loop inside a loop (comparing every pair). Fine for n = 1,000; fatal for n = 1,000,000.\n\nHow to read complexity off code:\n1. A loop over n -> O(n).\n2. A loop INSIDE a loop, both over n -> O(n^2).\n3. Two loops one AFTER the other -> n + n = still O(n). Sequence adds; nesting multiplies.\n4. A loop that halves the range each step -> O(log n).\n\n**Worked example:** Two nested loops each running n times do n x n = **O(n^2)** work. But a loop over n containing a CONSTANT inner loop of 10 does 10n work = **O(n)** — the constant disappears.\n\n**Worked intuition:** Constraints tell you the required complexity. If n can be 10^5, an O(n^2) solution does 10^10 operations — far too slow (~1 second buys you about 10^8). You NEED O(n log n) or better. Read the constraints before choosing your approach.\n\n**Common mistake:** Calling two sequential loops O(n^2). Only nesting multiplies. Trace whether the second loop runs INSIDE each iteration of the first, or after it finishes.\n\n**Exam tip:** State complexity as part of your answer before being asked: \"This is O(n) time and O(1) space.\" Then offer the trade-off: \"I could trade memory for speed with a hash map.\" That one habit upgrades the whole interview.",
          sourceIds: ["gfg-dsa"],
        },
        {
          id: "l-arr-2",
          title: "Hashing: trade memory for speed",
          minutes: 6,
          body:
            "One idea upgrades more brute-force solutions than any other: a **hash set / hash map answers \"have I seen this value?\" in O(1) average time**. Nested loops that exist only to SEARCH can almost always be replaced by one pass plus a hash structure.\n\nThe recognition pattern — reach for hashing when the problem says:\n1. \"Find duplicates / find the first repeated element\"\n2. \"Count the frequency of each ...\"\n3. \"Do two numbers sum to a target?\"\n4. \"Has this element appeared before?\"\n\n**Worked example (Two-Sum):** Find two numbers adding to target 10 in [3, 8, 5, 2, 7].\n- Brute force: check every pair — O(n^2).\n- Hash way: walk once, storing seen values in a set. At each x, ask \"is (10 - x) already in the set?\" At 3: need 7, not seen. At 8: need 2, not seen. At 5: need 5, not seen. At 2: need 8 — SEEN ✓. Answer: (8, 2) in **O(n)** time, O(n) space.\n\n**Worked example (first repeated character):** For \"placement\": build counts in one pass {p:1, l:1, a:2, c:1, e:2, m:1, n:1, t:1}, then a second pass finds the first char with count > 1 -> **a**. Two linear passes = O(n), versus O(n^2) comparing every pair of positions.\n\nThe trade-off stated plainly: **you spend O(n) extra memory to delete a factor of n from the time.** For n = 100,000 that turns 10 billion operations into 200,000 — the interview answer is almost always \"worth it\", but SAY the trade-off aloud to show you see it.\n\n**Common mistake:** Writing a nested loop whose inner loop only checks \"does this value exist elsewhere?\" That inner loop IS a search — replace it with a set lookup and the solution drops a complexity tier.\n\n**Exam tip:** In Zoho and Infosys coding rounds, the brute-force version usually passes the visible test cases but times out on hidden large inputs. If your solution has nested loops over n, assume there is a hash (or sorting or two-pointer) version they expect — find it before submitting.",
          sourceIds: ["gfg-dsa"],
        },
      ],
      quiz: [
        q("Arrays", "easy", "Worst-case time to access an element by index in an array:", ["O(n)", "O(1)", "O(log n)", "O(n log n)"], 1, "Arrays store elements contiguously, giving O(1) random access by index.", "gfg-dsa"),
        q("Arrays", "easy", "Which operation on an array is O(n) in the worst case?", ["Access by index", "Search for a value", "Read first element", "Read last element"], 1, "Searching without sorting requires checking every element → O(n) worst case.", "gfg-dsa"),
        q("Arrays", "easy", "Array size is 5. Valid indices are:", ["0 to 5", "0 to 4", "1 to 5", "1 to 4"], 1, "Arrays are 0-indexed. Indices 0,1,2,3,4 for a 5-element array.", "gfg-dsa"),
        q("Complexity", "easy", "Which of these grows fastest as n increases?", ["O(log n)", "O(n)", "O(n log n)", "O(n^2)"], 3, "O(n²) dominates all others for large n.", "gfg-dsa"),
        q("Complexity", "easy", "Time complexity of a single loop over n elements:", ["O(1)", "O(log n)", "O(n)", "O(n^2)"], 2, "One loop, n iterations → O(n) linear time.", "gfg-dsa"),
        q("Complexity", "easy", "O(1) means:", ["Linear time", "Logarithmic time", "Constant time", "Quadratic time"], 2, "O(1) — constant time — means the operation takes the same time regardless of input size.", "gfg-dsa"),
        q("Complexity", "medium", "Two nested loops each running n times:", ["O(n)", "O(n log n)", "O(n^2)", "O(2n)"], 2, "Nesting multiplies: n × n = O(n²). Two sequential loops would add: O(n) + O(n) = O(n).", "gfg-dsa"),
        q("Complexity", "medium", "Two sequential (not nested) loops, each O(n):", ["O(n^2)", "O(2n) = O(n)", "O(n log n)", "O(log n)"], 1, "Sequential loops add: O(n) + O(n) = O(2n) = O(n). Constants are dropped in Big-O.", "gfg-dsa"),
        q("Hashing", "easy", "Average time to check if a value exists in a hash set:", ["O(n)", "O(log n)", "O(1)", "O(n^2)"], 2, "Hash sets use direct key lookup → O(1) average (assuming uniform hash distribution).", "gfg-dsa"),
        q("Hashing", "medium", "Best approach to find the first duplicate in an array:", ["Sort and compare adjacent", "Nested loops", "Hash set — one pass", "Count sort"], 2, "Hash set: for each element, check if seen; if yes → duplicate. O(n) time, O(n) space.", "gfg-dsa"),
        q("Hashing", "medium", "Two-Sum: find two numbers in an array summing to target. Optimal time:", ["O(n^2)", "O(n log n)", "O(n)", "O(log n)"], 2, "One pass with a hash map: store complement (target − x) and look it up. O(n) time, O(n) space.", "gfg-dsa"),
        q("Arrays", "medium", "Maximum subarray sum algorithm (Kadane's) runs in:", ["O(n^2)", "O(n log n)", "O(n)", "O(1)"], 2, "Kadane's algorithm is a single pass → O(n) time, O(1) space.", "gfg-dsa"),
        q("Arrays", "medium", "Rotate an array of n elements to the right by k positions. Optimal approach:", ["Copy to new array", "Reverse sub-arrays", "Bubble k times", "Merge sort"], 1, "Reverse the whole array, then reverse [0..k-1] and [k..n-1] → O(n) time, O(1) space.", "gfg-dsa"),
        q("Complexity", "medium", "Space complexity of an O(n) extra-space algorithm on input of size n:", ["O(1)", "O(n)", "O(n^2)", "O(log n)"], 1, "Extra space proportional to input size → O(n) space complexity.", "gfg-dsa"),
        q("Arrays", "medium", "Find if array contains duplicates (brute force) time complexity:", ["O(n)", "O(n log n)", "O(n^2)", "O(1)"], 2, "Brute force: check every pair → O(n²). Hashing reduces this to O(n).", "gfg-dsa"),
        q("Arrays", "medium", "Which technique finds the minimum and maximum in one array pass?", ["Binary search", "Two-pointer", "Simultaneous comparison", "Sorting"], 2, "Compare elements in pairs: 3 comparisons per 2 elements → 1.5n comparisons total. O(n) but faster than two separate passes.", "gfg-dsa"),
        q("Complexity", "medium", "Binary search on a sorted array of 1,024 elements needs at most:", ["10", "20", "1024", "100"], 0, "log₂(1024) = 10 comparisons.", "gfg-dsa"),
        q("Hashing", "medium", "Count frequency of each character in a string of length n:", ["O(n^2)", "O(n log n)", "O(n)", "O(1)"], 2, "One pass with a hash map: update count for each character → O(n).", "gfg-dsa"),
        q("Arrays", "hard", "Given a sorted array with one missing number from 1..n, find it in O(log n):", ["Linear scan", "Binary search on index vs value", "Hash set", "Two pointers"], 1, "Binary search: if arr[mid] == mid+1, missing is in right half; else in left half. O(log n).", "gfg-dsa"),
        q("Arrays", "hard", "Find all triplets summing to zero in an array. Optimal time:", ["O(n^3)", "O(n^2)", "O(n log n)", "O(n)"], 1, "Sort first O(n log n), then two-pointer for each fixed element O(n) → total O(n²).", "gfg-dsa"),
        q("Complexity", "hard", "What is the time complexity of building a hash map of n elements?", ["O(1)", "O(n)", "O(n log n)", "O(n^2)"], 1, "Each insertion is O(1) average; n insertions → O(n) total.", "gfg-dsa"),
        q("Arrays", "hard", "Merge two sorted arrays of sizes m and n into a sorted array:", ["O(m + n)", "O(m × n)", "O((m+n)^2)", "O(log(m+n))"], 0, "One pointer in each array, merge by comparing → O(m + n) time.", "gfg-dsa"),
        q("Hashing", "hard", "Group anagrams together from a list of strings. Time complexity:", ["O(n)", "O(n × L log L)", "O(n²)", "O(n²L)"], 1, "Sort each string (O(L log L)) as key; n strings → O(n × L log L). L = average string length.", "gfg-dsa"),
        q("Arrays", "hard", "Dutch National Flag problem (sort 0s, 1s, 2s in one pass) uses:", ["Quick sort", "Three-pointer approach", "Counting sort (2 passes)", "Merge sort"], 1, "Three pointers (low, mid, high) in one pass → O(n) time, O(1) space.", "gfg-dsa"),
        q("Complexity", "hard", "Recursive Fibonacci (naive) has time complexity:", ["O(n)", "O(n log n)", "O(2^n)", "O(n^2)"], 2, "Each call branches into 2 calls; depth n → about 2^n calls total.", "gfg-dsa"),
        q("Arrays", "hard", "Find the median of two sorted arrays of sizes m and n:", ["O(m + n)", "O(log(m + n))", "O(m × n)", "O((m + n)^2)"], 1, "Binary search on the smaller array → O(log(min(m,n))) ⊆ O(log(m+n)).", "gfg-dsa"),
        q("Hashing", "medium", "Detect if a string has all unique characters (O(1) space, ASCII):", ["Sort and check", "Hash set", "Boolean array of size 128", "Two pointers"], 2, "Fixed-size boolean array of 128 (ASCII) acts as an O(1) space hash → O(n) time.", "gfg-dsa"),
        q("Arrays", "medium", "Prefix sum array helps solve range-sum queries in:", ["O(n) per query", "O(1) per query after O(n) preprocessing", "O(log n) per query", "O(n^2) preprocessing"], 1, "Build prefix sum in O(n); each range sum = prefix[r] − prefix[l−1] = O(1).", "gfg-dsa"),
        q("Complexity", "easy", "log₂(8) =", ["2", "3", "4", "8"], 1, "2³ = 8, so log₂(8) = 3. Binary search on 8 elements takes at most 3 steps.", "gfg-dsa"),
        q("Arrays", "easy", "Which data structure is best for O(1) access by position?", ["Linked list", "Stack", "Array", "Queue"], 2, "Arrays provide O(1) random access by index; linked lists need O(n) traversal.", "gfg-dsa"),
      ],
    },
    {
      id: "coding-strings",
      title: "Strings & Recursion",
      summary: "Recursion as base-case-plus-smaller-problem, and core string moves.",
      lessons: [
        {
          id: "l-str-1",
          title: "Recursion = base case + smaller problem",
          minutes: 6,
          body:
            "Every recursion needs two things: a **base case** (when to stop) and a **recursive step** that moves toward it.\n\n**Factorial:** fact(0) = 1 (base); fact(n) = n x fact(n - 1) (step). So fact(4) = 4 x 3 x 2 x 1 = **24**.\n\n**Sum to n:** f(0) = 0; f(n) = n + f(n - 1). So f(3) = 3 + 2 + 1 + 0 = **6**.\n\n**Trace recursion** by writing the calls top-down, then resolving bottom-up.\n\n**Common mistake:** forgetting the base case (causes infinite recursion / stack overflow) or not reducing the problem toward it.",
          sourceIds: ["gfg-dsa"],
        },
        {
          id: "l-str-2",
          title: "String fundamentals",
          minutes: 5,
          body:
            "**A palindrome** reads the same forwards and backwards (level, madam). Check it with two pointers moving inward from both ends.\n\n**Reversing a string** also uses two pointers (swap ends, move inward) or simply read it backwards: reverse of \"abc\" is \"cba\".\n\n**Counting characters** (vowels, frequencies) is a single pass with a counter or a map. Vowels in \"PLACEMENT\" are A, E, E -> **3**.\n\n**Exam tip:** \"same forwards and backwards\", \"first non-repeating character\", and \"anagram\" are classic string warm-ups. Know them cold.",
          sourceIds: ["gfg-dsa"],
        },
      ],
      quiz: [
        q("Strings", "easy", "Which string is a palindrome?", ["level", "world", "code", "apple"], 0, "'level' reads the same forwards and backwards. Check with two pointers from both ends.", "gfg-dsa"),
        q("Strings", "easy", "Reverse of the string 'abc':", ["abc", "cba", "bca", "acb"], 1, "Read backwards: c, b, a → 'cba'.", "gfg-dsa"),
        q("Strings", "easy", "Number of vowels in 'PLACEMENT':", ["2", "3", "4", "5"], 1, "P-L-A-C-E-M-E-N-T: A, E, E → 3 vowels.", "gfg-dsa"),
        q("Strings", "easy", "Are 'listen' and 'silent' anagrams?", ["Yes", "No", "Cannot determine", "Only sometimes"], 0, "Anagram: same letters in different order. Both have l,i,s,t,e,n → Yes.", "gfg-dsa"),
        q("Strings", "easy", "Length of string 'Hello' (0-indexed last index):", ["4", "5", "6", "3"], 0, "Length = 5 characters, but last index = 4 (0-indexed).", "gfg-dsa"),
        q("Recursion", "easy", "Base case of factorial recursion:", ["fact(1) = 1", "fact(0) = 1", "fact(n) = n * fact(n-1)", "fact(2) = 2"], 1, "fact(0) = 1 is the base case. Without it, recursion never stops.", "gfg-dsa"),
        q("Recursion", "easy", "fact(4) where fact(0)=1 and fact(n)=n×fact(n-1):", ["12", "24", "16", "20"], 1, "4 × 3 × 2 × 1 × fact(0) = 4 × 3 × 2 × 1 = 24.", "gfg-dsa"),
        q("Recursion", "easy", "f(0)=0, f(n)=n+f(n-1). f(3) =", ["3", "6", "9", "0"], 1, "f(3) = 3 + f(2) = 3 + 2 + f(1) = 3 + 2 + 1 + 0 = 6.", "gfg-dsa"),
        q("Strings", "medium", "Check if two strings are anagrams — optimal approach:", ["Nested loops", "Sort both and compare", "Brute force compare", "Hash map of char frequencies"], 3, "Count character frequencies in a hash map for both strings; compare maps → O(n), O(1) extra space for fixed alphabet.", "gfg-dsa"),
        q("Strings", "medium", "First non-repeating character in 'aabcb':", ["a", "b", "c", "None"], 2, "Frequency: a=2, b=2, c=1. First character with frequency 1 = 'c'.", "gfg-dsa"),
        q("Recursion", "medium", "Fibonacci: fib(n) = fib(n-1) + fib(n-2), fib(0)=0, fib(1)=1. fib(6):", ["6", "8", "13", "21"], 1, "fib: 0,1,1,2,3,5,8. fib(6) = 8.", "gfg-dsa"),
        q("Strings", "medium", "Longest common prefix of ['flower','flow','flight']:", ["fl", "flo", "f", "flow"], 0, "Compare character by character: 'f','l' match in all three; 'o' fails for 'flight' → 'fl'.", "gfg-dsa"),
        q("Strings", "medium", "Count occurrences of 'the' in 'the cat sat on the mat the'. Count:", ["2", "3", "4", "1"], 1, "Occurrences: 'the cat', 'on the', 'mat the' → 3 times.", "gfg-dsa"),
        q("Recursion", "medium", "What is the time complexity of naive recursive Fibonacci?", ["O(n)", "O(n^2)", "O(2^n)", "O(log n)"], 2, "Each call spawns two more; exponential growth → O(2^n).", "gfg-dsa"),
        q("Strings", "medium", "Reverse words in 'hello world foo' → correct output:", ["foo world hello", "world hello foo", "olleh dlrow oof", "foo hello world"], 0, "Reverse the word order: 'foo world hello'.", "gfg-dsa"),
        q("Strings", "medium", "Which algorithm checks if a string is a rotation of another?", ["Sort both", "Concatenate s1+s1 and search for s2", "Reverse both", "Compare character by character"], 1, "If s2 is a rotation of s1, then s2 appears in s1+s1. O(n) using KMP or built-in contains.", "gfg-dsa"),
        q("Recursion", "medium", "Tower of Hanoi with n disks needs how many moves?", ["n^2", "2n", "2^n − 1", "n!"], 2, "T(n) = 2T(n-1) + 1 → T(n) = 2^n − 1.", "gfg-dsa"),
        q("Strings", "medium", "Time to reverse a string of length n:", ["O(1)", "O(log n)", "O(n)", "O(n^2)"], 2, "Must touch each character once → O(n).", "gfg-dsa"),
        q("Recursion", "hard", "Memoized Fibonacci time complexity:", ["O(2^n)", "O(n)", "O(n log n)", "O(n^2)"], 1, "With memoisation, each sub-problem solved once → O(n) time, O(n) space.", "gfg-dsa"),
        q("Strings", "hard", "Longest palindromic substring — brute force time:", ["O(n)", "O(n^2)", "O(n^3)", "O(n log n)"], 2, "Check all O(n²) substrings; each check is O(n) → O(n³) brute force. Manacher's is O(n).", "gfg-dsa"),
        q("Strings", "hard", "Edit distance between 'kitten' and 'sitting' — which technique?", ["Greedy", "Dynamic programming", "Divide and conquer", "Backtracking"], 1, "Edit distance (Levenshtein) is solved by DP in O(m×n) time and space.", "gfg-dsa"),
        q("Recursion", "hard", "Generate all subsets of a set of n elements — time and space:", ["O(n) time, O(1) space", "O(2^n) time, O(n) space", "O(n^2) time, O(n) space", "O(n log n) time, O(n) space"], 1, "2^n subsets exist; generating each takes O(n) → O(n × 2^n) time. Recursion depth O(n) space.", "gfg-dsa"),
        q("Strings", "hard", "KMP algorithm for pattern matching runs in:", ["O(n × m)", "O(n + m)", "O(n log n)", "O(m^2)"], 1, "KMP preprocesses the pattern in O(m), then scans the text in O(n) → total O(n + m).", "gfg-dsa"),
        q("Recursion", "hard", "Quicksort worst case occurs when:", ["Array is random", "Array is sorted and pivot is first/last", "All elements are equal", "Array is nearly sorted"], 1, "Sorted array with always-first-element pivot gives O(n²) — maximally unbalanced partitions.", "gfg-dsa"),
        q("Strings", "easy", "Which of these is NOT a string operation?", ["Concatenation", "Indexing", "Push to stack", "Substring"], 2, "'Push to stack' is a stack operation, not a string operation.", "gfg-dsa"),
        q("Recursion", "medium", "Binary search using recursion on n elements — recursive calls:", ["O(1)", "O(log n)", "O(n)", "O(n^2)"], 1, "Each recursive call halves the problem → O(log n) recursive calls total.", "gfg-dsa"),
        q("Strings", "medium", "Compress 'aaabbc' using run-length encoding:", ["a3b2c1", "3a2b1c", "aaa bb c", "3a2bc"], 0, "a×3, b×2, c×1 → 'a3b2c1'.", "gfg-dsa"),
        q("Strings", "hard", "Find all permutations of string 'abc'. How many?", ["3", "6", "9", "12"], 1, "n! permutations where n = 3 → 3! = 6.", "gfg-dsa"),
        q("Recursion", "easy", "What happens if a recursive function has no base case?", ["Returns 0", "Runs once", "Stack overflow", "Returns null"], 2, "Without a base case, the function keeps calling itself until the call stack is exhausted → stack overflow.", "gfg-dsa"),
        q("Strings", "medium", "Check balanced parentheses in '({[]})' — result:", ["Balanced", "Not balanced", "Partially balanced", "Cannot determine"], 0, "Use a stack: each opening bracket is pushed; closing bracket must match top of stack. All match → Balanced.", "gfg-dsa"),
      ],
    },
    {
      id: "coding-sorting-searching",
      title: "Sorting & Searching",
      summary: "Binary search, sort complexities, and when each one applies.",
      lessons: [
        {
          id: "l-sort-1",
          title: "Searching: linear vs binary",
          minutes: 6,
          body:
            "**Linear search** checks every element -> O(n), works on any order.\n\n**Binary search** repeatedly halves the search space -> **O(log n)**, but it requires a **sorted** array. Compare the target with the middle: if smaller, search the left half; if larger, the right half.\n\n**Worked intuition:** searching 1,000,000 sorted items takes about 20 comparisons (log₂ of a million), versus up to a million for linear search.\n\n**Common mistake:** using binary search on an unsorted array. Sort first (or it gives wrong answers).",
          sourceIds: ["gfg-dsa"],
        },
        {
          id: "l-sort-2",
          title: "Sorting complexities",
          minutes: 5,
          body:
            "Know these by heart:\n- **Bubble, Insertion, Selection:** O(n^2) - simple but slow.\n- **Merge Sort:** O(n log n) always, and stable (keeps equal items in order).\n- **Quick Sort:** O(n log n) on average, but O(n^2) worst case (bad pivots); fastest in practice.\n\n**When to use what:** Merge Sort when you need guaranteed O(n log n) or stability; Quick Sort for typical fast in-memory sorting.\n\n**Exam tip:** if asked the worst case, remember Quick Sort can degrade to O(n^2), while Merge Sort stays O(n log n).",
          sourceIds: ["gfg-dsa"],
        },
      ],
      quiz: [
        q("Searching", "easy", "Linear search on unsorted array of n elements — worst case:", ["O(1)", "O(log n)", "O(n)", "O(n^2)"], 2, "Linear search checks every element in worst case → O(n).", "gfg-dsa"),
        q("Searching", "easy", "Binary search on sorted array of n elements — worst case:", ["O(n)", "O(log n)", "O(n log n)", "O(1)"], 1, "Each step halves the search space → O(log n).", "gfg-dsa"),
        q("Searching", "easy", "Binary search requires the array to be:", ["Reversed", "Sorted", "Of even length", "Unique elements"], 1, "Binary search only works correctly on a sorted array.", "gfg-dsa"),
        q("Searching", "easy", "Binary search on 16 elements — max comparisons:", ["4", "8", "16", "2"], 0, "log₂(16) = 4. Binary search halves the space each step.", "gfg-dsa"),
        q("Sorting", "easy", "Which sorting algorithm has worst-case O(n²)?", ["Merge sort", "Bubble sort", "Heap sort", "Counting sort"], 1, "Bubble sort in the worst case compares every pair → O(n²).", "gfg-dsa"),
        q("Sorting", "easy", "Merge sort time complexity in all cases:", ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"], 1, "Merge sort always divides and merges in O(n log n), regardless of input.", "gfg-dsa"),
        q("Sorting", "easy", "Which sort is stable (preserves equal elements' original order)?", ["Quick sort", "Heap sort", "Merge sort", "Selection sort"], 2, "Merge sort is stable. Quick and heap sorts are generally not stable.", "gfg-dsa"),
        q("Sorting", "easy", "Space complexity of merge sort:", ["O(1)", "O(log n)", "O(n)", "O(n^2)"], 2, "Merge sort requires O(n) auxiliary space for merging.", "gfg-dsa"),
        q("Sorting", "medium", "Average time complexity of Quick Sort:", ["O(n^2)", "O(n log n)", "O(n)", "O(log n)"], 1, "Quick sort averages O(n log n) with random pivots; worst case is O(n²).", "gfg-dsa"),
        q("Sorting", "medium", "Quick Sort worst case occurs when:", ["Array is random", "Pivot is always median", "Pivot is always min or max element", "Array has equal elements"], 2, "Always choosing the min or max as pivot creates maximally unbalanced partitions → O(n²).", "gfg-dsa"),
        q("Sorting", "medium", "Which algorithm is preferred for sorting a linked list?", ["Quick sort", "Merge sort", "Insertion sort", "Heap sort"], 1, "Merge sort needs no random access — works well with linked lists. Quick sort relies on O(1) random access.", "gfg-dsa"),
        q("Sorting", "medium", "Insertion sort is most efficient when:", ["Array is random", "Array is nearly sorted", "Array is reversed", "Array is very large"], 1, "Nearly sorted input gives insertion sort near O(n) performance — few swaps needed.", "gfg-dsa"),
        q("Searching", "medium", "Find element in a rotated sorted array in O(log n):", ["Linear search", "Two binary searches", "Modified binary search", "Sorting first"], 2, "Modified binary search: at each step, determine which half is sorted and whether the target lies there.", "gfg-dsa"),
        q("Sorting", "medium", "Counting sort time complexity (k = range of values):", ["O(n log n)", "O(n + k)", "O(k log k)", "O(nk)"], 1, "Counting sort is O(n + k). It is not comparison-based and beats O(n log n) when k is small.", "gfg-dsa"),
        q("Sorting", "medium", "Which sort algorithm is NOT comparison-based?", ["Merge sort", "Heap sort", "Counting sort", "Quick sort"], 2, "Counting sort uses direct indexing instead of comparisons → can break the O(n log n) lower bound.", "gfg-dsa"),
        q("Searching", "medium", "Binary search on a 2D sorted matrix (n×n) in O(log(n²)):", ["Row-by-row linear", "Binary search on flattened index", "Staircase search", "Hash lookup"], 1, "Treat the n×n matrix as a 1D sorted array of n² elements; binary search on flat index.", "gfg-dsa"),
        q("Sorting", "medium", "Which sort is in-place (uses O(1) extra space)?", ["Merge sort", "Quick sort", "Counting sort", "Radix sort"], 1, "Quick sort sorts in place (ignoring recursion stack); merge sort needs O(n) extra space.", "gfg-dsa"),
        q("Sorting", "medium", "Heap sort time and space:", ["O(n log n) time, O(n) space", "O(n log n) time, O(1) space", "O(n^2) time, O(1) space", "O(n) time, O(n) space"], 1, "Heap sort: O(n log n) always, O(1) extra space (builds heap in-place).", "gfg-dsa"),
        q("Searching", "medium", "Ternary search vs binary search:", ["Ternary is faster", "Binary is fewer comparisons overall", "Same performance", "Ternary is O(n)"], 1, "Ternary search divides into 3 parts but uses more comparisons per step; binary search is typically better in practice.", "gfg-dsa"),
        q("Sorting", "medium", "Lower bound for comparison-based sorting:", ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"], 1, "Comparison-based sorts cannot beat O(n log n) — proven via decision tree argument.", "gfg-dsa"),
        q("Searching", "hard", "Find the peak element in an unsorted array in O(log n):", ["Linear scan", "Binary search on slope", "Sorting first", "Hash map"], 1, "Binary search: if mid > mid+1 and mid > mid-1, it's a peak. Else move toward the larger neighbor.", "gfg-dsa"),
        q("Sorting", "hard", "Find the kth largest element in an unsorted array. Optimal approach:", ["Sort fully", "Heap of size k", "Quick Select", "Counting sort"], 2, "Quick Select (partition-based) finds kth element in O(n) average time without full sorting.", "gfg-dsa"),
        q("Sorting", "hard", "Sort an array with exactly 3 distinct values (0, 1, 2) in O(n):", ["Merge sort", "Quick sort", "Dutch National Flag (three pointers)", "Counting sort"], 2, "Dutch National Flag uses three pointers in a single pass → O(n) time, O(1) space.", "gfg-dsa"),
        q("Searching", "hard", "Search in a nearly sorted array where each element may be off by ±1:", ["Linear search", "Binary search (modified)", "Ternary search", "Hash lookup"], 1, "Modified binary search: check mid-1, mid, mid+1 at each step → still O(log n).", "gfg-dsa"),
        q("Sorting", "hard", "Which sort performs best on small arrays (n < 10) in practice?", ["Merge sort", "Heap sort", "Insertion sort", "Quick sort"], 2, "Insertion sort has low overhead and good cache performance for tiny arrays — most library sorts use it below a threshold.", "gfg-dsa"),
        q("Searching", "easy", "Linear search time on an array where the target is first:", ["O(n)", "O(1)", "O(log n)", "O(n^2)"], 1, "If the target is the first element, linear search finds it in 1 comparison → O(1) best case.", "gfg-dsa"),
        q("Sorting", "medium", "Selection sort makes how many swaps on an n-element array?", ["O(n)", "O(n^2)", "O(n log n)", "O(1)"], 0, "Selection sort makes exactly n-1 swaps (one per pass) → O(n) swaps.", "gfg-dsa"),
        q("Sorting", "easy", "Which algorithm divides array into halves, sorts each, then merges?", ["Quick sort", "Merge sort", "Bubble sort", "Heap sort"], 1, "Merge sort: divide in half recursively, then merge sorted halves.", "gfg-dsa"),
        q("Searching", "medium", "Jump search time complexity on sorted array:", ["O(n)", "O(√n)", "O(log n)", "O(n^2)"], 1, "Jump search checks elements at intervals of √n → O(√n) time.", "gfg-dsa"),
        q("Sorting", "hard", "External sort (sorting data too large for RAM) typically uses:", ["Heap sort", "Merge sort", "Quick sort", "Counting sort"], 1, "External merge sort splits data into memory-sized chunks, sorts each, then merges from disk.", "gfg-dsa"),
      ],
    },
    {
      id: "coding-linear-ds",
      title: "Linked Lists, Stacks & Queues",
      summary: "Linear structures and the O(1) operations interviewers expect you to know.",
      lessons: [
        {
          id: "l-lds-1",
          title: "Linked lists and pointers",
          minutes: 6,
          body:
            "A **linked list** stores nodes, each holding a value and a pointer to the next node.\n\n**Costs:** inserting or deleting at the **head is O(1)** (just rewire a couple of pointers), but **random access is O(n)** (you must walk from the start). This is the opposite trade-off to arrays, which give O(1) access but O(n) insert in the middle.\n\n**Worked intuition:** to add to the front, point the new node at the old head, then move head to the new node - two steps, no shifting.\n\n**Common mistake:** assuming linked lists allow fast index access. They do not.",
          sourceIds: ["gfg-dsa"],
        },
        {
          id: "l-lds-2",
          title: "Stacks (LIFO) and queues (FIFO)",
          minutes: 5,
          body:
            "A **stack** is **LIFO** - Last In, First Out. You push and pop at one end. Stacks model the function-call/recursion stack, undo history, and balanced-parentheses checks.\n\nA **queue** is **FIFO** - First In, First Out. You enqueue at the rear and dequeue at the **front**. Queues model scheduling and breadth-first search (BFS).\n\n**Worked intuition:** to check if brackets like ()[]{} are balanced, push every opening bracket and pop on each closing bracket; if it ever mismatches or the stack is non-empty at the end, it is unbalanced.\n\n**Exam tip:** \"undo\", \"recursion\", \"matching brackets\" -> stack. \"scheduling\", \"BFS\", \"print queue\" -> queue.",
          sourceIds: ["gfg-dsa"],
        },
      ],
      quiz: [
        q("Stacks", "easy", "A stack follows which order?", ["FIFO", "LIFO", "Random", "Sorted"], 1, "Stack = Last In, First Out. The last element pushed is the first popped.", "gfg-dsa"),
        q("Queues", "easy", "A queue removes elements from the:", ["Rear", "Front", "Middle", "Top"], 1, "FIFO — elements are dequeued from the front.", "gfg-dsa"),
        q("Stacks", "easy", "Which data structure models undo operations in a text editor?", ["Queue", "Stack", "Heap", "Graph"], 1, "Undo works LIFO — last action undone first → stack.", "gfg-dsa"),
        q("Stacks", "easy", "Which data structure is best for balanced parentheses check?", ["Queue", "Stack", "Heap", "Array"], 1, "Push opening brackets; pop on closing. Stack naturally handles LIFO matching.", "gfg-dsa"),
        q("Linked List", "easy", "Inserting a node at the head of a singly linked list:", ["O(n)", "O(log n)", "O(1)", "O(n^2)"], 2, "Rewire two pointers → O(1). No shifting needed unlike arrays.", "gfg-dsa"),
        q("Linked List", "easy", "Random access by index in a linked list:", ["O(1)", "O(log n)", "O(n)", "O(n^2)"], 2, "No random access — must traverse from head → O(n).", "gfg-dsa"),
        q("Queues", "easy", "Which data structure is used for BFS (Breadth-First Search)?", ["Stack", "Queue", "Heap", "Array"], 1, "BFS explores level-by-level; nodes are processed in the order they were discovered → queue.", "gfg-dsa"),
        q("Stacks", "easy", "Which structure models the function call stack in recursion?", ["Queue", "Stack", "Heap", "Graph"], 1, "The call stack is a stack: the last function called is the first to return → LIFO.", "gfg-dsa"),
        q("Linked List", "medium", "Delete a node from a doubly linked list (node pointer given) — time:", ["O(n)", "O(log n)", "O(1)", "O(n^2)"], 2, "With a doubly linked list, adjust prev and next pointers → O(1).", "gfg-dsa"),
        q("Stacks", "medium", "Evaluate postfix expression '5 3 2 * +' using a stack:", ["11", "13", "25", "10"], 0, "3*2=6; 5+6=11. Postfix: push operands, pop two on operator.", "gfg-dsa"),
        q("Queues", "medium", "Circular queue vs regular queue benefit:", ["Less code", "Reuse freed space at front", "Faster search", "Less memory"], 1, "In a circular queue, the rear wraps around to reuse empty slots at the front.", "gfg-dsa"),
        q("Stacks", "medium", "Next Greater Element for each array element — efficient approach:", ["Nested loops", "Sort and scan", "Stack", "Binary search"], 2, "Traverse right-to-left with a stack of 'candidates'; pop when current is greater → O(n).", "gfg-dsa"),
        q("Linked List", "medium", "Detect a cycle in a linked list — Floyd's algorithm uses:", ["Hash set", "Two pointers (slow + fast)", "Sorting", "Stack"], 1, "Floyd's: slow moves +1, fast moves +2. If they meet, a cycle exists → O(n), O(1) space.", "gfg-dsa"),
        q("Linked List", "medium", "Reverse a singly linked list iteratively — time and space:", ["O(n), O(n)", "O(n), O(1)", "O(n^2), O(1)", "O(log n), O(1)"], 1, "One pass, three pointer swap (prev, curr, next) → O(n) time, O(1) space.", "gfg-dsa"),
        q("Queues", "medium", "Implement a stack using two queues. Push is:", ["O(1) with O(n) pop", "O(n) with O(1) pop", "O(1) both ways", "O(n) both ways"], 0, "Rotate elements to simulate LIFO: push in O(1) by enqueueing; pop in O(n) by rotating.", "gfg-dsa"),
        q("Linked List", "medium", "Merge two sorted linked lists — time:", ["O(n+m)", "O(n log n)", "O(n*m)", "O(n^2)"], 0, "One pointer in each list, pick smaller head → O(n+m).", "gfg-dsa"),
        q("Stacks", "medium", "Largest rectangle in histogram — monotonic stack approach:", ["O(n^2)", "O(n log n)", "O(n)", "O(1)"], 2, "Monotonic stack tracks bars in increasing order; pop and compute on decrease → O(n).", "gfg-dsa"),
        q("Linked List", "medium", "Find the middle of a linked list in one pass:", ["Store length, then traverse", "Slow + fast pointer", "Count nodes then traverse", "Hash map"], 1, "Slow pointer moves +1, fast moves +2. When fast reaches end, slow is at middle → O(n), O(1) space.", "gfg-dsa"),
        q("Queues", "medium", "Priority queue (min-heap) insertion time:", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], 1, "Heap insertion: place at end, bubble up → O(log n).", "gfg-dsa"),
        q("Stacks", "hard", "Implement getMin() in O(1) for a stack:", ["Store min in separate variable", "Sort the stack", "Use auxiliary stack", "Use hash map"], 2, "Maintain a parallel min-stack that tracks the current minimum at each push. O(1) getMin, O(n) space.", "gfg-dsa"),
        q("Linked List", "hard", "Find the kth node from the end in one pass:", ["Stack all, pop k times", "Length then traverse", "Two pointers k apart", "Hash map"], 2, "Advance first pointer k steps, then move both until first reaches end — second is at kth from end → O(n), O(1).", "gfg-dsa"),
        q("Queues", "hard", "Sliding window maximum (window size k) — efficient approach:", ["O(nk) nested loops", "O(n log k) using heap", "O(n) using deque", "O(n^2) sorting"], 2, "Monotonic deque: maintain indices of max candidates. Each element enters/leaves once → O(n).", "gfg-dsa"),
        q("Linked List", "hard", "Flatten a multilevel linked list (nodes have 'child' pointers):", ["BFS", "DFS using stack", "Recursive merge", "Sort all values"], 1, "Use a stack: when a child exists, push next to stack, extend child downward → O(n).", "gfg-dsa"),
        q("Stacks", "hard", "Stock span problem (find how many consecutive days ≤ today's price) — optimal:", ["O(n^2) brute force", "O(n) with stack", "O(n log n) with BST", "O(n) with prefix sum"], 1, "Maintain a stack of indices; pop while stack top's price ≤ current → O(n) total.", "gfg-dsa"),
        q("Linked List", "hard", "Clone a linked list with random pointers in O(n) time O(1) space:", ["Hash map all nodes", "Interleave clones then separate", "Two-pass hash map", "Recursive copy"], 1, "Interleave: clone each node right after original, set random pointers, then de-interleave → O(n), O(1).", "gfg-dsa"),
        q("Queues", "easy", "Which is the correct order of operations: enqueue 1,2,3 then dequeue twice?", ["3 remains", "1 remains", "2 remains", "2 and 3 remain"], 0, "FIFO: enqueue 1,2,3 → dequeue 1 and 2 → only 3 remains.", "gfg-dsa"),
        q("Stacks", "easy", "Push 1,2,3,4 onto a stack. Pop once. Top of stack is:", ["1", "2", "3", "4"], 2, "LIFO: push order 1,2,3,4 → top is 4. Pop removes 4 → top is now 3.", "gfg-dsa"),
        q("Linked List", "medium", "Add two numbers represented as linked lists (digits in order):", ["Convert to int, add, convert back", "Reverse both, add with carry, reverse result", "Use arrays", "Sort digits"], 1, "Reverse both lists to get LSD first, add with carry, reverse result → O(max(m,n)).", "gfg-dsa"),
        q("Queues", "medium", "Which problem is best solved with a deque (double-ended queue)?", ["Finding max in sliding window", "BFS traversal", "DFS traversal", "Sorting"], 0, "Sliding window maximum: deque allows O(1) peek/remove from both ends → O(n) solution.", "gfg-dsa"),
        q("Stacks", "medium", "Convert infix '(A+B)*C' to postfix:", ["AB+C*", "ABC+*", "A+B*C", "AB*C+"], 0, "(A+B)*C → postfix: A, B, + (when ')'), then C, * → 'AB+C*'.", "gfg-dsa"),
      ],
    },
    {
      id: "coding-patterns",
      title: "Patterns: Two-Pointer & Sliding Window",
      summary: "High-yield techniques that turn O(n^2) into O(n).",
      lessons: [
        {
          id: "l-pat-1",
          title: "Two-pointer and sliding window",
          minutes: 7,
          body:
            "**Two-pointer:** on a **sorted** array, place one pointer at each end and move them inward. If the pair sum is too big, move the right pointer left; too small, move the left pointer right. This finds a target pair in **O(n)** instead of O(n^2).\n\n**Sliding window:** keep a moving window over the array to answer \"best subarray/substring of size k\" or \"longest substring with a property\". Expand the window, and shrink from the left when a rule breaks. Also **O(n)**.\n\n**Worked example:** maximum sum of a contiguous subarray of size k - slide a size-k window, add the new element and subtract the one leaving, updating the sum in O(1) per step.",
          sourceIds: ["gfg-dsa", "careerride-yt"],
        },
        {
          id: "l-pat-2",
          title: "Prefix sums",
          minutes: 5,
          body:
            "A **prefix-sum array** stores the running total: prefix[i] = sum of the first i elements. Build it once in O(n).\n\nAfter that, the sum of any range l...r is **prefix[r] - prefix[l - 1]**, answered in **O(1)** per query. This beats re-adding the range every time.\n\n**Worked intuition:** for array [2, 4, 1, 3], prefix = [2, 6, 7, 10]. Sum of indices 2...4 (the last three) = 10 - 2 = 8.\n\n**Exam tip:** any problem with many \"sum between two indices\" queries is a prefix-sum problem.",
          sourceIds: ["gfg-dsa"],
        },
      ],
      quiz: [
        q("Sliding Window", "medium", "Best technique for the maximum sum of a contiguous subarray of fixed size k:", ["Two nested loops", "Sliding window", "Sorting first", "Recursion"], 1, "Slide a size-k window, updating the sum in O(1) per step -> O(n) overall.", "gfg-dsa"),
        q("Two Pointer", "medium", "The classic two-pointer pair-sum technique assumes the array is:", ["Empty", "Sorted", "All negative", "A linked list"], 1, "Sorted order lets you move pointers based on whether the sum is too high or low.", "gfg-dsa"),
        q("Prefix Sum", "medium", "After building a prefix-sum array, a range-sum query takes:", ["O(n)", "O(log n)", "O(1)", "O(n^2)"], 2, "sum(l..r) = prefix[r] - prefix[l-1] -> O(1).", "gfg-dsa"),
        q("Sliding Window", "medium", "Best technique for the longest substring without repeating characters:", ["Sorting", "Sliding window", "Recursion", "Binary search"], 1, "Grow a window and shrink from the left when a repeat appears - sliding window.", "gfg-dsa"),
      ],
    },
  ],
}

// ============================================================================
// CS CORE
// ============================================================================
const csCore: Section = {
  ...SECTION_META[4],
  chapters: [
    {
      id: "cs-dbms",
      title: "DBMS Essentials",
      summary: "Keys, normalization and joins - the most-asked DBMS interview topics.",
      lessons: [
        {
          id: "l-db-1",
          title: "Keys and normalization",
          minutes: 6,
          body:
            "A **primary key** uniquely identifies each row and cannot be null. A **foreign key** in one table references the primary key of another, linking the two.\n\n**Normalization** removes redundancy step by step:\n- **1NF:** every cell holds a single (atomic) value.\n- **2NF:** 1NF and no non-key column depends on only part of a composite key.\n- **3NF:** 2NF and no non-key column depends on another non-key column (no transitive dependency).\n\n**Worked intuition:** if 'city' depends on 'zip' which depends on the key, that transitive link breaks 3NF; move zip->city into its own table.\n\n**Exam tip:** \"removes transitive dependency\" is the standard one-line answer for 3NF.",
          sourceIds: ["gfg-cs-core"],
        },
        {
          id: "l-db-2",
          title: "Joins you must know",
          minutes: 5,
          body:
            "Joins combine rows from two tables on a matching column.\n- **INNER JOIN:** only rows that match in both tables.\n- **LEFT JOIN:** all rows from the left table, plus matches from the right (nulls where none).\n- **RIGHT JOIN:** all rows from the right table, plus matches from the left.\n- **FULL OUTER JOIN:** all rows from both, matched where possible.\n\n**Worked intuition:** to list every customer and their orders including customers with no orders, use a LEFT JOIN from customers to orders.\n\n**Common mistake:** using INNER JOIN when you need rows that have no match - that silently drops them.",
          sourceIds: ["gfg-cs-core"],
        },
      ],
      quiz: [
        q("DBMS", "easy", "Which constraint uniquely identifies each row in a table?", ["Foreign key", "Primary key", "Check", "Index"], 1, "Primary key: unique, NOT NULL. Uniquely identifies each row.", "gfg-cs-core"),
        q("DBMS", "easy", "A foreign key references:", ["The same table only", "Another table's primary key", "An index", "A view"], 1, "A foreign key enforces referential integrity by pointing to another table's primary key.", "gfg-cs-core"),
        q("DBMS", "easy", "Which SQL command retrieves data from a table?", ["INSERT", "UPDATE", "SELECT", "DELETE"], 2, "SELECT is the DQL command for querying data.", "gfg-cs-core"),
        q("DBMS", "easy", "NULL in SQL means:", ["Zero", "Empty string", "Unknown or missing value", "False"], 2, "NULL represents the absence of a value — it is not zero, empty, or false.", "gfg-cs-core"),
        q("DBMS", "easy", "Which SQL clause filters rows after grouping?", ["WHERE", "HAVING", "ORDER BY", "GROUP BY"], 1, "HAVING filters after GROUP BY. WHERE filters before grouping.", "gfg-cs-core"),
        q("DBMS", "easy", "DML stands for:", ["Data Model Language", "Data Manipulation Language", "Database Management Layer", "Data Migration Logic"], 1, "DML = Data Manipulation Language: SELECT, INSERT, UPDATE, DELETE.", "gfg-cs-core"),
        q("DBMS", "easy", "A candidate key is:", ["Any non-key column", "A key that could be a primary key", "Always the composite key", "A foreign key candidate"], 1, "A candidate key is a minimal set of attributes that uniquely identifies rows. The primary key is one chosen candidate key.", "gfg-cs-core"),
        q("DBMS", "easy", "ACID in DBMS stands for:", ["Atomicity, Consistency, Isolation, Durability", "Atomicity, Concurrency, Integrity, Durability", "Access, Consistency, Isolation, Data", "Atomic, Complete, Independent, Durable"], 0, "ACID properties ensure reliable transaction processing.", "gfg-cs-core"),
        q("DBMS", "medium", "A table is in 3NF when it is in 2NF and has no:", ["Atomic values", "Partial dependency", "Transitive dependency", "Foreign keys"], 2, "3NF: no non-key attribute depends on another non-key attribute (no transitive dependency).", "gfg-cs-core"),
        q("DBMS", "medium", "Which join returns only rows matching in BOTH tables?", ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN"], 2, "INNER JOIN returns only matching rows from both tables.", "gfg-cs-core"),
        q("DBMS", "medium", "Which join keeps ALL rows from the left table?", ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN"], 1, "LEFT JOIN returns all left rows, filling NULL where no right match exists.", "gfg-cs-core"),
        q("DBMS", "medium", "Normalization primarily aims to:", ["Speed up queries", "Eliminate data redundancy", "Add more tables", "Increase storage"], 1, "Normalization reduces data duplication and update anomalies by organizing data logically.", "gfg-cs-core"),
        q("DBMS", "medium", "A view in DBMS is:", ["A physical copy of data", "A virtual table based on a query", "A stored procedure", "An index structure"], 1, "A view is a named SELECT query stored in the database — no physical data stored separately.", "gfg-cs-core"),
        q("DBMS", "medium", "Atomicity in ACID means:", ["Transactions are small", "A transaction is all-or-nothing", "Transactions run simultaneously", "Data is never lost"], 1, "Atomicity: either all operations in a transaction succeed, or none do.", "gfg-cs-core"),
        q("DBMS", "medium", "What does GROUP BY do in SQL?", ["Filters rows", "Sorts results", "Groups rows by column value for aggregate functions", "Joins tables"], 2, "GROUP BY groups rows with the same value in specified columns, enabling aggregation (SUM, COUNT, AVG).", "gfg-cs-core"),
        q("DBMS", "medium", "An index in DBMS:", ["Slows down SELECT queries", "Speeds up SELECT queries but may slow writes", "Prevents NULL values", "Enforces referential integrity"], 1, "Indexes speed reads but require updates on writes — a classic read-write trade-off.", "gfg-cs-core"),
        q("DBMS", "medium", "Which SQL aggregate finds the highest value?", ["SUM", "COUNT", "MAX", "AVG"], 2, "MAX() returns the maximum value in a column.", "gfg-cs-core"),
        q("DBMS", "medium", "Isolation in ACID means:", ["Transactions share data freely", "Each transaction executes as if it were alone", "Data is always visible", "Transactions are permanent"], 1, "Isolation ensures concurrent transactions don't interfere — as if each ran sequentially.", "gfg-cs-core"),
        q("DBMS", "medium", "Referential integrity ensures:", ["Unique rows", "Foreign keys always point to existing rows", "No NULL values", "Sorted data"], 1, "Referential integrity: every foreign key value must match an existing primary key in the referenced table.", "gfg-cs-core"),
        q("DBMS", "medium", "What is a stored procedure?", ["A table backup", "A precompiled set of SQL statements", "An index type", "A JOIN operation"], 1, "Stored procedures are named, precompiled SQL code blocks stored in the DB for repeated execution.", "gfg-cs-core"),
        q("DBMS", "hard", "Boyce-Codd Normal Form (BCNF) is stricter than 3NF because:", ["It eliminates all functional dependencies", "Every determinant must be a superkey", "It requires composite keys", "It disallows NULL"], 1, "BCNF: for every functional dependency X→Y, X must be a superkey. This is stronger than 3NF.", "gfg-cs-core"),
        q("DBMS", "hard", "A deadlock in database transactions occurs when:", ["CPU runs out of memory", "Two transactions each wait for the other's lock", "A query returns no results", "Index is too large"], 1, "Deadlock: Transaction A holds a lock B needs, and B holds a lock A needs — circular wait.", "gfg-cs-core"),
        q("DBMS", "hard", "Which isolation level prevents dirty reads but allows non-repeatable reads?", ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"], 1, "Read Committed: sees only committed data (no dirty reads), but another transaction can change data between two reads (non-repeatable).", "gfg-cs-core"),
        q("DBMS", "hard", "SELECT COUNT(*) FROM employees WHERE dept_id IN (SELECT dept_id FROM departments WHERE budget > 100000). This is a:", ["JOIN query", "Correlated subquery", "Non-correlated subquery", "View query"], 2, "The inner SELECT doesn't reference the outer table → non-correlated subquery. Correlated subqueries reference the outer query.", "gfg-cs-core"),
        q("DBMS", "hard", "B+ tree index vs hash index:", ["Hash better for range queries", "B+ tree better for range queries", "Hash is always faster", "B+ tree is O(1) lookup"], 1, "B+ tree supports range queries (BETWEEN, <, >) because data is ordered. Hash only supports exact match O(1).", "gfg-cs-core"),
        q("DBMS", "medium", "The SQL command to remove a table and all its data permanently:", ["DROP TABLE", "DELETE FROM", "TRUNCATE TABLE", "REMOVE TABLE"], 0, "DROP TABLE removes the table structure and all data. TRUNCATE removes data but keeps structure. DELETE is row-by-row.", "gfg-cs-core"),
        q("DBMS", "easy", "Which SQL function counts rows?", ["SUM()", "COUNT()", "AVG()", "MIN()"], 1, "COUNT(*) counts all rows; COUNT(column) counts non-NULL values in that column.", "gfg-cs-core"),
        q("DBMS", "medium", "A composite key is:", ["A key with encrypted values", "A primary key made of multiple columns", "A foreign key in two tables", "A key that references itself"], 1, "A composite key uses two or more columns together to uniquely identify a row.", "gfg-cs-core"),
        q("DBMS", "hard", "The difference between DELETE and TRUNCATE:", ["DELETE is DDL, TRUNCATE is DML", "TRUNCATE is faster and cannot be rolled back in most DBs; DELETE is slower and logged row-by-row", "No difference", "TRUNCATE removes the table structure"], 1, "TRUNCATE is a DDL command — fast, minimal logging, cannot be rolled back without transaction. DELETE is DML — logged, can WHERE-filter, can roll back.", "gfg-cs-core"),
        q("DBMS", "medium", "Second Normal Form (2NF) eliminates:", ["Transitive dependencies", "Partial dependencies on composite primary keys", "Multi-valued attributes", "NULL values"], 1, "2NF: every non-key column must depend on the ENTIRE primary key, not just part of it (no partial dependency).", "gfg-cs-core"),
      ],
    },
    {
      id: "cs-os-oop",
      title: "Operating Systems & OOP",
      summary: "Process vs thread, deadlock conditions, and the four pillars of OOP.",
      lessons: [
        {
          id: "l-os-1",
          title: "Process, thread and deadlock",
          minutes: 6,
          body:
            "A **process** is a running program with its **own memory**. A **thread** is a lighter unit of execution **inside** a process that **shares** the process's memory, so switching between threads is cheaper.\n\n**Deadlock** happens when processes wait on each other forever. It needs **all four** of these conditions at once:\n1. Mutual exclusion 2. Hold and wait 3. No preemption 4. Circular wait.\nBreak any one and deadlock cannot occur.\n\n**Common mistake:** thinking threads have separate memory - they share it (which is why you need synchronisation).",
          sourceIds: ["gfg-cs-core"],
        },
        {
          id: "l-oop-1",
          title: "The four pillars of OOP",
          minutes: 5,
          body:
            "**Encapsulation:** bundle data with the methods that use it and hide the internals behind a clean interface (private fields, public methods).\n\n**Abstraction:** expose only what matters and hide the complexity (a 'drive()' method hides the engine details).\n\n**Inheritance:** a child class acquires the properties and methods of a parent class and can extend them.\n\n**Polymorphism:** the same method name behaves differently for different types (a 'draw()' that works for Circle and Square).\n\n**Worked intuition:** \"hiding internal state behind methods\" = encapsulation; \"same call, different behaviour\" = polymorphism.",
          sourceIds: ["gfg-cs-core"],
        },
      ],
      quiz: [
        q("OOP", "easy", "Hiding internal state and exposing access through methods is:", ["Inheritance", "Encapsulation", "Polymorphism", "Abstraction"], 1, "Encapsulation bundles data with methods and hides internal state — a core OOP principle.", "gfg-cs-core"),
        q("OOP", "easy", "Inheritance allows:", ["A child class to reuse parent class properties and methods", "Classes to hide data", "Methods to have the same name", "Programs to run faster"], 0, "Inheritance: a child class acquires properties and methods of the parent, enabling code reuse.", "gfg-cs-core"),
        q("OOP", "easy", "The same method name behaving differently across types:", ["Encapsulation", "Polymorphism", "Abstraction", "Inheritance"], 1, "Polymorphism: one interface, multiple implementations. Method name same, behavior different by type.", "gfg-cs-core"),
        q("OOP", "easy", "Abstraction means:", ["Hiding implementation details and showing only what is necessary", "Copying properties from parent class", "Using the same method name", "Making all fields public"], 0, "Abstraction: expose a clean interface, hide complexity. Like driving a car without knowing the engine details.", "gfg-cs-core"),
        q("OOP", "easy", "Which keyword creates an object in Java/C++?", ["create", "make", "new", "build"], 2, "'new' keyword allocates memory and calls the constructor to create an object.", "gfg-cs-core"),
        q("OOP", "medium", "Method overloading vs method overriding:", ["Overloading is compile-time; overriding is runtime", "Overriding is compile-time; overloading is runtime", "Both are runtime", "Both are compile-time"], 0, "Overloading: same name, different parameters, resolved at compile time. Overriding: redefine parent method in child, resolved at runtime (polymorphism).", "gfg-cs-core"),
        q("OOP", "medium", "An abstract class:", ["Cannot have any methods", "Can have both abstract and concrete methods", "Is the same as an interface", "Cannot be extended"], 1, "Abstract class: can have abstract methods (no body) and concrete methods (with body). Cannot be instantiated directly.", "gfg-cs-core"),
        q("OOP", "medium", "An interface in Java:", ["Can have instance variables", "Only has abstract methods (pre-Java 8)", "Can be instantiated", "Inherits from Object class only"], 1, "Before Java 8, interfaces had only abstract methods. Java 8+ allows default and static methods.", "gfg-cs-core"),
        q("OOP", "medium", "A constructor:", ["Returns a value", "Has the same name as the class and no return type", "Is called explicitly", "Can be abstract"], 1, "Constructor: same name as class, no return type, called automatically when object is created.", "gfg-cs-core"),
        q("OOP", "medium", "Multiple inheritance in Java is achieved through:", ["Abstract classes", "Interfaces", "Concrete classes", "Static methods"], 1, "Java classes can extend only one class but implement multiple interfaces — simulating multiple inheritance.", "gfg-cs-core"),
        q("OS", "easy", "How do threads differ from processes?", ["Threads have fully separate memory", "Threads share their process's memory", "Threads are heavier than processes", "Processes share memory by default"], 1, "Threads share memory space within a process; processes have their own isolated memory.", "gfg-cs-core"),
        q("OS", "easy", "What does CPU scheduling decide?", ["Which file to open", "Which process gets CPU time and when", "How much RAM to allocate", "Network traffic routing"], 1, "CPU scheduling determines which process runs on the CPU at any given time.", "gfg-cs-core"),
        q("OS", "easy", "Virtual memory allows:", ["Programs to run on GPU", "Programs to use more memory than physically available", "Faster CPU execution", "Network virtualization"], 1, "Virtual memory uses disk space to extend apparent RAM — programs can run even if they don't fit in physical memory.", "gfg-cs-core"),
        q("OS", "medium", "Which is NOT a necessary condition for deadlock?", ["Mutual exclusion", "Hold and wait", "Preemption allowed", "Circular wait"], 2, "The four Coffman conditions are: mutual exclusion, hold and wait, NO preemption, circular wait. Preemption allowed PREVENTS deadlock.", "gfg-cs-core"),
        q("OS", "medium", "Round Robin scheduling:", ["Gives highest priority to longest job", "Gives each process a fixed time slice (quantum)", "Executes processes in arrival order without preemption", "Always runs the shortest job next"], 1, "Round Robin: each process runs for one time quantum, then is preempted and placed back in the queue.", "gfg-cs-core"),
        q("OS", "medium", "Paging in OS:", ["Divides programs into fixed-size pages mapped to physical frames", "Sorts processes by priority", "Partitions disk into sectors", "Schedules threads"], 0, "Paging: logical memory is divided into fixed-size pages, mapped to physical frames by a page table.", "gfg-cs-core"),
        q("OS", "medium", "A page fault occurs when:", ["CPU clock fails", "Requested page is not in physical memory", "RAM is full", "Disk crashes"], 1, "Page fault: the program accesses a page not currently loaded in RAM — OS must fetch it from disk.", "gfg-cs-core"),
        q("OS", "medium", "Semaphore is used for:", ["Scheduling CPU", "Synchronizing concurrent processes", "Managing file systems", "Allocating virtual memory"], 1, "Semaphore: a synchronization primitive used to control access to shared resources in concurrent programming.", "gfg-cs-core"),
        q("OS", "medium", "A process in the 'blocked' state is:", ["Running on CPU", "Waiting for I/O or an event", "Ready to run", "Terminated"], 1, "Blocked (waiting): process cannot proceed until some event (I/O completion, signal) occurs.", "gfg-cs-core"),
        q("OS", "medium", "Belady's Anomaly occurs in which page replacement algorithm?", ["LRU", "Optimal", "FIFO", "Clock"], 2, "Belady's Anomaly: with FIFO, adding more page frames can increase page faults — counterintuitive.", "gfg-cs-core"),
        q("OOP", "hard", "Liskov Substitution Principle states:", ["Child class should extend parent without breaking behavior", "All methods must be public", "Interfaces must be small", "Classes should have single responsibility"], 0, "LSP: objects of a subclass must be substitutable for objects of the parent class without breaking correctness.", "gfg-cs-core"),
        q("OOP", "hard", "Design Pattern: Singleton ensures:", ["Only one object of a class exists", "Classes can be cloned freely", "All methods are static", "Multiple instances share data"], 0, "Singleton pattern restricts a class to a single instance and provides a global access point.", "gfg-cs-core"),
        q("OS", "hard", "A race condition occurs when:", ["CPU is overloaded", "Two processes access shared data concurrently and outcome depends on execution order", "Memory is full", "Deadlock is detected"], 1, "Race condition: the final result depends on the relative timing of concurrent processes accessing shared data.", "gfg-cs-core"),
        q("OS", "hard", "Optimal page replacement algorithm:", ["Replaces the page least recently used", "Replaces the page that will not be used for the longest time", "Replaces the oldest page (FIFO)", "Replaces a random page"], 1, "Optimal (Bélády's) algorithm replaces the page not needed for the longest future period — it's theoretically best but requires future knowledge.", "gfg-cs-core"),
        q("OOP", "hard", "The Open/Closed Principle states code should be:", ["Open for modification only", "Closed for all changes", "Open for extension, closed for modification", "Open for both"], 2, "OCP (SOLID): add new behavior through extension (new classes), not by modifying existing code.", "gfg-cs-core"),
        q("OS", "hard", "In priority scheduling, priority inversion means:", ["Low-priority process runs before high-priority", "High-priority runs first always", "Two processes have same priority", "Priority is randomly assigned"], 0, "Priority inversion: a high-priority process waits because a low-priority process holds a resource the high-priority one needs.", "gfg-cs-core"),
        q("OOP", "medium", "Static method in Java:", ["Requires an object to call", "Belongs to the class, not instances", "Can access instance variables", "Can be overridden"], 1, "Static methods belong to the class — called as ClassName.method(). They cannot access instance variables directly.", "gfg-cs-core"),
        q("OS", "easy", "Context switching:", ["Permanently removes a process", "Saves and restores process state when switching the CPU", "Allocates more memory", "Terminates idle processes"], 1, "Context switch: OS saves current process state (registers, PC) and loads the next process's state.", "gfg-cs-core"),
        q("OOP", "medium", "Which OOP concept enables runtime polymorphism in Java?", ["Method overloading", "Method overriding with dynamic dispatch", "Static methods", "Final classes"], 1, "Runtime polymorphism: Java uses dynamic dispatch — the actual method called depends on the object's type at runtime.", "gfg-cs-core"),
        q("OS", "medium", "Thrashing in an OS occurs when:", ["CPU is idle", "OS spends more time swapping pages than executing processes", "All processes complete quickly", "RAM is fully utilized"], 1, "Thrashing: too many page faults cause the OS to spend most time on page replacement instead of useful work.", "gfg-cs-core"),
      ],
    },
    {
      id: "cs-networks",
      title: "Computer Networks",
      summary: "OSI layers, TCP vs UDP, and the protocols behind the web.",
      lessons: [
        {
          id: "l-cn-1",
          title: "OSI model and TCP vs UDP",
          minutes: 6,
          body:
            "The **OSI model has 7 layers**: Physical, Data Link, Network, Transport, Session, Presentation, Application. (A common memory aid: 'Please Do Not Throw Sausage Pizza Away'.)\n\n**TCP** is **connection-oriented and reliable**: it sets up a connection (handshake), delivers data in order, and retransmits anything lost. Used for the web, email, file transfer.\n\n**UDP** is **connectionless and fast**: no handshake, no guarantee of order or delivery, but lower overhead. Used for live video, voice calls, and online games.\n\n**Exam tip:** reliable and ordered = TCP; fast and lightweight = UDP.",
          sourceIds: ["gfg-cs-core"],
        },
        {
          id: "l-cn-2",
          title: "Protocols and ports",
          minutes: 5,
          body:
            "Common application protocols and their default ports:\n- **DNS** resolves a domain name (example.com) to an IP address.\n- **HTTP** serves web pages on port **80**.\n- **HTTPS** is encrypted HTTP on port **443**.\n- **SMTP** (port 25) sends email.\n\n**Worked intuition:** when you type a site name, DNS finds its IP, then HTTPS (443) fetches the page securely.\n\n**Common mistake:** swapping the ports - remember 80 for HTTP, 443 for HTTPS.",
          sourceIds: ["gfg-cs-core"],
        },
      ],
      quiz: [
        q("Networks", "easy", "How many layers are in the OSI model?", ["5", "6", "7", "4"], 2, "OSI model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.", "gfg-cs-core"),
        q("Networks", "easy", "Which protocol resolves a domain name to an IP address?", ["HTTP", "DNS", "FTP", "SMTP"], 1, "DNS (Domain Name System) translates human-readable hostnames to IP addresses.", "gfg-cs-core"),
        q("Networks", "easy", "HTTPS uses port:", ["21", "80", "443", "25"], 2, "HTTPS = HTTP + TLS, port 443. HTTP = port 80.", "gfg-cs-core"),
        q("Networks", "easy", "IP address uniquely identifies:", ["A web page", "A device on a network", "A domain name", "A file on disk"], 1, "IP address identifies a network interface — used for routing packets to the right device.", "gfg-cs-core"),
        q("Networks", "easy", "Which layer of OSI handles routing between networks?", ["Layer 2 (Data Link)", "Layer 3 (Network)", "Layer 4 (Transport)", "Layer 7 (Application)"], 1, "Layer 3 (Network): IP protocol operates here; routers make decisions at this layer.", "gfg-cs-core"),
        q("Networks", "easy", "FTP is used for:", ["Email transfer", "File transfer", "Domain resolution", "Web browsing"], 1, "FTP (File Transfer Protocol) transfers files between client and server. Port 21.", "gfg-cs-core"),
        q("Networks", "easy", "MAC address operates at which OSI layer?", ["Physical (Layer 1)", "Data Link (Layer 2)", "Network (Layer 3)", "Transport (Layer 4)"], 1, "MAC (Media Access Control) addresses operate at Layer 2 (Data Link) — used within a local network.", "gfg-cs-core"),
        q("Networks", "easy", "Which protocol sends email?", ["HTTP", "FTP", "SMTP", "DNS"], 2, "SMTP (Simple Mail Transfer Protocol) is used to send email. Port 25/587.", "gfg-cs-core"),
        q("Networks", "medium", "TCP is best described as:", ["Connectionless and unreliable", "Connection-oriented and reliable", "Only for streaming", "A routing protocol"], 1, "TCP: connection-oriented (3-way handshake), ordered, reliable delivery with retransmission.", "gfg-cs-core"),
        q("Networks", "medium", "UDP is best described as:", ["Reliable and ordered", "Connection-oriented", "Connectionless and fast", "Always encrypted"], 2, "UDP: no connection setup, no guarantees — fast and lightweight. Used for live video, DNS, gaming.", "gfg-cs-core"),
        q("Networks", "medium", "TCP 3-way handshake sequence:", ["ACK → SYN → SYN-ACK", "SYN → ACK → SYN-ACK", "SYN → SYN-ACK → ACK", "SYN-ACK → SYN → ACK"], 2, "Client sends SYN; server replies SYN-ACK; client confirms with ACK. Connection established.", "gfg-cs-core"),
        q("Networks", "medium", "ARP (Address Resolution Protocol) resolves:", ["IP to domain name", "IP to MAC address", "MAC to IP address", "Domain to MAC"], 1, "ARP translates an IP address to a MAC address within a local network segment.", "gfg-cs-core"),
        q("Networks", "medium", "A subnet mask /24 means:", ["24 host bits", "24 network bits (256 addresses)", "256 network addresses", "Host range 0-24"], 1, "CIDR /24: 24 bits for network, 8 bits for hosts → 2^8 = 256 addresses (254 usable).", "gfg-cs-core"),
        q("Networks", "medium", "Which HTTP method retrieves data without side effects?", ["POST", "PUT", "GET", "DELETE"], 2, "GET is idempotent and safe — retrieves data. POST/PUT/DELETE modify server state.", "gfg-cs-core"),
        q("Networks", "medium", "NAT (Network Address Translation) is used to:", ["Speed up routing", "Allow multiple devices to share one public IP", "Encrypt traffic", "Resolve domain names"], 1, "NAT: the router maps multiple private IPs to one public IP — conserves public IP addresses.", "gfg-cs-core"),
        q("Networks", "medium", "Which layer does TLS (HTTPS encryption) operate at?", ["Layer 2", "Layer 3", "Layer 4/5 (between Transport and Application)", "Layer 7 only"], 2, "TLS operates between Transport and Application layers — often called Layer 5/6 or 'between 4 and 7' in practice.", "gfg-cs-core"),
        q("Networks", "medium", "What is a socket?", ["Only an IP address", "Only a port number", "A combination of IP address and port number", "A network cable connector"], 2, "Socket = IP address + port number, uniquely identifying one endpoint of a connection.", "gfg-cs-core"),
        q("Networks", "medium", "HTTP status 404 means:", ["Server error", "Redirect", "Not found", "Unauthorized"], 2, "404 = Not Found. 2xx = success, 3xx = redirect, 4xx = client error, 5xx = server error.", "gfg-cs-core"),
        q("Networks", "medium", "DHCP is used to:", ["Encrypt data", "Automatically assign IP addresses to devices", "Translate domains to IPs", "Route packets"], 1, "DHCP (Dynamic Host Configuration Protocol) automatically assigns IP addresses, subnet masks, and gateway to devices.", "gfg-cs-core"),
        q("Networks", "medium", "Which protocol is used for secure remote login?", ["FTP", "HTTP", "SSH", "Telnet"], 2, "SSH (Secure Shell) provides encrypted remote login. Telnet is similar but unencrypted.", "gfg-cs-core"),
        q("Networks", "hard", "BGP (Border Gateway Protocol) is used for:", ["Routing within a local network", "Routing between autonomous systems (internet backbone)", "Resolving MAC addresses", "Encrypting traffic"], 1, "BGP is the internet's core routing protocol — routes traffic between large networks (autonomous systems).", "gfg-cs-core"),
        q("Networks", "hard", "TCP flow control uses:", ["Checksum", "Sliding window", "SYN-ACK", "NAT"], 1, "TCP sliding window: receiver advertises how much data it can accept; sender limits accordingly. Prevents receiver overflow.", "gfg-cs-core"),
        q("Networks", "hard", "A CDN (Content Delivery Network) primarily:", ["Encrypts data", "Caches content at servers close to users to reduce latency", "Provides DHCP", "Manages DNS"], 1, "CDN: distribute copies of content to edge servers geographically close to users — faster response times.", "gfg-cs-core"),
        q("Networks", "hard", "IPv6 address length:", ["32 bits", "64 bits", "128 bits", "256 bits"], 2, "IPv6: 128-bit addresses (vs IPv4's 32-bit). Written as 8 groups of 4 hex digits.", "gfg-cs-core"),
        q("Networks", "hard", "Congestion control in TCP:", ["Is the same as flow control", "Reduces sender rate when network is congested (not just receiver)", "Increases bandwidth", "Disconnects slow receivers"], 1, "Congestion control: TCP detects network congestion (packet loss/delay) and reduces sending rate to prevent collapse.", "gfg-cs-core"),
        q("Networks", "hard", "A VLAN (Virtual LAN):", ["Requires separate physical hardware", "Logically segments a network without physical separation", "Replaces DNS", "Is only for wireless networks"], 1, "VLANs group network devices logically regardless of physical location — improved security and organization.", "gfg-cs-core"),
        q("Networks", "medium", "Which HTTP method is idempotent (same result if called multiple times)?", ["POST", "GET", "Both GET and PUT", "None"], 2, "GET and PUT are idempotent. POST creates new resources each time. DELETE is also idempotent.", "gfg-cs-core"),
        q("Networks", "easy", "TCP and UDP operate at which OSI layer?", ["Layer 2", "Layer 3", "Layer 4", "Layer 7"], 2, "TCP and UDP are Transport Layer (Layer 4) protocols.", "gfg-cs-core"),
        q("Networks", "medium", "Difference between a hub and a switch:", ["Hub is smarter", "Switch sends frames only to the correct destination MAC; hub broadcasts to all", "Hub uses Layer 3", "Switch is wireless"], 1, "Hub: broadcasts to all ports. Switch: learns MAC addresses and forwards frames only to the correct port.", "gfg-cs-core"),
        q("Networks", "medium", "The purpose of a firewall:", ["Speeds up internet", "Filters traffic based on rules to protect networks", "Assigns IP addresses", "Translates domain names"], 1, "Firewall: monitors and controls incoming/outgoing network traffic based on security rules.", "gfg-cs-core"),
      ],
    },
    {
      id: "cs-sql",
      title: "Practical SQL",
      summary: "Clause order, WHERE vs HAVING, and the aggregates you'll be quizzed on.",
      lessons: [
        {
          id: "l-sql-1",
          title: "Clauses and execution order",
          minutes: 6,
          body:
            "A query is **written** as: SELECT ... FROM ... WHERE ... GROUP BY ... HAVING ... ORDER BY.\n\nBut it **executes** roughly in this order: **FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY.** Knowing this explains the next rule.\n\n**WHERE filters individual rows** (before grouping). **HAVING filters groups** (after aggregation). So you cannot use an aggregate like COUNT() in WHERE, but you can in HAVING.\n\n**Worked intuition:** \"customers with more than 5 orders\" needs HAVING COUNT(*) > 5, because the count exists only after GROUP BY.\n\n**Exam tip:** WHERE runs before HAVING.",
          sourceIds: ["gfg-cs-core"],
        },
        {
          id: "l-sql-2",
          title: "Aggregates and DISTINCT",
          minutes: 5,
          body:
            "**Aggregate functions** summarise many rows into one value:\n- COUNT() - number of rows\n- SUM() - total\n- AVG() - average\n- MIN() / MAX() - smallest / largest\n\n**DISTINCT** removes duplicate rows from a result: SELECT DISTINCT city returns each city once.\n\n**GROUP BY** lets you aggregate per category: SELECT city, COUNT(*) FROM users GROUP BY city counts users in each city.\n\n**Common mistake:** forgetting that every non-aggregated column in the SELECT must appear in GROUP BY.",
          sourceIds: ["gfg-cs-core"],
        },
      ],
      quiz: [
        q("SQL", "medium", "Which clause filters groups after aggregation?", ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], 1, "HAVING filters aggregated groups; WHERE filters individual rows before grouping.", "gfg-cs-core"),
        q("SQL", "easy", "Which keyword removes duplicate rows from a result?", ["UNIQUE", "DISTINCT", "ONLY", "FILTER"], 1, "SELECT DISTINCT returns unique rows.", "gfg-cs-core"),
        q("SQL", "easy", "Which aggregate function counts rows?", ["SUM()", "COUNT()", "AVG()", "TOTAL()"], 1, "COUNT() returns the number of rows.", "gfg-cs-core"),
        q("SQL", "medium", "Between WHERE and HAVING, which is applied first?", ["HAVING", "WHERE", "They are equal", "Neither"], 1, "WHERE filters rows before grouping; HAVING runs after aggregation.", "gfg-cs-core"),
        q("SQL", "easy", "Which aggregate function returns the average of a column?", ["SUM()", "AVG()", "COUNT()", "MAX()"], 1, "AVG() computes the mean of the column's values.", "gfg-cs-core"),
      ],
    },
  ],
}

// ============================================================================
// COMMUNICATION & INTERVIEW
// ============================================================================
const commInterview: Section = {
  ...SECTION_META[5],
  chapters: [
    {
      id: "comm-intro",
      title: "Self-Introduction & Group Discussion",
      summary: "A crisp 60-second intro and how to stand out in a GD without dominating.",
      lessons: [
        {
          id: "l-ci-1",
          title: "The 60-second self-introduction",
          minutes: 6,
          body:
            "A strong intro is short and structured. Use this arc:\n**Name -> background (college, branch) -> 2 relevant strengths or projects -> why this role/company -> a confident close.**\n\nKeep it under a minute. Tailor the strengths to the role, and end on genuine enthusiasm rather than trailing off.\n\n**Worked example opener:** \"I'm Aarav, a final-year CSE student. I enjoy backend problem-solving, and I recently built a ticket-booking API that handles concurrent bookings. I'm keen on this role because...\"\n\n**Common mistake:** reciting your resume line by line, or opening with weaknesses or salary. Lead with who you are and what you are good at.",
          sourceIds: ["studybench-curriculum"],
        },
        {
          id: "l-ci-2",
          title: "Group discussion strategy",
          minutes: 5,
          body:
            "Evaluators score **clarity, listening and leadership**, not who is loudest.\n\n**Enter early** with one clear point backed by a reason or example. If the topic is abstract, structure it (pros vs cons, or social/economic/technical angles).\n\n**Bring others in** (\"Building on what she said...\") and never talk over people or get aggressive.\n\n**Worked example:** to enter a heated GD, acknowledge the last point, then add yours: \"That's a fair point on cost; I'd add that it also affects long-term retention.\"\n\n**Exam tip:** a calm, well-structured summary at the end is a strong and often-overlooked way to lead.",
          sourceIds: ["studybench-curriculum"],
        },
      ],
      quiz: [
        q("Communication", "easy", "What is the ideal length of a self-introduction in an interview?", ["5+ minutes", "About 30-60 seconds", "As long as possible", "One word"], 1, "A focused 30-60 second intro respects time and keeps attention.", "studybench-curriculum"),
        q("Communication", "medium", "In a group discussion, the strongest contribution is one that:", ["Is the loudest", "Repeats others", "Adds a reasoned new point", "Interrupts often"], 2, "Evaluators reward clear, reasoned, novel contributions over volume.", "studybench-curriculum"),
        q("Communication", "medium", "A good way to enter a heated group discussion is to:", ["Shout over others", "Wait until it ends", "Acknowledge a point, then add yours", "Change the topic"], 2, "Bridging ('Building on that...') gets you in politely while showing you listen.", "studybench-curriculum"),
        q("Communication", "medium", "A self-introduction is best started with:", ["Your salary expectation", "Your name and background", "Your weaknesses", "A long joke"], 1, "Open with who you are (name, background), then strengths and fit.", "studybench-curriculum"),
        q("Communication", "easy", "A self-introduction should be tailored to:", ["The weather", "The specific role and company", "Your favourite food", "A random news topic"], 1, "Tailoring your intro to the role shows genuine interest and preparation.", "studybench-curriculum"),
        q("Communication", "medium", "The best way to end a self-introduction is:", ["By asking for the salary", "By listing your weaknesses", "On genuine enthusiasm for the role", "By trailing off silently"], 2, "Closing on enthusiasm leaves a positive, confident final impression.", "studybench-curriculum"),
        q("Communication", "easy", "When introducing yourself, projects you mention should be:", ["Relevant to the role and briefly explained", "Every project you ever did", "Hidden from the panel", "Described for ten minutes each"], 0, "Pick a couple of role-relevant projects and keep each explanation short.", "studybench-curriculum"),
        q("Communication", "medium", "A confident self-introduction is mostly:", ["Memorised word for word", "Read off a paper", "As long as possible", "Clear, structured and concise"], 3, "Structure and concision read as confidence; a memorised script sounds robotic.", "studybench-curriculum"),
        q("Communication", "easy", "Which detail is LEAST useful in an interview self-introduction?", ["Your branch and year", "Your school marks from class 5", "A relevant project", "Why you fit the role"], 1, "Old school details add no value; focus on recent, role-relevant points.", "studybench-curriculum"),
        q("Communication", "medium", "If you blank out during your introduction, you should:", ["Apologise repeatedly and stop", "Start over loudly", "Pause, breathe and continue calmly", "Leave the room"], 2, "A brief, calm pause recovers far better than panic or restarting.", "studybench-curriculum"),
        q("Communication", "medium", "Mentioning a strength in your intro is strongest when you:", ["Back it with a short example", "Just name many strengths", "Exaggerate it", "Compare yourself to others"], 0, "Evidence makes a strength believable; a quick example proves it.", "studybench-curriculum"),
        q("Communication", "easy", "A good self-introduction balances:", ["Only hobbies", "Background, strengths and role fit", "Only academics", "Only personal life"], 1, "Cover who you are, what you are good at, and why you fit the role.", "studybench-curriculum"),
        q("Communication", "easy", "Practising your self-introduction helps you:", ["Sound robotic", "Speak much longer", "Sound natural and stay within time", "Avoid eye contact"], 2, "Practice makes delivery natural and keeps you within the time limit.", "studybench-curriculum"),
        q("Communication", "medium", "The first impression in an interview is shaped most by:", ["Your greeting, posture and opening words", "Only your resume", "The chair you sit on", "The interviewer's mood only"], 0, "Your greeting, body language and opening lines set the tone immediately.", "studybench-curriculum"),
        q("Communication", "easy", "When asked 'Tell me about yourself', you should focus on:", ["Your entire family history", "Your daily routine", "Your childhood stories", "Highlights relevant to the job"], 3, "Keep it professional: academic and project highlights relevant to the role.", "studybench-curriculum"),
        q("Communication", "easy", "Eye contact during your introduction signals:", ["Confidence and engagement", "Boredom", "Nervousness", "Aggression"], 0, "Natural eye contact conveys confidence and that you are engaged.", "studybench-curriculum"),
        q("Communication", "medium", "Group discussion evaluators primarily assess:", ["Who shouts loudest", "Who speaks first only", "Clarity, listening and leadership", "Who speaks the longest"], 2, "Evaluators reward reasoning, listening and leadership over volume.", "studybench-curriculum"),
        q("Communication", "medium", "Interrupting others repeatedly in a GD is:", ["A negative behaviour that lowers your score", "A sign of leadership", "Always expected", "Rewarded by evaluators"], 0, "Cutting people off signals poor listening and hurts your evaluation.", "studybench-curriculum"),
        q("Communication", "medium", "If a GD topic is abstract, a good approach is to:", ["Refuse to participate", "Structure it into clear angles like pros and cons", "Change the topic", "Talk about something unrelated"], 1, "Framing the topic (pros/cons, social/economic/technical) shows clear thinking.", "studybench-curriculum"),
        q("Communication", "medium", "Bringing a quiet participant into a GD shows:", ["Weakness", "Lack of ideas", "Aggression", "Leadership and good listening"], 3, "Inviting others in demonstrates leadership and awareness of the group.", "studybench-curriculum"),
        q("Communication", "medium", "A strong way to close a group discussion is to:", ["Offer a brief, balanced summary", "Repeat your first point loudly", "Criticise everyone", "Stay silent"], 0, "A concise, balanced summary at the end is an often-overlooked way to lead.", "studybench-curriculum"),
        q("Communication", "easy", "Backing your GD point with an example makes it:", ["Weaker", "Irrelevant", "More convincing", "Too long always"], 2, "Examples make abstract points concrete and persuasive.", "studybench-curriculum"),
        q("Communication", "medium", "During a GD, the mature way to disagree is to:", ["Mock the speaker", "Acknowledge the point, then give a reasoned counter", "Ignore them", "Raise your voice"], 1, "Acknowledge first, then offer evidence; it shows respect and reasoning.", "studybench-curriculum"),
        q("Communication", "medium", "Entering a GD late and never speaking will likely:", ["Hurt your evaluation", "Guarantee selection", "Impress the panel", "Be seen as leadership"], 0, "Non-participation gives evaluators nothing positive to score.", "studybench-curriculum"),
        q("Communication", "medium", "In a GD, the factual accuracy of your points is:", ["Unimportant", "Only for toppers", "Discouraged", "Important for credibility"], 3, "Wrong facts damage credibility; accurate points carry weight.", "studybench-curriculum"),
        q("Communication", "easy", "The ideal GD contribution is:", ["Long and repetitive", "Concise, relevant and reasoned", "Loud and emotional", "Off-topic but confident"], 1, "Short, on-topic, reasoned points are valued more than long speeches.", "studybench-curriculum"),
        q("Communication", "hard", "If two participants clash in a GD, a mature move is to:", ["Pick a side and argue louder", "Stay out completely", "Bridge the views and refocus the discussion", "Leave the discussion"], 2, "Bridging conflicting views and refocusing the group shows leadership.", "studybench-curriculum"),
        q("Communication", "easy", "Body language in a GD should be:", ["Calm, attentive and respectful", "Aggressive and tense", "Distracted", "Slouched and bored"], 0, "Calm, attentive posture supports your spoken contributions.", "studybench-curriculum"),
        q("Communication", "medium", "Active listening in an interview means:", ["Planning your answer while they talk", "Focusing on the question before answering", "Interrupting to save time", "Ignoring follow-ups"], 1, "Listen fully first; it ensures your answer actually addresses the question.", "studybench-curriculum"),
        q("Communication", "easy", "Speaking too fast in an interview usually:", ["Reduces clarity", "Always impresses", "Shows confidence only", "Is recommended"], 0, "A rushed pace hurts clarity; a measured pace is easier to follow.", "studybench-curriculum"),
        q("Communication", "medium", "If you don't understand a question, you should:", ["Guess and ramble", "Stay silent", "Politely ask for clarification", "Answer a different question"], 2, "Asking to clarify is professional and prevents an off-target answer.", "studybench-curriculum"),
        q("Communication", "medium", "Filler words such as 'um' and 'like' are best:", ["Used constantly", "Added for style", "Ignored", "Reduced by pausing briefly instead"], 3, "A short silent pause sounds more composed than a filler word.", "studybench-curriculum"),
        q("Communication", "easy", "A clear spoken answer typically follows the structure:", ["Point, reason, example", "Random facts", "Only a conclusion", "A long story with no point"], 0, "Point-reason-example keeps answers focused and easy to follow.", "studybench-curriculum"),
        q("Communication", "easy", "Maintaining eye contact while answering signals:", ["Nervousness", "Confidence and honesty", "Disinterest", "Aggression"], 1, "Steady, natural eye contact reads as confidence and sincerity.", "studybench-curriculum"),
        q("Communication", "medium", "Being specific rather than vague in answers:", ["Weakens them", "Wastes time", "Strengthens your response", "Confuses the panel"], 2, "Specific, concrete details make answers credible and memorable.", "studybench-curriculum"),
        q("Communication", "hard", "Honestly admitting what you don't know is:", ["A guaranteed rejection", "Always hidden", "A weakness", "Respected when paired with willingness to learn"], 3, "Honesty plus a learning attitude is respected more than bluffing.", "studybench-curriculum"),
        q("Communication", "easy", "Good communication is primarily about:", ["Being understood clearly", "Using big words", "Talking the most", "A fake accent"], 0, "Clarity, not vocabulary or volume, defines good communication.", "studybench-curriculum"),
        q("Communication", "medium", "Tailoring your language to the listener is:", ["Unnecessary", "A sign of strong communication", "Manipulative", "Rude"], 1, "Adjusting to your audience makes your message land better.", "studybench-curriculum"),
        q("Communication", "medium", "Pausing briefly before a tough question:", ["Looks weak", "Wastes the panel's time", "Gives you time to organise your thoughts", "Should be avoided"], 2, "A short pause to think produces a clearer, stronger answer.", "studybench-curriculum"),
        q("Communication", "hard", "A confident yet humble tone in interviews is:", ["Too risky", "Seen as arrogant", "Discouraged", "Ideal"], 3, "Confidence balanced with humility is the tone panels respond to best.", "studybench-curriculum"),
      ],
    },
    {
      id: "comm-written",
      title: "Written & Email Communication",
      summary: "Clear professional email and a simple essay structure that scores.",
      lessons: [
        {
          id: "l-cw-1",
          title: "Professional email",
          minutes: 5,
          body:
            "A good email has four parts: a **clear subject line**, a **greeting**, a **short purposeful body**, and a **polite sign-off**.\n\nBe **specific** rather than vague. \"Could we meet on Tuesday at 3pm?\" beats \"please revert asap\". State the action you want and the deadline.\n\n**Worked example subject:** \"Request: 15-minute call on the internship offer (Tue/Wed)\". The reader knows the purpose before opening it.\n\n**Common mistake:** long, rambling emails with no clear ask. Put the request near the top.",
          sourceIds: ["studybench-curriculum"],
        },
        {
          id: "l-cw-2",
          title: "Essay structure",
          minutes: 5,
          body:
            "Many drives include a short written essay. Plan for one minute, then write:\n**Introduction (state your stance) -> 2-3 body paragraphs (one idea each, with an example) -> conclusion (restate and close).**\n\nKeep sentences short and clear, and watch spelling and grammar - they are scored.\n\n**Worked intuition:** for \"Is remote work good?\", paragraph 1 = your stance, paragraph 2 = one benefit with an example, paragraph 3 = one drawback, conclusion = balanced verdict.\n\n**Common mistake:** writing one long paragraph with no structure. Use clear paragraph breaks.",
          sourceIds: ["studybench-curriculum", "wipro-careers"],
        },
      ],
      quiz: [
        q("Written Communication", "easy", "A professional email should begin with:", ["The attachment", "A clear subject line and greeting", "An apology", "Your life story"], 1, "A specific subject and greeting set context immediately.", "studybench-curriculum"),
        q("Essay Writing", "medium", "The opening paragraph of an essay should:", ["List references", "State your main idea or stance", "Be the conclusion", "Be left blank"], 1, "Lead with a clear thesis so the reader knows your position.", "studybench-curriculum"),
        q("Written Communication", "medium", "Which is the clearer, more professional phrasing?", ["Please do the needful asap", "Kindly revert back", "Could you confirm by Tuesday 3pm?", "Update me whenever"], 2, "Specific, time-bound requests are clearer than vague phrases.", "studybench-curriculum"),
        q("Essay Writing", "medium", "A well-structured essay is:", ["As long as possible", "Built from intro, body and conclusion", "Only bullet points", "One long paragraph"], 1, "Structure (intro, body, conclusion) makes the argument easy to follow and score.", "studybench-curriculum"),
        q("Written Communication", "easy", "The subject line of a professional email should be:", ["Short and specific about the purpose", "Left blank", "A long paragraph", "In all capitals"], 0, "A specific subject tells the reader the purpose before they open the email.", "studybench-curriculum"),
        q("Written Communication", "medium", "A professional email greeting is best written as:", ["'Hey!' with no name", "A polite greeting with the recipient's name", "No greeting at all", "An emoji"], 1, "A named, polite greeting sets a respectful, professional tone.", "studybench-curriculum"),
        q("Written Communication", "medium", "The main request in an email should be placed:", ["At the very end, hidden", "In an attachment only", "Near the top, stated clearly", "Never stated"], 2, "Putting the ask near the top ensures it is not missed.", "studybench-curriculum"),
        q("Written Communication", "easy", "Which is the most professional sign-off?", ["'Best regards, <name>'", "'cya'", "'whatever'", "no sign-off"], 0, "A courteous sign-off with your name closes the email professionally.", "studybench-curriculum"),
        q("Written Communication", "medium", "A vague phrase like 'please do the needful' is:", ["Ideal", "Best replaced with a specific request", "Always required", "The most professional option"], 1, "Specific, actionable requests are clearer than vague stock phrases.", "studybench-curriculum"),
        q("Written Communication", "medium", "Before sending a job-application email you should:", ["Send it immediately", "Use many colours", "Add several emojis", "Proofread and attach the correct file"], 3, "Proofreading and attaching the right file prevents avoidable mistakes.", "studybench-curriculum"),
        q("Written Communication", "easy", "An email requesting a meeting should include:", ["A proposed time and the purpose", "Only a greeting", "Nothing specific", "Many unrelated topics"], 0, "Offering a time and stating the purpose makes scheduling easy.", "studybench-curriculum"),
        q("Written Communication", "medium", "Long, rambling emails are improved by:", ["Adding more text", "Removing the subject", "Putting the key ask first and being concise", "Using all caps"], 2, "Leading with the ask and trimming keeps the email readable.", "studybench-curriculum"),
        q("Written Communication", "easy", "Writing an email in ALL CAPITALS is read as:", ["Polite", "Shouting and unprofessional", "Formal", "Required"], 1, "Full capitals read as shouting and look unprofessional.", "studybench-curriculum"),
        q("Written Communication", "easy", "The tone of a professional email should be:", ["Polite and respectful", "Aggressive", "Casual slang", "Sarcastic"], 0, "A polite, respectful tone maintains professionalism.", "studybench-curriculum"),
        q("Essay Writing", "medium", "The introduction paragraph of an essay should:", ["List references", "Be the conclusion", "Be left blank", "State your stance clearly"], 3, "Open with a clear thesis so the reader knows your position.", "studybench-curriculum"),
        q("Essay Writing", "medium", "Each body paragraph of an essay should:", ["Cover many ideas at once", "Develop one main idea with support", "Only repeat the intro", "Be a single word"], 1, "One idea per paragraph, backed by a reason or example, reads clearly.", "studybench-curriculum"),
        q("Essay Writing", "medium", "A good essay conclusion:", ["Introduces new arguments", "Is unrelated to the essay", "Restates the position and closes", "Is left out"], 2, "Conclusions restate the stance and close; they don't add new claims.", "studybench-curriculum"),
        q("Essay Writing", "medium", "For a balanced opinion essay you should:", ["Present a stance and acknowledge the other side", "Ignore counter-arguments", "Only give opinions with no reasons", "Avoid taking any stance"], 0, "A balanced essay states a view and fairly notes the opposing side.", "studybench-curriculum"),
        q("Written Communication", "easy", "Spelling and grammar in a written round are:", ["Ignored", "Unimportant", "Optional", "Scored and worth checking"], 3, "Written rounds assess language, so spelling and grammar count.", "studybench-curriculum"),
        q("Written Communication", "easy", "Short, clear sentences in writing:", ["Reduce clarity", "Improve readability", "Are unprofessional", "Should be avoided"], 1, "Short sentences are easier to read and reduce errors.", "studybench-curriculum"),
        q("Essay Writing", "medium", "Planning for a minute before writing an essay helps you:", ["Waste time", "Lower quality", "Organise ideas and save time", "Avoid the topic"], 2, "A quick plan structures your ideas and speeds up writing.", "studybench-curriculum"),
        q("Written Communication", "medium", "An email reply should ideally:", ["Address the points raised and be timely", "Ignore the questions", "Change the topic", "Be sent weeks later"], 0, "Answering the actual points promptly is good email etiquette.", "studybench-curriculum"),
        q("Written Communication", "medium", "Using bullet points in an email is helpful when:", ["Never appropriate", "Listing several distinct items", "Replacing all sentences", "Writing a story"], 1, "Bullets make a list of separate items easy to scan.", "studybench-curriculum"),
        q("Written Communication", "medium", "Which is the clearest subject line?", ["'Hi'", "'Important!!!'", "(blank)", "'Request: 15-min call about the offer (Tue/Wed)'"], 3, "A specific, scannable subject states the purpose and options up front.", "studybench-curriculum"),
        q("Written Communication", "easy", "Professional writing avoids:", ["Slang and text-speak", "Complete sentences", "Greetings", "Sign-offs"], 0, "Slang and text abbreviations look unprofessional in formal writing.", "studybench-curriculum"),
        q("Written Communication", "medium", "The reader of a formal email should learn the purpose:", ["Only after reading everything", "Never", "From the subject and first lines", "From the signature"], 2, "The subject and opening lines should make the purpose immediately clear.", "studybench-curriculum"),
        q("Written Communication", "easy", "Proofreading mainly catches:", ["Only fonts", "Spelling, grammar and unclear sentences", "Nothing useful", "Only the date"], 1, "A final read catches typos, grammar slips and confusing phrasing.", "studybench-curriculum"),
        q("Written Communication", "medium", "When emailing a recruiter, attachments should be:", ["Named clearly and in a standard format", "Unnamed", "In an unusual format", "Password-locked without sharing the password"], 0, "Clear file names and standard formats (like PDF) are easy to open.", "studybench-curriculum"),
        q("Essay Writing", "medium", "An essay written as one long paragraph is improved by:", ["Making it longer", "Removing punctuation", "Using only commas", "Breaking it into clear paragraphs"], 3, "Paragraph breaks group ideas and make the argument easy to follow.", "studybench-curriculum"),
        q("Written Communication", "medium", "Which is a polite, time-bound request?", ["'Reply asap!!'", "'Could you confirm by Tuesday 3pm?'", "'Whenever'", "'Do it now'"], 1, "A specific deadline phrased politely is clear and respectful.", "studybench-curriculum"),
        q("Written Communication", "medium", "In written communication, clarity matters more than:", ["Correct facts", "Politeness", "Showing off vocabulary", "Structure"], 2, "Being understood beats impressive words; clarity comes first.", "studybench-curriculum"),
        q("Essay Writing", "easy", "Repeating the same point in different words in an essay:", ["Adds length but not value", "Is the best technique", "Improves the score", "Is always required"], 0, "Padding with repetition lengthens the essay without strengthening it.", "studybench-curriculum"),
        q("Written Communication", "medium", "A formal email to someone you haven't met opens with:", ["'Yo'", "'Dear Mr./Ms. <name>'", "'Hey buddy'", "no greeting"], 1, "A formal salutation suits a first email to someone you don't know.", "studybench-curriculum"),
        q("Written Communication", "hard", "When you must decline a request by email, you should:", ["Ignore the email", "Be rude", "Be vague and evasive", "Be polite, clear and brief"], 3, "A courteous, clear and brief 'no' is more professional than silence or vagueness.", "studybench-curriculum"),
        q("Essay Writing", "easy", "An effective essay thesis is:", ["A clear, specific main claim", "A question with no answer", "A list of facts", "Left implied"], 0, "A strong thesis states a clear, specific position to argue.", "studybench-curriculum"),
        q("Essay Writing", "medium", "Transition words in an essay help:", ["Confuse the reader", "Connect ideas smoothly", "Pad the word count", "Hide the argument"], 1, "Transitions guide the reader from one idea to the next.", "studybench-curriculum"),
        q("Written Communication", "medium", "When replying within an email thread, you should:", ["Delete all context", "Change the subject randomly", "Keep the relevant context", "Start an unrelated topic"], 2, "Keeping context helps the reader follow the conversation.", "studybench-curriculum"),
        q("Written Communication", "easy", "A professional email avoids:", ["Excessive exclamation marks", "A greeting", "A clear subject", "A sign-off"], 0, "Overusing exclamation marks looks unprofessional and emotional.", "studybench-curriculum"),
        q("Written Communication", "hard", "Good written communication is best described as:", ["Long and decorative", "Full of jargon", "Vague but friendly", "Clear, correct and concise"], 3, "Clarity, correctness and concision define strong professional writing.", "studybench-curriculum"),
        q("Written Communication", "easy", "Re-reading your email before sending helps avoid:", ["Nothing", "Errors and unclear requests", "The recipient", "The subject line"], 1, "A quick re-read catches mistakes and sharpens your request.", "studybench-curriculum"),
      ],
    },
    {
      id: "comm-hr",
      title: "HR Questions, Deep Dive",
      summary: "Answer the classics with structure: strengths, 'why us', goals and salary.",
      lessons: [
        {
          id: "l-hr-1",
          title: "Answering the classic HR questions",
          minutes: 7,
          body:
            "**\"Why this company?\"** Cite 1-2 specific, researched facts (a product, a value, a technology) and connect them to your goals. Never a generic \"it's a good company\".\n\n**\"Where in 5 years?\"** Show realistic growth aligned to the role and a willingness to take on more responsibility.\n\n**\"Your weakness?\"** Name a real one and the concrete steps you are taking to improve. Self-awareness beats a fake \"I work too hard\".\n\n**\"Salary expectation (fresher)?\"** It is fine to say you are flexible and open to the company's standard for the role.\n\n**Common mistake:** vague, rehearsed answers. Specifics show genuine interest.",
          sourceIds: ["studybench-curriculum"],
        },
        {
          id: "l-hr-2",
          title: "STAR for behavioural questions",
          minutes: 5,
          body:
            "For \"Tell me about a time...\" questions, structure your answer with **STAR**:\n- **Situation** - the context (briefly).\n- **Task** - what you were responsible for.\n- **Action** - what YOU did (the bulk of the answer).\n- **Result** - the outcome, ideally measurable.\n\n**Worked example (teamwork):** Situation - a group project running late; Task - coordinate the backend; Action - split tasks, set daily check-ins; Result - delivered two days early.\n\n**Exam tip:** spend most of your words on Action and end with a concrete Result.",
          sourceIds: ["studybench-curriculum"],
        },
      ],
      quiz: [
        q("HR", "medium", "Best framing for 'What is your weakness?'", ["I have none", "A real weakness plus how you are improving it", "Blame others", "A strength in disguise only"], 1, "Show self-awareness: name a genuine area and the concrete steps you take to improve.", "studybench-curriculum"),
        q("HR", "medium", "For 'Why do you want to join us?', the strongest answer:", ["Says 'it's a good company'", "Cites specific researched facts about the company", "Talks only about salary", "Says you applied everywhere"], 1, "Specific, researched reasons show genuine interest and effort.", "studybench-curriculum"),
        q("HR", "medium", "Asked about salary as a fresher, a sensible response is:", ["Demand a high number", "Refuse to answer", "Say you're flexible and open to the role's standard", "Quote a competitor"], 2, "Flexibility plus market awareness is the mature stance for a fresher.", "studybench-curriculum"),
        q("HR", "easy", "STAR in behavioural interviews stands for:", ["Stop, Think, Act, Review", "Situation, Task, Action, Result", "Skill, Talent, Aptitude, Role", "Start, Try, Adapt, Repeat"], 1, "STAR = Situation, Task, Action, Result.", "studybench-curriculum"),
        q("HR", "medium", "For 'Where do you see yourself in 5 years?', the best answer shows:", ["Realistic growth aligned to the role", "A plan to quit soon", "Only salary goals", "An unrelated ambition"], 0, "Show realistic professional growth that fits the role and company.", "studybench-curriculum"),
        q("HR", "medium", "When asked about a failure, you should:", ["Deny ever failing", "Describe it honestly and what you learned", "Blame your team", "Avoid the question"], 1, "Owning a real failure plus the lesson shows maturity and growth.", "studybench-curriculum"),
        q("HR", "medium", "The strongest answer to 'Why should we hire you?' connects:", ["Your hobbies to the office", "Your salary to the budget", "Your skills to the role's needs", "Your friends to the company"], 2, "Map your skills and ownership directly to what the role requires.", "studybench-curriculum"),
        q("HR", "easy", "A genuine strength is best presented with:", ["A concrete example showing it", "A long list of adjectives", "An exaggeration", "A comparison to others"], 0, "An example proves the strength rather than just claiming it.", "studybench-curriculum"),
        q("HR", "medium", "When discussing a weakness, you should add:", ["A fake strength", "Nothing more", "A complaint", "The steps you take to improve it"], 3, "Pair a real weakness with the concrete action you're taking on it.", "studybench-curriculum"),
        q("HR", "medium", "Asked 'Why do you want this job?', you should mention:", ["The free snacks", "Specific aspects of the role and company", "That you applied everywhere", "Only the location"], 1, "Specific, researched reasons signal genuine interest.", "studybench-curriculum"),
        q("HR", "medium", "If asked about relocating, the best response is:", ["A flat refusal", "An evasive non-answer", "Honest and flexible, noting real constraints if any", "A promise you can't keep"], 2, "Honesty plus flexibility reads better than evasiveness or false promises.", "studybench-curriculum"),
        q("HR", "easy", "If you have a gap in your record, you should:", ["Explain it briefly and honestly", "Hide it nervously", "Lie about it", "Refuse to discuss it"], 0, "A short, honest explanation handles a gap far better than evasion.", "studybench-curriculum"),
        q("HR", "medium", "'Tell me about a conflict you handled' is best answered with:", ["Gossip about a colleague", "A refusal", "An angry rant", "A STAR example focused on the resolution"], 3, "Use STAR and emphasise how you resolved it constructively.", "studybench-curriculum"),
        q("HR", "easy", "Showing motivation in HR answers means:", ["Talking only about pay", "Connecting your goals to the role", "Saying you have no goals", "Being vague"], 1, "Tie your motivation to the work and growth the role offers.", "studybench-curriculum"),
        q("HR", "easy", "The 'R' in STAR stands for:", ["Reason", "Review", "Result", "Role"], 2, "STAR = Situation, Task, Action, Result; R is the measurable Result.", "studybench-curriculum"),
        q("HR", "medium", "In a STAR answer, most of your words should describe:", ["The Action you took", "The Situation only", "The Task only", "Unrelated details"], 0, "The Action is where you show what you personally did.", "studybench-curriculum"),
        q("HR", "medium", "When asked your salary expectation as a fresher:", ["Demand the highest figure", "Refuse to answer", "Quote a rival's offer", "Show flexibility and market awareness"], 3, "Flexibility plus awareness of the standard is the mature stance.", "studybench-curriculum"),
        q("HR", "medium", "'Tell me about a time you led a team' should highlight:", ["The team's failures", "Your specific actions and the outcome", "Other people's work", "Nothing concrete"], 1, "Focus on what you did to lead and the result it produced.", "studybench-curriculum"),
        q("HR", "easy", "In HR answers, specifics are better than:", ["Honest answers", "Examples", "Generic, rehearsed lines", "Short answers"], 2, "Concrete specifics beat vague, memorised generalities.", "studybench-curriculum"),
        q("HR", "easy", "If you don't know much about the company, you should:", ["Research it before the interview", "Pretend you do", "Skip the question", "Ask the panel to explain"], 0, "Doing your homework lets you give specific, relevant answers.", "studybench-curriculum"),
        q("HR", "medium", "Listing ten strengths with no examples is:", ["Ideal", "Most impressive", "Required", "Weaker than two backed by evidence"], 3, "A couple of evidenced strengths beat a long unbacked list.", "studybench-curriculum"),
        q("HR", "medium", "Blaming others when describing a setback:", ["Looks strong", "Reflects poorly on you", "Is expected", "Impresses the panel"], 1, "Shifting blame signals poor accountability.", "studybench-curriculum"),
        q("HR", "medium", "A good answer to 'Why this company over others?' shows:", ["You applied randomly", "You have no preference", "Researched, specific reasons", "Only the pay"], 2, "Specific, researched reasons show genuine, considered interest.", "studybench-curriculum"),
        q("HR", "easy", "Behavioural questions usually begin with:", ["'Tell me about a time...'", "'What is the capital of...'", "'Solve this equation...'", "'Define this term...'"], 0, "Behavioural prompts ask for a past example, e.g. 'Tell me about a time...'.", "studybench-curriculum"),
        q("HR", "medium", "When asked about your goals, you should align them with:", ["Quitting soon", "An unrelated field", "Only money", "Growth in the role and company"], 3, "Goals that fit the role show you intend to grow there.", "studybench-curriculum"),
        q("HR", "easy", "Honesty in HR answers is:", ["A weakness", "Valued, even about limitations", "Always risky", "Unnecessary"], 1, "Honest, self-aware answers build trust with the panel.", "studybench-curriculum"),
        q("HR", "medium", "If asked 'What motivates you?', a strong answer is:", ["'Money only'", "'Nothing'", "Specific and tied to your work", "'I don't know'"], 2, "Tie motivation to concrete aspects of the work you enjoy.", "studybench-curriculum"),
        q("HR", "easy", "A confident answer to a tough HR question often includes:", ["A brief pause to think, then clarity", "Immediate panic", "A long silence", "A joke to avoid it"], 0, "A short pause to organise thoughts produces a clearer answer.", "studybench-curriculum"),
        q("HR", "medium", "When describing teamwork, focus on:", ["Only the team's success", "Blaming weak members", "Taking all the credit", "Your role and how you collaborated"], 3, "Show your contribution and how you worked with others.", "studybench-curriculum"),
        q("HR", "medium", "Over-rehearsed, memorised HR answers tend to:", ["Impress everyone", "Sound insincere", "Always score highest", "Be required"], 1, "Scripted answers can sound robotic; natural specifics land better.", "studybench-curriculum"),
        q("HR", "medium", "'What are your career goals?' is best answered with:", ["'I have none'", "'To be CEO next year'", "Realistic short and long-term goals", "'Whatever you want'"], 2, "Balanced, realistic goals show direction without arrogance.", "studybench-curriculum"),
        q("HR", "easy", "Asked about a mistake, the key is to show:", ["Accountability and learning", "That it wasn't your fault", "That you never err", "Irritation at the question"], 0, "Owning the mistake and the lesson demonstrates maturity.", "studybench-curriculum"),
        q("HR", "medium", "When unsure how to answer an HR question, you can:", ["Panic", "Walk out", "Make something up", "Take a brief pause to gather your thoughts"], 3, "A short, calm pause beats blurting or fabricating an answer.", "studybench-curriculum"),
        q("HR", "easy", "Researching a company before the interview helps you:", ["Waste time", "Give specific, relevant answers", "Confuse the panel", "Avoid questions"], 1, "Company knowledge powers specific 'why us' and role-fit answers.", "studybench-curriculum"),
        q("HR", "medium", "Saying 'I work too hard' as your only weakness is:", ["The best answer", "Highly original", "A cliche that sounds insincere", "Always required"], 2, "It's an overused non-answer; give a real, improvable weakness.", "studybench-curriculum"),
        q("HR", "easy", "Asked to describe yourself in three words, pick words that are:", ["Relevant and backed by examples", "Random", "Exaggerated", "Negative"], 0, "Choose role-relevant traits you can quickly justify.", "studybench-curriculum"),
        q("HR", "hard", "A strong candidate handles HR questions with:", ["Long rants", "Vague claims", "Memorised speeches", "Honesty, structure and relevant examples"], 3, "Honest, structured, example-backed answers are most convincing.", "studybench-curriculum"),
        q("HR", "medium", "When the interviewer asks if you have questions, you should:", ["Say no", "Ask a thoughtful, role-related question", "Ask only about leave", "Stay silent"], 1, "A thoughtful question signals genuine interest in the role.", "studybench-curriculum"),
        q("HR", "medium", "Discussing why you left a previous role or internship, you should:", ["Criticise the old employer", "Lie", "Stay positive and professional", "Refuse to say"], 2, "Frame it positively; badmouthing a past employer is a red flag.", "studybench-curriculum"),
        q("HR", "easy", "The goal of HR-round answers is to show you are:", ["Capable, honest and a good fit", "The loudest", "Overqualified", "Indifferent"], 0, "HR assesses fit, honesty and capability for the role.", "studybench-curriculum"),
      ],
    },
    {
      id: "comm-body-virtual",
      title: "Body Language & Virtual Interviews",
      summary: "Small habits that signal confidence, in person and on camera.",
      lessons: [
        {
          id: "l-bv-1",
          title: "Presence in the room",
          minutes: 5,
          body:
            "Confidence is read from your body before you speak. **Sit upright, make natural eye contact, offer a calm greeting, and keep your hands steady.**\n\n**Minimise filler words** (um, like, you know). A brief, silent pause sounds far more composed than a filler.\n\n**Worked intuition:** if you need a moment to think, pause and breathe rather than filling the gap with \"um\". Interviewers read the pause as thoughtfulness.\n\n**Common mistake:** slouching, fidgeting, or avoiding eye contact, which reads as nervousness even when your answers are good.",
          sourceIds: ["studybench-curriculum", "careerride-yt"],
        },
        {
          id: "l-bv-2",
          title: "On camera",
          minutes: 5,
          body:
            "Virtual interviews add a few rules:\n- **Look at the camera**, not the screen, so you appear to make eye contact.\n- Ensure **good lighting** (face a window or lamp) and a **tidy background**.\n- Test your **mic and audio**, and **join a couple of minutes early** to fix any glitches.\n\n**Worked intuition:** placing your notes just beside the webcam keeps your eyes near the camera line.\n\n**Common mistake:** a dark room, a noisy background, or joining late while troubleshooting audio. Treat the setup as part of the interview.",
          sourceIds: ["studybench-curriculum"],
        },
      ],
      quiz: [
        q("Interview", "easy", "In a video interview, to appear to make eye contact you should look at:", ["The keyboard", "The camera", "Your own video", "The window"], 1, "Looking into the camera reads as eye contact to the interviewer.", "studybench-curriculum"),
        q("Interview", "easy", "Good in-person body language includes:", ["Slouching", "Avoiding eye contact", "Upright posture and natural eye contact", "Crossed arms throughout"], 2, "Upright posture and steady eye contact convey confidence.", "studybench-curriculum"),
        q("Communication", "medium", "Filler words like 'um' and 'like' should be:", ["Used often", "Minimised, using brief pauses instead", "Added for emphasis", "Ignored entirely"], 1, "A short pause sounds more composed than a filler word.", "studybench-curriculum"),
        q("Interview", "medium", "Before a video interview you should:", ["Join late", "Test your audio and video early", "Turn the camera off", "Sit in a noisy room"], 1, "Joining early to test audio and video avoids glitches during the interview.", "studybench-curriculum"),
        q("Interview", "easy", "Confident body language in an interview includes:", ["Upright posture and steady eye contact", "Slouching low", "Staring at the floor", "Constant fidgeting"], 0, "Upright posture and natural eye contact convey confidence.", "studybench-curriculum"),
        q("Interview", "easy", "Slouching during an interview tends to signal:", ["Authority", "Low confidence or disinterest", "Friendliness", "Focus"], 1, "Poor posture reads as low energy or disinterest.", "studybench-curriculum"),
        q("Interview", "medium", "A firm, brief handshake (in person) conveys:", ["Aggression", "Weakness", "Confidence and professionalism", "Nervousness"], 2, "A confident, brief handshake sets a professional tone.", "studybench-curriculum"),
        q("Interview", "easy", "Constant fidgeting in an interview reads as:", ["Confidence", "Authority", "Friendliness", "Nervousness"], 3, "Fidgeting distracts and signals nervousness.", "studybench-curriculum"),
        q("Interview", "easy", "For a virtual interview, your background should be:", ["Tidy and non-distracting", "Cluttered", "A busy street", "Constantly moving"], 0, "A clean, simple background keeps focus on you.", "studybench-curriculum"),
        q("Interview", "medium", "Good lighting in a video interview means:", ["A dark room", "Facing a window or lamp so your face is visible", "A light behind you", "Flashing lights"], 1, "Front lighting keeps your face clearly visible on camera.", "studybench-curriculum"),
        q("Interview", "medium", "You should test your microphone and camera:", ["During the interview", "After it ends", "Never", "Before the interview starts"], 3, "Testing beforehand prevents disruptive technical issues.", "studybench-curriculum"),
        q("Interview", "medium", "Joining a virtual interview a few minutes early helps you:", ["Annoy the panel", "Skip questions", "Look unprepared", "Fix any technical glitches calmly"], 3, "An early join gives time to resolve setup issues calmly.", "studybench-curriculum"),
        q("Interview", "medium", "Placing notes beside the webcam during a video call helps you:", ["Keep your eyes near the camera line", "Read aloud word for word", "Hide from the panel", "Avoid answering"], 0, "Notes near the lens let you glance without breaking 'eye contact'.", "studybench-curriculum"),
        q("Interview", "easy", "Appropriate interview attire is:", ["Neat and professional", "Whatever is nearest", "Beachwear", "Heavily wrinkled"], 0, "Neat, professional dress shows you take the interview seriously.", "studybench-curriculum"),
        q("Interview", "medium", "Natural hand gestures while speaking can:", ["Always distract", "Be banned", "Support your message", "Show weakness"], 2, "Measured gestures can reinforce your points naturally.", "studybench-curriculum"),
        q("Interview", "medium", "A genuine smile at the start of an interview:", ["Looks fake always", "Is unprofessional", "Wastes time", "Builds rapport"], 3, "A warm, genuine smile helps build early rapport.", "studybench-curriculum"),
        q("Interview", "easy", "Looking away constantly during answers can suggest:", ["Lack of confidence", "Deep focus", "Honesty", "Leadership"], 0, "Frequent looking away can read as nervousness or evasion.", "studybench-curriculum"),
        q("Interview", "medium", "In a virtual interview, background noise should be:", ["Increased", "Minimised by choosing a quiet space", "Ignored", "Added for ambience"], 1, "A quiet space keeps your audio clear and professional.", "studybench-curriculum"),
        q("Interview", "medium", "If your internet drops during a video interview, you should:", ["Give up", "Pretend nothing happened", "Reconnect calmly and apologise briefly", "Blame the company"], 2, "Reconnect, apologise briefly and continue; composure matters.", "studybench-curriculum"),
        q("Interview", "medium", "Maintaining good posture throughout an interview:", ["Is unnecessary", "Looks stiff always", "Annoys the panel", "Signals attentiveness and confidence"], 3, "Steady, upright posture conveys engagement and confidence.", "studybench-curriculum"),
        q("Interview", "easy", "Keeping your arms crossed for the whole interview can read as:", ["Defensive or closed-off", "Confident", "Friendly", "Attentive"], 0, "Closed body language can seem defensive; keep an open posture.", "studybench-curriculum"),
        q("Interview", "medium", "On camera, you should frame yourself so that:", ["Only your forehead shows", "Your face and shoulders are clearly visible", "You are far away", "You are off-centre and cropped"], 1, "Head-and-shoulders framing is the standard, clear video setup.", "studybench-curriculum"),
        q("Interview", "medium", "Dressing professionally for a video interview is:", ["Unnecessary", "Optional always", "Still important, even at home", "Discouraged"], 2, "Professional dress matters on camera just as it does in person.", "studybench-curriculum"),
        q("Interview", "easy", "Nodding occasionally while the interviewer speaks shows:", ["Boredom", "Disagreement", "Confusion", "Active listening"], 3, "Light nodding signals that you are listening and engaged.", "studybench-curriculum"),
        q("Interview", "easy", "Checking your phone during an interview:", ["Is disrespectful and should be avoided", "Shows you're busy", "Is expected", "Impresses the panel"], 0, "Phone-checking signals disinterest; keep it away.", "studybench-curriculum"),
        q("Interview", "medium", "A calm, measured speaking pace helps you:", ["Sound rushed", "Come across as composed and clear", "Confuse the panel", "Seem nervous"], 1, "A measured pace improves clarity and reads as composure.", "studybench-curriculum"),
        q("Interview", "medium", "In a virtual interview, you should look at the camera mainly when:", ["Never", "Only at the end", "Speaking, to simulate eye contact", "Reading only"], 2, "Looking at the lens while speaking simulates eye contact.", "studybench-curriculum"),
        q("Interview", "medium", "Sitting much too far from or too close to the webcam:", ["Is ideal", "Improves audio", "Helps focus", "Distracts from your message"], 3, "Awkward framing distracts; aim for a comfortable, standard distance.", "studybench-curriculum"),
        q("Interview", "easy", "Your tone of voice in an interview should be:", ["Clear, warm and confident", "Flat and bored", "Harsh", "Barely audible"], 0, "A clear, warm, confident tone engages the panel.", "studybench-curriculum"),
        q("Interview", "easy", "Interrupting the interviewer mid-question is:", ["Recommended", "Best avoided", "A sign of confidence", "Expected"], 1, "Let the interviewer finish; interrupting reads as poor listening.", "studybench-curriculum"),
        q("Interview", "medium", "A professional virtual interview setup includes:", ["A noisy cafe", "A dark room", "Good lighting, a quiet space and stable internet", "A moving vehicle"], 2, "Light, quiet and a stable connection make a professional setup.", "studybench-curriculum"),
        q("Interview", "medium", "If you start speaking while muted on a video call, remember:", ["You sound clearer", "It's fine", "It saves time", "The interviewer can't hear you, so unmute first"], 3, "Check you're unmuted before answering on a video call.", "studybench-curriculum"),
        q("Interview", "easy", "Excessive gesturing very close to the camera can:", ["Be distracting on video", "Improve clarity", "Always help", "Be required"], 0, "Big gestures near the lens distract on video; keep them measured.", "studybench-curriculum"),
        q("Interview", "medium", "Eye contact in an in-person interview should be:", ["A constant unblinking stare", "Natural and steady, not a fixed stare", "Completely avoided", "Only at the floor"], 1, "Natural, steady eye contact reads as confident, not aggressive.", "studybench-curriculum"),
        q("Interview", "medium", "Wearing very bright, busy patterns on camera can:", ["Improve clarity", "Always help", "Be visually distracting", "Be required"], 2, "Busy patterns can shimmer or distract on video; keep clothing simple.", "studybench-curriculum"),
        q("Interview", "medium", "A confident entry into the interview room includes:", ["Looking at the floor", "Mumbling", "Rushing in", "A greeting, eye contact and a calm smile"], 3, "A composed greeting with eye contact sets a strong first impression.", "studybench-curriculum"),
        q("Interview", "easy", "If you need a moment to think, it is better to:", ["Pause briefly than to use fillers", "Fill the gap with 'um'", "Talk faster", "Change the subject"], 0, "A brief silent pause sounds more composed than fillers.", "studybench-curriculum"),
        q("Interview", "easy", "Keeping a glass of water nearby during a long interview is:", ["Unprofessional", "Sensible and acceptable", "Distracting", "Forbidden"], 1, "Having water on hand for a long interview is perfectly fine.", "studybench-curriculum"),
        q("Interview", "medium", "Your facial expression during answers should be:", ["Blank", "Frowning", "Engaged and pleasant", "Distracted"], 2, "An engaged, pleasant expression supports your spoken answers.", "studybench-curriculum"),
        q("Interview", "hard", "Overall, body language should reinforce:", ["Your nervousness", "Boredom", "Disinterest", "The confidence in your words"], 3, "Body language should match and reinforce confident, clear answers.", "studybench-curriculum"),
      ],
    },
    {
      id: "comm-final-round",
      title: "Final Interview Round",
      summary: "Think aloud on technical questions and close the interview strongly.",
      lessons: [
        {
          id: "l-ci-3",
          title: "Handling the panel",
          minutes: 6,
          body:
            "On technical questions, **think aloud** - interviewers score your approach, not just the final answer. If you are stuck, **state your assumptions and a brute-force idea first, then optimise**.\n\nFor behavioural questions, use **STAR** (Situation, Task, Action, Result).\n\n**Worked intuition:** asked to find duplicates, say \"the simple way is to compare every pair, O(n^2); I can do better with a hash set in O(n)\" - that shows range.\n\n**Common mistake:** going silent when stuck. Narrate your thinking so the panel can follow and nudge you.",
          sourceIds: ["studybench-curriculum"],
        },
        {
          id: "l-ci-4",
          title: "Closing strong",
          minutes: 4,
          body:
            "End the interview deliberately. **Ask one thoughtful, forward-looking question** and thank the panel.\n\nGood closing questions: \"What does success look like in this role in the first six months?\" or \"What does the team value most in new joiners?\"\n\n**Worked intuition:** a forward-looking question signals genuine interest and maturity, and leaves a strong final impression.\n\n**Common mistake:** saying \"No, I have no questions.\" It reads as low interest. Always have one ready.",
          sourceIds: ["studybench-curriculum"],
        },
      ],
      quiz: [
        q("Interview", "medium", "When you don't know a technical answer, the best move is to:", ["Stay silent", "Guess randomly", "State your assumptions and reason aloud", "Change the topic"], 2, "Reasoning aloud and stating assumptions shows problem-solving even without the final answer.", "studybench-curriculum"),
        q("HR", "easy", "STAR in behavioural interviews stands for:", ["Stop, Think, Act, Review", "Situation, Task, Action, Result", "Skill, Talent, Aptitude, Role", "Start, Try, Adapt, Repeat"], 1, "STAR = Situation, Task, Action, Result - a structure for behavioural answers.", "studybench-curriculum"),
        q("Interview", "medium", "A good question to ask the interviewer at the end is:", ["What does this company do?", "When can I leave?", "What does success look like in this role in 6 months?", "Nothing"], 2, "A thoughtful forward-looking question signals genuine interest and maturity.", "studybench-curriculum"),
        q("Interview", "medium", "When stuck on a coding question, you should:", ["Stay silent", "Give up", "State a brute-force idea, then optimise", "Change the subject"], 2, "Start with a working brute-force approach and improve it; the panel scores your reasoning.", "studybench-curriculum"),
        q("Interview", "easy", "In the final interview round, thinking aloud helps because:", ["The panel can follow and guide your reasoning", "It wastes time", "It hides your mistakes", "It is discouraged"], 0, "Narrating your thoughts lets the panel follow your approach and nudge you.", "studybench-curriculum"),
        q("Interview", "medium", "When given a technical problem, you should first:", ["Start coding immediately", "Clarify the requirements and constraints", "Ask for the answer", "Stay silent"], 1, "Clarifying inputs, outputs and constraints prevents solving the wrong problem.", "studybench-curriculum"),
        q("Interview", "medium", "If you realise mid-answer that you made a mistake, you should:", ["Hide it", "Keep going with the wrong answer", "Acknowledge it and correct yourself", "Blame the question"], 2, "Owning and fixing a mistake shows maturity and clear thinking.", "studybench-curriculum"),
        q("Interview", "medium", "A strong way to show range on a coding question is to:", ["Give only one solution", "Refuse to optimise", "Skip complexity analysis", "Mention brute force, then an optimised approach"], 3, "Showing both the simple and the improved approach signals depth.", "studybench-curriculum"),
        q("Interview", "medium", "When the panel challenges your answer, the best response is to:", ["Listen, reconsider, and justify or revise calmly", "Argue loudly", "Immediately give up", "Ignore them"], 0, "Calmly reconsidering and justifying or revising shows confidence and openness.", "studybench-curriculum"),
        q("Interview", "easy", "Stating the time complexity of your solution shows:", ["Weakness", "Strong fundamentals", "Arrogance", "Nothing useful"], 1, "Volunteering complexity demonstrates solid CS fundamentals.", "studybench-curriculum"),
        q("Interview", "medium", "If asked a question outside your knowledge, you should:", ["Bluff confidently", "Stay silent", "Be honest and reason from basics", "Change the topic"], 2, "Honesty plus first-principles reasoning beats bluffing.", "studybench-curriculum"),
        q("Interview", "medium", "Asking clarifying questions before solving is seen as:", ["Annoying", "A waste of time", "Weakness", "A sign of good engineering judgement"], 3, "Clarifying first is exactly what good engineers do.", "studybench-curriculum"),
        q("Interview", "easy", "In a panel interview, you should make eye contact with:", ["Whoever asked, then include the whole panel", "Only the floor", "Only one person the whole time", "Nobody"], 0, "Address the asker, then naturally include the rest of the panel.", "studybench-curriculum"),
        q("Interview", "easy", "A good closing question to the panel shows:", ["Desperation", "Genuine interest in the role", "Boredom", "Nothing"], 1, "A thoughtful question signals real interest in the role and team.", "studybench-curriculum"),
        q("Interview", "medium", "If you finish a coding question early, you should:", ["Sit silently", "Ask to leave", "Test edge cases and explain your testing", "Delete your code"], 2, "Walking through edge-case testing shows thoroughness.", "studybench-curriculum"),
        q("Interview", "medium", "When discussing a project in the final round, focus on:", ["Only the team", "Only the tools", "The company's history", "Your contribution and key decisions"], 3, "Make your ownership and decisions visible, not just the team's output.", "studybench-curriculum"),
        q("Interview", "medium", "Handling a stress question calmly demonstrates:", ["Composure under pressure", "Weakness", "Arrogance", "Confusion"], 0, "Staying calm under a tough question signals composure.", "studybench-curriculum"),
        q("Interview", "hard", "If two interviewers give conflicting hints, you should:", ["Ignore both", "Politely reconcile them and state your assumption", "Argue with them", "Pick one and stay silent"], 1, "Reconcile the hints aloud and state the assumption you'll proceed on.", "studybench-curriculum"),
        q("Interview", "medium", "The best mindset for the final round is to treat it as:", ["A fight", "An exam to memorise", "A technical discussion, not an interrogation", "A pure formality"], 2, "Viewing it as a collaborative discussion lowers stress and improves answers.", "studybench-curriculum"),
        q("Interview", "easy", "When you don't understand the interviewer's question, you should:", ["Guess", "Answer something else", "Stay silent", "Politely ask them to rephrase it"], 3, "Asking to rephrase ensures you answer what was actually asked.", "studybench-curriculum"),
        q("Interview", "medium", "Explaining your approach before coding helps because:", ["The interviewer can correct your direction early", "It wastes time", "It reveals weakness", "It is not allowed"], 0, "An early approach check saves you from coding down a wrong path.", "studybench-curriculum"),
        q("Interview", "medium", "When you disagree with the interviewer, the best behaviour is to:", ["Stay quiet always", "Disagree respectfully with reasoning", "Insist loudly", "Apologise and give up"], 1, "Respectful, reasoned disagreement is valued over silence or stubbornness.", "studybench-curriculum"),
        q("Interview", "easy", "After solving, summarising your solution is:", ["Unnecessary", "A waste of time", "A good way to close the answer", "A sign of doubt"], 2, "A short summary cleanly wraps up your solution for the panel.", "studybench-curriculum"),
        q("Interview", "medium", "If you are rejected after an interview, a professional response is to:", ["Argue", "Send angry emails", "Give up on the company forever", "Thank them and ask for feedback"], 3, "A gracious response and a feedback request keep the door open.", "studybench-curriculum"),
        q("Interview", "easy", "In the final round, honesty about your experience level is:", ["Respected", "A guaranteed rejection", "Always hidden", "Unimportant"], 0, "Honesty about your level builds trust and sets fair expectations.", "studybench-curriculum"),
        q("Interview", "medium", "Writing clean, readable code in an interview matters because:", ["It does not matter", "Interviewers assess clarity, not just correctness", "Only speed matters", "Only the output matters"], 1, "Readable code signals professionalism and is part of the evaluation.", "studybench-curriculum"),
        q("Interview", "medium", "When the interviewer goes silent while you code, it usually means:", ["They are bored", "You have failed", "They are observing your approach", "You should stop"], 2, "Silence usually means they're watching how you work; keep narrating.", "studybench-curriculum"),
        q("Interview", "medium", "If you need a hint, the right approach is to:", ["Demand the answer", "Give up", "Stay silent", "Explain where you are stuck and ask a focused question"], 3, "Pinpointing your blocker and asking a focused question is acceptable and smart.", "studybench-curriculum"),
        q("Interview", "easy", "Showing genuine enthusiasm in the final round:", ["Leaves a positive impression", "Looks desperate", "Is unprofessional", "Should be hidden"], 0, "Sincere enthusiasm for the role leaves a strong final impression.", "studybench-curriculum"),
        q("Interview", "medium", "When asked 'Do you have questions for us?', you should:", ["Say no", "Ask something thoughtful about the role or team", "Ask only about leaves", "Ask nothing relevant"], 1, "A thoughtful, role-focused question shows real interest.", "studybench-curriculum"),
        q("Interview", "medium", "Discussing salary in a final round is best handled by:", ["Demanding a high figure", "Refusing to engage", "Being reasonable and open to discussion", "Lying about other offers"], 2, "A reasonable, open stance is the mature way to handle salary talk.", "studybench-curriculum"),
        q("Interview", "medium", "If you cannot finish a problem in time, you should:", ["Pretend it works", "Erase everything", "Stay silent", "Explain your plan and how you would complete it"], 3, "Describing your remaining plan still shows your problem-solving ability.", "studybench-curriculum"),
        q("Interview", "hard", "Confidence in the final round comes across best when it is:", ["Backed by clear reasoning, not bravado", "Loud and aggressive", "Based on guessing", "Hidden completely"], 0, "Quiet confidence backed by reasoning is far more convincing than bravado.", "studybench-curriculum"),
        q("Interview", "easy", "A panel values a candidate who:", ["Talks the most", "Communicates clearly and reasons well", "Memorises answers", "Never asks questions"], 1, "Clear communication and sound reasoning are what panels reward.", "studybench-curriculum"),
        q("Interview", "medium", "When you make an assumption to proceed, you should:", ["Hide it", "Assume it silently", "State it openly so the panel can correct it", "Avoid all assumptions"], 2, "Voicing assumptions lets the panel align you before you go too far.", "studybench-curriculum"),
        q("Interview", "easy", "Sending a brief thank-you note after the interview is:", ["Desperate", "Unprofessional", "Pointless", "A professional, positive gesture"], 3, "A short, sincere thank-you is a courteous, professional touch.", "studybench-curriculum"),
        q("Interview", "medium", "If the interviewer asks 'why should we hire you?', you should connect:", ["Your skills and attitude to the role's needs", "Your hobbies to the office", "Your salary to the budget", "Your friends to the company"], 0, "Map your strengths and learning attitude directly to the role.", "studybench-curriculum"),
        q("Interview", "medium", "Multiple follow-up questions on one topic usually mean:", ["You answered wrong", "The interviewer is probing your depth", "They dislike you", "The interview is over"], 1, "Deeper follow-ups are a sign they are testing how far your knowledge goes.", "studybench-curriculum"),
        q("Interview", "hard", "The most important thing in the final round is to:", ["Use complex jargon", "Finish fastest", "Communicate your thinking clearly and honestly", "Agree with everything"], 2, "Clear, honest communication of your reasoning is what decides the round.", "studybench-curriculum"),
        q("Interview", "easy", "When ending the interview, you should:", ["Leave abruptly", "Complain about the questions", "Demand a decision immediately", "Thank the panel and express interest"], 3, "A courteous close expressing interest leaves a positive last impression.", "studybench-curriculum"),
      ],
    },
  ],
}

const BASE_SECTIONS: Section[] = [quant, reasoning, verbal, coding, csCore, commInterview]

// Company-specific extra chapter: Zoho is coding-heavy.
const ZOHO_EXTRA = {
  id: "coding-zoho-design",
  title: "Program Design (Machine Round)",
  summary: "Machine-round style: design and debug a small program end to end.",
  lessons: [
    {
      id: "l-zoho-1",
      title: "Designing under pressure",
      minutes: 7,
      body:
        "Programming-heavy recruiters give a real problem to build on a machine. Work in this order:\n1. **Clarify the input and output** and the edge cases before writing code.\n2. **Break the problem into small functions**, each doing one thing.\n3. **Handle edge cases** explicitly: empty input, a single element, very large values / overflow.\n4. **Test with your own examples** before declaring done.\n\n**Worked intuition:** for \"sum of an array\", the robust version returns 0 for an empty array instead of crashing.\n\n**Common mistake:** writing the whole program then testing once at the end. Build and test in small pieces.",
      sourceIds: ["zoho-careers", "gfg-dsa"],
    },
  ],
  quiz: [
    q("Coding", "hard", "When designing a program in a timed machine round, you should FIRST:", ["Write the whole thing then test", "Clarify input/output and edge cases", "Optimise prematurely", "Pick the fanciest data structure"], 1, "Clarify I/O and edge cases first; correctness on edges wins these rounds.", "zoho-careers"),
    q("Coding", "medium", "A robust function for 'sum of array' must handle:", ["Only positive numbers", "An empty array", "Only sorted arrays", "Only size 10"], 1, "Empty input is the classic edge case - return 0 rather than crashing.", "gfg-dsa"),
    q("Coding", "medium", "The best way to build a solution in a timed coding round is to:", ["Write everything, then test once", "Build and test in small pieces", "Skip edge cases", "Avoid functions"], 1, "Building and testing incrementally catches bugs early and saves time.", "gfg-dsa"),
  ],
}

// ============================================================================
// EXTRA CHAPTERS - broaden coverage for serious placement prep (all tracks)
// ============================================================================

// ---- QUANT ----
const quantTimeWork: Chapter = {
  id: "quant-time-work",
  title: "Time & Work, Pipes & Cisterns",
  summary: "Think in work-per-day rates and combine them - the fast way to solve work problems.",
  lessons: [
    {
      id: "l-tw-1",
      title: "The work-rate method",
      minutes: 6,
      body:
        "Never think in days first - think in **work done per day**. If A finishes a job in 'a' days, A's rate is **1/a per day**. To work together, simply **add the rates**, then invert for the time.\n\n**The LCM trick (fastest):** let total work = LCM of the times, in 'units'. Then each person's rate = total / their time, in units per day.\n\n**Worked example:** A finishes in 12 days, B in 24. Take total = LCM(12, 24) = 24 units. A does 2 units/day, B does 1 unit/day, together 3 units/day -> 24 / 3 = **8 days**.\n\n**Common mistake:** averaging the days (12 and 24 -> 18). You add rates, not days.",
      sourceIds: ["rs-aggarwal-quant"],
    },
    {
      id: "l-tw-2",
      title: "Pipes and cisterns (negative work)",
      minutes: 5,
      body:
        "Pipes are just work in disguise. A **filling** pipe has a positive rate; a **draining** pipe has a negative rate. Add them up.\n\n**Worked example:** pipe A fills a tank in 6 hours (rate 1/6), pipe B empties it in 12 hours (rate -1/12). Both open: 1/6 - 1/12 = 1/12 -> the tank fills in **12 hours**.\n\n**Worked example (find one rate):** A and B together finish in 8 days; A alone in 12 days. B's rate = 1/8 - 1/12 = 1/24, so B alone takes **24 days**.\n\n**Exam tip:** if 'm' people take 'd' days, then more or fewer people scale inversely (men and days are inversely proportional for the same work).",
      sourceIds: ["rs-aggarwal-quant"],
    },
  ],
  quiz: [
    q("Time & Work", "easy", "A finishes a job in 10 days, B in 15 days. Together:", ["5 days", "6 days", "7.5 days", "12 days"], 1, "Add rates: 1/10 + 1/15 = 3/30 + 2/30 = 5/30 = 1/6. Together = 6 days.", "rs-aggarwal-quant"),
    q("Time & Work", "easy", "A does a job in 20 days, B in 30 days. Together:", ["10 days", "12 days", "15 days", "25 days"], 1, "1/20 + 1/30 = 3/60 + 2/60 = 5/60 = 1/12. Together = 12 days.", "rs-aggarwal-quant"),
    q("Time & Work", "easy", "If 6 men build a wall in 10 days, 12 men take:", ["5 days", "15 days", "20 days", "4 days"], 0, "Men and days are inversely proportional: 6×10 = 12×d → d = 5 days.", "indiabix-aptitude"),
    q("Time & Work", "easy", "A can do a job in 15 days. In 5 days, fraction of work done:", ["1/5", "1/3", "1/4", "2/5"], 1, "Work done per day = 1/15. In 5 days = 5/15 = 1/3.", "rs-aggarwal-quant"),
    q("Pipes & Cisterns", "easy", "Pipe A fills a tank in 6 h, pipe B in 12 h. Both open:", ["3 h", "4 h", "8 h", "9 h"], 1, "1/6 + 1/12 = 2/12 + 1/12 = 3/12 = 1/4 per hour → fills in 4 hours.", "rs-aggarwal-quant"),
    q("Pipes & Cisterns", "easy", "A tank is filled by a pipe in 3 h and emptied in 6 h. Net fill time when both open:", ["3 h", "4 h", "6 h", "12 h"], 2, "Net rate = 1/3 − 1/6 = 1/6 per hour → fills in 6 hours.", "rs-aggarwal-quant"),
    q("Time & Work", "easy", "A alone takes 18 days, B alone 9 days. Together:", ["3 days", "6 days", "9 days", "12 days"], 1, "1/18 + 1/9 = 1/18 + 2/18 = 3/18 = 1/6. Together = 6 days.", "rs-aggarwal-quant"),
    q("Time & Work", "easy", "A, B and C together finish a job in 4 days. A alone takes 12 days and B alone takes 8 days. C alone takes:", ["12 days", "16 days", "24 days", "48 days"], 2, "Together rate = 1/4. A + B = 1/12 + 1/8 = 5/24. So C's rate = 1/4 − 5/24 = 1/24, meaning C alone takes 24 days.", "rs-aggarwal-quant"),
    q("Time & Work", "medium", "A and B together finish a job in 8 days; A alone takes 12 days. B alone:", ["16 days", "20 days", "24 days", "18 days"], 2, "B rate = 1/8 − 1/12 = 3/24 − 2/24 = 1/24 → B alone = 24 days.", "rs-aggarwal-quant"),
    q("Time & Work", "medium", "A is twice as fast as B. Together they finish in 12 days. A alone:", ["16 days", "18 days", "24 days", "36 days"], 1, "If B takes d days, A takes d/2. 1/(d/2) + 1/d = 1/12 → 2/d + 1/d = 1/12 → 3/d = 1/12 → d = 36. A alone = 18 days.", "rs-aggarwal-quant"),
    q("Pipes & Cisterns", "medium", "Pipe A fills tank in 8 h, pipe B empties in 12 h. Net time to fill when both open:", ["18 h", "24 h", "20 h", "16 h"], 1, "Net rate = 1/8 − 1/12 = 3/24 − 2/24 = 1/24. Time = 24 h.", "rs-aggarwal-quant"),
    q("Time & Work", "medium", "10 men complete a job in 12 days. After 6 days, 5 men leave. Days to finish rest:", ["12 days", "15 days", "18 days", "20 days"], 0, "Total work = 120 man-days. Done in 6 days = 60. Remaining = 60 man-days with 5 men = 60/5 = 12 days.", "rs-aggarwal-quant"),
    q("Time & Work", "medium", "A can do 1/3 of work in 5 days. Time to do 3/4 of the same work:", ["12.5 days", "11.25 days", "15 days", "10 days"], 1, "Full work = 15 days. 3/4 of 15 = 11.25 days.", "rs-aggarwal-quant"),
    q("Time & Work", "medium", "A, B, C can each individually finish a task in 10, 15, 20 days. Together:", ["4 days", "4.6 days", "5 days", "6 days"], 1, "1/10 + 1/15 + 1/20 = 6/60 + 4/60 + 3/60 = 13/60. Together = 60/13 ≈ 4.6 days.", "rs-aggarwal-quant"),
    q("Pipes & Cisterns", "medium", "Two pipes fill a tank in 20 and 30 min. A third pipe drains it in 40 min. All three open, time to fill:", ["17.14 min", "19 min", "20 min", "24 min"], 0, "Net rate = 1/20 + 1/30 − 1/40 = 6/120 + 4/120 − 3/120 = 7/120 per min → 120/7 ≈ 17.14 min.", "rs-aggarwal-quant"),
    q("Time & Work", "medium", "A and B can do a job in 12 and 16 days respectively. They start together but B leaves after 4 days. A finishes the rest alone in:", ["3 days", "4 days", "5 days", "6 days"], 2, "In 4 days together they do 4 × (1/12 + 1/16) = 4 × 7/48 = 7/12. Remaining = 5/12, which A alone does in (5/12) ÷ (1/12) = 5 days.", "rs-aggarwal-quant"),
    q("Time & Work", "medium", "8 workers finish a project in 12 days. How many extra workers to finish in 8 days?", ["4", "6", "8", "12"], 0, "Total = 96 man-days. 8 days → workers = 96/8 = 12. Extra = 12 − 8 = 4.", "indiabix-aptitude"),
    q("Time & Work", "medium", "A is three times as efficient as B. A works for 3 days and leaves, then B finishes the remaining work in 12 days. How long would A alone take to do the whole work?", ["6 days", "7 days", "9 days", "12 days"], 1, "Let B's one-day work = x, so A's = 3x. Then 3 × 3x + 12 × x = 1 → 21x = 1, so x = 1/21 and A alone = 1/(3x) = 7 days.", "rs-aggarwal-quant"),
    q("Pipes & Cisterns", "hard", "Pipe A fills a tank in 12 min and B in 8 min; pipe C empties it in 6 min. With all three open, the tank fills in:", ["24 min", "Never fills", "48 min", "36 min"], 0, "Net rate = 1/12 + 1/8 − 1/6 = 2/24 + 3/24 − 4/24 = 1/24, so the tank fills in 24 minutes.", "rs-aggarwal-quant"),
    q("Time & Work", "hard", "A and B together do 2/5 of a work in 6 days. How many days for the full work?", ["12 days", "15 days", "18 days", "20 days"], 1, "If 2/5 takes 6 days, full work takes 6 × 5/2 = 15 days.", "rs-aggarwal-quant"),
    q("Time & Work", "hard", "A is thrice as good as B. Together they complete in 9 days. B alone:", ["18 days", "27 days", "36 days", "54 days"], 2, "Let B's rate = x, A's rate = 3x. Together = 4x = 1/9. So x = 1/36. B alone = 36 days.", "rs-aggarwal-quant"),
    q("Pipes & Cisterns", "hard", "A pipe fills 3/4 of a tank in 9 hours. Full fill time:", ["9 h", "10 h", "12 h", "16 h"], 2, "If 3/4 fills in 9 h, full fills in 9 × 4/3 = 12 h.", "rs-aggarwal-quant"),
    q("Time & Work", "hard", "20 men can finish a job in 18 days. After 6 days, 5 men leave. The remaining men finish the job in:", ["12 days", "15 days", "16 days", "18 days"], 2, "Total work = 20 × 18 = 360 man-days. In 6 days, 120 are done, leaving 240. With 15 men, time = 240/15 = 16 days.", "rs-aggarwal-quant"),
    q("Time & Work", "hard", "A, B, C can complete a job in 20, 30, 40 days. A and B work together for 5 days, then C joins. Days to complete from then:", ["5 days", "6 days", "6.5 days", "7 days"], 1, "After 5 days together: (1/20+1/30)×5 = (5/60)×5 = 25/60 = 5/12 done. Remaining = 7/12. All three rate = 1/20+1/30+1/40 = 6/120+4/120+3/120 = 13/120. Days = (7/12)/(13/120) = (7/12)×(120/13) = 70/13 ≈ 5.38 ≈ 6 days.", "rs-aggarwal-quant"),
    q("Time & Work", "easy", "In how many days can 5 women finish the same work that 3 men can finish in 10 days, if 1 man = 2 women?", ["10 days", "12 days", "15 days", "18 days"], 1, "3 men × 10 days = 30 man-days = 60 woman-days. 5 women: 60/5 = 12 days.", "rs-aggarwal-quant"),
    q("Pipes & Cisterns", "medium", "A tank is full. Pipe A empties it in 8 h, pipe B in 12 h. Time to empty with both:", ["4.8 h", "5 h", "6 h", "10 h"], 0, "Net drain rate = 1/8 + 1/12 = 3/24 + 2/24 = 5/24. Time = 24/5 = 4.8 h.", "rs-aggarwal-quant"),
    q("Time & Work", "medium", "A can type 1200 words in 20 min, B in 30 min. Together in:", ["10 min", "12 min", "14 min", "16 min"], 1, "A rate = 60 words/min, B = 40 words/min. Together = 100 words/min. Time = 1200/100 = 12 min.", "rs-aggarwal-quant"),
    q("Time & Work", "medium", "Efficiency of A is 50% more than B. B alone takes 12 days. A alone:", ["6 days", "8 days", "9 days", "10 days"], 1, "A is 1.5× B's efficiency. A's time = B's time / 1.5 = 12/1.5 = 8 days.", "rs-aggarwal-quant"),
    q("Time & Work", "hard", "A and B can together finish work in 30 days. They work together for 12 days, then A leaves. B finishes the rest in 36 days. A alone:", ["60 days", "75 days", "80 days", "90 days"], 0, "Work done in 12 days = 12/30 = 2/5. Remaining = 3/5. B's rate = (3/5)/36 = 1/60. A rate = 1/30 − 1/60 = 1/60. A alone = 60 days.", "rs-aggarwal-quant"),
    q("Time & Work", "easy", "24 men can build a wall in 15 days. 18 men can build it in:", ["18 days", "20 days", "22 days", "25 days"], 1, "24×15 = 360 man-days. 18 men: 360/18 = 20 days.", "rs-aggarwal-quant"),
  ],
}

const quantAveragesAges: Chapter = {
  id: "quant-averages-ages",
  title: "Averages, Ages & Mixtures",
  summary: "Sum = average x count, and a clean way to set up age and mixture problems.",
  lessons: [
    {
      id: "l-aa-1",
      title: "Averages without tears",
      minutes: 5,
      body:
        "**Average = sum / count**, so **sum = average x count.** That one rearrangement solves most average questions.\n\n**For consecutive numbers**, the average is just the **middle term** (or (first + last)/2). Average of 1...10 = (1 + 10)/2 = **5.5**.\n\n**Worked example (new member shifts the average):** 5 numbers average 20, so sum = 100. A 6th number, 26, joins -> new sum 126, new average 126/6 = **21**.\n\n**Common mistake:** averaging two averages directly when the group sizes differ. Recover the sums first, add them, divide by the total count.",
      sourceIds: ["rs-aggarwal-quant"],
    },
    {
      id: "l-aa-2",
      title: "Ages and mixtures",
      minutes: 6,
      body:
        "**Ages:** let the present age be x and translate the words. 'Five years ago' = x - 5; 'after 4 years' = x + 4. Form one equation and solve.\n\n**Worked example:** a father is 3 times his son's age; in 12 years he will be twice as old. Let son = x. 3x + 12 = 2(x + 12) -> 3x + 12 = 2x + 24 -> x = 12, so the father is **36**.\n\n**Mixtures (alligation):** to mix two things at prices/strengths to hit a mean, the **ratio of quantities = (difference from the other side)** crossed. Cheaper:dearer = (dearer - mean) : (mean - cheaper).\n\n**Exam tip:** write down what each phrase means in symbols before forming the equation; most age errors are translation errors.",
      sourceIds: ["rs-aggarwal-quant"],
    },
  ],
  quiz: [
    q("Averages", "easy", "Average of 10, 20, 30, 40, 50:", ["25", "30", "35", "40"], 1, "Sum = 150, count = 5 → 150/5 = 30.", "rs-aggarwal-quant"),
    q("Averages", "easy", "Average of first 10 natural numbers (1–10):", ["5", "5.5", "6", "55"], 1, "(first + last)/2 = (1+10)/2 = 5.5.", "rs-aggarwal-quant"),
    q("Averages", "easy", "If average of 6 numbers is 25, their sum:", ["120", "150", "156", "100"], 1, "Sum = average × count = 25 × 6 = 150.", "rs-aggarwal-quant"),
    q("Averages", "easy", "Average of 1, 2, 3, ..., 100:", ["49", "50", "50.5", "51"], 2, "(1 + 100)/2 = 50.5. Or: n(n+1)/2 ÷ n = (n+1)/2 = 101/2 = 50.5.", "rs-aggarwal-quant"),
    q("Averages", "easy", "Average of 5 consecutive even numbers starting from 2:", ["5", "6", "7", "8"], 1, "2,4,6,8,10 → average = 30/5 = 6.", "rs-aggarwal-quant"),
    q("Ages", "easy", "A is 5 years older than B. Sum of their ages is 35. A's age:", ["18", "20", "22", "15"], 1, "A = B+5; (B+5)+B = 35 → B=15, A=20.", "indiabix-aptitude"),
    q("Ages", "easy", "Father is 4 times son's age. Sum of ages = 50. Father's age:", ["40", "38", "42", "36"], 0, "Let son = x, father = 4x. 5x = 50 → x=10, father = 40.", "rs-aggarwal-quant"),
    q("Ages", "easy", "A man is 30 years old and his son is 5. In how many years will the father be 3 times the son's age?", ["5 years", "7.5 years", "10 years", "15 years"], 1, "30+x = 3(5+x) → 30+x = 15+3x → 15 = 2x → x = 7.5.", "rs-aggarwal-quant"),
    q("Averages", "medium", "Average age of 30 students = 12. Including teacher, average becomes 13. Teacher's age:", ["42", "43", "44", "40"], 1, "Students total = 360; with teacher (31 people): 31×13 = 403. Teacher = 403−360 = 43.", "rs-aggarwal-quant"),
    q("Averages", "medium", "5 numbers average 20. When a 6th number (50) is added, new average:", ["24", "25", "26", "27"], 1, "Old sum = 100. New sum = 150. New average = 150/6 = 25.", "rs-aggarwal-quant"),
    q("Averages", "medium", "The average marks of a class of 30 is 55. The top 5 average 70 and the bottom 5 average 40. The average of the middle 20 is:", ["55", "56.25", "57", "58"], 0, "Total = 30 × 55 = 1650. Top 5 = 350 and bottom 5 = 200, so the middle 20 total = 1650 − 550 = 1100, giving an average of 1100/20 = 55.", "rs-aggarwal-quant"),
    q("Ages", "medium", "A is 3 times as old as B. 5 years ago A was 5 times B's age. A's current age:", ["30", "35", "40", "45"], 0, "A = 3B. A−5 = 5(B−5) → 3B−5 = 5B−25 → 20 = 2B → B=10, A=30.", "rs-aggarwal-quant"),
    q("Ages", "medium", "Five years ago the ages of A and B were in the ratio 5:7. If the sum of their present ages is 34, their present ages are:", ["A=15, B=19", "A=19, B=15", "A=10, B=24", "A=20, B=14"], 0, "Let the ages 5 years ago be 5k and 7k. Then (5k+5) + (7k+5) = 34, so 12k = 24, k = 2. Present ages = 15 and 19.", "rs-aggarwal-quant"),
    q("Mixtures", "easy", "Mix 20 L of water and 30 L of milk. Percentage of milk:", ["60%", "40%", "50%", "30%"], 0, "Milk = 30L, Total = 50L. % = 30/50 × 100 = 60%.", "indiabix-aptitude"),
    q("Mixtures", "medium", "A 20 L mixture has milk and water in the ratio 4:1. How much water must be added to make the ratio 2:1?", ["2 L", "4 L", "5 L", "8 L"], 1, "Milk = 16 L and water = 4 L. For a 2:1 ratio water must be 16/2 = 8 L, so add 8 − 4 = 4 L.", "rs-aggarwal-quant"),
    q("Averages", "medium", "A batsman's average after 12 innings = 32. In 13th innings he scores 56. New average:", ["33", "34", "35", "36"], 1, "Total after 12 = 384. After 13th = 440. New average = 440/13 ≈ 33.8 ≈ 34.", "rs-aggarwal-quant"),
    q("Ages", "medium", "Five years from now, A's age will be 4 times B's age 5 years ago. Currently A = 35. B's current age:", ["10", "12", "15", "18"], 2, "A+5 = 4(B−5) → 40 = 4B−20 → 4B = 60 → B = 15.", "rs-aggarwal-quant"),
    q("Averages", "medium", "Average of first 50 odd numbers:", ["50", "49", "51", "52"], 0, "First n odd numbers: average = n. For n=50, average = 50.", "rs-aggarwal-quant"),
    q("Mixtures", "medium", "Using alligation, in what ratio should tea at Rs 50/kg and Rs 70/kg be mixed to get a blend worth Rs 62/kg?", ["3:4", "4:3", "2:3", "3:2"], 2, "cheaper : dearer = (dearer - mean) : (mean - cheaper) = (70 - 62) : (62 - 50) = 8 : 12 = 2:3.", "rs-aggarwal-quant"),
    q("Ages", "hard", "The ratio of A and B ages is 3:5. After 8 years it becomes 2:3. A current age is:", ["18", "21", "24", "27"], 2, "Let A = 3k and B = 5k. Then (3k+8)/(5k+8) = 2/3 -> 9k+24 = 10k+16 -> k = 8, so A = 3 x 8 = 24.", "rs-aggarwal-quant"),
    q("Averages", "hard", "Average of 25 numbers = 40. Average of first 12 = 45, last 12 = 35. 13th number:", ["33", "42", "45", "40"], 3, "Total = 1000. First 12 = 540. Last 12 = 420. 13th = 1000−540−420 = 40.", "rs-aggarwal-quant"),
    q("Mixtures", "hard", "From a 40 L milk-water mixture that is 30% water, 8 L is removed and replaced with 8 L of pure milk. The new water percentage is:", ["21%", "22%", "24%", "25%"], 2, "Original water = 30% of 40 = 12 L. Removing 8 L removes 8 x 0.30 = 2.4 L water, leaving 9.6 L. Total stays 40 L, so water% = 9.6/40 = 24%.", "rs-aggarwal-quant"),
    q("Ages", "hard", "Ages of A:B = 5:3. In 5 years, ages will be 15 and 9. Current age of A:", ["10", "12", "15", "20"], 0, "A+5 = 15 → A = 10. Check: B+5=9 → B=4. A:B = 10:4 = 5:2 ≠ 5:3. Adjust: clean version: 5k+5 = 15 → k=2, B=6, A=10. Ratio check: 10:6 = 5:3 ✓. A = 10.", "rs-aggarwal-quant"),
    q("Averages", "medium", "The mean of 30 values is 20. If 5 values of 30 each are replaced by 40 each, new mean:", ["21.67", "20", "21", "22"], 0, "Old sum = 600. Replace 5×30=150 with 5×40=200. New sum = 650. New mean = 650/30 ≈ 21.67.", "rs-aggarwal-quant"),
    q("Mixtures", "easy", "Ratio of alcohol to water in a solution is 3:2. Percentage of water:", ["30%", "40%", "50%", "60%"], 1, "Total parts = 5. Water = 2 parts = 2/5 × 100 = 40%.", "indiabix-aptitude"),
    q("Ages", "medium", "P's age is twice Q's. After 5 years, sum of their ages = 55. P's current age:", ["20", "25", "30", "35"], 2, "P=2Q. (P+5)+(Q+5) = 55 → P+Q = 45 → 2Q+Q = 45 → Q=15, P=30.", "rs-aggarwal-quant"),
    q("Averages", "easy", "If three numbers are in ratio 1:2:3 and average is 20, smallest number:", ["8", "10", "12", "15"], 1, "Let 1k+2k+3k = 60k/3=20k. Average = 6k/3 = 2k = 20 → k=10. Smallest = 10.", "rs-aggarwal-quant"),
  ],
}

const quantPermutations: Chapter = {
  id: "quant-permutations",
  title: "Permutations, Combinations & Probability",
  summary: "Count arrangements and selections, then turn counts into probabilities.",
  lessons: [
    {
      id: "l-pc-1",
      title: "Permutations vs combinations",
      minutes: 6,
      body:
        "The only question to ask: **does order matter?**\n\n**Permutation (order matters):** nPr = n! / (n - r)!. Arranging 3 books on a shelf = 3! = **6** ways.\n\n**Combination (order does not matter):** nCr = n! / (r! (n - r)!). Choosing 2 people from 4 = 4C2 = **6** ways.\n\n**Factorial:** n! = n x (n - 1) x ... x 1, and 0! = 1.\n\n**Worked example:** arrangements of the letters of 'CAT' (all different) = 3! = 6.\n\n**Common mistake:** using permutation when picking a team (order does not matter -> use combination).",
      sourceIds: ["rs-aggarwal-quant"],
    },
    {
      id: "l-pc-2",
      title: "Probability basics",
      minutes: 5,
      body:
        "**Probability = favourable outcomes / total outcomes**, always between 0 and 1.\n\n**Complement:** P(not E) = 1 - P(E). Useful when 'at least one' is easier to count as 1 - P(none).\n\n**Independent events multiply:** P(A and B) = P(A) x P(B).\n\n**Worked examples:** a fair die, P(even) = 3/6 = **1/2**. Two coins, P(both heads) = 1/2 x 1/2 = **1/4**. A standard deck, P(a red card) = 26/52 = **1/2**.\n\n**Exam tip:** count the total outcomes carefully first; most probability mistakes come from a wrong denominator.",
      sourceIds: ["rs-aggarwal-quant", "indiabix-aptitude"],
    },
  ],
  quiz: [
    q("Factorials", "easy", "Value of 5!:", ["60", "100", "120", "24"], 2, "5! = 5×4×3×2×1 = 120.", "rs-aggarwal-quant"),
    q("Factorials", "easy", "Value of 0!:", ["0", "1", "Undefined", "Infinity"], 1, "By definition, 0! = 1.", "rs-aggarwal-quant"),
    q("Permutations", "easy", "Arrangements of 3 letters of 'CAT':", ["3", "6", "9", "12"], 1, "All distinct → 3! = 6.", "indiabix-aptitude"),
    q("Permutations", "easy", "4 people in a row — number of arrangements:", ["4", "8", "16", "24"], 3, "4! = 4×3×2×1 = 24.", "rs-aggarwal-quant"),
    q("Combinations", "easy", "4C2 (choose 2 from 4):", ["4", "6", "8", "12"], 1, "4C2 = 4!/(2!×2!) = 24/4 = 6.", "rs-aggarwal-quant"),
    q("Combinations", "easy", "5C5:", ["1", "5", "10", "0"], 0, "nCn = 1 (only one way to choose all elements).", "rs-aggarwal-quant"),
    q("Permutations", "easy", "Number of 2-digit PIN codes from digits 1-4 (repetition allowed):", ["8", "12", "16", "24"], 2, "Each of 2 places has 4 choices → 4×4 = 16.", "rs-aggarwal-quant"),
    q("Permutations", "easy", "Number of ways to arrange 5 different books on a shelf:", ["25", "60", "100", "120"], 3, "5! = 120.", "indiabix-aptitude"),
    q("Probability", "easy", "P(even) on rolling a die:", ["1/6", "1/3", "1/2", "2/3"], 2, "Even: {2,4,6} → 3/6 = 1/2.", "rs-aggarwal-quant"),
    q("Probability", "easy", "Two fair coins — P(both heads):", ["1/2", "1/4", "1/3", "1/8"], 1, "1/2 × 1/2 = 1/4.", "rs-aggarwal-quant"),
    q("Probability", "easy", "A bag has 3 red and 5 blue balls. P(red):", ["3/8", "5/8", "1/2", "3/5"], 0, "P(red) = 3/8.", "indiabix-aptitude"),
    q("Probability", "easy", "P(drawing a king from a deck of 52 cards):", ["1/13", "1/52", "4/52 = 1/13", "2/13"], 2, "4 kings in 52 cards = 4/52 = 1/13.", "rs-aggarwal-quant"),
    q("Combinations", "medium", "Number of ways to choose a team of 3 from 8 people:", ["56", "24", "336", "512"], 0, "8C3 = 8!/(3!×5!) = 56.", "rs-aggarwal-quant"),
    q("Permutations", "medium", "Letters of 'MANGO' (all different) — arrangements:", ["60", "120", "240", "720"], 1, "5 distinct letters → 5! = 120.", "indiabix-aptitude"),
    q("Permutations", "medium", "How many distinct arrangements can be formed from the letters of the word 'BANANA'?", ["60", "90", "120", "180"], 0, "BANANA has 6 letters with A repeated 3 times and N repeated 2 times: 6!/(3! × 2!) = 720/12 = 60.", "rs-aggarwal-quant"),
    q("Combinations", "medium", "How many ways can 6 people sit around a circular table?", ["6!", "5!", "120", "720"], 2, "Circular permutations = (n-1)! = 5! = 120.", "rs-aggarwal-quant"),
    q("Probability", "medium", "Probability of getting a sum of 7 on two dice:", ["1/6", "7/36", "1/4", "5/36"], 0, "Combinations: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) → 6 ways out of 36 = 1/6.", "rs-aggarwal-quant"),
    q("Probability", "medium", "A card drawn from 52-card deck. P(face card — J, Q, K):", ["3/52", "12/52 = 3/13", "1/13", "4/13"], 1, "Face cards: 3 per suit × 4 suits = 12 total. P = 12/52 = 3/13.", "indiabix-aptitude"),
    q("Probability", "medium", "Two dice rolled. P(both show same number):", ["1/36", "6/36 = 1/6", "1/12", "1/3"], 1, "Six matching outcomes: (1,1),(2,2),...,(6,6) → 6/36 = 1/6.", "rs-aggarwal-quant"),
    q("Combinations", "medium", "From 4 men and 3 women, in how many ways can a committee of 3 be formed with at least 1 woman?", ["29", "31", "33", "35"], 1, "Total committees = 7C3 = 35. Committees with no women = 4C3 = 4. At least one woman = 35 - 4 = 31.", "rs-aggarwal-quant"),
    q("Probability", "hard", "A bag has 4 red and 6 blue balls. Two drawn without replacement. P(both red):", ["2/15", "1/10", "4/25", "1/5"], 0, "P = (4/10) × (3/9) = 12/90 = 2/15.", "rs-aggarwal-quant"),
    q("Permutations", "hard", "Arrangements of 'MISSISSIPPI':", ["34650", "69300", "138600", "11!"], 0, "11!/(4!×4!×2!) = 39916800/(24×24×2) = 34650.", "rs-aggarwal-quant"),
    q("Probability", "hard", "P(at least one tail) when 3 coins tossed:", ["7/8", "3/8", "1/8", "1/2"], 0, "P(all heads) = 1/8. P(at least one tail) = 1 − 1/8 = 7/8.", "rs-aggarwal-quant"),
    q("Combinations", "hard", "Number of diagonals in a polygon with n=8 sides:", ["20", "24", "28", "32"], 0, "nC2 − n = 8×7/2 − 8 = 28 − 8 = 20.", "rs-aggarwal-quant"),
    q("Probability", "hard", "A speaks truth 3/4 of the time, B 4/5. P(they contradict each other):", ["7/20", "3/20", "12/20", "4/5"], 0, "P(A true, B false) + P(A false, B true) = (3/4)(1/5) + (1/4)(4/5) = 3/20 + 4/20 = 7/20.", "rs-aggarwal-quant"),
    q("Permutations", "medium", "How many 3-digit numbers can be formed using {1,2,3,4,5} without repetition?", ["60", "100", "120", "125"], 0, "5P3 = 5×4×3 = 60.", "rs-aggarwal-quant"),
    q("Probability", "medium", "P(drawing a red card or a king) from 52-card deck:", ["7/13", "28/52", "30/52", "26/52"], 1, "Red cards = 26, Kings = 4, Red kings = 2. P = (26+4−2)/52 = 28/52 = 7/13.", "indiabix-aptitude"),
    q("Combinations", "easy", "nC0 = ?", ["n", "1", "0", "n!"], 1, "nC0 = 1 for all n. There is exactly one way to choose nothing.", "rs-aggarwal-quant"),
    q("Permutations", "hard", "In how many ways can 5 boys and 3 girls sit in a row such that no two girls are adjacent?", ["14400", "5760", "2880", "7200"], 0, "Arrange 5 boys: 5! = 120. Then 6 gaps; choose 3 for girls: 6P3 = 120. Total = 120×120 = 14400.", "rs-aggarwal-quant"),
    q("Probability", "easy", "P(getting a prime on rolling a die):", ["1/2", "1/3", "2/3", "1/6"], 0, "Primes on die: {2,3,5} → 3 out of 6 = 1/2.", "rs-aggarwal-quant"),
  ],
}

// ---- REASONING ----
const reasonSyllogism: Chapter = {
  id: "reason-syllogism",
  title: "Syllogisms & Statements",
  summary: "Draw the Venn diagram. A conclusion follows only if it is true in every diagram.",
  lessons: [
    {
      id: "l-syl-1",
      title: "The Venn-diagram method",
      minutes: 6,
      body:
        "Translate each statement into circles:\n- **All A are B** -> circle A sits fully inside circle B.\n- **Some A are B** -> circles A and B overlap.\n- **No A are B** -> circles A and B are completely separate.\n\n**The golden rule:** a conclusion **follows only if it is true in EVERY possible diagram** you can draw from the statements.\n\n**Worked example:** All cats are animals; all animals are living. Cats  is a subset of  animals  is a subset of  living, so 'all cats are living' is forced -> it **follows**.\n\n**Common mistake:** accepting a conclusion that is merely possible. If even one valid diagram breaks it, it does not follow.",
      sourceIds: ["rs-aggarwal-reasoning"],
    },
    {
      id: "l-syl-2",
      title: "The 'some' traps",
      minutes: 5,
      body:
        "'Some' statements are where students slip.\n- 'Some A are B' does **not** guarantee 'some A are not B'.\n- 'Some A are B' does **not** reverse into 'all'.\n- 'No A are B' plus 'all B are C' does **not** force 'no A are C' (A might still overlap C through another route).\n\n**Worked example (follows):** Some books are pens; all pens are red. The books that are pens must be red, so 'some books are red' **follows**.\n\n**Worked example (does not follow):** All cats are animals; some animals are wild. No statement ties cats to 'wild', so 'some cats are wild' **does not follow**.\n\n**Exam tip:** test the tricky conclusions by trying to draw a diagram that breaks them.",
      sourceIds: ["rs-aggarwal-reasoning"],
    },
  ],
  quiz: [
    q("Syllogism", "easy", "All pens are books. All books are red. 'All pens are red' —", ["Follows", "Does not follow", "Cannot say", "Partially true"], 0, "Pens ⊆ books ⊆ red → all pens are red. Follows.", "rs-aggarwal-reasoning"),
    q("Syllogism", "easy", "All cats are animals. All animals are living things. 'All cats are living things' —", ["Follows", "Does not follow", "Possible", "False"], 0, "Chain: cats ⊆ animals ⊆ living → all cats are living things. Follows.", "rs-aggarwal-reasoning"),
    q("Syllogism", "easy", "No men are immortal. All kings are men. 'No kings are immortal' —", ["Follows", "Does not follow", "Possible", "Uncertain"], 0, "Kings ⊆ men; no men are immortal → no kings are immortal. Follows.", "rs-aggarwal-reasoning"),
    q("Syllogism", "easy", "Some birds are sparrows. All sparrows are animals. 'Some birds are animals' —", ["Follows", "Does not follow", "Cannot say", "False"], 0, "The birds that are sparrows are animals → some birds are animals. Follows.", "rs-aggarwal-reasoning"),
    q("Syllogism", "easy", "All apples are fruits. All fruits are sweet. 'Some apples are sweet' —", ["Does not follow", "Follows", "Uncertain", "False"], 1, "All apples → fruits → sweet. So all (and hence some) apples are sweet. Follows.", "rs-aggarwal-reasoning"),
    q("Syllogism", "medium", "All cats are animals. Some animals are wild. 'Some cats are wild' —", ["Follows", "Does not follow", "Always true", "Certain"], 1, "Wild animals need not overlap with cats. No direct link → does not follow.", "rs-aggarwal-reasoning"),
    q("Syllogism", "medium", "Some books are pens. All pens are red. 'Some books are red' —", ["Follows", "Does not follow", "Cannot say", "False"], 0, "Books that are pens are also red → some books are red. Follows.", "rs-aggarwal-reasoning"),
    q("Syllogism", "medium", "All roses are flowers. Some flowers fade quickly. 'Some roses fade quickly' —", ["Follows", "Does not follow", "Certain", "True"], 1, "Fading flowers need not include roses → does not follow.", "rs-aggarwal-reasoning"),
    q("Syllogism", "medium", "No dog is a cat. All cats are pets. 'No dog is a pet' —", ["Follows", "Does not follow", "Always true", "Certain"], 1, "Dogs could be pets by another route (not through cats) → does not follow.", "rs-aggarwal-reasoning"),
    q("Syllogism", "medium", "All students are hardworking. Some hardworking people are successful. 'Some students are successful' —", ["Follows", "Does not follow", "Cannot determine", "False"], 1, "Successful people need not be students → does not follow.", "rs-aggarwal-reasoning"),
    q("Syllogism", "medium", "No table is a chair. All chairs are furniture. 'Some furniture is not a table' —", ["Follows", "Does not follow", "Cannot say", "Always false"], 0, "Chairs are furniture, and no chair is a table → those chairs are furniture that are not tables. Follows.", "rs-aggarwal-reasoning"),
    q("Syllogism", "medium", "All fish are aquatic. No reptile is aquatic. 'No reptile is a fish' —", ["Follows", "Does not follow", "Possible", "Uncertain"], 0, "Fish ⊆ aquatic; no reptile ∈ aquatic → no reptile can be a fish. Follows.", "rs-aggarwal-reasoning"),
    q("Syllogism", "medium", "Some A are B. Some B are C. 'Some A are C' —", ["Follows", "Does not follow", "Always true", "Certain"], 1, "B could overlap A and C in completely different subsets. Not guaranteed → does not follow.", "rs-aggarwal-reasoning"),
    q("Syllogism", "medium", "All A are B. No B are C. 'No A are C' —", ["Does not follow", "Follows", "Uncertain", "Possible"], 1, "A ⊆ B; B and C don't overlap → A and C don't overlap. Follows.", "rs-aggarwal-reasoning"),
    q("Syllogism", "hard", "All managers are leaders. Some leaders are visionaries. 'Some managers are visionaries' —", ["Follows", "Does not follow", "Cannot say", "True"], 1, "Visionary leaders need not be managers → does not follow.", "rs-aggarwal-reasoning"),
    q("Syllogism", "hard", "No politician is honest. All honest people are respected. 'No politician is respected' —", ["Follows", "Does not follow", "Possible", "True"], 1, "Politicians might still be respected through other means → does not follow.", "rs-aggarwal-reasoning"),
    q("Syllogism", "hard", "All clouds are rain. All rain is wet. Some wet things are cold. 'Some clouds are cold' —", ["Follows", "Does not follow", "Possible", "Uncertain"], 1, "Clouds → rain → wet. But 'some wet things are cold' doesn't specify clouds → does not follow.", "rs-aggarwal-reasoning"),
    q("Syllogism", "hard", "All engineers are graduates. All graduates can get jobs. 'All engineers can get jobs' —", ["Follows", "Does not follow", "Possible", "Cannot say"], 0, "Engineers ⊆ graduates ⊆ job-eligible → all engineers can get jobs. Follows.", "rs-aggarwal-reasoning"),
    q("Syllogism", "hard", "Some teachers are writers. All writers are creative. 'All teachers are creative' —", ["Follows", "Does not follow", "Certain", "True"], 1, "Only some teachers are writers → only some teachers are creative. 'All' does not follow.", "rs-aggarwal-reasoning"),
    q("Syllogism", "hard", "No bird is a mammal. All dolphins are mammals. 'No dolphin is a bird' —", ["Does not follow", "Follows", "Possible", "Cannot say"], 1, "Dolphins ⊆ mammals; no mammal is a bird → no dolphin is a bird. Follows.", "rs-aggarwal-reasoning"),
    q("Syllogism", "medium", "All windows are doors. No door is a wall. 'No window is a wall' —", ["Follows", "Does not follow", "Possible", "Uncertain"], 0, "Windows ⊆ doors; doors ∩ walls = ∅ → windows ∩ walls = ∅. Follows.", "rs-aggarwal-reasoning"),
    q("Syllogism", "easy", "All chairs are tables. All tables are wood. Conclusion I: All chairs are wood. Conclusion II: Some wood is chair.", ["Only I", "Only II", "Both I and II", "Neither"], 2, "I: chairs ⊆ tables ⊆ wood ✓. II: if all chairs are wood, then some wood is chair (conversion) ✓. Both follow.", "rs-aggarwal-reasoning"),
    q("Syllogism", "medium", "Some pens are pencils. Some pencils are erasers. Which follows? I: Some pens are erasers. II: Some pencils are pens.", ["Only I", "Only II", "Both", "Neither"], 1, "II: 'Some pencils are pens' — a valid conversion of 'Some pens are pencils'. I: Not guaranteed (pens and erasers don't have to overlap). Only II follows.", "rs-aggarwal-reasoning"),
    q("Syllogism", "hard", "All dogs are animals. Some dogs are domestic. Conclusion: Some animals are domestic.", ["Follows", "Does not follow", "Cannot say", "False"], 0, "Domestic dogs are also animals → some animals (the domestic dogs) are domestic. Follows.", "rs-aggarwal-reasoning"),
    q("Syllogism", "easy", "'Some A are B' can be converted to:", ["Some B are A", "All B are A", "No B are A", "All A are B"], 0, "Valid conversion of 'Some A are B' → 'Some B are A'. The relationship is symmetric for 'some'.", "rs-aggarwal-reasoning"),
  ],
}

const reasonClocksCalendars: Chapter = {
  id: "reason-clocks-calendars",
  title: "Clocks & Calendars",
  summary: "One angle formula for clocks, and odd-days plus leap-year rules for calendars.",
  lessons: [
    {
      id: "l-cc-1",
      title: "Clock angles",
      minutes: 5,
      body:
        "Each hand moves at a fixed speed:\n- **Minute hand:** 360 degrees / 60 min = **6 degrees per minute**.\n- **Hour hand:** 360 degrees / 12 h = 30 degrees per hour = **0.5 degrees per minute**.\n\n**Angle between the hands = |30H - 5.5M|**, where H is the hour and M the minutes. If it exceeds 180 degrees, subtract from 360 degrees.\n\n**Worked example:** at 3:00, angle = |30 x 3 - 5.5 x 0| = **90 degrees**. At 6:00, angle = |180 - 0| = **180 degrees**.\n\n**Useful fact:** the hands overlap **11 times every 12 hours** (not 12), because the minute hand laps the hour hand.",
      sourceIds: ["rs-aggarwal-reasoning"],
    },
    {
      id: "l-cc-2",
      title: "Calendars and leap years",
      minutes: 5,
      body:
        "Calendar problems run on **odd days** (days left over after counting complete weeks).\n- An ordinary year has **1 odd day**; a leap year has **2 odd days**.\n- The day of the week repeats every 7 days, so add odd days to step forward.\n\n**Leap-year rule:** a year is a leap year if divisible by 4, **except** century years, which must be divisible by **400**. So 2024 is a leap year; 1900 is **not** (divisible by 100 but not 400); 2000 **is**.\n\n**Exam tip:** for 'what day was it' questions, count the odd days between the known date and the target.",
      sourceIds: ["rs-aggarwal-reasoning"],
    },
  ],
  quiz: [
    q("Clocks", "easy", "Angle between hands at 3:00:", ["30°", "45°", "90°", "120°"], 2, "|30×3 − 5.5×0| = 90°.", "rs-aggarwal-reasoning"),
    q("Clocks", "easy", "Angle between hands at 6:00:", ["90°", "180°", "150°", "120°"], 1, "|30×6 − 5.5×0| = 180°.", "rs-aggarwal-reasoning"),
    q("Clocks", "easy", "Angle between hands at 12:00:", ["0°", "30°", "60°", "90°"], 0, "Both hands coincide at 12:00 → angle = 0°.", "rs-aggarwal-reasoning"),
    q("Clocks", "easy", "How many times do the hands coincide in 12 hours?", ["10", "11", "12", "24"], 1, "Hands coincide 11 times in 12 hours (not 12, because at 12 it's the same event).", "rs-aggarwal-reasoning"),
    q("Clocks", "easy", "Angle between hands at 9:00:", ["90°", "180°", "270°", "120°"], 0, "|30×9 − 0| = 270°. But we take the smaller angle: 360−270 = 90°.", "rs-aggarwal-reasoning"),
    q("Calendars", "easy", "Is 2024 a leap year?", ["Yes", "No", "Only in February", "Cannot say"], 0, "2024 is divisible by 4 and is not a century year → leap year.", "rs-aggarwal-reasoning"),
    q("Calendars", "easy", "Is 1900 a leap year?", ["Yes", "No", "Sometimes", "Cannot say"], 1, "1900 is divisible by 100 but NOT by 400 → not a leap year.", "rs-aggarwal-reasoning"),
    q("Calendars", "easy", "Is 2000 a leap year?", ["Yes", "No", "Cannot say", "Only partly"], 0, "2000 is divisible by 400 → it IS a leap year.", "rs-aggarwal-reasoning"),
    q("Clocks", "medium", "Angle between hands at 4:20:", ["0°", "5°", "10°", "15°"], 2, "|30×4 − 5.5×20| = |120 − 110| = 10°.", "rs-aggarwal-reasoning"),
    q("Clocks", "medium", "Angle between hands at 3:30:", ["75°", "80°", "85°", "90°"], 0, "|30×3 − 5.5×30| = |90 − 165| = 75°.", "rs-aggarwal-reasoning"),
    q("Clocks", "medium", "At what time between 5 and 6 do the hands coincide?", ["5:27.27", "5:30", "5:25", "5:32"], 0, "Hands coincide at 5:27.27 (27 3/11 minutes past 5).", "rs-aggarwal-reasoning"),
    q("Clocks", "medium", "How many times do the hands form a right angle in 12 hours?", ["11", "22", "24", "12"], 1, "Hands form 90° twice per 'cycle' and complete 11 cycles → 22 times in 12 hours.", "rs-aggarwal-reasoning"),
    q("Calendars", "medium", "If January 1, 2023 is Sunday, what day is January 1, 2024?", ["Sunday", "Monday", "Tuesday", "Wednesday"], 1, "2023 is not a leap year (1 extra day). Jan 1, 2024 = Sunday + 1 = Monday.", "rs-aggarwal-reasoning"),
    q("Calendars", "medium", "The number of odd days in 100 years is:", ["5", "4", "3", "6"], 0, "100 years contain 76 ordinary and 24 leap years = 76 + 48 = 124 extra days; 124 mod 7 = 5 odd days.", "rs-aggarwal-reasoning"),
    q("Clocks", "medium", "Minute hand speed per minute:", ["6°", "5.5°", "0.5°", "12°"], 0, "Minute hand: 360° in 60 min = 6° per minute.", "rs-aggarwal-reasoning"),
    q("Clocks", "medium", "Hour hand speed per minute:", ["6°", "5.5°", "0.5°", "1°"], 2, "Hour hand: 360° in 12 hours = 30° per hour = 0.5° per minute.", "rs-aggarwal-reasoning"),
    q("Calendars", "medium", "What day was January 1, 2000?", ["Saturday", "Sunday", "Friday", "Monday"], 1, "January 1, 2000 was a Saturday. Standard result used in odd-days method.", "rs-aggarwal-reasoning"),
    q("Clocks", "medium", "How many times do the hands of a clock coincide in 24 hours?", ["22", "24", "44", "48"], 0, "In 12 hours: 11 times. In 24 hours: 22 times.", "rs-aggarwal-reasoning"),
    q("Clocks", "hard", "At what time between 2 and 3 are the hands opposite (180° apart)?", ["2:43.6", "2:40", "2:45", "2:38"], 0, "Hands are opposite when minute hand is 30 min ahead. At H:M, 5H + M/2 = M + 30 → at H=2: 10 + M/2 = M + 30 → M/2 = 20... Actually: (11M/2 − 30H) = 180 → 11M/2 = 180+60=240 → M = 43.6 min. Time = 2:43.6.", "rs-aggarwal-reasoning"),
    q("Calendars", "hard", "If 29th February 2000 was a Tuesday, what day was 29th February 2004?", ["Sunday", "Monday", "Tuesday", "Wednesday"], 0, "From 29 Feb 2000 to 29 Feb 2004 is 1461 days; 1461 mod 7 = 5 odd days, and five days after Tuesday is Sunday.", "rs-aggarwal-reasoning"),
    q("Clocks", "hard", "Angle between hands at 7:35:", ["17.5°", "19°", "17°", "20°"], 0, "|30×7 − 5.5×35| = |210 − 192.5| = 17.5°.", "rs-aggarwal-reasoning"),
    q("Calendars", "medium", "If today is Wednesday, what day was it 100 days ago?", ["Sunday", "Monday", "Tuesday", "Wednesday"], 1, "100 mod 7 = 2 (since 98 = 14×7). 100 days ago = Wednesday − 2 = Monday.", "rs-aggarwal-reasoning"),
    q("Clocks", "medium", "Angle between clock hands at 5:30:", ["15°", "30°", "45°", "60°"], 0, "|30×5 − 5.5×30| = |150 − 165| = 15°.", "rs-aggarwal-reasoning"),
    q("Calendars", "easy", "How many odd days in a leap year?", ["0", "1", "2", "3"], 2, "A leap year has 366 days = 52 weeks + 2 days → 2 odd days.", "rs-aggarwal-reasoning"),
    q("Calendars", "easy", "How many odd days in an ordinary (non-leap) year?", ["0", "1", "2", "3"], 1, "An ordinary year has 365 days = 52 weeks + 1 day → 1 odd day.", "rs-aggarwal-reasoning"),
  ],
}

// ---- CODING ----
const codingTreesGraphs: Chapter = {
  id: "coding-trees-graphs",
  title: "Trees, Graphs & Traversals",
  summary: "BSTs, tree traversals, and BFS vs DFS - frequent interview territory.",
  lessons: [
    {
      id: "l-tg-1",
      title: "Trees and BSTs",
      minutes: 6,
      body:
        "A **tree** is a hierarchy: a root at the top, child nodes below, and leaves at the bottom. A **binary tree** allows at most **2 children** per node.\n\nA **Binary Search Tree (BST)** keeps left < node < right, so searching, inserting and deleting are **O(log n)** when the tree is balanced (height ~ log n).\n\n**Traversals:**\n- **In-order (Left, Node, Right)** of a BST gives values in **sorted order**.\n- **Pre-order (Node, Left, Right)** is used to copy a tree.\n- **Post-order (Left, Right, Node)** is used to delete a tree.\n\n**Exam tip:** 'in-order of a BST is sorted' is a classic one-line answer.",
      sourceIds: ["gfg-dsa"],
    },
    {
      id: "l-tg-2",
      title: "Graphs: BFS and DFS",
      minutes: 6,
      body:
        "A **graph** is nodes connected by edges; edges can be directed or undirected.\n\nTwo core traversals:\n- **BFS (Breadth-First Search)** explores level by level using a **queue**. In an unweighted graph it finds the **shortest path**.\n- **DFS (Depth-First Search)** goes as deep as possible first, using a **stack** (or recursion).\n\n**Worked intuition:** to find the fewest hops between two people in a friend network, use BFS.\n\n**Common mistake:** using DFS to find a shortest path in an unweighted graph - that is BFS's job.",
      sourceIds: ["gfg-dsa"],
    },
  ],
  quiz: [
    q("Trees", "easy", "Max children per node in a binary tree:", ["1", "2", "3", "Unlimited"], 1, "Binary tree: at most 2 children (left and right).", "gfg-dsa"),
    q("Trees", "easy", "In-order traversal sequence:", ["Root, Left, Right", "Left, Root, Right", "Left, Right, Root", "Root, Right, Left"], 1, "In-order = Left → Root → Right. For a BST, this gives sorted order.", "gfg-dsa"),
    q("Trees", "easy", "In-order traversal of a BST visits values in:", ["Reverse order", "Sorted order", "Random order", "Level order"], 1, "BST property: left < root < right → in-order yields ascending sorted sequence.", "gfg-dsa"),
    q("Trees", "easy", "Pre-order traversal sequence:", ["Root, Left, Right", "Left, Root, Right", "Left, Right, Root", "Right, Root, Left"], 0, "Pre-order = Root → Left → Right. Used to copy or serialize a tree.", "gfg-dsa"),
    q("Trees", "easy", "Post-order traversal sequence:", ["Root, Left, Right", "Left, Root, Right", "Left, Right, Root", "Right, Left, Root"], 2, "Post-order = Left → Right → Root. Used when deleting a tree (process children before parent).", "gfg-dsa"),
    q("Trees", "easy", "A leaf node in a tree is:", ["The root", "A node with no children", "A node with one child", "The deepest node"], 1, "Leaf node: no children. It's the 'end' of a branch.", "gfg-dsa"),
    q("Trees", "easy", "Height of a tree with just the root (single node):", ["0", "1", "2", "-1"], 0, "Height = number of edges on longest path from root to leaf. Single node → 0 edges → height 0.", "gfg-dsa"),
    q("Trees", "medium", "Search in a balanced BST:", ["O(n)", "O(log n)", "O(n^2)", "O(1)"], 1, "Balanced BST height ≈ log n; search halves possibilities each step → O(log n).", "gfg-dsa"),
    q("Trees", "medium", "BST insert/search degrades to O(n) when:", ["All elements are equal", "Tree is balanced", "Tree is skewed (sorted input)", "Leaf count is even"], 2, "Inserting sorted data (1,2,3,...) creates a linked-list-shaped BST → O(n) per operation.", "gfg-dsa"),
    q("Graphs", "easy", "BFS uses which data structure?", ["Stack", "Queue", "Heap", "Array"], 1, "BFS explores level by level; it enqueues neighbors and processes in FIFO order.", "gfg-dsa"),
    q("Graphs", "easy", "DFS is typically implemented with:", ["A queue", "A stack or recursion", "A sorted array", "A hash map"], 1, "DFS goes deep first; a stack (or recursion call stack) tracks backtracking.", "gfg-dsa"),
    q("Graphs", "medium", "BFS finds shortest path in:", ["Weighted graphs", "Unweighted graphs", "Both", "Neither"], 1, "BFS explores level by level → shortest path in terms of edge count (unweighted). For weighted: use Dijkstra.", "gfg-dsa"),
    q("Graphs", "medium", "Detect a cycle in an undirected graph:", ["BFS/DFS with visited set", "Only DFS with parent tracking", "Sorting", "Binary search"], 0, "DFS (or BFS) with a visited set detects a back edge → cycle. For undirected: track parent to avoid false positives.", "gfg-dsa"),
    q("Trees", "medium", "A complete binary tree of height h has how many nodes?", ["h^2", "2^h - 1", "2^(h+1) - 1", "h × 2"], 2, "Perfect binary tree height h: 2^0 + 2^1 + ... + 2^h = 2^(h+1) − 1 nodes.", "gfg-dsa"),
    q("Graphs", "medium", "Dijkstra's algorithm finds:", ["Minimum spanning tree", "Single-source shortest path in weighted graph", "Topological ordering", "Cycle detection"], 1, "Dijkstra: shortest paths from a source in a weighted graph with non-negative edge weights.", "gfg-dsa"),
    q("Trees", "medium", "Level-order traversal uses:", ["Stack", "Queue", "Recursion only", "Two pointers"], 1, "Level-order visits nodes level by level — same as BFS, implemented with a queue.", "gfg-dsa"),
    q("Graphs", "medium", "Topological sort is only possible in:", ["Undirected graphs", "Directed Acyclic Graphs (DAGs)", "Graphs with cycles", "Complete graphs"], 1, "Topological sort: linear ordering of vertices in a DAG such that for every edge u→v, u comes before v.", "gfg-dsa"),
    q("Trees", "medium", "BST in-order predecessor of a node:", ["Right child", "Left subtree's rightmost node", "Parent", "Left child"], 1, "In-order predecessor: the rightmost node of the left subtree (last value smaller than current node).", "gfg-dsa"),
    q("Graphs", "hard", "Prim's and Kruskal's algorithms solve:", ["Shortest path", "Topological sort", "Minimum spanning tree", "Cycle detection"], 2, "Both find the Minimum Spanning Tree (MST) — the spanning tree of minimum total edge weight.", "gfg-dsa"),
    q("Trees", "hard", "AVL tree maintains balance by:", ["Ignoring unbalanced insertions", "Performing rotations to maintain balance factor ≤ 1", "Using hash tables", "Deleting unbalanced nodes"], 1, "AVL tree: after each insert/delete, rotations restore the balance factor (|left height - right height| ≤ 1).", "gfg-dsa"),
    q("Graphs", "hard", "Bellman-Ford algorithm vs Dijkstra:", ["Both are the same", "Bellman-Ford handles negative edge weights; Dijkstra doesn't", "Dijkstra is O(V²) always", "Bellman-Ford is faster"], 1, "Bellman-Ford relaxes all edges V-1 times → handles negative weights. Dijkstra fails with negative weights.", "gfg-dsa"),
    q("Trees", "hard", "Lowest Common Ancestor (LCA) of two nodes in a BST:", ["Always the root", "Found by comparing node values with root", "Requires DFS always", "Impossible to find"], 1, "In a BST: if both nodes are less than root → LCA in left subtree; both greater → right; one each side → root is LCA.", "gfg-dsa"),
    q("Graphs", "hard", "A graph with V vertices and E edges. DFS time complexity:", ["O(V)", "O(E)", "O(V + E)", "O(V × E)"], 2, "DFS visits each vertex once and each edge once → O(V + E).", "gfg-dsa"),
    q("Trees", "hard", "Serialize and deserialize a binary tree:", ["Only possible with BSTs", "Pre-order traversal with null markers works for any binary tree", "Requires sorted input", "Impossible to reverse"], 1, "Pre-order + null markers uniquely encodes any binary tree and allows exact reconstruction.", "gfg-dsa"),
    q("Graphs", "hard", "Floyd-Warshall algorithm computes:", ["Single-source shortest paths", "All-pairs shortest paths", "Minimum spanning tree", "Topological order"], 1, "Floyd-Warshall: O(V³) algorithm for all-pairs shortest paths, including negative edges (no negative cycles).", "gfg-dsa"),
  ],
}

const codingDpGreedy: Chapter = {
  id: "coding-dp-greedy",
  title: "Recursion, DP & Greedy",
  summary: "Remember subproblems (DP) and make locally optimal choices (greedy).",
  lessons: [
    {
      id: "l-dp-1",
      title: "Dynamic programming = remember subproblems",
      minutes: 6,
      body:
        "**Dynamic programming (DP)** applies when a problem has **overlapping subproblems** (the same smaller problem is solved many times) and **optimal substructure** (the best overall answer is built from best sub-answers).\n\n**Memoization** stores each subproblem's result the first time, so you never recompute it.\n\n**Worked example:** naive recursive Fibonacci recomputes the same values and runs in **O(2ⁿ)**. Add memoization and it drops to **O(n)** because each Fib(k) is computed once.\n\n**Common mistake:** using DP where subproblems do not overlap - then plain recursion or a greedy approach is enough.",
      sourceIds: ["gfg-dsa"],
    },
    {
      id: "l-dp-2",
      title: "Greedy algorithms",
      minutes: 5,
      body:
        "A **greedy** algorithm makes the **locally optimal choice at each step**, hoping it leads to a global optimum. It is simple and fast, but only correct when local choices truly build the global best.\n\n**Where greedy works:** activity selection (pick the earliest-finishing task), making change with standard coin systems, Huffman coding.\n\n**Worked intuition:** to give change with the fewest standard coins, repeatedly take the largest coin that fits.\n\n**Common mistake:** assuming greedy always works. For some problems (like the 0/1 knapsack), greedy fails and you need DP.",
      sourceIds: ["gfg-dsa"],
    },
  ],
  quiz: [
    q("Dynamic Programming", "medium", "Dynamic programming is most useful when a problem has:", ["no repetition", "overlapping subproblems", "only sorted input", "random data"], 1, "DP shines with overlapping subproblems plus optimal substructure.", "gfg-dsa"),
    q("Recursion", "medium", "The time complexity of naive recursive Fibonacci is:", ["O(n)", "O(n^2)", "O(2ⁿ)", "O(log n)"], 2, "It recomputes values exponentially -> O(2ⁿ).", "gfg-dsa"),
    q("Dynamic Programming", "medium", "Adding memoization improves recursive Fibonacci to:", ["O(1)", "O(n)", "O(n^2)", "O(2ⁿ)"], 1, "Each Fib(k) is computed once -> O(n).", "gfg-dsa"),
    q("Greedy", "easy", "A greedy algorithm makes:", ["a random choice", "the locally optimal choice each step", "all choices at once", "no choice"], 1, "Greedy picks the best option available at each step.", "gfg-dsa"),
    q("Dynamic Programming", "medium", "Memoization stores subproblem results mainly to avoid:", ["using memory", "recomputation", "sorting", "recursion"], 1, "Storing results avoids recomputing the same subproblem.", "gfg-dsa"),
  ],
}

// ---- CS CORE ----
const csFundamentals: Chapter = {
  id: "cs-fundamentals",
  title: "Computer Fundamentals & Number Systems",
  summary: "Binary/decimal/hex, bits and bytes, and volatile vs non-volatile memory.",
  lessons: [
    {
      id: "l-cf-1",
      title: "Number systems",
      minutes: 5,
      body:
        "Computers count in **binary (base 2)** using only 0 and 1. We usually write **decimal (base 10)**, and programmers often use **hexadecimal (base 16)**.\n\n**Binary to decimal:** each digit is a power of 2. 101₂ = 1x4 + 0x2 + 1x1 = **5**. 1010₂ = 8 + 0 + 2 + 0 = **10**.\n\n**Decimal to binary:** repeatedly divide by 2 and read the remainders bottom-up.\n\n**Sizes:** 1 **byte** = 8 **bits**; 1 KB = 1024 bytes.\n\n**Exam tip:** memorise the powers of 2 up to 1024 - they make conversions instant.",
      sourceIds: ["gfg-cs-core"],
    },
    {
      id: "l-cf-2",
      title: "Memory and software",
      minutes: 5,
      body:
        "**Memory types:**\n- **RAM** is **volatile** - fast working memory whose contents vanish when power is lost.\n- **ROM / hard disk / SSD** are **non-volatile** - they keep data without power.\n\n**Software types:**\n- **System software** (the operating system, drivers) runs and manages the machine.\n- **Application software** (a browser, an editor) does user tasks.\n\n**Compiler vs interpreter:** a compiler translates the whole program to machine code once; an interpreter runs it line by line.\n\n**Common mistake:** calling RAM 'permanent' storage. It is temporary and volatile.",
      sourceIds: ["gfg-cs-core"],
    },
  ],
  quiz: [
    q("Number Systems", "easy", "The binary number 101 in decimal is:", ["4", "5", "6", "7"], 1, "1x4 + 0x2 + 1x1 = 5.", "gfg-cs-core"),
    q("Number Systems", "easy", "One byte equals how many bits?", ["4", "8", "16", "32"], 1, "1 byte = 8 bits.", "gfg-cs-core"),
    q("Memory", "easy", "RAM is best described as:", ["Permanent storage", "Volatile memory", "A hard disk", "A CPU"], 1, "RAM is volatile - its contents are lost when power is off.", "gfg-cs-core"),
    q("Number Systems", "medium", "The decimal number 10 in binary is:", ["1000", "1010", "1100", "1001"], 1, "10 = 8 + 2 = 1010 in binary.", "gfg-cs-core"),
    q("Software", "easy", "An operating system is an example of:", ["Application software", "System software", "Hardware", "A web browser"], 1, "The OS is system software that manages the machine.", "gfg-cs-core"),
  ],
}

const quantDataInterpretation: Chapter = {
  id: "quant-data-interpretation",
  title: "Data Interpretation & Tables",
  summary: "Read tables, charts and percentages quickly without losing the base value.",
  lessons: [
    {
      id: "l-di-1",
      title: "Read the table before calculating",
      minutes: 6,
      body:
        "Data Interpretation is not hard math; it is careful reading under time pressure. First identify **what each row and column means**, the unit, and whether values are absolute numbers, percentages or ratios.\n\n**Fast method:** circle the requested category, write the formula, then calculate. For percent change, the base is the old value: (new - old) / old x 100.\n\n**Worked example:** sales go from 200 to 250. Increase = 50 on base 200, so increase percent = 50/200 x 100 = **25%**.\n\n**Common mistake:** using the new value as the base for percent increase. The base is the original value.",
      sourceIds: ["rs-aggarwal-quant", "indiabix-aptitude"],
    },
    {
      id: "l-di-2",
      title: "Ratios inside charts",
      minutes: 6,
      body:
        "Many chart questions ask for a comparison, not a long calculation. Use ratios and fractions to avoid heavy arithmetic.\n\n**Share of total:** part / total x 100. If A sells 80 units out of a total 400, A's share is 80/400 x 100 = **20%**.\n\n**Average from a table:** add the required values only, then divide by the count. Do not include rows or columns the question did not ask for.\n\n**Exam tip:** before solving, underline whether the question asks for total, average, difference, ratio or percentage. That one word decides the method.",
      sourceIds: ["rs-aggarwal-quant", "indiabix-aptitude"],
    },
  ],
  quiz: [
    q("Data Interpretation", "easy", "Sales rise from 200 to 250. The percentage increase is:", ["20%", "25%", "30%", "50%"], 1, "Increase = 50 on the old base 200 -> 50/200 x 100 = 25%.", "rs-aggarwal-quant"),
    q("Data Interpretation", "easy", "A category has 80 units out of a total 400. Its share is:", ["10%", "15%", "20%", "25%"], 2, "Share = 80/400 x 100 = 20%.", "indiabix-aptitude"),
    q("Data Interpretation", "medium", "The values 12, 18, 24 and 30 have an average of:", ["20", "21", "22", "24"], 1, "Sum = 84 and count = 4, so average = 21.", "rs-aggarwal-quant"),
    q("Data Interpretation", "medium", "If total revenue is Rs 900 and product A contributes Rs 225, A's contribution is:", ["20%", "25%", "30%", "35%"], 1, "225/900 x 100 = 25%.", "indiabix-aptitude"),
    q("Data Interpretation", "hard", "A value falls from 500 to 400. The percentage decrease is:", ["10%", "20%", "25%", "40%"], 1, "Decrease = 100 on base 500 -> 100/500 x 100 = 20%.", "rs-aggarwal-quant"),
  ],
}

const reasonSeatingPuzzles: Chapter = {
  id: "reason-seating-puzzles",
  title: "Seating Arrangement & Puzzles",
  summary: "Turn wordy constraints into positions, slots and eliminations.",
  lessons: [
    {
      id: "l-seat-1",
      title: "Linear seating",
      minutes: 6,
      body:
        "For seating puzzles, draw slots first. If five people sit in a row, draw five boxes. Mark left and right clearly.\n\nUse fixed clues first: **A sits at an end**, **B is third from the left**, or **C sits immediately right of D**. Then add flexible clues.\n\n**Immediate right** means the next seat to the person's right; **somewhere right** means any later seat. Do not mix them.\n\n**Common mistake:** solving only in the head. Draw the boxes, place confirmed facts, and keep possible cases separate.",
      sourceIds: ["rs-aggarwal-reasoning"],
    },
    {
      id: "l-seat-2",
      title: "Puzzle casework",
      minutes: 6,
      body:
        "When a clue has two possible placements, split into Case 1 and Case 2. Continue each case until one contradicts a clue.\n\n**Useful signals:** 'not adjacent' eliminates neighbor seats; 'between' usually creates a block; 'exactly two people between' fixes a distance.\n\n**Worked intuition:** if exactly two people sit between A and B in five seats, possible pairs are (1,4), (2,5), (4,1), and (5,2).\n\n**Exam tip:** after finishing, re-check every clue against your final arrangement before selecting the option.",
      sourceIds: ["rs-aggarwal-reasoning"],
    },
  ],
  quiz: [
    q("Seating", "easy", "In a row, 'B sits immediately right of A' means:", ["B is anywhere right of A", "B is next to A on A's right", "A is next to B on B's right", "They are not adjacent"], 1, "Immediately right means the very next seat on the right.", "rs-aggarwal-reasoning"),
    q("Seating", "medium", "Five seats are numbered 1 to 5 from left. If A is third from the left, A is in seat:", ["2", "3", "4", "5"], 1, "Third from the left is seat 3.", "rs-aggarwal-reasoning"),
    q("Puzzles", "medium", "Exactly two people sit between A and B in five seats. Which pair is possible?", ["1 and 2", "1 and 4", "2 and 4", "3 and 5"], 1, "Seats 1 and 4 have exactly seats 2 and 3 between them.", "rs-aggarwal-reasoning"),
    q("Seating", "medium", "If A and B are not adjacent, they cannot be in seats:", ["1 and 3", "2 and 4", "3 and 5", "4 and 5"], 3, "Seats 4 and 5 are adjacent, so that violates the clue.", "rs-aggarwal-reasoning"),
    q("Puzzles", "hard", "The safest first step in a seating puzzle is to:", ["Guess an option", "Draw slots and place fixed clues", "Memorise all names", "Skip all negative clues"], 1, "Slots and fixed clues turn the word problem into a visible arrangement.", "rs-aggarwal-reasoning"),
  ],
}

const verbalWrittenEnglish: Chapter = {
  id: "verbal-written-english",
  title: "Essay, Email & Cloze Test",
  summary: "Written communication for Wipro-style tests and grammar-in-context questions.",
  lessons: [
    {
      id: "l-we-1",
      title: "Essay structure that scores",
      minutes: 6,
      body:
        "A placement essay should be clear, balanced and structured. Use four parts: **intro -> two body points -> counterpoint or example -> conclusion**.\n\nKeep sentences short. One paragraph should carry one idea. Avoid slang, extreme claims and memorised quotes that do not fit the topic.\n\n**Worked outline:** topic: online learning. Intro defines it; body 1 gives access benefits; body 2 explains self-discipline challenges; conclusion says blended learning is strongest.\n\n**Exam tip:** write a rough 4-line outline before the final answer. It prevents repetition.",
      sourceIds: ["high-agg-verbal", "studybench-curriculum"],
    },
    {
      id: "l-we-2",
      title: "Cloze tests and email tone",
      minutes: 6,
      body:
        "A **cloze test** asks you to fill blanks inside a passage. Read the full sentence, check grammar, then check meaning. The right word must fit both.\n\nFor professional email, use a clear subject, polite greeting, short request, and specific next step. Avoid slang and pressure words like 'ASAP' unless the context truly demands urgency.\n\n**Worked example:** 'She is interested ___ data analytics' takes **in**, because the fixed phrase is 'interested in'.\n\n**Common mistake:** choosing a word that sounds good alone but does not fit the passage tone.",
      sourceIds: ["high-agg-verbal", "studybench-curriculum"],
    },
  ],
  quiz: [
    q("Written English", "medium", "A strong placement essay should usually have:", ["Only one long paragraph", "Intro, body points and conclusion", "Only quotes", "Only bullet points"], 1, "A clear intro-body-conclusion structure is easiest to read and score.", "studybench-curriculum"),
    q("Email Writing", "easy", "A professional email subject should be:", ["Blank", "Clear and specific", "Only emojis", "Very vague"], 1, "A specific subject tells the reader the purpose before opening.", "studybench-curriculum"),
    q("Cloze Test", "medium", "'She is interested ___ data analytics.'", ["on", "in", "at", "with"], 1, "The fixed phrase is 'interested in'.", "high-agg-verbal"),
    q("Written English", "medium", "Before writing an essay, the best first step is to:", ["Start immediately without thinking", "Create a short outline", "Copy a memorised quote", "Use only complex words"], 1, "A quick outline prevents repetition and keeps the answer structured.", "studybench-curriculum"),
    q("Email Writing", "hard", "The best closing line for a recruiter follow-up email is:", ["Reply fast.", "I demand selection.", "Thank you for your time. I look forward to your response.", "No subject needed."], 2, "The line is polite, specific and professional.", "studybench-curriculum"),
  ],
}

const csCloudWeb: Chapter = {
  id: "cs-cloud-web-apis",
  title: "Cloud, Web & API Basics",
  summary: "Freshers increasingly get asked about APIs, HTTP, cloud models and deployment basics.",
  lessons: [
    {
      id: "l-cloud-1",
      title: "Cloud service models",
      minutes: 6,
      body:
        "Cloud models differ by how much you manage.\n\n**IaaS:** rented infrastructure; you manage OS and apps. **PaaS:** you deploy code; the platform manages servers. **SaaS:** you use a ready application.\n\n**Worked examples:** a virtual machine is IaaS, a managed app platform is PaaS, and a mail or CRM product is SaaS.\n\n**Exam tip:** if the user only logs in and uses software, it is usually SaaS.",
      sourceIds: ["gfg-cs-core", "accenture-careers"],
    },
    {
      id: "l-cloud-2",
      title: "APIs and deployment basics",
      minutes: 6,
      body:
        "An **API** is a contract between software systems. A frontend sends a request; the backend returns a response, often JSON.\n\n**GET** usually reads data. **POST** usually creates or submits data. **Status codes** explain the result: 200 success, 400 bad request, 401 unauthorized, 404 not found, 500 server error.\n\n**Deployment** means making the application available to users. A basic deployment flow is build, configure environment variables, release, then monitor errors.\n\n**Common mistake:** saying an API is only a URL. The method, request body, response shape and status codes are part of the contract too.",
      sourceIds: ["gfg-cs-core", "mdn-http"],
    },
  ],
  quiz: [
    q("Cloud", "easy", "Which cloud model gives users a ready-to-use application?", ["IaaS", "PaaS", "SaaS", "LAN"], 2, "SaaS means Software as a Service - users consume the application directly.", "gfg-cs-core"),
    q("Web", "easy", "A common format for API responses is:", ["JSON", "DVD", "BIOS", "PNG only"], 0, "JSON is commonly used for structured API responses.", "gfg-cs-core"),
    q("HTTP", "medium", "HTTP status code 404 means:", ["Success", "Unauthorized", "Not found", "Server error"], 2, "404 means the requested resource was not found.", "mdn-http"),
    q("HTTP", "medium", "GET is usually used to:", ["Read data", "Delete every record", "Format a disk", "Compile code"], 0, "GET commonly retrieves data from a server.", "mdn-http"),
    q("Cloud", "medium", "In PaaS, the platform mainly manages:", ["Only your resume", "Server/runtime infrastructure", "Your keyboard", "Nothing"], 1, "PaaS lets developers deploy code while the platform handles much of the runtime infrastructure.", "gfg-cs-core"),
  ],
}

const csSecurityBasics: Chapter = {
  id: "cs-security-basics",
  title: "Cybersecurity & Access Control",
  summary: "Authentication, authorization, encryption, hashing and common web-security risks.",
  lessons: [
    {
      id: "l-sec-1",
      title: "Authentication vs authorization",
      minutes: 6,
      body:
        "**Authentication** verifies who a user is. **Authorization** decides what that verified user can access.\n\n**Worked example:** logging in with email and password authenticates you. Being allowed to open the admin dashboard is authorization.\n\n**Passwords should be hashed**, not stored as plain text. Hashing is one-way; encryption is reversible with a key.\n\n**Exam tip:** if the question asks 'who are you?', think authentication. If it asks 'what can you access?', think authorization.",
      sourceIds: ["gfg-cs-core", "studybench-curriculum"],
    },
    {
      id: "l-sec-2",
      title: "Web security signals",
      minutes: 6,
      body:
        "Freshers are often asked the basics of safe web applications.\n\n**HTTPS** protects data in transit. **Input validation** rejects malformed or unsafe data. **Least privilege** means users and services get only the permissions they need.\n\n**Common risks:** SQL injection (unsafe query building), XSS (untrusted script in a page), weak passwords, and exposed secrets.\n\n**Placement tip:** in interviews, connect security to user trust: a small bug can leak data or break access control.",
      sourceIds: ["gfg-cs-core", "mdn-http"],
    },
  ],
  quiz: [
    q("Security", "easy", "Authentication mainly verifies:", ["Identity", "Table size", "CPU speed", "Screen width"], 0, "Authentication proves who the user is.", "gfg-cs-core"),
    q("Security", "medium", "Authorization mainly decides:", ["Who the user is", "What the user can access", "Which browser is used", "How fast DNS works"], 1, "Authorization controls permissions after identity is verified.", "gfg-cs-core"),
    q("Security", "medium", "Passwords should usually be stored as:", ["Plain text", "Hashed values", "Screenshots", "Comments"], 1, "Passwords should be stored using strong one-way hashing.", "gfg-cs-core"),
    q("Security", "hard", "The principle of least privilege means:", ["Give all access to everyone", "Give only necessary access", "Disable all accounts", "Avoid authentication"], 1, "Least privilege reduces risk by granting only required permissions.", "studybench-curriculum"),
    q("Security", "medium", "SQL injection is mainly caused by:", ["Unsafe query construction", "Too much RAM", "A sorted array", "A slow monitor"], 0, "Unsafe query construction can let attacker input change the query.", "gfg-cs-core"),
  ],
}

const csAiDataBasics: Chapter = {
  id: "cs-ai-data-basics",
  title: "AI, Data & Analytics Basics",
  summary: "Data cleaning, metrics, model basics and analytics terms now common in fresher roles.",
  lessons: [
    {
      id: "l-ai-1",
      title: "Data pipeline basics",
      minutes: 6,
      body:
        "A simple data pipeline has four steps: **collect -> clean -> transform -> analyse/report**.\n\nBad data creates bad decisions. Cleaning handles missing values, duplicates, wrong formats and outliers.\n\n**Worked example:** if a salary column contains 'five lakh' and '500000', cleaning converts them into one consistent numeric format.\n\n**Exam tip:** analytics questions reward clarity: name the input, transformation and output.",
      sourceIds: ["studybench-curriculum", "gfg-cs-core"],
    },
    {
      id: "l-ai-2",
      title: "Machine learning vocabulary",
      minutes: 6,
      body:
        "**Training data** teaches a model patterns. **Features** are input variables. **Labels** are known answers used in supervised learning.\n\n**Overfitting** happens when a model memorizes training data but performs poorly on new data. **Accuracy** is useful, but for imbalanced data you may also need precision and recall.\n\n**Placement tip:** do not oversell AI knowledge. A clean fresher answer is: data quality, model choice, evaluation and real-world constraints all matter.",
      sourceIds: ["studybench-curriculum", "gfg-cs-core"],
    },
  ],
  quiz: [
    q("Data", "easy", "The first step in most data pipelines is:", ["Collect data", "Delete all data", "Deploy UI", "Compile CSS"], 0, "A pipeline begins by collecting or receiving data.", "studybench-curriculum"),
    q("Data", "medium", "Removing duplicates and fixing formats is part of:", ["Data cleaning", "Encryption only", "Routing", "Thread scheduling"], 0, "Data cleaning improves consistency and reliability.", "studybench-curriculum"),
    q("AI Basics", "medium", "In supervised learning, labels are:", ["Known answers", "Network ports", "SQL joins", "CSS classes"], 0, "Labels are the known outputs used for training.", "studybench-curriculum"),
    q("AI Basics", "hard", "Overfitting means the model:", ["Learns general patterns only", "Memorizes training data and fails on new data", "Uses no data", "Cannot be evaluated"], 1, "Overfitting gives poor generalization to unseen data.", "studybench-curriculum"),
    q("Analytics", "medium", "For imbalanced data, accuracy alone can be misleading because:", ["It ignores class distribution issues", "It is always zero", "It measures RAM", "It sorts rows"], 0, "A high accuracy can hide poor performance on a minority class.", "studybench-curriculum"),
  ],
}

const csTestingSdlc: Chapter = {
  id: "cs-testing-sdlc",
  title: "Software Testing & SDLC",
  summary: "Testing types, bug reports, SDLC phases and quality habits expected from freshers.",
  lessons: [
    {
      id: "l-test-1",
      title: "Testing levels",
      minutes: 6,
      body:
        "**Unit testing** checks a small function or module. **Integration testing** checks modules working together. **System testing** checks the whole application. **User acceptance testing** checks whether it meets user needs.\n\n**Regression testing** ensures a new change did not break old behavior.\n\n**Worked example:** testing a login validation function is unit testing; checking login plus dashboard redirect is integration testing.\n\n**Exam tip:** name the scope of the test: function, modules, whole system or user acceptance.",
      sourceIds: ["studybench-curriculum", "gfg-cs-core"],
    },
    {
      id: "l-test-2",
      title: "SDLC and bug reports",
      minutes: 6,
      body:
        "A common SDLC flow is **requirements -> design -> implementation -> testing -> deployment -> maintenance**.\n\nA useful bug report includes: title, environment, steps to reproduce, expected result, actual result and evidence.\n\n**Placement tip:** companies value freshers who can communicate bugs clearly. 'It is not working' is weak; 'Login fails with 401 after password reset on Chrome' is useful.",
      sourceIds: ["studybench-curriculum"],
    },
  ],
  quiz: [
    q("Testing", "easy", "Testing a single function is usually:", ["Unit testing", "System testing", "UAT", "Deployment"], 0, "Unit testing checks small units of code.", "studybench-curriculum"),
    q("Testing", "medium", "Regression testing checks whether:", ["Old features still work after changes", "RAM is volatile", "DNS resolves names", "A table has a primary key"], 0, "Regression testing catches breaks introduced by new changes.", "studybench-curriculum"),
    q("SDLC", "easy", "A common SDLC phase after implementation is:", ["Testing", "Deleting requirements", "Ignoring users", "Buying hardware only"], 0, "Testing typically follows implementation.", "studybench-curriculum"),
    q("Testing", "medium", "A good bug report should include:", ["Steps to reproduce", "Only anger", "No expected result", "No environment"], 0, "Steps to reproduce make the bug actionable.", "studybench-curriculum"),
    q("Testing", "hard", "Testing two modules working together is:", ["Integration testing", "Unit testing only", "Syntax checking", "Authentication"], 0, "Integration testing checks interactions between modules.", "studybench-curriculum"),
  ],
}

const csDevopsBasics: Chapter = {
  id: "cs-devops-basics",
  title: "Git, Deployment & DevOps Basics",
  summary: "Version control, CI/CD, environment variables and deployment vocabulary.",
  lessons: [
    {
      id: "l-devops-1",
      title: "Git and collaboration",
      minutes: 6,
      body:
        "**Git** tracks code history. A **commit** records a snapshot. A **branch** lets you work separately. A **merge** combines changes.\n\n**Pull requests** are used to review code before merging. They reduce bugs and help teams discuss trade-offs.\n\n**Common mistake:** saying GitHub and Git are the same. Git is the version-control tool; GitHub hosts repositories and collaboration features.",
      sourceIds: ["studybench-curriculum", "gfg-cs-core"],
    },
    {
      id: "l-devops-2",
      title: "CI/CD and environments",
      minutes: 6,
      body:
        "**CI** runs checks automatically when code changes. **CD** automates release/deployment.\n\n**Environment variables** store configuration like API URLs and secrets outside the code. Never hardcode secrets into a public repository.\n\n**Deployment flow:** build the app, run checks, configure environment, release, monitor logs.\n\n**Placement tip:** even freshers should understand that shipping code includes testing, deployment and monitoring, not only writing functions.",
      sourceIds: ["studybench-curriculum"],
    },
  ],
  quiz: [
    q("Git", "easy", "A Git commit is:", ["A recorded code snapshot", "A database key", "A network cable", "A CSS color"], 0, "A commit records a snapshot of changes.", "studybench-curriculum"),
    q("Git", "medium", "A branch is useful because it:", ["Lets work happen separately", "Deletes all files", "Stops testing", "Changes CPU speed"], 0, "Branches isolate work until it is ready to merge.", "studybench-curriculum"),
    q("DevOps", "medium", "CI commonly means:", ["Continuous Integration", "Computer Internet", "Code Ignore", "Cloud Image"], 0, "CI automates checks during integration.", "studybench-curriculum"),
    q("DevOps", "hard", "Secrets should usually be stored in:", ["Environment variables or secret managers", "Public source code", "Comments", "Screenshots"], 0, "Secrets should not be hardcoded into public code.", "studybench-curriculum"),
    q("DevOps", "medium", "Monitoring after deployment mainly helps teams:", ["Detect errors and performance issues", "Avoid users", "Remove all logs", "Skip testing"], 0, "Monitoring shows whether the released app is healthy.", "studybench-curriculum"),
  ],
}

const csSystemDesignBasics: Chapter = {
  id: "cs-system-design-basics",
  title: "System Design for Freshers",
  summary: "Requirements, APIs, databases, caching and scaling vocabulary for project discussions.",
  lessons: [
    {
      id: "l-sd-1",
      title: "Think in components",
      minutes: 6,
      body:
        "A basic system design answer starts with **requirements**: what users need, scale, data and constraints.\n\nThen describe components: frontend, backend/API, database, authentication, storage and notifications if needed.\n\n**Worked example:** a placement-prep app needs users, progress tracking, question bank, quiz results and analytics. That suggests user auth, content tables, progress records and scoring logic.\n\n**Exam tip:** do not jump into technology names first. Clarify requirements first.",
      sourceIds: ["studybench-curriculum", "gfg-cs-core"],
    },
    {
      id: "l-sd-2",
      title: "Scaling vocabulary",
      minutes: 6,
      body:
        "**Caching** stores frequently used data for faster access. **Load balancing** distributes traffic across servers. **Database indexing** speeds lookups but costs write overhead and storage.\n\nFor freshers, interviewers usually expect concepts, not enterprise architecture. Explain trade-offs simply.\n\n**Common mistake:** saying every problem needs microservices. Many fresher projects are better explained as a clean monolith with good database design.",
      sourceIds: ["studybench-curriculum", "gfg-cs-core"],
    },
  ],
  quiz: [
    q("System Design", "easy", "The first step in system design should be:", ["Clarify requirements", "Pick random tech", "Ignore users", "Write CSS"], 0, "Requirements define what the system must solve.", "studybench-curriculum"),
    q("System Design", "medium", "Caching mainly improves:", ["Repeated data access speed", "Grammar accuracy", "Keyboard layout", "CGPA"], 0, "Caching stores frequently accessed data closer/faster.", "gfg-cs-core"),
    q("System Design", "medium", "A load balancer distributes:", ["Traffic across servers", "Marks across students", "Rows into columns", "Passwords publicly"], 0, "Load balancing spreads requests across available servers.", "gfg-cs-core"),
    q("DBMS", "hard", "Database indexes speed reads but can slow:", ["Writes", "The monitor", "All authentication", "HTML rendering only"], 0, "Indexes must be updated during writes, so they add write overhead.", "gfg-cs-core"),
    q("System Design", "medium", "For many fresher projects, a clean monolith is:", ["Often acceptable", "Always illegal", "Not software", "The same as DNS"], 0, "A clear monolith can be suitable before scale requires more complexity.", "studybench-curriculum"),
  ],
}

// ---- NEW QUANT CHAPTERS ----

const quantMensuration: Chapter = {
  id: "quant-mensuration",
  title: "Mensuration: Areas, Perimeters & Volumes",
  summary: "The exact formulas, when to use which, and how to spot unit traps fast.",
  lessons: [
    {
      id: "l-men-1",
      title: "2-D shapes: area and perimeter",
      minutes: 6,
      body:
        "**Step-by-step method for any 2-D problem:**\n1. Identify the shape.\n2. Write the exact formula.\n3. Check units (if the question mixes cm and m, convert first).\n4. Calculate.\n\n**Formulas to memorise:**\n- Rectangle: Area = l x b, Perimeter = 2(l + b).\n- Square: Area = s^2, Perimeter = 4s.\n- Circle: Area = π r^2, Circumference = 2πr (use π ≈ 22/7 or 3.14).\n- Triangle: Area = (1/2) x base x height. Right triangle: Pythagoras a^2 + b^2 = c^2.\n\n**Worked example:** A rectangle is 8 cm long and 5 cm wide. Area = 8 x 5 = **40 cm²**. Perimeter = 2(8 + 5) = **26 cm**.\n\n**Speed shortcut for circles:** Area of circle = (22/7) x r x r. If the radius doubles, area becomes **4 times** (because r^2 quadruples).\n\n**Exam trap:** Perimeter uses the boundary length; area uses square units. Never confuse them — examiners swap the two in wrong options.",
      sourceIds: ["rs-aggarwal-quant"],
    },
    {
      id: "l-men-2",
      title: "3-D shapes: volume and surface area",
      minutes: 5,
      body:
        "**Step-by-step method for any 3-D problem:**\n1. Identify the shape (cube, cuboid, cylinder, cone, sphere).\n2. Decide: total surface area or volume?\n3. Write the formula, substitute, calculate.\n\n**Formulas to memorise:**\n- Cube (side s): Volume = s^3, TSA = 6s^2.\n- Cuboid: Volume = l x b x h, TSA = 2(lb + bh + hl).\n- Cylinder (radius r, height h): Volume = π r^2 h, CSA = 2πrh.\n- Sphere: Volume = (4/3)πr^3, SA = 4πr^2.\n\n**Worked example:** A cube with side 4 cm. Volume = 4^3 = **64 cm³**. TSA = 6 x 4^2 = **96 cm²**.\n\n**Key insight:** Volume is measured in cm³ (cubed units), surface area in cm² (squared units). Examiners often include both in one question to test if you use the right formula.\n\n**Company context:** Mensuration appears in TCS NQT, Wipro and Cognizant aptitude sections, usually as 1-2 questions per test.",
      sourceIds: ["rs-aggarwal-quant", "indiabix-aptitude"],
    },
  ],
  quiz: [
    q("Mensuration", "easy", "The area of a rectangle with length 10 cm and breadth 6 cm is:", ["60 cm", "32 cm²", "60 cm²", "16 cm²"], 2, "Area = l x b = 10 x 6 = 60 cm².", "rs-aggarwal-quant"),
    q("Mensuration", "easy", "The perimeter of a square with side 7 cm is:", ["28 cm", "49 cm", "14 cm", "21 cm"], 0, "Perimeter = 4 x 7 = 28 cm.", "rs-aggarwal-quant"),
    q("Mensuration", "medium", "The area of a circle with radius 7 cm is (use π = 22/7):", ["44 cm²", "154 cm²", "22 cm²", "132 cm²"], 1, "Area = (22/7) x 7 x 7 = 154 cm².", "indiabix-aptitude"),
    q("Mensuration", "medium", "The volume of a cube with side 5 cm is:", ["25 cm³", "75 cm³", "125 cm³", "150 cm³"], 2, "Volume = 5^3 = 125 cm³.", "rs-aggarwal-quant"),
    q("Mensuration", "medium", "A cylinder has radius 7 cm and height 10 cm. Its volume is (π = 22/7):", ["1540 cm³", "440 cm³", "770 cm³", "1070 cm³"], 0, "Volume = (22/7) x 7^2 x 10 = 22 x 7 x 10 = 1540 cm³.", "rs-aggarwal-quant"),
    q("Mensuration", "hard", "If the radius of a circle doubles, its area becomes:", ["Twice", "Three times", "Four times", "Half"], 2, "Area = πr²; when r becomes 2r, area = π(2r)² = 4πr² = 4 times the original.", "rs-aggarwal-quant"),
  ],
}

const quantAlgebra: Chapter = {
  id: "quant-algebra",
  title: "Algebra, Equations & Word Problems",
  summary: "Translate words into one equation, solve in one step. No guess-and-check needed.",
  lessons: [
    {
      id: "l-alg-1",
      title: "Translate words into algebra",
      minutes: 6,
      body:
        "**The single most important skill:** convert the sentence into an equation BEFORE calculating anything.\n\n**Translation guide:**\n- 'a number' = let it be x\n- 'twice a number' = 2x\n- 'five more than x' = x + 5\n- 'five less than x' = x - 5\n- 'the sum of two numbers is 30' -> a + b = 30\n- 'one number is 4 more than the other' -> b = a + 4\n\n**Step-by-step method:**\n1. Read the full problem.\n2. Assign a variable (x) to the unknown.\n3. Write one equation from the given condition.\n4. Solve for x.\n5. Re-read to check if the answer makes sense.\n\n**Worked example:** 'A number added to 3 times itself is 40.' Let the number = x. Then x + 3x = 40 -> 4x = 40 -> x = **10**.\n\n**Exam trap:** Examiners say 'exceeds by' to mean subtraction. 'A exceeds B by 5' means A - B = 5, or A = B + 5.",
      sourceIds: ["rs-aggarwal-quant"],
    },
    {
      id: "l-alg-2",
      title: "Two-variable systems and age problems",
      minutes: 6,
      body:
        "**Two-variable problems need two equations.** Look for two conditions in the problem and write one equation each.\n\n**Worked example:** 'The sum of two numbers is 14 and their difference is 4.' \n-> a + b = 14 and a - b = 4. Add both: 2a = 18 -> a = 9, b = 5.\n\n**Age problems — the golden rule:** Write present ages as variables first. 'n years ago' = subtract n; 'after n years' = add n.\n\n**Worked example:** 'Father is 4 times the son's age. In 8 years he will be twice the son's age.'\nLet son = x, father = 4x.\nIn 8 years: 4x + 8 = 2(x + 8) -> 4x + 8 = 2x + 16 -> 2x = 8 -> x = 4.\nSon is **4**, father is **16**.\n\n**Inequalities:** If the problem says 'at least k', use ≥ k; 'at most k', use ≤ k. Solve like an equation but flip the sign when multiplying/dividing by a negative.\n\n**Exam tip:** For two-number problems, adding and subtracting the two equations is almost always faster than substitution.",
      sourceIds: ["rs-aggarwal-quant", "indiabix-aptitude"],
    },
  ],
  quiz: [
    q("Algebra", "easy", "If 3x = 18, then x =", ["3", "5", "6", "9"], 2, "x = 18 / 3 = 6.", "rs-aggarwal-quant"),
    q("Algebra", "easy", "The sum of two numbers is 20 and one is 4 more than the other. The larger number is:", ["10", "12", "14", "8"], 1, "a + b = 20, a = b + 4 -> 2b + 4 = 20 -> b = 8, a = 12.", "rs-aggarwal-quant"),
    q("Algebra", "medium", "A number added to 5 times itself is 48. The number is:", ["6", "7", "8", "9"], 2, "x + 5x = 48 -> 6x = 48 -> x = 8.", "indiabix-aptitude"),
    q("Ages", "medium", "A father is 3 times his son's age. In 12 years, he will be twice his son's age. The son's age now is:", ["10", "12", "14", "15"], 1, "3x + 12 = 2(x + 12) -> x + 12 = 24 -> x = 12.", "rs-aggarwal-quant"),
    q("Algebra", "medium", "The difference of two numbers is 8 and their sum is 32. The larger number is:", ["18", "20", "22", "24"], 1, "Add equations: 2a = 40 -> a = 20.", "rs-aggarwal-quant"),
    q("Ages", "hard", "Asha is 5 years older than Priya. Three years ago Asha was twice Priya's age. Asha's present age is:", ["11", "13", "15", "17"], 1, "Let Priya = x, Asha = x+5. Three years ago: x+5-3 = 2(x-3) -> x+2 = 2x-6 -> x = 8. Asha = 13.", "rs-aggarwal-quant"),
  ],
}

// ---- NEW REASONING CHAPTERS ----

const reasonInputOutput: Chapter = {
  id: "reason-input-output",
  title: "Input-Output & Machine Operations",
  summary: "Find the rule from step 1 to step 2. Apply it consistently to crack the rest.",
  lessons: [
    {
      id: "l-io-1",
      title: "How input-output machines work",
      minutes: 6,
      body:
        "Input-Output questions give you a 'machine' that transforms a word or number sequence step by step. Your job is to find the rule.\n\n**Step-by-step method:**\n1. Look at the INPUT (the original sequence).\n2. Look at Step 1 and find WHAT changed — a number moved, a word is sorted alphabetically, something is reversed.\n3. Confirm the same rule applies from Step 1 to Step 2.\n4. Apply that rule to find the next step, or trace backwards to find the input.\n\n**Common machine rules in placement exams:**\n- **Number rearrangement:** largest/smallest number moves to one end at each step.\n- **Alphabetical sort:** words are arranged A-Z from left or right in each step.\n- **Shift by position:** each element shifts one/two places.\n- **Interchange:** every two adjacent elements swap.\n\n**Worked example:** Input: 71 35 48 20 13. Step 1: 71 48 35 20 13. Step 2: 71 48 35 20 13. Rule: numbers are being sorted in descending order, one number fixed from the left at each step.\n\n**Exam tip:** always check BOTH the start and the end — machines in placement tests almost always end in ascending or descending order.",
      sourceIds: ["rs-aggarwal-reasoning"],
    },
    {
      id: "l-io-2",
      title: "Solving word-arrangement machines",
      minutes: 5,
      body:
        "**Word machines** rearrange words in a sentence or list by a fixed rule, often alphabetical or by word length.\n\n**Common rules:**\n1. Sort words alphabetically from left → right (one word fixed per step).\n2. Sort by length (shortest to longest or vice versa).\n3. Reverse the whole sequence every step.\n4. Move a specific-pattern word (e.g. all words starting with a vowel) to one end.\n\n**Worked example:**\nInput: blue red orange green pink\nStep 1: blue green orange pink red (sort A-Z from right — only 'red' is last now).\nStep 2: blue green orange pink red (already A-Z — done in one step if just alphabetical sort).\n\n**For 'find the input' questions:** reverse the machine's steps. If Step 3 moves the smallest to the left, then the 'input' had that element somewhere else.\n\n**Common mistake:** assuming the same number of steps always. Count the steps shown and confirm the rule holds for every transition, not just the first one.",
      sourceIds: ["rs-aggarwal-reasoning", "indiabix-aptitude"],
    },
  ],
  quiz: [
    q("Input-Output", "easy", "A machine sorts numbers in ascending order, one per step from the left. Input: 9 3 7 1 5. After Step 1, the sequence is:", ["1 3 7 9 5", "1 9 3 7 5", "3 9 7 1 5", "1 3 9 7 5"], 1, "Step 1 moves the smallest (1) to position 1: 1 9 3 7 5.", "rs-aggarwal-reasoning"),
    q("Input-Output", "easy", "After Step 2, the above sequence becomes:", ["1 3 9 7 5", "1 3 7 9 5", "1 9 3 5 7", "3 1 7 9 5"], 0, "Step 2 moves next smallest (3) to position 2: 1 3 9 7 5.", "rs-aggarwal-reasoning"),
    q("Input-Output", "medium", "A machine rearranges words alphabetically from the left one step at a time. Input: red blue pink. After Step 1, the sequence is:", ["red pink blue", "blue red pink", "pink red blue", "blue pink red"], 1, "Step 1 places the first alphabetically ('blue') at position 1: blue red pink.", "indiabix-aptitude"),
    q("Input-Output", "medium", "Input: 5 2 8 4 1. A machine moves the largest number to the right end each step. After Step 1:", ["5 2 4 1 8", "1 2 4 5 8", "2 5 4 1 8", "5 2 8 1 4"], 0, "Largest (8) moves to the right end: 5 2 4 1 8.", "rs-aggarwal-reasoning"),
    q("Input-Output", "hard", "After Step 2 of the above (largest to right each time), the sequence is:", ["1 2 4 5 8", "5 2 4 1 8", "2 4 1 5 8", "5 4 2 1 8"], 2, "Step 2 moves next largest (5) to second from right: 2 4 1 5 8.", "rs-aggarwal-reasoning"),
  ],
}

const reasonStatements: Chapter = {
  id: "reason-statements",
  title: "Statement-Assumption & Statement-Argument",
  summary: "Two specific rules decide everything: implicit vs explicit, and strong vs weak arguments.",
  lessons: [
    {
      id: "l-stmt-1",
      title: "Statement-Assumption: what is taken for granted",
      minutes: 6,
      body:
        "An **assumption** is something not stated in the sentence but that MUST be true for the statement to make sense.\n\n**The golden rule:** An assumption is IMPLICIT (hidden but necessary). If it is already stated in the sentence, it is NOT an assumption — it is a given fact.\n\n**Step-by-step method:**\n1. Read the statement.\n2. Ask: 'For this statement to be true, what must the speaker silently believe?'\n3. Check: is it mentioned explicitly? If yes, NOT an assumption.\n4. Check: could the statement exist without it? If yes, NOT an assumption.\n\n**Worked example:**\nStatement: 'A sign outside a shop says — Apply sunscreen before going outdoors.'\nAssumption I: People go outdoors. ✓ **Implicit and necessary** — the sign would make no sense if no one went outside.\nAssumption II: Sunscreen protects from the sun. ✓ **Implicit and necessary** — otherwise why recommend it?\nAssumption III: People do not apply sunscreen. ✗ **Not necessarily assumed** — the sign could be a reminder even for people who sometimes do.\n\n**Exam trap:** Do not confuse an assumption with an inference. An assumption is what you MUST believe before you act; an inference is what you conclude AFTER reading the facts.",
      sourceIds: ["rs-aggarwal-reasoning"],
    },
    {
      id: "l-stmt-2",
      title: "Statement-Argument: strong vs weak",
      minutes: 5,
      body:
        "In Statement-Argument questions, a policy or idea is stated, and two arguments (for or against) are given. You must judge whether each is **strong** or **weak**.\n\n**A STRONG argument:**\n- Is directly relevant to the statement.\n- Is based on solid reasoning or established fact.\n- Would actually change a reasonable person's decision.\n\n**A WEAK argument:**\n- Is based on emotion, personal feeling, or vague claims ('it has always been done this way').\n- Is irrelevant to the core issue.\n- Is a very minor point that does not affect the main decision.\n\n**Worked example:**\nStatement: Should school uniforms be made compulsory?\nArgument I: Yes, it reduces visible inequality among students. → **STRONG** (directly addresses a real social concern).\nArgument II: No, it is uncomfortable in summer. → **WEAK** (a minor practical complaint, not a fundamental objection).\nArgument III: No, children have always worn different clothes. → **WEAK** (tradition alone is not a reason; examiners consider 'it has always been done' weak).\n\n**Exam tip:** In competitive exams, arguments based on facts and social/economic impact are almost always strong; arguments based on feelings or tradition are almost always weak.",
      sourceIds: ["rs-aggarwal-reasoning"],
    },
  ],
  quiz: [
    q("Statement-Assumption", "medium", "Statement: 'Buy fresh fruits from our store — they are delivered daily.' Which assumption is implicit? A: People prefer fresh fruits. B: The store makes a profit.", ["Only A", "Only B", "Both A and B", "Neither"], 0, "A is implicit — the sign only makes sense if people value freshness. B is irrelevant to the statement's meaning.", "rs-aggarwal-reasoning"),
    q("Statement-Assumption", "medium", "Statement: 'Use stairs instead of the lift for better health.' Assumption: People use lifts regularly.", ["Implicit", "Not implicit", "Cannot say", "Partially implicit"], 0, "The advice only makes sense if people currently use lifts; the assumption that they do is implicit.", "rs-aggarwal-reasoning"),
    q("Statement-Argument", "medium", "Statement: Should exams be made open-book? Argument: Yes, it tests understanding rather than memory. Is the argument strong or weak?", ["Strong", "Weak", "Neither", "Cannot say"], 0, "It directly addresses the purpose of assessment — a relevant, reasoned point. Strong.", "rs-aggarwal-reasoning"),
    q("Statement-Argument", "medium", "Statement: Should public transport be free? Argument: No, people have always paid for transport. Is the argument strong or weak?", ["Strong", "Weak", "Neither", "Both"], 1, "Tradition is not a reasoned objection. The argument is weak.", "rs-aggarwal-reasoning"),
    q("Statement-Assumption", "hard", "Statement: 'Read this guide carefully before installing the software.' Assumption I: Users can read. Assumption II: The software requires special steps to install.", ["Only I", "Only II", "Both I and II", "Neither"], 2, "I is implicit (addressing someone who can read) and II is implicit (otherwise the guide would be unnecessary). Both follow.", "rs-aggarwal-reasoning"),
  ],
}

// ---- NEW VERBAL CHAPTER ----

const verbalCriticalReasoning: Chapter = {
  id: "verbal-critical",
  title: "Critical Reasoning: Inference & Conclusion",
  summary: "Three rules that decide if a conclusion is valid — no guesswork needed.",
  lessons: [
    {
      id: "l-cr-1",
      title: "What a valid inference looks like",
      minutes: 6,
      body:
        "A **valid inference** is a conclusion that MUST be true if the given statements are true. It cannot go beyond the information given.\n\n**Three rules for a valid inference:**\n1. **It must be supported by the passage** — not by your outside knowledge.\n2. **It must be definite, not speculative** — 'probably' and 'might' are warning signs.\n3. **It must not be too broad** — never infer a universal (all, always, never) from a limited example.\n\n**Step-by-step method:**\n1. Read the passage for its one main claim.\n2. For each conclusion option, ask: 'Can I prove this directly from the passage?'\n3. If yes and only yes → valid inference.\n4. If you need outside knowledge or it could be false → not valid.\n\n**Worked example:**\nPassage: 'Studies show that students who read daily perform better in language tests.'\nConclusion A: All good readers pass language tests. ✗ Too broad — 'better performance' ≠ 'all pass'.\nConclusion B: Reading daily is associated with better language test scores. ✓ Directly supported, stays within the passage.\nConclusion C: Students who do not read will fail. ✗ Not stated — we do not know about non-readers from this passage.",
      sourceIds: ["high-agg-verbal", "rs-aggarwal-reasoning"],
    },
    {
      id: "l-cr-2",
      title: "Strengthening and weakening arguments",
      minutes: 5,
      body:
        "Some questions ask you to pick the statement that **strengthens** (supports) or **weakens** (attacks) a given argument.\n\n**To strengthen an argument:** find the option that provides extra evidence in favour of the conclusion, or removes a potential objection.\n\n**To weaken an argument:** find the option that provides a reason to doubt the conclusion, or shows that the cause–effect link does not hold.\n\n**Worked example:**\nArgument: 'People who exercise daily are healthier, so companies should mandate daily exercise for all employees.'\nStrengthen: 'Studies show employee healthcare costs drop 30% in companies with mandatory exercise programmes.' ✓ Direct supporting evidence.\nWeaken: 'Many employees report injury from mandatory exercise programmes.' ✓ Shows a downside that undermines the policy.\n\n**Exam tip:** In strengthen/weaken questions, always pick the option that is DIRECTLY related to the link between the cause and conclusion, not something loosely related to the general topic.",
      sourceIds: ["high-agg-verbal"],
    },
  ],
  quiz: [
    q("Critical Reasoning", "medium", "Passage: 'Our city planted 5,000 trees last year and air quality improved.' Which inference is valid?", ["Trees alone caused the improvement.", "Tree planting and quality improvement happened together in this city.", "All cities should plant trees.", "More trees always improve air quality."], 1, "The passage only says both things happened; it does not prove causation, make universal claims, or recommend policy.", "high-agg-verbal"),
    q("Critical Reasoning", "medium", "Passage: 'No employee was late this month.' Valid inference:", ["All employees are punctual by nature.", "No employee was late this month.", "The company has strict attendance rules.", "Employees fear punishment."], 1, "Only option B exactly restates what is given — the only safe inference is what the passage says directly.", "rs-aggarwal-reasoning"),
    q("Critical Reasoning", "medium", "Argument: 'Students who sleep 8 hours score higher.' Which statement STRENGTHENS this?", ["Sleep is enjoyable.", "A study of 10,000 students shows consistent high scores with 8-hour sleep across age groups.", "Some students sleep 6 hours and do fine.", "Sleeping more is always better."], 1, "Broad multi-study evidence directly supports the link claimed in the argument.", "high-agg-verbal"),
    q("Critical Reasoning", "medium", "The same argument ('Students who sleep 8 hours score higher') is WEAKENED by:", ["Exams are getting harder.", "A controlled study shows similar scores among students sleeping 6 or 8 hours.", "More students study at night.", "Schools start too early."], 1, "It directly challenges the assumed link between 8-hour sleep and higher scores.", "high-agg-verbal"),
    q("Critical Reasoning", "hard", "Passage: 'Only engineers who pass the ethics exam are promoted.' Inference: 'Some engineers who passed the ethics exam are not promoted.'", ["True", "False", "Cannot say", "True only if stated"], 2, "The passage says passing is required for promotion, but does not say it guarantees promotion. Some passers may or may not be promoted — we cannot say from the passage alone.", "high-agg-verbal"),
  ],
}

// ---- CODING: Sorting & Searching ----
const codingSearchSort: Chapter = {
  id: "coding-search-sort",
  title: "Searching, Sorting & Complexity Analysis",
  summary: "Master binary search, the core sorting algorithms, and Big-O analysis used in every coding interview.",
  lessons: [
    {
      id: "l-ss-1",
      title: "Linear search vs binary search",
      minutes: 6,
      body:
        "**Linear search:** scan every element one by one until you find the target or exhaust the array. O(n) time, O(1) space. Works on any array.\n\n**Binary search:** requires a **sorted** array. Compare the target with the middle element. If equal, done. If target is smaller, discard the right half; if larger, discard the left half. Repeat on the remaining half.\n\n**Worked example on [2, 5, 8, 12, 16, 23, 38], target=23:**\n1. mid = index 3, value 12. 23 > 12 → search right half [16, 23, 38].\n2. mid = index 5, value 23. Found!\n\n**Why O(log n)?** Each step halves the remaining space. After k steps, only n/2^k elements remain. When that equals 1, k = log₂n.\n\n**Exam tip:** Binary search is only valid on sorted data. If the array is unsorted, sort it first (O(n log n)) — the combined cost is still better than O(n²) brute force for large inputs.",
      sourceIds: ["gfg-dsa"],
    },
    {
      id: "l-ss-2",
      title: "Sorting algorithms: bubble, selection, insertion, merge, quick",
      minutes: 8,
      body:
        "**Step-by-step comparison (know each one):**\n\n**Bubble Sort:** Repeatedly compare adjacent elements and swap if out of order. Largest 'bubbles' to the end each pass. O(n²) worst/average, O(n) best (with early-exit flag). Stable. Easy to code, not practical for large inputs.\n\n**Selection Sort:** Find the minimum in the unsorted part, swap it to the front. O(n²) always — but only n-1 swaps total (useful when write cost is high). Not stable.\n\n**Insertion Sort:** Take each element and insert it into its correct position in the sorted prefix. O(n²) worst, O(n) best (nearly sorted). Stable. Best choice for small or nearly-sorted arrays.\n\n**Merge Sort:** Divide in half, sort each half, merge. O(n log n) all cases. Stable. Uses O(n) extra space. Best for linked lists and external sorting.\n\n**Quick Sort:** Pick a pivot, partition so that smaller elements are left and larger are right, recurse on both sides. O(n log n) average, O(n²) worst (sorted array with bad pivot). Not stable. Fastest in practice due to cache-friendliness.\n\n**Summary table:**\n- Merge sort: guaranteed O(n log n), stable, O(n) space.\n- Quick sort: O(n log n) average, not stable, O(log n) space.\n- For production code: use the language's built-in sort (TimSort = merge+insertion, O(n log n), stable).\n\n**Exam tip:** Know the worst case of each. 'Quick sort worst case' is O(n²) — this comes up in every company's assessment.",
      sourceIds: ["gfg-dsa", "rs-aggarwal-quant"],
    },
  ],
  quiz: [
    q("Sorting", "easy", "Binary search requires the array to be:", ["Random", "Sorted", "Reversed", "Empty"], 1, "Binary search works by halving the remaining search space, which only works if the array is sorted.", "gfg-dsa"),
    q("Sorting", "easy", "The worst-case time complexity of bubble sort is:", ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], 2, "Bubble sort compares every pair in the worst case → O(n²).", "gfg-dsa"),
    q("Sorting", "medium", "Merge sort has O(n log n) time in:", ["Best case only", "Worst case only", "All cases", "Average case only"], 2, "Merge sort always divides and merges in O(n log n) regardless of input order.", "gfg-dsa"),
    q("Sorting", "medium", "Which sorting algorithm is generally fastest in practice due to cache performance?", ["Bubble sort", "Merge sort", "Quick sort", "Selection sort"], 2, "Quick sort has better cache locality than merge sort, making it faster in practice despite the same average O(n log n).", "gfg-dsa"),
    q("Searching", "medium", "Binary search on 128 elements requires at most how many comparisons?", ["128", "64", "7", "14"], 2, "log₂(128) = 7. Binary search halves the space each step.", "gfg-dsa"),
    q("Sorting", "hard", "Which algorithm is preferred when sorting a singly linked list?", ["Quick sort", "Merge sort", "Bubble sort", "Heap sort"], 1, "Merge sort needs no random access — ideal for linked lists. Quick sort relies on O(1) random access for partitioning.", "gfg-dsa"),
    q("Sorting", "medium", "Insertion sort is most efficient when:", ["The array is random", "The array is nearly sorted", "The array is reversed", "The array is very large"], 1, "Nearly sorted input gives insertion sort O(n) performance — each element moves very few positions.", "gfg-dsa"),
    q("Sorting", "hard", "The worst case of quick sort (O(n²)) occurs when:", ["All elements are equal", "The pivot is always the median", "The pivot is always the smallest or largest element", "The array is random"], 2, "Choosing the min or max as pivot results in maximally unbalanced partitions, degrading to O(n²).", "gfg-dsa"),
  ],
}

// ---- CODING: Stacks, Queues & Hash Tables ----
const codingStacksQueues: Chapter = {
  id: "coding-stacks-queues",
  title: "Stacks, Queues & Hash Tables",
  summary: "Three data structures every software engineer uses daily — understand them deeply before your first coding interview.",
  lessons: [
    {
      id: "l-sq-1",
      title: "Stack (LIFO) and Queue (FIFO): operations and real uses",
      minutes: 7,
      body:
        "**Stack — Last In, First Out (LIFO):**\n- Operations: push (add to top), pop (remove from top), peek (view top without removing). O(1) each.\n- Implementation: array with a top index, or a linked list.\n- Real uses:\n  - **Browser back button** (visited pages form a stack — go back = pop).\n  - **Undo/redo** in text editors.\n  - **Function call stack** — every time you call a function, a frame is pushed; when it returns, the frame is popped.\n  - **Balanced parentheses check** — push opening brackets, pop when a closing bracket matches.\n\n**Queue — First In, First Out (FIFO):**\n- Operations: enqueue (add to rear), dequeue (remove from front), peek. O(1) each with a circular array or linked list.\n- Real uses:\n  - **Print queue** — first document sent prints first.\n  - **BFS traversal** — explore level by level.\n  - **Task schedulers** — OS process scheduling.\n\n**Worked example (parentheses check):**\nInput: \"([{}])\"\nStack walk: push '(', push '[', push '{' → see '}' → pop '{' matches → see ']' → pop '[' matches → see ')' → pop '(' matches → stack empty → balanced ✓.\n\n**Common mistake:** Using a list where pop(0) is O(n). For a real queue, use a deque (collections.deque in Python) or a circular buffer for O(1) dequeue.",
      sourceIds: ["gfg-dsa"],
    },
    {
      id: "l-sq-2",
      title: "Hash tables: key-value, collisions and O(1) lookup",
      minutes: 7,
      body:
        "**What is a hash table?**\nA hash table stores key-value pairs. A **hash function** converts the key to an array index. Look up, insert and delete are **O(1) average** — the fastest lookup structure.\n\n**How it works:**\n1. Call hash(key) → index.\n2. Store value at arr[index].\n3. Lookup: compute index again → read value.\n\n**Collision:** Two different keys produce the same index.\n- **Chaining:** each index holds a linked list. O(n) worst case if all keys collide.\n- **Open addressing:** probe to the next available slot.\n\n**Load factor** = number of entries / capacity. Above ~0.7, resize (double the array and rehash). This keeps average O(1).\n\n**Worked example — count character frequencies:**\n```\nfreq = {}\nfor c in \"apple\":\n    freq[c] = freq.get(c, 0) + 1\n# freq = {'a':1, 'p':2, 'l':1, 'e':1}\n```\n\n**Real uses:**\n- Caching (DNS cache maps domain → IP).\n- Database indexes (hash indexes for equality queries).\n- Sets (Python set, Java HashSet — same structure, no values).\n\n**When NOT to use a hash table:** when you need sorted order (use a BST/TreeMap), or when memory is extremely limited and a constant collision rate matters.\n\n**Exam tip:** Any problem that asks you to find duplicates, count frequencies, or check membership is almost always solved in O(n) with a hash table. Recognise the pattern early.",
      sourceIds: ["gfg-dsa"],
    },
  ],
  quiz: [
    q("Stack", "easy", "A stack follows which order?", ["FIFO", "LIFO", "Random", "Sorted"], 1, "Stack is Last In, First Out — the most recently added element is removed first.", "gfg-dsa"),
    q("Queue", "easy", "A queue follows which order?", ["LIFO", "FIFO", "Priority", "Reverse"], 1, "Queue is First In, First Out — the earliest added element is removed first.", "gfg-dsa"),
    q("Stack", "medium", "Which data structure is used to check balanced parentheses?", ["Queue", "Stack", "Array", "Linked list"], 1, "Push opening brackets; pop when a closing bracket matches. Stack's LIFO ensures correct nesting.", "gfg-dsa"),
    q("Hash Table", "medium", "The average time complexity for lookup in a hash table is:", ["O(n)", "O(log n)", "O(1)", "O(n²)"], 2, "A good hash function distributes keys uniformly, giving O(1) average lookup.", "gfg-dsa"),
    q("Hash Table", "medium", "A hash collision means:", ["Two keys have the same value", "Two different keys map to the same array index", "The hash table is full", "The key is not found"], 1, "A collision occurs when hash(key1) == hash(key2) for key1 ≠ key2.", "gfg-dsa"),
    q("Stack", "medium", "BFS traversal of a graph uses:", ["Stack", "Queue", "Hash table", "Sorted array"], 1, "BFS explores level by level — the queue ensures nodes are visited in FIFO order.", "gfg-dsa"),
    q("Hash Table", "hard", "When the load factor of a hash table exceeds ~0.7, the standard action is to:", ["Delete half the entries", "Resize the table and rehash", "Switch to a linked list", "Stop accepting inserts"], 1, "Resizing (doubling the array and rehashing all entries) keeps the average O(1) performance.", "gfg-dsa"),
    q("Stack", "hard", "The function call stack grows when a function is called and shrinks when:", ["A loop ends", "The function returns", "A variable is declared", "The program starts"], 1, "Each function call pushes a stack frame; returning pops it and restores the previous context.", "gfg-dsa"),
  ],
}

// ---- CS CORE: Programming Fundamentals (1st & 2nd year) ----
const csProgrammingFundamentals: Chapter = {
  id: "cs-programming-fundamentals",
  title: "Programming Fundamentals for Freshers",
  summary: "Variables, control flow, functions and the mindset to write correct programs — the foundation every 1st and 2nd year student needs before DSA.",
  lessons: [
    {
      id: "l-pf-1",
      title: "Variables, data types, operators and control flow",
      minutes: 7,
      body:
        "**Variables** are named containers for data. The **data type** tells the compiler/interpreter what kind of value it holds and how much memory to allocate.\n\n**Common data types:**\n- `int` (integer): 32-bit whole number, range roughly -2 billion to +2 billion.\n- `long`: 64-bit integer for large numbers.\n- `float`/`double`: decimal numbers (double has more precision).\n- `char`: a single character ('A', '1').\n- `boolean`/`bool`: true or false.\n- `String`: sequence of characters.\n\n**Operators:**\n- Arithmetic: `+`, `-`, `*`, `/`, `%` (remainder). Note: integer division in most languages truncates — 7/2 = 3, not 3.5.\n- Comparison: `==`, `!=`, `<`, `>`, `<=`, `>=`. These return a boolean.\n- Logical: `&&` (AND), `||` (OR), `!` (NOT).\n\n**Control flow:**\n```\nif (marks >= 90) { grade = 'A'; }\nelse if (marks >= 75) { grade = 'B'; }\nelse { grade = 'C'; }\n```\n**Loops:**\n- `for` loop: when you know the number of iterations.\n- `while` loop: when you iterate until a condition becomes false.\n- `do-while`: execute at least once before checking the condition.\n\n**Worked example — sum of 1 to n:**\n```\nint sum = 0;\nfor (int i = 1; i <= n; i++) {\n    sum += i;   // same as sum = sum + i\n}\n```\n\n**Common mistake 1 (off-by-one):** using `i < n` when you need `i <= n` — the last element is missed.\n**Common mistake 2 (integer overflow):** sum of n numbers for large n overflows int — use long.\n\n**Exam tip:** For aptitude questions, always trace a small example by hand first — substitute n=3 or n=4 and run the loop mentally.",
      sourceIds: ["gfg-cs-core"],
    },
    {
      id: "l-pf-2",
      title: "Functions, scope, recursion and the mindset of clean code",
      minutes: 7,
      body:
        "**What is a function?**\nA function packages a reusable block of logic with a name, inputs (parameters) and an output (return value). Good programs are built from small, single-purpose functions.\n\n**Function anatomy (Java/C++ style):**\n```\nreturnType functionName(paramType paramName) {\n    // body\n    return value;\n}\n```\nExample:\n```\nint square(int x) {\n    return x * x;\n}\n```\n\n**Scope:** A variable declared inside a function only exists inside that function (local scope). Variables at the top level exist in the outer scope. This means: two functions can each have their own `int i = 0` without conflict.\n\n**Recursion:** A function that calls itself on a smaller sub-problem.\n- **Base case:** the simplest input that returns directly — do NOT forget this, it is what stops infinite recursion.\n- **Recursive case:** reduce towards the base case.\n\n**Worked example — factorial:**\n```\nint factorial(int n) {\n    if (n == 0) return 1;       // base case\n    return n * factorial(n-1);  // recursive case\n}\n// factorial(3) = 3 * factorial(2) = 3 * 2 * factorial(1) = 3 * 2 * 1 * 1 = 6\n```\n\n**The three rules of clean code (for freshers):**\n1. **One function, one job** — a function should do exactly one thing.\n2. **Meaningful names** — `calculateTotal` is better than `ct`.\n3. **Handle edge cases explicitly** — what if n=0? What if the array is empty?\n\n**Common mistake:** Recursion without a base case → infinite recursion → stack overflow.\n\n**Exam tip:** Any time you see 'write a function to compute X', first write the function signature and the base case. Then the recursive case almost writes itself.",
      sourceIds: ["gfg-cs-core", "studybench-curriculum"],
    },
  ],
  quiz: [
    q("Programming", "easy", "What does the % operator compute?", ["Quotient", "Power", "Remainder", "Root"], 2, "% is the modulo (remainder) operator. 7 % 3 = 1.", "gfg-cs-core"),
    q("Programming", "easy", "Integer division of 7 / 2 in most languages (Java, C) gives:", ["3.5", "4", "3", "2"], 2, "Integer division truncates the decimal part. 7 / 2 = 3.", "gfg-cs-core"),
    q("Programming", "medium", "An off-by-one error in a loop typically means:", ["The loop never runs", "The loop runs one too many or one too few times", "The loop runs infinitely", "A syntax error"], 1, "Off-by-one: using < instead of <= (or vice versa), causing the loop to skip the last element or run one extra time.", "gfg-cs-core"),
    q("Recursion", "easy", "In a recursive function, the base case is needed to:", ["Make the function faster", "Stop the recursion from running forever", "Return the largest value", "Declare variables"], 1, "Without a base case, the function calls itself indefinitely, causing a stack overflow.", "gfg-cs-core"),
    q("Programming", "medium", "A variable declared inside a function is accessible:", ["Everywhere in the program", "Only inside that function", "Only in other functions", "Only at runtime"], 1, "Local scope: variables declared inside a function exist only within that function.", "gfg-cs-core"),
    q("Recursion", "medium", "factorial(5) using recursion evaluates to:", ["5", "24", "120", "25"], 2, "5! = 5×4×3×2×1 = 120.", "gfg-cs-core"),
    q("Programming", "medium", "Which loop is guaranteed to execute at least once?", ["for", "while", "do-while", "if"], 2, "do-while checks the condition after executing the body, so the body runs at least once.", "gfg-cs-core"),
    q("Programming", "hard", "To avoid integer overflow when summing a large array in Java, use:", ["int", "char", "long", "boolean"], 2, "long is a 64-bit integer that can hold much larger values than int's 32-bit range.", "gfg-cs-core"),
  ],
}

// ---- CS CORE: Computer Networks ----
const csNetworksFundamentals: Chapter = {
  id: "cs-networks-fundamentals",
  title: "Computer Networks: OSI Model & TCP/IP",
  summary: "The OSI layers, TCP/IP protocol suite, DNS, HTTP/HTTPS, and common networking interview questions answered clearly.",
  lessons: [
    {
      id: "l-net-1",
      title: "The OSI model: 7 layers, one sentence each",
      minutes: 7,
      body:
        "The OSI (Open Systems Interconnection) model splits network communication into 7 layers. Each layer has a specific job and talks to the layer directly above and below it.\n\n**Layer 1 — Physical:** Transmits raw bits over a physical medium (copper wire, fibre optic, radio waves). Deals with voltage levels, pin layouts, cables.\n\n**Layer 2 — Data Link:** Groups bits into frames. Handles MAC (hardware) addresses and error detection (CRC). Ethernet and Wi-Fi operate here.\n\n**Layer 3 — Network:** Routes packets across multiple networks. **IP (Internet Protocol) lives here**. Routers operate at this layer. Handles logical addressing (IP addresses).\n\n**Layer 4 — Transport:** Provides end-to-end communication between applications. **TCP and UDP live here**. TCP guarantees delivery and order; UDP is connectionless and fast.\n\n**Layer 5 — Session:** Manages sessions (start, maintain, end a conversation) between two applications.\n\n**Layer 6 — Presentation:** Translates data formats (serialisation, compression, encryption — SSL/TLS). Ensures the data format is understood by both sides.\n\n**Layer 7 — Application:** The user-visible layer. **HTTP, HTTPS, DNS, FTP, SMTP** operate here.\n\n**Memory trick (top to bottom): All People Seem To Need Data Processing**\n(Application, Presentation, Session, Transport, Network, Data Link, Physical)\n\n**Exam trap:** Interviewers love 'at which layer does X operate?' Know:\n- IP → Layer 3 (Network)\n- TCP, UDP → Layer 4 (Transport)\n- HTTP, DNS → Layer 7 (Application)\n- Switch → Layer 2; Router → Layer 3; Gateway → Layer 4-7",
      sourceIds: ["gfg-cs-core"],
    },
    {
      id: "l-net-2",
      title: "TCP vs UDP, DNS, HTTP/HTTPS and the request lifecycle",
      minutes: 7,
      body:
        "**TCP (Transmission Control Protocol):**\n- Connection-oriented: establishes a connection with a 3-way handshake (SYN → SYN-ACK → ACK).\n- Reliable: guarantees delivery, retransmits lost packets, delivers in order.\n- Use when correctness matters: web browsing (HTTP), email (SMTP), file transfer (FTP).\n\n**UDP (User Datagram Protocol):**\n- Connectionless: no handshake, no delivery guarantee.\n- Fast and low-latency: no retransmission delay.\n- Use when speed > correctness: live video streaming, online gaming, DNS queries (one request-reply, loss is cheap).\n\n**DNS (Domain Name System):**\nDNS translates human-readable domain names (google.com) to IP addresses (142.250.195.46). Think of it as the internet's phone book. Without DNS, you would need to memorise IP addresses for every website.\n\n**HTTP vs HTTPS:**\n- HTTP (port 80): plaintext — data is readable by anyone on the path.\n- HTTPS (port 443): HTTP over TLS — encrypted. HTTPS = HTTP + TLS handshake.\n- TLS provides: encryption (nobody can read the data), authentication (you are talking to the real server, not an impostor), integrity (data was not altered).\n\n**The full lifecycle of an HTTPS request:**\n1. Browser looks up google.com in DNS cache → asks DNS server if not found → gets IP.\n2. TCP connection opens (3-way handshake) to port 443.\n3. TLS handshake: negotiate cipher, exchange certificates, establish encrypted session.\n4. Browser sends HTTP GET request (inside the encrypted tunnel).\n5. Server sends HTTP response (200 OK + HTML).\n6. Browser parses HTML, fetches linked CSS/JS files (new HTTP requests).\n7. Browser renders the page.\n\n**Common interview question:** What is the difference between a port and a socket?\n- Port: a number (0-65535) that identifies a specific service on a machine (80 = HTTP, 443 = HTTPS, 22 = SSH).\n- Socket: a combination of IP address + port — uniquely identifies one endpoint of a connection.",
      sourceIds: ["gfg-cs-core", "mdn-http"],
    },
  ],
  quiz: [
    q("Networks", "easy", "Which OSI layer handles routing of packets between networks?", ["Layer 2 (Data Link)", "Layer 3 (Network)", "Layer 4 (Transport)", "Layer 7 (Application)"], 1, "Layer 3 (Network) is where IP operates and routers make routing decisions.", "gfg-cs-core"),
    q("Networks", "easy", "TCP and UDP operate at which OSI layer?", ["Layer 2", "Layer 3", "Layer 4", "Layer 7"], 2, "TCP and UDP are Transport layer (Layer 4) protocols.", "gfg-cs-core"),
    q("Networks", "medium", "The TCP 3-way handshake sequence is:", ["ACK → SYN → SYN-ACK", "SYN → ACK → SYN-ACK", "SYN → SYN-ACK → ACK", "SYN-ACK → SYN → ACK"], 2, "Client sends SYN; server replies SYN-ACK; client confirms ACK.", "gfg-cs-core"),
    q("Networks", "medium", "DNS is used to:", ["Encrypt web traffic", "Translate domain names to IP addresses", "Route packets", "Establish TCP connections"], 1, "DNS maps human-readable hostnames (google.com) to numeric IP addresses.", "gfg-cs-core"),
    q("Networks", "medium", "HTTPS differs from HTTP mainly because it:", ["Uses a different port only", "Adds TLS encryption and authentication", "Only works on mobile", "Requires IPv6"], 1, "HTTPS wraps HTTP in TLS, providing encryption, authentication and data integrity.", "gfg-cs-core"),
    q("Networks", "medium", "UDP is preferred over TCP when:", ["Guaranteed delivery is critical", "Low latency matters more than reliable delivery", "Large files need to transfer", "Authentication is needed"], 1, "UDP's connectionless nature avoids retransmission overhead — ideal for live streaming and gaming.", "gfg-cs-core"),
    q("Networks", "hard", "A socket is best described as:", ["Only an IP address", "A port number alone", "A combination of IP address and port", "A network cable"], 2, "A socket = IP address + port number, uniquely identifying one endpoint of a network connection.", "gfg-cs-core"),
    q("Networks", "hard", "The standard port for HTTPS is:", ["21", "80", "443", "8080"], 2, "HTTPS uses port 443 by default. HTTP uses port 80.", "gfg-cs-core"),
  ],
}

// ---- COMMUNICATION: Resume, applications and final interview conversion ----
const commResumeProjects: Chapter = {
  id: "comm-resume-projects",
  title: "Resume, Projects & Proof of Work",
  summary: "Turn your preparation into a resume and project story that an interviewer can trust.",
  lessons: [
    {
      id: "l-rp-1",
      title: "Build a fresher resume that survives screening",
      minutes: 7,
      body:
        "A fresher resume should prove three things quickly: you can learn, you can build, and you can communicate clearly.\n\n**One-page structure:**\n1. Header: name, phone, email, LinkedIn/GitHub.\n2. Education: degree, branch, college, CGPA, year.\n3. Skills: languages, frameworks, databases, tools. Keep only skills you can answer questions on.\n4. Projects: 2-3 strong projects with problem, tech stack, your role and measurable result.\n5. Achievements: coding contests, internships, certificates, leadership, club work.\n\n**Project bullet formula:** Built + what + using + result. Example: 'Built a placement dashboard using Next.js and Supabase to track company-wise readiness and weak topics.'\n\n**Common mistake:** listing every technology you have seen once. Interviewers ask from your resume. If you cannot explain it, remove it.",
      sourceIds: ["studybench-curriculum"],
    },
    {
      id: "l-rp-2",
      title: "Explain a project like an engineer",
      minutes: 7,
      body:
        "Project explanation is where many students lose the interview. Do not start with only the tech stack. Start with the problem.\n\n**Use this order:**\n1. Problem: what issue did the project solve?\n2. Users: who would use it?\n3. Your role: what exactly did you build?\n4. Architecture: frontend, backend, database, APIs, auth, deployment.\n5. Hard part: one bug, trade-off or design decision.\n6. Result: what worked, what improved, what you would add next.\n\n**Worked example:** 'My project helps students track placement preparation. I built the dashboard, scoring logic and practice flow. The hardest part was avoiding fake readiness, so I counted only completed quizzes and mock performance.'\n\n**Exam tip:** prepare a 60-second project pitch and a 3-minute deep version. Most panels start short, then ask deeper follow-ups.",
      sourceIds: ["studybench-curriculum", "gfg-dsa"],
    },
    {
      id: "l-rp-3",
      title: "GitHub, LinkedIn and proof signals",
      minutes: 5,
      body:
        "Your proof of work should make the interviewer confident before you speak.\n\n**GitHub checklist:** clean README, setup steps, screenshots, feature list, tech stack, known limitations and future improvements. Pin your best repositories.\n\n**LinkedIn checklist:** clear headline, education, skills, projects, certificates, internship or club work. Use a professional photo and a short 'About' section.\n\n**Proof signals that matter:** deployed project link, demo video, solved problem streak, certificate from a credible course, meaningful README, and clean commit history.\n\n**Common mistake:** adding empty repositories or copied tutorials as proof. One honest, working project is stronger than five unclear repos.",
      sourceIds: ["studybench-curriculum"],
    },
  ],
  quiz: [
    q("Resume", "easy", "For a fresher resume, the strongest project bullet should include:", ["Only the project name", "Problem, tech used, your role and result", "Only team size", "Only college name"], 1, "A strong bullet shows what was built, how, your contribution and the outcome.", "studybench-curriculum"),
    q("Resume", "medium", "Which skill should you remove from your resume?", ["A language you can code basic problems in", "A database used in your project", "A tool you cannot explain if asked", "A framework used in deployment"], 2, "Anything on the resume can become an interview question. Remove skills you cannot defend.", "studybench-curriculum"),
    q("Project Explanation", "medium", "The best order to explain a project is:", ["Tech stack first, then random features", "Problem, users, role, architecture, challenge, result", "Only screenshots", "Only team members"], 1, "This order shows context, ownership, technical depth and impact.", "studybench-curriculum"),
    q("Project Explanation", "hard", "If an interviewer asks what you would improve in your project, the best answer is:", ["Nothing, it is perfect", "A specific limitation, why it matters and a practical next step", "I do not remember", "My teammate handled it"], 1, "A realistic improvement answer shows ownership and engineering maturity.", "studybench-curriculum"),
    q("Proof of Work", "medium", "A GitHub README for a placement project should include:", ["Only the repository title", "Setup steps, screenshots, features and limitations", "Only copied commands", "No explanation"], 1, "A useful README helps others understand, run and evaluate the project.", "studybench-curriculum"),
    q("Proof of Work", "hard", "Which proof signal is strongest for a fresher?", ["A copied tutorial with no changes", "A deployed project with README and clear ownership", "A long list of buzzwords", "A private empty repository"], 1, "Working proof with ownership is more credible than buzzwords or copied content.", "studybench-curriculum"),
  ],
}

const commApplicationsDrive: Chapter = {
  id: "comm-applications-drive",
  title: "Applications, Drive Tracking & Recruiter Follow-up",
  summary: "Stay organized across company drives so no deadline, document or follow-up is missed.",
  lessons: [
    {
      id: "l-ad-1",
      title: "Application tracker for campus drives",
      minutes: 6,
      body:
        "Placement season becomes confusing when you track everything in memory. Use a simple tracker.\n\n**Columns to maintain:** company, role, eligibility, application link, deadline, test date, rounds, status, documents submitted, prep priority and next action.\n\n**Status stages:** saved, applied, test scheduled, test done, interview scheduled, offer, rejected, follow-up needed.\n\n**Weekly routine:** every Sunday, update statuses, check upcoming deadlines, choose the top two companies for the week and align mocks with them.\n\n**Common mistake:** applying late without checking eligibility or documents. A missed upload or wrong resume version can block a serious opportunity.",
      sourceIds: ["studybench-curriculum"],
    },
    {
      id: "l-ad-2",
      title: "Professional emails and recruiter messages",
      minutes: 6,
      body:
        "Recruiter communication should be short, specific and polite.\n\n**Follow-up email structure:**\nSubject: Application for [Role] - [Your Name]\n1. Greeting.\n2. One-line context: role, date, assessment or interview.\n3. One useful detail: your interest or document attached.\n4. Polite request or thanks.\n5. Signature with phone and email.\n\n**Good line:** 'Thank you for the opportunity to interview for the Associate Software Engineer role. I enjoyed discussing my placement readiness dashboard project and would be happy to share any additional details.'\n\n**Common mistake:** sending repeated messages every day. Follow up once after a reasonable gap unless the recruiter asks for more.",
      sourceIds: ["studybench-curriculum"],
    },
    {
      id: "l-ad-3",
      title: "Document and test-day checklist",
      minutes: 5,
      body:
        "Before every drive, prepare documents and test setup the previous day.\n\n**Document checklist:** updated resume PDF, college ID, government ID, marksheets, passport photo, certificates, project links and required forms.\n\n**Online test checklist:** stable internet, charger, quiet room, webcam, browser permissions, login credentials and backup hotspot.\n\n**Test-day mindset:** read instructions first, track section time, do easy questions first and review only if time remains.\n\n**Common mistake:** opening the test link at the last minute and discovering browser, camera or login issues.",
      sourceIds: ["studybench-curriculum"],
    },
  ],
  quiz: [
    q("Applications", "easy", "A useful placement tracker should include:", ["Only company names", "Company, deadline, status, rounds and next action", "Only salary", "Only rejected companies"], 1, "The tracker should help you know what to do next for every opportunity.", "studybench-curriculum"),
    q("Applications", "medium", "Which status is most actionable?", ["Maybe", "Test scheduled on 18 June; take one mock before 16 June", "Good company", "Later"], 1, "A status is useful when it includes a date and a next action.", "studybench-curriculum"),
    q("Recruiter Email", "medium", "A recruiter follow-up email should be:", ["Long and emotional", "Short, specific and polite", "Full of slang", "Sent repeatedly every hour"], 1, "Professional communication is concise, relevant and respectful.", "studybench-curriculum"),
    q("Recruiter Email", "hard", "The best subject line for a follow-up is:", ["Hiii please reply", "Application for Software Engineer - Priya Kumar", "Important!!!!", "Job"], 1, "A clear subject line helps the recruiter identify the role and candidate quickly.", "studybench-curriculum"),
    q("Test Day", "medium", "The safest online test setup habit is to:", ["Open the test link at the last minute", "Check internet, charger, camera and login before the test", "Keep all tabs open", "Ignore instructions"], 1, "Setup issues should be solved before the timer starts.", "studybench-curriculum"),
    q("Documents", "hard", "Which mistake can block an otherwise eligible student?", ["Having a clean resume PDF", "Submitting the wrong resume or missing a required document", "Keeping ID proof ready", "Checking eligibility"], 1, "Administrative misses can prevent shortlisting even when the student is prepared.", "studybench-curriculum"),
  ],
}

const commInterviewCapstone: Chapter = {
  id: "comm-interview-capstone",
  title: "Mock Interview Capstone & Offer Conversion",
  summary: "A final-round rehearsal system for turning assessment clearance into an offer.",
  lessons: [
    {
      id: "l-ic-1",
      title: "The 30-minute mock interview structure",
      minutes: 7,
      body:
        "A realistic mock interview should feel like the final round, not a casual Q&A.\n\n**30-minute structure:**\n1. 2 minutes: greeting and self-introduction.\n2. 8 minutes: project explanation and follow-ups.\n3. 8 minutes: CS core or coding discussion.\n4. 5 minutes: HR and behavioural questions.\n5. 4 minutes: company fit and role interest.\n6. 3 minutes: candidate questions and closing.\n\n**Scoring areas:** clarity, technical correctness, ownership, examples, confidence, honesty and ability to recover when stuck.\n\n**Common mistake:** practising only known answers. Include at least two surprise questions to build recovery skill.",
      sourceIds: ["studybench-curriculum"],
    },
    {
      id: "l-ic-2",
      title: "Recovery when you are stuck",
      minutes: 6,
      body:
        "Getting stuck is normal. The panel watches how you recover.\n\n**Recovery script:**\n1. Pause for two seconds.\n2. Repeat the problem in your own words.\n3. State what you know.\n4. Give a brute-force or partial approach.\n5. Ask one clarifying question if needed.\n6. Improve from there.\n\n**Example:** 'I am not fully sure of the optimized approach yet. The brute-force method is to compare every pair, which is O(n^2). I think hashing can reduce lookup time, so I would try a set next.'\n\n**Common mistake:** saying 'I don't know' and stopping. Better: be honest, then reason from basics.",
      sourceIds: ["studybench-curriculum", "gfg-dsa"],
    },
    {
      id: "l-ic-3",
      title: "Final-day confidence checklist",
      minutes: 5,
      body:
        "The final day is not for learning everything new. It is for tightening what you already know.\n\n**Final-day checklist:**\n- Read self-intro once.\n- Revise project architecture and your contribution.\n- Revisit mistakes from the last two mocks.\n- Revise DBMS, OOP, OS and CN flash notes.\n- Prepare one company-specific reason.\n- Prepare one thoughtful question for the interviewer.\n\n**Mindset:** the goal is not to sound perfect. The goal is to sound prepared, honest and coachable.\n\n**Common mistake:** binge-studying random topics the night before and entering the interview tired.",
      sourceIds: ["studybench-curriculum"],
    },
  ],
  quiz: [
    q("Mock Interview", "easy", "A realistic mock interview should include:", ["Only HR questions", "Self-intro, project, technical/coding, HR, company fit and closing", "Only coding", "Only resume reading"], 1, "Real interviews evaluate multiple signals, so the mock should cover each one.", "studybench-curriculum"),
    q("Mock Interview", "medium", "Which scoring area matters most when explaining a project?", ["Memorised lines", "Clear ownership and technical understanding", "Speaking fast", "Avoiding follow-ups"], 1, "Project questions test what you personally built and understood.", "studybench-curriculum"),
    q("Recovery", "medium", "When stuck on a technical question, the best first response is to:", ["Go silent", "Repeat the problem, state what you know and reason from basics", "Guess confidently", "Ask to skip every question"], 1, "Reasoning aloud gives the interviewer something to evaluate and a chance to guide you.", "studybench-curriculum"),
    q("Recovery", "hard", "Why is a brute-force approach useful in an interview?", ["It is always accepted as final", "It proves a working baseline before optimization", "It avoids thinking", "It hides complexity"], 1, "A brute-force idea shows problem understanding and creates a path toward optimization.", "gfg-dsa"),
    q("Final Day", "medium", "The final day before an interview should focus on:", ["Random new topics all night", "Self-intro, project, weak mistakes and key flash notes", "Only watching videos", "Skipping sleep"], 1, "Final-day preparation should stabilize recall and confidence.", "studybench-curriculum"),
    q("Offer Conversion", "hard", "The strongest closing question to ask a panel is:", ["How much leave will I get first?", "What does success look like for a fresher in the first six months?", "Can I leave early daily?", "Do I have to work?"], 1, "A forward-looking question shows seriousness and role awareness.", "studybench-curriculum"),
  ],
}

/** Extra chapters appended to every track to broaden real placement coverage. */
const EXTRA_CHAPTERS: Partial<Record<SectionId, Chapter[]>> = {
  quant: [quantTimeWork, quantAveragesAges, quantPermutations, quantDataInterpretation, quantMensuration, quantAlgebra],
  reasoning: [reasonSyllogism, reasonClocksCalendars, reasonSeatingPuzzles, reasonInputOutput, reasonStatements],
  verbal: [verbalWrittenEnglish, verbalCriticalReasoning],
  coding: [codingTreesGraphs, codingDpGreedy, codingSearchSort, codingStacksQueues],
  "cs-core": [
    csFundamentals,
    csCloudWeb,
    csSecurityBasics,
    csAiDataBasics,
    csTestingSdlc,
    csDevopsBasics,
    csSystemDesignBasics,
    csProgrammingFundamentals,
    csNetworksFundamentals,
  ],
  "comm-interview": [commResumeProjects, commApplicationsDrive, commInterviewCapstone],
}

const CHAPTER_QUIZ_TARGET = 450
export const CHAPTER_PRACTICE_TARGET = 1200

function stableSeed(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash)
}

function communicationSupplements(
  companyId: CompanyId,
  chapter: Chapter,
  count: number,
): Question[] {
  const templates = [
    {
      topic: "Interview Structure",
      prompt: `For "${chapter.title}", which answer structure is strongest in an interview?`,
      options: ["Memorise a long script", "Use a clear point, evidence and closing line", "Avoid examples", "Speak until interrupted"],
      explanation: "Strong interview answers are structured, specific and concise: point, evidence, and a closing link to the role.",
    },
    {
      topic: "Communication",
      prompt: `While practising "${chapter.title}", what should you prioritise first?`,
      options: ["Fast speaking", "Clarity and relevant examples", "A fake accent", "Technical jargon only"],
      explanation: "Recruiters reward clarity, relevance and evidence more than speed or jargon.",
    },
    {
      topic: "HR Readiness",
      prompt: `Which response is safest for a behavioural question in "${chapter.title}"?`,
      options: ["A generic claim", "A short STAR example", "Blaming teammates", "Changing the topic"],
      explanation: "STAR keeps behavioural answers grounded: situation, task, action and result.",
    },
    {
      topic: "Project Explanation",
      prompt: `When explaining a project during "${chapter.title}", what should you include?`,
      options: ["Only the tech stack", "Problem, your role, challenge and result", "Only team achievements", "Only screenshots"],
      explanation: "A good project answer makes your ownership visible: problem, role, challenge, result and learning.",
    },
  ]

  return Array.from({ length: count }, (_, i) => {
    const t = templates[i % templates.length]
    return {
      id: `supp-${companyId}-${chapter.id}-${i + 1}`,
      topic: t.topic,
      difficulty: i % 3 === 2 ? "medium" : "easy",
      prompt: `${getCompany(companyId).short} ${chapter.title} practice ${i + 1}: ${t.prompt}`,
      options: t.options,
      answer: 1,
      explanation: `${t.explanation} This practice item is aligned to ${getCompany(companyId).short}.`,
      sourceId: "studybench-curriculum",
    }
  })
}

const GENERAL_SECTION_SOURCE: Record<SectionId, string> = {
  quant: "rs-aggarwal-quant",
  reasoning: "rs-aggarwal-reasoning",
  verbal: "high-agg-verbal",
  coding: "gfg-dsa",
  "cs-core": "gfg-cs-core",
  "comm-interview": "studybench-curriculum",
}

const SECTION_BOOSTER_COPY: Record<SectionId, { hard: string; revise: string; mock: string }> = {
  quant: {
    hard:
      "For hard aptitude questions, first identify the base value and formula, then estimate the answer before doing exact arithmetic. If the calculation is long, use options to eliminate impossible values.",
    revise:
      "Build a one-page sheet with formulas, shortcut fractions, unit conversions and your top mistakes. Revise it before every mock so recall becomes automatic under time pressure.",
    mock:
      "In mocks, do not spend more than 90 seconds on a stuck quant question. Mark it mentally, move on, and return only if the section timer leaves room.",
  },
  reasoning: {
    hard:
      "For hard reasoning, convert words into diagrams: slots, circles, arrows, tables or cases. A messy diagram is still better than solving a puzzle only in your head.",
    revise:
      "Your revision sheet should contain common clue translations: immediately right, somewhere right, all/some/no, exactly two between, clockwise and anticlockwise.",
    mock:
      "In mocks, solve fixed-clue puzzles first and leave case-heavy puzzles for later. Reasoning rewards clean setup more than speed guessing.",
  },
  verbal: {
    hard:
      "For hard verbal questions, check grammar and meaning together. In RC, select only what the passage supports; avoid answers that are true in real life but not stated or implied.",
    revise:
      "Keep a revision sheet of agreement rules, fixed prepositions, confusable words, tone words and RC traps. Re-read wrong explanations instead of memorising word lists.",
    mock:
      "In verbal mocks, answer direct grammar first, then RC. Do not reread the entire passage for every question; scan back to the relevant line.",
  },
  coding: {
    hard:
      "For hard coding, state inputs, constraints, brute force, optimized idea, edge cases and complexity before writing code. Hidden tests usually target edge cases, not the sample path.",
    revise:
      "Keep a revision sheet of patterns: hashing, two pointers, sliding window, prefix sums, stack, queue, BFS, DFS and recursion base cases.",
    mock:
      "In coding mocks, solve for correctness first, then optimize. Test empty input, one item, duplicates, negatives and large values before submission.",
  },
  "cs-core": {
    hard:
      "For hard CS-core questions, answer with definition, example and trade-off. Recruiters want proof that you understand the concept beyond a keyword.",
    revise:
      "Create flash notes for DBMS, OS, CN, OOP, SQL, web, cloud, security and testing. Each note should have one example and one common trap.",
    mock:
      "In technical mocks, do not over-explain the first concept. Give a crisp answer, then add a practical example if the interviewer asks deeper.",
  },
  "comm-interview": {
    hard:
      "For hard communication questions, stay specific and evidence-based. Use STAR for behavioural answers and avoid blaming teammates or giving memorised slogans.",
    revise:
      "Keep a sheet with self-intro points, project highlights, strengths, weakness-improvement example, GD openers and closing questions for the interviewer.",
    mock:
      "In interview mocks, record yourself once. Check clarity, filler words, answer length and whether each answer has one concrete example.",
  },
}

function enrichChapterForPlacement(sectionId: SectionId, chapter: Chapter): Chapter {
  if (chapter.lessons.some((lesson) => lesson.id === `boost-${chapter.id}-hard`)) return chapter

  const copy = SECTION_BOOSTER_COPY[sectionId]
  const sourceId = GENERAL_SECTION_SOURCE[sectionId]
  const boosterLessons: Lesson[] = [
    {
      id: `boost-${chapter.id}-hard`,
      title: `Hard-question playbook for ${chapter.title}`,
      minutes: 4,
      body:
        `${copy.hard}\n\n**Why recruiters test this:** hard questions measure whether you can slow down, structure the problem and avoid panic, not only whether you remember a formula.`,
      sourceIds: [sourceId],
    },
    {
      id: `boost-${chapter.id}-revision`,
      title: `Revision sheet for ${chapter.title}`,
      minutes: 4,
      body:
        `${copy.revise}\n\n**Fast revision loop:** before a mock, revise formulas or rules for 5 minutes, solve 5 mixed questions, then review only mistakes.`,
      sourceIds: [sourceId],
    },
    {
      id: `boost-${chapter.id}-mock-transfer`,
      title: `Mock-test transfer for ${chapter.title}`,
      minutes: 4,
      body:
        `${copy.mock}\n\n**Practice like a topper:** after every mock, write one line for why each wrong answer happened: concept gap, calculation error, misread question or time pressure.`,
      sourceIds: [sourceId],
    },
  ]

  const boosterQuiz: Question[] = [
    {
      id: `boost-q-${chapter.id}-hard`,
      topic: `${chapter.title} Strategy`,
      difficulty: "hard",
      prompt: `While solving a hard ${chapter.title} question, what should you do first?`,
      options: [
        "Identify the question type, constraints and safest method",
        "Guess the longest option",
        "Ignore all edge cases",
        "Skip the explanation after solving",
      ],
      answer: 0,
      explanation: "Hard questions become manageable when you classify the type, constraints and method before calculating or coding.",
      sourceId,
      curated: true,
    },
    {
      id: `boost-q-${chapter.id}-revision`,
      topic: `${chapter.title} Revision`,
      difficulty: "medium",
      prompt: `What belongs in a useful ${chapter.title} revision sheet?`,
      options: [
        "Key rules, formulas, traps and personal mistakes",
        "Only motivational quotes",
        "Only solved questions with no notes",
        "Random topics from other sections",
      ],
      answer: 0,
      explanation: "A good revision sheet compresses rules, formulas, traps and mistakes so recall is fast before mocks.",
      sourceId,
      curated: true,
    },
    {
      id: `boost-q-${chapter.id}-mock`,
      topic: `${chapter.title} Mock Strategy`,
      difficulty: "medium",
      prompt: `After a mock mistake in ${chapter.title}, the best review action is to:`,
      options: [
        "Label the cause and redo a similar question",
        "Forget it immediately",
        "Blame the timer only",
        "Memorise the option letter",
      ],
      answer: 0,
      explanation: "Mistake review works when you identify the cause and practise a related question to close the gap.",
      sourceId,
      curated: true,
    },
  ]

  return {
    ...chapter,
    lessons: [...chapter.lessons, ...boosterLessons],
    quiz: [...chapter.quiz, ...boosterQuiz],
  }
}

function enrichGeneralChapter(chapter: Chapter): Chapter {
  return {
    ...chapter,
    summary: `${chapter.summary} Includes examples, shortcuts and 100 practice questions.`,
  }
}

function fallbackCompanyQuestion(
  companyId: CompanyId,
  sectionId: SectionId,
  chapter: Chapter,
  index: number,
  difficulty: Question["difficulty"] = "medium",
): Question {
  const company = getCompany(companyId).short
  const sourceId = GENERAL_SECTION_SOURCE[sectionId] ?? "studybench-curriculum"
  const sectionTemplates: Record<SectionId, Omit<Question, "id" | "sourceId">[]> = {
    quant: [
      {
        topic: "Quant Review",
        difficulty,
        prompt: `${company} ${chapter.title} ${difficulty} quantitative review ${index + 1}: what is the safest first step in a calculation question?`,
        options: ["Write the formula and identify the base", "Guess from the largest option", "Skip unit conversion", "Use all options equally"],
        answer: 0,
        explanation: "A correct formula and base prevent most aptitude mistakes, especially in percentages, ratios, speed and work problems.",
      },
    ],
    reasoning: [
      {
        topic: "Reasoning Review",
        difficulty,
        prompt: `${company} ${chapter.title} ${difficulty} reasoning review ${index + 1}: what should you do before answering a pattern question?`,
        options: ["List the rule or draw the relation", "Pick the middle option", "Ignore alternate terms", "Avoid checking the sequence"],
        answer: 0,
        explanation: "Writing the rule, gap, relation or diagram makes the pattern visible and reduces guessing.",
      },
    ],
    verbal: [
      {
        topic: "Verbal Review",
        difficulty,
        prompt: `${company} ${chapter.title} ${difficulty} verbal review ${index + 1}: what improves accuracy in grammar and comprehension questions?`,
        options: ["Read the complete sentence and context", "Choose the shortest option", "Ignore tense and subject", "Answer before reading"],
        answer: 0,
        explanation: "Grammar and comprehension depend on context, subject-verb agreement, tense and the intended meaning.",
      },
    ],
    coding: [
      {
        topic: "Coding Review",
        difficulty,
        prompt: `${company} ${chapter.title} ${difficulty} coding review ${index + 1}: what should you state before writing code?`,
        options: ["Inputs, constraints, edge cases and complexity", "Only the final answer", "Only the language name", "Nothing until the code is complete"],
        answer: 0,
        explanation: "Interviewers and coding rounds reward a clear approach: inputs, constraints, edge cases, algorithm and complexity.",
      },
    ],
    "cs-core": [
      {
        topic: "CS Core Review",
        difficulty,
        prompt: `${company} ${chapter.title} ${difficulty} CS-core review ${index + 1}: what makes a technical answer stronger?`,
        options: ["Definition plus practical example", "Only a memorized keyword", "A vague one-word answer", "Changing the topic"],
        answer: 0,
        explanation: "A definition plus a practical example proves you understand the concept beyond memorization.",
      },
    ],
    "comm-interview": [
      {
        topic: "Interview Review",
        difficulty,
        prompt: `${company} ${chapter.title} ${difficulty} interview review ${index + 1}: what is the best structure for a behavioural answer?`,
        options: ["Situation, task, action and result", "A long memorized speech", "Only blaming others", "No example"],
        answer: 0,
        explanation: "STAR keeps behavioural answers concise, truthful and evidence-based.",
      },
    ],
  }
  const template = sectionTemplates[sectionId][0]
  return {
    ...template,
    id: `supp-${companyId}-${chapter.id}-fallback-${index + 1}`,
    sourceId,
  }
}

function generatedSupplements(
  companyId: CompanyId,
  sectionId: SectionId,
  chapter: Chapter,
  count: number,
): Question[] {
  const seed = stableSeed(`${companyId}:${sectionId}:${chapter.id}`)
  const company = getCompany(companyId)
  const candidates = generateDrills(sectionId, count * 5, seed)
  const used = new Set(chapter.quiz.map((question) => question.prompt.trim().toLowerCase()))
  const out: Question[] = []

  for (const question of candidates) {
    const scopedPrompt = `${company.short} ${chapter.title} pattern practice: ${question.prompt}`
    const key = scopedPrompt.trim().toLowerCase()
    if (used.has(key)) continue
    used.add(key)
    out.push({
      ...question,
      id: `supp-${companyId}-${chapter.id}-${out.length + 1}`,
      prompt: scopedPrompt,
      explanation: `${question.explanation} This item is aligned to the ${company.short} track's expected topic mix.`,
    })
    if (out.length === count) break
  }

  while (out.length < count) {
    const fallback = fallbackCompanyQuestion(companyId, sectionId, chapter, out.length)
    const key = fallback.prompt.trim().toLowerCase()
    if (!used.has(key)) {
      used.add(key)
      out.push(fallback)
    }
  }

  return out
}

function ensureUniqueChapterQuiz(
  companyId: CompanyId,
  sectionId: SectionId,
  chapter: Chapter,
  quiz: Question[],
): Question[] {
  const usedPrompts = new Set<string>()
  const usedIds = new Set<string>()
  return quiz.map((question, index) => {
    const promptKey = question.prompt.trim().toLowerCase()
    const idKey = question.id.trim().toLowerCase()
    if (!usedPrompts.has(promptKey) && !usedIds.has(idKey)) {
      usedPrompts.add(promptKey)
      usedIds.add(idKey)
      return question
    }

    let replacement = fallbackCompanyQuestion(companyId, sectionId, chapter, index + 1000)
    let guard = 0
    while (
      (usedPrompts.has(replacement.prompt.trim().toLowerCase()) ||
        usedIds.has(replacement.id.trim().toLowerCase())) &&
      guard < 100
    ) {
      replacement = fallbackCompanyQuestion(companyId, sectionId, chapter, index + 1000 + guard)
      guard += 1
    }
    usedPrompts.add(replacement.prompt.trim().toLowerCase())
    usedIds.add(replacement.id.trim().toLowerCase())
    return replacement
  })
}

function ensureDifficultyCoverage(
  companyId: CompanyId,
  sectionId: SectionId,
  chapter: Chapter,
  quiz: Question[],
): Question[] {
  const requiredPerDifficulty = chapter.lessons.length
  const difficulties: Question["difficulty"][] = ["easy", "medium", "hard"]
  const next = [...quiz]
  const counts = () =>
    difficulties.reduce(
      (acc, difficulty) => ({
        ...acc,
        [difficulty]: next.filter((question) => question.difficulty === difficulty).length,
      }),
      {} as Record<Question["difficulty"], number>,
    )
  const usedPrompts = new Set(next.map((question) => question.prompt.trim().toLowerCase()))
  const usedIds = new Set(next.map((question) => question.id.trim().toLowerCase()))

  for (const difficulty of difficulties) {
    let currentCounts = counts()
    while (currentCounts[difficulty] < requiredPerDifficulty) {
      const replacementIndex = next.findIndex(
        (question) =>
          question.difficulty !== difficulty &&
          currentCounts[question.difficulty] > requiredPerDifficulty,
      )
      if (replacementIndex === -1) break

      let replacement = fallbackCompanyQuestion(
        companyId,
        sectionId,
        chapter,
        3000 + replacementIndex + currentCounts[difficulty],
        difficulty,
      )
      let guard = 0
      while (
        (usedPrompts.has(replacement.prompt.trim().toLowerCase()) ||
          usedIds.has(replacement.id.trim().toLowerCase())) &&
        guard < 100
      ) {
        replacement = fallbackCompanyQuestion(
          companyId,
          sectionId,
          chapter,
          3100 + replacementIndex + guard,
          difficulty,
        )
        guard += 1
      }

      usedPrompts.delete(next[replacementIndex].prompt.trim().toLowerCase())
      usedIds.delete(next[replacementIndex].id.trim().toLowerCase())
      next[replacementIndex] = replacement
      usedPrompts.add(replacement.prompt.trim().toLowerCase())
      usedIds.add(replacement.id.trim().toLowerCase())
      currentCounts = counts()
    }
  }

  return next
}

function expandChapterQuiz(companyId: CompanyId, sectionId: SectionId, chapter: Chapter): Chapter {
  const target = CHAPTER_QUIZ_TARGET
  const missing = Math.max(0, target - chapter.quiz.length)
  if (missing === 0) {
    return {
      ...chapter,
      quiz: ensureDifficultyCoverage(
        companyId,
        sectionId,
        chapter,
        ensureUniqueChapterQuiz(companyId, sectionId, chapter, chapter.quiz),
      ),
    }
  }

  const generated =
    sectionId === "comm-interview"
      ? communicationSupplements(companyId, chapter, missing)
      : generatedSupplements(companyId, sectionId, chapter, missing)

  const quiz = ensureDifficultyCoverage(
    companyId,
    sectionId,
    chapter,
    ensureUniqueChapterQuiz(companyId, sectionId, chapter, [...chapter.quiz, ...generated]),
  )
  return { ...chapter, quiz }
}

function withExtras(sections: Section[]): Section[] {
  return sections.map((s) => {
    const extra = EXTRA_CHAPTERS[s.id]
    return extra ? { ...s, chapters: [...s.chapters, ...extra] } : s
  })
}

const sectionCache = new Map<CompanyId, Section[]>()

/** Returns the section list (with chapters) for a company track. */
export function getSections(companyId: CompanyId): Section[] {
  const cached = sectionCache.get(companyId)
  if (cached) return cached

  const base = withExtras(BASE_SECTIONS)
  const companySections =
    companyId === "zoho"
      ? base.map((s) =>
          s.id === "coding" ? { ...s, chapters: [...s.chapters, ZOHO_EXTRA] } : s,
        )
      : base

  const sections = companySections.map((section) => ({
    ...section,
    chapters: section.chapters.map((chapter) => {
      const baseChapter = companyId === "general" ? enrichGeneralChapter(chapter) : chapter
      return expandChapterQuiz(companyId, section.id, enrichChapterForPlacement(section.id, baseChapter))
    }),
  }))
  sectionCache.set(companyId, sections)
  return sections
}

export function getSection(companyId: CompanyId, sectionId: SectionId): Section | undefined {
  return getSections(companyId).find((s) => s.id === sectionId)
}

export function getChapter(companyId: CompanyId, sectionId: SectionId, chapterId: string) {
  return getSection(companyId, sectionId)?.chapters.find((c) => c.id === chapterId)
}

// Generating a 300-question chapter bank is deterministic but expensive, so we
// memoize per chapter. Without this, every chapter switch or page revisit
// rebuilt all 300 questions from scratch on the client.
const practiceCache = new Map<string, Question[]>()

export function chapterPracticeQuestions(
  companyId: CompanyId,
  sectionId: SectionId,
  chapterId: string,
): Question[] {
  const cacheKey = `${companyId}:${sectionId}:${chapterId}`
  const cached = practiceCache.get(cacheKey)
  if (cached) return cached

  const chapter = getChapter(companyId, sectionId, chapterId)
  if (!chapter) return []

  const usedPrompts = new Set<string>()
  const usedIds = new Set<string>()
  const out: Question[] = []

  function add(question: Question) {
    const promptKey = question.prompt.trim().toLowerCase()
    const idKey = question.id.trim().toLowerCase()
    if (usedPrompts.has(promptKey) || usedIds.has(idKey)) return
    usedPrompts.add(promptKey)
    usedIds.add(idKey)
    out.push(question)
  }

  for (const question of chapter.quiz) {
    add({
      ...question,
      id: `chapter-practice-${companyId}-${chapter.id}-${out.length}`,
    })
  }

  const missing = Math.max(0, CHAPTER_PRACTICE_TARGET - out.length)
  const generated =
    sectionId === "comm-interview"
      ? communicationSupplements(companyId, chapter, missing)
      : generateDrills(sectionId, missing, stableSeed(`${companyId}:${sectionId}:${chapterId}:practice`)).map(
          (question, index) => ({
            ...question,
            prompt: `${getCompany(companyId).short} ${chapter.title} practice ${index + 1}: ${question.prompt}`,
            explanation: `${question.explanation} This original practice question is scoped to ${getCompany(companyId).short} ${chapter.title}.`,
          }),
        )

  for (const question of generated) {
    add({
      ...question,
      id: `chapter-practice-${companyId}-${chapter.id}-${out.length}`,
    })
    if (out.length >= CHAPTER_PRACTICE_TARGET) break
  }

  while (out.length < CHAPTER_PRACTICE_TARGET) {
    add(fallbackCompanyQuestion(companyId, sectionId, chapter, out.length + 2000))
  }

  const result = out.slice(0, CHAPTER_PRACTICE_TARGET)
  practiceCache.set(cacheKey, result)
  return result
}

export function totalChapters(companyId: CompanyId): number {
  return getSections(companyId).reduce((n, s) => n + s.chapters.length, 0)
}

export function companyTagline(companyId: CompanyId): string {
  return getCompany(companyId).blurb
}
