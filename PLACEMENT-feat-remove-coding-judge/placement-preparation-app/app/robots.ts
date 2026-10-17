import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/content/blocks"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Primary crawler rules ──────────────────────────────────────────────
      {
        userAgent: "*",
        allow: ["/", "/prep", "/blog", "/faq", "/privacy", "/terms"],
        // Keep the authenticated app out of the index — every (app) route plus
        // auth. Crawling these only wastes budget on login redirects.
        // /invite is noindex but explicit disallow prevents budget leakage.
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
          "/invite",
          "/learn",
          "/mistakes",
          "/mock",
          "/onboarding",
          "/plan",
          "/practice",
          "/profile",
          "/readiness",
          "/resume",
          "/settings",
          "/api/",
        ],
      },

      // ── Block AI training crawlers ─────────────────────────────────────────
      // Original content policy: we grant indexing rights to search engines for
      // discoverability, but do NOT grant rights to train large language models
      // on our proprietary question bank, explanations or learning tracks.
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      {
        userAgent: "ChatGPT-User",
        disallow: ["/"],
      },
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
      {
        userAgent: "anthropic-ai",
        disallow: ["/"],
      },
      {
        userAgent: "Claude-Web",
        disallow: ["/"],
      },
      {
        userAgent: "Google-Extended",
        // Allow Google's AI Overview to surface StudyBench in answer boxes,
        // but block Gemini model training on our proprietary question bank.
        allow: ["/", "/prep", "/blog", "/faq"],
        disallow: ["/"],
      },
      {
        userAgent: "Bytespider",
        disallow: ["/"],
      },
      {
        userAgent: "meta-externalagent",
        disallow: ["/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
