export interface LearningPathDefinition {
  id: string
  name: string
  short: string
  description: string
  icon: string
  kind: "language" | "dsa" | "sql-dbms"
}

// Public catalogue metadata only. Lesson bodies, worked examples and answer keys
// live in the server-only programming curriculum module.
export const PROGRAMMING_PATHS: LearningPathDefinition[] = [
  {
    "id": "lang-c",
    "name": "C Programming",
    "short": "C",
    "description": "Learn C through problem solving, core language features, debugging, testing, software design and practical projects.",
    "icon": "Code2",
    "kind": "language"
  },
  {
    "id": "lang-cpp",
    "name": "C++ Programming",
    "short": "C++",
    "description": "Learn C++ through problem solving, core language features, debugging, testing, software design and practical projects.",
    "icon": "Code2",
    "kind": "language"
  },
  {
    "id": "lang-java",
    "name": "Java Programming",
    "short": "Java",
    "description": "Learn Java through problem solving, core language features, debugging, testing, software design and practical projects.",
    "icon": "Terminal",
    "kind": "language"
  },
  {
    "id": "lang-python",
    "name": "Python Programming",
    "short": "Python",
    "description": "Learn Python through problem solving, core language features, debugging, testing, software design and practical projects.",
    "icon": "Code2",
    "kind": "language"
  },
  {
    "id": "lang-javascript",
    "name": "JavaScript Programming",
    "short": "JavaScript",
    "description": "Learn JavaScript through problem solving, core language features, debugging, testing, software design and practical projects.",
    "icon": "Code2",
    "kind": "language"
  },
  {
    "id": "lang-csharp",
    "name": "C# Programming",
    "short": "C#",
    "description": "Learn C# through problem solving, core language features, debugging, testing, software design and practical projects.",
    "icon": "Code2",
    "kind": "language"
  },
  {
    "id": "lang-php",
    "name": "PHP Programming",
    "short": "PHP",
    "description": "Learn PHP through problem solving, core language features, debugging, testing, software design and practical projects.",
    "icon": "Code2",
    "kind": "language"
  },
  {
    "id": "dsa",
    "name": "Data Structures & Algorithms",
    "short": "DSA",
    "description": "Build problem-solving skill through complexity, arrays, strings, hashing, recursion, linear structures, trees, graphs, greedy methods and dynamic programming.",
    "icon": "ListChecks",
    "kind": "dsa"
  },
  {
    "id": "sql-dbms",
    "name": "SQL & DBMS",
    "short": "SQL + DBMS",
    "description": "Relational modelling, SQL queries, joins, indexes, transactions and ACID properties.",
    "icon": "Layers",
    "kind": "sql-dbms"
  }
]

export function getProgrammingPath(id: string): LearningPathDefinition | undefined {
  return PROGRAMMING_PATHS.find((path) => path.id === id)
}
