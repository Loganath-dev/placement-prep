import { ImageResponse } from "next/og"
import { SITE_NAME } from "@/lib/content/blocks"

export const runtime = "edge"
export const alt = "StudyBench campus placement preparation app"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f8fafc",
          color: "#0f172a",
          padding: "64px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#EFF6FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", left: 13, top: 13, width: 46, height: 46, borderRadius: 14, background: "#FFFFFF" }} />
            <div style={{ position: "absolute", left: 21, top: 39, width: 25, height: 6, borderRadius: 3, background: "#0F172A" }} />
            <div style={{ position: "absolute", left: 21, top: 30, width: 21, height: 6, borderRadius: 3, background: "#2563EB" }} />
            <div style={{ position: "absolute", left: 21, top: 20, width: 31, height: 6, borderRadius: 3, background: "#F59E0B" }} />
            <div style={{ position: "absolute", left: 36, top: 46, width: 26, height: 6, borderRadius: 3, background: "#0F172A", transform: "rotate(-45deg)", transformOrigin: "left center" }} />
            <div style={{ position: "absolute", left: 50, top: 34, width: 12, height: 6, borderRadius: 3, background: "#0F172A" }} />
            <div style={{ position: "absolute", left: 56, top: 34, width: 6, height: 12, borderRadius: 3, background: "#0F172A" }} />
            <div style={{ position: "absolute", left: 51, top: 17, width: 7, height: 7, borderRadius: 4, background: "#22C55E" }} />
          </div>
          <div style={{ fontSize: 38, fontWeight: 800 }}>{SITE_NAME}</div>
        </div>
        <div>
          <div style={{ fontSize: 68, fontWeight: 900, lineHeight: 1.05, maxWidth: 960 }}>
            Campus placement preparation for Indian freshers
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#475569", maxWidth: 920 }}>
            Aptitude, coding, CS core, mocks, PYQs, interviews and readiness analytics in one app.
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 24, color: "#1d4ed8", fontWeight: 700 }}>
          <span>Company-wise tracks</span>
          <span>-</span>
          <span>Mock tests</span>
          <span>-</span>
          <span>Readiness score</span>
        </div>
      </div>
    ),
    size,
  )
}
