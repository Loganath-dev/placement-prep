import { getCompany } from "@/lib/data/companies"
import type { CompanyId, SectionId } from "@/lib/types"

export type PlacementDeadlineType = "drive" | "mock" | "interview" | "learning"

export type PlacementDeadline = {
  id: string
  companyId: CompanyId
  type: PlacementDeadlineType
  title: string
  detail: string
  date: string
  href: string
  priority: "today" | "soon" | "upcoming"
}

export type NextLearningTarget = {
  sectionId: SectionId
  sectionShort: string
  chapterTitle: string
  href: string
}

type DeadlineInput = {
  primary: CompanyId
  interested: CompanyId[]
  nextLearning?: NextLearningTarget | null
  hasMockScore?: boolean
  today?: Date
}

const DRIVE_LABEL: Record<CompanyId, string> = {
  tcs: "TCS NQT",
  infosys: "Infosys assessment",
  wipro: "Wipro Elite mock drive",
  accenture: "Accenture cognitive drive",
  zoho: "Zoho coding round",
  cognizant: "Cognizant GenC drive",
  capgemini: "Capgemini pseudocode drive",
  epam: "EPAM coding assessment",
  ibm: "IBM aptitude drive",
  unisys: "Unisys assessment",
  techmahindra: "Tech Mahindra assessment",
  hcltech: "HCLTech assessment",
  general: "Core Prep diagnostic",
}

function iso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function addDays(date: Date, days: number): string {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return iso(next)
}

export function daysUntil(dateKey: string, today = new Date()): number {
  const start = new Date(iso(today) + "T00:00:00")
  const end = new Date(dateKey + "T00:00:00")
  return Math.round((end.getTime() - start.getTime()) / 86_400_000)
}

function priorityFor(dateKey: string, today: Date): PlacementDeadline["priority"] {
  const days = daysUntil(dateKey, today)
  if (days <= 0) return "today"
  if (days <= 3) return "soon"
  return "upcoming"
}

function driveDetail(companyId: CompanyId): string {
  if (companyId === "zoho") return "Coding-heavy simulation with debugging and DSA review."
  if (companyId === "accenture") return "Cognitive, technical and communication readiness check."
  if (companyId === "wipro") return "Aptitude, verbal, essay-readiness and coding practice."
  if (companyId === "capgemini") return "Pseudocode, written-English and game-based aptitude readiness check."
  if (companyId === "epam") return "Programming-fundamentals and live coding readiness check."
  if (companyId === "general") return "Foundation checkpoint across aptitude, coding and CS basics."
  return "Company-pattern aptitude, coding and interview-readiness checkpoint."
}

export function buildPlacementDeadlines({
  primary,
  interested,
  nextLearning,
  hasMockScore = false,
  today = new Date(),
}: DeadlineInput): PlacementDeadline[] {
  const primaryCompany = getCompany(primary)
  const primaryDriveDate = addDays(today, 12)
  const mockDate = hasMockScore ? addDays(today, 2) : iso(today)
  const learningDate = addDays(today, 3)
  const interviewDate = addDays(today, 6)

  const events: PlacementDeadline[] = [
    {
      id: `${primary}-drive-simulation`,
      companyId: primary,
      type: "drive",
      title: `${DRIVE_LABEL[primary]} in ${daysUntil(primaryDriveDate, today)} days`,
      detail: driveDetail(primary),
      date: primaryDriveDate,
      href: `/mock?company=${primary}`,
      priority: priorityFor(primaryDriveDate, today),
    },
    {
      id: `${primary}-mock-cutoff`,
      companyId: primary,
      type: "mock",
      title: hasMockScore
        ? `${primaryCompany.short} next cutoff practice in 2 days`
        : `${primaryCompany.short} mock cutoff practice due today`,
      detail: "Take one timed mock and review every wrong topic immediately.",
      date: mockDate,
      href: `/mock?company=${primary}`,
      priority: priorityFor(mockDate, today),
    },
    {
      id: `${primary}-learning-deadline`,
      companyId: primary,
      type: "learning",
      title: nextLearning
        ? `3 days left to finish ${nextLearning.sectionShort} basics`
        : "3 days left to revise core basics",
      detail: nextLearning
        ? nextLearning.chapterTitle
        : "Use the revision sheet and chapter practice to keep momentum.",
      date: learningDate,
      href: nextLearning?.href ?? `/learn/${primary}`,
      priority: priorityFor(learningDate, today),
    },
    {
      id: `${primary}-interview-rehearsal`,
      companyId: primary,
      type: "interview",
      title: `${primaryCompany.short} interview rehearsal in 6 days`,
      detail: "Practise self-intro, project explanation, technical follow-ups and closing question.",
      date: interviewDate,
      href: `/interview?company=${primary}`,
      priority: priorityFor(interviewDate, today),
    },
  ]

  const otherCompanies = interested.filter((id) => id !== primary).slice(0, 3)
  for (const [index, companyId] of otherCompanies.entries()) {
    const date = addDays(today, 8 + index * 4)
    events.push({
      id: `${companyId}-watchlist-drive`,
      companyId,
      type: "drive",
      title: `${getCompany(companyId).short} watchlist checkpoint`,
      detail: "Keep one backup company warm with a short mock and eligibility check.",
      date,
      href: `/learn/${companyId}`,
      priority: priorityFor(date, today),
    })
  }

  return events.sort((a, b) => a.date.localeCompare(b.date))
}
