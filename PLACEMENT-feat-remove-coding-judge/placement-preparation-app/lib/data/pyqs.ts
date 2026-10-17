import type { CompanyId, Question, SectionId } from "@/lib/types"
import { generateDrills, generateDrillsByDifficulty, todaySeed } from "@/lib/data/question-bank"
import { createStableIdFactory, idKey } from "@/lib/data/stable-id"

/**
 * Previous-Year-Question bank. These are ORIGINAL reconstructions in
 * the style/pattern of each company's test - never verbatim copies of any real or
 * proprietary paper. `year` marks the pattern era, not a leaked paper.
 */
export interface PYQ extends Question {
  section: SectionId
  year: number
  frequentlyAsked: boolean
  /**
   * The OFFICIAL source whose published TEST PATTERN this question is modeled on.
   * Distinct from `sourceId` (the content author). The question text itself is
   * always original StudyBench content - never copied from the company.
   */
  patternSourceId?: string
}

const nextPyqId = createStableIdFactory("pyq")
export function p(
  company: CompanyId,
  section: SectionId,
  topic: string,
  year: number,
  frequentlyAsked: boolean,
  difficulty: Question["difficulty"],
  prompt: string,
  options: string[],
  answer: number,
  explanation: string,
): PYQ & { company: CompanyId } {
  // Content-derived stable id (see lib/data/stable-id.ts): adding or moving a
  // hand-authored PYQ no longer renumbers every question after it.
  const id = nextPyqId(idKey(company, section, prompt, options.join("|")))
  return {
    id,
    company,
    section,
    topic,
    year,
    frequentlyAsked,
    difficulty,
    prompt,
    options,
    answer,
    explanation,
    sourceId: "studybench-curriculum",
    // Hand-authored, pattern-reviewed reconstructions â€” the curated/flagship layer
    // (distinct from the parametric generator volume used to top up sets).
    curated: true,
  }
}

/**
 * Flagship authoring helper â€” like p() but carries `optionNotes`: a rationale
 * for every option (why it's right or why the distractor is tempting). This is
 * the deepest expert-authoring tier; the quiz runner renders the notes on
 * reveal. optionNotes MUST be parallel to options (same length).
 */
const nextFlagshipId = createStableIdFactory("flag")
export function pf(
  company: CompanyId,
  section: SectionId,
  topic: string,
  difficulty: Question["difficulty"],
  prompt: string,
  options: string[],
  answer: number,
  explanation: string,
  optionNotes: string[],
): PYQ & { company: CompanyId } {
  if (optionNotes.length !== options.length) {
    throw new Error(`flagship ${topic}: optionNotes must be parallel to options`)
  }
  return {
    id: nextFlagshipId(idKey(company, section, prompt, options.join("|"))),
    company,
    section,
    topic,
    year: 2026,
    frequentlyAsked: true,
    difficulty,
    prompt,
    options,
    answer,
    explanation,
    optionNotes,
    sourceId: "studybench-curriculum",
    curated: true,
  }
}

/**
 * Hand-authored flagship bank â€” original, deeply explained questions with
 * per-option rationale. Small by design and grown by hand; this is the quality
 * benchmark the generated volume tops up around, never a substitute for it.
 */
export const FLAGSHIP_PYQS: (PYQ & { company: CompanyId })[] = [
  pf(
    "general",
    "quant",
    "Percentages",
    "medium",
    "A price is increased by 25% and then the new price is decreased by 20%. The net change from the original price is:",
    ["No change", "5% increase", "5% decrease", "45% increase"],
    0,
    "Take Rs 100. After +25% it is Rs 125; a 20% cut of 125 is 25, back to Rs 100. The successive-change formula a+b+ab/100 = 25-20-500/100 = 0 confirms it.",
    [
      "Correct â€” the 20% cut is taken on the larger Rs 125, so it removes exactly the 25 that was added.",
      "Tempting if you assume the percentages partly cancel to leave a small gain, but they cancel exactly here.",
      "This is the classic trap: 25-20 = 5 done on the same base. The base changes between the two steps, so you cannot just subtract.",
      "This adds the percentages (25+20). Successive changes multiply, they do not add.",
    ],
  ),
  pf(
    "general",
    "quant",
    "Averages",
    "medium",
    "The average of 10 numbers is 15. If one number 8 is removed, the average of the remaining 9 numbers is:",
    ["15", "15.78", "16.33", "7"],
    1,
    "Total = 10 x 15 = 150. Remove 8 -> 142 over 9 numbers = 15.78.",
    [
      "The average only stays 15 if you remove a value equal to the current average (15), not 8.",
      "Correct â€” removing a below-average value (8 < 15) pulls the average up: 142/9 = 15.78.",
      "Too high. You would reach ~16.33 only if you removed a much smaller number; recompute 142/9.",
      "This is the removed number's relation to nothing meaningful â€” the new average is a property of the remaining 9, not of 8 itself.",
    ],
  ),
  pf(
    "general",
    "quant",
    "Probability",
    "hard",
    "Two fair dice are rolled. Given that the sum is 8, what is the probability that one of the dice shows a 5?",
    ["1/6", "2/5", "1/3", "2/9"],
    1,
    "Conditional probability: outcomes with sum 8 are (2,6),(3,5),(4,4),(5,3),(6,2) = 5 cases. Those containing a 5 are (3,5) and (5,3) = 2 cases. So 2/5.",
    [
      "1/6 is the unconditional chance of a single die being 5; the question restricts us to sum-8 outcomes, so the sample space shrinks.",
      "Correct â€” restrict to the 5 ordered outcomes summing to 8, of which 2 contain a 5: 2/5.",
      "1/3 assumes 6 outcomes for sum 8; there are only 5 ordered pairs (4,4) is a single ordered outcome).",
      "2/9 uses 9 as the denominator, which does not match the 5 conditioning outcomes.",
    ],
  ),
  pf(
    "general",
    "reasoning",
    "Blood Relations",
    "medium",
    "Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?",
    ["Mother", "Sister", "Aunt", "Grandmother"],
    0,
    "'The only daughter of my mother' is the woman herself. So the man's mother is the woman -> she is his mother.",
    [
      "Correct â€” 'the only daughter of my mother' can only be the speaker, so the man's mother is the woman.",
      "Sister would require the man's mother to be the woman's mother, but the clue points to the woman herself.",
      "Aunt would need the man's mother to be the woman's sibling; the clue says daughter, identifying the speaker.",
      "Grandmother skips a generation the clue does not support.",
    ],
  ),
  pf(
    "general",
    "reasoning",
    "Direction Sense",
    "medium",
    "A person walks 4 km North, turns right and walks 3 km, then turns right and walks 4 km. How far is she from the start, and in which direction?",
    ["3 km East", "5 km North-East", "3 km West", "7 km South"],
    0,
    "North 4, East 3, South 4 cancels the North-South leg, leaving 3 km East of start.",
    [
      "Correct â€” the 4 km North and 4 km South cancel; only the 3 km East leg remains.",
      "5 km is the straight-line distance only if the vertical legs did not cancel; here they do, so it is a pure 3 km East.",
      "Direction is right: she ends East, not West â€” track the two right turns from North -> East -> South.",
      "She never nets any Southward distance; the South leg only undoes the North leg.",
    ],
  ),
  pf(
    "general",
    "reasoning",
    "Syllogisms",
    "hard",
    "Statements: All pens are books. Some books are red. Conclusions: I) Some pens are red. II) Some books are pens. Which follow?",
    ["Only I", "Only II", "Both I and II", "Neither"],
    1,
    "'All pens are books' guarantees some books are pens (conversion) -> II follows. 'Some books are red' does not pin the red books to the pen subset, so I is only possible, not certain.",
    [
      "I does not follow: the red books need not overlap with the pens, so 'some pens are red' is not guaranteed.",
      "Correct â€” only II follows. 'All pens are books' converts to 'some books are pens'; the red overlap is unproven.",
      "Both cannot follow because conclusion I is merely possible, not certain.",
      "Neither is wrong because II is a valid conversion of a universal affirmative.",
    ],
  ),
  pf(
    "general",
    "verbal",
    "Reading Inference",
    "medium",
    "'The new policy reduced delays, though commuters still grumbled about fares.' Which is best inferred?",
    [
      "The policy failed to improve punctuality",
      "Punctuality improved but fare concerns remained",
      "Fares were reduced by the policy",
      "Commuters were satisfied overall",
    ],
    1,
    "'Reduced delays' = punctuality improved; 'still grumbled about fares' = the fare grievance persisted. The sentence pairs an improvement with a remaining complaint.",
    [
      "Contradicts 'reduced delays' â€” punctuality did improve.",
      "Correct â€” it captures both halves: delays fell, fare complaints stayed.",
      "Nothing says fares were reduced; commuters grumbled about them, implying the opposite.",
      "'Still grumbled' signals lingering dissatisfaction, not overall satisfaction.",
    ],
  ),
  pf(
    "general",
    "verbal",
    "Sentence Correction",
    "medium",
    "Choose the grammatically correct sentence:",
    [
      "Neither the manager nor the employees was informed.",
      "Neither the manager nor the employees were informed.",
      "Neither the manager nor the employees is informed.",
      "Neither the manager or the employees were informed.",
    ],
    1,
    "With 'neither...nor', the verb agrees with the nearer subject ('employees', plural) -> 'were'. The correlative pair is 'neither...nor', never 'neither...or'.",
    [
      "'was' is singular but the nearer subject 'employees' is plural â€” agreement fails.",
      "Correct â€” proximity rule: the verb matches 'employees' (plural), so 'were'.",
      "'is' is singular and also wrong tense-agreement with the plural nearer subject.",
      "'neither...or' is not a valid correlative; it must be 'neither...nor'.",
    ],
  ),
  pf(
    "general",
    "cs-core",
    "Data Structures",
    "medium",
    "Which data structure gives O(1) average-time insertion, deletion, and lookup by key?",
    ["Balanced BST", "Hash table", "Sorted array", "Singly linked list"],
    1,
    "A hash table offers O(1) average for insert/delete/lookup by key (assuming good hashing); the others are O(log n) or O(n) for at least one of these.",
    [
      "A balanced BST is O(log n), not O(1), for these operations â€” it keeps order, which a hash table does not.",
      "Correct â€” hashing gives O(1) average insert/delete/lookup, trading away ordering.",
      "A sorted array is O(log n) to find but O(n) to insert/delete because elements must shift.",
      "A singly linked list is O(n) to look up by key â€” there is no index into it.",
    ],
  ),
  pf(
    "general",
    "cs-core",
    "DBMS",
    "hard",
    "A transaction reads a row, another transaction updates and commits that row, and the first transaction reads it again and sees a different value. This anomaly is:",
    ["Dirty read", "Non-repeatable read", "Phantom read", "Lost update"],
    1,
    "Re-reading the same row and getting a different committed value is a non-repeatable read. A dirty read involves uncommitted data; a phantom read is about new rows matching a query, not a changed existing row.",
    [
      "A dirty read is reading uncommitted data; here the second transaction committed before the re-read.",
      "Correct â€” same row, two reads, different committed values is the definition of a non-repeatable read.",
      "A phantom read concerns new/removed rows matching a range query, not a single row's changed value.",
      "A lost update is when two writes clobber each other; this scenario involves reads, not a clobbered write.",
    ],
  ),
  pf(
    "general",
    "quant",
    "Time, Speed & Distance",
    "hard",
    "A train 200 m long crosses a 300 m platform in 25 seconds. Its speed is:",
    ["20 m/s", "12 m/s", "8 m/s", "72 m/s"],
    0,
    "To cross a platform the train covers its own length + platform = 200 + 300 = 500 m in 25 s -> 20 m/s (= 72 km/h).",
    [
      "Correct â€” distance is length + platform = 500 m over 25 s = 20 m/s.",
      "12 m/s uses only the platform (300/25) and forgets the train's own length.",
      "8 m/s uses only the train length (200/25); crossing requires both lengths.",
      "72 is the speed in km/h (20 m/s x 3.6), not m/s â€” watch the unit asked.",
    ],
  ),
  pf(
    "general",
    "coding",
    "Complexity",
    "medium",
    "What is the time complexity of finding an element in a balanced binary search tree of n nodes?",
    ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    1,
    "A balanced BST has height ~log2(n), and search follows one root-to-leaf path, so it is O(log n).",
    [
      "O(1) would require direct indexing (like a hash/array), not a comparison-based descent.",
      "Correct â€” search walks one path of height log n in a balanced tree.",
      "O(n) is the worst case for a degenerate (unbalanced) tree; 'balanced' rules that out.",
      "O(n log n) is a sorting-style cost, not a single lookup.",
    ],
  ),
]

export const PYQS: (PYQ & { company: CompanyId })[] = [
  // ===================== TCS =====================
  p("tcs", "quant", "Profit & Loss", 2024, true, "medium", "A shopkeeper sells an item at 20% profit. If the cost price is Rs 450, the selling price is:", ["Rs 520", "Rs 540", "Rs 560", "Rs 500"], 1, "SP = 450 x 1.20 = Rs 540."),
  p("tcs", "quant", "Number System", 2023, true, "medium", "The remainder when 7^100 is divided by 5 is:", ["1", "2", "3", "4"], 0, "7 is congruent to 2 (mod 5); powers of 2 mod 5 cycle 2,4,3,1 with period 4. 100 mod 4 = 0 -> last in cycle = 1."),
  p("tcs", "quant", "Time & Work", 2024, true, "medium", "A alone finishes a task in 12 days, B alone in 24 days. Together they finish in:", ["6 days", "8 days", "9 days", "16 days"], 1, "1/12 + 1/24 = 3/24 = 1/8 per day -> 8 days."),
  p("tcs", "reasoning", "Series", 2024, true, "easy", "Find the odd one out: 4, 9, 16, 25, 35", ["9", "16", "25", "35"], 3, "4,9,16,25 are perfect squares (2^2,3^2,4^2,5^2); 35 is not."),
  p("tcs", "reasoning", "Classification", 2023, false, "easy", "Find the odd one out: 3, 5, 9, 11", ["3", "5", "9", "11"], 2, "3, 5, 11 are prime; 9 = 3x3 is composite."),
  p("tcs", "verbal", "Vocabulary", 2024, false, "easy", "Choose the synonym of 'Abundant':", ["Scarce", "Plentiful", "Empty", "Rare"], 1, "'Abundant' means existing in large quantity - plentiful."),
  p("tcs", "coding", "C Output", 2023, false, "medium", "In C, what is the value of 5 & 3 (bitwise AND)?", ["1", "7", "8", "15"], 0, "0101 & 0011 = 0001 = 1."),
  p("tcs", "coding", "C Output", 2024, true, "easy", "In C, printf(\"%d\", 10 / 3) prints:", ["3", "3.33", "4", "0"], 0, "Integer division truncates -> 3."),

  // ===================== Infosys =====================
  p("infosys", "quant", "Time & Work", 2024, true, "medium", "A can do a job in 10 days, B in 15 days. Together they finish in:", ["5 days", "6 days", "7.5 days", "12.5 days"], 1, "Rates 1/10 + 1/15 = 1/6 per day -> 6 days."),
  p("infosys", "quant", "Percentages", 2023, true, "medium", "20% of 20% of 500 is:", ["20", "40", "50", "100"], 0, "0.2 x 0.2 x 500 = 20."),
  p("infosys", "reasoning", "Syllogism", 2023, true, "medium", "All cats are animals. Some animals are wild. Conclusion: Some cats are wild?", ["Follows", "Does not follow", "Definitely true", "Always"], 1, "'Some animals are wild' does not force any cat to be wild - it does not follow."),
  p("infosys", "reasoning", "Series", 2024, false, "easy", "Find the next term: 2, 4, 8, 16, ?", ["24", "32", "30", "20"], 1, "Each term doubles -> 16 x 2 = 32."),
  p("infosys", "verbal", "Sentence correction", 2024, false, "easy", "Choose the correct form: 'She is good ___ mathematics.'", ["in", "at", "on", "with"], 1, "The idiom is 'good at' a subject/skill."),
  p("infosys", "coding", "Pseudocode", 2024, true, "medium", "for i in 1..3: for j in 1..3: print('*') - how many stars are printed?", ["6", "9", "3", "12"], 1, "3 outer x 3 inner = 9 stars."),

  // ===================== Wipro =====================
  p("wipro", "quant", "Averages", 2024, true, "easy", "The average of 5 consecutive integers starting from 8 is:", ["9", "10", "11", "12"], 1, "8,9,10,11,12 -> average is the middle term, 10."),
  p("wipro", "quant", "Simple Interest", 2023, true, "medium", "SI on Rs 2000 at 5% per annum for 2 years is:", ["Rs 100", "Rs 200", "Rs 250", "Rs 400"], 1, "SI = 2000 x 5 x 2 / 100 = Rs 200."),
  p("wipro", "verbal", "Vocabulary", 2023, true, "medium", "Pick the word closest in meaning to 'Concise':", ["Lengthy", "Brief", "Vague", "Complex"], 1, "'Concise' means brief and to the point."),
  p("wipro", "verbal", "Antonyms", 2024, false, "easy", "Choose the antonym of 'Ancient':", ["Old", "Modern", "Historic", "Aged"], 1, "'Ancient' (very old) is the opposite of 'modern'."),
  p("wipro", "reasoning", "Blood Relations", 2024, false, "easy", "A is the father of B. How is B related to A?", ["Father", "Son or daughter", "Brother", "Uncle"], 1, "B is A's child - son or daughter."),
  p("wipro", "coding", "Loops", 2024, false, "medium", "How many times does this loop print? for(i=1;i<=10;i+=2) print(i)", ["10", "5", "4", "6"], 1, "i = 1,3,5,7,9 -> 5 times."),

  // ===================== Accenture =====================
  p("accenture", "reasoning", "Coding-Decoding", 2024, true, "medium", "If CAT = 24 (C=3,A=1,T=20 -> sum), then DOG = ?", ["26", "23", "22", "20"], 0, "D=4,O=15,G=7 -> 4+15+7 = 26."),
  p("accenture", "reasoning", "Classification", 2023, false, "easy", "Find the odd one out: Apple, Mango, Rose, Banana", ["Apple", "Mango", "Rose", "Banana"], 2, "Apple, Mango, Banana are fruits; Rose is a flower."),
  p("accenture", "quant", "Percentages", 2023, true, "easy", "What is 15% of 200?", ["25", "30", "35", "20"], 1, "0.15 x 200 = 30."),
  p("accenture", "quant", "Ratio", 2024, false, "easy", "If 3 pens cost Rs 45, then 7 pens cost:", ["Rs 90", "Rs 105", "Rs 120", "Rs 100"], 1, "One pen = Rs 15; 7 x 15 = Rs 105."),
  p("accenture", "cs-core", "Fundamentals", 2024, false, "easy", "Which data structure uses FIFO order?", ["Stack", "Queue", "Tree", "Graph"], 1, "A queue is First-In-First-Out (FIFO)."),
  p("accenture", "cs-core", "Data Structures", 2023, true, "medium", "Which of these is a non-linear data structure?", ["Array", "Stack", "Queue", "Tree"], 3, "A tree is non-linear; the others store data linearly."),

  // ===================== Zoho =====================
  p("zoho", "coding", "Logic", 2024, true, "hard", "What is printed? a=5; b=a++; print(a, b)", ["5 5", "6 5", "6 6", "5 6"], 1, "b takes the old value 5, then a increments to 6 -> prints 6 5."),
  p("zoho", "coding", "Arrays", 2023, true, "hard", "Minimum swaps to sort [4,3,2,1] (reverse) by swapping any two elements is:", ["1", "2", "3", "4"], 1, "Swap (4,1) -> [1,3,2,4], swap (3,2) -> [1,2,3,4]. 2 swaps."),
  p("zoho", "coding", "Strings", 2024, false, "medium", "Number of vowels in 'PLACEMENT' is:", ["2", "3", "4", "5"], 1, "A, E, E -> 3 vowels."),
  p("zoho", "coding", "C Output", 2024, true, "hard", "What prints? for(i=0;i<3;i++); printf(\"%d\", i)", ["2", "3", "0", "1"], 1, "The ';' makes the loop body empty; it runs until i=3, then prints 3."),
  p("zoho", "coding", "Logic", 2023, true, "medium", "The integer reversal of 1234 is:", ["4321", "1234", "3214", "4231"], 0, "Reverse the digits -> 4321."),
  p("zoho", "coding", "Loops", 2024, false, "medium", "Times 'Hi' is printed: for(i=0;i<5;i++) for(j=0;j<2;j++) print('Hi')", ["5", "7", "10", "2"], 2, "5 x 2 = 10 times."),

  // ===================== Cognizant =====================
  p("cognizant", "quant", "Ratio", 2024, true, "easy", "If a:b = 2:3 and b:c = 4:5, then a:c =", ["8:15", "2:5", "8:5", "4:5"], 0, "Make b common: a:b = 8:12, b:c = 12:15 -> a:c = 8:15."),
  p("cognizant", "quant", "Averages", 2023, false, "easy", "The average of the first 5 natural numbers (1-5) is:", ["2.5", "3", "3.5", "15"], 1, "(1+2+3+4+5)/5 = 15/5 = 3."),
  p("cognizant", "reasoning", "Direction", 2023, true, "medium", "Facing North, you turn right, then right again. You now face:", ["East", "West", "South", "North"], 2, "North -> right = East -> right = South."),
  p("cognizant", "verbal", "Spelling", 2024, true, "easy", "Which of these spellings is correct?", ["Acommodation", "Accomodation", "Accommodation", "Accommadation"], 2, "'Accommodation' - double c and double m."),
  p("cognizant", "verbal", "Grammar", 2024, false, "easy", "Identify the error: 'He don't like coffee.'", ["He", "don't", "like", "coffee"], 1, "Third person singular needs 'doesn't', not 'don't'."),
  p("cognizant", "coding", "Data Structures", 2023, false, "medium", "FILO (First-In-Last-Out) order is followed by a:", ["Queue", "Stack", "Array", "Tree"], 1, "A stack is LIFO/FILO - the first element in is the last out."),

  // ===================== Core prep =====================
  p("general", "quant", "Percentages", 2024, true, "easy", "What is 50% of 80?", ["30", "40", "50", "160"], 1, "Half of 80 = 40."),
  p("general", "quant", "Basic Algebra", 2024, false, "easy", "If 2x = 10, then x =", ["5", "2", "20", "8"], 0, "x = 10 / 2 = 5."),
  p("general", "reasoning", "Series", 2024, true, "easy", "Find the next term: 1, 2, 3, 5, 8, ?", ["11", "13", "12", "10"], 1, "Fibonacci - each term is the sum of the previous two: 5 + 8 = 13."),
  p("general", "reasoning", "Direction", 2023, false, "easy", "Facing East, you turn left. You now face:", ["North", "South", "West", "East"], 0, "A left (anticlockwise) turn from East faces North."),
  p("general", "verbal", "Vocabulary", 2024, true, "easy", "Choose the synonym of 'Happy':", ["Sad", "Joyful", "Angry", "Tired"], 1, "'Happy' means feeling pleasure - joyful."),
  p("general", "coding", "Data Structures", 2024, true, "easy", "Which data structure follows FIFO order?", ["Stack", "Queue", "Tree", "Graph"], 1, "A queue is First-In-First-Out."),
  p("general", "coding", "Number Systems", 2023, false, "medium", "The binary representation of 5 is:", ["100", "101", "110", "111"], 1, "5 = 4 + 1 = 101 in binary."),
  p("general", "cs-core", "Fundamentals", 2024, false, "easy", "RAM is best described as:", ["Permanent storage", "Volatile memory", "A hard disk", "A network device"], 1, "RAM is volatile - its contents are lost when power is off."),

  // ===================== Additional set =====================
  // TCS
  p("tcs", "quant", "Trains", 2024, false, "medium", "A 100 m train crosses a 150 m platform in 10 s. Its speed is:", ["72 km/h", "90 km/h", "25 km/h", "100 km/h"], 1, "Distance = 250 m in 10 s = 25 m/s = 25 x 18/5 = 90 km/h."),
  p("tcs", "reasoning", "Classification", 2023, false, "easy", "Find the odd one out: 11, 13, 15, 17", ["11", "13", "15", "17"], 2, "11, 13, 17 are prime; 15 = 3 x 5 is composite."),
  p("tcs", "verbal", "Antonyms", 2024, false, "easy", "Choose the antonym of 'Victory':", ["Win", "Defeat", "Success", "Triumph"], 1, "'Victory' is the opposite of 'defeat'."),
  // Infosys
  p("infosys", "quant", "Simple Interest", 2024, false, "medium", "At simple interest, a sum doubles in 5 years. The annual rate is:", ["10%", "20%", "15%", "25%"], 1, "Interest equals the principal in 5 years -> R x 5/100 = 1 -> R = 20%."),
  p("infosys", "coding", "Pseudocode", 2024, false, "easy", "x = 4; x = x * x; print(x). Output:", ["8", "16", "4", "12"], 1, "4 x 4 = 16."),
  // Wipro
  p("wipro", "reasoning", "Series", 2024, false, "easy", "Find the next term: 7, 14, 28, 56, ?", ["98", "112", "84", "110"], 1, "Each term doubles -> 56 x 2 = 112."),
  p("wipro", "verbal", "Synonyms", 2024, false, "easy", "Choose the synonym of 'Rapid':", ["Slow", "Quick", "Late", "Calm"], 1, "'Rapid' means fast - quick."),
  // Accenture
  p("accenture", "quant", "Averages", 2024, false, "easy", "The average of 10, 20, 30, 40 and 50 is:", ["25", "30", "35", "40"], 1, "(10+20+30+40+50)/5 = 150/5 = 30."),
  p("accenture", "cs-core", "DBMS", 2024, false, "medium", "A primary key must be:", ["Allowed to be null", "Unique and not null", "Always text", "Duplicated"], 1, "A primary key uniquely identifies a row and cannot be null."),
  // Zoho
  p("zoho", "coding", "Logic", 2024, false, "easy", "i = 10; print(i++). What is printed?", ["10", "11", "9", "0"], 0, "Post-increment prints the old value 10, then i becomes 11."),
  p("zoho", "coding", "Math", 2023, false, "easy", "What is 2 to the power 3?", ["6", "8", "9", "5"], 1, "2 x 2 x 2 = 8."),
  // Cognizant
  p("cognizant", "quant", "Time & Work", 2024, false, "medium", "If 5 workers build a wall in 8 days, 10 workers (same rate) take:", ["16 days", "4 days", "8 days", "2 days"], 1, "Work = 40 worker-days; 40 / 10 = 4 days."),
  p("cognizant", "reasoning", "Series", 2024, false, "medium", "Find the next term: Z, X, V, T, ?", ["S", "R", "Q", "U"], 1, "Letters drop by 2: Z, X, V, T, R."),
  // General
  p("general", "quant", "Percentages", 2024, false, "easy", "What is 10% of 250?", ["25", "20", "30", "2.5"], 0, "10% of 250 = 25."),
  p("general", "reasoning", "Classification", 2024, false, "easy", "Find the odd one out: Dog, Cat, Lion, Rose", ["Dog", "Cat", "Lion", "Rose"], 3, "Dog, Cat and Lion are animals; Rose is a flower."),

  // ===================== Expanded bank (set 3) =====================
  // TCS
  p("tcs", "quant", "Ratio", 2024, false, "easy", "Two numbers are in the ratio 3:4 and their sum is 70. The larger number is:", ["30", "40", "35", "42"], 1, "Larger = 4/7 x 70 = 40."),
  p("tcs", "quant", "Percentages", 2023, true, "medium", "A price rises from Rs 80 to Rs 100. The percentage increase is:", ["20%", "25%", "18%", "22%"], 1, "Increase = (100 - 80)/80 x 100 = 25%."),
  p("tcs", "quant", "HCF-LCM", 2024, false, "easy", "The LCM of 6 and 8 is:", ["12", "24", "48", "16"], 1, "6 = 2 x 3, 8 = 2^3 -> LCM = 2^3 x 3 = 24."),
  p("tcs", "quant", "Profit & Loss", 2023, true, "medium", "An item costs Rs 250 and sells for Rs 300. The profit percentage is:", ["10%", "20%", "25%", "15%"], 1, "Profit = 50 on CP 250 -> 50/250 x 100 = 20%."),
  p("tcs", "reasoning", "Series", 2024, false, "easy", "Find the next term: 5, 10, 20, 40, ?", ["60", "80", "100", "50"], 1, "Each term doubles -> 40 x 2 = 80."),
  p("tcs", "reasoning", "Analogy", 2023, false, "easy", "Cat : Kitten :: Dog : ?", ["Cub", "Puppy", "Calf", "Foal"], 1, "A young dog is a puppy."),
  p("tcs", "verbal", "Synonyms", 2024, false, "easy", "Choose the synonym of 'Eager':", ["Reluctant", "Keen", "Bored", "Tired"], 1, "'Eager' means keen and enthusiastic."),
  p("tcs", "verbal", "Antonyms", 2023, false, "easy", "Choose the antonym of 'Expand':", ["Grow", "Contract", "Stretch", "Widen"], 1, "'Expand' (grow larger) is the opposite of 'contract'."),
  p("tcs", "coding", "C Output", 2024, true, "medium", "In C, what is printf(\"%d\", 10 % 3)?", ["1", "3", "0", "10"], 0, "10 modulo 3 leaves remainder 1."),
  p("tcs", "coding", "C Basics", 2023, false, "easy", "In C, sizeof(char) is:", ["1", "2", "4", "8"], 0, "A char is 1 byte by definition in C."),

  // Infosys
  p("infosys", "quant", "Percentages", 2024, false, "medium", "30% of 30% of 1000 is:", ["90", "100", "300", "9"], 0, "0.3 x 0.3 x 1000 = 90."),
  p("infosys", "quant", "Time & Work", 2023, true, "medium", "A finishes a job in 6 days, B in 12 days. Together they finish in:", ["3 days", "4 days", "8 days", "9 days"], 1, "1/6 + 1/12 = 1/4 per day -> 4 days."),
  p("infosys", "quant", "Averages", 2024, false, "easy", "The average of 2, 4, 6, 8 and 10 is:", ["5", "6", "7", "30"], 1, "Sum 30 / 5 = 6."),
  p("infosys", "reasoning", "Syllogism", 2024, true, "medium", "All A are B. All B are C. Conclusion: All A are C?", ["Follows", "Does not follow", "Cannot say", "Partially"], 0, "A  is a subset of  B  is a subset of  C, so all A are C - it follows."),
  p("infosys", "reasoning", "Series", 2023, false, "easy", "Find the next term: 1, 4, 9, 16, 25, ?", ["30", "36", "49", "35"], 1, "Perfect squares; next is 6^2 = 36."),
  p("infosys", "verbal", "Grammar", 2024, true, "easy", "Choose the correct form: 'Each student ___ a book.'", ["have", "has", "have had", "are"], 1, "'Each' is singular and takes 'has'."),
  p("infosys", "coding", "Pseudocode", 2024, true, "medium", "x = 5; while (x > 0) { x = x - 2 } - the final value of x is:", ["0", "-1", "1", "5"], 1, "5 -> 3 -> 1 -> -1, then the loop stops. Final x = -1."),
  p("infosys", "coding", "Pseudocode", 2023, false, "easy", "sum = 0; for i in 1..5: sum = sum + i. Final sum:", ["10", "15", "12", "20"], 1, "1+2+3+4+5 = 15."),

  // Wipro
  p("wipro", "quant", "Simple Interest", 2024, false, "medium", "SI on Rs 1000 at 10% per annum for 2 years is:", ["Rs 100", "Rs 200", "Rs 210", "Rs 150"], 1, "SI = 1000 x 10 x 2 / 100 = Rs 200."),
  p("wipro", "quant", "Averages", 2023, false, "easy", "The average of the first 5 even numbers (2,4,6,8,10) is:", ["5", "6", "7", "30"], 1, "Sum 30 / 5 = 6."),
  p("wipro", "verbal", "Synonyms", 2024, false, "easy", "Choose the synonym of 'Brave':", ["Cowardly", "Courageous", "Weak", "Timid"], 1, "'Brave' means courageous."),
  p("wipro", "verbal", "Spelling", 2023, true, "easy", "Pick the correctly spelt word:", ["Neccessary", "Necessary", "Necesary", "Neccesary"], 1, "'Necessary' - one c, two s."),
  p("wipro", "reasoning", "Direction", 2024, false, "easy", "Facing South, you turn left. You now face:", ["East", "West", "North", "South"], 0, "Facing south, your left side is east; turning left faces East."),
  p("wipro", "coding", "Loops", 2023, false, "easy", "How many times does this print? for(i=0;i<5;i++) print(i)", ["4", "5", "6", "10"], 1, "i = 0,1,2,3,4 -> 5 times."),

  // Accenture
  p("accenture", "quant", "Percentages", 2024, false, "easy", "25% of 80 is:", ["15", "20", "25", "40"], 1, "0.25 x 80 = 20."),
  p("accenture", "reasoning", "Coding-Decoding", 2023, false, "easy", "If A=1 ... Z=26, the value of 'AB' (A+B) is:", ["2", "3", "4", "5"], 1, "A=1, B=2 -> 1 + 2 = 3."),
  p("accenture", "cs-core", "Data Structures", 2024, false, "easy", "Which of these is a linear data structure?", ["Tree", "Graph", "Array", "Heap"], 2, "An array stores elements linearly; trees, graphs and heaps are non-linear."),
  p("accenture", "cs-core", "SQL", 2023, true, "easy", "Which SQL command retrieves data from a table?", ["INSERT", "SELECT", "UPDATE", "DELETE"], 1, "SELECT reads/retrieves rows."),
  p("accenture", "verbal", "Antonyms", 2024, false, "easy", "Choose the antonym of 'Increase':", ["Rise", "Decrease", "Grow", "Expand"], 1, "'Increase' is the opposite of 'decrease'."),
  p("accenture", "coding", "Pseudocode", 2023, false, "easy", "sum = 0; for i in 1..3: sum = sum + i. Output:", ["3", "6", "9", "1"], 1, "1 + 2 + 3 = 6."),

  // Zoho
  p("zoho", "coding", "C Output", 2024, true, "easy", "What is 7 / 2 using integer division?", ["3", "3.5", "4", "2"], 0, "Integer division truncates the decimal -> 3."),
  p("zoho", "coding", "Strings", 2023, false, "easy", "The reverse of the string 'abcd' is:", ["abcd", "dcba", "bcda", "dacb"], 1, "Read it backwards -> 'dcba'."),
  p("zoho", "coding", "Bit Manipulation", 2024, true, "medium", "The number of set bits (1s) in the binary of 7 is:", ["1", "2", "3", "4"], 2, "7 = 111 in binary -> three 1s."),
  p("zoho", "coding", "Logic", 2023, false, "easy", "The factorial of 4 is:", ["12", "16", "24", "20"], 2, "4 x 3 x 2 x 1 = 24."),
  p("zoho", "coding", "Arrays", 2024, true, "easy", "The largest element in [3, 7, 2, 8, 5] is:", ["7", "8", "5", "3"], 1, "8 is the maximum."),
  p("zoho", "coding", "Logic", 2023, false, "medium", "The sum of the digits of 1234 is:", ["9", "10", "11", "8"], 1, "1 + 2 + 3 + 4 = 10."),

  // Cognizant
  p("cognizant", "quant", "Ratio", 2024, true, "medium", "If a:b = 1:2 and b:c = 3:4, then a:c =", ["1:2", "3:8", "3:4", "1:4"], 1, "Make b common: a:b = 3:6, b:c = 6:8 -> a:c = 3:8."),
  p("cognizant", "reasoning", "Series", 2023, true, "medium", "Find the next term: 2, 5, 10, 17, 26, ?", ["35", "37", "36", "40"], 1, "Differences 3, 5, 7, 9; next is 11 -> 26 + 11 = 37."),
  p("cognizant", "verbal", "Grammar", 2024, false, "easy", "Which sentence is grammatically correct?", ["He go to school.", "He goes to school.", "He going to school.", "He gone to school."], 1, "Third person singular needs 'goes'."),
  p("cognizant", "coding", "Automata Fix", 2024, true, "medium", "A loop 'for(i=0;i<=n;i++)' over an array of size n causes:", ["Correct output", "An out-of-bounds access", "An infinite loop", "A syntax error"], 1, "Valid indices are 0..n-1; i = n is out of bounds (off-by-one)."),
  p("cognizant", "cs-core", "Data Structures", 2023, false, "easy", "FIFO order is followed by a:", ["Stack", "Queue", "Tree", "Graph"], 1, "A queue is First-In-First-Out."),

  // Core prep
  p("general", "quant", "Percentages", 2024, false, "easy", "20% of 50 is:", ["5", "10", "15", "20"], 1, "0.2 x 50 = 10."),
  p("general", "quant", "Fractions", 2023, false, "easy", "Half of 1/2 is:", ["1/2", "1/4", "1", "2"], 1, "1/2 x 1/2 = 1/4."),
  p("general", "reasoning", "Series", 2024, false, "easy", "Find the next term: 3, 6, 9, 12, ?", ["14", "15", "16", "18"], 1, "Add 3 each time -> 12 + 3 = 15."),
  p("general", "reasoning", "Classification", 2023, false, "easy", "Find the odd one out: 2, 4, 6, 9", ["2", "4", "6", "9"], 3, "2, 4, 6 are even; 9 is odd."),
  p("general", "verbal", "Antonyms", 2024, false, "easy", "Choose the antonym of 'Big':", ["Large", "Small", "Huge", "Tall"], 1, "'Big' is the opposite of 'small'."),
  p("general", "verbal", "Grammar", 2023, false, "easy", "The plural of 'child' is:", ["childs", "children", "childes", "child"], 1, "'Child' has the irregular plural 'children'."),
  p("general", "coding", "Number Systems", 2024, false, "easy", "The binary representation of 4 is:", ["100", "101", "110", "10"], 0, "4 = 100 in binary."),
  p("general", "cs-core", "Fundamentals", 2023, false, "easy", "CPU stands for:", ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Central Processor United"], 1, "CPU = Central Processing Unit."),

  // ===================== Expanded bank (set 4) =====================
  // TCS - aptitude + programming logic + C
  p("tcs", "quant", "Number System", 2024, true, "medium", "The unit digit of 3^24 is:", ["1", "3", "7", "9"], 0, "Cycle of 3 is 3,9,7,1 (period 4). 24 mod 4 = 0 -> last term = 1."),
  p("tcs", "quant", "Percentages", 2023, false, "easy", "If 40% of a number is 80, the number is:", ["120", "160", "200", "240"], 2, "Number = 80 / 0.40 = 200."),
  p("tcs", "quant", "Ratio", 2024, false, "easy", "If 5 books cost Rs 250, then 8 books cost:", ["Rs 350", "Rs 400", "Rs 450", "Rs 420"], 1, "One book = Rs 50; 8 x 50 = Rs 400."),
  p("tcs", "quant", "Trains", 2023, true, "medium", "A 150 m train at 54 km/h crosses a pole in:", ["10 s", "12 s", "15 s", "9 s"], 0, "54 km/h = 15 m/s; 150 / 15 = 10 s."),
  p("tcs", "quant", "Profit & Loss", 2024, false, "medium", "Selling at Rs 120 gives a 20% gain. The cost price is:", ["Rs 96", "Rs 100", "Rs 110", "Rs 105"], 1, "CP = 120 / 1.20 = Rs 100."),
  p("tcs", "reasoning", "Coding-Decoding", 2024, true, "medium", "If 'RED' is coded as 'SFE' (each letter +1), then 'BLUE' is:", ["CMVF", "CMWF", "CNVF", "DMVF"], 0, "B->C, L->M, U->V, E->F -> CMVF."),
  p("tcs", "reasoning", "Classification", 2023, false, "easy", "Find the odd one out: 4, 8, 12, 18", ["4", "8", "12", "18"], 3, "4, 8, 12 are multiples of 4; 18 is not."),
  p("tcs", "verbal", "Synonyms", 2024, false, "medium", "Choose the synonym of 'Tedious':", ["Exciting", "Boring", "Quick", "Easy"], 1, "'Tedious' means dull and tiresome - boring."),
  p("tcs", "verbal", "Grammar", 2023, false, "medium", "Fill in the blank: 'He is senior ___ me.'", ["to", "than", "from", "of"], 0, "The correct idiom is 'senior to'."),
  p("tcs", "coding", "C Output", 2024, true, "easy", "What does printf(\"%d\", 2 + 3 * 4) print?", ["20", "14", "24", "11"], 1, "Multiplication first: 3*4 = 12, then 2 + 12 = 14."),
  p("tcs", "coding", "C Output", 2023, false, "easy", "int x = 7; x %= 3; the value of x is:", ["1", "2", "3", "0"], 0, "7 mod 3 = 1."),

  // Infosys - quant + reasoning + pseudocode
  p("infosys", "quant", "Time & Work", 2024, true, "hard", "A is twice as efficient as B. Together they finish a job in 12 days. A alone takes:", ["18 days", "24 days", "36 days", "9 days"], 0, "Rates A:B = 2:1, together 3 units/day -> total 36 units; A alone 36/2 = 18 days."),
  p("infosys", "quant", "Percentages", 2023, true, "medium", "A's salary is 25% more than B's. B's salary is what percent less than A's?", ["20%", "25%", "16.67%", "33.3%"], 0, "B = A/1.25 = 0.8A -> 20% less."),
  p("infosys", "quant", "Averages", 2024, false, "medium", "The average of 5 numbers is 18. If 8 is removed, the average of the rest is:", ["20", "20.5", "21", "19"], 1, "Sum = 90; remove 8 -> 82 / 4 = 20.5."),
  p("infosys", "reasoning", "Syllogism", 2024, true, "medium", "All mangoes are fruits. Some fruits are sweet. Conclusion: Some mangoes are sweet?", ["Follows", "Does not follow", "Always true", "Certain"], 1, "Nothing ties mangoes to 'sweet', so it does not follow."),
  p("infosys", "reasoning", "Series", 2023, false, "medium", "Find the next term: 2, 6, 12, 20, 30, 42, ?", ["54", "56", "52", "58"], 1, "Differences 4,6,8,10,12; next is 14 -> 42 + 14 = 56."),
  p("infosys", "verbal", "Spelling", 2024, false, "easy", "Choose the correctly spelt word:", ["Definitly", "Definately", "Definitely", "Defenitely"], 2, "'Definitely' is the correct spelling."),
  p("infosys", "coding", "Pseudocode", 2024, true, "medium", "a=10; b=20; a=a+b; b=a-b; a=a-b; print(a, b). Output:", ["10 20", "20 10", "30 20", "10 10"], 1, "This is the classic swap -> a=20, b=10."),
  p("infosys", "coding", "Pseudocode", 2023, false, "easy", "count=0; for i in 1..10: if i is even: count++. Final count:", ["4", "5", "6", "10"], 1, "Evens 2,4,6,8,10 -> 5."),
  p("infosys", "coding", "Pseudocode", 2024, false, "easy", "x = 5; y = (x > 3) ? 1 : 0; print(y). Output:", ["0", "1", "5", "3"], 1, "5 > 3 is true -> y = 1."),

  // Wipro - quant + verbal + coding
  p("wipro", "quant", "Simple Interest", 2024, true, "medium", "In how many years will Rs 500 amount to Rs 600 at 5% simple interest?", ["3", "4", "5", "2"], 1, "SI = 100 = 500 x 5 x T / 100 = 25T -> T = 4."),
  p("wipro", "quant", "Ratio", 2023, false, "easy", "Divide 90 in the ratio 4 : 5. The smaller part is:", ["40", "50", "45", "36"], 0, "Smaller = 4/9 x 90 = 40."),
  p("wipro", "quant", "Percentages", 2024, false, "easy", "What percent of 200 is 50?", ["20%", "25%", "30%", "40%"], 1, "50 / 200 x 100 = 25%."),
  p("wipro", "verbal", "Synonyms", 2023, false, "easy", "Choose the synonym of 'Generous':", ["Stingy", "Liberal", "Mean", "Selfish"], 1, "'Generous' means giving freely - liberal."),
  p("wipro", "verbal", "Sentence completion", 2024, false, "easy", "Fill in the blank: 'I have been waiting ___ two hours.'", ["since", "for", "from", "at"], 1, "'For' is used with a duration (two hours)."),
  p("wipro", "coding", "Loops", 2023, false, "easy", "for(i=0;i<3;i++) for(j=0;j<3;j++) print('*'). Total stars:", ["6", "9", "3", "12"], 1, "3 x 3 = 9."),
  p("wipro", "coding", "Operators", 2024, false, "easy", "What is 2 raised to the power 3 (2**3)?", ["6", "8", "9", "5"], 1, "2 x 2 x 2 = 8."),

  // Accenture - cognitive + technical MCQ + coding
  p("accenture", "quant", "Percentages", 2024, false, "easy", "30% of 150 is:", ["30", "45", "50", "60"], 1, "0.30 x 150 = 45."),
  p("accenture", "reasoning", "Classification", 2023, false, "easy", "Find the odd one out: Triangle, Square, Circle, Rectangle", ["Triangle", "Square", "Circle", "Rectangle"], 2, "Triangle, Square and Rectangle have straight sides; a circle does not."),
  p("accenture", "cs-core", "Networks", 2024, true, "medium", "Which protocol is used to send email?", ["HTTP", "SMTP", "FTP", "DNS"], 1, "SMTP (Simple Mail Transfer Protocol) sends email."),
  p("accenture", "cs-core", "DBMS", 2023, false, "medium", "Which key is allowed to contain NULL values?", ["Primary key", "Foreign key", "Both", "Neither"], 1, "A foreign key may be null; a primary key cannot."),
  p("accenture", "cs-core", "OS", 2024, true, "medium", "Which CPU scheduling policy can cause starvation?", ["FCFS", "Priority", "Round Robin", "None"], 1, "Low-priority processes may wait indefinitely under priority scheduling."),
  p("accenture", "cs-core", "Pseudocode", 2023, false, "easy", "For arr = {10, 20, 30, 40} (0-indexed), PRINT arr[2] outputs:", ["10", "20", "30", "40"], 2, "Index 2 is the third element -> 30."),
  p("accenture", "cs-core", "Fundamentals", 2024, false, "easy", "Which of these is a cloud service model?", ["SaaS", "HTML", "TCP", "RAM"], 0, "SaaS (Software as a Service) is a cloud model."),
  p("accenture", "coding", "Output", 2023, false, "easy", "x = 8; x = x / 2; x = x / 2; print(x). Output:", ["4", "2", "1", "8"], 1, "8 -> 4 -> 2."),

  // Zoho - coding heavy
  p("zoho", "coding", "Output", 2024, true, "medium", "int a = 10; printf(\"%d\", a > 5 && a < 20). Output:", ["0", "1", "10", "20"], 1, "Both conditions true -> 1."),
  p("zoho", "coding", "Patterns", 2023, true, "easy", "A right triangle pattern of 4 rows (1,2,3,4 stars) has how many stars?", ["6", "10", "16", "8"], 1, "1 + 2 + 3 + 4 = 10."),
  p("zoho", "coding", "Recursion", 2024, true, "medium", "f(0)=0, f(n)=f(n-1)+n. What is f(4)?", ["6", "10", "12", "8"], 1, "0 + 1 + 2 + 3 + 4 = 10."),
  p("zoho", "coding", "Arrays", 2023, false, "easy", "The sum of the array [2, 4, 6, 8] is:", ["18", "20", "24", "16"], 1, "2 + 4 + 6 + 8 = 20."),
  p("zoho", "coding", "Number Logic", 2024, false, "easy", "Is 17 a prime number?", ["Yes", "No", "Only sometimes", "Cannot say"], 0, "17 has no divisors other than 1 and itself, so it is prime."),
  p("zoho", "coding", "Output", 2023, true, "hard", "for(i=5;i>0;i--) ; printf(\"%d\", i). What prints?", ["5", "0", "1", "4"], 1, "The ';' makes an empty body; the loop runs until i=0, then prints 0."),
  p("zoho", "coding", "Bit Manipulation", 2024, true, "medium", "The result of 5 | 2 (bitwise OR) is:", ["7", "0", "5", "2"], 0, "101 | 010 = 111 = 7."),
  p("zoho", "coding", "Debugging", 2023, true, "medium", "A loop computes sum += arr[i] but the result is wrong. The most likely bug is:", ["The loop bound", "sum was not initialized to 0", "A wrong array name", "Nothing"], 1, "An uninitialized accumulator gives garbage; initialize sum = 0."),
  p("zoho", "coding", "Matrix", 2024, false, "easy", "A 3 x 3 matrix has how many elements?", ["6", "9", "3", "12"], 1, "3 rows x 3 columns = 9."),

  // Cognizant - aptitude + technical + automata
  p("cognizant", "quant", "Ratio", 2024, false, "easy", "If a : b = 3 : 5 and b = 20, then a =", ["10", "12", "15", "8"], 1, "a = (3/5) x 20 = 12."),
  p("cognizant", "reasoning", "Series", 2023, true, "medium", "Find the next term: 1, 3, 6, 10, 15, ?", ["18", "21", "20", "24"], 1, "Triangular numbers; differences 2,3,4,5; next +6 -> 21."),
  p("cognizant", "verbal", "Grammar", 2024, false, "medium", "Fill in the blank: 'Neither of them ___ coming.'", ["are", "is", "were", "have"], 1, "'Neither' is singular -> 'is'."),
  p("cognizant", "cs-core", "Sorting", 2024, true, "medium", "Which sorting algorithm is fastest on average?", ["Bubble Sort", "Quick Sort", "Selection Sort", "Insertion Sort"], 1, "Quick Sort averages O(n log n); the others are O(n^2)."),
  p("cognizant", "coding", "Automata Fix", 2024, true, "medium", "A function returns the wrong value because it has no 'return' statement. This bug is:", ["A syntax error", "A missing return", "An infinite loop", "Correct code"], 1, "Without a return, the function does not give back the computed value."),
  p("cognizant", "coding", "Output", 2023, false, "easy", "x = 4; if (x > 5) print('A'); else print('B'). Output:", ["A", "B", "AB", "Nothing"], 1, "4 > 5 is false -> prints B."),

  // Core prep
  p("general", "quant", "BODMAS", 2024, true, "easy", "What is 5 + 5 x 0?", ["0", "5", "10", "25"], 1, "Multiplication first: 5 x 0 = 0, then 5 + 0 = 5."),
  p("general", "quant", "Percentages", 2023, false, "easy", "25% of 200 is:", ["25", "50", "75", "100"], 1, "0.25 x 200 = 50."),
  p("general", "reasoning", "Series", 2024, false, "easy", "Find the next term: 100, 90, 80, 70, ?", ["50", "60", "65", "75"], 1, "Subtract 10 each time -> 70 - 10 = 60."),
  p("general", "reasoning", "Classification", 2023, false, "easy", "Find the odd one out: Monday, Tuesday, January, Friday", ["Monday", "Tuesday", "January", "Friday"], 2, "Monday, Tuesday and Friday are days; January is a month."),
  p("general", "verbal", "Antonyms", 2024, false, "easy", "Choose the antonym of 'Begin':", ["Start", "End", "Open", "Run"], 1, "'Begin' is the opposite of 'end'."),
  p("general", "verbal", "Grammar", 2023, false, "easy", "The past tense of 'go' is:", ["goed", "went", "gone", "going"], 1, "'Go' is irregular; its past tense is 'went'."),
  p("general", "coding", "Number Systems", 2024, false, "easy", "The binary representation of 8 is:", ["1000", "1010", "1100", "100"], 0, "8 = 1000 in binary."),
  p("general", "cs-core", "Fundamentals", 2023, false, "easy", "1 KB equals how many bytes?", ["1000", "1024", "100", "512"], 1, "1 KB = 1024 bytes."),

  // ===================== Expanded set 5 â€” deeper topic coverage =====================
  // TCS â€” compound interest, probability, advanced number system, pointers, data interpretation
  p("tcs", "quant", "Compound Interest", 2024, true, "medium", "Compound interest on Rs 2000 at 10% per annum for 2 years is:", ["Rs 400", "Rs 420", "Rs 440", "Rs 380"], 1, "CI = 2000 x (1.1)^2 - 2000 = 2420 - 2000 = Rs 420."),
  p("tcs", "quant", "Probability", 2023, true, "medium", "A bag has 3 red and 5 blue balls. Probability of picking a red ball is:", ["3/8", "5/8", "1/3", "3/5"], 0, "Favourable 3, total 8 -> 3/8."),
  p("tcs", "quant", "Probability", 2024, false, "medium", "Two dice are rolled. Probability that the sum is 7 is:", ["1/6", "7/36", "6/36", "5/36"], 0, "Pairs summing to 7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6 out of 36 = 1/6."),
  p("tcs", "quant", "Data Interpretation", 2024, true, "medium", "Sales in Q1 were 400 units and in Q2 were 500 units. The percentage increase is:", ["20%", "25%", "30%", "22%"], 1, "Increase = 100 on base 400 -> 100/400 x 100 = 25%."),
  p("tcs", "quant", "Permutations", 2023, false, "medium", "The number of ways to arrange 4 different books on a shelf is:", ["12", "24", "16", "48"], 1, "4! = 4 x 3 x 2 x 1 = 24."),
  p("tcs", "quant", "Time & Work", 2024, false, "medium", "A and B together can do a job in 6 days. A alone can in 10 days. B alone can in:", ["12 days", "15 days", "18 days", "24 days"], 1, "B's rate = 1/6 - 1/10 = 1/15 -> 15 days."),
  p("tcs", "reasoning", "Analogy", 2024, true, "easy", "Book : Library :: Star : ?", ["Moon", "Sky", "Galaxy", "Sun"], 2, "A book is kept in a library; a star belongs to a galaxy."),
  p("tcs", "reasoning", "Direction", 2023, false, "medium", "A man walks 5 km North, turns right and walks 12 km. His distance from the start is:", ["13 km", "17 km", "10 km", "15 km"], 0, "Pythagoras: sqrt(5^2 + 12^2) = sqrt(169) = 13 km."),
  p("tcs", "verbal", "Reading Comprehension", 2024, false, "medium", "Passage: 'The growth of AI is rapid, but ethical concerns grow with it.' The tone is:", ["purely optimistic", "purely critical", "balanced or cautious", "dismissive"], 2, "The passage names both a positive (rapid growth) and a concern (ethics) â€” balanced."),
  p("tcs", "verbal", "Sentence correction", 2023, false, "easy", "Pick the grammatically correct sentence:", ["The news are good.", "The news is good.", "The news were good.", "The news have been good."], 1, "'News' is uncountable and singular -> 'is'."),
  p("tcs", "coding", "C Pointers", 2024, true, "hard", "In C, if int *p = &x and *p = 20, then x becomes:", ["Unchanged", "20", "Address of p", "0"], 1, "A pointer dereference *p = 20 writes 20 into the variable x."),
  p("tcs", "coding", "C Output", 2024, false, "medium", "In C, what does printf(\"%d\", !0) print?", ["0", "1", "-1", "Error"], 1, "!0 is logical NOT of false, which is 1 (true) in C."),
  p("tcs", "coding", "C Output", 2023, true, "medium", "int a = 5; int b = a++ + ++a; printf(\"%d\", b). Output (undefined per standard, common result):", ["11", "12", "10", "13"], 1, "Post-increment uses 5, then pre-increment gives 7 -> 5 + 7 = 12 (common interpretation)."),

  // Infosys â€” clocks, calendars, advanced syllogism, pseudocode debugging
  p("infosys", "quant", "Compound Interest", 2024, true, "medium", "Find CI on Rs 1000 at 20% per annum for 2 years (compounded annually):", ["Rs 400", "Rs 440", "Rs 420", "Rs 350"], 1, "CI = 1000 x (1.2)^2 - 1000 = 1440 - 1000 = Rs 440."),
  p("infosys", "quant", "Mixture & Alligation", 2023, true, "medium", "A 60-litre mixture has milk and water in ratio 2:1. Milk = 40 L, water = 20 L. To change the ratio to 1:1, litres of water to add:", ["10", "20", "15", "25"], 1, "For ratio 1:1, water must equal milk = 40 L. Currently 20 L water, so add 40 - 20 = 20 L."),
  p("infosys", "reasoning", "Clocks", 2024, true, "medium", "The angle between the clock hands at 4:00 is:", ["60 degrees", "120 degrees", "90 degrees", "150 degrees"], 1, "|30 x 4 - 0| = 120 degrees."),
  p("infosys", "reasoning", "Calendars", 2023, false, "medium", "If 1 Jan 2023 was a Sunday, what day was 1 Jan 2024 (2023 was not a leap year)?", ["Sunday", "Monday", "Tuesday", "Saturday"], 1, "Ordinary year has 1 odd day; Sunday + 1 = Monday."),
  p("infosys", "reasoning", "Clocks", 2024, false, "easy", "How many times do the clock hands overlap in 24 hours?", ["22", "24", "23", "20"], 0, "They overlap 11 times per 12 hours, so 22 times in 24 hours."),
  p("infosys", "reasoning", "Syllogism", 2023, true, "hard", "All birds fly. No fish fly. Conclusion I: No fish are birds. Conclusion II: Some birds are not fish.", ["Only I", "Only II", "Both I and II", "Neither"], 2, "Since no fish fly and all birds fly, no fish is a bird (I follows). Since birds are not fish, some birds are not fish (II follows)."),
  p("infosys", "verbal", "Sentence correction", 2024, false, "medium", "Select the correct version: 'Neither he nor his friends ___ responsible.'", ["is", "are", "was", "have been"], 1, "With 'neither...nor', the verb agrees with the nearer subject 'friends' (plural) -> 'are'."),
  p("infosys", "coding", "Pseudocode", 2024, true, "hard", "f(1)=1; f(n)=f(n-1)*n for n>1. What is f(5)?", ["100", "120", "60", "24"], 1, "5! = 5 x 4 x 3 x 2 x 1 = 120."),
  p("infosys", "coding", "Pseudocode", 2023, false, "medium", "for i in 1..5: if (i % 2 != 0) print(i). Output:", ["1 3 5", "2 4", "1 2 3 4 5", "1 3"], 0, "Odd numbers from 1 to 5 are 1, 3, 5."),
  p("infosys", "coding", "Pseudocode", 2024, false, "medium", "s=0; for i in 1..n: s+=i*i. For n=3, s=?", ["6", "14", "9", "12"], 1, "1 + 4 + 9 = 14."),

  // Wipro â€” essay-style verbal, tenses, data interpretation, algebra
  p("wipro", "quant", "Compound Interest", 2024, true, "medium", "CI - SI difference on Rs 1000 at 10% for 2 years is:", ["Rs 10", "Rs 20", "Rs 5", "Rs 15"], 0, "Difference = P x (R/100)^2 = 1000 x 0.01 = Rs 10."),
  p("wipro", "quant", "Algebra", 2023, false, "easy", "If x + 5 = 12, then x =", ["5", "7", "8", "6"], 1, "x = 12 - 5 = 7."),
  p("wipro", "quant", "Data Interpretation", 2024, false, "medium", "A shop sold 80 items in Jan and 100 in Feb. The % change is:", ["20%", "25%", "30%", "15%"], 1, "Increase = 20 on base 80 -> 20/80 x 100 = 25%."),
  p("wipro", "reasoning", "Syllogism", 2024, false, "medium", "All cats are animals. All dogs are animals. Conclusion: All cats are dogs.", ["Follows", "Does not follow", "Cannot say", "True"], 1, "Both are subsets of 'animals' but neither is necessarily a subset of the other."),
  p("wipro", "verbal", "Tenses", 2024, true, "medium", "Choose the correct sentence:", ["She have been working here for two years.", "She has been working here for two years.", "She had working here for two years.", "She is work here for two years."], 1, "Present perfect continuous with 'she' (3rd person singular): 'has been working'."),
  p("wipro", "verbal", "Para Jumble", 2023, false, "medium", "Which sentence is the BEST opener for a paragraph? A: This leads to higher productivity. B: Research shows that focused work sessions improve output. C: Therefore, regular breaks are valuable. D: However, distractions reduce this benefit.", ["A", "B", "C", "D"], 1, "B introduces the topic (research shows...); the others are follow-on (This, Therefore, However)."),
  p("wipro", "verbal", "Vocabulary", 2024, false, "easy", "Choose the synonym of 'Vital':", ["Unimportant", "Essential", "Ordinary", "Old"], 1, "'Vital' means absolutely essential."),
  p("wipro", "coding", "Operators", 2024, false, "easy", "In Java/Python, what is 2 ** 10?", ["20", "1024", "512", "100"], 1, "2 to the power 10 = 1024."),
  p("wipro", "coding", "Strings", 2023, false, "easy", "The length of the string 'PLACEMENT' is:", ["8", "9", "10", "7"], 1, "P-L-A-C-E-M-E-N-T = 9 characters."),

  // Accenture â€” OS scheduling, network layers, database transactions, cloud details
  p("accenture", "cs-core", "OS Scheduling", 2024, true, "medium", "Round Robin CPU scheduling uses a fixed:", ["Memory limit", "Time quantum", "Priority value", "Stack size"], 1, "Round Robin cycles through processes giving each a fixed time quantum."),
  p("accenture", "cs-core", "OS Memory", 2023, false, "medium", "Virtual memory allows a process to use more memory than physically available by using:", ["CPU registers", "Cache", "Disk as extension of RAM", "ROM"], 2, "Virtual memory extends RAM using disk (swap space)."),
  p("accenture", "cs-core", "Networks", 2024, true, "medium", "The OSI layer responsible for routing packets is:", ["Transport", "Network", "Data Link", "Physical"], 1, "The Network layer (Layer 3) handles routing via IP."),
  p("accenture", "cs-core", "DBMS Transactions", 2024, true, "medium", "The ACID property that ensures a transaction is fully done or not at all is:", ["Consistency", "Isolation", "Atomicity", "Durability"], 2, "Atomicity ensures all-or-nothing execution of a transaction."),
  p("accenture", "cs-core", "DBMS Transactions", 2023, false, "medium", "The ACID property that protects committed data even after a system crash is:", ["Atomicity", "Consistency", "Isolation", "Durability"], 3, "Durability guarantees committed changes survive failures."),
  p("accenture", "cs-core", "Cloud", 2024, false, "medium", "In which cloud model does the provider manage everything except the user's data and access settings?", ["IaaS", "PaaS", "SaaS", "BaaS"], 2, "In SaaS, the provider manages infrastructure, platform and app; the user only manages their data."),
  p("accenture", "reasoning", "Puzzle", 2024, false, "medium", "Five people A,B,C,D,E sit in a row. A is at the extreme right. B is to the immediate left of A. How many people are to the left of B?", ["2", "3", "4", "1"], 1, "From left: C/D/E (3 people), B, A. Exactly 3 people to B's left."),
  p("accenture", "quant", "Ratio", 2023, false, "easy", "If a:b = 2:3 and b:c = 3:4, then a:b:c =", ["2:3:4", "4:6:8", "2:6:4", "6:9:12"], 0, "b is common; a:b:c = 2:3:4."),
  p("accenture", "coding", "Pseudocode", 2024, false, "medium", "int x = 10; x = x < 5 ? x + 1 : x - 1; print(x). Output:", ["9", "11", "10", "5"], 0, "10 < 5 is false -> execute x - 1 = 9."),

  // Zoho â€” advanced algorithm, recursion, bit ops, string problems
  p("zoho", "coding", "Bit Manipulation", 2024, true, "hard", "To check if an integer n is a power of 2, the condition is:", ["n & (n-1) == 0", "n % 2 == 0", "n >> 1 == 1", "n | 1 == n"], 0, "Powers of 2 have exactly one set bit; n & (n-1) clears that bit -> 0 for powers of 2."),
  p("zoho", "coding", "Recursion", 2023, true, "medium", "In the Tower of Hanoi with 3 discs, the minimum number of moves is:", ["6", "7", "8", "9"], 1, "Minimum moves = 2^n - 1 = 2^3 - 1 = 7."),
  p("zoho", "coding", "Strings", 2024, true, "hard", "The number of distinct characters in 'mississippi' is:", ["4", "5", "6", "3"], 0, "m, i, s, p -> 4 distinct characters."),
  p("zoho", "coding", "Arrays", 2023, false, "medium", "Given [1, 2, 3, 4, 5], the subarray with the largest sum is the array itself. Its sum is:", ["10", "15", "12", "20"], 1, "All positive -> full array sums to 1+2+3+4+5 = 15."),
  p("zoho", "coding", "Sorting", 2024, false, "medium", "For sorting a nearly-sorted array efficiently, the best choice is:", ["Quick Sort", "Insertion Sort", "Bubble Sort", "Selection Sort"], 1, "Insertion Sort performs close to O(n) on nearly-sorted data."),
  p("zoho", "coding", "Logic", 2024, true, "hard", "What is the output? a=1; b=2; c=3; print(a<b && b<c)", ["0", "1", "True", "Error"], 1, "Both conditions are true -> logical AND returns 1 (true)."),
  p("zoho", "coding", "Number Logic", 2023, false, "medium", "A number is a perfect number if it equals the sum of its proper divisors. Is 6 a perfect number?", ["Yes", "No", "Only sometimes", "Cannot say"], 0, "Proper divisors of 6 are 1, 2, 3; 1+2+3 = 6 -> yes, 6 is perfect."),
  p("zoho", "coding", "Output", 2024, false, "medium", "for(i=1; i<=4; i++) print(i*i). The output is:", ["1 4 9 16", "1 2 3 4", "2 4 6 8", "4 9 16 25"], 0, "i*i for i=1,2,3,4 gives 1,4,9,16."),

  // Cognizant â€” SQL queries, DBMS normalization, automata-fix patterns
  p("cognizant", "cs-core", "SQL", 2024, true, "medium", "Which SQL keyword is used to avoid duplicate rows in the result?", ["UNIQUE", "DISTINCT", "NODUPLICATE", "FILTER"], 1, "SELECT DISTINCT removes duplicate output rows."),
  p("cognizant", "cs-core", "SQL", 2023, true, "medium", "The SQL aggregate function that returns the number of rows is:", ["SUM()", "AVG()", "COUNT()", "MAX()"], 2, "COUNT() returns the number of rows matching a condition."),
  p("cognizant", "cs-core", "DBMS", 2024, false, "medium", "Removing transitive dependencies is the goal of:", ["1NF", "2NF", "3NF", "4NF"], 2, "3NF removes non-key columns that depend on other non-key columns (transitive dependency)."),
  p("cognizant", "cs-core", "DBMS", 2023, false, "medium", "A view in SQL is best described as:", ["A copy of a table", "A stored virtual query result", "A backup file", "An index"], 1, "A view is a stored query that behaves like a virtual table."),
  p("cognizant", "reasoning", "Ranking", 2024, false, "easy", "In a class of 50 students, Priya is 10th from the top. Her rank from the bottom is:", ["40th", "41st", "39th", "42nd"], 1, "From bottom = 50 - 10 + 1 = 41st."),
  p("cognizant", "reasoning", "Analogy", 2023, false, "easy", "Author : Book :: Composer : ?", ["Song", "Music", "Orchestra", "Lyrics"], 1, "An author writes a book; a composer creates music."),
  p("cognizant", "coding", "Automata Fix", 2024, true, "hard", "A function to check if a string is a palindrome returns wrong answers. The most likely bug is:", ["It does not reverse the string before comparing", "It checks length only", "It uses the wrong data type", "It has a missing semicolon"], 0, "A palindrome check must compare the string to its reverse; an absent reversal gives wrong answers."),
  p("cognizant", "coding", "Output", 2023, false, "easy", "x = 3; y = 4; print(x * x + y * y). Output:", ["25", "49", "7", "12"], 0, "3*3 + 4*4 = 9 + 16 = 25."),
  p("cognizant", "quant", "Permutations", 2024, false, "medium", "The number of ways to arrange the letters of the word 'STAR' is:", ["12", "24", "6", "48"], 1, "All letters different -> 4! = 24."),

  // General (Core Prep) â€” bridging easy/medium concepts students commonly miss
  p("general", "quant", "Compound Interest", 2024, false, "medium", "CI - SI for 2 years at 5% on Rs 2000 is:", ["Rs 5", "Rs 10", "Rs 15", "Rs 20"], 0, "Difference = P(R/100)^2 = 2000 x (0.05)^2 = 2000 x 0.0025 = Rs 5."),
  p("general", "quant", "Probability", 2023, false, "easy", "A coin is tossed once. Probability of heads is:", ["1/4", "1/3", "1/2", "1"], 2, "One favourable outcome out of two total -> 1/2."),
  p("general", "quant", "Ratio", 2024, false, "easy", "If a:b = 4:6, the simplified ratio is:", ["2:3", "4:6", "8:12", "1:2"], 0, "Divide both by 2 -> 2:3."),
  p("general", "reasoning", "Clocks", 2024, false, "medium", "The angle between the clock hands at 9:00 is:", ["180 degrees", "270 degrees", "90 degrees", "120 degrees"], 2, "|30 x 9 - 0| = 270 degrees; the reflex angle is 360 - 270 = 90 degrees. Standard answer = 90 degrees."),
  p("general", "reasoning", "Blood Relations", 2023, false, "easy", "If A is the sister of B and B is the brother of C, how is A related to C?", ["Aunt", "Sister", "Mother", "Niece"], 1, "A is the sister of B who is C's sibling, so A is C's sister."),
  p("general", "verbal", "Vocabulary", 2024, false, "easy", "Choose the synonym of 'Intelligent':", ["Foolish", "Smart", "Lazy", "Weak"], 1, "'Intelligent' means smart or clever."),
  p("general", "verbal", "Grammar", 2023, false, "easy", "Select the correct sentence:", ["The team are playing well.", "The team is playing well.", "The team was playing well yesterday still.", "The team have been playing well."], 1, "'Team' is a collective noun and takes a singular verb in formal usage."),
  p("general", "coding", "Loops", 2024, false, "easy", "What prints? i=1; while(i<=5) { print(i); i+=2 }", ["1 2 3 4 5", "1 3 5", "2 4", "5 4 3 2 1"], 1, "i starts at 1 and increments by 2: 1, 3, 5."),
  p("general", "coding", "Functions", 2023, false, "easy", "A function that calls itself is called:", ["Iterative", "Recursive", "Sequential", "Parallel"], 1, "A function that calls itself is recursive."),
  p("general", "cs-core", "OOP", 2024, false, "easy", "Which OOP concept allows a child class to use a parent class's method?", ["Polymorphism", "Inheritance", "Abstraction", "Encapsulation"], 1, "Inheritance lets a child class reuse methods and properties of the parent."),
  p("general", "cs-core", "Networks", 2023, false, "easy", "The full form of HTTP is:", ["HyperText Transfer Pro", "HyperText Transfer Protocol", "High Text Transfer Protocol", "HyperText Transmission Protocol"], 1, "HTTP = HyperText Transfer Protocol."),

  // ===================== Expanded set 6 â€” hand-authored, company-pattern aligned =====================
  // Difficulty mix per company: ~40% hard, ~40% medium, ~20% easy.

  // --- TCS (NQT pattern: numerical + reasoning + verbal + C-flavoured programming logic) ---
  p("tcs", "quant", "Profit & Loss", 2024, true, "easy", "A trader buys an article for Rs 250 and sells it for Rs 300. The profit percent is:", ["15%", "20%", "25%", "18%"], 1, "Profit = 300 - 250 = Rs 50 on cost price 250. Profit% = 50/250 x 100 = 20%."),
  p("tcs", "verbal", "Vocabulary", 2023, false, "easy", "Choose the synonym of 'Candid':", ["Secretive", "Frank", "Rude", "Shy"], 1, "'Candid' means truthful and straightforward - frank."),
  p("tcs", "reasoning", "Series", 2024, false, "easy", "Find the next term: 4, 12, 36, 108, ?", ["216", "324", "312", "432"], 1, "Each term is multiplied by 3: 108 x 3 = 324."),
  p("tcs", "quant", "Boats & Streams", 2024, true, "medium", "A boat's speed in still water is 8 km/h and the stream flows at 2 km/h. Time to travel 18 km upstream is:", ["2 h", "2.5 h", "3 h", "3.5 h"], 2, "Upstream speed = 8 - 2 = 6 km/h. Time = 18/6 = 3 hours."),
  p("tcs", "quant", "Ages", 2023, true, "medium", "The sum of a father's and son's ages is 60. The father is three times as old as the son. The son's age is:", ["12", "15", "18", "20"], 1, "Let son = x, father = 3x. 4x = 60, so x = 15."),
  p("tcs", "reasoning", "Seating", 2024, false, "medium", "Eight people sit around a circular table in seats numbered 1-8, facing the centre. The seat directly opposite seat 3 is:", ["Seat 6", "Seat 7", "Seat 8", "Seat 5"], 1, "Opposite seat = 3 + 8/2 = 7."),
  p("tcs", "verbal", "Error Spotting", 2023, true, "medium", "Identify the error: 'One of my friend lives in Mumbai.'", ["One of", "my friend", "lives", "in Mumbai"], 1, "'One of' takes a plural noun: 'one of my friends'."),
  p("tcs", "coding", "C Arrays", 2024, true, "medium", "In C, for int arr[10], the value of sizeof(arr)/sizeof(arr[0]) is:", ["9", "10", "40", "4"], 1, "sizeof(arr) = 10 x sizeof(int); dividing by sizeof one element gives the count, 10."),
  p("tcs", "coding", "C Operators", 2023, false, "medium", "In C, after x = (5 > 3) ? 10 : 20; the value of x is:", ["20", "10", "5", "3"], 1, "The condition 5 > 3 is true, so the ternary operator returns 10."),
  p("tcs", "quant", "Number System", 2024, true, "hard", "The unit digit of 3^47 is:", ["1", "3", "7", "9"], 2, "Powers of 3 cycle 3, 9, 7, 1 (period 4). 47 mod 4 = 3, so the third term in the cycle = 7."),
  p("tcs", "quant", "Mensuration", 2023, false, "hard", "A wire bent into a square of side 11 cm is re-bent into a circle. The area of the circle is (pi = 22/7):", ["144 cm^2", "154 cm^2", "164 cm^2", "176 cm^2"], 1, "Wire length = 4 x 11 = 44 cm = circumference. 2 x (22/7) x r = 44 gives r = 7. Area = (22/7) x 49 = 154 cm^2."),
  p("tcs", "quant", "Discount", 2024, false, "hard", "Successive discounts of 20% and 10% on a Rs 500 item give a final price of:", ["Rs 350", "Rs 360", "Rs 370", "Rs 400"], 1, "500 x 0.80 x 0.90 = 360. (The single equivalent discount is 28%, not 30%.)"),
  p("tcs", "reasoning", "Syllogism", 2023, true, "hard", "All A are B. No B is C. Conclusion: No A is C.", ["Follows", "Does not follow", "Cannot say", "Only sometimes"], 0, "Every A sits inside B, and B is completely separate from C, so no A can be C - the conclusion follows."),
  p("tcs", "coding", "C Functions", 2024, true, "hard", "In C, a static local variable inside a function:", ["Resets on every call", "Retains its value between calls", "Is stored on the stack", "Cannot be initialised"], 1, "A static local is initialised once and keeps its value across function calls (stored in the data segment, not the stack)."),
  p("tcs", "coding", "Recursion", 2023, false, "hard", "f(n) returns 0 if n == 0, else n + f(n-1). The value of f(4) is:", ["4", "10", "24", "9"], 1, "f(4) = 4 + 3 + 2 + 1 + 0 = 10."),

  // --- Infosys (aptitude + pseudocode pattern) ---
  p("infosys", "quant", "Averages", 2024, false, "easy", "The average of 3, 7 and 11 is:", ["6", "7", "8", "9"], 1, "Sum = 21, count = 3, average = 7."),
  p("infosys", "verbal", "Antonyms", 2023, false, "easy", "Choose the antonym of 'Transparent':", ["Clear", "Opaque", "Visible", "Bright"], 1, "'Transparent' (see-through) is the opposite of 'opaque' (cannot be seen through)."),
  p("infosys", "reasoning", "Letter Series", 2024, false, "easy", "Find the next term: A, C, F, J, ?", ["N", "O", "M", "P"], 1, "Gaps are +2, +3, +4; the next gap is +5: J + 5 = O."),
  p("infosys", "quant", "Probability", 2024, true, "medium", "Two fair dice are rolled. The probability that the sum is 7 is:", ["1/6", "1/9", "1/12", "5/36"], 0, "Favourable: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6 of 36 outcomes = 1/6."),
  p("infosys", "quant", "Partnership", 2023, false, "medium", "A invests Rs 5000 and B invests Rs 7000 for the same period. From a profit of Rs 2400, A's share is:", ["Rs 1000", "Rs 1200", "Rs 1400", "Rs 900"], 0, "Ratio 5000:7000 = 5:7. A gets 5/12 x 2400 = Rs 1000."),
  p("infosys", "coding", "Pseudocode", 2024, true, "medium", "count = 0; x = 10; while (x > 1) { x = x / 2 (integer division); count = count + 1 } - final count is:", ["2", "3", "4", "5"], 1, "x: 10 -> 5 (count 1) -> 2 (count 2) -> 1 (count 3). Loop stops; count = 3."),
  p("infosys", "reasoning", "Ranking", 2023, false, "medium", "In a class of 25 students, Ram is 12th from the top. His rank from the bottom is:", ["12th", "13th", "14th", "15th"], 2, "From bottom = 25 - 12 + 1 = 14th."),
  p("infosys", "verbal", "Prepositions", 2024, false, "medium", "'He persisted ___ his efforts despite repeated failures.'", ["on", "in", "at", "with"], 1, "The fixed phrase is 'persist in'."),
  p("infosys", "quant", "Time & Work", 2024, true, "hard", "A alone finishes a job in 6 days, B alone in 8 days. With C's help all three finish it in 3 days. C alone would take:", ["12 days", "16 days", "24 days", "20 days"], 2, "C's rate = 1/3 - 1/6 - 1/8 = 8/24 - 4/24 - 3/24 = 1/24 per day, so 24 days."),
  p("infosys", "reasoning", "Number Series", 2023, false, "hard", "Find the next term: 3, 7, 16, 35, 74, ?", ["148", "153", "150", "143"], 1, "Pattern: x2+1, x2+2, x2+3, x2+4 -> next is 74 x 2 + 5 = 153."),
  p("infosys", "coding", "Pseudocode Recursion", 2024, true, "hard", "f(n) = 1 if n <= 1, else n * f(n-2). The value of f(6) is:", ["36", "48", "120", "24"], 1, "f(6) = 6 x f(4) = 6 x 4 x f(2) = 6 x 4 x 2 x f(0) = 6 x 4 x 2 x 1 = 48."),
  p("infosys", "reasoning", "Syllogism", 2024, false, "hard", "Some A are B. No B is C. Conclusion: Some A are not C.", ["Follows", "Does not follow", "Cannot say", "Contradicts"], 0, "The A's that are B cannot be C (B and C are disjoint), so at least some A are not C - it follows."),
  p("infosys", "verbal", "Sentence Correction", 2023, true, "hard", "Which sentence is correctly framed?", ["Hardly he had arrived when it started raining.", "Hardly had he arrived when it started raining.", "Hardly he arrived than it started raining.", "Hardly did he arrived when it started raining."], 1, "After 'hardly' at the start, invert subject and auxiliary: 'Hardly had he arrived when...'."),
  p("infosys", "quant", "Trains", 2024, true, "hard", "A train crosses a man in 8 seconds and a 180 m platform in 20 seconds. The speed of the train is:", ["45 km/h", "54 km/h", "60 km/h", "72 km/h"], 1, "Let length L and speed v: L = 8v and L + 180 = 20v. Subtracting, 180 = 12v, so v = 15 m/s = 54 km/h."),

  // --- Wipro (Elite NTH pattern: verbal-heavy + aptitude + Java-flavoured coding) ---
  p("wipro", "verbal", "One-Word Substitution", 2024, false, "easy", "One who writes the story of another person's life is a:", ["Autobiographer", "Biographer", "Novelist", "Journalist"], 1, "A biographer writes someone else's life story (an autobiographer writes their own)."),
  p("wipro", "quant", "Percentages", 2023, false, "easy", "25% of 480 is:", ["110", "115", "120", "125"], 2, "480 / 4 = 120."),
  p("wipro", "reasoning", "Analogy", 2024, false, "easy", "Doctor : Hospital :: Teacher : ?", ["Office", "School", "Court", "Library"], 1, "A doctor works in a hospital; a teacher works in a school."),
  p("wipro", "verbal", "Sentence Improvement", 2024, true, "medium", "Improve: 'He is senior than me.'", ["senior than I", "senior to me", "more senior than me", "No improvement"], 1, "'Senior', 'junior', 'superior', 'inferior' take 'to', not 'than'."),
  p("wipro", "verbal", "Idioms", 2023, false, "medium", "The idiom 'to bite the dust' means:", ["To eat quickly", "To fail or be defeated", "To work hard", "To clean the floor"], 1, "'Bite the dust' means to fail, fall or be defeated."),
  p("wipro", "quant", "Pipes & Cisterns", 2024, true, "medium", "Pipe A fills a tank in 12 h, pipe B in 15 h, and pipe C empties it in 20 h. With all three open, the tank fills in:", ["8 h", "10 h", "12 h", "15 h"], 1, "1/12 + 1/15 - 1/20 = 5/60 + 4/60 - 3/60 = 6/60 = 1/10 per hour -> 10 hours."),
  p("wipro", "quant", "Successive Change", 2023, true, "medium", "A value is increased by 10% and then by 20%. The net increase is:", ["30%", "32%", "28%", "35%"], 1, "Net = 10 + 20 + (10 x 20)/100 = 32%."),
  p("wipro", "reasoning", "Coding-Decoding", 2024, false, "medium", "If TABLE is coded as UBCMF, then CHAIR is coded as:", ["DIBJS", "DJBJS", "DIBIS", "DIAJS"], 0, "Each letter shifts +1: C->D, H->I, A->B, I->J, R->S -> DIBJS."),
  p("wipro", "coding", "Java Strings", 2023, true, "medium", "In Java, System.out.println(\"5\" + 2) prints:", ["7", "52", "10", "Error"], 1, "String + int performs concatenation: \"5\" + 2 = \"52\"."),
  p("wipro", "quant", "Trains", 2024, true, "hard", "Two trains of lengths 120 m and 180 m run towards each other at 54 km/h and 36 km/h. They cross each other in:", ["10 s", "12 s", "15 s", "18 s"], 1, "Relative speed = 90 km/h = 25 m/s. Total length = 300 m. Time = 300/25 = 12 s."),
  p("wipro", "quant", "Alligation", 2023, false, "hard", "Rice at Rs 30/kg is mixed with rice at Rs 45/kg to get a mixture worth Rs 35/kg. The ratio (cheaper : dearer) is:", ["1:2", "2:1", "3:2", "2:3"], 1, "Cheaper : dearer = (45 - 35) : (35 - 30) = 10 : 5 = 2 : 1."),
  p("wipro", "verbal", "Voice", 2024, false, "hard", "The passive form of 'She wrote the letter' is:", ["The letter is written by her.", "The letter was written by her.", "The letter has written by her.", "The letter had written by her."], 1, "Simple past active becomes 'was/were + past participle' in passive: 'The letter was written by her.'"),
  p("wipro", "coding", "Java Strings", 2024, true, "hard", "In Java: String s = \"hi\"; s.concat(\" there\"); System.out.println(s); prints:", ["hi there", "hi", "there", "Compilation error"], 1, "Strings are immutable - concat returns a NEW string which was discarded. s still refers to \"hi\"."),
  p("wipro", "quant", "Boats & Streams", 2023, false, "hard", "A man rows 20 km downstream in 2 hours and 12 km upstream in 3 hours. His speed in still water is:", ["6 km/h", "7 km/h", "8 km/h", "5 km/h"], 1, "Downstream = 10 km/h, upstream = 4 km/h. Still water = (10 + 4)/2 = 7 km/h (stream = 3 km/h)."),
  p("wipro", "reasoning", "Statement-Conclusion", 2024, false, "hard", "Statement: 'All the books in this library are in English.' Conclusion: 'This library has no Hindi books.'", ["Follows", "Does not follow", "Partially follows", "Cannot say"], 0, "If every book is in English, none can be in Hindi - the conclusion follows directly."),

  // --- Accenture (cognitive + technical MCQ pattern: cs-core heavy) ---
  p("accenture", "cs-core", "Web", 2024, false, "easy", "The full form of URL is:", ["Uniform Resource Locator", "Universal Routing Link", "Unified Resource Library", "Uniform Routing Locator"], 0, "URL = Uniform Resource Locator - the address of a resource on the web."),
  p("accenture", "quant", "Percentages", 2023, false, "easy", "12.5% of 640 is:", ["70", "75", "80", "85"], 2, "12.5% = 1/8, so 640/8 = 80."),
  p("accenture", "reasoning", "Analogy", 2024, false, "easy", "Pen : Write :: Knife : ?", ["Sharp", "Cut", "Steel", "Kitchen"], 1, "A pen is used to write; a knife is used to cut."),
  p("accenture", "cs-core", "Security", 2024, true, "medium", "Which protocol encrypts web traffic between a browser and server?", ["HTTP", "HTTPS", "FTP", "Telnet"], 1, "HTTPS wraps HTTP in TLS encryption; the others transmit data unencrypted."),
  p("accenture", "cs-core", "SQL", 2023, true, "medium", "In SQL, SELECT COUNT(*) FROM employees returns:", ["All rows", "The number of rows", "The first row", "Column names"], 1, "COUNT(*) is an aggregate that returns the total number of rows in the result."),
  p("accenture", "cs-core", "SQL", 2024, false, "medium", "Which SQL clause sorts the result set?", ["GROUP BY", "ORDER BY", "SORT BY", "ARRANGE BY"], 1, "ORDER BY sorts results ascending (default) or descending (DESC)."),
  p("accenture", "reasoning", "Attention to Detail", 2023, true, "medium", "In the sequence 7 2 7 3 7 4 7 7 6, how many 7s are immediately followed by an even number?", ["2", "3", "4", "1"], 1, "Pairs: 7-2 (yes), 7-3 (no), 7-4 (yes), 7-7 (no), 7-6 (yes) -> 3."),
  p("accenture", "verbal", "Prepositions", 2024, false, "medium", "'She is accustomed ___ working late.'", ["with", "to", "for", "in"], 1, "The fixed phrase is 'accustomed to'."),
  p("accenture", "cs-core", "OS", 2024, true, "hard", "Which CPU scheduling algorithm can cause starvation of low-priority processes?", ["Round Robin", "FCFS", "Priority scheduling", "Multilevel feedback with aging"], 2, "Pure priority scheduling can indefinitely delay low-priority processes if high-priority ones keep arriving. Aging fixes this."),
  p("accenture", "cs-core", "DBMS", 2023, true, "hard", "Which normal form removes transitive dependencies?", ["1NF", "2NF", "3NF", "BCNF only"], 2, "3NF requires that no non-key attribute depends on another non-key attribute (no transitive dependency)."),
  p("accenture", "cs-core", "Security", 2024, false, "hard", "An email pretending to be from a bank asking you to confirm your password is an example of:", ["Phishing", "Firewall", "Encryption", "Spam filtering"], 0, "Phishing impersonates a trusted entity to steal credentials or sensitive data."),
  p("accenture", "quant", "Compound Interest", 2023, false, "hard", "A town's population of 8000 grows at 5% per annum. The population after 2 years is:", ["8800", "8820", "8840", "8900"], 1, "8000 x 1.05 x 1.05 = 8000 x 1.1025 = 8820."),
  p("accenture", "reasoning", "Direction", 2024, true, "hard", "A man walks 4 km North, 3 km East, then 4 km South. How far is he from the start?", ["3 km", "4 km", "5 km", "7 km"], 0, "The 4 km North and 4 km South cancel; he is 3 km East of the start."),
  p("accenture", "coding", "Pseudocode", 2024, false, "hard", "x = 5; if (x > 3) { if (x > 7) print('A') else print('B') } else print('C') - output is:", ["A", "B", "C", "Nothing"], 1, "x > 3 is true, so enter the outer if; x > 7 is false, so the inner else prints 'B'."),
  p("accenture", "quant", "Speed & Distance", 2023, false, "medium", "A car covers 270 km at 60 km/h. The time taken is:", ["4 h", "4.5 h", "5 h", "3.5 h"], 1, "Time = 270/60 = 4.5 hours."),

  // --- Zoho (programming-heavy pattern) ---
  p("zoho", "coding", "ASCII", 2024, false, "easy", "The ASCII value of 'A' is:", ["64", "65", "96", "97"], 1, "'A' = 65 (and 'a' = 97)."),
  p("zoho", "coding", "Math Logic", 2023, false, "easy", "The value of 2^10 is:", ["512", "1024", "2048", "1000"], 1, "2^10 = 1024 - the classic kilobyte constant."),
  p("zoho", "coding", "Operators", 2024, true, "medium", "The value of 2 + 3 * 4 is:", ["20", "14", "24", "11"], 1, "Multiplication binds tighter: 2 + 12 = 14."),
  p("zoho", "coding", "Bitwise", 2023, true, "medium", "After x = 7; x = x ^ x; the value of x is:", ["7", "0", "14", "1"], 1, "XOR of any value with itself is 0."),
  p("zoho", "coding", "Algorithms", 2024, false, "medium", "The minimum number of comparisons needed to find the maximum of n elements is:", ["n", "n - 1", "n/2", "log n"], 1, "Each comparison eliminates one candidate; eliminating n-1 candidates needs n-1 comparisons."),
  p("zoho", "coding", "Matrices", 2023, false, "medium", "In a 0-indexed 2D array with 4 columns stored row-major, element [2][3] is at linear offset:", ["10", "11", "12", "9"], 1, "Offset = row x columns + col = 2 x 4 + 3 = 11."),
  p("zoho", "coding", "Loops", 2024, false, "medium", "How many times does this loop run? for (i = 10; i > 0; i -= 3)", ["3", "4", "5", "2"], 1, "i takes 10, 7, 4, 1 -> 4 iterations."),
  p("zoho", "coding", "Recursion", 2024, true, "hard", "f(n): if n == 0 return; print(n); f(n-1). Calling f(5) prints:", ["1 2 3 4 5", "5 4 3 2 1", "5 5 5 5 5", "Nothing"], 1, "Each call prints n before recursing down: 5 4 3 2 1."),
  p("zoho", "coding", "Strings", 2023, true, "hard", "The number of palindromic substrings of \"aaa\" is:", ["3", "5", "6", "4"], 2, "Substrings: 'a' x 3, 'aa' x 2, 'aaa' x 1 - all palindromic -> 6."),
  p("zoho", "coding", "Two Pointer", 2024, true, "hard", "In the sorted array [1, 3, 5, 7, 9], how many pairs sum to exactly 10?", ["1", "2", "3", "4"], 1, "(1,9) and (3,7). The middle element 5 has no partner (5+5 needs two 5s)."),
  p("zoho", "coding", "Bitwise", 2024, true, "hard", "The value of 12 & 11 (bitwise AND) is:", ["8", "9", "10", "12"], 0, "1100 & 1011 = 1000 = 8. (n & (n-1) clears the lowest set bit.)"),
  p("zoho", "coding", "Stack", 2023, false, "hard", "Push 1, 2, 3 onto a stack, pop once, push 4, then pop twice. The popped sequence is:", ["3, 4, 2", "3, 2, 4", "4, 3, 2", "1, 2, 3"], 0, "Pop -> 3 (top). Push 4 -> stack [1,2,4]. Pop -> 4, pop -> 2. Sequence: 3, 4, 2."),
  p("zoho", "coding", "Searching", 2024, false, "hard", "Binary search on a sorted array of 1000 elements needs at most about how many comparisons?", ["100", "500", "10", "31"], 2, "log2(1000) is just under 10, so at most ~10 comparisons."),
  p("zoho", "quant", "Number Patterns", 2023, false, "hard", "The sum of the first 15 odd numbers is:", ["200", "210", "225", "240"], 2, "Sum of first n odd numbers = n^2 = 15^2 = 225."),
  p("zoho", "reasoning", "Logic", 2024, false, "medium", "If all Zorks are Blims and some Blims are Crons, can we conclude some Zorks are Crons?", ["Yes, always", "No, not necessarily", "Yes, if Crons exist", "Only if Blims are Zorks"], 1, "The Blims that are Crons may not include any Zork - the conclusion is not forced."),

  // --- Cognizant (GenC pattern: aptitude + verbal + automata/debugging) ---
  p("cognizant", "quant", "Proportion", 2024, false, "easy", "If 3 : 4 = x : 20, then x is:", ["12", "15", "16", "18"], 1, "x = 3 x 20 / 4 = 15."),
  p("cognizant", "verbal", "Spelling", 2023, false, "easy", "Select the word with the correct spelling:", ["Maintainance", "Maintenance", "Maintenence", "Maintanance"], 1, "'Maintenance' - from 'maintain', but spelt with 'tenance'."),
  p("cognizant", "cs-core", "SQL", 2024, false, "easy", "The full form of SQL is:", ["Standard Query Language", "Structured Query Language", "Simple Query Language", "Sequential Query Language"], 1, "SQL = Structured Query Language."),
  p("cognizant", "quant", "Ages", 2024, true, "medium", "The present ages of two friends are in the ratio 5:7. After 6 years the ratio becomes 7:9. Their present ages are:", ["10 and 14", "15 and 21", "20 and 28", "25 and 35"], 1, "(5x+6)/(7x+6) = 7/9 -> 45x + 54 = 49x + 42 -> x = 3 -> ages 15 and 21."),
  p("cognizant", "reasoning", "Coding-Decoding", 2023, false, "medium", "If MOBILE is coded as NPCJMF, then PHONE is coded as:", ["QIPOF", "QIPNF", "QHPOF", "QIONF"], 0, "Each letter shifts +1: P->Q, H->I, O->P, N->O, E->F -> QIPOF."),
  p("cognizant", "cs-core", "OS", 2024, true, "medium", "Which of these is NOT one of the four deadlock conditions?", ["Mutual exclusion", "Hold and wait", "Preemption", "Circular wait"], 2, "The actual condition is NO preemption. Preemption (forcibly taking resources) is a way to BREAK deadlock."),
  p("cognizant", "coding", "Automata Fix", 2023, true, "medium", "A function returns a garbage value when summing an array. The most likely bug is:", ["The loop is too slow", "The accumulator was never initialised to 0", "The array is sorted", "The function name is wrong"], 1, "An uninitialised local variable holds garbage; sum must start at 0 before the loop."),
  p("cognizant", "verbal", "Agreement", 2024, false, "medium", "'Neither of the answers ___ correct.'", ["are", "is", "were", "have been"], 1, "'Neither' is singular and takes a singular verb: 'is'."),
  p("cognizant", "coding", "Loops", 2024, true, "hard", "How many times does this loop execute? for (i = 0; i <= 5; i++)", ["5", "6", "4", "Infinite"], 1, "i takes 0, 1, 2, 3, 4, 5 -> 6 iterations. The <= is the classic off-by-one trap."),
  p("cognizant", "cs-core", "DBMS", 2023, false, "hard", "Which statement about keys is TRUE?", ["Every candidate key is a primary key", "Every primary key is a candidate key", "A table can have many primary keys", "A primary key can be NULL"], 1, "The primary key is chosen FROM the candidate keys, so it is always a candidate key. The reverse is not true."),
  p("cognizant", "cs-core", "OS", 2024, true, "hard", "A page fault occurs when:", ["The CPU overheats", "A needed page is not in main memory", "A file is deleted", "The disk is full"], 1, "A page fault fires when a program accesses a page that is mapped but not currently loaded in RAM, forcing a fetch from disk."),
  p("cognizant", "quant", "Boats & Streams", 2023, false, "hard", "A boat's speed in still water is 9 km/h; the stream flows at 3 km/h. Time for a round trip of 24 km each way is:", ["5 h", "6 h", "7 h", "8 h"], 1, "Downstream 24/12 = 2 h; upstream 24/6 = 4 h; total 6 hours."),
  p("cognizant", "reasoning", "Calendars", 2024, true, "hard", "January 1, 2024 was a Monday. January 1, 2025 falls on a:", ["Tuesday", "Wednesday", "Thursday", "Monday"], 1, "2024 is a leap year (366 days = 52 weeks + 2 odd days), so the day advances by 2: Monday + 2 = Wednesday."),
  p("cognizant", "quant", "Averages", 2023, false, "hard", "The average of 11 numbers is 50. The average of the first 6 is 49 and of the last 6 is 52. The 6th number is:", ["54", "56", "58", "50"], 1, "First 6 sum = 294, last 6 sum = 312; total counts the 6th twice: 294 + 312 - 550 = 56."),
  p("cognizant", "coding", "Loops", 2024, false, "medium", "Which loop correctly prints 1 to 10?", ["for (i = 1; i < 10; i++)", "for (i = 1; i <= 10; i++)", "for (i = 0; i < 10; i--)", "for (i = 10; i > 0; i++)"], 1, "i runs 1 through 10 inclusive with i <= 10. Option A stops at 9; C and D never terminate correctly."),

  // --- General / Core Prep (1st & 2nd year foundations, with stretch questions) ---
  p("general", "cs-core", "Memory Units", 2024, false, "easy", "1 KB equals:", ["1000 bytes", "1024 bytes", "1024 bits", "100 bytes"], 1, "1 KB = 2^10 = 1024 bytes."),
  p("general", "quant", "Squares", 2023, false, "easy", "The square root of 144 is:", ["11", "12", "13", "14"], 1, "12 x 12 = 144."),
  p("general", "verbal", "Grammar", 2024, false, "easy", "The plural of 'foot' is:", ["foots", "feet", "feets", "footes"], 1, "'Foot' has the irregular plural 'feet'."),
  p("general", "coding", "Syntax", 2023, false, "easy", "In C and Java, a single-line comment starts with:", ["/*", "//", "#", "--"], 1, "// begins a single-line comment in C, C++, Java and JavaScript."),
  p("general", "quant", "HCF-LCM", 2024, false, "medium", "The LCM of 9 and 12 is:", ["24", "36", "48", "72"], 1, "9 = 3^2, 12 = 2^2 x 3 -> LCM = 2^2 x 3^2 = 36."),
  p("general", "quant", "Fractions", 2023, false, "medium", "3/5 expressed as a percentage is:", ["50%", "55%", "60%", "65%"], 2, "3/5 = 0.6 = 60%."),
  p("general", "reasoning", "Series", 2024, true, "medium", "Find the next term: 2, 5, 10, 17, ?", ["24", "26", "25", "27"], 1, "Pattern is n^2 + 1: 1+1, 4+1, 9+1, 16+1 -> next is 25 + 1 = 26."),
  p("general", "coding", "Operators", 2023, false, "medium", "The value of 10 % 4 is:", ["2", "2.5", "4", "0"], 0, "% gives the remainder: 10 = 2 x 4 + 2 -> remainder 2."),
  p("general", "cs-core", "Languages", 2024, false, "medium", "Python is typically classified as:", ["A compiled language", "An interpreted language", "An assembly language", "A markup language"], 1, "Python source runs through an interpreter (CPython compiles to bytecode and interprets it)."),
  p("general", "verbal", "Articles", 2023, false, "medium", "'She studies at ___ university.'", ["a", "an", "the only", "no article"], 0, "'University' starts with a consonant SOUND (yu-), so it takes 'a', not 'an'."),
  p("general", "cs-core", "OOP", 2024, true, "medium", "Bundling data and the methods that operate on it, while restricting direct access, is called:", ["Inheritance", "Encapsulation", "Polymorphism", "Compilation"], 1, "Encapsulation hides internal state behind a controlled interface (private fields + public methods)."),
  p("general", "quant", "Remainders", 2024, false, "hard", "The smallest number that leaves remainder 3 when divided by 5 and remainder 2 when divided by 4 is:", ["13", "18", "23", "8"], 1, "Numbers = 3 mod 5: 3, 8, 13, 18... Check mod 4: 18 mod 4 = 2. Answer: 18."),
  p("general", "reasoning", "Cubes", 2023, false, "hard", "A cube painted on all faces is cut into 27 equal small cubes. How many small cubes have exactly two painted faces?", ["8", "12", "6", "24"], 1, "Two-face cubes lie on the edges (not corners): 12 edges x 1 middle cube each = 12."),
  p("general", "coding", "Recursion", 2024, true, "hard", "With fib(0) = 0 and fib(1) = 1, the value of fib(5) is:", ["3", "5", "8", "13"], 1, "Sequence: 0, 1, 1, 2, 3, 5 -> fib(5) = 5."),
  p("general", "cs-core", "Number Systems", 2023, false, "hard", "The binary number 1101 in decimal is:", ["11", "12", "13", "14"], 2, "8 + 4 + 0 + 1 = 13."),

  // ===================== Expanded set 7 â€” hard-tier bank (toughest 25% of each company's paper) =====================
  // --- TCS hard ---
  p("tcs", "quant", "Compound Interest", 2024, true, "hard", "A sum doubles in 4 years at compound interest. In how many years will it become 8 times?", ["8 years", "12 years", "16 years", "24 years"], 1, "8 = 2^3, so it needs three doubling periods: 3 x 4 = 12 years."),
  p("tcs", "quant", "Races", 2023, false, "hard", "A runs 1.5 times as fast as B. If A gives B a 60 m head start, how long should the race be so they finish together?", ["120 m", "150 m", "180 m", "200 m"], 2, "Let race = d. Times equal: d/1.5 = (d - 60)/1 -> d = 1.5d - 90 -> d = 180 m."),
  p("tcs", "reasoning", "Calendars", 2024, false, "hard", "15 August 1947 fell on which day of the week?", ["Thursday", "Friday", "Saturday", "Sunday"], 1, "Counting odd days from a known reference gives Friday - a classic odd-days calculation."),
  p("tcs", "verbal", "Inversion", 2023, false, "hard", "Choose the correctly framed sentence:", ["No sooner did he arrive than the train left.", "No sooner he arrived than the train left.", "No sooner did he arrived than the train left.", "No sooner he did arrive when the train left."], 0, "'No sooner' requires inversion with did + base verb, paired with 'than'."),
  p("tcs", "coding", "C Pointers", 2024, true, "hard", "In C: int a[] = {1, 2, 3, 4}; the value of *(a + 2) is:", ["2", "3", "4", "Address of a[2]"], 1, "*(a + 2) dereferences the pointer 2 elements past the start: a[2] = 3."),
  p("tcs", "coding", "Complexity", 2023, false, "hard", "Two consecutive (NOT nested) loops, each running n times, give a total complexity of:", ["O(n^2)", "O(n)", "O(2^n)", "O(n log n)"], 1, "Sequential loops add: n + n = 2n = O(n). Only nesting multiplies."),

  // --- Infosys hard ---
  p("infosys", "quant", "Mixtures", 2024, true, "hard", "A vessel has 40 L of milk. 8 L is removed and replaced with water, and this is done once more. The milk remaining is:", ["24 L", "25.6 L", "26.4 L", "28 L"], 1, "Each operation keeps 32/40 = 0.8 of the milk: 40 x 0.8 x 0.8 = 25.6 L."),
  p("infosys", "quant", "Probability", 2023, false, "hard", "A fair coin is tossed 3 times. The probability of getting at least one head is:", ["3/8", "5/8", "7/8", "1/2"], 2, "P(at least one head) = 1 - P(all tails) = 1 - 1/8 = 7/8."),
  p("infosys", "reasoning", "Blood Relations", 2024, false, "hard", "A's son B is married to C. C's sister D is married to E, who is B's brother. How is D related to A?", ["Daughter", "Niece", "Daughter-in-law", "Sister-in-law"], 2, "E is B's brother, so E is also A's son. D is E's wife, making D A's daughter-in-law."),
  p("infosys", "coding", "Pseudocode", 2024, true, "hard", "n = 9875; sum = 0; while (n > 0) { sum = sum + n mod 10; n = n div 10 } - final sum is:", ["28", "29", "30", "27"], 1, "Digits 9 + 8 + 7 + 5 = 29."),
  p("infosys", "coding", "Pseudocode", 2023, false, "hard", "count = 0; for i = 1 to 5 { for j = 1 to 5 { if (j == 3) break; count = count + 1 } } - final count is:", ["10", "15", "25", "12"], 0, "The inner loop adds 2 per outer iteration (j = 1, 2 then breaks at 3): 5 x 2 = 10."),
  p("infosys", "verbal", "Inference", 2024, false, "hard", "'Every member who attended the meeting signed the register.' Which conclusion MUST be true?", ["Everyone signed the register.", "Anyone who did not sign did not attend.", "Only members attended.", "The register was full."], 1, "The contrapositive is the only forced conclusion: not signed -> did not attend."),

  // --- Wipro hard ---
  p("wipro", "quant", "Profit & Loss", 2024, true, "hard", "A shop marks up goods 40% above cost and then offers a 15% discount. The net profit percent is:", ["25%", "19%", "21%", "17%"], 1, "SP = 1.40 x 0.85 = 1.19 x CP -> 19% profit."),
  p("wipro", "quant", "Wages", 2023, false, "hard", "A finishes a job in 6 days, B in 12 days. They complete it together and earn Rs 900. A's share is:", ["Rs 450", "Rs 600", "Rs 500", "Rs 540"], 1, "Work ratio A:B = (1/6):(1/12) = 2:1. A gets 2/3 x 900 = Rs 600."),
  p("wipro", "verbal", "One-Word Substitution", 2024, false, "hard", "A person who can speak many languages is a:", ["Linguist only", "Polyglot", "Translator", "Orator"], 1, "A polyglot speaks multiple languages. (A linguist studies language scientifically.)"),
  p("wipro", "verbal", "Phrases", 2023, false, "hard", "'He accepted the cheque in lieu of cash.' Here 'in lieu of' means:", ["Along with", "Instead of", "Because of", "In addition to"], 1, "'In lieu of' means 'in place of / instead of'."),
  p("wipro", "coding", "Java", 2024, true, "hard", "In Java, comparing two distinct String objects with the same characters using == returns:", ["Always true", "false (it compares references)", "A compile error", "true only for short strings"], 1, "== compares object references; .equals() compares contents. Two separately created objects differ by reference."),
  p("wipro", "reasoning", "Ranking", 2024, false, "hard", "In a row of 50 people, A is 18th from the left and B is 20th from the right. The number of people between them is:", ["11", "12", "13", "10"], 1, "B's position from left = 50 - 20 + 1 = 31. Between = 31 - 18 - 1 = 12."),

  // --- Accenture hard ---
  p("accenture", "cs-core", "Networks", 2024, true, "hard", "Which of these is a PRIVATE IP address range?", ["8.8.8.x", "192.168.x.x", "172.4.x.x", "11.0.x.x"], 1, "192.168.0.0/16 is reserved for private networks (with 10.0.0.0/8 and 172.16-31.x.x)."),
  p("accenture", "cs-core", "SQL", 2023, false, "hard", "Students has 5 rows; Marks has matching rows for only 3 students. SELECT * FROM Students LEFT JOIN Marks ... returns:", ["3 rows", "5 rows", "8 rows", "15 rows"], 1, "LEFT JOIN keeps every left-table row: all 5 students appear, 2 with NULL marks."),
  p("accenture", "cs-core", "OS", 2024, false, "hard", "A process waiting for disk I/O to complete is in which state?", ["Running", "Ready", "Blocked/Waiting", "Terminated"], 2, "A process waiting for an event (like I/O) is Blocked/Waiting; Ready means it can run but the CPU is busy."),
  p("accenture", "quant", "Time & Work", 2023, true, "hard", "15 workers can finish a job in 8 days. After 4 days, 5 workers leave. The remaining work takes:", ["5 days", "6 days", "8 days", "4 days"], 1, "Total = 120 worker-days; 60 done in 4 days. Remaining 60 by 10 workers = 6 days."),
  p("accenture", "reasoning", "Syllogism", 2024, false, "hard", "Some A are B. Some B are C. Conclusion: Some A are C.", ["Follows", "Does not follow", "Always true", "Certain"], 1, "The A's that are B may be entirely different B's from those that are C - nothing forces an overlap."),
  p("accenture", "reasoning", "Attention to Detail", 2023, false, "hard", "How many even digits are in the number 3847562?", ["3", "4", "5", "2"], 1, "Digits: 3, 8, 4, 7, 5, 6, 2. Even: 8, 4, 6, 2 -> four."),

  // --- Zoho hard ---
  p("zoho", "coding", "Arrays", 2024, true, "hard", "arr = [2, 4, 6, 8] (0-indexed). The sum of elements at ODD indexes is:", ["6", "10", "12", "8"], 2, "Odd indexes 1 and 3 hold 4 and 8: sum = 12."),
  p("zoho", "coding", "Recursion", 2023, false, "hard", "Using Euclid's algorithm, gcd(48, 18) is:", ["2", "3", "6", "9"], 2, "gcd(48,18) -> gcd(18,12) -> gcd(12,6) -> gcd(6,0) = 6."),
  p("zoho", "coding", "Complexity", 2024, true, "hard", "Building a string by concatenating one character at a time inside a loop of n iterations (immutable strings) costs:", ["O(n)", "O(n log n)", "O(n^2)", "O(1)"], 2, "Each concat copies the existing string: 1 + 2 + ... + n = O(n^2). Use a builder/buffer for O(n)."),
  p("zoho", "coding", "Linked List", 2023, false, "hard", "Using slow/fast pointers on a 9-node list (slow +1, fast +2), when fast reaches the end, slow is at node:", ["4", "5", "6", "3"], 1, "Slow moves half as fast, landing on the middle: node 5 of 9."),
  p("zoho", "coding", "Sorting", 2024, false, "hard", "Which of these sorting algorithms is stable?", ["Quick sort", "Heap sort", "Merge sort", "Selection sort"], 2, "Merge sort preserves the relative order of equal elements; quick, heap and selection do not (in standard forms)."),
  p("zoho", "coding", "Bitwise", 2024, true, "hard", "The number of 1-bits in the binary representation of 29 is:", ["3", "4", "5", "2"], 1, "29 = 11101 in binary -> four 1-bits."),

  // --- Cognizant hard ---
  p("cognizant", "coding", "Automata Fix", 2024, true, "hard", "A find-maximum function returns 0 for an array of all negative numbers. The bug is:", ["The loop runs too long", "max was initialised to 0 instead of the first element", "The array is unsorted", "The return type is wrong"], 1, "Initialising max = 0 fails for all-negative arrays; initialise with arr[0] (or the minimum possible value)."),
  p("cognizant", "cs-core", "SQL", 2023, false, "hard", "The key difference between DELETE and TRUNCATE in SQL is:", ["DELETE is faster", "TRUNCATE can use a WHERE clause", "DELETE can be filtered and rolled back; TRUNCATE removes all rows as DDL", "They are identical"], 2, "DELETE is row-by-row DML with WHERE support; TRUNCATE deallocates all rows at once and is DDL."),
  p("cognizant", "cs-core", "OS", 2024, false, "hard", "Threads of the same process share all of these EXCEPT:", ["Heap memory", "Global variables", "Code section", "Stack"], 3, "Each thread has its own stack; heap, globals and code are shared across the process's threads."),
  p("cognizant", "quant", "Trains", 2023, true, "hard", "A 150 m train at 60 km/h overtakes a man walking at 6 km/h in the same direction. Time to pass him:", ["8 s", "9 s", "10 s", "12 s"], 2, "Relative speed = 54 km/h = 15 m/s. Time = 150/15 = 10 s."),
  p("cognizant", "reasoning", "Clocks", 2024, false, "hard", "A clock gains 5 minutes every hour. If set correct at 7:00 am, what does it show when the correct time is 12:00 noon?", ["12:20 pm", "12:25 pm", "12:30 pm", "12:15 pm"], 1, "5 real hours pass; the clock gains 5 x 5 = 25 minutes -> shows 12:25 pm."),
  p("cognizant", "verbal", "Error Spotting", 2023, false, "hard", "Identify the error: 'The number of students in colleges are increasing every year.'", ["The number of", "students in colleges", "are increasing", "every year"], 2, "'The number of' is singular: 'is increasing'. (Compare: 'A number of students ARE'.)"),

  // --- General / Core Prep hard ---
  p("general", "quant", "Averages", 2024, true, "hard", "The average of 8 numbers is 27. If one number 35 is replaced by 19, the new average is:", ["24", "25", "26", "23"], 1, "The sum falls by 16; the average falls by 16/8 = 2 -> 27 - 2 = 25."),
  p("general", "reasoning", "Counting Figures", 2023, false, "hard", "The total number of squares in a 3 x 3 grid of unit squares is:", ["9", "13", "14", "12"], 2, "1x1: 9, 2x2: 4, 3x3: 1 -> 9 + 4 + 1 = 14."),
  p("general", "coding", "Bitwise", 2024, false, "hard", "a = 3, b = 5. After a = a^b; b = b^a; a = a^b; the values of a and b are:", ["3 and 5", "5 and 3", "0 and 0", "8 and 2"], 1, "The XOR swap exchanges values without a temp: a = 5, b = 3."),
  p("general", "cs-core", "Number Systems", 2023, false, "hard", "The hexadecimal number 1F in decimal is:", ["30", "31", "32", "29"], 1, "1F = 1 x 16 + 15 = 31."),
  p("general", "quant", "Equations", 2024, true, "hard", "If x + y = 10 and x - y = 4, then the product xy is:", ["20", "21", "24", "18"], 1, "Adding: 2x = 14 -> x = 7, y = 3 -> xy = 21."),
  p("general", "verbal", "Analogy", 2023, false, "hard", "Scarce : Abundant :: Brave : ?", ["Bold", "Cowardly", "Strong", "Fearless"], 1, "The pair are antonyms; the antonym of 'brave' is 'cowardly'."),

  // ===================== TCS (pattern-aligned, authored) =====================
  p("tcs", "quant", "HCF-LCM", 2024, true, "medium", "The LCM of 8, 12 and 15 is:", ["60", "90", "120", "240"], 2, "8 = 2^3, 12 = 2^2 x 3, 15 = 3 x 5; LCM = 2^3 x 3 x 5 = 120."),
  p("tcs", "quant", "Number System", 2024, true, "medium", "The unit digit of 9^53 is:", ["1", "3", "7", "9"], 3, "Unit digits of 9 alternate 9, 1; odd powers end in 9, so 9^53 ends in 9."),
  p("tcs", "quant", "Percentages", 2023, true, "hard", "If the price of sugar rises 25%, by what percent must consumption fall to keep expenditure unchanged?", ["15%", "20%", "25%", "12.5%"], 1, "Required reduction = 25/(100+25) x 100 = 25/125 x 100 = 20%."),
  p("tcs", "quant", "Ages", 2024, true, "medium", "The ratio of present ages of A and B is 3:4. After 5 years it becomes 4:5. A's present age is:", ["12", "15", "18", "20"], 1, "Let ages be 3k, 4k. (3k+5)/(4k+5) = 4/5 -> 15k+25 = 16k+20 -> k = 5, so A = 15."),
  p("tcs", "reasoning", "Series", 2024, true, "medium", "Find the next term: 2, 6, 12, 20, 30, ?", ["38", "40", "42", "44"], 2, "Terms are n(n+1): 1x2, 2x3, ..., 5x6 = 30; next = 6x7 = 42."),
  p("tcs", "reasoning", "Blood Relations", 2023, true, "medium", "A is the brother of B. B is the son of C. How is A related to C?", ["Father", "Son", "Brother", "Uncle"], 1, "A is B's brother and B is C's son, so A is also C's son."),
  p("tcs", "reasoning", "Direction Sense", 2024, false, "easy", "A man walks 5 km east, then turns left and walks 3 km. Which direction is he facing now?", ["North", "South", "East", "West"], 0, "Facing east, a left turn points him north."),
  p("tcs", "verbal", "Vocabulary", 2024, false, "easy", "Choose the synonym of 'Diligent':", ["Lazy", "Hard-working", "Careless", "Slow"], 1, "'Diligent' means showing careful, persistent effort - hard-working."),
  p("tcs", "verbal", "Error Spotting", 2023, false, "medium", "Identify the error: 'Each of the students have submitted their work.'", ["Each of", "the students", "have submitted", "their work"], 2, "'Each' is singular, so it should be 'has submitted'."),
  p("tcs", "coding", "C Output", 2024, true, "easy", "In C, what does printf(\"%d\", 7 % 3 + 2); print?", ["1", "2", "3", "5"], 2, "7 % 3 = 1, then 1 + 2 = 3."),
  p("tcs", "coding", "Complexity", 2024, true, "medium", "The time complexity of binary search on a sorted array of n elements is:", ["O(n)", "O(log n)", "O(n log n)", "O(1)"], 1, "Binary search halves the search space each step, giving O(log n)."),
  p("tcs", "coding", "Pseudocode", 2023, false, "medium", "What does this print?  int x = 5; while (x > 0) { x = x - 2; } print x;", ["0", "-1", "1", "-2"], 1, "x goes 5, 3, 1, -1; the loop stops when x = -1, which is printed."),
  p("tcs", "cs-core", "DBMS", 2024, true, "medium", "Which normal form removes partial dependency of non-key attributes on the key?", ["1NF", "2NF", "3NF", "BCNF"], 1, "2NF removes partial dependencies (after 1NF)."),

  // ===================== Zoho (programming-heavy, authored) =====================
  p("zoho", "coding", "C Output", 2024, true, "medium", "What is the output?  int a = 10, b = 3; printf(\"%d\", a / b * b);", ["9", "10", "1", "3"], 0, "Integer division: 10/3 = 3, then 3 x 3 = 9 (the remainder is lost)."),
  p("zoho", "coding", "Recursion", 2024, true, "medium", "A function returns n + f(n-1) with f(0) = 0. What is f(5)?", ["10", "15", "20", "25"], 1, "It sums 1..5 = 15."),
  p("zoho", "coding", "Strings", 2023, true, "medium", "In C, what does strlen(\"Zoho\\0Corp\") return?", ["4", "9", "8", "5"], 0, "strlen counts characters up to the first null terminator, so it returns 4."),
  p("zoho", "coding", "Arrays", 2024, true, "medium", "Given int a[] = {1,2,3,4,5}; what is a[a[1]]?", ["2", "3", "4", "1"], 1, "a[1] = 2, so a[a[1]] = a[2] = 3."),
  p("zoho", "coding", "Loops", 2023, false, "medium", "How many numbers does this print?  for (i=1; i<=5; i++) if (i % 2 == 0) print i;", ["2", "3", "5", "1"], 0, "It prints the even values 2 and 4, so 2 numbers."),
  p("zoho", "coding", "Arrays", 2024, true, "hard", "Element [2][1] of a 3x3 matrix in row-major order (0-indexed) sits at which linear index?", ["5", "6", "7", "8"], 2, "Index = row x columns + col = 2 x 3 + 1 = 7."),
  p("zoho", "coding", "Bit Manipulation", 2023, false, "medium", "Evaluate the bitwise OR expression: 6 | 1", ["6", "7", "1", "0"], 1, "0110 | 0001 = 0111 = 7."),
  p("zoho", "coding", "Recursion", 2024, true, "hard", "With f(0)=0 and f(1)=1, the 7th Fibonacci number f(7) equals:", ["8", "13", "21", "11"], 1, "Sequence: 0,1,1,2,3,5,8,13; f(7) = 13."),
  p("zoho", "coding", "Patterns", 2023, false, "medium", "To print a right-angled triangle of stars with n rows, the inner loop in row i (1-indexed) runs:", ["n times", "i times", "1 time", "n - i times"], 1, "Row i prints i stars, so the inner loop runs i times."),
  p("zoho", "coding", "C Output", 2024, false, "medium", "What does this print?  int x = 5; printf(\"%d\", x++);", ["5", "6", "4", "0"], 0, "Post-increment uses the current value (5), then increments x."),
  p("zoho", "coding", "Operators", 2024, true, "hard", "Given a = 4, b = 7, after a = a + b; b = a - b; a = a - b; the values are:", ["4 and 7", "7 and 4", "11 and 4", "0 and 0"], 1, "This swaps without a temp: a = 7, b = 4."),
  p("zoho", "cs-core", "Data Structures", 2023, true, "medium", "Which data structure manages function calls and returns?", ["Queue", "Stack", "Heap", "Graph"], 1, "The call stack is a LIFO stack of activation records."),
  p("zoho", "cs-core", "Complexity", 2024, false, "medium", "The worst-case time to search an unsorted array of n elements is:", ["O(1)", "O(log n)", "O(n)", "O(n^2)"], 2, "You may have to scan every element, so O(n)."),

  // ===================== Cognizant (GenC, authored) =====================
  p("cognizant", "quant", "Percentages", 2024, true, "medium", "A student scored 60% and got 300 marks. The maximum marks are:", ["450", "480", "500", "600"], 2, "0.60 x max = 300 -> max = 500."),
  p("cognizant", "quant", "Profit & Loss", 2024, true, "medium", "An article bought for Rs 400 is sold for Rs 480. The profit percent is:", ["15%", "20%", "25%", "18%"], 1, "Profit = 80 on 400 = 20%."),
  p("cognizant", "quant", "Averages", 2023, false, "easy", "The average of the first five even numbers (2, 4, 6, 8, 10) is:", ["5", "6", "7", "8"], 1, "Sum = 30, average = 30/5 = 6."),
  p("cognizant", "quant", "Trains", 2024, true, "medium", "A train 150 m long crosses a pole in 15 s. Its speed is:", ["36 km/h", "40 km/h", "45 km/h", "30 km/h"], 0, "Speed = 150/15 = 10 m/s = 10 x 18/5 = 36 km/h."),
  p("cognizant", "reasoning", "Series", 2024, false, "easy", "Find the next term: 1, 4, 9, 16, ?", ["20", "24", "25", "36"], 2, "Perfect squares 1,4,9,16; next = 5^2 = 25."),
  p("cognizant", "reasoning", "Coding-Decoding", 2023, true, "medium", "If CAT is coded as 3-1-20, then DOG is coded as:", ["4-15-7", "4-14-7", "3-15-7", "4-15-8"], 0, "Using letter positions: D=4, O=15, G=7."),
  p("cognizant", "reasoning", "Blood Relations", 2024, true, "medium", "P is the mother of Q. Q is the father of R. How is P related to R?", ["Mother", "Aunt", "Grandmother", "Sister"], 2, "P is Q's mother and Q is R's father, so P is R's grandmother."),
  p("cognizant", "verbal", "Vocabulary", 2024, false, "easy", "Choose the synonym of 'Rapid':", ["Slow", "Quick", "Late", "Calm"], 1, "'Rapid' means happening fast - quick."),
  p("cognizant", "verbal", "Sentence Completion", 2023, false, "medium", "Choose the correct word: 'He has been working here ___ 2018.'", ["for", "since", "from", "by"], 1, "'Since' is used with a point in time (2018)."),
  p("cognizant", "coding", "C Output", 2024, true, "easy", "In C, what does printf(\"%d\", 2 + 3 * 4); print?", ["14", "20", "24", "9"], 0, "Multiplication first: 3 x 4 = 12, then 2 + 12 = 14."),
  p("cognizant", "cs-core", "Operating Systems", 2024, true, "medium", "Under which CPU scheduling policy can a low-priority process starve?", ["FCFS", "Round Robin", "Priority", "None of these"], 2, "Low-priority processes may wait indefinitely under priority scheduling."),
  p("cognizant", "cs-core", "DBMS", 2023, true, "medium", "A primary key column cannot contain:", ["Unique values", "NULL values", "Integers", "Text"], 1, "A primary key must be unique and NOT NULL."),

  // ===================== Accenture (cognitive + technical, authored) =====================
  p("accenture", "quant", "Algebra", 2024, true, "medium", "If 5x = 45, then x^2 equals:", ["72", "81", "90", "64"], 1, "x = 9, so x^2 = 81."),
  p("accenture", "quant", "Percentages", 2024, true, "medium", "30% of 30% of 1000 is:", ["60", "90", "100", "300"], 1, "0.30 x 0.30 x 1000 = 90."),
  p("accenture", "quant", "Ratio", 2023, false, "medium", "Rs 880 is divided between A and B in the ratio 5:6. B's share is:", ["Rs 400", "Rs 480", "Rs 440", "Rs 360"], 1, "B = 6/11 x 880 = Rs 480."),
  p("accenture", "reasoning", "Classification", 2024, true, "medium", "Find the odd one out: 121, 144, 169, 200", ["121", "144", "169", "200"], 3, "121, 144, 169 are perfect squares (11^2, 12^2, 13^2); 200 is not."),
  p("accenture", "reasoning", "Series", 2024, false, "easy", "Find the next term: 7, 14, 28, 56, ?", ["98", "112", "120", "104"], 1, "Each term doubles: 56 x 2 = 112."),
  p("accenture", "reasoning", "Direction Sense", 2023, false, "medium", "Facing south, you turn 90 degrees clockwise. You now face:", ["East", "West", "North", "South"], 1, "From south, a clockwise quarter turn faces west."),
  p("accenture", "verbal", "Vocabulary", 2024, false, "easy", "Choose the synonym of 'Generous':", ["Stingy", "Kind", "Selfish", "Mean"], 1, "'Generous' means willing to give - kind/liberal."),
  p("accenture", "verbal", "Error Spotting", 2023, false, "medium", "Identify the error: 'She don't like tea.'", ["She", "don't", "like", "tea"], 1, "Third-person singular needs 'doesn't': 'She doesn't like tea.'"),
  p("accenture", "coding", "Pseudocode", 2024, true, "medium", "What is printed?  a = 2; b = 3; a = a + b; b = a - b; print a, b;", ["5 2", "2 3", "3 2", "5 3"], 0, "a = 2+3 = 5; b = 5-3 = 2; output is 5 2."),
  p("accenture", "coding", "Complexity", 2024, true, "medium", "Two nested loops, each running n times, give a time complexity of:", ["O(n)", "O(n^2)", "O(log n)", "O(n log n)"], 1, "n iterations inside n iterations = n x n = O(n^2)."),
  p("accenture", "cs-core", "Networks", 2024, true, "medium", "Which protocol is used to send email between mail servers?", ["HTTP", "SMTP", "FTP", "DNS"], 1, "SMTP (Simple Mail Transfer Protocol) sends email."),
  p("accenture", "cs-core", "Networks", 2023, false, "easy", "HTTP uses which default port?", ["21", "80", "443", "25"], 1, "HTTP uses port 80 by default (HTTPS uses 443)."),

  // ===== Grounded in real company papers (Zoho matrix test, Cognizant/Accenture aptitude, TCS) =====
  // Zoho signature: matrix-transformation logic
  p("zoho", "reasoning", "Matrix Reasoning", 2024, true, "medium", "A 2x2 matrix is [[1, 2], [3, 4]]. After interchanging Row 1 and Row 2, the element at Row 1, Column 2 is:", ["1", "2", "3", "4"], 3, "After swapping rows the matrix is [[3, 4], [1, 2]], so Row 1, Column 2 = 4."),
  p("zoho", "reasoning", "Matrix Reasoning", 2024, true, "medium", "A 2x2 matrix is [[1, 2], [3, 4]]. After interchanging Column 1 and Column 2, the element at Row 2, Column 1 is:", ["1", "2", "3", "4"], 3, "After swapping columns the matrix is [[2, 1], [4, 3]], so Row 2, Column 1 = 4."),
  p("zoho", "reasoning", "Matrix Reasoning", 2024, false, "medium", "In a matrix where the element at Row r, Column c equals r x c (1-indexed), the element at Row 3, Column 4 is:", ["7", "9", "12", "16"], 2, "Row 3, Column 4 = 3 x 4 = 12."),
  p("zoho", "reasoning", "Matrix Reasoning", 2023, false, "hard", "A 3x3 matrix is filled row-wise with 1..9 (1,2,3 / 4,5,6 / 7,8,9). After transposing it, the element at Row 1, Column 3 is:", ["1", "3", "7", "9"], 2, "Transposing swaps rows and columns: new[1][3] = old[3][1] = 7."),
  // Cognizant aptitude patterns
  p("cognizant", "quant", "Time-Speed-Distance", 2024, true, "hard", "Walking at 12 km/h instead of 8 km/h, a person would cover 10 km more in the same time. The actual distance he covers is:", ["18 km", "20 km", "24 km", "25 km"], 1, "If x = 8t and x + 10 = 12t, then 4t = 10, t = 2.5 h, so actual distance = 8 x 2.5 = 20 km."),
  p("cognizant", "quant", "Time-Speed-Distance", 2024, true, "medium", "Excluding stoppages a bus runs at 60 km/h; including stoppages it averages 48 km/h. How many minutes per hour does it stop?", ["10", "12", "15", "9"], 1, "It covers 12 km less per hour; stoppage time = (12/60) x 60 = 12 minutes."),
  p("cognizant", "quant", "Compound Interest", 2023, true, "hard", "On Rs 2000 for 2 years at 10% per annum, by how much does the compound interest exceed the simple interest?", ["Rs 10", "Rs 20", "Rs 40", "Rs 21"], 1, "SI = 2000 x 10 x 2/100 = 400; CI = 2000 x (1.1^2 - 1) = 420; difference = 20 = P x (R/100)^2."),
  // Accenture aptitude patterns
  p("accenture", "quant", "Time & Work", 2024, true, "hard", "A group of men finishes a job in 45 days. With 10 fewer men it would take 60 days. The original number of men is:", ["30", "40", "50", "45"], 1, "Men x days is constant: 45x = 60(x - 10) -> 15x = 600 -> x = 40."),
  p("accenture", "quant", "Averages", 2024, true, "medium", "The average weight of a group rose by 0.5 kg when a member's weight was recorded as 83 kg instead of 63 kg. The number of members is:", ["30", "40", "20", "45"], 1, "Total weight rose by 83 - 63 = 20 kg; n x 0.5 = 20 -> n = 40."),

  // ===== Infosys (signature painted-cube, P&C and ratio patterns) =====
  p("infosys", "quant", "Cubes & Cuboids", 2024, true, "medium", "A cube painted on all faces is cut into 27 equal smaller cubes. How many small cubes have exactly TWO faces painted?", ["6", "8", "12", "1"], 2, "In a 3x3x3 cube the two-face-painted cubes lie on the edges (not corners): 12 edges x 1 = 12."),
  p("infosys", "quant", "Cubes & Cuboids", 2024, true, "medium", "A cube painted on all faces is cut into 27 equal smaller cubes. How many have exactly THREE faces painted?", ["8", "12", "6", "0"], 0, "The three-face-painted cubes are the 8 corners of the cube."),
  p("infosys", "quant", "Cubes & Cuboids", 2023, false, "medium", "A cube painted on all faces is cut into 27 equal smaller cubes. How many have exactly ONE face painted?", ["1", "6", "8", "12"], 1, "The one-face-painted cubes are the centre of each face: 6 faces x 1 = 6."),
  p("infosys", "quant", "Cubes & Cuboids", 2023, false, "hard", "A cube painted on all faces is cut into 27 equal smaller cubes. How many have NO face painted?", ["0", "1", "6", "8"], 1, "Only the single innermost cube has no painted face."),
  p("infosys", "quant", "Permutations", 2024, true, "medium", "In how many ways can the letters of the word 'INFO' (all distinct) be arranged?", ["12", "24", "16", "6"], 1, "All 4 letters are distinct, so arrangements = 4! = 24."),
  p("infosys", "quant", "Ratio", 2024, false, "hard", "Rs 60 is divided among 200 children; each girl gets 20 paise and each boy 40 paise. The number of girls is:", ["80", "100", "120", "150"], 1, "Let girls = g: 0.20g + 0.40(200 - g) = 60 -> 80 - 0.20g = 60 -> g = 100."),

  // ===== Wipro Elite NLTH (aptitude / reasoning / coding / verbal pattern) =====
  p("wipro", "reasoning", "Series", 2024, true, "medium", "Find the next term: 2, 5, 10, 17, 26, ?", ["35", "37", "38", "40"], 1, "Each term is n^2 + 1 (1+1, 4+1, 9+1, ...); next = 6^2 + 1 = 37."),
  p("wipro", "quant", "Percentages", 2024, true, "easy", "If 40% of a number is 56, the number is:", ["120", "140", "160", "150"], 1, "Number = 56 / 0.40 = 140."),
  p("wipro", "coding", "C Output", 2024, true, "easy", "What does this print?  int s = 0; for (i = 1; i <= 4; i++) s += i; print s;", ["6", "10", "16", "4"], 1, "It sums 1 + 2 + 3 + 4 = 10."),
  p("wipro", "verbal", "Spelling", 2023, false, "easy", "Which of these words is spelled correctly?", ["Definitely", "Definitly", "Definately", "Defenitely"], 0, "The correct spelling is 'Definitely'."),
  p("wipro", "reasoning", "Coding-Decoding", 2024, false, "medium", "In a code 'PEN' is written as 'QFO' (each letter +1). How is 'BOOK' written?", ["CPPL", "CPPM", "DPPL", "CPQL"], 0, "Shift each letter forward by 1: B->C, O->P, O->P, K->L, giving CPPL."),

  // ===== Grounded in real material: "500 most asked apti ques in TCS, Wipro, Infosys" (cryptarithmetic, combinatorics, probability sections) =====
  p("infosys", "quant", "Cryptarithmetic", 2024, true, "hard", "In the sum A+A+A = BA (a two-digit number), where A and B are distinct non-zero digits, what is A+B?", ["6", "7", "8", "9"], 0, "3A must end in A, so 2A is a multiple of 10, giving A = 5. Then 3x5 = 15, so B = 1. A+B = 5+1 = 6."),
  p("tcs", "quant", "Permutations & Combinations", 2024, true, "medium", "A sentence is formed by choosing exactly 1 noun from 6 nouns, 1 verb from 4 verbs, and then arranging the 2 chosen words in order. How many distinct sentences are possible?", ["24", "48", "10", "12"], 1, "Choose 1 noun (6 ways) and 1 verb (4 ways): 6x4 = 24 word-pairs. Each pair can be arranged in 2! = 2 orders, giving 24x2 = 48 sentences."),
  p("tcs", "quant", "Probability", 2024, true, "hard", "A drawer has 18 red socks and 18 blue socks, all mixed in the dark. What is the minimum number of socks you must pull out to be certain of having a matching pair?", ["2", "3", "4", "18"], 1, "There are only 2 colors. By the pigeonhole principle, after pulling 3 socks at least 2 must share a color, guaranteeing a matching pair."),
  p("tcs", "quant", "Probability", 2023, true, "hard", "4 letters are placed at random into 4 addressed envelopes, one letter per envelope. What is the probability that NONE of the letters goes into its correct envelope?", ["1/4", "3/8", "1/3", "1/2"], 1, "The number of derangements of 4 items is D(4) = 9 (using D(n) = n! x sum of (-1)^k/k!). Total arrangements = 4! = 24. Probability = 9/24 = 3/8."),


]

const COMPANY_PYQ_PLAN: Record<CompanyId, Partial<Record<SectionId, number>>> = {
  tcs: { quant: 95, reasoning: 82, verbal: 72, coding: 92, "cs-core": 68, "comm-interview": 78 },
  infosys: { quant: 98, reasoning: 84, verbal: 74, coding: 102, "cs-core": 70, "comm-interview": 78 },
  wipro: { quant: 92, reasoning: 78, verbal: 96, coding: 78, "cs-core": 64, "comm-interview": 96 },
  accenture: { quant: 82, reasoning: 92, verbal: 78, coding: 74, "cs-core": 110, "comm-interview": 96 },
  zoho: { quant: 55, reasoning: 55, verbal: 36, coding: 225, "cs-core": 82, "comm-interview": 70 },
  cognizant: { quant: 92, reasoning: 92, verbal: 78, coding: 98, "cs-core": 78, "comm-interview": 92 },
  general: { quant: 85, reasoning: 80, verbal: 70, coding: 95, "cs-core": 80, "comm-interview": 90 },
}

const COMPANY_SOURCE: Record<CompanyId, string> = {
  tcs: "tcs-nqt-official",
  infosys: "infosys-careers",
  wipro: "wipro-careers",
  accenture: "accenture-careers",
  zoho: "zoho-careers",
  cognizant: "cognizant-careers",
  general: "studybench-curriculum",
}

function sectionSeed(company: CompanyId, section: SectionId): number {
  const key = `${company}:${section}:expanded-pyq`
  let hash = 5381
  for (let i = 0; i < key.length; i++) hash = (hash * 33) ^ key.charCodeAt(i)
  return Math.abs(hash)
}

const COMMUNICATION_PYQ_TEMPLATES = [
  {
    topic: "Self Introduction",
    prompt: "Which opening is strongest for a fresher interview self-introduction?",
    options: [
      "I was born in my hometown and then studied many subjects.",
      "I am a final-year student with a project in web development and strong interest in problem solving.",
      "Everything is already written in my resume.",
      "I do not know what to say about myself.",
    ],
    answer: 1,
    explanation: "A strong opening is concise, role-relevant and points the panel toward skills or projects worth discussing.",
  },
  {
    topic: "HR Answering",
    prompt: "When asked about a weakness, which response is most professional?",
    options: [
      "I have no weakness.",
      "I am weak in time management, so I now plan tasks with deadlines and weekly review.",
      "My weakness is that I work too hard.",
      "I cannot answer personal questions.",
    ],
    answer: 1,
    explanation: "A credible weakness plus a concrete improvement action shows self-awareness and maturity.",
  },
  {
    topic: "Email Writing",
    prompt: "A professional interview follow-up email should mainly include:",
    options: [
      "Slang and repeated reminders.",
      "Thanks, role reference, one specific point discussed, and a polite closing.",
      "A demand for immediate selection.",
      "Only emojis and no subject line.",
    ],
    answer: 1,
    explanation: "Follow-up mail should be brief, specific, polite and easy for the recruiter to place.",
  },
  {
    topic: "Group Discussion",
    prompt: "In a group discussion, the best way to disagree is to:",
    options: [
      "Interrupt loudly so your point is heard.",
      "Say the other person is wrong without explanation.",
      "Acknowledge the point, add evidence, and present your view calmly.",
      "Stay silent for the whole discussion.",
    ],
    answer: 2,
    explanation: "GD evaluation rewards clarity, listening, evidence and professional tone, not domination.",
  },
  {
    topic: "Project Explanation",
    prompt: "Which project explanation order is most interview-friendly?",
    options: [
      "Technology names first, then random details.",
      "Problem, users, your role, architecture, challenge solved, result.",
      "Only screenshots and no explanation.",
      "Team members' work first, your work last.",
    ],
    answer: 1,
    explanation: "This structure helps the interviewer see context, ownership, technical depth and impact.",
  },
  {
    topic: "Managerial Round",
    prompt: "If you are blocked on a task during training, the best response is to:",
    options: [
      "Wait silently until someone notices.",
      "Try briefly, document what you tried, then ask a specific question.",
      "Blame the tool or teammate immediately.",
      "Delete the task from your plan.",
    ],
    answer: 1,
    explanation: "Recruiters look for ownership: independent effort, clear communication and timely escalation.",
  },
  {
    topic: "Communication Assessment",
    prompt: "Which sentence is best for a spoken communication test?",
    options: [
      "Actually basically I am saying like maybe.",
      "My main point is that clear planning reduces rework.",
      "Umm... I don't know... maybe yes.",
      "This topic is boring, so I will stop.",
    ],
    answer: 1,
    explanation: "Clear, direct sentences with one idea per line score better than filler-heavy speech.",
  },
  {
    topic: "Recruiter Fit",
    prompt: "When asked why you want a service-company role, the best answer should emphasize:",
    options: [
      "Only salary.",
      "Client exposure, structured learning, willingness to adapt and relevant skills.",
      "That you will leave after training.",
      "That any company is fine.",
    ],
    answer: 1,
    explanation: "Service recruiters value learning agility, communication and readiness for client/project environments.",
  },
] as const

function communicationPyqsFor(company: CompanyId, count: number): (PYQ & { company: CompanyId })[] {
  const scenarios = [
    "self-introduction",
    "technical interview",
    "HR round",
    "group discussion",
    "project explanation",
    "communication assessment",
    "managerial round",
    "training-readiness",
  ]
  return Array.from({ length: count }, (_, i) => {
    const template = COMMUNICATION_PYQ_TEMPLATES[i % COMMUNICATION_PYQ_TEMPLATES.length]
    const scenario = scenarios[Math.floor(i / COMMUNICATION_PYQ_TEMPLATES.length) % scenarios.length]
    const cycle = Math.floor(i / (COMMUNICATION_PYQ_TEMPLATES.length * scenarios.length)) + 1
    const difficulty: Question["difficulty"] =
      i % 6 === 0 ? "hard" : i % 3 === 0 ? "medium" : "easy"
    return {
      id: `pyq-${company}-comm-interview-${i + 1}`,
      company,
      section: "comm-interview",
      topic: template.topic,
      year: i % 2 === 0 ? 2026 : 2025,
      frequentlyAsked: i % 2 === 0,
      difficulty,
      prompt: `${template.prompt} (${company === "general" ? "core" : company.toUpperCase()} ${scenario} pattern set ${cycle})`,
      options: [...template.options],
      answer: template.answer,
      explanation: `${template.explanation} This ${difficulty} item checks ${scenario.replace("-", " ")} judgement for campus placement rounds.`,
      sourceId: "studybench-curriculum",
      patternSourceId: COMPANY_SOURCE[company],
    }
  })
}

function generatedSectionPyqs(
  company: CompanyId,
  sectionId: SectionId,
  count: number,
  existingPrompts: Set<string>,
): (PYQ & { company: CompanyId })[] {
  const easy = Math.ceil(count * 0.2)
  const medium = Math.ceil(count * 0.4)
  const hard = Math.max(0, count - easy - medium)
  const seed = sectionSeed(company, sectionId)
  const generated = [
    ...generateDrillsByDifficulty(sectionId, easy, "easy", seed + 11),
    ...generateDrillsByDifficulty(sectionId, medium, "medium", seed + 23),
    ...generateDrillsByDifficulty(sectionId, hard, "hard", seed + 37),
  ]

  const fallback = generateDrills(sectionId, count * 3, seed + 49)
  const usedPrompts = new Set(existingPrompts)
  return [...generated, ...fallback]
    .filter((question) => {
      const key = question.prompt.trim().toLowerCase()
      if (usedPrompts.has(key)) return false
      usedPrompts.add(key)
      return true
    })
    .slice(0, count)
    .map((question, i) => ({
      ...question,
      id: `pyq-${company}-${sectionId}-${i + 1}`,
      company,
      section: sectionId,
      year: i % 2 === 0 ? 2026 : 2025,
      frequentlyAsked: i % 3 === 0,
      sourceId: "studybench-curriculum",
      patternSourceId: COMPANY_SOURCE[company],
    }))
}

function generatedPyqsFor(company: CompanyId): (PYQ & { company: CompanyId })[] {
  const plan = COMPANY_PYQ_PLAN[company]
  return Object.entries(plan).flatMap(([section, count]) => {
    const sectionId = section as SectionId
    const existingPrompts = new Set(
      PYQS.filter((question) => question.company === company && question.section === sectionId)
        .map((question) => question.prompt.trim().toLowerCase()),
    )
    if (sectionId === "comm-interview") {
      return communicationPyqsFor(company, count ?? 0)
    }
    return generatedSectionPyqs(company, sectionId, count ?? 0, existingPrompts)
  })
}

export const EXPANDED_PYQS: (PYQ & { company: CompanyId })[] = [
  ...generatedPyqsFor("tcs"),
  ...generatedPyqsFor("infosys"),
  ...generatedPyqsFor("wipro"),
  ...generatedPyqsFor("accenture"),
  ...generatedPyqsFor("zoho"),
  ...generatedPyqsFor("cognizant"),
  ...generatedPyqsFor("general"),
]
export const ALL_PYQS: (PYQ & { company: CompanyId })[] = [
  ...FLAGSHIP_PYQS,
  ...PYQS,
  ...EXPANDED_PYQS,
]

const PYQS_BY_COMPANY = ALL_PYQS.reduce(
  (acc, question) => {
    acc[question.company].push(question)
    return acc
  },
  {
    tcs: [],
    infosys: [],
    wipro: [],
    accenture: [],
    zoho: [],
    cognizant: [],
    general: [],
  } as Record<CompanyId, (PYQ & { company: CompanyId })[]>,
)

const PYQS_BY_SECTION = ALL_PYQS.reduce(
  (acc, question) => {
    acc[question.section].push(question)
    return acc
  },
  {
    quant: [],
    reasoning: [],
    verbal: [],
    coding: [],
    "cs-core": [],
    "comm-interview": [],
  } as Record<SectionId, (PYQ & { company: CompanyId })[]>,
)

export function pyqsForCompany(companyId: CompanyId): (PYQ & { company: CompanyId })[] {
  return PYQS_BY_COMPANY[companyId]
}

const DAILY_CHALLENGE_SIZE = 5

function dailySeedFor(dateKey: string, category: "general" | "aptitude" | "coding"): number {
  const key = `${dateKey}:${category}:daily-challenge`
  let hash = 2166136261
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash)
}

function seededSample(pool: Question[], count: number, seed: number): Question[] {
  const copy = [...pool]
  let state = seed || 1
  function next() {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, count)
}

function languageCodingDailyQuestions(seed: number): Question[] {
  const sets = [
    {
      language: "C",
      questions: [
        {
          prompt: "C output: int x = 5; printf(\"%d\", x++); What is printed?",
          options: ["5", "6", "0", "Compilation error"],
          answer: 0,
          explanation: "Post-increment prints the current value first, then increments x.",
        },
        {
          prompt: "C output: printf(\"%d\", 17 % 5); What is printed?",
          options: ["2", "3", "5", "17"],
          answer: 0,
          explanation: "17 modulo 5 leaves remainder 2.",
        },
        {
          prompt: "C concept: Which loop runs at least once even if the condition is false?",
          options: ["do-while", "for", "while", "foreach"],
          answer: 0,
          explanation: "A do-while loop checks the condition after executing the body once.",
        },
      ],
    },
    {
      language: "C++",
      questions: [
        {
          prompt: "C++ STL: Which container follows LIFO order?",
          options: ["stack", "queue", "vector", "map"],
          answer: 0,
          explanation: "std::stack is last-in-first-out.",
        },
        {
          prompt: "C++ concept: What does pass-by-reference avoid for large objects?",
          options: ["Copying the object", "Compilation", "Function calls", "Variable names"],
          answer: 0,
          explanation: "References allow the function to use the same object instead of copying it.",
        },
        {
          prompt: "C++ output idea: vector indexes start from:",
          options: ["0", "1", "-1", "The vector size"],
          answer: 0,
          explanation: "Like arrays, vector indexing is zero-based.",
        },
      ],
    },
    {
      language: "Java",
      questions: [
        {
          prompt: "Java concept: Which keyword creates an object?",
          options: ["new", "class", "this", "extends"],
          answer: 0,
          explanation: "The new keyword allocates and constructs a new object.",
        },
        {
          prompt: "Java output: \"code\".length() returns:",
          options: ["4", "3", "5", "Compilation error"],
          answer: 0,
          explanation: "The string code has four characters.",
        },
        {
          prompt: "Java OOP: Which keyword is used for inheritance?",
          options: ["extends", "implements", "inherits", "superclass"],
          answer: 0,
          explanation: "A class extends another class in Java inheritance.",
        },
      ],
    },
    {
      language: "Python",
      questions: [
        {
          prompt: "Python output: len([1, 2, 3]) returns:",
          options: ["3", "2", "4", "1"],
          answer: 0,
          explanation: "The list contains three elements.",
        },
        {
          prompt: "Python output: 7 // 2 returns:",
          options: ["3", "3.5", "4", "2"],
          answer: 0,
          explanation: "// performs floor integer division.",
        },
        {
          prompt: "Python concept: Which type stores key-value pairs?",
          options: ["dict", "list", "tuple", "set"],
          answer: 0,
          explanation: "A dictionary stores mappings from keys to values.",
        },
      ],
    },
    {
      language: "JavaScript",
      questions: [
        {
          prompt: "JavaScript output: [1, 2, 3].length is:",
          options: ["3", "2", "4", "undefined"],
          answer: 0,
          explanation: "The array contains three elements.",
        },
        {
          prompt: "JavaScript concept: Which declaration can be reassigned?",
          options: ["let", "const", "class", "import"],
          answer: 0,
          explanation: "let variables can be reassigned; const bindings cannot.",
        },
        {
          prompt: "JavaScript output: typeof \"hello\" returns:",
          options: ["string", "text", "char", "object"],
          answer: 0,
          explanation: "typeof returns string for string values.",
        },
      ],
    },
  ] as const

  return sets.map((set, i) => {
    const item = set.questions[(seed + i) % set.questions.length]
    return {
      id: `daily-coding-${set.language.toLowerCase().replace(/\W+/g, "")}-${seed}-${i}`,
      topic: `${set.language} Programming`,
      difficulty: i % 2 === 0 ? "easy" : "medium",
      prompt: item.prompt,
      options: [...item.options],
      answer: item.answer,
      explanation: item.explanation,
      sourceId: set.language === "Python" ? "python-docs-data-structures" : "studybench-curriculum",
    }
  })
}

/**
 * Pool used to generate the Daily Challenge by category. Combines the curated
 * PYQ bank with fresh practice questions (seeded by the day so
 * a given day's set is stable) - giving students a deep, varied daily set.
 */
export function dailyPool(category: "general" | "aptitude" | "coding"): Question[] {
  const seed = todaySeed()
  if (category === "coding") {
    return [
      ...languageCodingDailyQuestions(seed),
      ...PYQS_BY_SECTION.coding,
      ...generateDrills("coding", 40, seed),
    ]
  }
  if (category === "aptitude") {
    return [
      ...PYQS_BY_SECTION.quant,
      ...PYQS_BY_SECTION.reasoning,
      ...generateDrills("quant", 25, seed),
      ...generateDrills("reasoning", 25, seed + 1),
    ]
  }
  return [...ALL_PYQS, ...generateDrills("mixed", 40, seed + 2)]
}

export function dailyChallengeQuestions(
  category: "general" | "aptitude" | "coding",
  dateKey = new Date().toISOString().slice(0, 10),
): Question[] {
  const seed = dailySeedFor(dateKey, category)
  if (category === "coding") {
    return languageCodingDailyQuestions(seed)
  }
  return seededSample(dailyPool(category), DAILY_CHALLENGE_SIZE, seed)
}
