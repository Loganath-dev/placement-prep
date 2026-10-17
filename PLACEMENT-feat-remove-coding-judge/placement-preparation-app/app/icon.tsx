import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = { width: 512, height: 512 }
export const contentType = "image/png"

/**
 * Favicon at 512×512.
 * Mirrors the brand.tsx mark exactly — scaled from 40×40 grid by 12.8×.
 * The S is rendered as a thick stroked rounded rectangle chain that
 * next/og can render cleanly (no SVG path support in ImageResponse).
 */
export default function Icon() {
  // Each "S" segment: a rounded pill rectangle
  // Scaled from the 40×40 SVG grid
  const bg = "linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)"

  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: bg,
          borderRadius: 115, // ~9/40 * 512
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/*
         * The S is approximated as three horizontal pill bars + two
         * connecting vertical bars — all with heavy rounding to feel
         * hand-crafted. The geometry is tuned visually for 512px.
         */}

        {/* ── TOP BAR ── */}
        <div style={{
          position: "absolute",
          left: 138, top: 115,
          width: 240, height: 52,
          borderRadius: 26,
          background: "white",
        }} />

        {/* ── LEFT VERTICAL (upper half) ── */}
        <div style={{
          position: "absolute",
          left: 138, top: 115,
          width: 52, height: 150,
          borderRadius: 26,
          background: "white",
        }} />

        {/* ── MIDDLE BAR ── */}
        <div style={{
          position: "absolute",
          left: 138, top: 231,
          width: 240, height: 52,
          borderRadius: 26,
          background: "white",
        }} />

        {/* ── RIGHT VERTICAL (lower half) ── */}
        <div style={{
          position: "absolute",
          left: 326, top: 231,
          width: 52, height: 150,
          borderRadius: 26,
          background: "white",
        }} />

        {/* ── BOTTOM BAR ── */}
        <div style={{
          position: "absolute",
          left: 138, top: 347,
          width: 240, height: 52,
          borderRadius: 26,
          background: "white",
        }} />

        {/* ── "BENCH" UNDERLINE — thin rule at bottom ── */}
        <div style={{
          position: "absolute",
          left: 160, bottom: 48,
          width: 192, height: 22,
          borderRadius: 11,
          background: "rgba(255,255,255,0.45)",
        }} />
      </div>
    ),
    size,
  )
}
