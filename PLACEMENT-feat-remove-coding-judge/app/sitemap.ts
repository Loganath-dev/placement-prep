import type { MetadataRoute } from "next"
import { BLOG_POSTS } from "@/lib/content/blog"
import { SITE_URL } from "@/lib/content/blocks"
import { COMPANIES } from "@/lib/data/companies"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/prep`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ]

  // Per-company prep landing pages — the highest-intent SEO pages (e.g.
  // "TCS placement preparation 2026"). Mirrors generateStaticParams on the route.
  const prepRoutes: MetadataRoute.Sitemap = COMPANIES.filter((c) => !c.isGeneral).map((c) => ({
    url: `${SITE_URL}/prep/${c.id}`,
    changeFrequency: "monthly",
    priority: 0.9,
  }))

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.dateModified),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  return [...staticRoutes, ...prepRoutes, ...blogRoutes]
}


