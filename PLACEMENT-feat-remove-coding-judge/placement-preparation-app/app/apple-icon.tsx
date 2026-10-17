import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

/**
 * Apple Touch Icon at 180×180 — identical proportions to icon.tsx.
 * Scale factor vs 512px: 180/512 ≈ 0.352.
 */
export default function AppleIcon() {
  const bg = "linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)"

  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: bg,
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* TOP BAR */}
        <div style={{
          position: "absolute",
          left: 48, top: 40,
          width: 85, height: 18,
          borderRadius: 9,
          background: "white",
        }} />

        {/* LEFT VERTICAL (upper) */}
        <div style={{
          position: "absolute",
          left: 48, top: 40,
          width: 18, height: 53,
          borderRadius: 9,
          background: "white",
        }} />

        {/* MIDDLE BAR */}
        <div style={{
          position: "absolute",
          left: 48, top: 81,
          width: 85, height: 18,
          borderRadius: 9,
          background: "white",
        }} />

        {/* RIGHT VERTICAL (lower) */}
        <div style={{
          position: "absolute",
          left: 115, top: 81,
          width: 18, height: 53,
          borderRadius: 9,
          background: "white",
        }} />

        {/* BOTTOM BAR */}
        <div style={{
          position: "absolute",
          left: 48, top: 122,
          width: 85, height: 18,
          borderRadius: 9,
          background: "white",
        }} />

        {/* BENCH UNDERLINE */}
        <div style={{
          position: "absolute",
          left: 56, bottom: 17,
          width: 68, height: 8,
          borderRadius: 4,
          background: "rgba(255,255,255,0.45)",
        }} />
      </div>
    ),
    size,
  )
}
