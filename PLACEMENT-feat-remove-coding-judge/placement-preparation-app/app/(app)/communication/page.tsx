"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { PageHeader } from "@/components/app/page-header"
import { cn } from "@/lib/utils"

const SECTIONS = [
  "Email writing",
  "30-second explanation",
  "Active listening",
  "Business vocabulary",
  "Body language",
] as const

type Section = (typeof SECTIONS)[number]

const EMAIL_TEMPLATES = [
  {
    title: "Following up after an interview",
    subject: "Thank you for the opportunity — [Your Name] | [Role] Interview",
    body: `Dear [Interviewer's Name],

Thank you for taking the time to speak with me today regarding the [Role] position at [Company].

I enjoyed learning about [specific aspect of the role or team discussed]. Our conversation about [a topic from the interview] reaffirmed my interest in contributing to the team.

Please let me know if you need any additional information. I look forward to hearing about next steps.

Best regards,
[Your Name] | [Branch] | [College] | [Phone]`,
    tip: "Send within 24 hours. Keep it under 100 words. One specific reference to the conversation shows you were paying attention.",
  },
  {
    title: "Reaching out to an employee at a target company",
    subject: "Seeking guidance — fresher interested in [Company] / [Role]",
    body: `Hi [Name],

I am a [Year] student at [College] preparing for campus placements. I came across your profile and noticed you work on [team/domain] at [Company].

I would be grateful for 10 minutes of your time to understand what the role and interview process look like from inside. I have already [prepared mock tests / read company engineering blogs / etc.], so I won't ask questions Google can answer.

No worries if you are busy — I understand.

Thank you,
[Your Name]`,
    tip: "Always show you've done homework. Ask for exactly 10 minutes, not 'a chat'. Giving them an easy out ('no worries if busy') makes them more likely to say yes.",
  },
  {
    title: "Requesting an internship",
    subject: "Internship enquiry — [Branch] student, [College]",
    body: `Dear [Hiring Manager / HR Team],

I am a [Year] [Branch] student at [College] with a CGPA of [X]. I am writing to enquire about internship opportunities at [Company] for [duration, e.g. summer 2026].

I have experience in [relevant skills/projects, one line only]. I am particularly interested in [specific domain] and believe [Company]'s work in [area] aligns with my goals.

I have attached my resume. Please let me know if there is a suitable opening or if a referral process is more appropriate.

Thank you for your time,
[Your Name]`,
    tip: "Lead with your strongest credential. Do not use 'I am a passionate learner' — every email says that. Specificity ('your work in computer vision') beats flattery.",
  },
]

const THIRTY_SECOND_FRAMEWORK = {
  structure: [
    { label: "Hook (5 sec)", text: "One line that identifies you meaningfully: name + college + branch + year." },
    { label: "Value (10 sec)", text: "What you've done: one project or achievement that is relevant to this role. Quantify if possible." },
    { label: "Fit (10 sec)", text: "Why this company / role specifically — one real reason, not a compliment." },
    { label: "Ask (5 sec)", text: "Clear close: 'I'd love to be considered for this role' or 'I'd appreciate 10 minutes to discuss further.'" },
  ],
  example: `"I'm Ananya, a final-year CSE student at NIT Trichy. I built a real-time traffic prediction model using LSTM networks that reduced ETA error by 18% on city-level data — the project is on GitHub. I'm applying to TCS iON because your work in AI-powered assessments is exactly the domain I want to build in. I'd love to be part of the team."`,
  mistakes: [
    "Starting with 'I am a passionate and hardworking individual'",
    "Listing your resume instead of telling a story",
    "Being vague: 'I have experience in web development' (which kind? what did you build?)",
    "Talking for 3 minutes when 30 seconds was asked for",
    "Ending with 'So…yeah, that's it' instead of a direct close",
  ],
}

const ACTIVE_LISTENING_TIPS = [
  {
    icon: "Eye",
    title: "Watch before you speak",
    text: "In a GD or panel, spend the first 30 seconds listening to understand the room — who is taking what position, what has already been said. This prevents you from repeating a point that was just made.",
  },
  {
    icon: "RefreshCw",
    title: "Paraphrase to confirm",
    text: "When an interviewer finishes a question, restate it briefly: 'So you're asking about how I handled a conflict in a team setting?' This confirms understanding and buys you 3 seconds to think.",
  },
  {
    icon: "MessageCircle",
    title: "Reference what was said",
    text: "In group discussions, say 'Building on [name]'s point about X…' rather than just launching into your opinion. This signals genuine listening and earns goodwill from both the group and evaluators.",
  },
  {
    icon: "Pause",
    title: "Use silence strategically",
    text: "A 2-second pause before answering a hard question signals confidence, not ignorance. Saying 'That's a good question — let me think for a moment' is perfectly acceptable in an interview.",
  },
]

const VOCABULARY_SETS = [
  {
    category: "Starting a point",
    phrases: [
      "From my perspective…",
      "One angle worth considering is…",
      "The evidence suggests that…",
      "What concerns me about this approach is…",
      "I'd like to add a different dimension here…",
    ],
  },
  {
    category: "Building on others",
    phrases: [
      "Building on what [name] said…",
      "I agree with the core idea, and I'd also add…",
      "That point highlights something important — specifically…",
      "To strengthen that argument with a data point…",
    ],
  },
  {
    category: "Countering politely",
    phrases: [
      "I see your point, though I'd look at it differently…",
      "That works in one scenario, but consider…",
      "I partially agree — the part I'd challenge is…",
      "The limitation of that argument is…",
    ],
  },
  {
    category: "Interview answers",
    phrases: [
      "In that situation, I chose to… because…",
      "The outcome was… and what I'd do differently is…",
      "The core challenge was… and my approach was…",
      "I took ownership of… by doing…",
    ],
  },
  {
    category: "Words to replace",
    phrases: [
      "Passionate about → deeply interested in / actively working on",
      "Good communication → able to explain [X] to [Y] clearly",
      "Team player → collaborated with [n] people to deliver [outcome]",
      "Quick learner → went from zero to [X] in [timeframe]",
      "Hardworking → [specific habit or result that shows it]",
    ],
  },
]

const BODY_LANGUAGE_TIPS = [
  { icon: "User", tip: "Sit upright — slouching signals boredom. Lean forward slightly when listening." },
  { icon: "Eye", tip: "Maintain eye contact ~70% of the time when speaking; look away while thinking." },
  { icon: "Hand", tip: "Keep hands on the table or in your lap. Avoid touching your face repeatedly." },
  { icon: "Mic", tip: "Speak from the diaphragm, not the throat — breathe before you answer." },
  { icon: "Smile", tip: "A natural smile when introduced signals approachability. Don't force it throughout." },
  { icon: "Move", tip: "Avoid repetitive gestures (pen clicking, leg shaking) — they are distracting and signal anxiety." },
]

export default function CommunicationPage() {
  const [activeSection, setActiveSection] = React.useState<Section>("Email writing")
  const [openEmailIndex, setOpenEmailIndex] = React.useState<number | null>(null)
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null)

  async function copyEmail(text: string, index: number) {
    await navigator.clipboard.writeText(text).catch(() => {})
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Placement skills"
        title="Communication Skills"
        description="Email templates, the 30-second pitch framework, vocabulary upgrades, active listening and body language for interviews and GDs."
      />

      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActiveSection(s)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              activeSection === s
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-muted/50",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {activeSection === "Email writing" ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
            <p className="font-semibold text-primary">The one rule of professional email</p>
            <p className="mt-1 text-muted-foreground">
              Every email has one job. State it in the subject line and the first sentence. Everything else supports it.
              If you cannot say what the email is for in one sentence, don&apos;t send it yet.
            </p>
          </div>
          <div className="space-y-3">
            {EMAIL_TEMPLATES.map((tpl, i) => (
              <Card key={tpl.title}>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-heading text-base">{tpl.title}</CardTitle>
                  <button
                    type="button"
                    onClick={() => setOpenEmailIndex(openEmailIndex === i ? null : i)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {openEmailIndex === i ? "Collapse" : "View template"}
                  </button>
                </CardHeader>
                {openEmailIndex === i ? (
                  <CardContent className="space-y-3">
                    <div className="rounded-lg bg-muted/50 p-3 text-sm">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subject</p>
                      <p className="font-mono text-foreground">{tpl.subject}</p>
                    </div>
                    <div className="relative rounded-lg border border-border bg-background p-3">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/85">
                        {tpl.body}
                      </pre>
                      <button
                        type="button"
                        onClick={() => copyEmail(tpl.body, i)}
                        className="absolute right-2 top-2 rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-muted/60"
                      >
                        {copiedIndex === i ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div className="flex items-start gap-2 rounded-lg bg-success/10 p-3 text-sm">
                      <Icon name="Lightbulb" className="mt-0.5 size-4 shrink-0 text-[color:var(--success)]" />
                      <p className="text-[color:var(--success)]">{tpl.tip}</p>
                    </div>
                  </CardContent>
                ) : null}
              </Card>
            ))}
          </div>
        </div>
      ) : activeSection === "30-second explanation" ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base">The 30-second self-introduction framework</CardTitle>
              <p className="text-sm text-muted-foreground">
                Used in HR rounds, walk-in drives, LinkedIn connections and any cold outreach.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {THIRTY_SECOND_FRAMEWORK.structure.map((item) => (
                  <div key={item.label} className="rounded-xl border border-border p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">{item.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">Example</p>
                <p className="text-sm leading-relaxed text-foreground/85 italic">
                  {THIRTY_SECOND_FRAMEWORK.example}
                </p>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Common mistakes that kill first impressions</p>
                <ul className="space-y-1.5">
                  {THIRTY_SECOND_FRAMEWORK.mistakes.map((m) => (
                    <li key={m} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Icon name="X" className="mt-0.5 size-4 shrink-0 text-destructive" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : activeSection === "Active listening" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {ACTIVE_LISTENING_TIPS.map((item) => (
            <Card key={item.title}>
              <CardContent className="space-y-2 pt-5">
                <span className="flex items-center gap-2 font-semibold">
                  <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon name={item.icon} className="size-4" />
                  </span>
                  {item.title}
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : activeSection === "Business vocabulary" ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
            <p className="font-semibold text-primary">Why vocabulary matters</p>
            <p className="mt-1 text-muted-foreground">
              Interviewers notice when a candidate says &ldquo;passionate about&rdquo; for the fifth time. Replace overused phrases
              with specific, evidence-backed language. These sets are ready to use in GDs, interviews and emails.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {VOCABULARY_SETS.map((set) => (
              <Card key={set.category}>
                <CardHeader className="pb-2">
                  <CardTitle className="font-heading text-sm text-primary">{set.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {set.phrases.map((phrase) => (
                      <li key={phrase} className="flex items-start gap-2 text-sm">
                        <Icon name="ChevronRight" className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{phrase}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : activeSection === "Body language" ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base">Non-verbal signals that interviewers notice</CardTitle>
              <p className="text-sm text-muted-foreground">
                Body language research consistently shows that non-verbal cues shape 55% of first impressions.
                These are the six most impactful for placement drives.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {BODY_LANGUAGE_TIPS.map((item) => (
                <div key={item.tip} className="flex items-start gap-3 rounded-xl border border-border p-3 text-sm">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon name={item.icon} className="size-4" />
                  </span>
                  <p className="text-muted-foreground">{item.tip}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
