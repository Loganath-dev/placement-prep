/**
 * Injects JSON-LD structured data for SEO / AEO (Answer Engine Optimization).
 * Search and answer engines read these schemas to build rich results and
 * direct answers (FAQ rich snippets, article cards, breadcrumbs).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Controlled, server-rendered data - safe to stringify into the document.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}


