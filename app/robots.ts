import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/content/blocks"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Primary crawler rules ──────────────────────────────────────────────
      {
        userAgent: "*",
        allow: ["/", "/prep", "/blog", "/faq", "/affiliate-program", "/privacy", "/terms"],
        // Keep the authenticated app out of the index — every (app) route plus
        // auth. Crawling these only wastes budget on login redirects.
        // /invite is noindex but explicit disallow prevents budget leakage.
        disallow: [
          "/analytics",
          "/auth/",
          "/bookmarks",
          "/challenges",
          "/chapter-practice",
          "/dashboard",
          "/invite",
          "/learn",
          "/mistakes",
          "/mock",
          "/onboarding",
          "/plan",
          "/practice",
          "/referrals",
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
        // This token controls Gemini training and grounding, not Google Search.
        // Googlebot's rules above continue to allow Search indexing and AI Overviews.
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
