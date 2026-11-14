import type { Chapter, LearningCard, LearningCardType, Lesson } from "@/lib/types"

type TeachingEntry = { block: string }
type CardGroup = "concept" | "example" | "strategy"

function splitTeachingBlocks(body: string): string[] {
  const code: string[] = []
  const text = body.replace(/```(?:[\w+#.-]+)?\s*([\s\S]*?)```/g, (_match, source: string) => {
    const token = `@@CODE_${code.length}@@`
    code.push(source.trim())
    return token
  })

  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.replace(/@@CODE_(\d+)@@/g, (_token, index: string) => `\n\`\`\`\n${code[Number(index)]}\n\`\`\``))
}

function labelOf(block: string): string {
  const markdownColon = block.match(/^\*\*([^*]{2,80}?):\*\*\s*/)
  if (markdownColon) return markdownColon[1].trim()
  const trailingColon = block.match(/^\*\*([^*]{2,80})\*\*:\s*/)
  if (trailingColon) return trailingColon[1].trim()
  return ""
}

function groupOf(block: string): CardGroup {
  const label = labelOf(block).toLowerCase()
  if (/worked (?:example|check)|example|walkthrough|trace|demonstration/.test(label) || /```/.test(block)) return "example"
  if (/common mistake|mistake|pitfall|trap|exam tip|practice tip|shortcut|trick|complexity|edge case|when to use|remember/.test(label)) return "strategy"
  if (/\*\*(?:common mistake|pitfall|trap|exam tip|practice tip|shortcut|trick|complexity|edge case|when to use|remember)/i.test(block)) return "strategy"
  return "concept"
}

function splitReadableBlock(block: string, maxChars = 620): string[] {
  if (block.length <= maxChars || /```/.test(block)) return [block]
  const sentences = block.match(/[^.!?]+(?:[.!?]+|$)/g)?.map((item) => item.trim()).filter(Boolean) ?? []
  const units = sentences.length > 1 ? sentences : block.split(/\n+/).map((item) => item.trim()).filter(Boolean)
  if (units.length <= 1) {
    const chunks: string[] = []
    let current = ""
    for (const word of block.split(/\s+/)) {
      if (current && `${current} ${word}`.length > maxChars) {
        chunks.push(current)
        current = word
      } else current = current ? `${current} ${word}` : word
    }
    if (current) chunks.push(current)
    return chunks
  }
  const chunks: string[] = []
  let current = ""
  for (const unit of units) {
    if (current && `${current} ${unit}`.length > maxChars) {
      chunks.push(current)
      current = unit
    } else current = current ? `${current}\n${unit}` : unit
  }
  if (current) chunks.push(current)
  return chunks
}

function renderEntries(entries: TeachingEntry[]): string {
  return entries.map((entry) => entry.block).join("\n\n")
}

function makeCard(chapterId: string, lessonId: string, groupId: string, title: string, body: string, type: LearningCardType): LearningCard {
  return {
    id: `card-${chapterId}-${lessonId}-${groupId}`,
    lessonId,
    title,
    type,
    answer: body,
  }
}

function buildTeachingCards(chapterId: string, lessons: Lesson[]): LearningCard[] {
  return lessons.flatMap((lesson) => {
    const groups: Record<CardGroup, TeachingEntry[]> = { concept: [], example: [], strategy: [] }
    for (const block of splitTeachingBlocks(lesson.body)) {
      groups[groupOf(block)].push({ block })
    }

    const cards: LearningCard[] = []
    const addGroupCards = (group: CardGroup, title: string, type: LearningCardType) => {
      const blocks = groups[group].flatMap((entry) => splitReadableBlock(entry.block))
      blocks.forEach((block, index) => {
        const suffix = blocks.length > 1 ? ` · ${index + 1}` : ""
        const stableId = index === 0 ? group : `${group}-${index + 1}`
        cards.push(makeCard(chapterId, lesson.id, stableId, `${title}${suffix}`, block, type))
      })
    }
    addGroupCards("concept", "Understand the concept", "concept")
    addGroupCards("example", "Work through an example", "worked-example")
    addGroupCards("strategy", "Shortcuts and common traps", "application")

    // No unrelated filler: thin lessons stay honest and long lessons become
    // multiple readable cards instead of one scroll-heavy panel.
    if (cards.length === 0) {
      const body = lesson.body.trim()
      if (body) splitReadableBlock(body).forEach((block, index) => {
        cards.push(makeCard(chapterId, lesson.id, index === 0 ? "lesson" : `lesson-${index + 1}`, `${lesson.title}${body.length > 620 ? ` · ${index + 1}` : ""}`, block, "concept"))
      })
    }
    return cards
  })
}

/** Lesson-scoped teaching cards. Every card carries its real lesson identifier. */
export function buildChapterLearningDeck(chapter: Chapter, lessons = chapter.lessons) {
  return buildTeachingCards(chapter.id, lessons)
}

export function buildLessonLearningDeck(chapter: Chapter, lessonId: string) {
  const lesson = chapter.lessons.find((item) => item.id === lessonId)
  return lesson ? buildTeachingCards(chapter.id, [lesson]) : []
}


/**
 * Build a compact, chapter-wide retrieval deck from the concepts actually taught.
 * Formula/rule/remember blocks are preferred; remaining slots use concise lesson
 * concept blocks. No external or unrelated facts are introduced.
 */
export function buildChapterRecallDeck(chapter: Chapter, lessons = chapter.lessons): LearningCard[] {
  const score = (block: string) => {
    let value = 0
    if (/formula|equation|identity|rule|remember|key point|shortcut|must know|in general/i.test(block)) value += 5
    if (/[=≤≥×÷√π]|\b(?:rate|ratio|percentage|probability|complexity)\b/i.test(block)) value += 3
    if (/```/.test(block)) value += 2
    if (block.length > 520) value -= 3
    if (block.length < 45) value -= 2
    return value
  }

  // Pick the strongest taught concept from every lesson first. Then combine
  // those lesson summaries into no more than three chapter-level recall cards.
  const lessonRecalls = lessons.flatMap((lesson) => {
    const blocks = splitTeachingBlocks(lesson.body)
    if (!blocks.length) return []
    const bestBlock = [...blocks].sort((a, b) => score(b) - score(a))[0]
    return bestBlock ? [{ lesson, block: bestBlock }] : []
  })
  if (!lessonRecalls.length) return []

  const cardCount = Math.min(3, lessonRecalls.length)
  const groups: typeof lessonRecalls[] = Array.from({ length: cardCount }, () => [])
  lessonRecalls.forEach((item, index) => {
    groups[Math.min(cardCount - 1, Math.floor(index * cardCount / lessonRecalls.length))].push(item)
  })

  return groups.map((group, index) => ({
    id: `recall-${chapter.id}-${index + 1}`,
    // Recall is chapter-scoped; retain the first lesson ID for compatibility
    // with the existing LearningCard shape while the answer covers the group.
    lessonId: group[0].lesson.id,
    title: `Recall · ${group.length === 1 ? group[0].lesson.title : `Lessons ${group[0].lesson.title}–${group[group.length - 1].lesson.title}`}`,
    type: group.some(({ block }) => /formula|equation|identity|rule|shortcut/i.test(block)) ? "application" : "concept",
    answer: group.map(({ lesson, block }) => `**${lesson.title}**\n\n${block}`).join("\n\n---\n\n"),
  }))
}
