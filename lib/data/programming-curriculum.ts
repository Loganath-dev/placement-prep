import "@/lib/server-only"
import type { Chapter, Question } from "@/lib/types"

import { PROGRAMMING_PATHS, type LearningPathDefinition } from "@/lib/data/programming-paths"
export { PROGRAMMING_PATHS, getProgrammingPath } from "@/lib/data/programming-paths"

type LanguageSpec = {
  id: string
  name: string
  short: string
  icon: string
  starter: string
  run: string
  variables: string
  input: string
  condition: string
  loop: string
  function: string
  collection: string
  paradigm: string
}

const LANGUAGES: LanguageSpec[] = [
  {
    id: "lang-c", name: "C Programming", short: "C", icon: "Code2",
    starter: "#include <stdio.h>\n\nint main(void) {\n    int score = 80;\n    printf(\"Score: %d\\n\", score);\n    return 0;\n}",
    run: "Save the file as main.c, compile it with a C compiler (for example, cc main.c -o main), then run the executable. Compilation catches syntax and type errors before the program runs.",
    variables: "C uses explicit types such as int, float, double and char. A variable must be declared before use. Choose a type that matches the range and precision of the value; use a format specifier that matches the type when reading or printing.",
    input: "For integer input, use scanf(\"%d\", &age). The ampersand supplies the address where scanf stores the value. Check the return value of scanf in production code so invalid input is not silently accepted.",
    condition: "if (marks >= 50) { printf(\"Pass\\n\"); } else { printf(\"Retry\\n\"); }",
    loop: "for (int i = 0; i < 5; i++) { printf(\"%d\\n\", i); }\nint attempts = 0;\nwhile (attempts < 3) { attempts++; }",
    function: "int square(int value) {\n    return value * value;\n}\n\nint result = square(5);",
    collection: "int marks[] = {72, 81, 90};\nsize_t count = sizeof marks / sizeof marks[0];\nfor (size_t i = 0; i < count; i++) {\n    printf(\"%d\\n\", marks[i]);\n}",
    paradigm: "C is procedural: organise work into functions that operate on data. Structures group related fields; pointers make memory addresses explicit. Keep ownership and array bounds clear because C does not perform automatic bounds checking.",
  },
  {
    id: "lang-cpp", name: "C++ Programming", short: "C++", icon: "Code2",
    starter: "#include <iostream>\n#include <string>\n\nint main() {\n    std::string student = \"Asha\";\n    int score = 80;\n    std::cout << student << \": \" << score << '\\n';\n}",
    run: "Save as main.cpp and compile with a C++ compiler (for example, c++ -std=c++20 main.cpp -o main). The compiler checks the program and creates an executable.",
    variables: "C++ has built-in types such as int, double, bool and char, plus library types such as std::string. Prefer clear initialisation and const when a value should not change.",
    input: "Use std::cin >> age for a single token and std::getline(std::cin, name) for a full line. If you mix the two, consume the pending newline before calling getline.",
    condition: "if (marks >= 50) {\n    std::cout << \"Pass\\n\";\n} else {\n    std::cout << \"Retry\\n\";\n}",
    loop: "#include <iostream>\nfor (int i = 0; i < 5; ++i) {\n    std::cout << i << '\\n';\n}\nint attempts = 0;\nwhile (attempts < 3) { ++attempts; }",
    function: "int square(int value) {\n    return value * value;\n}\n\nint result = square(5);",
    collection: "std::vector<int> marks{72, 81, 90};\nfor (int mark : marks) {\n    std::cout << mark << '\\n';\n}",
    paradigm: "C++ supports procedural, object-oriented and generic programming. Classes bundle state with behaviour; templates let algorithms work with many types. Use the standard library containers and algorithms before writing low-level structures yourself.",
  },
  {
    id: "lang-java", name: "Java Programming", short: "Java", icon: "Terminal",
    starter: "public class Main {\n    public static void main(String[] args) {\n        int score = 80;\n        System.out.println(\"Score: \" + score);\n    }\n}",
    run: "Save the public class in Main.java. Compile with javac Main.java and run with java Main. The JVM executes Java bytecode, which supports portability across compatible runtime environments.",
    variables: "Java is statically typed. Common primitive types include int, long, double, boolean and char. String is an object, not a primitive. Declare a type and initialise variables before reading them.",
    input: "A common beginner approach is Scanner input = new Scanner(System.in), followed by input.nextInt() or input.nextLine(). Remember that nextInt leaves the line break behind before a later nextLine call.",
    condition: "if (marks >= 50) {\n    System.out.println(\"Pass\");\n} else {\n    System.out.println(\"Retry\");\n}",
    loop: "for (int i = 0; i < 5; i++) {\n    System.out.println(i);\n}\nint attempts = 0;\nwhile (attempts < 3) { attempts++; }",
    function: "static int square(int value) {\n    return value * value;\n}\n\nint result = square(5);",
    collection: "int[] marks = {72, 81, 90};\nfor (int mark : marks) {\n    System.out.println(mark);\n}",
    paradigm: "Java is class-based and object-oriented. Objects combine fields and methods; encapsulation protects internal state. Interfaces describe capabilities, while inheritance should be used only when the subtype relationship is genuine.",
  },
  {
    id: "lang-python", name: "Python Programming", short: "Python", icon: "Code2",
    starter: "student = \"Asha\"\nscore = 80\nprint(f\"{student}: {score}\")",
    run: "Save as main.py and run with python main.py. Python executes source through its runtime, so the edit-run cycle is short. Read the complete traceback: it identifies the failing line and exception type.",
    variables: "Python names refer to objects; you do not declare a fixed type in advance. Common values include int, float, bool and str. Use meaningful names and convert input explicitly because input() always returns text.",
    input: "Use age = int(input(\"Age: \")) for an integer. Conversion can raise ValueError, so validate user input when the program must handle unexpected text safely.",
    condition: "if marks >= 50:\n    print(\"Pass\")\nelse:\n    print(\"Retry\")",
    loop: "for i in range(5):\n    print(i)\n\nattempts = 0\nwhile attempts < 3:\n    attempts += 1",
    function: "def square(value: int) -> int:\n    return value * value\n\nresult = square(5)",
    collection: "marks = [72, 81, 90]\nfor mark in marks:\n    print(mark)\n\nscores_by_name = {\"Asha\": 90, \"Ravi\": 84}",
    paradigm: "Python supports procedural, object-oriented and functional styles. Functions are first-class values; classes model objects when shared state and behaviour belong together. Prefer the simplest style that makes the data flow clear.",
  },
  {
    id: "lang-javascript", name: "JavaScript Programming", short: "JavaScript", icon: "Code2",
    starter: "const student = \"Asha\";\nconst score = 80;\nconsole.log(`${student}: ${score}`);",
    run: "Save as main.js and run with Node.js using node main.js. In browsers, JavaScript runs in the page environment. Keep browser APIs and Node.js APIs distinct because they are not interchangeable.",
    variables: "Use const by default and let when reassignment is required; avoid var in new code. JavaScript has number, string, boolean, bigint, symbol, undefined and object values. Use === for strict equality.",
    input: "In Node.js, read standard input through the readline module or process.stdin. In a browser, form controls are a better input mechanism than prompt() for real interfaces. Validate strings before converting them to numbers.",
    condition: "if (marks >= 50) {\n  console.log(\"Pass\");\n} else {\n  console.log(\"Retry\");\n}",
    loop: "for (let i = 0; i < 5; i += 1) {\n  console.log(i);\n}\nlet attempts = 0;\nwhile (attempts < 3) { attempts += 1; }",
    function: "function square(value) {\n  return value * value;\n}\nconst result = square(5);",
    collection: "const marks = [72, 81, 90];\nfor (const mark of marks) {\n  console.log(mark);\n}\nconst scoresByName = { Asha: 90, Ravi: 84 };",
    paradigm: "JavaScript supports prototype-based object orientation and functional patterns. Functions can be passed as values; arrays offer map, filter and reduce. Learn promises and async/await after understanding synchronous control flow.",
  },
  {
    id: "lang-csharp", name: "C# Programming", short: "C#", icon: "Code2",
    starter: "using System;\n\nclass Program {\n    static void Main() {\n        int score = 80;\n        Console.WriteLine($\"Score: {score}\");\n    }\n}",
    run: "Create a console project with dotnet new console, then run it with dotnet run. The .NET SDK builds the project and launches it using the configured runtime.",
    variables: "C# is statically typed. Common types include int, long, decimal, double, bool and string. Use var when the right-hand side makes the type obvious; var is still statically typed.",
    input: "Console.ReadLine() returns a string or null. Use int.TryParse(text, out int age) when invalid input should be handled without throwing an exception.",
    condition: "if (marks >= 50) {\n    Console.WriteLine(\"Pass\");\n} else {\n    Console.WriteLine(\"Retry\");\n}",
    loop: "for (int i = 0; i < 5; i++) {\n    Console.WriteLine(i);\n}\nint attempts = 0;\nwhile (attempts < 3) { attempts++; }",
    function: "static int Square(int value) {\n    return value * value;\n}\n\nint result = Square(5);",
    collection: "int[] marks = { 72, 81, 90 };\nforeach (int mark in marks) {\n    Console.WriteLine(mark);\n}",
    paradigm: "C# is object-oriented with strong support for interfaces, generics and functional-style LINQ. Classes model reference types; structs model value types. Keep methods focused and make dependencies explicit.",
  },
  {
    id: "lang-php", name: "PHP Programming", short: "PHP", icon: "Code2",
    starter: "<?php\n$student = \"Asha\";\n$score = 80;\necho \"$student: $score\" . PHP_EOL;\n?>",
    run: "Save as main.php and run with php main.php. PHP is commonly used on the server; the web server executes PHP and sends the resulting response to the client.",
    variables: "PHP variables begin with $. Common values include int, float, bool, string, arrays and objects. PHP is dynamically typed, so validate external data and use strict comparisons (===) when type matters.",
    input: "For command-line scripts, read input with trim(fgets(STDIN)). For web requests, validate and normalise values from request data; never trust raw user input.",
    condition: "if ($marks >= 50) {\n    echo \"Pass\";\n} else {\n    echo \"Retry\";\n}",
    loop: "for ($i = 0; $i < 5; $i++) {\n    echo $i . PHP_EOL;\n}\n$attempts = 0;\nwhile ($attempts < 3) { $attempts++; }",
    function: "function square(int $value): int {\n    return $value * $value;\n}\n$result = square(5);",
    collection: "$marks = [72, 81, 90];\nforeach ($marks as $mark) {\n    echo $mark . PHP_EOL;\n}\n$student = [\"name\" => \"Asha\", \"score\" => 90];",
    paradigm: "PHP supports procedural and object-oriented styles. Associative arrays are common for structured data; classes are useful when behaviour and state form a reusable domain concept. Escape output according to its destination to prevent injection.",
  },
]

function makeQuestion(
  id: string,
  topic: string,
  prompt: string,
  options: string[],
  answer: number,
  explanation: string,
  difficulty: Question["difficulty"] = "easy",
  exercise: Pick<Question, "type" | "acceptedAnswers" | "hint"> = {},
): Question {
  return {
    id,
    topic,
    difficulty,
    prompt,
    options,
    answer,
    explanation,
    sourceId: "studybench-curriculum",
    curated: true,
    ...exercise,
  }
}

function sourceIdsForPath(path: LearningPathDefinition): string[] {
  const sourceByPath: Record<string, string> = {
    "lang-c": "c-language-reference",
    "lang-cpp": "cpp-language-reference",
    "lang-java": "java-language-reference",
    "lang-python": "python-docs-tutorial",
    "lang-javascript": "mdn-javascript-guide",
    "lang-csharp": "csharp-language-reference",
    "lang-php": "php-language-reference",
    dsa: "opendsa-reference",
    "sql-dbms": "postgresql-tutorial",
  }
  return ["studybench-curriculum", sourceByPath[path.id] ?? "studybench-curriculum"]
}

function makeChapter(
  path: LearningPathDefinition,
  suffix: string,
  title: string,
  summary: string,
  lessons: { title: string; minutes: number; body: string }[],
  quiz: Question[],
): Chapter {
  return {
    id: `${path.id}-${suffix}`,
    pathId: path.id,
    pathName: path.name,
    pathKind: path.kind,
    title,
    summary,
    lessons: lessons.map((lesson, index) => ({
      id: `${path.id}-${suffix}-lesson-${index + 1}`,
      title: lesson.title,
      minutes: lesson.minutes,
      body: lesson.body,
      sourceIds: sourceIdsForPath(path),
    })),
    // Keep only authored, topic-specific questions. Generic reusable filler
    // questions made different chapters look artificially complete.
    quiz: quiz.map((question) => ({
      ...question,
      prompt: `${title}: ${question.prompt}`,
    })),
  }
}

function languageChapters(language: LanguageSpec): Chapter[] {
  const path: LearningPathDefinition = {
    id: language.id,
    name: language.name,
    short: language.short,
    description: `A complete ${language.short} path from first program to debugging, data structures, software design, advanced practice and portfolio projects.`,
    icon: language.icon,
    kind: "language",
  }

  return [
    makeChapter(
      path,
      "foundations",
      `${language.short}: program structure and data types`,
      "Understand how a program starts, how values are represented and how input becomes typed data.",
      [
        {
          title: "Your first program",
          minutes: 7,
          body: `A program is a sequence of instructions that transforms input into output. Start by identifying the entry point, the statements that execute, and the output operation.\n\n\`\`\`${language.short.toLowerCase()}\n${language.starter}\n\`\`\`\n\n${language.run}\n\n**Trace it:** identify the initial values, follow the statements in order, then predict the exact output before running the program.\n\n**Common mistake:** changing several lines at once when debugging. Change one thing, run again, and compare the result.`,
        },
        {
          title: "Variables, types and input",
          minutes: 8,
          body: `A variable gives a meaningful name to a value. The type tells you which operations are valid and how the value is represented.\n\n${language.variables}\n\n**Input discipline:** ${language.input}\n\n**Worked check:** if a score is read as text, comparing it with the number 50 may fail or behave unexpectedly. Convert and validate it before comparison.\n\n**Practice habit:** write down the expected type of every input before choosing an operation.`,
        },
      ],
      [
        makeQuestion(`${language.id}-f-q1`, "Program structure", `In a small ${language.short} program, why identify the entry point first?`, ["To know where execution begins", "To make every variable global", "To skip input validation", "To remove all functions"], 0, "The entry point establishes the first instruction executed. Trace from there."),
        makeQuestion(`${language.id}-f-q2`, "Types", `What is the main purpose of a data type in ${language.short}?`, ["To describe a value and valid operations", "To decide the screen colour", "To guarantee no bugs", "To replace variable names"], 0, "Types describe the kind of value and constrain the operations that make sense."),
        makeQuestion(`${language.id}-f-q3`, "Input", "Why should external input be validated?", ["It may be missing or malformed", "It is always encrypted", "It cannot contain numbers", "It automatically has the correct type"], 0, "Input is not trustworthy; validation prevents invalid values from flowing through the program."),
        makeQuestion(`${language.id}-f-q4`, "Execution", `What does the ${language.short} runtime or executable do after the program is built or started?`, ["Carries out the program instructions", "Automatically proves the algorithm is correct", "Creates tests for every edge case", "Changes the source code into a design document"], 0, "The runtime or executable carries out instructions; it does not guarantee the program's logic is correct."),
        makeQuestion(`${language.id}-f-q5`, "Types", `Why choose an appropriate numeric type in ${language.short}?`, ["Range and precision affect which values can be represented", "It changes the font", "It prevents every runtime error", "It removes the need for validation"], 0, "Types affect representation, valid operations and precision."),
        makeQuestion(`${language.id}-f-q6`, "Input", "A user enters digits into a text field. What should the program do before numeric arithmetic?", ["Parse or convert the text and handle invalid input", "Assume the value is already numeric", "Sort the characters", "Append a decimal point"], 0, "Text that looks numeric is still text until parsed or converted."),
        makeQuestion(`${language.id}-f-q7`, "Output tracing", `If ${language.short} executes two print/output statements in sequence, what is the best way to predict the result?`, ["Trace each statement in execution order", "Assume the last statement runs first", "Ignore variable values", "Read the file name"], 0, "Tracing follows the actual execution order and current values."),
        makeQuestion(`${language.id}-f-q8`, "Validation", "Which input test is most useful for an age field that accepts 18 through 60 inclusive?", ["17, 18, 60 and 61", "Only 30", "Only 18", "Only 100"], 0, "Test just below, at and just above both boundaries."),
      ],
    ),
    makeChapter(
      path,
      "control-flow",
      `${language.short}: decisions and loops`,
      "Choose a branch deliberately and repeat work without off-by-one errors.",
      [
        {
          title: "Branch with conditions",
          minutes: 7,
          body: `Conditional statements let a program choose a path based on a Boolean expression.\n\n\`\`\`${language.short.toLowerCase()}\n${language.condition}\n\`\`\`\n\nRead the condition as a question that must evaluate to true or false. Use else for the alternative path and combine conditions only when the logic is clear.\n\n**Dry run:** test values just below, exactly at and just above a boundary. For a pass mark of 50, test 49, 50 and 51.\n\n**Common mistake:** using assignment where comparison is intended, or forgetting that equality and ordering are different tests.`,
        },
        {
          title: "Repeat with loops",
          minutes: 8,
          body: `A loop repeats a block while a condition or sequence says there is more work to do.\n\n\`\`\`${language.short.toLowerCase()}\n${language.loop}\n\`\`\`\n\nA counted loop is useful when the number of repetitions is known. A while loop is useful when repetition depends on a condition.\n\n**Trace table:** write the loop variable before each iteration, evaluate the condition, record the output, then update the variable. Stop when the condition becomes false.\n\n**Common mistake:** an off-by-one boundary. Decide whether the final value should be included, then choose < or <= accordingly.`,
        },
      ],
      [
        makeQuestion(`${language.id}-c-q1`, "Conditions", "A score of exactly 50 must pass. Which comparison includes 50?", ["> 50", ">= 50", "< 50", "!= 50"], 1, "Greater-than-or-equal includes the boundary value."),
        makeQuestion(`${language.id}-c-q2`, "Loops", "What must change in a counted loop to ensure it eventually stops?", ["The loop's controlling state", "The file name", "The function name", "The output text"], 0, "The controlling variable or condition must progress toward termination."),
        makeQuestion(`${language.id}-c-q3`, "Dry run", "What is the best way to catch an off-by-one error?", ["Trace the first, boundary and final iterations", "Rename every variable", "Remove the loop condition", "Only test a large input"], 0, "Boundary-focused tracing exposes incorrect start, stop and update rules."),
        makeQuestion(`${language.id}-c-q4`, "Boolean logic", "A rule requires both A and B to be true. Which logical operator expresses that requirement?", ["AND", "OR", "NOT", "XOR"], 0, "AND is true only when both conditions are true."),
        makeQuestion(`${language.id}-c-q5`, "Conditions", "Why should a program check invalid input before applying a grade or eligibility rule?", ["Invalid values should not be treated as valid cases", "It makes loops faster", "It changes the input encoding", "It removes the need for output"], 0, "Validate the input domain before evaluating business rules."),
        makeQuestion(`${language.id}-c-q6`, "Loops", "What must happen in a condition-controlled loop for it to terminate?", ["The controlling state must eventually make the condition false", "The output must be a number", "The loop must contain another loop", "The variable must be global"], 0, "A loop needs progress toward a stopping condition."),
        makeQuestion(`${language.id}-c-q7`, "Loop tracing", "A loop starts at 0 and continues while the counter is less than 5. How many times does it run if the counter increases by 1?", ["5", "4", "6", "0"], 0, "The counter takes values 0, 1, 2, 3 and 4."),
        makeQuestion(`${language.id}-c-q8`, "Decision testing", "Which set checks a threshold of 50 most effectively?", ["49, 50 and 51", "Only 75", "Only 0", "Only 100"], 0, "Test just below, at and above the threshold."),
      ],
    ),
    makeChapter(
      path,
      "functions-and-collections",
      `${language.short}: functions and collections`,
      "Break work into reusable operations and process groups of related values.",
      [
        {
          title: "Functions, parameters and return values",
          minutes: 8,
          body: `A function gives a named boundary to one operation. Parameters provide input; a return value communicates the result.\n\n\`\`\`${language.short.toLowerCase()}\n${language.function}\n\`\`\`\n\nKeep a function focused on one responsibility. Prefer returning a result over silently changing unrelated global state. Give parameters and return values meaningful types or contracts.\n\n${language.paradigm}\n\n**Interview explanation:** describe the function's input, output, side effects and expected complexity before discussing implementation details.`,
        },
        {
          title: "Arrays and collection basics",
          minutes: 8,
          body: `A collection stores multiple values so that one operation can process them systematically.\n\n\`\`\`${language.short.toLowerCase()}\n${language.collection}\n\`\`\`\n\nAn array is usually indexed from zero. For n elements, valid indexes are 0 through n - 1. A traversal visits each element once and therefore takes O(n) time.\n\n**Worked method:** initialise an accumulator, visit each value, update the accumulator, and return the final result. This pattern powers sums, counts, minimums and maximums.\n\n**Common mistake:** accessing index n, which is one position beyond the last element.`,
        },
      ],
      [
        makeQuestion(`${language.id}-fc-q1`, "Functions", "What should a well-designed function make clear?", ["Its inputs, output and responsibility", "Only its line count", "The author's name", "The computer's screen size"], 0, "A function contract describes what it needs, what it returns and what responsibility it owns."),
        makeQuestion(`${language.id}-fc-q2`, "Arrays", "For an array of n elements indexed from zero, what is the last valid index?", ["n", "n - 1", "n + 1", "1"], 1, "Zero-based indexing means the valid range is 0 through n - 1."),
        makeQuestion(`${language.id}-fc-q3`, "Complexity", "What is the time complexity of visiting every element once?", ["O(1)", "O(log n)", "O(n)", "O(n²)"], 2, "A single traversal performs work proportional to the number of elements."),
        makeQuestion(`${language.id}-fc-q4`, "Functions", "Why should a calculation function normally return its result?", ["The caller can reuse or display the value as needed", "It automatically writes a file", "It removes all parameters", "It prevents invalid input"], 0, "Returning a value separates computation from presentation."),
        makeQuestion(`${language.id}-fc-q5`, "Collections", "What should a program check before reading the first element of a collection?", ["That the collection is not empty", "That it is sorted", "That it contains duplicates", "That its name is uppercase"], 0, "An empty collection has no first element."),
        makeQuestion(`${language.id}-fc-q6`, "Scope", "Why are hidden global variables a problem for reusable functions?", ["They create dependencies that are not visible in the function inputs", "They make every function asynchronous", "They guarantee a faster program", "They remove the need for tests"], 0, "Explicit inputs make a function easier to reason about and test."),
        makeQuestion(`${language.id}-fc-q7`, "Collections", "For a zero-indexed array with 10 elements, what is the last valid index?", ["9", "10", "11", "1"], 0, "Indexes range from 0 through n - 1."),
        makeQuestion(`${language.id}-fc-q8`, "Problem solving", "When should you choose a map/dictionary instead of scanning a list repeatedly?", ["When key-based lookups are a frequent operation", "When order is the only requirement", "When the collection must allow duplicate keys", "When no values are stored"], 0, "A map/dictionary is designed for key-value lookup."),
      ],
    ),
    ...extendedLanguageChapters(language),
  ]
}


function extendedLanguageChapters(language: LanguageSpec): Chapter[] {
  const isPython = language.id === "lang-python"
  const p = language.short
  const pythonModules = [
    {
      suffix: "program-thinking",
      title: "Program design, execution and debugging",
      summary: "Move from copying syntax to understanding how a program executes and how to investigate failures.",
      lessons: [
        { title: "From a problem statement to an algorithm", minutes: 12, body: `Python's print() displays values; learn sep and end to control separators and line endings. Comments begin with the hash symbol. Escape sequences represent a newline, tab, literal backslash or quote. Triple-quoted strings are useful for multi-line text and documentation.

Before writing code, restate the problem in your own words. Identify the input, expected output, constraints and edge cases. Write a small example by hand, then describe the steps in plain language or pseudocode. Only then translate the steps into ${p}.\n\n**Worked approach — electricity bill:** input the consumed units, choose the correct rate rule, calculate the bill, and print a formatted result. Separate the calculation from the input/output so each part can be checked independently.\n\n**Student task:** write an algorithm for an electricity-bill calculator before coding it. Include zero units, a typical value and a very large value. Then write a shopping subtotal calculator for two items and compare the expected result with your program.` },
        { title: "Run, read errors and debug systematically", minutes: 12, body: `${language.run}\n\nA syntax error means the program cannot be parsed. A runtime error occurs while it runs. A logic error produces an incorrect result even though the program completes. These are different problems and need different investigations.\n\nUse a repeatable debugging loop: reproduce the problem, read the full error message, locate the failing line, inspect the values, form one hypothesis, change one thing and rerun the same test. Add temporary output or use a debugger; remove noisy debugging output before finishing.\n\n**Checkpoint:** explain the difference between a syntax, runtime and logic error using one example of each.` },
      ],
      questions: [
        ["Program design", "What should you identify before implementing a problem?", ["Inputs, outputs, constraints and edge cases", "Only the variable names", "The number of comments", "The screen colour"], 0, "A clear problem contract prevents coding toward the wrong behaviour."],
        ["Debugging", "A program runs but calculates the wrong total. What kind of defect is most likely?", ["Syntax error", "Logic error", "Compiler installation error", "Import error"], 1, "A completed run with an incorrect result is a logic error."],
        ["Testing", "Why should you keep a failing example while debugging?", ["To verify the fix against the same failure", "To make the program longer", "To avoid reading the error", "To replace all tests"], 0, "A reproducible case confirms whether the change actually fixes the defect."],
      ]
    },
    {
      suffix: "numbers-and-expressions",
      title: "Numbers, operators and numeric reasoning",
      summary: "Use numeric types correctly, convert values safely and reason about precision.",
      lessons: [
        { title: "Numeric types, arithmetic and precedence", minutes: 12, body: `Programs frequently calculate prices, measurements, marks, time and percentages. Understand the numeric types available in ${p}: ${language.variables}\n\nPractise addition, subtraction, multiplication, division, floor division (\`//\`), remainder (\`%\`) and exponentiation (\`**\`). Parentheses make intended order explicit. Python supports \`int\`, \`float\` and \`complex\`; ordinary \`/\` returns a float, while \`//\` performs floor division.

Use \`abs\`, \`round\`, and the \`math\` module's \`floor\`, \`ceil\`, \`trunc\`, \`sqrt\`, \`sin\`, \`cos\` and \`log\` when the task requires them. \`random.randint(a, b)\` generates an integer in the inclusive range. \`float.is_integer()\` checks whether a float has no fractional part, and \`isinstance(value, type)\` checks an object's type.\n\n**Worked problem:** calculate fuel cost from distance, mileage and price per litre. First compute litres = distance / mileage, then cost = litres × price. Label units and check that the result is plausible.\n\n**Common traps:** mixing strings and numbers, truncating a value too early, dividing by zero and relying on floating-point values for exact currency arithmetic.` },
        { title: "Conversion, rounding and validation", minutes: 12, body: `Input often arrives as text even when the user intends to enter a number. Convert it deliberately and handle invalid input. Know the difference between rounding for display and changing the value used in later calculations.\n\nFor financial calculations, consider integer minor units (such as paise) or \`decimal.Decimal\` rather than accumulating binary floating-point error. Use \`abs\`, \`min\`, \`max\`, \`round\`, \`math.floor\`, \`math.ceil\` and \`math.trunc\` only when their behaviour matches the requirement; do not use rounding to hide a flawed calculation.

Use \`random.randint(18, 98)\` only for sample or practice data, never for real user attributes or security-sensitive tokens. Test whether a float is mathematically integral with \`value.is_integer()\` instead of guessing from its display.\n\n**Practice:** accept a quantity and unit price, reject negative values, calculate the subtotal and display two decimal places. Test blank input, letters, zero, negative values and a normal purchase.` },
      ],
      questions: [
        ["Numeric conversion", "Why must text input be converted before numeric arithmetic?", ["Text and numeric values have different operations", "All text is encrypted", "Conversion makes input trusted", "Numbers cannot be printed"], 0, "A string containing digits is still text until converted."],
        ["Precision", "What is the safest general approach for currency calculations?", ["Use a suitable decimal or integer-minor-unit representation", "Round every intermediate value randomly", "Store all amounts as words", "Ignore precision"], 0, "Binary floating-point cannot represent every decimal fraction exactly."],
        ["Validation", "Which test is important for a fuel-cost calculator?", ["Zero or invalid mileage", "Only a typical distance", "A different font", "A longer variable name"], 0, "Zero or invalid mileage can cause division errors or meaningless results."],
      ]
    },
    {
      suffix: "strings-and-text",
      title: "Strings and real-world text processing",
      summary: "Clean, inspect, extract, validate and format text received from users or files.",
      lessons: [
        { title: "String operations, indexing and slicing", minutes: 14, body: `A string is a sequence of characters. Learn length, indexing, slicing or substring extraction, concatenation and repetition. Index boundaries matter: a sequence with n characters normally has positions from 0 through n - 1 in zero-based languages.\n\nPractise \`len\`, positive and negative indexing, slicing, \`count\`, \`replace\`, \`split\`, \`join\`, \`strip\`, \`lower\`, \`upper\` and \`casefold\`. Use f-strings for readable output, for example \`f"{name}: {score:.1f}"\`. Escape sequences such as \`\\n\` and \`\\t\` change how text is displayed.

Practise extracting a username from an email, a file extension from a filename and a date component from a known format. Check whether the input is empty before accessing its first or last character. Remember that user-perceived characters can be more complex than one byte.\n\n**Mini task:** given \`"+91 98765-43210"\`, normalise spaces and hyphens, then validate the resulting length and allowed characters.` },
        { title: "Search, replace, split, trim and format", minutes: 14, body: `Real text is messy. Learn to trim leading/trailing whitespace, change case, search for a substring, count occurrences, replace unwanted characters and split a delimited line into fields. Understand whether each operation changes the original value or returns a new one.\n\nUse f-strings or the language's formatting API instead of fragile concatenation. Practise chained transformations such as \`text.strip().lower().replace(" ", "-")\`, and split records into fields before validating each field. When building output from user data, escape it for the destination context; string cleanup is not a substitute for security validation.\n\n**Project exercise:** parse a simple record such as \`"Asha,19,Coimbatore"\`, validate the fields, convert the age to a number and print a clean summary. Handle missing fields and extra whitespace.` },
      ],
      questions: [
        ["String indexing", "What should you check before accessing the first character?", ["That the string is not empty", "That the string is uppercase", "That it contains a comma", "That its length is even"], 0, "Empty strings have no first character."],
        ["Text cleaning", "Which operation is appropriate for removing surrounding whitespace?", ["Trim/strip", "Sort", "平方", "Compile"], 0, "Trimming removes whitespace at the ends without removing meaningful internal spaces."],
        ["Parsing", "Why should parsed fields be validated after splitting a line?", ["Fields may be missing, malformed or unexpected", "Split always guarantees correct data", "It encrypts the record", "It sorts the fields"], 0, "Splitting separates text; it does not prove the fields are valid."],
      ]
    },
    {
      suffix: "conditions-and-logic",
      title: "Boolean logic and decision systems",
      summary: "Build correct multi-condition rules and test boundaries instead of memorising if syntax.",
      lessons: [
        { title: "Comparisons, Boolean expressions and truth tables", minutes: 13, body: `A condition evaluates to true or false. Learn equality, inequality and ordering comparisons, then combine them with logical AND, OR and NOT. Understand short-circuit evaluation: the second expression may not run if the first already determines the result.\n\nTranslate a sentence into a condition before coding it. Learn comparison operators, chained comparisons such as \`18 <= age <= 60\`, and Boolean operators \`and\`, \`or\` and \`not\`. Use membership operators \`in\` / \`not in\` to check containers. Use \`is\` / \`is not\` for identity checks such as \`value is None\`, not for ordinary value equality.

Python truthiness treats empty containers, zero and \`None\` as false. \`any()\` checks whether at least one item is truthy; \`all()\` checks whether every item is truthy. \`isinstance()\` checks types. Draw a tiny truth table when conditions become difficult to reason about.\n\n**Practice:** write conditions for an age range, a valid password length, an order that qualifies for free delivery, and a basic email-format exercise. For the email exercise, check non-empty input, one \`@\`, a dot in the domain, allowed length and an expected suffix. This is a learning exercise, not a complete RFC-compliant email validator or production authentication check. Include the exact boundary values.` },
        { title: "if/else, nested decisions and conditional expressions", minutes: 14, body: `Use if/else-if/else (or the equivalent syntax in ${p}) when a program must choose among alternatives. Order overlapping conditions from the most specific to the more general. Nested decisions are valid, but deeply nested logic is often clearer when extracted into named functions.\n\n**Worked example — grade calculator:** validate that marks are within the allowed range first; only then assign a grade. A mark of 100, 50, 49, 0 and -1 should each produce the expected result. Never let an invalid mark fall through into a valid grade.\n\nUse independent \`if\` statements when multiple actions may all need to run; use \`if\` / \`elif\` / \`else\` when exactly one branch should be selected. Nested \`if\` statements are useful when a second condition only matters after the first succeeds. Python 3.10+ also supports \`match\` / \`case\` for matching a value against known patterns; use \`if\` / \`elif\` for flexible range and compound conditions.

Conditional expressions are useful for a small value choice, not for hiding a multi-step decision. Prefer readability over clever one-line code.` },
      ],
      questions: [
        ["Boolean logic", "A learner qualifies only if attendance is at least 75% AND marks are at least 50. Which operator joins the conditions?", ["AND", "OR", "NOT", "XOR only"], 0, "Both requirements must be true."],
        ["Boundary testing", "For a rule that accepts values from 18 through 60 inclusive, which tests are most useful?", ["17, 18, 60 and 61", "Only 30", "Only 18", "Only 100"], 0, "Test just below, at and just above both boundaries."],
        ["Decision design", "What should happen before assigning a grade?", ["Validate the marks range", "Print a random grade", "Convert marks to a filename", "Skip invalid values silently"], 0, "Validation prevents invalid input from being treated as a legitimate score."],
      ]
    },
    {
      suffix: "loops-and-patterns",
      title: "Loops, nested iteration and control flow",
      summary: "Repeat work safely, reason about loop state and solve pattern-based problems.",
      lessons: [
        { title: "for loops, while loops and loop invariants", minutes: 15, body: `Use a for-style loop when iterating over a known sequence or range. Use a while loop when repetition depends on a condition that changes during execution. Every while loop needs a clear state update and a termination argument.\n\nTrace loops with a table: iteration number, current variable, condition result, action and updated value. This exposes infinite loops and off-by-one errors. Use \`break\` to stop the loop, \`continue\` to skip the current iteration and \`pass\` as an intentional placeholder that does nothing. A \`while True\` loop must have a safe exit condition; use bounded attempts for login or repeated input rather than an uncontrolled infinite loop.\n\n**Practice set:** print 1–100, sum even numbers, count digits, repeatedly ask for valid input, and limit login attempts to three. Explain why each loop terminates.` },
        { title: "Nested loops, loop-else and pattern problems", minutes: 16, body: `A nested loop runs the inner loop for each iteration of the outer loop. If the outer loop runs n times and the inner loop m times, the body runs n × m times. This is useful for grids, tables, combinations and simple pattern generation, but can become expensive for large inputs.\n\nPython supports \`for ... else\` and \`while ... else\`: the \`else\` block runs when the loop finishes normally, but not when it exits through \`break\`. Learn its exact semantics before using it; it is not the same as an \`if/else\` attached to the loop body.\n\n**Practice ladder:** multiplication tables, right triangles, inverted triangles, coordinate grids, searching a list of records and detecting duplicates. For each, predict the number of iterations before running it.` },
      ],
      questions: [
        ["Loop termination", "What is essential for a condition-controlled loop to terminate?", ["Its controlling state must eventually make the condition false", "The output must be a string", "The loop must be nested", "The variable must be global"], 0, "Without progress toward a stopping condition, the loop may run forever."],
        ["Nested loops", "If an outer loop runs 4 times and an inner loop runs 3 times per outer iteration, how many inner-body executions occur?", ["7", "12", "4", "3"], 1, "The total is 4 × 3 = 12."],
        ["Control flow", "When is continue appropriate?", ["Skip the rest of the current iteration", "Exit the entire program", "Declare a function", "Catch an exception"], 0, "Continue moves to the next loop iteration."],
      ]
    },
    {
      suffix: "collections",
      title: "Collections and data modelling",
      summary: "Choose the right data structure and transform collections without losing correctness.",
      lessons: [
        { title: "Lists/arrays, tuples and sets", minutes: 16, body: `A list or array stores an ordered sequence. Practise adding, removing, updating, slicing and traversing values. Understand the cost of inserting at the front versus appending, and avoid modifying a collection while iterating unless the behaviour is deliberate.\n\nTuples or fixed records are useful for grouped values that should not be reassigned. Sets represent unique values and support membership tests and set operations. Choose based on the behaviour you need, not on which syntax looks shortest.\n\n**Practice:** remove duplicates from a list while preserving order, find common items between two groups, and calculate minimum, maximum and average without relying blindly on built-ins.` },
        { title: "Dictionaries/maps, nested data and comprehensions", minutes: 17, body: `A dictionary or map stores key-value associations. Use it for fast lookups, counting frequencies and representing records. Understand missing-key behaviour, safe lookup and the requirement that keys be hashable in languages that use hash maps.\n\nNested structures model real data such as students with marks or orders with line items. Comprehensions or collection transformations can make a simple mapping concise, but split complex transformations into named steps.\n\n**Mini project:** build a student result analyser that stores names and marks, calculates grade counts, finds the top scorer and reports missing or invalid records.` },
      ],
      questions: [
        ["Set", "Which collection is designed to hold unique values?", ["Set", "Queue only", "String", "File"], 0, "A set represents membership without duplicate elements."],
        ["Map", "Which structure is the natural choice for mapping a student ID to a record?", ["Dictionary/map", "Stack", "Single number", "Loop counter"], 0, "A key-value map supports lookup by an identifier."],
        ["Data modelling", "Why should you choose a collection based on operations?", ["Different structures have different behaviour and performance", "All collections are identical", "Names determine speed", "Collections remove the need for tests"], 0, "The required operations determine which data structure fits."],
      ]
    },
    {
      suffix: "functions-and-modularity",
      title: "Functions, scope and reusable design",
      summary: "Turn long scripts into testable units with clear inputs, outputs and responsibilities.",
      lessons: [
        { title: "Parameters, return values and scope", minutes: 16, body: `A function should have a clear contract: what it receives, what it returns, and what it changes. Practise positional and named arguments, default values, variable-length arguments where supported, and return values. Distinguish printing a result from returning it to the caller.\n\nUnderstand local and global scope. Avoid hidden dependencies on global variables because they make testing and reuse difficult. Use meaningful names and keep each function focused on one responsibility.\n\n**Refactor exercise:** split a student-result script into functions for input validation, average calculation, grade assignment and report formatting. Test each function separately.` },
        { title: "Recursion, higher-order functions and clean modules", minutes: 17, body: `Recursion solves a problem by reducing it to a smaller instance of the same problem. Every recursive solution needs a base case and progress toward it; otherwise it does not terminate. Compare a recursive factorial with an iterative version and discuss stack usage.\n\nMany languages support functions as values, callbacks or higher-order operations. Use map/filter/reduce or their equivalents when they make a transformation clearer, not merely to appear advanced. Separate related functions into modules/files and define a clean public interface.\n\n**Checkpoint:** explain when recursion is suitable, how a function can be tested independently, and why a module should have one coherent purpose.` },
      ],
      questions: [
        ["Return values", "Why is returning a value more reusable than printing it inside every function?", ["The caller can decide how to use the result", "Printing is always forbidden", "Return values remove parameters", "It makes the function global"], 0, "Returning data separates computation from presentation."],
        ["Scope", "Why are hidden global dependencies difficult to test?", ["The function depends on state outside its explicit inputs", "Global variables cannot store numbers", "They prevent loops", "They automatically cause syntax errors"], 0, "Explicit inputs make behaviour easier to reproduce and verify."],
        ["Recursion", "What must a recursive function have?", ["A base case and progress toward it", "A global variable only", "At least two files", "A nested class"], 0, "The base case stops recursion and each step must move toward it."],
      ]
    },
    {
      suffix: "errors-testing",
      title: "Exceptions, validation and automated testing",
      summary: "Build programs that fail safely and prove behaviour with repeatable tests.",
      lessons: [
        { title: "Exceptions and defensive input handling", minutes: 16, body: `An exception represents an exceptional condition during execution. Learn the language's try/catch/except/finally or equivalent mechanism. Catch only errors you can handle meaningfully; broad catch-all handlers can hide programming defects.\n\nValidate data at system boundaries: keyboard input, files, APIs and user forms. Give a useful message, preserve diagnostic detail for developers, and never expose secrets or internal stack traces to end users. Clean up resources even when an error occurs.\n\n**Practice:** make a robust calculator that handles invalid numbers, division by zero and unsupported operations without crashing or silently returning a fake answer.` },
        { title: "Unit tests, edge cases and debugging workflow", minutes: 17, body: `A test checks a known behaviour against an expected result. Start with normal cases, then test empty input, one item, repeated values, boundaries, invalid values and large inputs. Unit tests target one small unit; integration tests check components working together.\n\nUse descriptive test names and arrange each test around setup, action and assertion. A failing test should be reproducible. When fixing a bug, add a test that would have caught it so the same defect is less likely to return.\n\n**Milestone:** create tests for your grade calculator, text parser and collection analyser. Aim to test behaviour, not private implementation details.` },
      ],
      questions: [
        ["Exception handling", "Why should you avoid catching every possible exception without distinction?", ["It can hide programming defects and make failures unclear", "It makes code shorter", "It validates all input", "It improves algorithmic complexity"], 0, "Catch errors you can handle; let unexpected defects remain visible to developers."],
        ["Testing", "What is a regression test?", ["A test that guards against a previously fixed bug returning", "A test that only checks colours", "A random input generator only", "A compiler option"], 0, "A regression test preserves a previously corrected behaviour."],
        ["Edge cases", "Which set gives the strongest first boundary coverage for a minimum of 10?", ["9, 10 and 11", "Only 50", "Only 0", "Only 100"], 0, "Test just below, at and just above the threshold."],
      ]
    },
    {
      suffix: "files-and-libraries",
      title: "Files, modules and external libraries",
      summary: "Work with persistent data and use the language ecosystem responsibly.",
      lessons: [
        { title: "Read and write files safely", minutes: 16, body: `Programs often need to preserve data after they exit. Learn to open, read, write and append files. Understand text versus binary data, character encodings, relative versus absolute paths, and why resources should be closed reliably (or managed with the language's resource-management construct).\n\nNever assume a file exists or that its contents are valid. Handle missing files, permission errors and malformed records. Avoid overwriting user data accidentally.\n\n**Practice:** save a simple expense list to a text or CSV file, reload it on the next run, validate each row and calculate the total.` },
        { title: "Standard library, packages and dependency management", minutes: 17, body: `The standard library provides tested tools for dates, mathematics, collections, paths, JSON and more. Learn to search official documentation, inspect function signatures and understand return values before using an API.\n\nThird-party packages can save time, but add dependencies and security/maintenance responsibilities. Use a project-specific environment where supported, pin or constrain versions appropriately, read package documentation, and never install an unknown package just because a tutorial says so.\n\n**Practice:** read structured JSON data, validate required fields and generate a summary report. Record which library functions you used and why.` },
      ],
      questions: [
        ["Files", "What should a program do if an expected input file is missing?", ["Handle the condition and give a useful message or recovery path", "Assume the file is empty", "Crash without explanation", "Delete the folder"], 0, "Missing files are expected external conditions and should be handled deliberately."],
        ["Dependencies", "Why use a project-specific environment?", ["To isolate project dependencies", "To make every package global", "To avoid reading documentation", "To disable tests"], 0, "Isolation prevents one project's packages from unexpectedly affecting another."],
        ["Data formats", "Why validate JSON after parsing it?", ["Valid JSON syntax does not guarantee the expected fields or types", "Parsing automatically checks business rules", "JSON cannot contain strings", "Validation changes the file extension"], 0, "Schema and business validation are separate from syntax parsing."],
      ]
    },
    {
      suffix: "oop-and-architecture",
      title: "Object-oriented programming and software design",
      summary: "Model real domains with classes while keeping responsibilities and dependencies manageable.",
      lessons: [
        { title: "Classes, objects, state and encapsulation", minutes: 18, body: `A class defines a kind of object; an object is a particular instance with state and behaviour. Learn constructors, instance fields, methods and access control. Encapsulation means protecting an object's valid state through a clear interface, not simply putting every variable inside a class.\n\nUse a class when data and behaviour belong together. Do not create a class for every small calculation; a focused function may be simpler. Keep invariants explicit — for example, a bank account should not allow an invalid withdrawal to make its balance negative if the domain forbids it.\n\n**Project exercise:** model a library book and loan. Define valid states and operations, then test each state transition.` },
        { title: "Composition, inheritance, interfaces and design trade-offs", minutes: 18, body: `Composition builds a larger behaviour from collaborating objects. Inheritance expresses a genuine subtype relationship and should not be used merely to share a few lines of code. Interfaces or protocols define capabilities without forcing callers to depend on one concrete implementation.\n\nLearn the basics of polymorphism, dependency boundaries and separation of concerns. Recognise duplicated logic, overly large classes and tight coupling. Refactor incrementally while keeping tests green.\n\n**Checkpoint:** explain why a payment service should depend on a payment interface rather than directly on one provider implementation.` },
      ],
      questions: [
        ["Encapsulation", "What is the main purpose of encapsulation?", ["Protect valid state behind a clear interface", "Make every field public", "Prevent object creation", "Replace all functions"], 0, "Encapsulation controls how an object's state is accessed and changed."],
        ["Composition", "When is composition often preferable to inheritance?", ["When an object should use another capability without being its subtype", "Whenever two classes have different names", "When no behaviour is shared", "To avoid writing tests"], 0, "Composition models collaboration without claiming an is-a relationship."],
        ["Design", "Why define an interface at a dependency boundary?", ["To reduce coupling to a concrete implementation", "To make every method global", "To remove validation", "To guarantee zero runtime errors"], 0, "A stable abstraction makes implementations easier to replace and test."],
      ]
    },
    {
      suffix: "advanced-practice",
      title: "Advanced programming practice and performance",
      summary: "Reason about complexity, memory, concurrency and maintainability before building larger software.",
      lessons: [
        { title: "Algorithmic complexity and profiling", minutes: 20, body: `Estimate time and space complexity before optimising. Recognise constant, logarithmic, linear, linearithmic, quadratic and exponential growth. A nested loop is not automatically O(n²); inspect how often each loop actually runs.\n\nMeasure before optimising. Use a profiler or timing tool with representative data, identify the bottleneck, change one thing and compare results. Consider memory use and readability as well as speed.\n\n**Challenge:** process a large list of records. Compare repeated linear searches with a map/dictionary lookup and explain the time-space trade-off.` },
        { title: "Iterators, generators, asynchronous work and concurrency", minutes: 20, body: `Understand how your language represents iteration and deferred work. Iterators produce values one at a time; generators can avoid holding an entire dataset in memory. Asynchronous programming is useful when work waits on I/O, but it does not automatically make CPU-heavy code faster.\n\nLearn the difference between concurrency and parallelism, how shared mutable state creates race conditions, and why cancellation, timeouts and error propagation matter. Study the idiomatic async model of the chosen language before introducing threads or tasks.\n\n**Checkpoint:** explain why waiting for a network response is different from calculating a large prime number.` },
      ],
      questions: [
        ["Complexity", "Why should you profile before optimising?", ["To find the actual bottleneck instead of guessing", "To avoid writing tests", "To make every function asynchronous", "To increase the number of dependencies"], 0, "Measurement identifies where optimisation will have a meaningful effect."],
        ["Memory", "What is a benefit of processing a large dataset with an iterator or generator?", ["Values can be processed incrementally", "All data must be copied twice", "It removes input validation", "It guarantees parallel execution"], 0, "Incremental processing can reduce peak memory usage."],
        ["Concurrency", "What is a race condition?", ["The result depends on unpredictable timing of concurrent access", "A syntax error in a loop", "A slow sorting algorithm", "A missing semicolon"], 0, "Unsynchronised shared state can produce timing-dependent results."],
      ]
    },
    {
      suffix: "capstone-projects",
      title: "Portfolio projects and independent problem solving",
      summary: "Combine the language skills into complete, tested applications and explain your engineering decisions.",
      lessons: [
        { title: "Build a command-line application", minutes: 25, body: `Build a personal expense tracker or student record manager. It must accept input, validate it, store records in a file, load previous data, search/filter records and show a useful summary. Split the application into modules or functions with clear responsibilities.\n\n**Acceptance criteria:** invalid input does not corrupt saved data; empty datasets work; duplicate records are handled deliberately; calculations are tested; errors are understandable; a README explains setup and usage.` },
        { title: "Build, test, review and present a complete project", minutes: 25, body: `Choose a second project that solves a real problem: inventory tracker, quiz engine, contact manager, appointment scheduler or a small API-backed client. Write requirements before implementation. Sketch the data model, define the smallest useful version, then add features in increments.\n\nCreate unit tests for core rules and integration tests for important workflows. Review naming, duplication, error handling, security and performance. Use version control with meaningful commits. Write a README with the problem, features, setup, examples, design decisions and known limitations.\n\n**Final demonstration:** explain the architecture, one difficult bug, one trade-off, test coverage and what you would improve next. A project is complete when another person can run it and understand it.` },
      ],
      questions: [
        ["Project quality", "Which is the strongest evidence that a project is ready to share?", ["Another person can set it up, run it and verify documented behaviour", "It has the most files", "It uses the newest framework", "It has no README"], 0, "Reproducibility, tests and documentation make a project usable by others."],
        ["Requirements", "Why define acceptance criteria before building?", ["They make completion and expected behaviour testable", "They remove the need for design", "They guarantee no bugs", "They replace user feedback"], 0, "Acceptance criteria turn vague goals into observable outcomes."],
        ["Portfolio", "What should a project README communicate?", ["Purpose, setup, usage, design decisions and limitations", "Only the author's nickname", "Only a screenshot", "Private credentials"], 0, "A useful README lets another developer understand and run the work."],
      ]
    }
  ]

  const otherModules = [
    ["program-thinking", "Problem solving and execution", "Translate requirements into algorithms, trace execution and debug systematically.", "Start by writing input/output examples and pseudocode. Identify constraints, invalid input and edge cases before implementation. Learn the compile/run cycle for this language, read compiler/runtime diagnostics, and use a debugger or controlled logging to isolate defects.", "Refactor a small script into a sequence of clear steps. Explain the difference between syntax, runtime and logic errors."],
    ["numbers-and-expressions", "Types, expressions and numeric correctness", "Understand the type system, conversions, operators and precision.", "Study integer and floating-point types, overflow, numeric conversion, operator precedence and safe division. Learn the language's rules for implicit conversion and explicit casts. For money, use an appropriate decimal or integer-minor-unit representation.", "Build a billing calculator with validation, rounding rules and tests for zero, negative and unusually large inputs."],
    ["strings-and-text", "Strings, formatting and parsing", "Process real input instead of only printing fixed messages.", "Practise string length, indexing, slicing or substring, search, replacement, trimming, splitting, joining and formatting. Understand immutability and character encoding. Validate parsed records instead of assuming the text is well formed.", "Parse a CSV-like line, normalise whitespace, validate fields and produce a formatted report."],
    ["conditions-and-logic", "Boolean logic and decision systems", "Build multi-condition rules and test every boundary.", "Study comparisons, AND/OR/NOT, short-circuit behaviour, nested branches, switch/match constructs and conditional expressions. Refactor deeply nested decisions into small named functions when it improves clarity.", "Build an eligibility or grading rule and test just below, at and above each threshold."],
    ["loops-and-patterns", "Iteration, nested loops and control flow", "Write loops that terminate and handle real collections.", "Compare counted loops and condition-controlled loops. Trace state, use break/continue, avoid off-by-one errors, understand nested-loop cost and practise grids, tables, searches and pattern generation.", "Build a menu-driven program with bounded retries, then explain its termination condition."],
    ["collections", "Arrays, maps, sets and data transformation", "Choose data structures based on the operations the problem needs.", "Study arrays/lists, fixed records/tuples, sets, maps/dictionaries, nested structures and collection transformations. Compare lookup, insertion and traversal costs. Understand copying versus references and mutation behaviour.", "Build a small student or inventory analyser with search, grouping, counts and duplicate detection."],
    ["functions-and-modularity", "Functions, scope and reusable modules", "Design code that can be tested and reused.", "Study function contracts, parameters, return values, overload/default arguments where supported, scope, recursion and modular organisation. Learn to separate computation from input/output and avoid hidden global state.", "Refactor a long script into focused functions and write tests for each public behaviour."],
    ["errors-testing", "Exceptions, validation and testing", "Make programs robust and prove their behaviour.", "Learn the language's exception model, resource cleanup, input validation, unit testing and integration testing. Test normal cases, boundaries, empty data and invalid input. Add regression tests for fixed bugs.", "Create a tested calculator or record parser that handles invalid data without losing work."],
    ["files-and-libraries", "Files, APIs and dependency management", "Work with persistent data and the language ecosystem.", "Read and write text, structured formats such as JSON/CSV, paths and encodings. Use standard-library documentation, package managers and isolated project dependencies. Validate external data and protect secrets.", "Persist application records, reload them and generate a summary report."],
    ["oop-and-architecture", "Object-oriented design and architecture", "Model domain behaviour without overengineering.", "Study classes, objects, constructors, encapsulation, composition, inheritance, interfaces/protocols and polymorphism as supported by the language. Learn cohesion, coupling and separation of concerns.", "Model a library or inventory workflow with explicit state transitions and tests."],
    ["advanced-practice", "Performance, memory and asynchronous programming", "Understand what happens when programs grow.", "Estimate time and space complexity, profile before optimising, understand memory ownership/garbage collection, iterators and asynchronous work. Learn concurrency hazards and the language's idiomatic task model.", "Compare two implementations on representative input and explain their time/memory trade-offs."],
    ["capstone-projects", "Capstone projects and professional workflow", "Turn knowledge into a complete, explainable software project.", "Build a command-line or small service application with requirements, modular design, validation, persistence, tests, version control and documentation. Review the result as another developer would.", "Ship an expense tracker, inventory manager, quiz engine or student record system with a README and reproducible setup."]
  ]


  const languageExamples: Record<string, Record<string, string>> = {
    "lang-c": {
      "program-thinking": "#include <stdio.h>\nint units = 12;\ndouble unit_price = 8.5;\ndouble total = units * unit_price;",
      "numbers-and-expressions": "double distance = 240.0;\ndouble mileage = 16.0;\ndouble litres = distance / mileage;",
      "strings-and-text": "#include <string.h>\nchar name[] = \"Asha\";\nsize_t length = strlen(name);",
      "conditions-and-logic": "if (marks >= 50 && attendance >= 75) {\n    puts(\"Eligible\");\n} else {\n    puts(\"Not eligible\");\n}",
      "loops-and-patterns": "#include <stdio.h>\nfor (int i = 0; i < 5; i++) {\n    printf(\"%d\\\\n\", i);\n}",
      "collections": "#include <stdio.h>\nint marks[] = {78, 91, 84};\nsize_t count = sizeof(marks) / sizeof(marks[0]);\nfor (size_t i = 0; i < count; i++) printf(\"%d\\\\n\", marks[i]);",
      "functions-and-modularity": "int add(int a, int b) {\n    return a + b;\n}",
      "errors-testing": "#include <stdio.h>\nint age;\nif (scanf(\"%d\", &age) != 1) {\n    puts(\"Invalid input\");\n}",
      "files-and-libraries": "#include <stdio.h>\nFILE *file = fopen(\"notes.txt\", \"r\");\nif (file != NULL) {\n    char line[128];\n    while (fgets(line, sizeof line, file)) { /* process line */ }\n    fclose(file);\n}",
      "oop-and-architecture": "typedef struct {\n    char name[32];\n    int score;\n} Student;",
      "advanced-practice": "#include <stdio.h>\nint value = 10;\nint *pointer = &value;\nprintf(\"%d\\\\n\", *pointer);",
      "capstone-projects": "typedef struct { int id; double amount; } Expense;\nExpense item = {1, 125.50};",
    },
    "lang-cpp": {
      "program-thinking": "int units = 12;\ndouble unitPrice = 8.5;\ndouble total = units * unitPrice;",
      "numbers-and-expressions": "double distance = 240.0;\ndouble mileage = 16.0;\ndouble litres = distance / mileage;",
      "strings-and-text": "#include <string>\nstd::string name = \"Asha\";\nauto position = name.find(\"sh\");",
      "conditions-and-logic": "if (marks >= 50 && attendance >= 75) {\n    std::cout << \"Eligible\";\n}",
      "loops-and-patterns": "for (int i = 0; i < 5; ++i) {\n    std::cout << i << '\\\\n';\n}",
      "collections": "#include <iostream>\n#include <vector>\nstd::vector<int> marks{78, 91, 84};\nfor (int mark : marks) std::cout << mark << '\\\\n';",
      "functions-and-modularity": "int add(int a, int b) {\n    return a + b;\n}",
      "errors-testing": "#include <iostream>\n#include <string>\ntry {\n    int age = std::stoi(input);\n} catch (const std::exception& error) {\n    std::cerr << error.what();\n}",
      "files-and-libraries": "#include <fstream>\n#include <string>\nstd::ifstream file(\"notes.txt\");\nstd::string line;\nwhile (std::getline(file, line)) { /* process line */ }",
      "oop-and-architecture": "class BankAccount {\nprivate:\n    double balance{};\npublic:\n    void deposit(double amount) { if (amount > 0) balance += amount; }\n};",
      "advanced-practice": "#include <iostream>\nauto square = [](int value) { return value * value; };\nstd::cout << square(5);",
      "capstone-projects": "struct Expense { int id; double amount; };\nstd::vector<Expense> expenses;",
    },
    "lang-java": {
      "program-thinking": "int units = 12;\ndouble unitPrice = 8.5;\ndouble total = units * unitPrice;",
      "numbers-and-expressions": "double distance = 240.0;\ndouble mileage = 16.0;\ndouble litres = distance / mileage;",
      "strings-and-text": "String name = \"Asha\";\nString cleaned = name.trim();\nboolean found = cleaned.contains(\"sh\");",
      "conditions-and-logic": "if (marks >= 50 && attendance >= 75) {\n    System.out.println(\"Eligible\");\n}",
      "loops-and-patterns": "for (int i = 0; i < 5; i++) {\n    System.out.println(i);\n}",
      "collections": "import java.util.*;\nList<Integer> marks = new ArrayList<>(List.of(78, 91, 84));\nMap<String, Integer> counts = new HashMap<>();",
      "functions-and-modularity": "static int add(int a, int b) {\n    return a + b;\n}",
      "errors-testing": "try {\n    int age = Integer.parseInt(input);\n} catch (NumberFormatException error) {\n    System.out.println(\"Invalid number\");\n}",
      "files-and-libraries": "import java.nio.charset.StandardCharsets;\nimport java.nio.file.*;\nString text = Files.readString(Path.of(\"notes.txt\"), StandardCharsets.UTF_8);",
      "oop-and-architecture": "class BankAccount {\n    private BigDecimal balance = BigDecimal.ZERO;\n    void deposit(BigDecimal amount) { if (amount.signum() > 0) balance = balance.add(amount); }\n}",
      "advanced-practice": "List<Integer> squares = marks.stream().map(value -> value * value).toList();",
      "capstone-projects": "record Expense(int id, BigDecimal amount) {}\nList<Expense> expenses = new ArrayList<>();",
    },
    "lang-python": {
      "program-thinking": "units = 12\nunit_price = 8.5\ntotal = units * unit_price",
      "numbers-and-expressions": "distance = 240\nmileage = 16\nlitres = distance / mileage",
      "strings-and-text": "name = \" Asha \"\ncleaned = name.strip().casefold()\nprint(cleaned)",
      "conditions-and-logic": "if marks >= 50 and attendance >= 75:\n    print(\"Eligible\")",
      "loops-and-patterns": "for number in range(5):\n    print(number)",
      "collections": "marks = [78, 91, 84]\ncounts = {\"Asha\": 2, \"Ravi\": 1}\nunique_marks = set(marks)",
      "functions-and-modularity": "def add(a: int, b: int) -> int:\n    return a + b",
      "errors-testing": "try:\n    age = int(user_input)\nexcept ValueError:\n    print(\"Enter a whole number\")",
      "files-and-libraries": "from pathlib import Path\ntext = Path(\"notes.txt\").read_text(encoding=\"utf-8\")",
      "oop-and-architecture": "class BankAccount:\n    def __init__(self, balance=0):\n        self._balance = balance",
      "advanced-practice": "def squares(values):\n    for value in values:\n        yield value * value",
      "capstone-projects": "expenses = [{\"category\": \"Travel\", \"amount\": 120.0}]\ntotal = sum(item[\"amount\"] for item in expenses)",
    },
    "lang-javascript": {
      "program-thinking": "const units = 12;\nconst unitPrice = 8.5;\nconst total = units * unitPrice;",
      "numbers-and-expressions": "const distance = 240;\nconst mileage = 16;\nconst litres = distance / mileage;",
      "strings-and-text": "const name = \" Asha \";\nconst cleaned = name.trim().toLocaleLowerCase();",
      "conditions-and-logic": "if (marks >= 50 && attendance >= 75) {\n  console.log(\"Eligible\");\n}",
      "loops-and-patterns": "for (let i = 0; i < 5; i += 1) {\n  console.log(i);\n}",
      "collections": "const marks = [78, 91, 84];\nconst counts = new Map([[\"Asha\", 2], [\"Ravi\", 1]]);",
      "functions-and-modularity": "function add(a, b) {\n  return a + b;\n}",
      "errors-testing": "try {\n  const age = Number(userInput);\n  if (!Number.isFinite(age)) throw new Error(\"Invalid number\");\n} catch (error) {\n  console.error(error.message);\n}",
      "files-and-libraries": "import { readFile } from \"node:fs/promises\";\nconst text = await readFile(\"notes.txt\", \"utf8\");",
      "oop-and-architecture": "class BankAccount {\n  #balance = 0;\n  deposit(amount) { if (amount > 0) this.#balance += amount; }\n}",
      "advanced-practice": "const loadNotes = async () => await fetch(\"/api/notes\");",
      "capstone-projects": "const expenses = [{ category: \"Travel\", amount: 120 }];\nconst total = expenses.reduce((sum, item) => sum + item.amount, 0);",
    },
    "lang-csharp": {
      "program-thinking": "int units = 12;\ndecimal unitPrice = 8.5m;\ndecimal total = units * unitPrice;",
      "numbers-and-expressions": "decimal distance = 240m;\ndecimal mileage = 16m;\ndecimal litres = distance / mileage;",
      "strings-and-text": "string name = \" Asha \";\nstring cleaned = name.Trim();\nbool found = cleaned.Contains(\"sh\");",
      "conditions-and-logic": "if (marks >= 50 && attendance >= 75)\n{\n    Console.WriteLine(\"Eligible\");\n}",
      "loops-and-patterns": "for (int i = 0; i < 5; i++)\n{\n    Console.WriteLine(i);\n}",
      "collections": "using System.Collections.Generic;\nList<int> marks = new() { 78, 91, 84 };\nDictionary<string, int> counts = new();",
      "functions-and-modularity": "static int Add(int a, int b) => a + b;",
      "errors-testing": "try\n{\n    int age = int.Parse(input);\n}\ncatch (FormatException)\n{\n    Console.WriteLine(\"Invalid number\");\n}",
      "files-and-libraries": "using System.IO;\nstring text = File.ReadAllText(\"notes.txt\");",
      "oop-and-architecture": "public class BankAccount\n{\n    public decimal Balance { get; private set; }\n    public void Deposit(decimal amount) { if (amount > 0) Balance += amount; }\n}",
      "advanced-practice": "async Task<string> LoadAsync(HttpClient client, string url)\n    => await client.GetStringAsync(url);",
      "capstone-projects": "List<Expense> expenses = new();\ndecimal total = expenses.Sum(item => item.Amount);",
    },
    "lang-php": {
      "program-thinking": "$units = 12;\n$unitPrice = 8.5;\n$total = $units * $unitPrice;",
      "numbers-and-expressions": "$distance = 240;\n$mileage = 16;\n$litres = $distance / $mileage;",
      "strings-and-text": "$name = \" Asha \";\n$cleaned = strtolower(trim($name));",
      "conditions-and-logic": "if ($marks >= 50 && $attendance >= 75) {\n    echo \"Eligible\";\n}",
      "loops-and-patterns": "for ($i = 0; $i < 5; $i++) {\n    echo $i . PHP_EOL;\n}",
      "collections": "$marks = [78, 91, 84];\n$counts = [\"Asha\" => 2, \"Ravi\" => 1];",
      "functions-and-modularity": "function add(int $a, int $b): int {\n    return $a + $b;\n}",
      "errors-testing": "try {\n    $age = filter_var($input, FILTER_VALIDATE_INT);\n    if ($age === false) throw new InvalidArgumentException(\"Invalid number\");\n} catch (InvalidArgumentException $error) {\n    echo $error->getMessage();\n}",
      "files-and-libraries": "$text = file_get_contents(\"notes.txt\");",
      "oop-and-architecture": "class BankAccount {\n    private float $balance = 0;\n    public function deposit(float $amount): void {\n        if ($amount > 0) $this->balance += $amount;\n    }\n}",
      "advanced-practice": "function squares(iterable $values): Generator {\n    foreach ($values as $value) yield $value * $value;\n}",
      "capstone-projects": "$expenses = [[\"category\" => \"Travel\", \"amount\" => 120.0]];\n$total = array_sum(array_column($expenses, \"amount\"));",
    },
  }

  const modules = isPython ? pythonModules : otherModules.map((m) => ({
    suffix: m[0], title: m[1], summary: m[2],
    lessons: [
      { title: "Understand the model and syntax", minutes: 14, body: `${m[3]}\n\n**Language-specific reference:** ${language.variables}\n\n**Worked code example:**\n\n\`\`\`${language.short.toLowerCase()}\n${languageExamples[language.id]?.[m[0]] ?? language.starter}\n\`\`\`\n\nTrace the values by hand before running the code. Record the expected output and explain why each statement is needed.` },
      { title: "Apply it to a realistic problem", minutes: 16, body: `${m[4]}\n\n**Application:** translate the requirement into explicit inputs, outputs and constraints before writing the solution.\n\n**Debugging:** reproduce a failure, inspect intermediate values, identify the smallest incorrect step and change one thing at a time.\n\n**Testing:** include a normal case, a boundary case, empty input and invalid input. Explain one design choice and one possible failure mode, then record the expected result so the same behaviour can be checked after future changes.` },
    ],
    questions: [
      ["Application", `Which approach best applies ${m[1].toLowerCase()}?`, ["Define the requirement, implement a small solution and test edge cases", "Copy code without tracing it", "Ignore invalid input", "Optimise before checking correctness"], 0, "A disciplined process begins with a clear requirement and verified behaviour."],
      ["Debugging", "A solution fails for an empty input. What should you inspect?", ["The assumptions and boundary handling for empty data", "Only the variable names", "The colour theme", "The README title"], 0, "Empty input often reveals unhandled assumptions at collection boundaries."],
      ["Engineering", "When should you introduce an abstraction?", ["When it clarifies repeated behaviour or a real boundary", "For every single line", "Only to increase file count", "Before understanding the problem"], 0, "Abstractions should reduce complexity rather than add ceremony."],
    ]
  }))

  return modules.map((module) => {
    const questions = module.questions.map((q, qi) =>
      makeQuestion(`${language.id}-${module.suffix}-q${qi + 1}`, String(q[0]), String(q[1]), q[2] as string[], Number(q[3]), String(q[4]), qi === 0 ? "easy" : "medium")
    )
    const moduleAssessmentExtras: Record<string, [string, string, string[], number, string][]> = {
      "program-thinking": [
        ["Requirements", "A prompt says 'calculate the average'. What must you clarify before coding?", ["What values are included and how empty input is handled", "Only the variable name", "The number of print statements", "The editor theme"], 0, "Averages need a defined input set and an explicit empty-input rule."],
        ["Tracing", "Why trace a sample input by hand before running code?", ["To predict state changes and catch a flawed algorithm", "To avoid testing altogether", "To replace documentation", "To make execution faster"], 0, "A dry run checks the logic independently of the runtime."],
      ],
      "numbers-and-expressions": [
        ["Numeric reasoning", "A calculation needs exact decimal currency values. What should guide the type choice?", ["Precision and rounding requirements", "The shortest type name", "The user's screen size", "The number of comments"], 0, "Choose a representation that matches the domain's precision requirements."],
        ["Validation", "What should a program do before dividing by a user-provided denominator?", ["Check that it is valid and non-zero", "Convert it to uppercase", "Sort it", "Print it twice"], 0, "A denominator must be checked before division."],
      ],
      "strings-and-text": [
        ["Parsing", "Why should a parser reject or report a record with missing fields?", ["The program cannot safely assume the required data exists", "Missing fields are always zero", "It makes sorting faster", "It changes the encoding"], 0, "Parsing must validate the structure before using fields."],
        ["Formatting", "Why use a formatting API instead of manually joining many values?", ["It handles presentation consistently and clearly", "It automatically validates business rules", "It encrypts text", "It sorts the values"], 0, "Formatting separates display concerns from the underlying values."],
      ],
      "conditions-and-logic": [
        ["Boolean logic", "For 'A is eligible if age is at least 18 and consent is true', which structure is clearest?", ["One condition combining both requirements with AND", "Either requirement alone", "A loop", "A sort operation"], 0, "Both conditions must hold, so AND represents the rule."],
        ["Decision testing", "Why test values just below and above a threshold?", ["To expose off-by-one and inclusive/exclusive mistakes", "To increase source-file size", "To avoid checking the threshold", "To test network speed"], 0, "Boundary tests validate the exact transition in a decision rule."],
      ],
      "loops-and-patterns": [
        ["Loop invariant", "What should remain true at the start of each iteration in a well-reasoned loop?", ["The loop invariant describing correct progress so far", "The output must always be empty", "Every variable must be global", "The loop counter must be random"], 0, "An invariant helps prove that each iteration preserves correctness."],
        ["Iteration cost", "A nested loop visits every pair from two arrays of lengths n and m. What is the work?", ["O(n + m)", "O(n × m)", "O(log n)", "O(1)"], 1, "Every element of one array is paired with every element of the other."],
      ],
      "collections": [
        ["Data structures", "You need fast membership checks and do not need duplicate values. Which structure is a natural fit?", ["Set", "Plain string", "Single integer", "File handle"], 0, "A set represents unique membership and supports efficient lookup."],
        ["Mutation", "Why can modifying a collection while iterating over it be dangerous?", ["Elements may be skipped or indexes may shift", "It always sorts the collection", "It prevents memory allocation", "It converts values to strings"], 0, "Mutation can change iteration behaviour and cause skipped or repeated elements."],
      ],
      "functions-and-modularity": [
        ["Function contracts", "A function that calculates a total should normally do what?", ["Return the total and leave display to its caller", "Print and exit the whole program", "Change unrelated global state", "Read from a hidden file"], 0, "Returning a value separates computation from presentation."],
        ["Recursion", "What happens if recursive calls do not approach a base case?", ["The calls may continue until a runtime/resource limit is reached", "The function becomes iterative", "The compiler always fixes it", "The return value is automatically zero"], 0, "Recursion needs a terminating base case and progress toward it."],
      ],
      "errors-testing": [
        ["Test design", "Which is the strongest regression test?", ["A test that reproduces a fixed bug and asserts the correct result", "A test with no assertion", "A screenshot only", "A test that always passes"], 0, "A regression test prevents a known defect from returning."],
        ["Error handling", "When should an exception be caught?", ["When the program can handle it meaningfully", "At every line regardless of type", "Only to hide all errors", "Never"], 0, "Catch expected errors you can recover from; do not hide programming defects."],
      ],
      "files-and-libraries": [
        ["Persistence", "Why should file writes be designed to avoid accidental data loss?", ["A failed or partial write can corrupt user data", "Files cannot contain text", "It makes code shorter", "It removes the need for validation"], 0, "Persistence code must consider failures and existing data."],
        ["Dependencies", "What should you check before adding a third-party package?", ["Maintenance, security, licence and whether the standard library is enough", "Only its download count", "Only its logo", "Whether it has the longest API"], 0, "Dependencies create security, compatibility and maintenance obligations."],
      ],
      "oop-and-architecture": [
        ["Encapsulation", "A bank account must prevent withdrawals above its balance. Where should this rule live?", ["In the account's domain operation or service enforcing the invariant", "Only in a button colour", "In an unrelated report", "Nowhere"], 0, "Domain invariants should be enforced at the boundary that changes the state."],
        ["Composition", "When is composition preferable to inheritance?", ["When one object uses another capability without being its subtype", "Whenever two classes have the same name", "Only when there are no methods", "To avoid tests"], 0, "Composition models collaboration without inventing an is-a relationship."],
      ],
      "advanced-practice": [
        ["Profiling", "What is the correct first step when a program feels slow?", ["Measure representative workloads and locate the bottleneck", "Rewrite everything in another language", "Add threads immediately", "Remove all tests"], 0, "Profiling prevents optimisation based on guesses."],
        ["Concurrency", "Why is shared mutable state risky in concurrent code?", ["Operations can interleave and create race conditions", "It always reduces memory", "It guarantees ordering", "It disables exceptions"], 0, "Concurrent access needs a clear ownership or synchronisation strategy."],
      ],
      "capstone-projects": [
        ["Delivery", "Which item makes a project reproducible for another developer?", ["Setup instructions, dependencies and example usage", "A private API key", "Only a folder of screenshots", "A vague project title"], 0, "A project should explain how to install, run and verify it."],
        ["Review", "What should a capstone demonstration include?", ["The problem, design, tests, trade-offs and limitations", "Only the number of lines", "Only the language logo", "Only a claim that it works"], 0, "A technical demonstration should provide evidence of the engineering work."],
      ],
    }
    const extraQuestions = moduleAssessmentExtras[module.suffix] ?? []
    extraQuestions.forEach((q, qi) => {
      questions.push(makeQuestion(
        `${language.id}-${module.suffix}-applied-${qi + 1}`,
        String(q[0]), String(q[1]), q[2], Number(q[3]), String(q[4]), "medium",
      ))
    })
    const moduleTransferExtras: Record<string, [string, string, string[], number, string][]> = {
      "program-thinking": [
        ["Input contract", "A program receives a list of marks. Which contract detail prevents an undefined average?", ["How an empty list is handled", "The colour of the output", "The filename extension", "The number of comments"], 0, "The average of an empty collection is undefined unless the program specifies a rule."],
        ["Algorithm", "Two algorithms produce the same result. What is a useful basis for comparing them?", ["Correctness, time and extra-space requirements", "Which one has more lines", "Which variable names are shorter", "Which one prints more often"], 0, "Compare correctness and resource use under the same input assumptions."],
        ["Edge cases", "Why should a search algorithm be tested with a one-element input?", ["It exposes boundary assumptions with minimal data", "It guarantees O(1) for every input", "It replaces all other tests", "It tests file permissions"], 0, "Small boundary inputs are excellent at revealing off-by-one mistakes."],
      ],
      "numbers-and-expressions": [
        ["Precision", "Why can repeated floating-point additions produce a surprising currency total?", ["Some decimal fractions are not represented exactly in binary floating point", "Floating-point values cannot be added", "The CPU rounds every value to zero", "Strings are always used"], 0, "Binary floating point approximates many decimal fractions."],
        ["Conversion", "What should happen if a numeric conversion receives text such as 'ten'?", ["Handle the invalid conversion explicitly", "Treat it as 10 automatically", "Delete the input", "Continue with an arbitrary value"], 0, "Invalid external data must not silently become a fabricated number."],
        ["Units", "A speed is in km/h and a distance is in metres. What should you do before calculating time?", ["Convert to consistent units", "Add the values directly", "Ignore the units", "Round both to integers"], 0, "Dimensional consistency is necessary for a meaningful result."],
      ],
      "strings-and-text": [
        ["Immutability", "If a language's strings are immutable, what does a replace operation typically do?", ["Returns a new string", "Changes the original characters in place", "Deletes the variable", "Converts it to a number"], 0, "Immutable operations create a new string value."],
        ["Parsing", "What is the safest response to a record with too few comma-separated fields?", ["Reject or report the malformed record", "Assume missing values are valid", "Read beyond the record", "Silently shift every field"], 0, "A parser should validate structure before accessing fields."],
        ["Text search", "When searching user-provided text, which detail may affect correctness?", ["Case sensitivity and character encoding", "The monitor refresh rate", "The number of source files", "The colour of the editor"], 0, "Text matching rules should be explicit, especially for case and Unicode."],
      ],
      "conditions-and-logic": [
        ["Short circuit", "What is a benefit of short-circuit evaluation in a guarded condition?", ["The second expression may be skipped when the first decides the result", "Both expressions always run", "It converts numbers to strings", "It sorts Boolean values"], 0, "Short-circuiting can prevent unsafe work when a guard condition fails."],
        ["Boolean reasoning", "A user is eligible when they are at least 18 and have verified an email. Which operator joins the rules?", ["AND", "OR", "NOT", "XOR"], 0, "Both conditions must be true."],
        ["Boundary", "A loop should run for indexes 0 through 4. How many iterations should it make?", ["5", "4", "6", "0"], 0, "The inclusive index range 0–4 contains five values."],
      ],
      "loops-and-patterns": [
        ["Termination", "A while loop's condition never changes. What is the likely risk?", ["The loop may never terminate", "The loop becomes a function", "The compiler sorts it", "The condition becomes true once"], 0, "A condition-controlled loop needs progress toward its stopping condition."],
        ["Nested loops", "An algorithm compares every item with every other item in one collection. What is the typical time growth?", ["Quadratic O(n²)", "Constant O(1)", "Logarithmic O(log n)", "Linear O(n)"], 0, "Pairwise comparison performs work proportional to n times n."],
        ["Loop control", "When is break appropriate?", ["When the required result has been found and no further iterations are needed", "To skip only the current iteration", "To declare a variable", "To handle a file encoding"], 0, "break exits the nearest loop."],
      ],
      "collections": [
        ["Lookup", "You need to count how often each word occurs. Which structure is most suitable?", ["A map/dictionary from word to count", "A single Boolean", "A file path", "A floating-point number"], 0, "A map stores each key's running frequency."],
        ["Ordering", "When should you prefer a list/array over a set?", ["When order and repeated values matter", "When duplicates must always be removed", "When keys must map to values", "When no data is stored"], 0, "Lists/arrays preserve sequence and can contain duplicates."],
        ["References", "Why can two variables referring to the same mutable collection be surprising?", ["A change through one reference may be visible through the other", "Both variables become constants", "The collection is automatically copied", "The values become strings"], 0, "References can alias the same mutable object."],
      ],
      "functions-and-modularity": [
        ["Parameters", "Why pass a dependency as a function parameter instead of reading a global?", ["It makes the dependency explicit and easier to test", "It always reduces runtime to O(1)", "It removes the return value", "It prevents all exceptions"], 0, "Explicit dependencies improve clarity and testability."],
        ["Recursion", "What is the role of a base case?", ["Stop the recursive process", "Start a new thread", "Create a global variable", "Sort the input"], 0, "The base case prevents infinite recursive calls."],
        ["Modularity", "What is a sign that a function has too many responsibilities?", ["It validates input, writes files, calculates results and formats UI in one block", "It has a clear input and output", "It has a meaningful name", "It is covered by tests"], 0, "Mixed responsibilities make a function harder to understand and test."],
      ],
      "errors-testing": [
        ["Exception scope", "Why catch a specific exception type when possible?", ["It avoids hiding unrelated programming errors", "It makes all errors disappear", "It guarantees correct input", "It removes the need for logs"], 0, "Specific handling makes recovery behaviour predictable."],
        ["Test cases", "Which is a useful test for a function that returns the maximum value?", ["An empty collection if supported, one value, duplicates and negative values", "Only a list of positive unique values", "Only one very large list", "Only the function name"], 0, "A range of edge cases tests the function's assumptions."],
        ["Regression", "After fixing a bug, what should you add?", ["A test that reproduces the old failure", "A random comment", "A duplicate implementation", "A new global variable"], 0, "A regression test protects the corrected behaviour."],
      ],
      "files-and-libraries": [
        ["Encoding", "Why specify a text encoding when reading a file?", ["To decode bytes into characters consistently", "To sort the file", "To compress the file", "To skip validation"], 0, "An explicit encoding avoids platform-dependent text interpretation."],
        ["File safety", "Why use a context manager or guaranteed cleanup for files?", ["To release the resource even if an error occurs", "To make every file read-only", "To avoid checking the path", "To change the file format"], 0, "Resource cleanup should happen on both success and failure."],
        ["API use", "What should you read before relying on a library function?", ["Its contract, parameters, return value and failure behaviour", "Only its logo", "Only its download count", "Only the first line of an example"], 0, "Documentation explains what the API guarantees and what it expects."],
      ],
      "oop-and-architecture": [
        ["Polymorphism", "What does polymorphism allow?", ["Different implementations to be used through a shared interface", "Every class to have identical fields", "All objects to become global", "A method to run only once"], 0, "Callers can depend on a shared contract while implementations vary."],
        ["Inheritance", "What should be true before using inheritance?", ["The child is genuinely a subtype of the parent", "The classes share one word in their names", "The child has more lines", "The parent has no methods"], 0, "Inheritance should model a real is-a relationship."],
        ["Cohesion", "A highly cohesive module usually has:", ["A focused responsibility and related behaviour", "Many unrelated tasks", "No clear interface", "Hidden dependencies"], 0, "Cohesion measures how closely the module's responsibilities belong together."],
      ],
      "advanced-practice": [
        ["Complexity", "An algorithm halves its remaining input each step. What is its typical time complexity?", ["O(log n)", "O(n²)", "O(n)", "O(2ⁿ)"], 0, "Repeated halving creates logarithmic growth."],
        ["Memory", "What is auxiliary space?", ["Extra memory used beyond the input representation", "The size of the monitor", "The source file length", "The network bandwidth"], 0, "Auxiliary space measures additional storage used by the algorithm."],
        ["Async", "Why does async/await help with I/O-bound work?", ["It allows the program to make progress while waiting for I/O", "It makes every CPU calculation parallel", "It removes all errors", "It sorts pending requests"], 0, "Asynchronous operations avoid blocking the execution flow during waits."],
      ],
      "capstone-projects": [
        ["Acceptance criteria", "What makes an acceptance criterion useful?", ["It describes an observable behaviour that can be tested", "It says the app should be good", "It names a colour", "It lists a developer's preference"], 0, "Acceptance criteria should be verifiable."],
        ["Documentation", "Why include known limitations in a project README?", ["To set accurate expectations for users and reviewers", "To hide incomplete work", "To replace tests", "To publish secrets"], 0, "Clear limitations are part of honest engineering communication."],
        ["Version control", "What makes a useful commit message?", ["It explains the intent of a focused change", "It says 'stuff'", "It contains an API key", "It lists every file on disk"], 0, "Focused commits make the project's history understandable."],
      ],
    }
    ;(moduleTransferExtras[module.suffix] ?? []).forEach((q, qi) => {
      questions.push(makeQuestion(
        `${language.id}-${module.suffix}-transfer-${qi + 1}`,
        String(q[0]), String(q[1]), q[2], Number(q[3]), String(q[4]), "medium",
      ))
    })
    const pythonFillBlanks: Record<string, { prompt: string; answers: string[]; explanation: string; hint: string }> = {
      "program-thinking": { prompt: "Before coding, write the algorithm in plain language or ____.", answers: ["pseudocode"], explanation: "Pseudocode helps you reason about the steps before choosing exact language syntax.", hint: "It is a language-independent outline of an algorithm." },
      "numbers-and-expressions": { prompt: "In Python, input() returns a ____ value.", answers: ["string", "str"], explanation: "input() returns text. Convert it explicitly before numeric calculations.", hint: "It is Python's text type." },
      "strings-and-text": { prompt: "Which Python string method removes whitespace from both ends? ____", answers: ["strip()", "strip"], explanation: "strip() removes leading and trailing whitespace; it does not remove internal spaces.", hint: "It starts with s and ends with p." },
      "conditions-and-logic": { prompt: "The Boolean operator that requires both conditions to be true is ____.", answers: ["and"], explanation: "and evaluates true only when both operands are true.", hint: "It is one of Python's three Boolean operators: and, or, not." },
      "loops-and-patterns": { prompt: "In Python, range(1, 5) produces 1, 2, 3, ____.", answers: ["4"], explanation: "The stop value 5 is excluded from range(1, 5).", hint: "The stop boundary is exclusive." },
      "collections": { prompt: "Which Python collection stores unique values without preserving duplicates? ____", answers: ["set", "a set"], explanation: "A set stores unique hashable elements and supports efficient membership tests.", hint: "It is written with curly braces for non-empty literals." },
      "functions-and-modularity": { prompt: "The Python keyword used to send a result back to the caller is ____.", answers: ["return"], explanation: "return sends a value to the caller; print only displays output.", hint: "It is not print." },
      "errors-testing": { prompt: "Which Python block handles an exception after try? ____", answers: ["except"], explanation: "except handles a matching exception raised inside the try block.", hint: "The keyword starts with e." },
      "files-and-libraries": { prompt: "Which Python construct automatically closes a file after its block finishes? ____", answers: ["with", "with open"], explanation: "A with statement uses a context manager to release the file resource reliably.", hint: "Example: with open(...) as file:" },
      "oop-and-architecture": { prompt: "In a Python instance method, the conventional first parameter referring to the current object is ____.", answers: ["self"], explanation: "self refers to the current instance by convention in instance methods.", hint: "It is not a reserved keyword, but the standard convention." },
      "advanced-practice": { prompt: "The Python keyword used to pause a generator and yield a value is ____.", answers: ["yield"], explanation: "yield produces a value and suspends the generator until the next iteration request.", hint: "It rhymes with field." },
      "capstone-projects": { prompt: "A project README should document setup, usage, design decisions and known ____.", answers: ["limitations", "constraints"], explanation: "Clear limitations help users understand what the project does not yet support.", hint: "What the software cannot currently do." },
    }
    if (isPython) {
      const blank = pythonFillBlanks[module.suffix]
      if (blank) {
        questions.push(makeQuestion(
          `${language.id}-${module.suffix}-fill-blank`,
          "Recall",
          blank.prompt,
          [],
          -1,
          blank.explanation,
          "medium",
          { type: "fill_blank", acceptedAnswers: blank.answers, hint: blank.hint },
        ))
      }
    }
    return makeChapter(
      {
        id: language.id, name: language.name, short: language.short,
        description: `${language.name} complete beginner-to-advanced curriculum`,
        icon: language.icon, kind: "language",
      },
      module.suffix,
      module.title,
      module.summary,
      module.lessons,
      questions,
    )
  })
}



const LANGUAGE_CHAPTERS = LANGUAGES.flatMap(languageChapters)

const sqlPath = PROGRAMMING_PATHS.find((path) => path.id === "sql-dbms")!

const SQL_DBMS_CHAPTERS: Chapter[] = [
  makeChapter(sqlPath, "relational-foundations", "Relational databases, keys and normalization", "Model related data without duplication and preserve referential integrity.", [
    { title: "Tables, rows and relationships", minutes: 7, body: "A relational database stores data in tables. A row represents one record; a column represents one attribute. A primary key identifies a row, while a foreign key references a key in another table.\n\n**Example:** Students(student_id, name) and Enrolments(enrolment_id, student_id, course_id) model a one-to-many relationship between a student and enrolments.\n\n**Design check:** choose a stable key, define nullability, and make relationships explicit rather than storing comma-separated values in one cell." },
    { title: "Normalization and integrity", minutes: 8, body: "Normalization reduces avoidable duplication and update anomalies.\n\n- **1NF:** each cell contains one value; rows are identifiable.\n- **2NF:** 1NF plus every non-key attribute depends on the whole candidate key.\n- **3NF:** 2NF plus non-key attributes do not depend transitively on a key.\n\nUse foreign keys and appropriate constraints to protect relationships. Normalize first; denormalize only when a measured workload justifies the trade-off." },
  ], [
    makeQuestion("sql-dbms-rf-q1", "Relational model", "What does a primary key do?", ["Uniquely identifies a row", "Sorts every query", "Encrypts a table", "Stores multiple values in one cell"], 0, "A primary key uniquely identifies each row and cannot be null."),
    makeQuestion("sql-dbms-rf-q2", "Relationships", "A foreign key is used to:", ["Reference a key in another or the same table", "Create a chart", "Replace every index", "Store a password"], 0, "Foreign keys enforce referential integrity between related records."),
    makeQuestion("sql-dbms-rf-q3", "Normalization", "Which normal form removes transitive dependencies of non-key attributes?", ["1NF", "2NF", "3NF", "0NF"], 2, "Third normal form removes transitive dependencies of non-key attributes."),
    makeQuestion("sql-dbms-rf-q4", "Atomicity", "A column stores multiple phone numbers as comma-separated text. What is the best relational design?", ["Store each phone as a related row", "Add more comma-separated values", "Use the phone list as the primary key", "Split the list differently for every query"], 0, "Related rows represent a one-to-many relationship and avoid repeating groups."),
    makeQuestion("sql-dbms-rf-q5", "Candidate keys", "What is a candidate key?", ["A minimal set of attributes that uniquely identifies a row", "Any column used in ORDER BY", "A foreign key with no target", "A non-unique display label"], 0, "A candidate key is a minimal superkey; one candidate key is selected as the primary key."),
    makeQuestion("sql-dbms-rf-q6", "Referential integrity", "What prevents an enrolment from referencing a student that does not exist?", ["A foreign key constraint", "An ORDER BY clause", "A view", "A transaction label"], 0, "A foreign key enforces that referenced rows exist, subject to its declared actions."),
    makeQuestion("sql-dbms-rf-q7", "Constraints", "Which constraint rejects a negative item quantity?", ["CHECK (quantity >= 0)", "ORDER BY quantity", "GROUP BY quantity", "INDEX quantity"], 0, "A CHECK constraint enforces a Boolean rule on each inserted or updated row."),
    makeQuestion("sql-dbms-rf-q8", "Keys", "A junction table must allow one enrolment per student and course. Which key fits?", ["A composite key of student_id and course_id", "The course title alone", "No key", "A key based on row order"], 0, "The composite key prevents the same student-course pair from appearing twice."),
  ]),
  makeChapter(sqlPath, "query-fundamentals", "SELECT, filtering and aggregation", "Retrieve the right rows, sort results and summarize groups.", [
    { title: "SELECT, WHERE and ORDER BY", minutes: 7, body: "A SELECT query describes the columns and rows you want to retrieve.\n\n```sql\nSELECT name, cgpa\nFROM students\nWHERE cgpa >= 8.0\nORDER BY cgpa DESC;\n```\n\nWHERE filters rows before grouping. ORDER BY sorts the final result. Select only the columns needed by the task; avoid SELECT * in stable application queries." },
    { title: "Aggregates, GROUP BY and HAVING", minutes: 8, body: "Aggregate functions summarize rows: COUNT, SUM, AVG, MIN and MAX.\n\n```sql\nSELECT branch, AVG(cgpa) AS average_cgpa\nFROM students\nGROUP BY branch\nHAVING AVG(cgpa) >= 7.5;\n```\n\nGROUP BY creates groups. HAVING filters groups after aggregation; WHERE filters individual rows before grouping. This distinction is a frequent interview question." },
  ], [
    makeQuestion("sql-dbms-qf-q1", "SQL", "Which clause filters individual rows before grouping?", ["HAVING", "WHERE", "ORDER BY", "LIMIT"], 1, "WHERE filters rows before GROUP BY."),
    makeQuestion("sql-dbms-qf-q2", "Aggregation", "Which clause filters grouped results?", ["WHERE", "HAVING", "FROM", "SELECT"], 1, "HAVING applies a condition to groups, often using aggregate expressions."),
    makeQuestion("sql-dbms-qf-q3", "Sorting", "How do you sort the highest values first?", ["ORDER BY value ASC", "ORDER BY value DESC", "GROUP BY value", "WHERE value"], 1, "DESC sorts in descending order."),
    makeQuestion("sql-dbms-qf-q4", "Projection", "Which SQL clause chooses the columns returned by a query?", ["SELECT", "WHERE", "HAVING", "COMMIT"], 0, "SELECT defines the output columns."),
    makeQuestion("sql-dbms-qf-q5", "NULL handling", "How should a query find rows where email is missing?", ["email IS NULL", "email = NULL", "email == NULL", "email EQUALS NULL"], 0, "SQL uses IS NULL because NULL is not compared with the equals operator."),
    makeQuestion("sql-dbms-qf-q6", "Common table expressions", "What does a WITH clause define for one SQL statement?", ["A named common table expression", "A permanent table", "A transaction commit", "A database index"], 0, "A CTE names an intermediate result for the duration of a statement."),
    makeQuestion("sql-dbms-qf-q7", "Subqueries", "Which predicate tests whether a subquery returns at least one row?", ["EXISTS", "ORDER BY", "DISTINCT", "LIMIT"], 0, "EXISTS is true when its subquery returns one or more rows."),
    makeQuestion("sql-dbms-qf-q8", "Window functions", "What does PARTITION BY do in a window function?", ["Restarts its calculation for each partition", "Removes duplicate rows", "Combines rows into one", "Filters rows before FROM"], 0, "PARTITION BY creates independent groups for the window calculation without collapsing rows."),
  ]),
  makeChapter(sqlPath, "joins-transactions", "Joins, indexes and transactions", "Combine related tables and understand safe, efficient database changes.", [
    { title: "Joins and subqueries", minutes: 8, body: "A JOIN combines rows using a relationship between tables.\n\n- INNER JOIN keeps matching rows from both sides.\n- LEFT JOIN keeps every left-side row and adds matching right-side data when present.\n- RIGHT JOIN mirrors LEFT JOIN.\n- FULL OUTER JOIN keeps matched and unmatched rows from both sides where supported.\n\nUse a subquery when a result from one query is needed by another. Check whether duplicates are possible before joining one-to-many relationships." },
    { title: "Indexes, transactions and ACID", minutes: 9, body: "An index can speed up lookups and joins, but it consumes storage and adds work to inserts, updates and deletes. Index columns used frequently in filters and joins, then verify with the query plan.\n\nA transaction groups operations into one logical unit. ACID means Atomicity, Consistency, Isolation and Durability. Use COMMIT when all related changes succeed and ROLLBACK when the unit must be undone.\n\n**Common mistake:** adding indexes to every column. Index design is a workload trade-off, not a decoration.\n\n**Isolation example:** two users try to reserve the final seat. The application must use a transaction and an appropriate constraint or locking strategy so both transactions cannot successfully claim the same seat." },
    { title: "Subqueries and common table expressions", minutes: 10, body: "A subquery is a query nested inside another query. Use EXISTS when the question is whether at least one related row exists; use IN when comparing against a set of values, while remembering that NULL can affect NOT IN.\n\nA common table expression (CTE) names an intermediate result for the duration of one statement. In PostgreSQL: \n\n```sql\nWITH department_averages AS (\n  SELECT department_id, AVG(score) AS avg_score\n  FROM assessments\n  GROUP BY department_id\n)\nSELECT department_id, avg_score\nFROM department_averages\nWHERE avg_score >= 75;\n```\n\nRead it in two stages: first calculate one average per department; then filter those grouped results. A CTE improves readability, but it is not automatically faster than an equivalent subquery." },
    { title: "Window functions and ranking", minutes: 11, body: "A window function calculates across related rows without collapsing them into one row per group. GROUP BY reduces each group to a summary row; a window function keeps each input row and adds a calculated value.\n\n```sql\nSELECT employee_id, department_id, salary,\n       DENSE_RANK() OVER (\n         PARTITION BY department_id\n         ORDER BY salary DESC\n       ) AS salary_rank\nFROM employees;\n```\n\nPARTITION BY restarts the ranking for each department. ORDER BY defines the order inside each partition. DENSE_RANK gives tied salaries the same rank and does not leave gaps; RANK does leave gaps after ties, while ROW_NUMBER assigns a unique sequence (even for ties, so add a stable tie-breaker if deterministic ordering matters).\n\n**Check your understanding:** this query returns every employee row, not just one row per department." },
  ], [
    makeQuestion("sql-dbms-jt-q1", "Joins", "Which join keeps every row from the left table?", ["INNER JOIN", "LEFT JOIN", "CROSS JOIN", "SELF JOIN"], 1, "LEFT JOIN preserves all left-side rows and fills unmatched right-side columns with NULL."),
    makeQuestion("sql-dbms-jt-q2", "Indexes", "What is a common cost of adding an index?", ["Slower writes and extra storage", "Automatic data encryption", "No query planner", "Loss of primary keys"], 0, "Indexes need storage and must be maintained during writes."),
    makeQuestion("sql-dbms-jt-q3", "Transactions", "Which ACID property means a committed change survives a crash?", ["Atomicity", "Consistency", "Isolation", "Durability"], 3, "Durability means committed changes persist."),
    makeQuestion("sql-dbms-jt-q4", "Subqueries", "Which predicate is designed to test whether a subquery returns at least one row?", ["EXISTS", "ORDER BY", "DISTINCT", "LIMIT"], 0, "EXISTS is true when its subquery returns one or more rows."),
    makeQuestion("sql-dbms-jt-q5", "NULL semantics", "Why can NOT IN produce an unexpected result when its subquery contains NULL?", ["The comparison can evaluate to UNKNOWN", "NULL is always converted to zero", "NOT IN removes duplicate rows", "The query becomes a transaction"], 0, "SQL uses three-valued logic; a comparison with NULL can be UNKNOWN. NOT EXISTS is often safer for anti-join logic."),
    makeQuestion("sql-dbms-jt-q6", "Window functions", "What does PARTITION BY do in a window function?", ["Restarts the window calculation for each partition", "Removes duplicate rows", "Combines all rows into one", "Filters rows before FROM"], 0, "PARTITION BY divides rows into independent groups for the window calculation without collapsing them."),
    makeQuestion("sql-dbms-jt-q7", "Ranking", "Which SQL function, DENSE_RANK, gives tied values the same rank and leaves no gaps?", ["DENSE_RANK", "ROW_NUMBER", "RANK", "COUNT"], 0, "DENSE_RANK assigns equal ranks to ties and the next distinct value receives the immediately following rank."),
    makeQuestion("sql-dbms-jt-q8", "Window aggregates", "Which expression calculates average salary per department while keeping every employee row?", ["AVG(salary) OVER (PARTITION BY department_id)", "AVG(salary) GROUP BY employee_id", "HAVING AVG(salary)", "ORDER BY AVG(salary)"], 0, "An aggregate used with OVER computes a window value while preserving each employee row."),
  ]),
]

const dsaPath = PROGRAMMING_PATHS.find((path) => path.id === "dsa")!

const DSA_CHAPTERS: Chapter[] = [
  makeChapter(dsaPath, "arrays-complexity", "Arrays and time complexity", "Understand indexed data, traversal patterns and the cost of common operations.", [
    { title: "Arrays, indexing and traversal", minutes: 9, body: "An array stores values in an ordered sequence. In a zero-based array of n elements, valid indexes run from 0 to n - 1. Reading an element by index is O(1); visiting every element is O(n).\n\n**Example:** To find the largest mark, initialise the current maximum with the first value, scan the rest once, and update it whenever a larger value appears.\n\n**Common mistake:** using index n as the final element. The last valid index is n - 1. Check empty input before reading the first element." },
    { title: "Big-O and choosing the right operation", minutes: 10, body: "Big-O describes how work grows as input size grows; it is not a stopwatch measurement. O(1) is constant work, O(log n) halves a search range, O(n) scans the input, O(n log n) is common for efficient comparison sorting, and O(n²) often appears in nested pair comparisons.\n\nWhen comparing algorithms, focus on the dominant growth term and state assumptions such as sorted input. Also consider auxiliary memory.\n\n**Interview habit:** explain expected time and space complexity before claiming one solution is better." },
  ], [
    makeQuestion("dsa-arrays-q1", "Arrays", "What is the last valid index in an array containing n elements with zero-based indexing?", ["n", "n - 1", "n + 1", "1"], 1, "An array of n elements has indexes from 0 through n - 1."),
    makeQuestion("dsa-arrays-q2", "Complexity", "What is the time complexity of reading an array element by its index?", ["O(n)", "O(log n)", "O(1)", "O(n²)"], 2, "Direct indexed access is constant time."),
    makeQuestion("dsa-arrays-q3", "Complexity", "A loop visits each of n elements once. What is its time complexity?", ["O(1)", "O(n)", "O(log n)", "O(n²)"], 1, "The work grows linearly with the number of elements."),
      makeQuestion("dsa-arrays-complexity-review-1", "Arrays", "In a zero-indexed array, what is the index of the first element?", ["0","1","-1","Depends on the array length"], 0, "Zero-based indexing starts at index 0.", "easy"),
      makeQuestion("dsa-arrays-complexity-review-2", "Arrays", "What is the time complexity of accessing an array element by a known index in a typical array?", ["O(1)","O(n)","O(log n)","O(n log n)"], 0, "Direct index arithmetic locates the element without scanning earlier entries.", "medium"),
      makeQuestion("dsa-arrays-complexity-review-3", "Arrays", "An array contains n elements. What is the time complexity of finding the maximum by scanning every element once?", ["O(n)","O(1)","O(log n)","O(n²)"], 0, "Each element must be inspected, so the scan takes linear time.", "medium"),
      makeQuestion("dsa-arrays-complexity-review-4", "Complexity", "What does O(n) describe?", ["An upper growth-rate bound proportional to input size","Exactly n seconds on every computer","A constant-time operation","The amount of source code"], 0, "Big-O describes asymptotic growth, not an exact runtime in seconds.", "easy"),
      makeQuestion("dsa-arrays-complexity-review-5", "Arrays", "Why can inserting at the beginning of a contiguous array take O(n) time?", ["Existing elements may need to shift right","The array must always be sorted","The first index is inaccessible","Every insertion requires sorting"], 0, "To make room at index 0, up to n existing elements may need to move.", "medium")
    ]),
  makeChapter(dsaPath, "strings-two-pointers", "Strings and two-pointer patterns", "Process character sequences and solve pair and window problems efficiently.", [
    { title: "String representation and safe traversal", minutes: 9, body: "A string is a sequence of characters. Common operations include reading a character, comparing strings, finding a substring and building a result. In many languages strings are immutable, so repeated concatenation can create avoidable allocations.\n\nBe clear about whether a task counts bytes, Unicode code points or user-perceived characters. Validate indexes and handle empty strings before accessing the first or last character.\n\n**Practice pattern:** scan once while maintaining a count or small piece of state." },
    { title: "Two pointers and sliding windows", minutes: 10, body: "Two pointers keep two positions in a sequence and move them according to a rule. For a sorted array, one pointer can start at each end to search for a target pair. A sliding window maintains a contiguous range and adjusts its boundaries as the range grows or shrinks.\n\n**Example:** In a sorted array, compare the left-plus-right sum with the target. If too small, move the left pointer right; if too large, move the right pointer left. Each pointer moves at most n times, so the scan is O(n).\n\n**Important assumption:** this pair-sum strategy relies on sorted order." },
  ], [
    makeQuestion("dsa-strings-q1", "Strings", "Before reading the final character of a string, what should a solution check?", ["That the string is not empty", "That the string is sorted", "That its length is even", "That it contains a digit"], 0, "An empty string has no final character, so guard the access."),
    makeQuestion("dsa-strings-q2", "Two pointers", "For a sorted array, what should you do when the current pair sum is smaller than the target?", ["Move the right pointer left", "Move the left pointer right", "Stop immediately", "Reverse the array"], 1, "Increasing the left value can increase the pair sum."),
    makeQuestion("dsa-strings-q3", "Sliding window", "What does a sliding window usually represent?", ["A contiguous range of elements", "A random set of indexes", "A tree traversal", "A database transaction"], 0, "A sliding window tracks a contiguous range while moving its boundaries."),
      makeQuestion("dsa-strings-two-pointers-review-1", "Strings", "In many programming languages, what does a string represent?", ["A sequence of characters or text units","A numeric matrix","A linked list of integers only","A Boolean value"], 0, "A string represents text; exact internal encoding and indexing rules vary by language.", "easy"),
      makeQuestion("dsa-strings-two-pointers-review-2", "Two Pointers", "In a sorted array, how can two pointers efficiently search for a pair with a target sum?", ["Move the left or right pointer based on whether the sum is too small or too large","Move both pointers randomly","Restart a full scan for every pair","Sort the array after every comparison"], 0, "Sorted order lets the algorithm discard one side after each comparison.", "medium"),
      makeQuestion("dsa-strings-two-pointers-review-3", "Strings", "What is the main purpose of a frequency map when comparing character counts?", ["Count occurrences of each character","Preserve original screen positions","Sort characters by font size","Encrypt the string"], 0, "A frequency map stores how often each character occurs.", "medium"),
      makeQuestion("dsa-strings-two-pointers-review-4", "Two Pointers", "A palindrome reads the same forward and backward. Which two-pointer check is appropriate?", ["Compare outer characters, then move inward","Compare only adjacent characters once","Sort the characters first","Reverse only the first half"], 0, "Start at both ends, compare, and move inward until the pointers meet or cross.", "medium"),
      makeQuestion("dsa-strings-two-pointers-review-5", "Strings", "Why should Unicode text processing be careful about assuming one character equals one byte?", ["Characters may use multiple bytes in an encoding","All characters always use exactly two bytes","Unicode contains only ASCII letters","Byte length always equals visual character count"], 0, "UTF-8 uses variable-length encodings, and some visible characters consist of multiple code points.", "medium")
    ]),
  makeChapter(dsaPath, "searching-sorting", "Searching and sorting", "Choose a search strategy and understand common sorting trade-offs.", [
    { title: "Linear search and binary search", minutes: 10, body: "Linear search checks values one by one and works on unsorted data; its worst-case time is O(n). Binary search repeatedly halves the search interval and takes O(log n), but it requires sorted data and efficient middle-element access.\n\nMaintain a clear interval invariant, calculate the midpoint safely, and ensure the interval shrinks on every iteration.\n\n**Common mistake:** applying binary search to unsorted input. Correctness depends on ordering, not just on the code structure." },
    { title: "Sorting and stability", minutes: 10, body: "Sorting arranges values by a comparison rule. Bubble, selection and insertion sort are useful for learning but generally take O(n²). Merge sort takes O(n log n) time and uses extra memory; quicksort is often fast in practice but can take O(n²) in the worst case.\n\nA stable sort preserves the original relative order of equal-key items. This matters when sorting records by multiple fields in stages. Use a language's standard library sort for normal application work." },
  ], [
    makeQuestion("dsa-search-sort-q1", "Searching", "Which condition is required for ordinary binary search on an array?", ["The array must be sorted", "The array must contain unique values", "The length must be even", "The values must be positive"], 0, "Binary search uses ordering to discard half of the remaining range."),
    makeQuestion("dsa-search-sort-q2", "Complexity", "What is the worst-case time complexity of binary search?", ["O(n)", "O(log n)", "O(n log n)", "O(1)"], 1, "The search interval is halved at each step."),
    makeQuestion("dsa-search-sort-q3", "Sorting", "What does a stable sorting algorithm guarantee?", ["Equal-key items keep their relative order", "The sort always uses O(1) space", "The output is descending", "Every input is sorted in O(n)"], 0, "Stability preserves the input order of items with equal sort keys."),
      makeQuestion("dsa-searching-sorting-review-1", "Binary Search", "What precondition is normally required for binary search on an array?", ["The array is sorted according to the searched order","The array contains no duplicates","The array length is a prime number","The array contains only positive values"], 0, "Binary search relies on sorted order to discard half the remaining range.", "easy"),
      makeQuestion("dsa-searching-sorting-review-2", "Binary Search", "What is the time complexity of binary search on n sorted elements?", ["O(log n)","O(n)","O(n²)","O(1)"], 0, "Each comparison halves the remaining search interval.", "medium"),
      makeQuestion("dsa-searching-sorting-review-3", "Sorting", "Which sorting algorithm repeatedly selects the smallest remaining element and places it next?", ["Selection sort","Merge sort","Heap sort","Counting sort"], 0, "Selection sort repeatedly selects the minimum from the unsorted suffix.", "easy"),
      makeQuestion("dsa-searching-sorting-review-4", "Sorting", "What is the typical worst-case time complexity of merge sort?", ["O(n log n)","O(n²)","O(log n)","O(n)"], 0, "Merge sort divides the input and merges sorted halves across logarithmic levels.", "medium"),
      makeQuestion("dsa-searching-sorting-review-5", "Searching", "When searching an unsorted array without extra indexing, what is the worst-case time complexity of linear search?", ["O(n)","O(log n)","O(1)","O(n log n)"], 0, "The target may be absent or last, requiring inspection of every element.", "medium")
    ]),
]


const ADVANCED_DSA_CHAPTERS: Chapter[] = [
  makeChapter(dsaPath, "hashing-frequency-maps", "Hashing, maps and frequency counting", "Use hash-based structures for lookup, counting, grouping and duplicate detection.", [
    { title: "Hash maps and sets", minutes: 12, body: "A hash map stores key-value pairs and a set stores unique keys. They are useful when a problem repeatedly asks whether a value has appeared, how many times it appears, or which record belongs to an identifier.\n\n**Example:** Count values in one pass: for each value x, increase count[x]. The expected time is O(n) for n inputs with a well-behaved hash table, using O(k) extra space for k distinct values.\n\n**Trade-off:** Hashing uses extra memory and does not automatically preserve sorted order. Collisions are handled internally; worst-case behaviour can be worse than average." },
    { title: "Frequency maps and grouping patterns", minutes: 14, body: "Frequency maps solve anagram checks, duplicate detection, majority-frequency questions and grouping records by a key. First define what the key represents, then update the count or append the record.\n\n**Worked approach — anagram:** reject unequal lengths, count each character from the first string, subtract counts for the second, and confirm every count is zero. Consider case, spaces and Unicode rules as part of the problem statement.\n\n**Practice:** find the first repeated value, most frequent word and two values whose sum equals a target. Explain the time and space complexity." },
  ], [
    makeQuestion("dsa-hash-q1", "Hashing", "Which structure is a natural choice for counting the frequency of each word?", ["Map/dictionary", "Stack", "Queue", "Single Boolean"], 0, "A map associates each word with its running count."),
    makeQuestion("dsa-hash-q2", "Sets", "What is a primary property of a set?", ["It stores unique values", "It always sorts values", "It stores only key-value pairs", "It follows LIFO"], 0, "A set represents membership without duplicate elements."),
    makeQuestion("dsa-hash-q3", "Complexity", "What is the expected lookup time of a well-behaved hash map?", ["O(1)", "O(n²)", "O(n log n)", "O(2ⁿ)"], 0, "Hash maps offer expected constant-time lookup, subject to hashing assumptions."),
      makeQuestion("dsa-hashing-frequency-maps-review-1", "Hashing", "What does a hash function do in a hash table?", ["Maps a key to a hash value used to locate a bucket","Sorts every key alphabetically","Encrypts the stored value reversibly","Guarantees keys never collide"], 0, "A hash function maps keys to hash values; different keys can still collide.", "easy"),
      makeQuestion("dsa-hashing-frequency-maps-review-2", "Hash Tables", "What is a collision in a hash table?", ["Two different keys map to the same bucket or slot","A key is deleted twice","A table becomes sorted","A value is larger than its key"], 0, "A collision occurs when distinct keys map to the same location; collision handling is required.", "medium"),
      makeQuestion("dsa-hashing-frequency-maps-review-3", "Frequency Maps", "Which structure is commonly used to count how many times each word appears?", ["A map from word to count","A stack of sorted files","A queue of screen coordinates","A single Boolean variable"], 0, "A frequency map stores each word as a key and its occurrence count as the value.", "easy"),
      makeQuestion("dsa-hashing-frequency-maps-review-4", "Hashing", "What is the expected lookup time in a well-sized hash table with a good hash function?", ["O(1) average","O(n²) average","O(log n) always","O(n log n) always"], 0, "Expected lookup is constant time under suitable load and hash-distribution assumptions; worst case can be linear.", "medium"),
      makeQuestion("dsa-hashing-frequency-maps-review-5", "Hashing", "Why should a hash table resize when its load factor becomes too high?", ["To reduce collisions and preserve expected performance","To guarantee keys become sorted","To remove all values","To make every hash value unique"], 0, "A high load factor can increase collisions; resizing redistributes entries across more buckets.", "medium")
    ]),
  makeChapter(dsaPath, "recursion-backtracking", "Recursion and backtracking", "Break a problem into smaller states and explore choices without losing correctness.", [
    { title: "Recursive thinking and call stack", minutes: 13, body: "A recursive function solves a smaller version of the same problem. Every correct recursive design needs a base case, a recursive step and progress toward the base case.\n\nTrace the call stack for factorial, sum of an array and binary search. Record each call's arguments and returned value. Understand that each call uses stack space; deep recursion can exceed the runtime's stack limit.\n\n**Design check:** can you state why the input gets smaller and why the base case is eventually reached?" },
    { title: "Backtracking: choose, explore, undo", minutes: 16, body: "Backtracking explores a decision tree. At each step, choose a candidate, check whether it is allowed, recurse, then undo the choice before exploring another branch.\n\n**Example:** generate all subsets of a small set. At each index, either include the current item or skip it. The recursion ends after all positions have been decided. The number of subsets is 2ⁿ, so explain why the output itself can be exponential.\n\n**Practice:** generate permutations of distinct values, solve a small maze and find combinations that sum to a target. Prune a branch as soon as its constraints cannot be satisfied." },
  ], [
    makeQuestion("dsa-recursion-q1", "Recursion", "What must every terminating recursive solution include?", ["A base case and progress toward it", "A global variable only", "Two nested loops", "A database connection"], 0, "The base case stops recursion; each recursive step must move toward it."),
    makeQuestion("dsa-recursion-q2", "Backtracking", "What should a backtracking algorithm do after exploring one choice?", ["Undo that choice before exploring the next", "Keep every choice permanently", "Restart the whole program", "Sort the input automatically"], 0, "Undoing restores the previous state so sibling choices are explored correctly."),
    makeQuestion("dsa-recursion-q3", "Complexity", "How many subsets does a set of n distinct elements have?", ["2ⁿ", "n²", "n log n", "n"], 0, "Each element has two independent choices: include or exclude."),
      makeQuestion("dsa-recursion-backtracking-review-1", "Recursion", "What is a base case in a recursive function?", ["A condition that stops further recursive calls","The first variable declared","A loop that never ends","A function's return type only"], 0, "A base case terminates recursion for a sufficiently small or solved input.", "easy"),
      makeQuestion("dsa-recursion-backtracking-review-2", "Recursion", "If each recursive call reduces n by 1 until n = 0, how many calls are made for input n, including the base call?", ["n + 1","n","2n","log₂ n"], 0, "Calls occur for n, n−1, ..., 1 and 0: n + 1 calls.", "medium"),
      makeQuestion("dsa-recursion-backtracking-review-3", "Backtracking", "What is the central idea of backtracking?", ["Build a candidate, and undo a choice when it cannot lead to a valid solution","Always choose the largest number","Sort the input repeatedly","Store only the final answer without exploring"], 0, "Backtracking explores choices and reverses a choice when a partial path fails.", "easy"),
      makeQuestion("dsa-recursion-backtracking-review-4", "Backtracking", "In a maze search, when should a recursive path mark a cell as visited?", ["When entering the cell, then undo the mark when backtracking if paths may reuse it in other branches","Only after reaching the destination","Never","Only when the cell is on the boundary"], 0, "Marking prevents cycles on the current path; unmarking may be needed when exploring independent paths.", "medium"),
      makeQuestion("dsa-recursion-backtracking-review-5", "Recursion", "What risk can deep recursion create in languages with a limited call stack?", ["Stack overflow","Automatic sorting","A database deadlock","A guaranteed memory leak"], 0, "Each active call uses stack space; excessive depth can exceed the runtime's stack limit.", "medium")
    ]),
  makeChapter(dsaPath, "linked-lists", "Linked lists and pointer/reference reasoning", "Understand node-based sequences, pointer updates and common edge cases.", [
    { title: "Nodes, head pointers and traversal", minutes: 13, body: "A linked list stores values in nodes. Each node refers to the next node; the head identifies the first node. Unlike arrays, nodes do not need to occupy contiguous memory, but accessing the k-th item requires traversal from the head.\n\nLearn singly linked lists first, then doubly linked lists. Understand insertion at the head, insertion after a node, deletion and traversal. Keep track of the empty list, one-node list and deleting the head.\n\n**Complexity:** access/search is O(n); insertion after a known node can be O(1), assuming the reference is already available." },
    { title: "Reverse, detect cycles and merge lists", minutes: 15, body: "Reversing a singly linked list requires three references: previous, current and next. Save next before changing current.next, then advance all three references. Losing the next reference can disconnect the remainder of the list.\n\nFloyd's slow/fast pointer technique detects a cycle in O(n) time and O(1) extra space. Merging two sorted linked lists uses a moving tail pointer and preserves sorted order.\n\n**Practice:** reverse a list, find its middle node, detect a cycle and merge two sorted lists. Dry-run each pointer update." },
  ], [
    makeQuestion("dsa-linked-q1", "Linked Lists", "What does the head reference identify?", ["The first node", "The last array index", "The middle node always", "The list length"], 0, "The head points to the first node, or null for an empty list."),
    makeQuestion("dsa-linked-q2", "Complexity", "What is the time complexity of finding the k-th node in a singly linked list from its head?", ["O(n)", "O(1)", "O(log n)", "O(n²)"], 0, "A singly linked list must be traversed node by node."),
    makeQuestion("dsa-linked-q3", "Pointers", "When reversing a linked list, why save the next node before changing the current node's link?", ["To avoid losing access to the rest of the list", "To sort the nodes", "To allocate a new array", "To detect duplicates"], 0, "Saving next preserves the path to the unprocessed nodes."),
      makeQuestion("dsa-linked-lists-review-1", "Linked Lists", "What does a node in a singly linked list normally store?", ["A value and a reference to the next node","Only an array index","A value and two child trees","A sorted copy of the whole list"], 0, "A singly linked-list node stores data and a link to the next node.", "easy"),
      makeQuestion("dsa-linked-lists-review-2", "Linked Lists", "If a pointer to a node is already available, what is the time complexity of inserting a new node immediately after it?", ["O(1)","O(n)","O(log n)","O(n log n)"], 0, "Only a constant number of links need updating when the target node is already known.", "medium"),
      makeQuestion("dsa-linked-lists-review-3", "Linked Lists", "What marks the end of a typical singly linked list?", ["A null next reference","A node that points to itself","A negative array index","A sorted value"], 0, "The final node's next reference is null (or the language's equivalent).", "easy"),
      makeQuestion("dsa-linked-lists-review-4", "Linked Lists", "Why is accessing the k-th element of a singly linked list generally O(n)?", ["The list must be traversed from a known node","Nodes are always stored in sorted order","Each node stores every other node's address","The list cannot contain more than one node"], 0, "A singly linked list has no direct index lookup; traversal follows links one by one.", "medium"),
      makeQuestion("dsa-linked-lists-review-5", "Linked Lists", "What is the key safety concern when deleting a node in a manually managed linked list?", ["Update links and release owned memory exactly once","Sort the remaining values","Change every node's value to zero","Always delete the head first"], 0, "Correct link updates preserve the list, and owned memory must not leak or be freed twice.", "medium")
    ]),
  makeChapter(dsaPath, "stacks-queues", "Stacks, queues and monotonic structures", "Use the correct order of processing for parsing, scheduling and range problems.", [
    { title: "Stack and queue operations", minutes: 12, body: "A stack is last-in, first-out (LIFO); a queue is first-in, first-out (FIFO). Learn push/pop/peek for stacks and enqueue/dequeue/front for queues. Know the empty-structure cases and the cost of each operation in the chosen implementation.\n\nStacks support balanced-parentheses checking, undo operations and depth-first traversal. Queues support breadth-first traversal and fair first-come-first-served processing.\n\n**Practice:** validate brackets, reverse a sequence using a stack and simulate a printer queue." },
    { title: "Monotonic stack and deque patterns", minutes: 15, body: "A monotonic stack keeps values in increasing or decreasing order. It helps solve next-greater-element, stock-span and histogram problems by removing elements that can no longer be useful.\n\nA deque supports insertion and removal at both ends. It can maintain a sliding-window maximum in O(n) total time because each index enters and leaves the deque at most once.\n\n**Practice:** next greater element, daily temperatures and maximum of every window of size k. Explain why each item is pushed and popped at most once." },
  ], [
    makeQuestion("dsa-stack-q1", "Stacks", "Which order does a stack follow?", ["FIFO", "LIFO", "Random", "Sorted"], 1, "A stack removes the most recently added item first."),
    makeQuestion("dsa-stack-q2", "Queues", "Which structure is commonly used for breadth-first search?", ["Stack", "Queue", "Heap", "Set only"], 1, "A queue processes discovered nodes in first-in-first-out order."),
    makeQuestion("dsa-stack-q3", "Monotonic stack", "What is the main purpose of a monotonic stack?", ["Maintain an ordered candidate set for next/previous greater or smaller queries", "Store every value in sorted order permanently", "Replace all recursion", "Perform binary search on a graph"], 0, "It removes candidates that cannot be answers for future positions."),
      makeQuestion("dsa-stacks-queues-review-1", "Stacks", "Which principle does a stack follow?", ["Last in, first out","First in, first out","Random access only","Smallest in, first out"], 0, "A stack removes the most recently added item first.", "easy"),
      makeQuestion("dsa-stacks-queues-review-2", "Queues", "Which principle does a standard queue follow?", ["First in, first out","Last in, first out","Largest in, first out","Sorted by priority only"], 0, "A queue removes items in arrival order.", "easy"),
      makeQuestion("dsa-stacks-queues-review-3", "Stacks", "Which data structure is a natural fit for checking balanced parentheses?", ["Stack","Queue","Heap","Hash set only"], 0, "Opening brackets are pushed; matching closing brackets pop the most recent opening bracket.", "medium"),
      makeQuestion("dsa-stacks-queues-review-4", "Queues", "What is a common use of a queue in graph algorithms?", ["Breadth-first search","Depth-first search recursion","Binary search","Heap sort"], 0, "BFS processes vertices in increasing distance layers using a FIFO queue.", "medium"),
      makeQuestion("dsa-stacks-queues-review-5", "Monotonic Stack", "A monotonic decreasing stack is useful for which common task?", ["Finding the next greater element efficiently","Sorting strings alphabetically","Computing a matrix determinant","Detecting a SQL transaction"], 0, "Maintaining a decreasing stack allows smaller elements to be popped when a greater element arrives.", "medium")
    ]),
  makeChapter(dsaPath, "trees-bst-traversal", "Trees, traversals and binary search trees", "Represent hierarchical data and reason about recursive and iterative traversals.", [
    { title: "Tree terminology and traversals", minutes: 14, body: "A tree is a hierarchical structure of nodes connected by edges. Learn root, parent, child, leaf, depth and height. A binary tree has at most two children per node.\n\nPreorder visits node-left-right, inorder visits left-node-right, and postorder visits left-right-node. Level-order traversal uses a queue. Recursive traversal is concise; iterative traversal makes the stack explicit.\n\n**Practice:** write all four traversals for a small tree and verify the exact output by hand." },
    { title: "Binary search trees and balanced trees", minutes: 15, body: "A binary search tree stores smaller keys in the left subtree and larger keys in the right subtree (duplicate handling must be defined). Search, insertion and deletion follow this ordering.\n\nA balanced tree keeps height near O(log n), supporting efficient operations. An unbalanced tree can degrade to O(n), for example when values are inserted in already sorted order. Understand the purpose of AVL and red-black balancing without memorising rotations before the invariant is clear.\n\n**Practice:** search for a key, find minimum/maximum, validate a BST and explain the worst-case shape." },
  ], [
    makeQuestion("dsa-tree-q1", "Trees", "Which traversal visits the left subtree, then the node, then the right subtree?", ["Preorder", "Inorder", "Postorder", "Level order"], 1, "Inorder traversal follows left-node-right."),
    makeQuestion("dsa-tree-q2", "BST", "What is the key ordering rule in a binary search tree?", ["Left keys are smaller and right keys are larger, subject to duplicate policy", "Every node has exactly two children", "The root is always the minimum", "All leaves are at the same depth"], 0, "The ordering invariant guides search and update operations."),
    makeQuestion("dsa-tree-q3", "Complexity", "What can happen to search time in a highly unbalanced BST?", ["It can degrade to O(n)", "It is always O(1)", "It becomes O(2ⁿ)", "It cannot search"], 0, "A chain-shaped BST has linear height."),
      makeQuestion("dsa-trees-bst-traversal-review-1", "Trees", "In a tree, what is the root?", ["The distinguished starting node with no parent","The node with the largest value","Every leaf node","The last node visited"], 0, "The root is the top-level node; it has no parent in a rooted tree.", "easy"),
      makeQuestion("dsa-trees-bst-traversal-review-2", "Binary Search Tree", "For a binary search tree with distinct keys, where are keys smaller than a node typically stored?", ["In its left subtree","In its right subtree","Only in leaf nodes","In a separate queue"], 0, "The BST ordering property places smaller keys in the left subtree and larger keys in the right.", "medium"),
      makeQuestion("dsa-trees-bst-traversal-review-3", "Tree Traversal", "Which traversal visits a node before its left and right subtrees?", ["Preorder","Inorder","Postorder","Level-order only"], 0, "Preorder visits root, then left subtree, then right subtree.", "easy"),
      makeQuestion("dsa-trees-bst-traversal-review-4", "Tree Traversal", "What is the inorder traversal of a valid BST with distinct keys guaranteed to produce?", ["Keys in sorted order","Keys in reverse insertion order","Only leaf keys","A breadth-first order"], 0, "Inorder visits left, node, right; the BST property makes the output sorted.", "medium"),
      makeQuestion("dsa-trees-bst-traversal-review-5", "Trees", "In a tree with n nodes, how many edges are there?", ["n − 1","n","2n","n + 1"], 0, "Every tree is connected and acyclic, so it has exactly n − 1 edges.", "medium")
    ]),
  makeChapter(dsaPath, "heaps-priority-queues", "Heaps and priority queues", "Retrieve the highest- or lowest-priority item efficiently.", [
    { title: "Heap property and array representation", minutes: 13, body: "A binary heap is a complete binary tree with a heap-order property. In a min-heap, each parent is no greater than its children; in a max-heap, each parent is no smaller.\n\nHeaps are commonly stored in arrays. For zero-based indexing, parent(i) = floor((i-1)/2), left(i) = 2i+1 and right(i) = 2i+2. Insert and remove-top operations take O(log n); reading the top takes O(1).\n\n**Practice:** draw the heap after each insertion and removal. Do not confuse a heap with a fully sorted array." },
    { title: "Priority queues and top-k problems", minutes: 14, body: "A priority queue repeatedly returns the item with the best priority. It is useful in scheduling, Dijkstra's algorithm and top-k problems.\n\nTo find the k largest values, maintain a min-heap of size k. For each new value, insert until full; then replace the minimum only when the new value is larger. This uses O(k) extra space and O(n log k) time.\n\n**Practice:** merge sorted lists, find the k-th largest element and simulate a task scheduler." },
  ], [
    makeQuestion("dsa-heap-q1", "Heap", "What does a min-heap guarantee at its root?", ["The minimum element", "The maximum element", "The median", "The last inserted element"], 0, "The min-heap property places a smallest value at the root."),
    makeQuestion("dsa-heap-q2", "Complexity", "What is the typical time complexity of inserting into a binary heap?", ["O(log n)", "O(1) always", "O(n²)", "O(2ⁿ)"], 0, "The inserted element may move along the heap height."),
    makeQuestion("dsa-heap-q3", "Application", "Which structure is a natural choice for repeatedly retrieving the next highest-priority task?", ["Priority queue", "Unsorted linked list only", "Stack", "Trie"], 0, "A priority queue returns the item with the best priority."),
      makeQuestion("dsa-heaps-priority-queues-review-1", "Heaps", "In a max-heap, what is true about the root?", ["It contains a maximum element","It contains the minimum element","It is always the last inserted element","It is always a leaf"], 0, "The max-heap property ensures each parent is at least as large as its children, so the root is maximum.", "easy"),
      makeQuestion("dsa-heaps-priority-queues-review-2", "Heaps", "What is the time complexity of inserting an item into a binary heap?", ["O(log n)","O(1) worst case","O(n²)","O(n log n)"], 0, "The inserted item may move up the heap height, which is logarithmic.", "medium"),
      makeQuestion("dsa-heaps-priority-queues-review-3", "Priority Queues", "What does a priority queue remove first?", ["The element with highest or lowest priority, depending on its definition","Always the oldest element","Always the newest element","A random element"], 0, "A priority queue returns the element with the best priority according to its ordering.", "easy"),
      makeQuestion("dsa-heaps-priority-queues-review-4", "Heaps", "What is the time complexity of reading the maximum element from a max-heap?", ["O(1)","O(log n)","O(n)","O(n log n)"], 0, "The maximum is stored at the root, so it can be read directly.", "medium"),
      makeQuestion("dsa-heaps-priority-queues-review-5", "Heaps", "What is the time complexity of building a binary heap from an array using bottom-up heapify?", ["O(n)","O(n log n)","O(log n)","O(n²)"], 0, "Bottom-up heap construction is linear because most nodes are near the leaves and move only a short distance.", "medium")
    ]),
  makeChapter(dsaPath, "graphs-bfs-dfs", "Graphs, BFS and DFS", "Model networks and explore reachable nodes without revisiting them.", [
    { title: "Graph representations and traversal", minutes: 14, body: "A graph contains vertices and edges. It may be directed or undirected, weighted or unweighted. An adjacency list stores each vertex's neighbours and is usually space-efficient for sparse graphs; an adjacency matrix uses O(V²) space and makes edge lookup direct.\n\nBFS uses a queue and explores by distance in an unweighted graph. DFS uses recursion or an explicit stack to explore deeply before backtracking. Track visited vertices to avoid infinite loops on cycles.\n\n**Practice:** count connected components, find reachability and compute shortest unweighted distance using BFS." },
    { title: "Cycle detection, topological order and shortest paths", minutes: 16, body: "Cycle detection depends on graph type. For an undirected graph, distinguish the parent edge from a back edge; for directed graphs, use recursion-stack state or a colour-based DFS.\n\nA topological ordering exists only for a directed acyclic graph (DAG). Kahn's algorithm repeatedly removes zero-indegree vertices. For weighted shortest paths, Dijkstra's algorithm requires non-negative edge weights; negative edges need a different approach such as Bellman-Ford.\n\n**Practice:** detect a cycle, order course prerequisites and explain why Dijkstra is unsafe with negative weights." },
  ], [
    makeQuestion("dsa-graph-q1", "BFS", "Which data structure does BFS use to process the frontier?", ["Queue", "Stack only", "Heap only", "Binary search tree"], 0, "BFS processes nodes in discovery order using a queue."),
    makeQuestion("dsa-graph-q2", "DFS", "What is a common way to implement DFS?", ["Recursion or an explicit stack", "Only a priority queue", "Only a sorted array", "A SQL join"], 0, "DFS explores deeply using call-stack or explicit-stack state."),
    makeQuestion("dsa-graph-q3", "Shortest paths", "What is a key precondition for standard Dijkstra's algorithm?", ["All edge weights are non-negative", "The graph must be a tree", "Every vertex has degree two", "The graph must be directed"], 0, "Negative edge weights can invalidate Dijkstra's greedy finalisation."),
      makeQuestion("dsa-graphs-bfs-dfs-review-1", "Graphs", "What does an edge represent in a graph?", ["A connection between vertices","A vertex's stored value only","A queue position","A sorting pass"], 0, "An edge represents a relationship or connection between vertices.", "easy"),
      makeQuestion("dsa-graphs-bfs-dfs-review-2", "BFS", "Which data structure is normally used to implement breadth-first search?", ["Queue","Stack","Max-heap","Binary search tree"], 0, "BFS explores vertices in layers using a FIFO queue.", "easy"),
      makeQuestion("dsa-graphs-bfs-dfs-review-3", "DFS", "Which data structure is commonly used to implement iterative depth-first search?", ["Stack","Queue","Min-heap","Hash table only"], 0, "A stack reproduces the last-in, first-out exploration order of DFS.", "easy"),
      makeQuestion("dsa-graphs-bfs-dfs-review-4", "Graphs", "For an unweighted graph, which algorithm finds shortest paths in number of edges from a source?", ["Breadth-first search","Depth-first search","Selection sort","Binary search"], 0, "BFS explores by distance layers, so first discovery gives a shortest edge-count path.", "medium"),
      makeQuestion("dsa-graphs-bfs-dfs-review-5", "Graphs", "If an undirected graph is stored with adjacency lists, what is the space complexity in terms of vertices V and edges E?", ["O(V + E)","O(V²) always","O(E²)","O(log V)"], 0, "Adjacency lists store a list per vertex and entries for edges, giving O(V + E) space.", "medium")
    ]),
  makeChapter(dsaPath, "greedy-algorithms", "Greedy algorithms and proof intuition", "Make locally optimal choices only when you can justify that they lead to a global optimum.", [
    { title: "Greedy choice and exchange arguments", minutes: 14, body: "A greedy algorithm chooses what appears best at the current step. This is not automatically correct. You need a property showing that some optimal solution can be transformed to include the greedy choice without becoming worse.\n\nAn exchange argument swaps a choice in an optimal solution with the greedy choice and shows that feasibility and value are preserved. Recognise when sorting by earliest finish time or smallest cost is justified by the problem's structure.\n\n**Practice:** interval scheduling and selecting non-overlapping activities. Explain why earliest finish time is a safe choice." },
    { title: "Greedy versus dynamic programming", minutes: 14, body: "Greedy commits to one local choice and does not reconsider it. Dynamic programming compares or combines multiple states because a locally attractive choice may block a better global result.\n\nFor coin change, a greedy strategy works for some denomination systems but fails for others. Test a counterexample before assuming the greedy rule is valid.\n\n**Practice:** compare greedy and DP on a coin system where greedy does not produce the minimum number of coins. State the condition that makes the greedy method valid, if one exists." },
  ], [
    makeQuestion("dsa-greedy-q1", "Greedy", "Why is a greedy choice not automatically correct?", ["A local optimum may not lead to a global optimum", "Greedy algorithms cannot sort", "They always use recursion", "They never terminate"], 0, "A correctness argument is needed to justify each irreversible choice."),
    makeQuestion("dsa-greedy-q2", "Proof", "What does an exchange argument try to show?", ["A solution using the greedy choice can be made no worse than an optimal solution", "Every input has one unique answer", "The algorithm uses constant memory", "Sorting is always unnecessary"], 0, "An exchange argument transforms an optimal solution while preserving feasibility and value."),
    makeQuestion("dsa-greedy-q3", "Method choice", "What should you do before applying a familiar greedy rule to a new problem?", ["Test assumptions and look for a correctness argument or counterexample", "Assume it works because it worked once", "Remove all constraints", "Use it only for sorted arrays"], 0, "Greedy correctness depends on problem structure."),
      makeQuestion("dsa-greedy-algorithms-review-1", "Greedy Algorithms", "What is a greedy algorithm's defining behaviour?", ["It makes a locally best choice at each step","It explores every possible solution","It always uses a dynamic programming table","It randomly selects a valid option"], 0, "Greedy algorithms commit to a locally preferred choice at each step.", "easy"),
      makeQuestion("dsa-greedy-algorithms-review-2", "Greedy Proof", "What does an exchange argument establish?", ["Replacing part of an optimal solution with the greedy choice does not worsen it","Every greedy algorithm runs in O(1)","All inputs have the same answer","The input must be a graph"], 0, "An exchange argument shows a greedy choice can be included in an optimal solution without loss.", "medium"),
      makeQuestion("dsa-greedy-algorithms-review-3", "Activity Selection", "For maximum-count non-overlapping intervals, why choose the compatible interval with earliest finish time?", ["It leaves the largest remaining time window for later intervals","It always has the shortest duration","It has the earliest start time","It avoids sorting"], 0, "Finishing earliest leaves maximal room for future compatible activities.", "medium"),
      makeQuestion("dsa-greedy-algorithms-review-4", "Greedy", "Which statement about greedy algorithms is correct?", ["A greedy rule needs a correctness argument for the problem","A greedy choice is optimal for every problem","Greedy algorithms cannot be used on arrays","Greedy algorithms always have quadratic time"], 0, "Local optimality does not automatically imply global optimality.", "medium"),
      makeQuestion("dsa-greedy-algorithms-review-5", "Coin Change", "Why can taking the largest coin first fail to produce the fewest coins for an arbitrary denomination system?", ["The denomination system may not have the greedy-choice property","The largest coin is never usable","Coins cannot be combined","Greedy algorithms require sorted strings"], 0, "Some coin systems have counterexamples where a smaller initial coin leads to a better total.", "medium")
    ]),
  makeChapter(dsaPath, "dynamic-programming", "Dynamic programming and state design", "Solve overlapping subproblems by defining states, transitions and base cases.", [
    { title: "Recognise overlapping subproblems", minutes: 16, body: "Dynamic programming applies when a problem has overlapping subproblems and optimal substructure. Define a state that captures exactly the information needed to solve the remaining problem.\n\nStart with a recurrence, identify base cases and decide what each state means in plain language. Memoization stores results from recursive calls; tabulation fills a table in an order that ensures dependencies are already known.\n\n**Example:** Fibonacci has repeated subproblems. A naive recursive solution repeats work exponentially; memoization computes each state once." },
    { title: "Build transitions and optimise space", minutes: 18, body: "A DP solution needs four pieces: state definition, transition, base cases and evaluation order. For 0/1 knapsack, dp[i][w] can represent the best value using the first i items within capacity w.\n\nAfter correctness is clear, look for rolling-array or one-dimensional optimisations. Be careful with iteration direction: 0/1 knapsack usually iterates capacity downward to avoid reusing an item; unbounded knapsack often iterates upward.\n\n**Practice ladder:** climbing stairs, house robber, coin change, longest common subsequence and 0/1 knapsack. Explain the state before writing the code." },
  ], [
    makeQuestion("dsa-dp-q1", "Dynamic Programming", "Which pair of properties commonly motivates dynamic programming?", ["Overlapping subproblems and optimal substructure", "Sorted input and unique values", "A tree and a queue", "Only negative numbers"], 0, "DP reuses solutions to overlapping subproblems and builds an optimal result from subproblem results."),
    makeQuestion("dsa-dp-q2", "Memoization", "What does memoization do?", ["Stores computed subproblem results for reuse", "Sorts every input first", "Removes all base cases", "Converts recursion to a graph"], 0, "Memoization prevents repeated evaluation of the same state."),
    makeQuestion("dsa-dp-q3", "State design", "What should a DP state represent?", ["The minimum information needed to describe a subproblem", "Every variable in the whole program", "Only the final answer", "The number of source files"], 0, "A precise state definition makes the recurrence and dependencies clear."),
      makeQuestion("dsa-dynamic-programming-review-1", "Dynamic Programming", "What is memoization?", ["Caching results of solved subproblems","Sorting all inputs before recursion","Removing every base case","Using a queue for all operations"], 0, "Memoization stores computed results so repeated subproblems are not solved again.", "easy"),
      makeQuestion("dsa-dynamic-programming-review-2", "Dynamic Programming", "Which four elements should a DP solution define clearly?", ["State, transition, base cases and evaluation order","Class, object, interface and package","Queue, stack, heap and graph","Input, output, colour and font"], 0, "A DP recurrence needs a precise state, transition, base cases and a valid computation order.", "medium"),
      makeQuestion("dsa-dynamic-programming-review-3", "Dynamic Programming", "Naive recursive Fibonacci repeats many subproblems. What is the typical time complexity of a memoized implementation?", ["O(n)","O(2ⁿ)","O(n²)","O(log n)"], 0, "Each Fibonacci state from 0 to n is computed once, giving linear time.", "medium"),
      makeQuestion("dsa-dynamic-programming-review-4", "Dynamic Programming", "In 0/1 knapsack, why is the item dimension commonly included in the DP state?", ["To represent which prefix of items may be considered","To store the screen coordinate","To sort item names","To guarantee all weights are equal"], 0, "The item index distinguishes which items are available for each capacity state.", "medium"),
      makeQuestion("dsa-dynamic-programming-review-5", "Dynamic Programming", "When can a one-dimensional DP array often replace a two-dimensional table?", ["When the recurrence needs only a limited previous row or state and update order preserves dependencies","Whenever the problem contains numbers","Whenever recursion is used","When all input values are unique"], 0, "Space can be compressed when older states are no longer needed, but iteration order must preserve required previous values.", "medium")
    ]),
  makeChapter(dsaPath, "bit-manipulation", "Bit manipulation and integer representation", "Use binary representation and bitwise operations to solve compact state and arithmetic problems.", [
    { title: "Binary numbers and bitwise operators", minutes: 13, body: "Computers represent integers using binary digits. Learn bitwise AND, OR, XOR, NOT, left shift and right shift. A bit mask selects or updates particular positions.\n\nFor a non-negative integer x, x & 1 checks the least significant bit: 1 means odd, 0 means even. To test whether bit k is set, use x & (1 << k). XOR has the useful properties a ^ a = 0 and a ^ 0 = a.\n\n**Practice:** test parity, set/clear/toggle a bit and count set bits." },
    { title: "Bit masks and common patterns", minutes: 14, body: "A bit mask can represent a small set of Boolean flags compactly. OR turns a flag on, AND with a complemented mask turns it off, and XOR toggles it. Be mindful of integer width and signed-shift rules in the chosen language.\n\n**Patterns:** check a power of two with x > 0 and (x & (x - 1)) == 0; isolate the lowest set bit with x & -x in two's-complement integer models; use XOR to find a unique element when every other element appears exactly twice.\n\n**Practice:** explain every bit operation in binary before simplifying it." },
  ], [
    makeQuestion("dsa-bit-q1", "Bitwise AND", "What is the result of 1 AND 1 at the bit level?", ["1", "0", "10", "Undefined"], 0, "AND returns 1 only when both input bits are 1."),
    makeQuestion("dsa-bit-q2", "XOR", "What is x XOR x?", ["0", "x", "1", "-x"], 0, "A bit XOR itself is zero."),
    makeQuestion("dsa-bit-q3", "Power of two", "For a positive integer x, which expression checks whether x is a power of two in a two's-complement model?", ["(x & (x - 1)) == 0", "x % 3 == 0", "x + 1 == 0", "x | 1 == 0"], 0, "A power of two has exactly one set bit; subtracting one clears it in the AND expression."),
      makeQuestion("dsa-bit-manipulation-review-1", "Bit Manipulation", "What is the result of 1 << 3 for a typical fixed-width integer operation?", ["8","3","6","1"], 0, "Left-shifting binary 0001 by three positions gives 1000₂, which is 8.", "easy"),
      makeQuestion("dsa-bit-manipulation-review-2", "Bit Manipulation", "What does bitwise AND return for a bit position?", ["1 only when both corresponding bits are 1","1 when either bit is 1","The larger operand","The sum of both bits"], 0, "AND outputs 1 only for the pair 1 AND 1.", "easy"),
      makeQuestion("dsa-bit-manipulation-review-3", "Bit Manipulation", "Which expression checks whether the least significant bit of n is set?", ["(n & 1) == 1","(n | 1) == 0","(n ^ 1) == 1","(n << 1) == 0"], 0, "Masking with binary 1 isolates the least significant bit.", "medium"),
      makeQuestion("dsa-bit-manipulation-review-4", "Bit Manipulation", "For a non-negative integer n, what does n & (n - 1) do?", ["Clears the lowest set bit","Sets every bit to 1","Shifts all bits left","Reverses the bit order"], 0, "Subtracting one flips trailing zeroes and the lowest one; AND clears that lowest set bit.", "medium"),
      makeQuestion("dsa-bit-manipulation-review-5", "Integer Representation", "Why can signed integer overflow be dangerous in program logic?", ["The mathematical result may not be representable and language behaviour may be constrained or undefined","It always converts the number to a string","It guarantees a larger memory allocation","It automatically uses floating point"], 0, "Overflow handling depends on the language and type; in C and C++ signed overflow is undefined behaviour.", "medium")
    ]),
  makeChapter(dsaPath, "mixed-problem-solving", "Mixed problem solving and interview-style practice", "Choose a pattern from constraints, justify it and communicate a complete solution.", [
    { title: "Classify a problem before coding", minutes: 15, body: "Read the constraints and identify the operation that dominates the problem: lookup, ordered traversal, range query, shortest path, optimisation or exhaustive search. Choose a candidate data structure and state the expected time and extra space.\n\nBefore implementation, write a brute-force baseline. It gives you a correctness reference and helps reveal what must be improved. Then choose a pattern such as hashing, two pointers, sliding window, BFS, greedy or DP.\n\n**Practice:** classify ten short prompts by pattern and explain why two tempting alternatives are weaker." },
    { title: "Timed solve, test and explain", minutes: 18, body: "Use a repeatable assessment routine: restate the problem, clarify assumptions, propose a simple solution, improve it, dry-run a sample, test boundaries, then explain complexity. Do not start typing before you know what the state and invariant mean.\n\nAfter a timed set, review each miss as one of: concept gap, pattern recognition, implementation bug, edge-case miss or time management. Retry a fresh problem that tests the same skill in a different context.\n\n**Milestone:** solve one easy and one medium problem without hints, then explain the solution aloud in a clear sequence." },
  ], [
    makeQuestion("dsa-mixed-q1", "Problem solving", "What should you inspect first when selecting an algorithm?", ["Input constraints and required operations", "The colour of the code editor", "The number of comments", "The filename"], 0, "Constraints determine which time and space trade-offs are feasible."),
    makeQuestion("dsa-mixed-q2", "Debugging", "A solution passes the sample but fails hidden tests. What is a productive first review?", ["Check edge cases, constraints and assumptions", "Change random lines", "Remove all tests", "Use a larger variable name"], 0, "Hidden failures often expose untested boundaries or assumptions."),
    makeQuestion("dsa-mixed-q3", "Communication", "What should a strong technical solution explanation include?", ["Approach, correctness reasoning, complexity and edge cases", "Only the final code", "Only the runtime", "Only the variable names"], 0, "A complete explanation makes the reasoning and trade-offs visible."),
      makeQuestion("dsa-mixed-problem-solving-review-1", "Problem Solving", "What should you do before writing code for an unfamiliar problem?", ["Clarify inputs, outputs, constraints and edge cases","Choose variable names randomly","Start with the longest possible solution","Ignore the examples"], 0, "Understanding the contract and constraints guides algorithm selection and correctness.", "easy"),
      makeQuestion("dsa-mixed-problem-solving-review-2", "Problem Solving", "An algorithm works on the sample input but fails on empty input. What was most likely missed?", ["An edge case","The programming language name","The file extension","The code editor theme"], 0, "Empty input is a boundary case that should be considered when designing and testing the algorithm.", "medium"),
      makeQuestion("dsa-mixed-problem-solving-review-3", "Complexity", "An algorithm has two nested loops, each running n times. What is its time complexity when the inner body is constant time?", ["O(n²)","O(n)","O(log n)","O(2n)"], 0, "The inner body executes n × n times, giving quadratic growth.", "medium"),
      makeQuestion("dsa-mixed-problem-solving-review-4", "Testing", "Which test set is most useful for checking a function that accepts values from 1 through 100 inclusive?", ["0, 1, 100 and 101","Only 50","Only 1","Only 1000"], 0, "Test just outside and exactly at both allowed boundaries.", "easy"),
      makeQuestion("dsa-mixed-problem-solving-review-5", "Problem Solving", "Two algorithms solve the same task. Algorithm A is O(n log n), and B is O(n²). For sufficiently large n, which usually scales better?", ["Algorithm A","Algorithm B","They are always identical","Complexity gives no information"], 0, "For large n, n log n grows more slowly than n², though constants and input sizes also matter.", "medium")
    ]),
]

export const PROGRAMMING_CHAPTERS: Chapter[] = [
  ...LANGUAGE_CHAPTERS,
  ...DSA_CHAPTERS,
  ...ADVANCED_DSA_CHAPTERS,
  ...SQL_DBMS_CHAPTERS,
]

