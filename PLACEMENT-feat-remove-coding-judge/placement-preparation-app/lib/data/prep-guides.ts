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
        focus: "Full mock and mistake review",
        tasks: ["1 full-length mock", "Review weakest 2 topics", "Redo saved mistakes"],
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
