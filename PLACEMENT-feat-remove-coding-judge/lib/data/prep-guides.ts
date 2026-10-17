import type { SectionId } from "@/lib/types"

export interface WeeklyPlanDay {
  day: string
  focus: string
  tasks: string[]
  checkpoint: string
}

export interface WeeklyPlan {
  id: string
  title: string
  level: "foundation" | "drive-ready" | "product-track"
  summary: string
  days: WeeklyPlanDay[]
}

export interface RevisionSheet {
  id: string
  section: SectionId
  title: string
  goal: string
  formulas: string[]
  traps: string[]
  drills: string[]
}

export const WEEKLY_PLANS: WeeklyPlan[] = [
  {
    id: "foundation-4-week",
    title: "4-week foundation placement plan",
    level: "foundation",
    summary: "For students starting from basics and targeting service-company campus drives.",
    days: [
      {
        day: "Monday",
        focus: "Quant basics",
        tasks: ["Percentages and ratios", "Time-speed-distance", "30 timed arithmetic questions"],
        checkpoint: "Maintain 70%+ accuracy before increasing speed.",
      },
      {
        day: "Tuesday",
        focus: "Reasoning basics",
        tasks: ["Series", "Blood relations", "Directions", "2 seating mini-puzzles"],
        checkpoint: "Write diagrams for every reasoning question.",
      },
      {
        day: "Wednesday",
        focus: "Verbal accuracy",
        tasks: ["Subject-verb agreement", "Prepositions", "1 reading comprehension set"],
        checkpoint: "Review every wrong grammar rule in the mistake notebook.",
      },
      {
        day: "Thursday",
        focus: "Coding fundamentals",
        tasks: ["Loops", "Arrays", "Strings", "Dry-run 5 output questions"],
        checkpoint: "Explain time complexity for each solved problem.",
      },
      {
        day: "Friday",
        focus: "CS core",
        tasks: ["DBMS keys and joins", "OS process/thread", "OOP pillars"],
        checkpoint: "Answer each concept with definition plus example.",
      },
      {
        day: "Saturday",
        focus: "Mock and revision",
        tasks: ["1 mini mock", "Revise weakest 2 topics", "Redo saved mistakes"],
        checkpoint: "Score at least 60% and list the top 3 errors.",
      },
      {
        day: "Sunday",
        focus: "Interview communication",
        tasks: ["Self-introduction", "1 GD topic", "5 HR questions"],
        checkpoint: "Keep answers under 90 seconds and evidence-based.",
      },
    ],
  },
  {
    id: "drive-ready-7-day",
    title: "7-day drive-ready sprint",
    level: "drive-ready",
    summary: "For the week before a company test, with mocks and targeted revision.",
    days: [
      {
        day: "Day 1",
        focus: "Diagnostic mock",
        tasks: ["Take one mini mock", "Tag weak topics", "Create a revision shortlist"],
        checkpoint: "Do not start new topics until weak areas are identified.",
      },
      {
        day: "Day 2",
        focus: "Numerical pressure",
        tasks: ["Data interpretation", "Time and work", "Profit/loss", "20 hard quant questions"],
        checkpoint: "Skip slow questions after 90 seconds during timed sets.",
      },
      {
        day: "Day 3",
        focus: "Reasoning pressure",
        tasks: ["Seating arrangement", "Syllogism", "Data sufficiency", "2 puzzle sets"],
        checkpoint: "Separate possible cases instead of guessing.",
      },
      {
        day: "Day 4",
        focus: "Verbal and communication",
        tasks: ["2 RC passages", "Error spotting", "Email/essay outline", "Spoken clarity drill"],
        checkpoint: "Choose answers only from passage evidence.",
      },
      {
        day: "Day 5",
        focus: "Coding and CS core",
        tasks: ["Arrays/strings", "Debugging", "DBMS/OS/OOP flash revision", "Hidden-case checklist"],
        checkpoint: "Test empty, single, duplicate and large inputs.",
      },
      {
        day: "Day 6",
        focus: "Full-length simulation",
        tasks: ["Take one full-length mock", "Review section timing", "Redo mistakes"],
        checkpoint: "Reach company cutoff or identify one final weak area.",
      },
      {
        day: "Day 7",
        focus: "Light revision",
        tasks: ["Formula sheet", "Interview basics", "Sleep and logistics checklist"],
        checkpoint: "No heavy new topic today; protect confidence and recall.",
      },
    ],
  },
  {
    id: "product-company-6-week",
    title: "6-week product-company coding ladder",
    level: "product-track",
    summary: "For Zoho/product-style roles where coding depth matters more than MCQ volume.",
    days: [
      {
        day: "Week 1",
        focus: "Implementation speed",
        tasks: ["Arrays", "Strings", "Number logic", "Pattern printing"],
        checkpoint: "Solve easy problems without syntax confusion.",
      },
      {
        day: "Week 2",
        focus: "Hashing and two pointers",
        tasks: ["Frequency maps", "Anagrams", "Pair sum", "Sliding window"],
        checkpoint: "Replace nested loops with O(n) approaches where possible.",
      },
      {
        day: "Week 3",
        focus: "Recursion and backtracking basics",
        tasks: ["Factorial/tree recursion", "Subsets", "Permutations", "Dry-run recursion stack"],
        checkpoint: "State base case before coding.",
      },
      {
        day: "Week 4",
        focus: "Linked lists, stacks and queues",
        tasks: ["Reverse list", "Cycle detection", "Balanced brackets", "BFS basics"],
        checkpoint: "Know which structure fits each problem signal.",
      },
      {
        day: "Week 5",
        focus: "Trees, graphs and DP entry",
        tasks: ["Traversals", "Shortest path BFS", "Memoization", "Greedy vs DP"],
        checkpoint: "Explain complexity and trade-offs for every solution.",
      },
      {
        day: "Week 6",
        focus: "Machine-round simulation",
        tasks: ["2 medium builds", "Debugging checklist", "Edge-case tests", "Code review"],
        checkpoint: "Build in small functions and test incrementally.",
      },
      {
        day: "Always",
        focus: "Interview transfer",
        tasks: ["Explain approach aloud", "Discuss alternatives", "State complexity", "Name edge cases"],
        checkpoint: "Interviewers should hear your thinking, not only see final code.",
      },
    ],
  },
]

export const REVISION_SHEETS: RevisionSheet[] = [
  {
    id: "quant-final-revision",
    section: "quant",
    title: "Quant final revision",
    goal: "Recall formulas fast and avoid base-value mistakes.",
    formulas: [
      "Percentage change = (new - old) / old x 100",
      "x% of y = x/100 x y",
      "A is what % of B = A/B x 100",
      "Successive change = a + b + ab/100",
      "If x is a% more than y, y is less than x by a/(100+a) x 100",
      "Ratio share = required parts / total parts x total amount",
      "Speed = distance / time; km/h to m/s = x 5/18",
      "m/s to km/h = x 18/5",
      "Average speed for equal distances = 2uv / (u + v)",
      "Train crossing platform time = (train length + platform length) / speed",
      "Work rate: if A takes a days, rate = 1/a",
      "Together time = 1 / (1/a + 1/b)",
      "Men x days = constant work",
      "Filling pipe positive, emptying pipe negative",
      "Profit% = profit / CP x 100",
      "Loss% = loss / CP x 100",
      "Discount% = discount / MP x 100",
      "SI = PRT/100; CI = P(1 + R/100)^T - P",
      "For 2 years, CI - SI = P(R/100)^2",
      "Average = sum / count; sum = average x count",
      "HCF x LCM = product of two numbers",
      "nPr = n! / (n-r)!",
      "nCr = n! / r!(n-r)!",
      "Probability = favourable outcomes / total outcomes",
      "P(not A) = 1 - P(A)",
      "Independent events: P(A and B) = P(A) x P(B)",
    ],
    traps: [
      "Do not average speeds unless time is equal.",
      "Profit/loss percent uses cost price as base.",
      "Discount percent uses marked price as base.",
      "In DI, check whether the chart shows values or percentages.",
    ],
    drills: [
      "10 percentage-change questions",
      "2 DI sets",
      "10 time-work questions",
      "5 probability questions",
    ],
  },
  {
    id: "reasoning-final-revision",
    section: "reasoning",
    title: "Reasoning final revision",
    goal: "Turn wordy constraints into diagrams and cases.",
    formulas: [
      "Clock angle = |30H - 5.5M|",
      "Minute hand speed = 6 degrees/min",
      "Hour hand speed = 0.5 degrees/min",
      "Hands overlap 11 times in 12 hours",
      "Leap year: divisible by 4, but century years must be divisible by 400",
      "Ordinary year = 1 odd day; leap year = 2 odd days",
      "All A are B: A circle fully inside B",
      "Some A are B: circles overlap",
      "No A are B: circles are separate",
      "A conclusion follows only if true in every valid diagram",
      "Exactly two between means position gap of 3",
      "Immediately right/left means adjacent seat",
      "Somewhere right/left means any later/earlier seat",
      "Opposite directions relative speed = sum of speeds",
      "Same direction relative speed = difference of speeds",
      "Alphabet position: A=1, B=2 ... Z=26",
      "Direction turns: right = clockwise 90 degrees, left = anticlockwise 90 degrees",
      "Shortest distance in directions = sqrt(x^2 + y^2)",
    ],
    traps: [
      "Immediately right is not the same as somewhere right.",
      "A possible conclusion is not a definite conclusion.",
      "Split seating puzzle cases instead of mixing assumptions.",
      "For directions, rotate the facing direction, not the page.",
    ],
    drills: [
      "2 seating arrangements",
      "15 syllogisms",
      "10 series questions",
      "5 clock/calendar questions",
    ],
  },
  {
    id: "verbal-final-revision",
    section: "verbal",
    title: "Verbal final revision",
    goal: "Improve accuracy through grammar rules and passage evidence.",
    formulas: [
      "Each/every/either/neither takes singular verb",
      "One of + plural noun + singular verb",
      "Subject agrees with main subject, not nearest noun",
      "Neither/nor agrees with the nearer subject",
      "Either/or also agrees with the nearer subject",
      "Since = point in time; for = duration",
      "Good at, fond of, interested in, afraid of, depend on",
      "Fewer = countable; less = uncountable",
      "Its = possessive; it's = it is",
      "Affect = verb; effect = noun",
      "Active voice is usually clearer than passive voice",
      "RC answer must be supported by the passage",
      "Main idea = topic + author's view",
      "Inference = supported conclusion, not outside knowledge",
      "Tone clues come from attitude words like sadly, remarkable, unfortunately",
      "Para-jumble opener introduces topic and avoids this/therefore/however",
      "Cloze answer must fit grammar, meaning and tone",
    ],
    traps: [
      "Avoid options with extreme words unless the passage states them.",
      "Do not choose a grammatically correct option if it changes meaning.",
      "Read idioms figuratively, not literally.",
      "In cloze tests, check grammar and tone together.",
    ],
    drills: [
      "2 RC passages",
      "20 error-spotting questions",
      "10 preposition blanks",
      "1 email or essay outline",
    ],
  },
  {
    id: "coding-final-revision",
    section: "coding",
    title: "Coding final revision",
    goal: "Solve with edge cases, complexity and clean dry-runs.",
    formulas: [
      "Array access = O(1)",
      "Linear search = O(n)",
      "Binary search = O(log n), requires sorted input",
      "Hash lookup average = O(1)",
      "Single loop over n = O(n)",
      "Two nested loops usually = O(n^2)",
      "Sorting best common bound = O(n log n)",
      "Bubble/selection/insertion worst case = O(n^2)",
      "Two-pointer pair sum on sorted array = O(n)",
      "Sliding window fixed-size scan = O(n)",
      "Prefix sum range query = O(1) after O(n) preprocessing",
      "Stack = LIFO; Queue = FIFO",
      "BFS uses queue; DFS uses stack/recursion",
      "Balanced BST search = O(log n)",
      "In-order traversal of BST gives sorted order",
      "Naive Fibonacci = O(2^n); memoized Fibonacci = O(n)",
      "Recursion needs base case + smaller subproblem",
      "Hashing trades memory for speed",
      "Space complexity counts extra memory used by the algorithm",
    ],
    traps: [
      "Passing sample tests is not enough; create hidden-style edge cases.",
      "Check empty input, one item, duplicates, negatives and large values.",
      "Do not use binary search on unsorted data.",
      "State brute force first, then optimized approach.",
    ],
    drills: [
      "3 array/string problems",
      "5 output/debugging questions",
      "1 two-pointer problem",
      "1 BFS/DFS concept drill",
    ],
  },
  {
    id: "cs-core-final-revision",
    section: "cs-core",
    title: "CS core final revision",
    goal: "Answer fundamentals with definitions, examples and trade-offs.",
    formulas: [
      "3NF removes transitive dependency",
      "1NF = atomic values",
      "2NF = no partial dependency on part of composite key",
      "Primary key = unique + not null",
      "Foreign key references another table's primary key",
      "INNER JOIN returns matching rows only",
      "LEFT JOIN keeps all left-table rows",
      "WHERE filters rows; HAVING filters groups",
      "SELECT order written: SELECT FROM WHERE GROUP BY HAVING ORDER BY",
      "TCP = reliable and ordered; UDP = fast and connectionless",
      "OSI layers = Physical, Data Link, Network, Transport, Session, Presentation, Application",
      "DNS resolves domain names to IP addresses",
      "HTTP = port 80; HTTPS = port 443",
      "HTTP 200 success, 400 bad request, 404 not found, 500 server error",
      "Process has own memory; threads share process memory",
      "Deadlock needs mutual exclusion, hold-and-wait, no preemption, circular wait",
      "Encapsulation hides state behind methods",
      "Abstraction hides implementation complexity",
      "Inheritance reuses parent behavior",
      "Polymorphism means same interface, different behavior",
      "Authentication verifies identity; authorization controls access",
      "Hashing is one-way; encryption is reversible with a key",
      "CI runs checks automatically; CD automates release/deployment",
      "Unit test = function/module; integration test = modules together",
    ],
    traps: [
      "Do not define OOP pillars without examples.",
      "WHERE filters rows; HAVING filters groups.",
      "Primary key cannot be null; foreign key may reference another table.",
      "Security basics: authentication proves identity, authorization grants access.",
    ],
    drills: [
      "10 DBMS questions",
      "10 OS/OOP questions",
      "10 CN/web questions",
      "5 cloud/security questions",
    ],
  },
  {
    id: "communication-final-revision",
    section: "comm-interview",
    title: "Communication final revision",
    goal: "Sound clear, specific and employable in HR and communication rounds.",
    formulas: [
      "Self intro: name -> background -> strengths/project -> role fit -> close",
      "STAR: situation, task, action, result",
      "GD: acknowledge -> add evidence -> conclude calmly",
      "Email: subject, greeting, clear ask, polite close",
      "Weakness answer: real weakness -> improvement action -> recent progress",
      "Project answer: problem -> users -> your role -> tech -> challenge -> result",
      "Why company: company signal -> your skill -> role fit",
      "Conflict answer: issue -> your action -> professional outcome",
      "Interview close: ask one role/training/team question",
      "Communication test: one idea per sentence, clear pace, minimal fillers",
    ],
    traps: [
      "Do not memorise long scripts.",
      "Do not blame teammates in behavioural answers.",
      "Do not speak too fast; clarity beats speed.",
      "Avoid fake accent, filler words and vague claims.",
    ],
    drills: [
      "Record one 60-second introduction",
      "Practise 5 HR questions",
      "Summarise one GD topic",
      "Write one professional email",
    ],
  },
]
