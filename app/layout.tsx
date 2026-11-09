import type { Metadata } from "next"
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { SITE_NAME, SITE_URL } from "@/lib/content/blocks"
import { SEO } from "@/lib/seo"
import { AppStoreProvider } from "@/lib/store"
import { cn } from "@/lib/utils"

// Geist (body) pairs with Geist Mono for figures/code, giving a coherent type
// system; Plus Jakarta Sans below carries the display headings.
const sans = Geist({ subsets: ["latin"], variable: "--font-sans" })

const heading = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  // Most headings use 600/700. Shipping only these cuts two global font files;
  // browsers synthesize the rare 500/800 usage without blocking first paint.
  weight: ["600", "700"],
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// Search-engine ownership verification. Set GOOGLE_SITE_VERIFICATION (Search
// Console) and/or BING_SITE_VERIFICATION (Bing Webmaster Tools — also powers
// Yahoo, which is Bing-backed) to emit the meta verification tags. Absent → none.
const seoVerification: Metadata["verification"] = {
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : {}),
  ...(process.env.BING_SITE_VERIFICATION
    ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
    : {}),
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  verification: seoVerification,
  title: {
    default: SEO.title,
    template: `%s | ${SITE_NAME}`,
  },
  description: SEO.description,
  keywords: SEO.keywords,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "education",
  // No global canonical here: a root-layout canonical is inherited by every
  // page that doesn't override it, telling Google they are all duplicates of
  // the homepage. Each indexable page declares its own canonical instead.
  icons: {
    icon: [{ url: "/icon", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    shortcut: ["/icon"],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: SEO.title,
    description: SEO.description,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "StudyBench campus placement preparation app",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO.title,
    description: SEO.description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en-IN"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        sans.variable,
        heading.variable,
        "font-sans",
      )}
    >
      <body>
        <ThemeProvider>
          <AppStoreProvider>
            <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
            <Toaster richColors position="top-center" />
          </AppStoreProvider>
        </ThemeProvider>
        <Analytics />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QFG7H4ZY9E"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-QFG7H4ZY9E');`}
        </Script>
      </body>
    </html>
  )
}
