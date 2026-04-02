"use client"

import { useState, useEffect, useRef } from "react"
import { useHyperjump } from "@/hooks/useHyperjump"
import Navbar from "../../components/Navbar"

const CARDS = [
  {
    label: "Fun Fact",
    title: "I almost didn't study physics",
    body: "Originally started college undecided. A single astrophysics lecture changed everything.",
  },
  {
    label: "Lab Life",
    title: "The devices are tiny",
    body: "CdTe solar cells are about the size of a fingernail. Months of fabrication for something you could lose in a carpet.",
  },
  {
    label: "Music",
    title: "I mix at 2am",
    body: "Most of my sets are built late at night after lab. There's something about the quiet that makes the sound right.",
  },
  {
    label: "Climbing",
    title: "First outdoor climb was terrifying",
    body: "Indoor climbing is controlled. Outside, the rock decides. I've been hooked ever since.",
  },
  {
    label: "Random",
    title: "I name my solar cells",
    body: "Every batch gets a name. The best performing device so far was called AXIOM-7.",
  },
]

export default function ClassifiedPage() {
  const jump = useHyperjump()
  const [unlocked, setUnlocked] = useState(false)
  const [input, setInput] = useState("")
  const [status, setStatus] = useState<"idle" | "denied" | "granted">("idle")
  const [shake, setShake] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("classified-access") === "true") {
      setUnlocked(true)
    }
    // Focus input on mount
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  const tryAccess = () => {
    if (input.toLowerCase() === "axiom") {
      setStatus("granted")
      setTimeout(() => {
        sessionStorage.setItem("classified-access", "true")
        setUnlocked(true)
      }, 900)
    } else {
      setStatus("denied")
      setShake(true)
      setTimeout(() => {
        setStatus("idle")
        setShake(false)
      }, 2000)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") tryAccess()
  }

  if (unlocked) {
    return (
      <div className="classified-page">
        <Navbar setMode={() => {}} mode="home" scrollToSection={() => {}} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%", animation: "fadeIn 0.7s ease" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.6rem",
              letterSpacing: "0.35em",
              color: "rgba(255,180,50,0.6)",
              textTransform: "uppercase",
            }}
          >
            BEYOND THE PROTOCOL
          </span>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.4rem, 4vw, 2.8rem)",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "0.04em",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Things I don&apos;t put on the main site
          </h1>
          <div className="classified-grid">
            {CARDS.map((c) => (
              <div key={c.title} className="now-card classified-card">
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.52rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "rgba(255,180,50,0.7)",
                  }}
                >
                  {c.label}
                </span>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: "#fff",
                    letterSpacing: "0.03em",
                    lineHeight: 1.35,
                  }}
                >
                  {c.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.84rem",
                    lineHeight: 1.75,
                    color: "rgba(255,255,255,0.52)",
                  }}
                >
                  {c.body}
                </p>
              </div>
            ))}
          </div>
          <a href="/" className="resume-btn" style={{ marginTop: 40 }} onClick={(e) => { e.preventDefault(); jump("/") }}>
            RETURN TO PROTOCOL
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="classified-page">
      <Navbar setMode={() => {}} mode="home" scrollToSection={() => {}} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {/* Classified title */}
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.58rem",
            letterSpacing: "0.35em",
            color: "rgba(255,80,80,0.5)",
            textTransform: "uppercase",
          }}
        >
          CLEARANCE LEVEL: TOP SECRET
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 10vw, 6rem)",
            fontWeight: 900,
            color: "rgba(255,80,80,0.9)",
            textShadow: "0 0 40px rgba(255,50,50,0.4), 0 0 80px rgba(255,50,50,0.15)",
            letterSpacing: "0.08em",
            lineHeight: 1,
          }}
        >
          CLASSIFIED
        </h1>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.62rem",
            letterSpacing: "0.3em",
            color: "rgba(255,80,80,0.4)",
            textTransform: "uppercase",
          }}
        >
          CLEARANCE REQUIRED
        </div>

        {/* Password input */}
        <div style={{ position: "relative" }}>
          <input
            ref={inputRef}
            className="classified-input"
            type="password"
            placeholder="Enter access code..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            style={shake ? { animation: "shake 0.4s ease" } : {}}
            autoComplete="off"
          />
        </div>

        {/* Status */}
        {status === "denied" && (
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.6rem",
              letterSpacing: "0.3em",
              color: "rgba(255,80,80,0.9)",
              textTransform: "uppercase",
              animation: "fadeIn 0.2s ease",
            }}
          >
            ACCESS DENIED
          </div>
        )}
        {status === "granted" && (
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.6rem",
              letterSpacing: "0.3em",
              color: "rgba(100,255,120,0.9)",
              textTransform: "uppercase",
              animation: "fadeIn 0.2s ease",
              textShadow: "0 0 20px rgba(100,255,120,0.5)",
            }}
          >
            ACCESS GRANTED
          </div>
        )}

        <button
          onClick={tryAccess}
          className="resume-btn"
          style={{
            borderColor: "rgba(255,80,80,0.4)",
            color: "rgba(255,80,80,0.8)",
            marginTop: 8,
          }}
        >
          AUTHENTICATE
        </button>

        <a
          href="/"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.48rem",
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.2)",
            textDecoration: "none",
            textTransform: "uppercase",
            marginTop: 16,
            transition: "color 0.2s ease",
          }}
          onClick={(e) => { e.preventDefault(); jump("/") }}
        >
          ← Return to Protocol
        </a>
      </div>
    </div>
  )
}
