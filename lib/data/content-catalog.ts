import catalog from "@/lib/data/content-catalog.json"
import type { CompanyId, SectionId } from "@/lib/types"

export interface LessonCatalogItem {
  id: string
  title: string
  minutes: number
}

export interface ChapterCatalogItem {
  id: string
  title: string
  summary: string
  pathId?: string
  pathName?: string
  pathKind?: "language" | "dsa" | "sql-dbms"
  lessons: LessonCatalogItem[]
}

export interface SectionCatalogItem {
  id: SectionId
  name: string
  short: string
  icon: string
  blurb: string
  chapters: ChapterCatalogItem[]
}

const sectionsByCompany = catalog.sections as Record<string, SectionCatalogItem[]>

export const SECTION_META = (sectionsByCompany.general ?? []).map(({ id, name, short, icon, blurb }) => ({
  id, name, short, icon, blurb,
}))

export function getSections(companyId: CompanyId): SectionCatalogItem[] {
  // Interview and communication coaching is intentionally not part of the learning roadmap.
  return (sectionsByCompany[companyId] ?? []).filter((section) => section.id !== "comm-interview")
}

export function getSection(companyId: CompanyId, sectionId: SectionId): SectionCatalogItem | undefined {
  return getSections(companyId).find((section) => section.id === sectionId)
}

export function getChapterCatalogItem(companyId: CompanyId, sectionId: SectionId, chapterId: string) {
  return getSection(companyId, sectionId)?.chapters.find((chapter) => chapter.id === chapterId)
}

export function totalChapters(companyId: CompanyId): number {
  return getSections(companyId).reduce((total, section) => total + section.chapters.length, 0)
}
