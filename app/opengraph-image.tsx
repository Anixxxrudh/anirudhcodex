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
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Blue glow behind title */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 200,
            background: "radial-gradient(ellipse, rgba(77,184,255,0.25) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "0.08em",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          THE ANIRUDH PROTOCOL
        </div>

        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.38)",
            letterSpacing: "0.3em",
            marginTop: 28,
            textTransform: "uppercase",
          }}
        >
          Astrophysics · Photovoltaics · Climbing · Music
        </div>

        {/* Decorative line */}
        <div
          style={{
            width: 120,
            height: 1,
            background: "rgba(77,184,255,0.4)",
            marginTop: 40,
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 60,
            fontSize: 15,
            color: "rgba(77,184,255,0.5)",
            letterSpacing: "0.15em",
          }}
        >
          theanirudhprotocol.vercel.app
        </div>
      </div>
    ),
    { ...size }
  )
}
