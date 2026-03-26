"use client"
import { useEffect, useRef } from "react"

const NOTES = ["♩", "♪", "♫", "♬", "♭", "♮", "♯", "𝄞", "𝄢"]
const COL_W = 22

interface Drop {
  y: number
  speed: number
  alpha: number
  bright: boolean
  noteIdx: number
  trailLen: number
}

export default function MusicNotesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      init()
    }

    let drops: Drop[] = []

    const init = () => {
      const cols = Math.floor(canvas.width / COL_W)
      drops = Array.from({ length: cols }, () => ({
        y:        -Math.random() * canvas.height,
        speed:    0.4 + Math.random() * 1.2,
        alpha:    0.12 + Math.random() * 0.35,
        bright:   Math.random() > 0.72,
        noteIdx:  Math.floor(Math.random() * NOTES.length),
        trailLen: 4 + Math.floor(Math.random() * 6),
      }))
    }

    resize()

    let animId: number

    const draw = () => {
      // Soft fade trail — dark navy to match the theme
      ctx.fillStyle = "rgba(3, 8, 18, 0.055)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i]
        const x = i * COL_W + COL_W * 0.15

        // Trail notes above the lead
        for (let t = 1; t <= d.trailLen; t++) {
          const ty = d.y - t * COL_W
          if (ty < 0 || ty > canvas.height) continue
          const trailAlpha = d.bright
            ? (d.trailLen - t) / d.trailLen * 0.45
            : (d.trailLen - t) / d.trailLen * d.alpha * 0.6
          ctx.font = "14px serif"
          ctx.fillStyle = `rgba(77, 160, 255, ${trailAlpha})`
          ctx.fillText(NOTES[(d.noteIdx + t) % NOTES.length], x, ty)
        }

        // Lead note
        if (d.bright) {
          ctx.shadowBlur  = 10
          ctx.shadowColor = "rgba(100, 200, 255, 0.8)"
          ctx.font        = "16px serif"
          ctx.fillStyle   = "rgba(220, 240, 255, 0.95)"
        } else {
          ctx.shadowBlur = 0
          ctx.font       = "14px serif"
          ctx.fillStyle  = `rgba(77, 184, 255, ${d.alpha})`
        }

        if (d.y >= 0 && d.y <= canvas.height) {
          ctx.fillText(NOTES[d.noteIdx], x, d.y)
        }
        ctx.shadowBlur = 0

        // Advance
        d.y += d.speed

        // Randomly change note character each step
        if (Math.random() > 0.88) {
          d.noteIdx = Math.floor(Math.random() * NOTES.length)
        }

        // Reset when off bottom
        if (d.y > canvas.height + COL_W * 2) {
          d.y        = -COL_W * (2 + Math.random() * 8)
          d.speed    = 0.4 + Math.random() * 1.2
          d.alpha    = 0.12 + Math.random() * 0.35
          d.bright   = Math.random() > 0.72
          d.trailLen = 4 + Math.floor(Math.random() * 6)
        }
      }

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    window.addEventListener("resize", resize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.75,
      }}
    />
  )
}
