import { PREMIUM_PRICE_INR } from "@/lib/access"
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/content/blocks"
import type { Metadata } from "next"

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORD STRATEGY
// Grouped by search intent. Ordered: exact-match → long-tail → brand+intent.
// Google's NLP is mature — keyword density in <meta keywords> has zero ranking
// weight. This list is used for the `keywords` metadata field (Bing still reads
// it) and as a canonical reference for copywriters.
// ─────────────────────────────────────────────────────────────────────────────
const KEYWORDS = [
  // — Primary category keywords (highest search volume)
  "campus placement preparation",
  "placement preparation app",
  "placement preparation for freshers",
  "campus placement app India",
  "best app for placement preparation",
  "placement interview preparation app",

  // — Topic-level keywords (mid-funnel)
  "aptitude preparation for placements",
  "quantitative aptitude placement questions",
  "logical reasoning placement questions",
  "coding interview preparation for freshers",
  "placement mock test app",
  "company wise mock tests for placements",
  "company wise placement preparation",
  "placement previous year questions",
  "campus placement coding practice",
  "hr interview preparation for freshers",
  "technical interview preparation for campus placements",

  // — High-intent company + year targets (bottom-funnel, converts)
  "TCS NQT preparation 2026",
  "TCS NQT preparation 2027",
  "Infosys placement preparation 2026",
  "Wipro Elite NTH preparation",
  "Accenture assessment preparation",
  "Zoho interview preparation",
  "Cognizant GenC preparation",

  // — Localization & freshness variants
  "placement prep app India 2026",
  "engineering placement preparation website",
  "campus placement syllabus and pattern",
  "placement readiness score India",
  "interview preparation for freshers India",
]

export const SEO = {
  title: `${SITE_NAME} | Placement Prep App for Freshers`,
  description:
    "StudyBench helps Indian students prepare for campus placements with company-wise learning tracks, aptitude, coding, CS core, mock tests, PYQs, interview preparation, daily practice and readiness analytics.",
  keywords: KEYWORDS,
  image: `${SITE_URL}/opengraph-image`,
}

// ─────────────────────────────────────────────────────────────────────────────
// METADATA HELPER
// Generates a fully-formed Next.js Metadata object for any page.
// Use this for every new public-facing page to ensure consistency.
// ─────────────────────────────────────────────────────────────────────────────
export function getMetadata({
  title,
  description,
  path = "",
  noIndex = false,
  ogImage,
}: {
  title: string
  description: string
  path?: string
  noIndex?: boolean
  ogImage?: string
}): Metadata {
  const url = `${SITE_URL}${path}`
  const image = ogImage ?? `${SITE_URL}/opengraph-image`
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    keywords: KEYWORDS,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_IN",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — ${title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [image],
    },
    ...(noIndex
      ? { robots: { index: false, follow: false } }
      : {}),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURED DATA (JSON-LD)
// All nodes use @id anchors so Google's Knowledge Graph can merge/link them.
// Rule: every entity that appears in multiple schemas gets a single canonical
// @id (e.g. /#organization) and other schemas reference it — never repeat data.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Organization — emitted once on the homepage.
 * Covers E-E-A-T signals: founding date, location, contact, sameAs social proof.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: `${SITE_URL}/icon`,
      width: "512",
      height: "512",
      caption: SITE_NAME,
    },
    description: SITE_TAGLINE,
    foundingDate: "2024",
    foundingLocation: {
      "@type": "Place",
      addressCountry: "IN",
      name: "India",
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    audience: {
      "@type": "Audience",
      audienceType: "Indian undergraduate students preparing for campus placements",
    },
    // sameAs tells Google which social profiles belong to this brand.
    // Update these URLs when social accounts are created.
    sameAs: [
      SITE_URL,
    ],
  }
}

/**
 * WebSite — enables the Sitelinks Search Box in Google results.
 * The SearchAction points to the /prep page which acts as the directory.
 */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: "StudyBench Placement Prep",
    url: SITE_URL,
    description: SEO.description,
    inLanguage: "en-IN",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    // Sitelinks Search Box — Google shows a search input directly in the
    // SERP result block. Target must be a real, crawlable search endpoint.
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/prep?company={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

/**
 * SoftwareApplication — improves visibility in "apps" knowledge panels.
 * Note: aggregateRating should only be included once real reviews are collected.
 * Placeholder values are removed to avoid policy violations.
 */
export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software`,
    name: SITE_NAME,
    applicationCategory: "EducationalApplication",
    applicationSubCategory: "Exam Preparation",
    operatingSystem: "Web, iOS, Android",
    url: SITE_URL,
    description: SEO.description,
    inLanguage: "en-IN",
    isAccessibleForFree: true,
    audience: {
      "@type": "EducationalAudience",
      audienceType: "Indian undergraduate students and freshers preparing for campus placements",
      educationalRole: "student",
    },
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "INR",
        description: "Access to starter chapters, sample practice and mock baseline for all company tracks.",
      },
      {
        "@type": "Offer",
        name: "Premium",
        price: String(PREMIUM_PRICE_INR),
        priceCurrency: "INR",
        description: "Full access to all chapters, PYQs, mock tests, interview bank and analytics.",
        priceValidUntil: "2027-03-31",
        availability: "https://schema.org/InStock",
      },
    ],
    provider: {
      "@id": `${SITE_URL}/#organization`,
    },
  }
}

/**
 * Course — structured data for the main placement prep curriculum.
 * hasPart lists the six core subject areas so Google can surface individual
 * topic-level cards in search (especially useful for "aptitude for placements").
 */
export function courseJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${SITE_URL}/#course`,
    name: "Campus Placement Preparation for Freshers — India",
    description:
      "A structured, company-pattern placement preparation course covering quantitative aptitude, logical reasoning, verbal ability, coding & DSA, CS fundamentals, mock tests, PYQs and interview readiness — built specifically for Indian engineering and graduation students.",
    provider: {
      "@id": `${SITE_URL}/#organization`,
    },
    url: SITE_URL,
    educationalLevel: "Undergraduate",
    educationalCredentialAwarded: "Placement Readiness Index (PRI) Score",
    courseCode: "SB-PREP-2026",
    timeRequired: "PT60H",
    inLanguage: "en-IN",
    isAccessibleForFree: true,
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
      audienceType: "Indian undergraduate students and freshers",
    },
    teaches: [
      "Quantitative aptitude for campus placements",
      "Logical reasoning and puzzles",
      "Verbal ability and reading comprehension",
      "Data structures and algorithms",
      "CS fundamentals: DBMS, OS, Networks, OOP, SQL",
      "Company-specific mock test strategy",
      "HR and technical interview readiness",
    ],
    hasPart: [
      { "@type": "Course", name: "Quantitative Aptitude", url: `${SITE_URL}/prep` },
      { "@type": "Course", name: "Logical Reasoning", url: `${SITE_URL}/prep` },
      { "@type": "Course", name: "Verbal Ability", url: `${SITE_URL}/prep` },
      { "@type": "Course", name: "Coding & Data Structures", url: `${SITE_URL}/prep` },
      { "@type": "Course", name: "CS Core Subjects", url: `${SITE_URL}/prep` },
      { "@type": "Course", name: "Communication & Interview Prep", url: `${SITE_URL}/prep` },
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      category: "Free with Premium upgrade",
    },
  }
}

/**
 * FAQPage — used by both the /faq page and the homepage (first 4 Qs).
 * Google uses this for rich FAQ accordion results in the SERP.
 */
export function faqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

/**
 * BreadcrumbList — use on every deep page (blog posts, prep/[company]).
 * Breadcrumbs appear as path labels under the title in Google results.
 */
export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
