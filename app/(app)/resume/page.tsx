"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { PageHeader } from "@/components/app/page-header"
import { cn } from "@/lib/utils"

const RESUME_SECTIONS_ORDER = [
  { name: "Name + Contact", required: true, tip: "Name in 16–18pt, bold. Phone, professional email, LinkedIn URL, GitHub (if CS). No photo for most companies." },
  { name: "Education", required: true, tip: "Reverse chronological. CGPA, 10th %, 12th %. Month-Year of graduation. Relevant coursework (optional, only if it strengthens fit)." },
  { name: "Skills", required: true, tip: "Group by: Languages | Frameworks | Tools | Databases. Only list what you can discuss in an interview. No rating bars ('Python ●●●○○')." },
  { name: "Projects", required: true, tip: "3–4 strong projects beat 8 weak ones. Each project: title + tech stack + 2 bullet points (what it does, what you did, impact if measurable)." },
  { name: "Internship / Experience", required: false, tip: "If you have it, put it above Projects. Start every bullet with an action verb: Built, Reduced, Automated, Designed." },
  { name: "Achievements / Extra-curricular", required: false, tip: "Hackathons won, coding contest ranks, club leadership. Only add if it is a clear positive signal — remove filler." },
  { name: "Certifications", required: false, tip: "Only include ones from recognisable platforms (Coursera, NPTEL, AWS, Google) that are relevant to the role." },
]

const COMPANY_KEYWORDS: { company: string; keywords: string[] }[] = [
  {
    company: "TCS",
    keywords: [
      "Java", "Python", "SQL", "Agile", "REST API", "Spring Boot", "AWS basics",
      "Problem solving", "Communication", "Adaptability",
    ],
  },
  {
    company: "Infosys",
    keywords: [
      "Java", "Python", "Cloud fundamentals", "SDLC", "Automation testing",
      "Database design", "OOP", "Analytical thinking", "Team collaboration",
    ],
  },
  {
    company: "Wipro",
      keywords: [
      "Full stack", "React", "Node.js", "DevOps basics", "CI/CD",
      "Agile methodology", "Linux", "Scripting", "Project management",
    ],
  },
  {
    company: "Accenture",
    keywords: [
      "Digital transformation", "SAP basics", "Salesforce", "Data analytics",
      "UX awareness", "Client communication", "Business analysis", "Consulting mindset",
    ],
  },
  {
    company: "Zoho",
    keywords: [
      "C/C++", "Java", "Data structures", "Algorithms", "Problem solving",
      "Linux", "SQL", "Low-level design", "Product thinking",
    ],
  },
  {
    company: "Cognizant",
    keywords: [
      "Java", "Testing (manual + automation)", "Selenium", "Python", "SQL",
      "API testing", "Communication skills", "Domain knowledge (BFSI/healthcare)",
    ],
  },
]

const ACTION_VERBS = {
  "Building things": ["Built", "Developed", "Designed", "Implemented", "Architected", "Created", "Deployed"],
  "Improving things": ["Optimised", "Reduced", "Improved", "Automated", "Refactored", "Streamlined", "Enhanced"],
  "Leading/Contributing": ["Led", "Collaborated", "Mentored", "Coordinated", "Presented", "Trained", "Facilitated"],
  "Analysing/Researching": ["Analysed", "Researched", "Evaluated", "Modelled", "Investigated", "Identified"],
}

const PROJECT_BULLET_FORMULA = [
  {
    label: "Formula",
    text: "[Action verb] + [what you built/did] + [tech used] + [result or scale if available]",
    example: "Built a real-time chat application using Node.js and WebSockets, supporting 500 concurrent users with message latency under 80ms.",
  },
  {
    label: "Bad version",
    text: "Made a chat app using Node. It works well.",
    example: "This tells the reader nothing about complexity, scale, technology depth or your contribution.",
  },
]

const COMMON_MISTAKES = [
  { mistake: "Objective statement at the top", fix: "Remove it entirely. Use that space for a stronger project or skill." },
  { mistake: "Using 'responsible for' instead of action verbs", fix: "Replace: 'Responsible for testing' → 'Automated 80% of test cases using Selenium'" },
  { mistake: "Listing technologies you can't explain", fix: "If you can't answer 'How does X work?', remove X from your skills list." },
  { mistake: "Generic project descriptions", fix: "Add stack, scale, and your specific contribution. 'E-commerce website' is not a project description." },
  { mistake: "Photo on the resume", fix: "Most Indian companies and all global companies do not need or want a photo. Remove it." },
  { mistake: "More than 1 page as a fresher", fix: "1 page only. Tight, scannable, no paragraph blocks." },
  { mistake: "Fancy two-column templates", fix: "ATS systems often fail on multi-column resumes. Use a clean single-column format." },
  { mistake: "'References available on request'", fix: "Remove it. Everyone knows this and it wastes a line." },
]

const CHECKLIST_ITEMS = [
  "Name and contact info at the top — visible, not buried",
  "Professional email (no 'cuteboynumber23@...')",
  "All dates consistent: 'May 2024' or '05/2024', not both",
  "Every project has: title + stack + 2 bullets",
  "Each bullet starts with a strong action verb",
  "No paragraph blocks — only bullet points in experience/project sections",
  "CGPA, 10th %, 12th % all present with institution names",
  "File saved as PDF, named: FirstName_LastName_Resume.pdf",
  "Fits exactly 1 page (use 10–11pt body, 0.5in margins)",
  "GitHub/portfolio link is live and repo is public",
  "Skills list has no duplicates and nothing you can't discuss",
  "Spell-checked twice (use Grammarly or a friend)",
]

export default function ResumePage() {
  const [openSection, setOpenSection] = React.useState<string | null>(null)
  const [checkedItems, setCheckedItems] = React.useState<Set<number>>(new Set())

  function toggleCheck(index: number) {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Placement skills"
        title="Resume Guide"
        description="Section-by-section structure, company keyword banks, project bullet formulas and a final checklist."
      />

      {/* Pre-flight checklist */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-base text-primary">
            <Icon name="ClipboardCheck" className="size-4" />
            Final resume checklist ({checkedItems.size}/{CHECKLIST_ITEMS.length} done)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tick each item before submitting to any company.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {CHECKLIST_ITEMS.map((item, i) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleCheck(i)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors",
                  checkedItems.has(i)
                    ? "border-success/40 bg-success/10"
                    : "border-border hover:bg-muted/40",
                )}
              >
                <span className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-xs",
                  checkedItems.has(i)
                    ? "border-success/60 bg-success/20 text-[color:var(--success)]"
                    : "border-muted-foreground/30",
                )}>
                  {checkedItems.has(i) ? <Icon name="Check" className="size-3" /> : null}
                </span>
                <span className={cn(checkedItems.has(i) && "line-through text-muted-foreground")}>{item}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section order */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Resume section order</CardTitle>
          <p className="text-sm text-muted-foreground">
            For freshers, this order maximises recruiter scan time on the things that matter.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {RESUME_SECTIONS_ORDER.map((s, i) => (
            <button
              key={s.name}
              type="button"
              onClick={() => setOpenSection(openSection === s.name ? null : s.name)}
              className="w-full rounded-xl border border-border bg-background p-3 text-left hover:bg-muted/40"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="font-medium">{s.name}</span>
                  {s.required ? (
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-[color:var(--success)]">Required</span>
                  ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Optional</span>
                  )}
                </div>
                <Icon name={openSection === s.name ? "ChevronUp" : "ChevronDown"} className="size-4 text-muted-foreground" />
              </div>
              {openSection === s.name ? (
                <p className="mt-3 pl-10 text-sm leading-relaxed text-muted-foreground">{s.tip}</p>
              ) : null}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Project bullet formula */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">How to write project bullets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {PROJECT_BULLET_FORMULA.map((item) => (
            <div
              key={item.label}
              className={cn(
                "rounded-xl border p-4 text-sm",
                item.label === "Formula"
                  ? "border-primary/20 bg-primary/5"
                  : "border-destructive/20 bg-destructive/5",
              )}
            >
              <p className={cn(
                "mb-2 text-xs font-semibold uppercase tracking-wide",
                item.label === "Formula" ? "text-primary" : "text-destructive",
              )}>{item.label}</p>
              <p className="font-medium text-foreground">{item.text}</p>
              <p className="mt-2 text-muted-foreground italic">{item.example}</p>
            </div>
          ))}
          <div className="rounded-xl border border-border p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action verbs by type</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(ACTION_VERBS).map(([cat, verbs]) => (
                <div key={cat}>
                  <p className="text-xs font-medium text-primary">{cat}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{verbs.join(", ")}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Company keyword banks</CardTitle>
          <p className="text-sm text-muted-foreground">
            Recruiters and ATS systems scan for these. Include the ones you genuinely have experience with.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {COMPANY_KEYWORDS.map((item) => (
            <div key={item.company} className="rounded-xl border border-border p-3">
              <p className="mb-2 font-semibold">{item.company}</p>
              <div className="flex flex-wrap gap-1.5">
                {item.keywords.map((kw) => (
                  <span key={kw} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Common mistakes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-base text-destructive">
            <Icon name="AlertTriangle" className="size-4" /> Most common fresher resume mistakes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {COMMON_MISTAKES.map((item) => (
            <div key={item.mistake} className="grid gap-1 rounded-xl border border-border p-3 text-sm sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <Icon name="X" className="mt-0.5 size-4 shrink-0 text-destructive" />
                <span className="text-muted-foreground">{item.mistake}</span>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="Check" className="mt-0.5 size-4 shrink-0 text-[color:var(--success)]" />
                <span>{item.fix}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
