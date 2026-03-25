import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "The Anirudh Protocol"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#020810",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dot grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(77,184,255,0.18) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.5,
            display: "flex",
          }}
        />

        {/* Corner brackets */}
        {/* top-left */}
        <div style={{ position: "absolute", top: 36, left: 48, width: 40, height: 40, borderTop: "1.5px solid rgba(77,184,255,0.4)", borderLeft: "1.5px solid rgba(77,184,255,0.4)", display: "flex" }} />
        {/* top-right */}
        <div style={{ position: "absolute", top: 36, right: 48, width: 40, height: 40, borderTop: "1.5px solid rgba(77,184,255,0.4)", borderRight: "1.5px solid rgba(77,184,255,0.4)", display: "flex" }} />
        {/* bottom-left */}
        <div style={{ position: "absolute", bottom: 36, left: 48, width: 40, height: 40, borderBottom: "1.5px solid rgba(77,184,255,0.4)", borderLeft: "1.5px solid rgba(77,184,255,0.4)", display: "flex" }} />
        {/* bottom-right */}
        <div style={{ position: "absolute", bottom: 36, right: 48, width: 40, height: 40, borderBottom: "1.5px solid rgba(77,184,255,0.4)", borderRight: "1.5px solid rgba(77,184,255,0.4)", display: "flex" }} />

        {/* Central glow */}
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 300,
            background: "radial-gradient(ellipse, rgba(77,184,255,0.18) 0%, transparent 70%)",
            borderRadius: "50%",
            display: "flex",
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            fontSize: 13,
            color: "rgba(77,184,255,0.7)",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          PORTFOLIO · 2026
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "0.06em",
            textAlign: "center",
            lineHeight: 1.05,
            textShadow: "0 0 80px rgba(77,184,255,0.4)",
          }}
        >
          THE ANIRUDH PROTOCOL
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 32,
          }}
        >
          <div style={{ width: 60, height: 1, background: "rgba(77,184,255,0.35)", display: "flex" }} />
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(77,184,255,0.7)", display: "flex" }} />
          <div style={{ width: 60, height: 1, background: "rgba(77,184,255,0.35)", display: "flex" }} />
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.28em",
            marginTop: 28,
            textTransform: "uppercase",
          }}
        >
          Astrophysics · Photovoltaics · Climbing · Music
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 44,
            fontSize: 14,
            color: "rgba(77,184,255,0.45)",
            letterSpacing: "0.18em",
          }}
        >
          anirudhcodex.vercel.app
        </div>
      </div>
    ),
    { ...size }
  )
}
