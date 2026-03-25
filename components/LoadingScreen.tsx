"use client"
import { useEffect, useRef, useState } from "react"

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"cursor"|"typing"|"stars"|"warp"|"done">("cursor")
  const [typed, setTyped]   = useState("")
  const canvasRef           = useRef<HTMLCanvasElement>(null)
  const full = "INITIALIZING THE ANIRUDH PROTOCOL..."

  // Phase sequencer
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("typing"), 600)
    return () => clearTimeout(t1)
  }, [])

  // Typewriter
  useEffect(() => {
    if (phase !== "typing") return
    let i = 0
    const iv = setInterval(() => {
      setTyped(full.slice(0, i + 1))
      i++
      if (i >= full.length) {
        clearInterval(iv)
        setTimeout(() => setPhase("stars"), 600)
      }
    }, 48)
    return () => clearInterval(iv)
  }, [phase])

  // Stars canvas
  useEffect(() => {
    if (phase !== "stars" && phase !== "warp") return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    let W = window.innerWidth, H = window.innerHeight
    canvas.width = W; canvas.height = H

    const stars = Array.from({ length: 300 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.2,
      a: Math.random(),
    }))

    let warpProgress = 0
    let isWarping = false
    let animId: number

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.25)"
      ctx.fillRect(0, 0, W, H)

      stars.forEach(s => {
        if (isWarping) {
          const cx = W / 2, cy = H / 2
          const dx = s.x - cx, dy = s.y - cy
          const len = Math.sqrt(dx*dx + dy*dy)
          const streak = warpProgress * 60
          ctx.beginPath()
          ctx.moveTo(s.x, s.y)
          ctx.lineTo(s.x + (dx/len)*streak, s.y + (dy/len)*streak)
          ctx.strokeStyle = `rgba(180,220,255,${Math.min(warpProgress * 0.8, 0.7)})`
          ctx.lineWidth = s.r
          ctx.stroke()
          s.x += (dx/len) * warpProgress * 8
          s.y += (dy/len) * warpProgress * 8
          if (s.x < 0 || s.x > W || s.y < 0 || s.y > H) {
            s.x = Math.random() * W; s.y = Math.random() * H
          }
        } else {
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r, 0, Math.PI*2)
          ctx.fillStyle = `rgba(200,220,255,${s.a})`
          ctx.fill()
        }
      })

      if (isWarping) {
        warpProgress = Math.min(warpProgress + 0.04, 1)
        if (warpProgress >= 1) {
          cancelAnimationFrame(animId)
          onComplete()
          return
        }
      }
      animId = requestAnimationFrame(draw)
    }

    draw()

    if (phase === "stars") {
      setTimeout(() => {
        isWarping = true
        setPhase("warp")
      }, 1200)
    }

    return () => cancelAnimationFrame(animId)
  }, [phase])

  if (phase === "done") return null

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000",
      zIndex: 10000, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      transition: phase === "warp" ? "opacity 0.8s ease" : "none",
      opacity: phase === "warp" ? 0 : 1,
    }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />

      <div style={{
        position: "relative", zIndex: 2,
        fontFamily: "'Orbitron', sans-serif",
        fontSize: "clamp(0.7rem, 1.5vw, 1rem)",
        letterSpacing: "0.25em",
        color: "rgba(77,184,255,0.9)",
        textShadow: "0 0 20px rgba(77,184,255,0.5)",
        minHeight: "1.5em",
      }}>
        {phase === "cursor" && (
          <span style={{ animation: "blink 1s step-end infinite" }}>_</span>
        )}
        {(phase === "typing" || phase === "stars" || phase === "warp") && (
          <span>
            {typed}
            <span style={{ animation: "blink 0.7s step-end infinite" }}>_</span>
          </span>
        )}
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  )
}