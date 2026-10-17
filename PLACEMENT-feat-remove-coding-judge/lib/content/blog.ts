import type { ContentBlock } from "@/lib/content/blocks"
import { SITE_NAME, SITE_URL } from "@/lib/content/blocks"

/**
 * SEO/AEO-optimized blog posts. Written for Indian placement-prep search intent
 * ("how to crack campus placements", "aptitude preparation", "coding interview
 * for freshers", etc.). No third-party company names are used. Each post is
 * answer-first, well-structured with H2 sections, key takeaways and an on-page
 * FAQ so it can win featured snippets and AI answer-engine citations.
 */

export interface BlogSection {
  id: string
  heading: string
  blocks: ContentBlock[]
}

export interface BlogPost {
  slug: string
  title: string
  /** Meta description (~150-160 chars). */
  description: string
  excerpt: string
  datePublished: string // ISO
  dateModified: string // ISO
  readMins: number
  tags: string[]
  keywords: string[]
  intro: string[]
  sections: BlogSection[]
  takeaways: string[]
  faq: { q: string; a: string }[]
}

export const BLOG_POSTS: BlogPost[] = [
  // ========================================================================
  {
    slug: "how-to-crack-campus-placements-2026",
    title: "How to Crack Campus Placements in 2026: A Step-by-Step Roadmap",
    description:
      "A practical, step-by-step roadmap to crack campus placements in 2026 - what to prepare, in what order, and how to track your readiness as a fresher.",
    excerpt:
      "The complete fresher's roadmap: when to start, what to master, and the exact order that turns scattered prep into placement offers.",
    datePublished: "2026-05-10",
    dateModified: "2026-06-06",
    readMins: 9,
    tags: ["Placements", "Roadmap", "Freshers"],
    keywords: [
      "campus placement preparation",
      "how to crack campus placements",
      "placement roadmap 2026",
      "fresher job preparation",
      "placement preparation for freshers",
    ],
    intro: [
      "Cracking campus placements is less about talent and more about a clear plan executed consistently. Most students prepare randomly - a bit of aptitude here, a YouTube video there - and then panic a month before the drive.",
      "This roadmap fixes that. It tells you exactly what to prepare, in what order, and how to know when you are actually ready, so you walk into your placement season with proof, not hope.",
    ],
    sections: [
      {
        id: "start-early",
        heading: "1. Start early and work backwards from the drive",
        blocks: [
          {
            k: "p",
            text: "The single biggest advantage you can give yourself is time. Begin at least 4-6 months before your placement season. Work backwards: list the recruiters you want, note their typical rounds (aptitude, coding, communication, interview), and map each round to a preparation block.",
          },
          {
            k: "p",
            text: "If you are in your first or second year, you do not need a company yet - build company-agnostic core skills first and specialise later.",
          },
        ],
      },
      {
        id: "aptitude",
        heading: "2. Build a strong aptitude base",
        blocks: [
          {
            k: "p",
            text: "Almost every recruiter screens with quantitative aptitude, logical reasoning and verbal ability. This is the cheapest round to clear because it is the most predictable. Prioritise these high-yield topics:",
          },
          {
            k: "list",
            items: [
              "**Quant:** percentages, ratios, profit & loss, time-speed-distance, time & work, number system, simple/compound interest.",
              "**Reasoning:** series, blood relations, directions, coding-decoding, seating arrangement, syllogisms.",
              "**Verbal:** grammar, vocabulary, sentence correction and reading comprehension.",
            ],
          },
          {
            k: "p",
            text: "Aim for speed, not just accuracy - most aptitude tests are time-pressured. Learn approximation and shortcuts so you spend seconds, not minutes, per question.",
          },
        ],
      },
      {
        id: "coding",
        heading: "3. Master coding and core data structures",
        blocks: [
          {
            k: "p",
            text: "For most software roles, the coding round decides your fate. You do not need every advanced algorithm - you need fluency in the fundamentals and the patterns that appear again and again:",
          },
          {
            k: "list",
            items: [
              "Time and space complexity (Big-O) so you can reason about efficiency.",
              "Arrays, strings, hashing, sorting and searching.",
              "Linked lists, stacks and queues.",
              "High-yield patterns: two-pointer, sliding window and prefix sums.",
            ],
          },
          {
            k: "p",
            text: "Practise writing complete, bug-free solutions on a timer, and always state your approach and complexity out loud - interviewers score your reasoning as much as your final code.",
          },
        ],
      },
      {
        id: "cs-core",
        heading: "4. Revise CS fundamentals",
        blocks: [
          {
            k: "p",
            text: "Technical interviews lean heavily on CS core: DBMS (keys, normalization, joins, SQL), operating systems (process vs thread, deadlock), computer networks (OSI, TCP vs UDP) and OOP (the four pillars). Keep crisp, example-led answers ready for each - depth of understanding beats memorised definitions.",
          },
        ],
      },
      {
        id: "communication",
        heading: "5. Polish communication and interview skills",
        blocks: [
          {
            k: "p",
            text: "A strong candidate with weak communication still loses offers. Prepare a 60-second self-introduction, practise group discussions, and structure behavioural answers with the STAR method (Situation, Task, Action, Result).",
          },
          {
            k: "p",
            text: "For virtual interviews, look into the camera, ensure good lighting and audio, and minimise filler words. Always have one thoughtful question ready for the interviewer.",
          },
        ],
      },
      {
        id: "mocks",
        heading: "6. Take mock tests and track readiness",
        blocks: [
          {
            k: "p",
            text: "Mocks convert knowledge into exam temperament. Take full, timed mocks in each recruiter's pattern, review every mistake, and re-attempt weak topics. Track your readiness with a single honest number - a readiness index - instead of guessing whether you are prepared.",
          },
          {
            k: "quote",
            text: "If you cannot measure your readiness, you cannot improve it. Replace 'I think I'm ready' with a number you can move.",
          },
        ],
      },
      {
        id: "consistency",
        heading: "7. Stay consistent with daily practice",
        blocks: [
          {
            k: "p",
            text: "Thirty focused minutes every day beats a ten-hour cram once a week. Build a daily habit - a short challenge, a couple of coding problems, a revision set - and protect your streak. Consistency compounds, and it is the quiet difference between students who get placed and those who do not.",
          },
        ],
      },
    ],
    takeaways: [
      "Start 4-6 months early and map every recruiter round to a prep block.",
      "Aptitude is the most predictable round - clear it with speed techniques.",
      "For coding, master fundamentals and the two-pointer/sliding-window patterns.",
      "Keep crisp, example-led CS-core and HR answers ready.",
      "Use timed mocks and a readiness index to prove you are ready, not guess.",
    ],
    faq: [
      {
        q: "When should I start preparing for campus placements?",
        a: "Ideally 4-6 months before your placement season. Early-year students should build company-agnostic core skills first and specialise into specific recruiters later.",
      },
      {
        q: "What should I prepare first for placements?",
        a: "Start with aptitude (quant, reasoning, verbal) because it is the most predictable screening round, then build coding and CS fundamentals, and finally polish communication and interview skills.",
      },
      {
        q: "How do I know if I am ready for placements?",
        a: "Track your preparation across aptitude, coding, CS core, communication and mock performance. Use timed mocks to see which topics need another study session.",
      },
    ],
  },

  // ========================================================================
  {
    slug: "aptitude-preparation-for-placements",
    title: "Aptitude Preparation for Placements: Quant, Reasoning & Verbal Made Simple",
    description:
      "A focused guide to aptitude preparation for placements - the high-yield quant, reasoning and verbal topics to study and the speed techniques that save time.",
    excerpt:
      "The high-yield topics and speed tricks that clear the aptitude round - without drowning in 800-page books.",
    datePublished: "2026-05-16",
    dateModified: "2026-06-06",
    readMins: 8,
    tags: ["Aptitude", "Quant", "Reasoning", "Verbal"],
    keywords: [
      "aptitude preparation for placements",
      "quantitative aptitude for placements",
      "logical reasoning preparation",
      "verbal ability for placements",
      "aptitude shortcuts",
    ],
    intro: [
      "The aptitude round eliminates the most candidates - not because it is hard, but because it is fast. Students who know the same topics still fail when they are slow.",
      "This guide cuts aptitude down to the high-yield topics that actually appear, and the speed techniques that let you answer in seconds.",
    ],
    sections: [
      {
        id: "quant",
        heading: "Quantitative aptitude: focus on these topics",
        blocks: [
          {
            k: "p",
            text: "You do not need to master every chapter of a thick aptitude book. These topics cover the majority of placement questions:",
          },
          {
            k: "list",
            items: [
              "Percentages, ratios and proportions",
              "Profit, loss and discount",
              "Simple and compound interest",
              "Time, speed and distance; time and work",
              "Number system, HCF/LCM, divisibility and unit digits",
              "Averages, ages, and basic probability",
            ],
          },
          {
            k: "sub",
            text: "Speed techniques that save minutes",
          },
          {
            k: "list",
            items: [
              "Memorise fraction-percentage conversions (1/8 = 12.5%, 1/3 ~ 33.3%) to approximate instantly.",
              "Square numbers ending in 5 with the n(n+1) trick: 25^2 = (2x3)25 = 625.",
              "Use unit-digit cyclicity for powers instead of full multiplication.",
              "Eliminate options by checking the unit digit before computing fully.",
            ],
          },
        ],
      },
      {
        id: "reasoning",
        heading: "Logical reasoning: pattern recognition wins",
        blocks: [
          {
            k: "p",
            text: "Reasoning rewards a calm, visual approach. Draw the problem instead of holding it in your head.",
          },
          {
            k: "list",
            items: [
              "**Series:** check constant difference, ratio, differences-of-differences, then squares/cubes.",
              "**Blood relations & directions:** sketch a quick family tree or compass.",
              "**Coding-decoding:** find the shift on one pair, then apply it.",
              "**Seating & ranking:** pin the absolute clues (ends) first, then relative ones. Remember: position-from-top + position-from-bottom = total + 1.",
              "**Syllogisms:** trust only what the premises force; beware 'some' conclusions.",
            ],
          },
        ],
      },
      {
        id: "verbal",
        heading: "Verbal ability: small fixes, big marks",
        blocks: [
          {
            k: "p",
            text: "Verbal is often the easiest section to improve quickly because the rules are finite.",
          },
          {
            k: "list",
            items: [
              "Lock in subject-verb agreement, tenses and common confusables (its/it's, affect/effect, fewer/less).",
              "Learn fixed prepositions: 'good at', 'fond of', 'since' (a point in time) vs 'for' (a duration).",
              "Build vocabulary in word families (root + prefix + suffix), and learn common idioms.",
              "For reading comprehension, read for the main idea first, then scan back for specifics, and answer only from the passage.",
            ],
          },
        ],
      },
      {
        id: "practice-plan",
        heading: "A simple weekly practice plan",
        blocks: [
          {
            k: "ol",
            items: [
              "Pick two quant topics and one reasoning topic per week.",
              "Learn the concept, then solve 20-30 timed questions per topic.",
              "Review every wrong answer and note the trap you fell for.",
              "End each day with a short mixed daily challenge to build speed and a streak.",
            ],
          },
        ],
      },
    ],
    takeaways: [
      "Cover the high-yield quant topics - not the entire book.",
      "Speed beats raw knowledge: master approximation and shortcuts.",
      "Draw reasoning problems instead of solving them in your head.",
      "Verbal improves fastest because the rules are finite.",
      "Practise in short, timed, mixed sets every day.",
    ],
    faq: [
      {
        q: "How long does it take to prepare aptitude for placements?",
        a: "With focused daily practice, most students build a solid aptitude base in 6-8 weeks by covering the high-yield quant, reasoning and verbal topics and practising timed question sets.",
      },
      {
        q: "Which aptitude topics are most important for placements?",
        a: "Percentages, ratios, profit & loss, time-speed-distance, time & work and number system in quant; series, blood relations, coding-decoding and seating in reasoning; and grammar, vocabulary and reading comprehension in verbal.",
      },
      {
        q: "How can I solve aptitude questions faster?",
        a: "Memorise fraction-percentage conversions, use squaring and unit-digit tricks, and eliminate answer options by checking the unit digit before fully computing.",
      },
    ],
  },

  // ========================================================================
  {
    slug: "coding-interview-preparation-for-freshers",
    title: "Coding Interview Preparation for Freshers: The DSA Topics That Actually Matter",
    description:
      "A no-fluff guide to coding interview preparation for freshers - the data structures, algorithms and patterns that actually appear, and how to practise them.",
    excerpt:
      "Skip the 500-problem grind. Here are the DSA topics and patterns that actually decide fresher coding rounds.",
    datePublished: "2026-05-22",
    dateModified: "2026-06-06",
    readMins: 9,
    tags: ["Coding", "DSA", "Interviews"],
    keywords: [
      "coding interview preparation",
      "DSA for placements",
      "data structures for freshers",
      "coding round preparation",
      "DSA topics for interviews",
    ],
    intro: [
      "Freshers often think coding interviews require hundreds of solved problems and exotic algorithms. They do not. They require fluency in a small set of fundamentals and the patterns that show up over and over.",
      "Here is what actually matters for a fresher coding round, and how to practise it so you perform under time pressure.",
    ],
    sections: [
      {
        id: "complexity",
        heading: "Start with complexity - it frames everything",
        blocks: [
          {
            k: "p",
            text: "Before any data structure, understand Big-O. You should instantly recognise O(1), O(log n), O(n), O(n log n) and O(n^2), and know that nested loops usually mean O(n^2) while a single pass with a hash set is O(n). Interviewers constantly ask, 'What's the complexity? Can you do better?' - being ready to answer signals real competence.",
          },
        ],
      },
      {
        id: "core-ds",
        heading: "The core data structures to know cold",
        blocks: [
          {
            k: "list",
            items: [
              "**Arrays & strings:** traversal, in-place edits, and the speed-for-memory trade with hashing.",
              "**Hashing (sets/maps):** O(1) average lookups - the key to turning many O(n^2) brute forces into O(n).",
              "**Sorting & searching:** know that binary search needs a sorted array and runs in O(log n), and the common sort complexities.",
              "**Linked lists, stacks and queues:** pointer manipulation, LIFO vs FIFO, and why recursion uses a stack.",
            ],
          },
        ],
      },
      {
        id: "patterns",
        heading: "The patterns that solve most problems",
        blocks: [
          {
            k: "p",
            text: "Most fresher problems are variations of a few patterns. Learn to recognise them:",
          },
          {
            k: "list",
            items: [
              "**Two-pointer:** pair-sum and palindrome-style problems on sorted arrays/strings in O(n).",
              "**Sliding window:** best/longest subarray or substring of a given size or property in O(n).",
              "**Prefix sums:** answer range-sum queries in O(1) after one pass of precomputation.",
            ],
          },
          {
            k: "p",
            text: "Classic problems worth mastering: two-sum, reverse a linked list, detect a cycle (slow/fast pointers), check anagrams, second-largest element, and spiral matrix traversal.",
          },
        ],
      },
      {
        id: "how-to-practise",
        heading: "How to practise (so it sticks under pressure)",
        blocks: [
          {
            k: "ol",
            items: [
              "Learn one pattern, then solve 5-8 problems that use it before moving on.",
              "Write the full solution on a timer - don't stop at 'I get the idea'.",
              "Always state your approach and complexity out loud, then optimise.",
              "Handle edge cases explicitly: empty input, single element, duplicates, overflow.",
              "Re-attempt every problem you got wrong after two days.",
            ],
          },
        ],
      },
      {
        id: "language",
        heading: "Language and output questions",
        blocks: [
          {
            k: "p",
            text: "Many screening rounds also include output-prediction and pseudocode questions. Be careful with language quirks: integer division and modulo, operator precedence, pre/post increment, and bitwise operations. Trace pseudocode line by line rather than guessing.",
          },
        ],
      },
    ],
    takeaways: [
      "Understand Big-O first - it frames every coding answer.",
      "Master arrays, strings, hashing, sorting/searching and linear data structures.",
      "Learn two-pointer, sliding-window and prefix-sum patterns.",
      "Practise full solutions on a timer and always state complexity.",
      "Don't ignore output-prediction and pseudocode-tracing questions.",
    ],
    faq: [
      {
        q: "What DSA topics are most important for fresher coding interviews?",
        a: "Complexity analysis, arrays and strings, hashing, sorting and searching, and linear data structures (linked lists, stacks, queues), plus the two-pointer, sliding-window and prefix-sum patterns.",
      },
      {
        q: "How many problems should a fresher solve for coding interviews?",
        a: "Quality beats quantity. Mastering a few problems per pattern (around 5-8 each) and being able to state your approach and complexity matters far more than blindly solving hundreds.",
      },
      {
        q: "Do I need advanced algorithms to clear a fresher coding round?",
        a: "Usually not. Fluency in fundamentals and common patterns, clean code, correct edge-case handling and clear reasoning clear most fresher coding rounds.",
      },
    ],
  },

  // ========================================================================
  {
    slug: "group-discussion-and-hr-interview-tips",
    title: "Group Discussion and HR Interview Tips Every Fresher Should Know",
    description:
      "Practical group discussion and HR interview tips for freshers - how to introduce yourself, stand out in a GD, and answer common HR questions with confidence.",
    excerpt:
      "Strong communication wins offers that strong coding alone cannot. Here's how to nail the GD and HR rounds.",
    datePublished: "2026-05-28",
    dateModified: "2026-06-06",
    readMins: 8,
    tags: ["Interviews", "Communication", "HR"],
    keywords: [
      "HR interview questions for freshers",
      "group discussion tips",
      "interview preparation for freshers",
      "self introduction for interview",
      "STAR method interview",
    ],
    intro: [
      "Technical skill gets you to the interview; communication gets you the offer. Many capable freshers lose out simply because they freeze in the group discussion or ramble in the HR round.",
      "These tips fix that. They are simple, repeatable, and they work whether you are introverted or outgoing.",
    ],
    sections: [
      {
        id: "self-intro",
        heading: "Nail the 60-second self-introduction",
        blocks: [
          {
            k: "p",
            text: "Your introduction sets the tone. Use a tight arc: name -> background (college, branch) -> two relevant strengths or projects -> why this role/company -> a confident close. Keep it under a minute and tailor your highlights to the role. Do not recite your resume line by line - lead the interviewer toward what you want to discuss.",
          },
        ],
      },
      {
        id: "gd",
        heading: "Stand out in a group discussion (without dominating)",
        blocks: [
          {
            k: "p",
            text: "Evaluators score clarity, listening and leadership - not volume. Enter early with a clear point backed by a reason or example, and bring quieter members in.",
          },
          {
            k: "list",
            items: [
              "Open or enter within the first minute with a structured point (pros/cons, social/economic/technical).",
              "Bridge politely to get in: 'Building on that point...'.",
              "Never get aggressive or talk over others - it counts against you.",
              "A crisp summary at the end is a strong, often-overlooked way to lead.",
            ],
          },
        ],
      },
      {
        id: "hr-questions",
        heading: "Answer common HR questions with structure",
        blocks: [
          {
            k: "p",
            text: "Most HR questions are predictable. Prepare honest, structured answers:",
          },
          {
            k: "list",
            items: [
              "**Tell me about yourself:** the 60-second arc above.",
              "**Why this company?** Cite one or two specific, researched facts and connect them to your goals - never a generic 'good company'.",
              "**Strength/weakness:** give a real strength with proof, and a genuine weakness with the concrete steps you are taking.",
              "**Where in 5 years?** Show realistic growth aligned to the role.",
              "**Salary (as a fresher):** it is fine to say you are flexible and open to the standard for the role.",
            ],
          },
          {
            k: "sub",
            text: "Use STAR for behavioural questions",
          },
          {
            k: "p",
            text: "For 'tell me about a time...' questions, structure your answer as STAR: Situation, Task, Action, Result. Focus on what you did and end with a measurable result.",
          },
        ],
      },
      {
        id: "virtual",
        heading: "Body language and virtual-interview etiquette",
        blocks: [
          {
            k: "list",
            items: [
              "Sit upright, make natural eye contact, and keep your hands calm.",
              "In a video interview, look into the camera (not the screen) to appear to make eye contact.",
              "Ensure good lighting, a tidy background and a working mic; join a couple of minutes early to test.",
              "Replace filler words ('um', 'like') with a brief, composed pause.",
            ],
          },
        ],
      },
      {
        id: "questions-to-ask",
        heading: "Always ask one thoughtful question",
        blocks: [
          {
            k: "p",
            text: "When the interviewer asks if you have questions, never say no. Ask something forward-looking - for example, 'What does success look like in this role in the first six months?' It signals genuine interest and maturity.",
          },
        ],
      },
    ],
    takeaways: [
      "Prepare a tight 60-second self-introduction tailored to the role.",
      "In a GD, contribute reasoned points and listen - don't dominate.",
      "Answer 'why this company' with specific, researched reasons.",
      "Structure behavioural answers with STAR and end on a result.",
      "Look into the camera, cut filler words, and always ask one question.",
    ],
    faq: [
      {
        q: "How do I introduce myself in an interview?",
        a: "Use a 60-second structure: name, background, two relevant strengths or projects, why this role, and a confident close. Tailor your highlights to the role rather than reciting your resume.",
      },
      {
        q: "How can I stand out in a group discussion?",
        a: "Enter early with a clear, reasoned point, back claims with examples, invite quieter members in, avoid talking over others, and offer a crisp summary at the end. Evaluators reward clarity and listening over volume.",
      },
      {
        q: "What is the STAR method in interviews?",
        a: "STAR stands for Situation, Task, Action, Result. It is a structure for answering behavioural questions: set the context, your responsibility, what you did, and the measurable outcome.",
      },
    ],
  },

  // ========================================================================
  {
    slug: "what-is-placement-readiness-index",
    title: "How to Use a Placement Readiness Score",
    description:
      "Learn how a placement readiness score reflects your study progress and helps you decide what to revise next.",
    excerpt:
      "A readiness score turns scattered prep into one clear signal you can improve.",
    datePublished: "2026-06-02",
    dateModified: "2026-06-06",
    readMins: 6,
    tags: ["Placements", "Readiness", "Strategy"],
    keywords: [
      "placement readiness index",
      "am I ready for placements",
      "track placement preparation",
      "placement preparation score",
      "how prepared am I for placements",
    ],
    intro: [
      "Ask most students how prepared they are for placements and you'll hear 'maybe 60%?' - a guess with nothing behind it. That uncertainty is exactly why preparation drifts.",
      "A placement readiness score gives you a useful progress signal. Here is what it measures and how to use it.",
    ],
    sections: [
      {
        id: "the-problem",
        heading: "The problem with guessing your readiness",
        blocks: [
          {
            k: "p",
            text: "Without a measure, you can't prioritise. You over-study what you already know (because it feels good) and avoid your weak areas (because they don't). You also can't tell whether you're ready for a specific recruiter, since each has a different bar.",
          },
        ],
      },
      {
        id: "what-it-measures",
        heading: "What a Placement Readiness Index measures",
        blocks: [
          {
            k: "p",
            text: "A good PRI is a 0-100 score per company that combines your mastery across the areas that actually decide placements:",
          },
          {
            k: "list",
            items: [
              "Quantitative aptitude, logical reasoning and verbal ability",
              "Coding and data structures",
              "CS core fundamentals",
              "Communication and interview readiness",
              "Mock-test performance under time",
            ],
          },
          {
            k: "p",
            text: "Because it is per company, it reflects each recruiter's emphasis - a coding-heavy product firm weights coding more than a services recruiter does.",
          },
        ],
      },
      {
        id: "honest",
        heading: "Why a consistent score matters",
        blocks: [
          {
            k: "p",
            text: "A readiness score works best when it is based on completed chapters and mock results. Passing a chapter with at least 60% keeps the score tied to work you have actually done.",
          },
          {
            k: "quote",
            text: "Use the score as a study signal, then spend your time on the topic that needs work.",
          },
        ],
      },
      {
        id: "estimate",
        heading: "Readiness vs a guarantee",
        blocks: [
          {
            k: "p",
            text: "A readiness index - and any placement-probability estimate built on it - is a study aid, not a promise. It reflects your in-app performance to help you prioritise; it does not guarantee an interview call or an offer, because final hiring decisions rest with employers. Used honestly, though, it's the best early-warning system you have.",
          },
        ],
      },
      {
        id: "how-to-use",
        heading: "How to use your readiness score",
        blocks: [
          {
            k: "ol",
            items: [
              "Check your weakest section and spend the next week there.",
              "Re-take quizzes and mocks until weak topics turn green.",
              "Compare your score against your target recruiter's bar and close the gap.",
              "Track the number weekly - if it's not rising, change what you're doing.",
            ],
          },
        ],
      },
    ],
    takeaways: [
      "Guessing your readiness makes preparation drift toward what's comfortable.",
      "A PRI is a 0-100 per-company score across aptitude, coding, CS core, communication and mocks.",
      "An honest score counts only what you genuinely pass, so it can't be gamed.",
      "Readiness and placement probability are estimates, not guarantees.",
      "Use the score to attack your weakest area first and track weekly progress.",
    ],
    faq: [
      {
        q: "What is a Placement Readiness Index (PRI)?",
        a: "A Placement Readiness Index is a 0-100 score per company that measures how prepared you are across aptitude, coding, CS core, communication and mock performance, so you can see your true readiness instead of guessing.",
      },
      {
        q: "Does a high readiness score guarantee a job?",
        a: "No. A readiness score and any placement-probability estimate are study aids that reflect your in-app performance. They help you prioritise but do not guarantee an interview or offer - hiring decisions rest with employers.",
      },
      {
        q: "How can I improve my placement readiness score?",
        a: "Attack your weakest section first, re-take quizzes and mocks until weak topics improve, compare your score against your target recruiter's bar, and track the number weekly.",
      },
    ],
  },
  // ========================================================================
  {
    slug: "tcs-nqt-preparation-guide",
    title: "TCS NQT Preparation 2026: Exam Pattern, Syllabus and 8-Week Plan",
    description:
      "Everything freshers need for the TCS NQT in 2026: how Ninja, Digital and Prime differ, the section-wise syllabus, and an 8-week preparation plan that works.",
    excerpt:
      "The TCS NQT is the highest-volume fresher exam in India. Here is what it actually tests, how the role tiers differ, and the 8-week plan to clear it.",
    datePublished: "2026-06-12",
    dateModified: "2026-06-12",
    readMins: 10,
    tags: ["TCS NQT", "Company guide", "Freshers"],
    keywords: [
      "TCS NQT preparation",
      "TCS NQT syllabus 2026",
      "TCS NQT exam pattern",
      "TCS Ninja Digital Prime difference",
      "TCS placement preparation for freshers",
    ],
    intro: [
      "The TCS National Qualifier Test (NQT) is the single biggest entry door for Indian freshers - lakhs of students take it every cycle, and one score can put you in the running for Ninja, Digital and Prime roles at very different salary bands.",
      "This guide breaks down what the test actually measures, how the role tiers differ, the section-wise syllabus, and an 8-week plan that prioritises the sections where most students lose their attempt. Always confirm the current pattern on the official TCS NQT registration page before your slot - TCS adjusts the format between cycles.",
    ],
    sections: [
      {
        id: "what-is-nqt",
        heading: "1. What the TCS NQT is and why the role tiers matter",
        blocks: [
          {
            k: "p",
            text: "The NQT is TCS's standardised entry assessment for fresher hiring. Your performance places you in consideration for three tiers: **Ninja** (the base offer), **Digital** (a significantly higher package with tougher advanced sections), and **Prime** (the top band, typically requiring outstanding scores plus strong interviews).",
          },
          {
            k: "p",
            text: "This matters for strategy: clearing the foundation sections gets you into the Ninja pool, but the **advanced quantitative and coding sections decide whether you upgrade to Digital or Prime**. Students who only prepare for the basics leave the bigger offers on the table.",
          },
        ],
      },
      {
        id: "exam-pattern",
        heading: "2. The exam pattern in recent cycles",
        blocks: [
          {
            k: "p",
            text: "In recent cycles the NQT has combined a foundation part and an advanced part in one sitting. The foundation part tests **numerical ability, verbal ability and reasoning ability**. The advanced part adds **advanced quantitative/reasoning questions and hands-on coding** in a built-in editor.",
          },
          {
            k: "list",
            items: [
              "**Numerical ability** - arithmetic, percentages, profit & loss, time-speed-distance, data interpretation.",
              "**Verbal ability** - reading comprehension, grammar, sentence completion and ordering.",
              "**Reasoning ability** - series, puzzles, blood relations, seating arrangement, visual and logical reasoning.",
              "**Advanced section** - harder quant and reasoning at a noticeably higher difficulty.",
              "**Coding** - one or more problems where you write working code; partial test-case scoring has been common.",
            ],
          },
          {
            k: "p",
            text: "Timing and question counts have changed between cycles, so treat any fixed numbers you find online with suspicion - practise to be fast everywhere, and verify the live pattern in your official hall-ticket instructions.",
          },
        ],
      },
      {
        id: "syllabus-priorities",
        heading: "3. Section-wise syllabus and where students actually lose marks",
        blocks: [
          {
            k: "p",
            text: "Most NQT rejections do not come from the coding round - they come from running out of time in numerical ability and data interpretation. Speed is the real syllabus.",
          },
          {
            k: "ol",
            items: [
              "**Quantitative aptitude (highest priority)** - master percentages, ratios, averages, profit & loss, and time & work to the point where a typical question takes under 60 seconds.",
              "**Reasoning** - seating arrangements and puzzle sets are the time sinks; learn to triage and skip early.",
              "**Verbal** - reading comprehension is free marks if you read the questions before the passage; grammar rules are a finite, learnable list.",
              "**Coding** - arrays, strings, loops, and standard patterns (two pointers, frequency counting, simple math). NQT coding rewards clean working solutions, not exotic algorithms.",
              "**Advanced quant** - only after the foundation sections are consistently above 80% in practice.",
            ],
          },
        ],
      },
      {
        id: "eight-week-plan",
        heading: "4. The 8-week preparation plan",
        blocks: [
          {
            k: "p",
            text: "Eight weeks is enough if every week has a job. The plan assumes 2-3 focused hours a day.",
          },
          {
            k: "ol",
            items: [
              "**Weeks 1-2:** Quant foundations - percentages, ratios, averages, speed-distance. Daily timed drills, error log from day one.",
              "**Weeks 3-4:** Reasoning + verbal in parallel with quant revision. One reading-comprehension set and one puzzle set daily.",
              "**Week 5:** Coding - solve pattern-based problems daily in the language you will use in the exam editor.",
              "**Week 6:** Advanced section - harder quant and multi-step reasoning. Keep daily mixed drills from earlier weeks alive.",
              "**Weeks 7-8:** Full-length timed mocks on the TCS pattern, one every 2-3 days. Spend the day after each mock only on the topics you got wrong.",
            ],
          },
          {
            k: "quote",
            text: "The error log is the plan. A wrong answer you never revisit will be wrong again in the real exam.",
          },
        ],
      },
      {
        id: "common-mistakes",
        heading: "5. Five mistakes that cost students the NQT",
        blocks: [
          {
            k: "list",
            items: [
              "Preparing topic-wise forever and writing the first timed mock in the last week.",
              "Ignoring verbal because it feels easy - it is the cheapest section to score and the rank list does not care where marks came from.",
              "Practising coding on paper or in a rich IDE instead of a plain browser editor like the real exam.",
              "Attempting puzzle sets in order instead of triaging - one stubborn seating arrangement can eat ten minutes.",
              "Trusting an outdated pattern from a 2-3 year old YouTube video instead of the official current notification.",
            ],
          },
        ],
      },
      {
        id: "know-you-are-ready",
        heading: "6. How to know you are actually ready",
        blocks: [
          {
            k: "p",
            text: "Readiness is measurable: in your last three full-length mocks on the TCS pattern, you finish every section in time, your accuracy holds above the cutoff zone in quant and reasoning, and your coding solution passes the majority of test cases. If any of those is false, you know exactly which week of the plan to repeat.",
          },
          {
            k: "p",
            text: "StudyBench's TCS track packages this loop - pattern-aligned chapters, timed PYQ-style practice, full mocks and a per-company readiness score - so you can see the gap closing week by week instead of guessing.",
          },
        ],
      },
    ],
    takeaways: [
      "One NQT score feeds three very different offers - prepare for the advanced section, not just the foundation.",
      "Speed in quant and data interpretation eliminates more students than the coding round.",
      "Give the plan 8 weeks: foundations first, coding in week 5, full timed mocks in weeks 7-8.",
      "Practise coding in a plain browser editor to match exam conditions.",
      "Always verify the current pattern on the official TCS NQT notification - it changes between cycles.",
    ],
    faq: [
      {
        q: "What is the difference between TCS Ninja, Digital and Prime?",
        a: "All three are fresher roles filled through the NQT pipeline. Ninja is the base package, Digital is a higher band that requires stronger advanced-section and coding performance, and Prime is the top band with the most demanding bar. The same test sitting can qualify you for upgrade interviews to the higher tiers.",
      },
      {
        q: "Is there negative marking in the TCS NQT?",
        a: "TCS has generally not used negative marking in recent NQT cycles, but the rules are stated in each cycle's official instructions - always confirm in your hall ticket and the on-screen instructions before answering strategically.",
      },
      {
        q: "How long should I prepare for the TCS NQT?",
        a: "Eight weeks of 2-3 focused hours a day is enough for most students: four weeks of aptitude foundations, one week of coding patterns, one week of advanced-section practice, and two weeks of full-length timed mocks with error-log revision.",
      },
      {
        q: "Which programming language should I use in the NQT coding section?",
        a: "Use the language you can write fastest without an IDE - C, C++, Java and Python are all commonly supported. The editor is plain, so practise writing complete, compilable programs in a browser environment beforehand.",
      },
    ],
  },

  // ========================================================================
  {
    slug: "infosys-placement-preparation-guide",
    title: "Infosys Placement Preparation 2026: Pattern, Syllabus & Tips",
    description:
      "Complete Infosys placement preparation guide 2026: InfyTQ-aligned exam pattern, eligibility, aptitude syllabus, pseudocode round, and coding tips for freshers.",
    excerpt:
      "Everything you need to clear the Infosys online assessment: aptitude syllabus, pseudocode format, hands-on coding tips and the HR round.",
    datePublished: "2026-06-01",
    dateModified: "2026-06-12",
    readMins: 8,
    tags: ["Infosys", "Placements", "Freshers"],
    keywords: [
      "Infosys placement preparation",
      "Infosys syllabus 2026",
      "InfyTQ preparation",
      "Infosys online test pattern",
      "Infosys fresher hiring",
    ],
    intro: [
      "Infosys is one of India's biggest fresher recruiters, taking thousands of engineering graduates every year through its InfyTQ-aligned online assessment. The test is structured, predictable, and highly clearable if you prepare in the right order.",
      "This guide breaks down the exact Infosys hiring pattern for 2026, what each section tests, and the preparation strategy that gives you the best chance of clearing every round.",
    ],
    sections: [
      {
        id: "eligibility",
        heading: "1. Eligibility criteria",
        blocks: [
          {
            k: "list",
            items: [
              "60% or 6.0 CGPA aggregate across 10th, 12th and UG — no rounding.",
              "No active backlogs at the time of the assessment.",
              "Minimum 60% in 10th and 12th standard.",
              "Gap year of more than 2 years is typically not permitted.",
            ],
          },
          {
            k: "p",
            text: "Eligibility is checked during document verification after offer. Be accurate on your application; inconsistencies cause offer revocations.",
          },
        ],
      },
      {
        id: "exam-pattern",
        heading: "2. Exam pattern",
        blocks: [
          {
            k: "p",
            text: "The Infosys online assessment has three sections:",
          },
          {
            k: "ol",
            items: [
              "Aptitude: Quantitative Ability + Logical Reasoning — typically 15 questions in 25 minutes.",
              "Verbal Ability: reading comprehension, fill-in-the-blanks, sentence completion — 20 questions in 35 minutes.",
              "Pseudocode + Hands-on Coding: 3-4 pseudocode understanding questions + 2 coding problems — 45 minutes.",
            ],
          },
          {
            k: "p",
            text: "There is no sectional cut-off reported in most cycles, but each section is scored separately. Do not sacrifice one section entirely.",
          },
        ],
      },
      {
        id: "aptitude-prep",
        heading: "3. Aptitude preparation",
        blocks: [
          {
            k: "p",
            text: "Focus on these high-frequency topics: percentages and ratios, profit and loss, time-speed-distance, time and work, simple and compound interest, number system, HCF and LCM. For reasoning: series, coding-decoding, blood relations, directions, seating arrangement, data sufficiency.",
          },
          {
            k: "p",
            text: "Speed matters more than depth here. 15 questions in 25 minutes is under 100 seconds per question. Drill shortcuts and mental arithmetic until approximation is your default, not long calculations.",
          },
        ],
      },
      {
        id: "pseudocode",
        heading: "4. Pseudocode round",
        blocks: [
          {
            k: "p",
            text: "The pseudocode section is unique to Infosys among the big service companies. You are shown structured pseudocode (variables, loops, conditionals) and asked what it outputs or what a variable holds after execution.",
          },
          {
            k: "p",
            text: "Practice by tracing through simple code snippets mentally. You need to follow if/else branches, count loop iterations, and track variable values step by step. This is closer to logical reasoning than actual coding.",
          },
          {
            k: "quote",
            text: "Pseudocode questions reward careful tracing, not deep programming knowledge. Slow down, annotate each loop iteration, and never skip a step.",
          },
        ],
      },
      {
        id: "coding-round",
        heading: "5. Hands-on coding",
        blocks: [
          {
            k: "p",
            text: "Two coding problems — typically one easy and one medium difficulty. Common patterns: array manipulations, string processing, pattern printing, basic sorting, simple recursion. You should solve both problems to have a strong assessment outcome.",
          },
          {
            k: "p",
            text: "Practice writing complete, runnable programs from scratch in a plain text editor simulation. The Infosys editor does not autocomplete, so muscle memory for syntax is important.",
          },
        ],
      },
      {
        id: "interviews",
        heading: "6. Technical and HR interviews",
        blocks: [
          {
            k: "p",
            text: "After clearing the online test, expect a technical interview covering CS fundamentals (DBMS, OS, networking, OOP), and a project discussion. The HR round covers your self-introduction, career goals and basic behavioural questions.",
          },
          {
            k: "p",
            text: "Prepare a crisp 60-second self-introduction and practise the STAR method (Situation, Task, Action, Result) for situational questions. Know your resume deeply — every project you list should have a 2-minute explanation ready.",
          },
        ],
      },
    ],
    takeaways: [
      "Eligibility: 60% in 10th, 12th and UG with no active backlogs.",
      "Three test sections: aptitude, verbal, pseudocode + coding. Attempt all three seriously.",
      "Pseudocode is trace-and-output — treat it like a logic puzzle, not a programming test.",
      "Two coding problems: aim to solve both. Pattern-focus on arrays, strings and basic algorithms.",
      "Technical interview tests DBMS, OS, OOP and project knowledge — prepare all four.",
      "Always verify the current pattern from the official Infosys notification before your drive.",
    ],
    faq: [
      {
        q: "What is the Infosys online assessment pass mark?",
        a: "Infosys does not publish a fixed cutoff percentage. Passing depends on relative performance across all test-takers in your batch. Aim to attempt every question and score above 70% in each section as a safe target.",
      },
      {
        q: "Is there negative marking in the Infosys online assessment?",
        a: "Recent Infosys assessment cycles have not used negative marking, but this can change. Always read the official instructions at the start of your test before answering strategically.",
      },
      {
        q: "How long does the full Infosys hiring process take?",
        a: "After the online assessment, results are typically declared within 1-2 weeks. Technical and HR interviews follow in batches. Total process time from application to offer letter is commonly 4-8 weeks depending on the batch size.",
      },
    ],
  },

  // ========================================================================
  {
    slug: "wipro-placement-preparation-guide",
    title: "Wipro Elite NTH Placement Preparation 2026: Pattern & Strategy",
    description:
      "Wipro Elite NTH placement preparation guide 2026: eligibility, exam pattern, essay writing, aptitude syllabus, coding tips and interview strategy for freshers.",
    excerpt:
      "Clear the Wipro Elite NTH assessment: aptitude, essay writing and coding round guide for 2026 fresher hiring.",
    datePublished: "2026-06-03",
    dateModified: "2026-06-12",
    readMins: 7,
    tags: ["Wipro", "Placements", "Freshers"],
    keywords: [
      "Wipro placement preparation",
      "Wipro Elite NTH 2026",
      "Wipro online test pattern",
      "Wipro fresher hiring",
      "Wipro essay writing round",
    ],
    intro: [
      "Wipro hires freshers through its Elite NTH (National Talent Hunt) program, an online assessment that includes an unusual essay writing component alongside the standard aptitude and coding rounds.",
      "This guide covers the Wipro Elite NTH 2026 pattern, preparation strategy for each section, and what to expect in the interview rounds.",
    ],
    sections: [
      {
        id: "eligibility",
        heading: "1. Eligibility",
        blocks: [
          {
            k: "list",
            items: [
              "60% or 6.0 CGPA across 10th, 12th and UG with no rounding.",
              "No active backlogs at the time of the drive.",
              "Graduation years typically 2025 and 2026 for the current cycle.",
            ],
          },
        ],
      },
      {
        id: "exam-pattern",
        heading: "2. Exam pattern",
        blocks: [
          {
            k: "ol",
            items: [
              "Aptitude: Quantitative, Logical Reasoning and Verbal Ability — approximately 45 minutes.",
              "Essay Writing: one essay on a general topic — typically 20-25 minutes.",
              "Coding Round: two programming problems — approximately 60 minutes.",
            ],
          },
          {
            k: "p",
            text: "All three sections are conducted in a single sitting. The essay is graded for language quality, coherence and content relevance.",
          },
        ],
      },
      {
        id: "aptitude",
        heading: "3. Aptitude section",
        blocks: [
          {
            k: "p",
            text: "High-frequency topics: percentages, profit and loss, ratio and proportion, averages, mixtures, time-speed-distance, time and work. Reasoning: series, blood relations, coding-decoding, directions, puzzles, syllogisms. Verbal: grammar, vocabulary, fill-in-the-blanks, reading comprehension.",
          },
          {
            k: "p",
            text: "The Wipro aptitude round is at a moderate difficulty level — consistent practice over 3-4 weeks is sufficient for most students who have finished Class 12 mathematics.",
          },
        ],
      },
      {
        id: "essay",
        heading: "4. Essay writing",
        blocks: [
          {
            k: "p",
            text: "This is the section most students underestimate. The essay is typically 200-300 words on a general or current-affairs topic. Graders look for: a clear position stated in the first paragraph, organised body paragraphs, correct grammar and varied vocabulary, and a concise conclusion.",
          },
          {
            k: "p",
            text: "Practise writing one essay a day for two weeks before your drive. Time yourself strictly to 20 minutes. Topics often cover technology, work culture, environment or social issues — prepare 5-6 template arguments you can adapt to any topic.",
          },
          {
            k: "quote",
            text: "A clear structure beats impressive vocabulary. Introduction → 2 body points → conclusion is all you need to score well.",
          },
        ],
      },
      {
        id: "coding",
        heading: "5. Coding round",
        blocks: [
          {
            k: "p",
            text: "Two problems — one easy and one medium. Typical patterns: string manipulation, array operations, pattern printing, basic searching and sorting, matrix operations. A partial solution that passes some test cases is better than a blank answer.",
          },
        ],
      },
      {
        id: "interviews",
        heading: "6. Technical and HR interviews",
        blocks: [
          {
            k: "p",
            text: "The technical interview tests OOP concepts, data structures, DBMS basics and your resume projects. The HR round is conversational — clarity and confidence matter more than perfect answers.",
          },
        ],
      },
    ],
    takeaways: [
      "Wipro Elite NTH has three sections: aptitude, essay writing and coding — prepare all three.",
      "The essay round is unique — practise daily for 2 weeks with a strict 20-minute timer.",
      "Coding: two problems. Aim to fully solve the easy one and partially solve the medium one.",
      "Technical interview: OOP, DSA, DBMS and your own project are the four pillars.",
      "Eligibility: 60% throughout with no active backlogs.",
    ],
    faq: [
      {
        q: "How is the Wipro essay writing section graded?",
        a: "Wipro's essay grading uses a combination of automated tools and human reviewers assessing grammar, vocabulary, relevance to the topic, and structural coherence. Focus on writing clear, correctly punctuated sentences in a logical order rather than trying to impress with complex vocabulary.",
      },
      {
        q: "What coding languages does Wipro allow in the assessment?",
        a: "Wipro commonly supports C, C++, Java, Python and sometimes others. Use the language you are most fluent in, as the platform is plain and autocomplete is limited.",
      },
      {
        q: "How many students does Wipro typically recruit per cycle?",
        a: "Wipro is a large recruiter and runs multiple cycles across the year, hiring thousands of freshers. Your specific batch size and competition level depend on when you apply and which campus or off-campus drive you attend.",
      },
    ],
  },

  // ========================================================================
  {
    slug: "accenture-placement-preparation-guide",
    title: "Accenture Placement Preparation 2026: Pattern, Syllabus & Tips",
    description:
      "Accenture fresher placement guide 2026: cognitive and technical assessment, coding round, communication assessment, and interview tips for campus hiring.",
    excerpt:
      "Crack the Accenture campus drive: cognitive + technical assessment, coding, and communication assessment guide for 2026 freshers.",
    datePublished: "2026-06-05",
    dateModified: "2026-06-12",
    readMins: 7,
    tags: ["Accenture", "Placements", "Freshers"],
    keywords: [
      "Accenture placement preparation",
      "Accenture online test 2026",
      "Accenture fresher hiring pattern",
      "Accenture cognitive assessment",
      "Accenture communication assessment",
    ],
    intro: [
      "Accenture runs a structured multi-stage online assessment for fresher hiring that differs from the typical aptitude-plus-coding pattern. It adds a dedicated technical module and a communication assessment component.",
      "This guide covers what each module tests, the preparation strategy that works, and the interview rounds you will face after clearing the online test.",
    ],
    sections: [
      {
        id: "eligibility",
        heading: "1. Eligibility",
        blocks: [
          {
            k: "list",
            items: [
              "Typically 65% or above across 10th, 12th and UG — some cycles relax this to 60%.",
              "No active backlogs at the time of the drive.",
              "Any branch of engineering or MCA/M.Tech for most roles.",
            ],
          },
        ],
      },
      {
        id: "exam-pattern",
        heading: "2. Assessment structure",
        blocks: [
          {
            k: "ol",
            items: [
              "Cognitive Ability: Numerical Reasoning, Logical Reasoning, Verbal Reasoning — approximately 40 questions.",
              "Technical Assessment: Computer Applications, MS Office knowledge, Pseudocode understanding, Core CS Fundamentals.",
              "Coding Round: 2 programming problems in the language of your choice.",
              "Communication Assessment: spoken English evaluation — reading a passage, describing an image, answering open-ended questions.",
            ],
          },
        ],
      },
      {
        id: "cognitive",
        heading: "3. Cognitive ability module",
        blocks: [
          {
            k: "p",
            text: "Standard aptitude fare: percentages, ratios, profit and loss, averages, time-speed-distance (numerical); series, analogies, data sufficiency (logical); grammar, vocabulary, comprehension (verbal).",
          },
          {
            k: "p",
            text: "Accenture's cognitive questions are moderate difficulty. 3-4 weeks of daily aptitude practice covering the high-frequency topics is sufficient for most students.",
          },
        ],
      },
      {
        id: "technical",
        heading: "4. Technical assessment module",
        blocks: [
          {
            k: "p",
            text: "This module tests practical computer knowledge: Microsoft Office proficiency, common software applications, pseudocode tracing, and fundamental CS concepts. It is not deep coding — it is applied IT literacy.",
          },
          {
            k: "p",
            text: "Revise: database concepts (SQL basics, keys, joins), networking fundamentals (TCP/IP, HTTP, OSI model), OS basics (process vs thread, memory management), and OOP concepts (encapsulation, inheritance, polymorphism).",
          },
        ],
      },
      {
        id: "coding",
        heading: "5. Coding round",
        blocks: [
          {
            k: "p",
            text: "Two problems at easy to medium difficulty. Typical patterns: array manipulation, string operations, pattern printing, sorting and searching. Aim to solve both within time.",
          },
        ],
      },
      {
        id: "communication",
        heading: "6. Communication assessment",
        blocks: [
          {
            k: "p",
            text: "The spoken English module is automated. You are asked to read a passage aloud, describe an image and answer behavioural or situational questions. Scoring is on pronunciation, fluency, grammar and vocabulary.",
          },
          {
            k: "p",
            text: "Practise speaking clearly at a measured pace. Do not rush. Automated tools grade your final seconds of silence as part of your response, so do not cut sentences short.",
          },
          {
            k: "quote",
            text: "Speak at 80% of your natural pace in the communication module. Clarity scores higher than speed.",
          },
        ],
      },
      {
        id: "interview",
        heading: "7. Final interviews",
        blocks: [
          {
            k: "p",
            text: "Accenture typically combines the technical and HR rounds into a single interview. Prepare: OOP concepts, one data structure topic in depth, your project, a self-introduction and 2-3 behavioural answers using the STAR method.",
          },
        ],
      },
    ],
    takeaways: [
      "Accenture assessment has four parts: cognitive, technical, coding, communication — each graded separately.",
      "The communication assessment is automated and grades pronunciation and fluency. Practise speaking at a measured pace.",
      "Technical module covers MS Office, pseudocode, OOP, DBMS and networking — not deep coding.",
      "Coding: 2 problems, easy to medium difficulty. Solve both to be safe.",
      "Final interview combines technical and HR — prepare OOP, projects and STAR-method behavioural answers.",
    ],
    faq: [
      {
        q: "Does Accenture have negative marking?",
        a: "Accenture has generally not used negative marking in recent assessment cycles. Attempt every question. Always confirm in the official test instructions when your drive is scheduled.",
      },
      {
        q: "What is the Accenture communication assessment format?",
        a: "It is a spoken English module with three parts: reading a passage aloud, describing an image, and answering open questions with a recorded response. It is fully automated and uses speech-analysis software.",
      },
      {
        q: "Is the Accenture technical module hard?",
        a: "The technical module tests applied IT knowledge rather than deep coding. A student with basic knowledge of DBMS, OOP, networking and MS Office should find it manageable with 1-2 weeks of focused revision.",
      },
    ],
  },

  // ========================================================================
  {
    slug: "how-to-take-mock-tests-for-placements",
    title: "How to Take Mock Tests for Placements: The Right Strategy",
    description:
      "A practical guide on how to take and review placement mock tests effectively — timing strategy, error analysis, what to track and how to improve your score each attempt.",
    excerpt:
      "Taking mocks without a review plan is wasted effort. Here is the system that turns each attempt into measurable improvement.",
    datePublished: "2026-06-07",
    dateModified: "2026-06-12",
    readMins: 7,
    tags: ["Mock Tests", "Strategy", "Aptitude"],
    keywords: [
      "placement mock test strategy",
      "how to take mock tests for placements",
      "placement test preparation",
      "aptitude mock test tips",
      "mock test review strategy",
    ],
    intro: [
      "Most students take mock tests like this: attempt the test, check the score, feel good or bad, move on. This approach wastes 80% of the value a mock test offers.",
      "A mock test is only half practice — the other half is the review. This guide gives you the complete mock strategy: how to attempt, how to review, what to track, and how to ensure each mock actually moves your readiness score upward.",
    ],
    sections: [
      {
        id: "before-the-mock",
        heading: "1. Set up the attempt correctly",
        blocks: [
          {
            k: "p",
            text: "Simulate the real test environment: same time of day, no phone, no notes, timer running. A mock taken in comfort teaches your brain the wrong habits. If your placement drive is at 10 AM, take your mock at 10 AM.",
          },
          {
            k: "list",
            items: [
              "No pausing mid-test to look up answers.",
              "Rough paper only — no calculator unless the test permits one.",
              "Mark questions you are unsure of (without skipping) so you can flag them in review.",
            ],
          },
        ],
      },
      {
        id: "during-attempt",
        heading: "2. Time allocation by section",
        blocks: [
          {
            k: "p",
            text: "Know your per-question budget before you start. For a typical 65-question aptitude test in 65 minutes, that is 60 seconds per question. In practice, easy questions should take 20-30 seconds so you bank time for harder ones.",
          },
          {
            k: "p",
            text: "Use a three-pass system: Pass 1 — answer everything you can solve in under 30 seconds. Pass 2 — return to flagged questions with remaining time. Pass 3 — guess strategically on anything left (if no negative marking).",
          },
          {
            k: "quote",
            text: "Placement tests reward breadth over depth. One impossible question solved at the cost of three easy ones is a net loss.",
          },
        ],
      },
      {
        id: "review-system",
        heading: "3. The 4-type error classification",
        blocks: [
          {
            k: "p",
            text: "Every wrong answer falls into one of four buckets. Classify every mistake before moving on:",
          },
          {
            k: "ol",
            items: [
              "Concept gap: you did not know the underlying method. Fix: learn the concept, do 5 examples.",
              "Careless error: you knew the method but made an arithmetic or reading mistake. Fix: identify your personal error pattern (sign errors, unit errors, misreading options).",
              "Speed failure: you ran out of time before attempting it. Fix: increase speed drills, not attempts.",
              "Strategy error: you spent too long on a hard question at the cost of easy ones. Fix: set strict per-question time limits.",
            ],
          },
          {
            k: "p",
            text: "Track the count in each bucket across mocks. Concept gaps decrease when you study. Careless errors decrease only when you identify and name the recurring mistake specifically.",
          },
        ],
      },
      {
        id: "what-to-track",
        heading: "4. What to record after each mock",
        blocks: [
          {
            k: "list",
            items: [
              "Overall score and section-wise score.",
              "Number of mistakes per error type (concept, careless, speed, strategy).",
              "Topics where you made concept errors — schedule a 20-minute revision session for each.",
              "Slowest 3 questions — what made them slow? Can you find a faster method?",
            ],
          },
          {
            k: "p",
            text: "After 3 mocks you will see a pattern: probably 2-3 recurring concept gaps and 1-2 careless error types. Eliminating those specific issues is worth more than taking 10 more mocks without targeted fixes.",
          },
        ],
      },
      {
        id: "score-improvement",
        heading: "5. How to ensure each mock improves your score",
        blocks: [
          {
            k: "p",
            text: "The cadence that works: mock → 48 hours of focused revision on the errors found → short 20-question drill on weak topics → next mock. Never take two full mocks on consecutive days without a revision session between them.",
          },
          {
            k: "p",
            text: "Do not take more than 2-3 full mocks per week. Each mock needs proper review. Under-reviewed mocks create false confidence or unaddressed patterns that compound across attempts.",
          },
        ],
      },
    ],
    takeaways: [
      "Simulate exam conditions exactly: same time, same environment, no pausing.",
      "Use a three-pass system — easy questions first, flagged questions second, guesses last.",
      "Classify every mistake: concept gap, careless, speed failure or strategy error.",
      "Track errors across mocks to identify the 2-3 recurring patterns worth fixing specifically.",
      "After each mock, revise for 48 hours before the next one. Cadence beats volume.",
      "Two to three full mocks per week with proper review beats seven rushed ones.",
    ],
    faq: [
      {
        q: "How many mock tests should I take before my placement drive?",
        a: "Aim for at least 8-10 full-length mocks in the 3 months before your drive. Quality of review matters more than quantity. A student who reviews 5 mocks thoroughly will outperform someone who rushes through 20 without analysis.",
      },
      {
        q: "When should I start taking mock tests?",
        a: "Start diagnostic mocks early — even before you feel ready. An early mock shows you the actual gap between your current level and the test requirement, which drives more focused preparation. Do not wait until you feel 'prepared enough' to start.",
      },
      {
        q: "What is the difference between a mock test and chapter practice?",
        a: "Chapter practice builds skills in isolation. A mock test builds exam temperament — time management, section-switching, pressure handling and stamina across the full length of the test. Both are necessary. You need chapter practice to build the skills and mock tests to train how you deploy them under pressure.",
      },
    ],
  },

  // ========================================================================
  {
    slug: "cs-core-topics-for-placement-interviews",
    title: "CS Core Topics for Placement Interviews: DBMS, OS, Networks & OOP",
    description:
      "A focused revision guide for CS core placement interview topics: DBMS, Operating Systems, Computer Networks and OOP — with the most frequently asked questions and answers.",
    excerpt:
      "The 4 CS core pillars every technical interviewer tests in campus placements — and the exact sub-topics you must know in each.",
    datePublished: "2026-06-09",
    dateModified: "2026-06-12",
    readMins: 10,
    tags: ["CS Core", "Technical Interview", "Placements"],
    keywords: [
      "CS core topics for placements",
      "DBMS interview questions freshers",
      "OS concepts for placement",
      "computer networks placement preparation",
      "OOP interview questions",
    ],
    intro: [
      "Almost every technical interview in campus placements tests the same four areas: Database Management Systems, Operating Systems, Computer Networks and Object-Oriented Programming. These are the non-negotiables.",
      "This guide gives you a focused revision map for each area — the sub-topics that appear most often, the style of questions interviewers ask, and the depth of answer that impresses versus the shallow recall that does not.",
    ],
    sections: [
      {
        id: "dbms",
        heading: "1. DBMS",
        blocks: [
          {
            k: "p",
            text: "DBMS questions are almost universally asked in technical interviews. The high-frequency sub-topics are:",
          },
          {
            k: "list",
            items: [
              "Keys: primary, candidate, foreign, super. Know the exact definition and the difference between candidate and primary key.",
              "Normalization: 1NF, 2NF, 3NF and BCNF. Be ready to normalize a given schema to 3NF step by step.",
              "Joins: inner, left, right, full outer. Know what each returns with an example.",
              "SQL: GROUP BY, HAVING vs WHERE, aggregate functions (COUNT, SUM, AVG, MAX, MIN), subqueries.",
              "Transactions: ACID properties. Be able to explain each property with an example.",
              "Indexing: what an index is, the trade-off (faster reads, slower writes), clustered vs non-clustered.",
            ],
          },
          {
            k: "p",
            text: "Interviewers probe depth: they start broad ('tell me about normalization') and then probe ('what anomalies does 2NF fix that 1NF does not?'). Prepare example-led answers, not just definitions.",
          },
        ],
      },
      {
        id: "os",
        heading: "2. Operating Systems",
        blocks: [
          {
            k: "p",
            text: "OS questions focus on three clusters:",
          },
          {
            k: "list",
            items: [
              "Process vs Thread: what is the difference, why threads share memory, when to use which. This is asked in nearly every service company interview.",
              "Deadlock: what it is, the four Coffman conditions (mutual exclusion, hold and wait, no preemption, circular wait), and prevention/avoidance strategies.",
              "Memory management: paging vs segmentation, virtual memory, page faults, thrashing.",
              "Scheduling algorithms: FCFS, SJF, Round Robin, Priority. Be able to compute average waiting time for each.",
              "Synchronization: semaphores, mutex, race conditions, the producer-consumer problem.",
            ],
          },
          {
            k: "quote",
            text: "When asked 'what is a deadlock', do not just define it — describe a real scenario. The concrete example shows understanding, the definition shows memory.",
          },
        ],
      },
      {
        id: "networks",
        heading: "3. Computer Networks",
        blocks: [
          {
            k: "list",
            items: [
              "OSI model: all 7 layers, what each does, which protocols live where.",
              "TCP vs UDP: connection-oriented vs connectionless, use cases, why UDP is used for video streaming.",
              "HTTP vs HTTPS: what HTTPS adds (TLS/SSL), why it matters.",
              "IP addressing: IPv4 vs IPv6, subnetting, the difference between public and private IP.",
              "DNS: what it does, the resolution process end to end.",
              "Three-way handshake: SYN, SYN-ACK, ACK — draw this from memory.",
            ],
          },
          {
            k: "p",
            text: "Networks questions are often lateral: 'what happens when you type a URL in a browser?' covers DNS, TCP, HTTP and rendering in one question. Practise narrating full end-to-end flows, not isolated facts.",
          },
        ],
      },
      {
        id: "oop",
        heading: "4. OOP",
        blocks: [
          {
            k: "p",
            text: "OOP is often tested first because it underpins the recruiter's view of your programming foundation. The four pillars:",
          },
          {
            k: "ol",
            items: [
              "Encapsulation: binding data and behaviour, access modifiers. Example: a BankAccount class that hides balance behind deposit/withdraw methods.",
              "Inheritance: parent-child class relationships, 'is-a' relationship, constructor chaining. Know why multiple inheritance is avoided in Java.",
              "Polymorphism: compile-time (method overloading) vs runtime (method overriding). The difference matters — interviewers ask it directly.",
              "Abstraction: hiding implementation, abstract classes vs interfaces. Know when to choose each.",
            ],
          },
          {
            k: "p",
            text: "Also revise: constructor vs destructor, static vs instance methods, virtual functions (C++), access specifiers (public, private, protected). In Java-focused interviews: String pool, == vs .equals(), garbage collection basics.",
          },
        ],
      },
      {
        id: "prep-order",
        heading: "5. How to prepare in the right order",
        blocks: [
          {
            k: "p",
            text: "Prioritise by frequency of appearance: OOP first (asked most widely), then DBMS (asked in service and product companies), then OS, then Networks. Spend two days minimum on each area building depth on the sub-topics above.",
          },
          {
            k: "p",
            text: "After initial study, do verbal mock answers out loud. Explain 'what is normalization?' to yourself as if to an interviewer. If you stutter or skip steps, revisit. The gap between 'I know this' and 'I can explain this clearly' is exactly what technical interviews expose.",
          },
        ],
      },
    ],
    takeaways: [
      "Four CS core pillars: DBMS, OS, Computer Networks, OOP. All four are tested in most technical interviews.",
      "DBMS: know keys, normalization to 3NF, all join types, SQL aggregation, ACID properties.",
      "OS: process vs thread, deadlock conditions, scheduling algorithms and synchronization are the most-asked clusters.",
      "Networks: OSI layers, TCP vs UDP, HTTP vs HTTPS, three-way handshake and DNS end-to-end.",
      "OOP: four pillars with examples, polymorphism types, abstract class vs interface.",
      "Prepare verbal answers out loud — technical interviews test explanation, not recall.",
    ],
    faq: [
      {
        q: "How much depth do I need in CS core for service company interviews?",
        a: "For service companies (TCS, Infosys, Wipro, Cognizant, Accenture), you need moderate depth: correct definitions, one clear example per concept, and the ability to distinguish similar terms (process vs thread, 2NF vs 3NF, TCP vs UDP). You do not need to implement OS schedulers or write SQL query optimizers.",
      },
      {
        q: "Is DBMS asked in every placement technical interview?",
        a: "DBMS is asked in almost every service company technical interview and in most product company interviews at the fresher level. It is the highest-frequency CS core subject. Normalize it to 3NF in your own words before your drive.",
      },
      {
        q: "What is the difference between abstract class and interface in Java?",
        a: "An abstract class can have both abstract and non-abstract methods, instance variables and constructors. An interface (pre-Java 8) can only have abstract methods. Post-Java 8, interfaces can have default and static methods. Use abstract class when you want a partial implementation; use interface when you want to define a contract that unrelated classes can implement.",
      },
    ],
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug)
}

export function allPostSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug)
}

/** BlogPosting JSON-LD for a post (SEO/AEO). */
export function blogPostingJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    keywords: post.keywords.join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    url: `${SITE_URL}/blog/${post.slug}`,
  }
}

/** FAQPage JSON-LD built from a post's on-page FAQ (AEO). */
export function postFaqJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }
}

/** BreadcrumbList JSON-LD for a post (SEO). */
export function breadcrumbJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  }
}


