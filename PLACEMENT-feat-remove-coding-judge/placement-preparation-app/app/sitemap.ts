import type { MetadataRoute } from "next"
import { BLOG_POSTS } from "@/lib/content/blog"
import { SITE_URL } from "@/lib/content/blocks"
import { COMPANIES } from "@/lib/data/companies"

// Hard-coded to the date the page content was last meaningfully updated.
// Google uses lastModified as a crawl-priority signal — stale dates get
// deprioritised; accurate dates earn fresher crawl budgets.
const STATIC_PAGES_UPDATED = "2026-07-28"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(STATIC_PAGES_UPDATED),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/prep`,
      lastModified: new Date(STATIC_PAGES_UPDATED),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(STATIC_PAGES_UPDATED),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date(STATIC_PAGES_UPDATED),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date("2024-01-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date("2024-01-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  // Per-company prep landing pages — the highest-intent SEO pages (e.g.
  // "TCS placement preparation 2026"). Mirrors generateStaticParams on the route.
  const prepRoutes: MetadataRoute.Sitemap = COMPANIES.filter((c) => !c.isGeneral).map((c) => ({
    url: `${SITE_URL}/prep/${c.id}`,
    lastModified: new Date(STATIC_PAGES_UPDATED),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }))

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.dateModified),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...prepRoutes, ...blogRoutes]
}
