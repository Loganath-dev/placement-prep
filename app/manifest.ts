import type { MetadataRoute } from "next"
import { SITE_NAME, SITE_URL } from "@/lib/content/blocks"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} - Campus Placement Preparation`,
    short_name: SITE_NAME,
    description:
      "Company-wise campus placement preparation with aptitude, coding, CS core, mocks, PYQs, interviews and readiness analytics.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    categories: ["education", "productivity"],
    lang: "en-IN",
    icons: [
      {
        src: `${SITE_URL}/icon`,
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: `${SITE_URL}/apple-icon`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  }
}

