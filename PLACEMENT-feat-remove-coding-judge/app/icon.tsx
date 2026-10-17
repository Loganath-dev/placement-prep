import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = { width: 512, height: 512 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#EFF6FF",
          borderRadius: 128,
          display: "flex",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 96,
            top: 96,
            width: 320,
            height: 320,
            borderRadius: 96,
            background: "#FFFFFF",
          }}
        />
        <div style={{ position: "absolute", left: 152, top: 278, width: 176, height: 44, borderRadius: 22, background: "#0F172A" }} />
        <div style={{ position: "absolute", left: 152, top: 210, width: 144, height: 44, borderRadius: 22, background: "#2563EB" }} />
        <div style={{ position: "absolute", left: 152, top: 142, width: 216, height: 44, borderRadius: 22, background: "#F59E0B" }} />
        <div style={{ position: "absolute", left: 256, top: 326, width: 178, height: 46, borderRadius: 23, background: "#0F172A", transform: "rotate(-45deg)", transformOrigin: "left center" }} />
        <div style={{ position: "absolute", left: 345, top: 245, width: 82, height: 46, borderRadius: 23, background: "#0F172A" }} />
        <div style={{ position: "absolute", left: 381, top: 245, width: 46, height: 82, borderRadius: 23, background: "#0F172A" }} />
        <div style={{ position: "absolute", left: 364, top: 124, width: 48, height: 48, borderRadius: 24, background: "#22C55E" }} />
      </div>
    ),
    size,
  )
}
