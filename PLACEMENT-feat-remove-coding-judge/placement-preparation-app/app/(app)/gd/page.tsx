"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { PageHeader } from "@/components/app/page-header"
import { cn } from "@/lib/utils"

const GD_TOPICS = {
  general: [
    "Should social media be regulated by the government?",
    "Is work-from-home more productive than office work?",
    "Should college education be free in India?",
    "Digital India: opportunity or widening the divide?",
    "Is entrepreneurship better than a job for today's youth?",
    "Should India ban single-use plastics completely?",
    "Online learning vs classroom learning — which is better?",
    "Is cricket given too much attention compared to other sports?",
    "Brain drain: problem or personal choice?",
    "Should voting be made compulsory in India?",
  ],
  tcs: [
    "AI replacing jobs: threat or opportunity?",
    "Is remote work the future of IT companies?",
    "Should IT companies invest more in tier-2/3 city hiring?",
    "Data privacy vs convenience: where should the line be?",
    "Open-source software vs proprietary: which should companies prefer?",
  ],
  infosys: [
    "Sustainability in IT: buzzword or business necessity?",
    "Should freshers be trained on niche technologies before deployment?",
    "Agile vs Waterfall: which works better for large enterprises?",
    "Women in tech: progress made and gaps remaining",
    "Is upskilling the responsibility of the employee or the employer?",
  ],
  wipro: [
    "Digital transformation: where are Indian companies lagging?",
    "Should IT companies encourage career rotations across domains?",
    "Is a four-day work week practical for the IT industry?",
    "Diversity in tech teams: does it improve output?",
    "Cloud-first strategy: pros and pitfalls for mid-size companies",
  ],
  cognizant: [
    "Should companies use AI tools for performance appraisals?",
    "Is continuous learning a prerequisite for tech careers?",
    "Gig economy vs full-time employment: what suits India?",
    "Should fresher salaries in IT be standardised across companies?",
    "Mental health in the workplace: whose responsibility is it?",
  ],
}

const GD_FRAMEWORK = [
  {
    step: "1. Enter strong",
    icon: "Mic",
    detail:
      'Initiate or build on the first speaker within 60 seconds. Opening with a fact, definition, or a counter-angle stands out. Avoid filler openers like "As we all know..."',
    tip: "Opener formula: [Data/Definition] + [Position] + [One reason]",
  },
  {
    step: "2. Structure your point",
    icon: "ListOrdered",
    detail:
      "Use PREP: Point → Reason → Example → Point (repeat). Keep each turn to 30–45 seconds. Three tight sentences beat one long rambling paragraph.",
    tip: "Example: 'Remote work improves productivity [P]. Research by Stanford found a 13% output rise [R+E]. So companies should trust employees to manage their own time [P].'",
  },
  {
    step: "3. Handle interruptions",
    icon: "Hand",
    detail:
      "If cut off, finish with 'I'll conclude this thought -- [one sentence]' and stop. Never raise your voice or talk over two people simultaneously. Calmness signals maturity.",
    tip: "Recovery phrase: 'Let me add one more point to what was just said…'",
  },
  {
    step: "4. Build on others",
    icon: "MessageCircle",
    detail:
      "Acknowledge and add: 'Building on what [name] said, I'd add that…' This shows listening skills, which evaluators score heavily. Every group discussion has one person who just waits to talk — don't be them.",
    tip: "Evaluators value active listening as much as speaking.",
  },
  {
    step: "5. Summarise if asked",
    icon: "CheckSquare",
    detail:
      "A good summary is neutral — it captures all views fairly, not just yours. Structure: What was agreed + Where views differed + What the group leaned towards. Do not introduce a new argument in the summary.",
    tip: "Summary template: 'The group discussed X. Most agreed that Y, while some felt Z. The consensus leaned towards…'",
  },
]

const DOS_AND_DONTS = {
  dos: [
    "Speak clearly at a moderate pace — clarity beats speed",
    "Use data, examples, or real events to back your point",
    "Maintain eye contact with the group, not just the evaluator",
    "Invite quieter members with 'I'd like to hear [name]'s view on this'",
    "Acknowledge good points from others before countering them",
    "Stick to the topic — go off-topic only if you can justify the link",
    "Arrive with 2–3 prepared positions on current affairs topics",
    "Show awareness of both sides even if you pick one stance",
  ],
  donts: [
    "Never interrupt someone mid-sentence — wait for a breath",
    "Don't dominate — aim for 3–4 well-timed contributions, not constant talking",
    "Avoid personal attacks or dismissive language like 'that's wrong'",
    "Never stay completely silent — even one strong point beats zero points",
    "Don't repeat what was already said without adding something new",
    "Avoid filler words: 'basically', 'like', 'um' — practice replacing them with silence",
    "Don't look only at the evaluator — it signals you are performing, not discussing",
    "Never be the loudest person in the room — GDs are evaluated on quality, not volume",
  ],
}

const COMPANY_GD_NOTES: { company: string; icon: string; note: string }[] = [
  {
    company: "TCS",
    icon: "Building2",
    note: "TCS GDs are typically 8–10 candidates, 15–20 minutes, one topic. They assess communication and structure more than domain knowledge. Being calm under pressure scores highly.",
  },
  {
    company: "Infosys",
    icon: "Building2",
    note: "Infosys often uses technology-adjacent topics. They expect you to know about recent IT trends. Practise topics like cloud, AI, sustainability, and remote work.",
  },
  {
    company: "Wipro",
    icon: "Building2",
    note: "Wipro GDs focus on soft skills and maturity. They watch for team dynamics — who leads, who listens, who summarises. Volunteering to summarise is a clear positive signal.",
  },
  {
    company: "Cognizant",
    icon: "Building2",
    note: "Cognizant GDs tend to have business and social topics. They value structured communication and initiative. Not initiating is not penalised if you contribute strongly later.",
  },
]

const CURRENT_AFFAIR_TOPICS = [
  "India's semiconductor push and Make in India",
  "NEP 2020 and skill-based education reform",
  "5G rollout and digital infrastructure",
  "Startup India and unicorn growth",
  "Climate tech and India's net-zero commitment",
  "Generative AI regulation globally",
  "CBDC (Digital Rupee) and its impact on banking",
  "ISRO's commercial space ambitions",
  "India's G20 presidency and global positioning",
  "Cybersecurity threats in financial systems",
]

export default function GdPage() {
  const [activeCompany, setActiveCompany] = React.useState<keyof typeof GD_TOPICS>("general")
  const [openStep, setOpenStep] = React.useState<number | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Placement skills"
        title="Group Discussion Prep"
        description="Frameworks, topic banks, company-specific notes and the exact behaviours evaluators watch for."
      />

      {/* Framework */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-base">
            <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon name="ListOrdered" className="size-4" />
            </span>
            The 5-step GD framework
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Master this structure before you practise topics. Process beats content.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {GD_FRAMEWORK.map((item, i) => (
            <button
              key={item.step}
              type="button"
              onClick={() => setOpenStep(openStep === i ? null : i)}
              className="w-full rounded-xl border border-border bg-background p-3 text-left transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon name={item.icon} className="size-4" />
                  </span>
                  <span className="font-semibold">{item.step}</span>
                </div>
                <Icon
                  name={openStep === i ? "ChevronUp" : "ChevronDown"}
                  className="size-4 text-muted-foreground"
                />
              </div>
              {openStep === i ? (
                <div className="mt-3 space-y-2 pl-12">
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
                  <div className="rounded-lg bg-primary/5 px-3 py-2 text-sm">
                    <p className="font-medium text-primary">Placement trainer tip</p>
                    <p className="mt-1 text-muted-foreground">{item.tip}</p>
                  </div>
                </div>
              ) : null}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Do's and Don'ts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-success/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base text-[color:var(--success)]">
              <Icon name="CircleCheckBig" className="size-4" /> Do these
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {DOS_AND_DONTS.dos.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <Icon name="Check" className="mt-0.5 size-4 shrink-0 text-[color:var(--success)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base text-destructive">
              <Icon name="X" className="size-4" /> Never do these
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {DOS_AND_DONTS.donts.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <Icon name="X" className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Topic bank */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-base">
            <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon name="BookOpen" className="size-4" />
            </span>
            GD topic bank
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Pick a company to see the topic types most likely for that drive.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(GD_TOPICS) as (keyof typeof GD_TOPICS)[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCompany(key)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                  activeCompany === key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted/50",
                )}
              >
                {key === "general" ? "General" : key.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {GD_TOPICS[activeCompany].map((topic, i) => (
              <div
                key={topic}
                className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3 text-sm"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span>{topic}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Company-specific notes */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Company-specific GD notes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {COMPANY_GD_NOTES.map((item) => (
            <div key={item.company} className="rounded-xl border border-border p-3">
              <p className="flex items-center gap-2 font-semibold">
                <Icon name={item.icon} className="size-4 text-primary" />
                {item.company}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Current affairs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-base">
            <span className="grid size-8 place-items-center rounded-lg bg-warning/10 text-warning-foreground">
              <Icon name="Newspaper" className="size-4" />
            </span>
            Current affairs to know right now
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            These topics are appearing in GDs and PI rounds across major drives in 2025–26.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {CURRENT_AFFAIR_TOPICS.map((topic) => (
              <div
                key={topic}
                className="flex items-start gap-2 rounded-lg border border-border p-2.5 text-sm"
              >
                <Icon name="ChevronRight" className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{topic}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
