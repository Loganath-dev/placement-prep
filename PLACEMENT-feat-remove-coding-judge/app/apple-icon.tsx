import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#EFF6FF",
          borderRadius: 42,
          display: "flex",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", left: 34, top: 34, width: 112, height: 112, borderRadius: 34, background: "#FFFFFF" }} />
        <div style={{ position: "absolute", left: 54, top: 98, width: 62, height: 15, borderRadius: 8, background: "#0F172A" }} />
        <div style={{ position: "absolute", left: 54, top: 74, width: 51, height: 15, borderRadius: 8, background: "#2563EB" }} />
        <div style={{ position: "absolute", left: 54, top: 50, width: 76, height: 15, borderRadius: 8, background: "#F59E0B" }} />
        <div style={{ position: "absolute", left: 90, top: 115, width: 63, height: 16, borderRadius: 8, background: "#0F172A", transform: "rotate(-45deg)", transformOrigin: "left center" }} />
        <div style={{ position: "absolute", left: 122, top: 86, width: 29, height: 16, borderRadius: 8, background: "#0F172A" }} />
        <div style={{ position: "absolute", left: 135, top: 86, width: 16, height: 29, borderRadius: 8, background: "#0F172A" }} />
        <div style={{ position: "absolute", left: 128, top: 44, width: 17, height: 17, borderRadius: 9, background: "#22C55E" }} />
      </div>
    ),
    size,
  )
}
