import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/content/blocks"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/prep", "/blog", "/faq", "/privacy", "/terms"],
        // Keep the authenticated app out of the index — every (app) route plus
        // auth. Crawling these only wastes budget on login redirects.
        disallow: [
          "/analytics",
          "/auth/",
          "/bookmarks",
          "/challenges",
          "/chapter-practice",
          "/coding",
          "/communication",
          "/dashboard",
          "/gd",
          "/interview",
          "/learn",
          "/mistakes",
          "/mock",
          "/onboarding",
          "/plan",
          "/practice",
          "/profile",
          "/readiness",
          "/resume",
          "/revision",
          "/settings",
          "/sprint",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}


