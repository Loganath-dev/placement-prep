import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { JsonLd } from "@/components/app/json-ld"
import { RichText, withBold } from "@/components/app/rich-text"
import {
  allPostSlugs,
  blogPostingJsonLd,
  breadcrumbJsonLd,
  getPost,
  postFaqJsonLd,
} from "@/lib/content/blog"
import { SITE_URL } from "@/lib/content/blocks"

export function generateStaticParams() {
  return allPostSlugs().map((slug) => ({ slug }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return { title: "Article not found - StudyBench" }
  const url = `${SITE_URL}/blog/${post.slug}`
  return {
    title: `${post.title} | StudyBench`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url,
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <JsonLd data={blogPostingJsonLd(post)} />
      <JsonLd data={postFaqJsonLd(post)} />
      <JsonLd data={breadcrumbJsonLd(post)} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <Icon name="ChevronRight" className="size-3.5" />
        <Link href="/blog" className="hover:text-foreground">
          Blog
        </Link>
      </nav>

      <article className="mt-4">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                {t}
              </span>
            ))}
            <span className="text-muted-foreground">
              {formatDate(post.datePublished)} - {post.readMins} min read
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold leading-tight md:text-4xl">
            {post.title}
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">{post.description}</p>
        </header>

        {/* Intro */}
        <div className="mt-6 space-y-4">
          {post.intro.map((p, i) => (
            <p key={i} className="leading-relaxed text-muted-foreground">
              {withBold(p)}
            </p>
          ))}
        </div>

        {/* Key takeaways (answer-first block for AEO) */}
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="space-y-2 p-5">
            <p className="flex items-center gap-2 font-heading font-semibold">
              <Icon name="ListChecks" className="size-4 text-primary" /> Key takeaways
            </p>
            <ul className="space-y-1.5">
              {post.takeaways.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Icon name="Check" className="mt-0.5 size-4 shrink-0 text-[color:var(--success)]" />
                  <span>{withBold(t)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="mt-8 space-y-8">
          {post.sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-20 space-y-3">
              <h2 className="font-heading text-xl font-semibold md:text-2xl">{s.heading}</h2>
              <RichText blocks={s.blocks} />
            </section>
          ))}
        </div>

        {/* On-page FAQ (FAQPage schema above powers AEO rich answers) */}
        <section className="mt-10">
          <h2 className="font-heading text-xl font-semibold md:text-2xl">
            Frequently asked questions
          </h2>
          <div className="mt-4 space-y-3">
            {post.faq.map((f, i) => (
              <Card key={i}>
                <CardContent className="space-y-1.5 p-5">
                  <h3 className="font-heading text-base font-semibold">{f.q}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <Card className="mt-10">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="font-heading text-lg font-semibold">
              Turn this into a real plan
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              StudyBench gives you company-pattern tracks, mocks, and progress tools to guide your next study session.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Start preparing free <Icon name="ArrowRight" className="size-4" />
            </Link>
          </CardContent>
        </Card>
      </article>

      {/* Related posts */}
      <RelatedPosts currentSlug={post.slug} />
    </main>
  )
}

function RelatedPosts({ currentSlug }: { currentSlug: string }) {
  // Lightweight "read next" - avoids importing the full list into the article body.
  const others = allPostSlugs()
    .filter((s) => s !== currentSlug)
    .map((s) => getPost(s)!)
    .slice(0, 2)
  if (others.length === 0) return null
  return (
    <section className="mt-12">
      <h2 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Read next
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {others.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
            <Card className="h-full transition-all group-hover:border-primary/40">
              <CardContent className="space-y-2 p-4">
                <h3 className="font-heading font-semibold leading-snug group-hover:text-primary">
                  {p.title}
                </h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}


