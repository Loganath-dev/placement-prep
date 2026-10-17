import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { JsonLd } from "@/components/app/json-ld"
import { BLOG_POSTS } from "@/lib/content/blog"
import { SITE_NAME, SITE_URL } from "@/lib/content/blocks"

export const metadata: Metadata = {
  title: "Placement Preparation Blog - Guides for Freshers | StudyBench",
  description:
    "In-depth guides on campus placement preparation: roadmaps, aptitude, coding interviews, group discussion and HR tips, and measuring your readiness.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "StudyBench Blog - Campus Placement Preparation Guides",
    description:
      "Step-by-step guides to crack campus placements: aptitude, coding interviews, GD/HR and readiness.",
    type: "website",
    url: `${SITE_URL}/blog`,
  },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function BlogIndexPage() {
  const posts = [...BLOG_POSTS].sort(
    (a, b) => +new Date(b.datePublished) - +new Date(a.datePublished),
  )

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: posts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/blog/${p.slug}`,
      name: p.title,
    })),
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <JsonLd data={itemList} />

      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
          <Icon name="BookOpen" className="size-3.5" /> {SITE_NAME} Blog
        </span>
        <h1 className="mt-4 font-heading text-3xl font-bold md:text-4xl">
          Placement preparation guides for freshers
        </h1>
        <p className="mt-2 text-muted-foreground">
          Practical, no-fluff guides to crack campus placements - from aptitude and coding to
          interviews and measuring your readiness.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <Card className="h-full transition-all group-hover:border-primary/40">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {post.tags.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary"
                    >
                      {t}
                    </span>
                  ))}
                  <span className="text-muted-foreground">{post.readMins} min read</span>
                </div>
                <h2 className="font-heading text-lg font-semibold leading-snug group-hover:text-primary">
                  {post.title}
                </h2>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                  <span>{formatDate(post.datePublished)}</span>
                  <span className="inline-flex items-center gap-1 font-medium text-primary">
                    Read <Icon name="ArrowRight" className="size-3.5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}


