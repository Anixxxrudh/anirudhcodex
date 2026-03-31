"use client"
import { useEffect, useRef } from "react"

interface Props {
  onComplete?: () => void
  title?: string
  accentColor?: string
  duration?: number // ms total
}

interface Particle {
  x: number; y: number
  vx: number; vy: number
  r: number; alpha: number
  decay: number; settled: boolean
  sx: number; sy: number // settled position
}

export default function StarBirth({
  onComplete,
  title = "ANIRUDH CODEX",
  accentColor = "#C9A84C",
  duration = 2600,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const overlay = overlayRef.current
    if (!canvas || !overlay) return

    const W = window.innerWidth
    const H = window.innerHeight
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext("2d")!
    const cx = W / 2, cy = H / 2

    let animId: number
    const start = performance.now()
    const particles: Particle[] = []
    let titleOpacity = 0

    // Seed field stars
    const fieldStars: { x: number; y: number; r: number }[] = Array.from({ length: 180 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.3,
    }))

    const explode = () => {
      for (let i = 0; i < 220; i++) {
        const ang = Math.random() * Math.PI * 2
        const spd = 1.5 + Math.random() * 6
        const r = Math.random() * 2 + 0.5
        const sx = cx + Math.cos(ang) * (80 + Math.random() * (Math.min(W, H) * 0.45))
        const sy = cy + Math.sin(ang) * (80 + Math.random() * (Math.min(W, H) * 0.45))
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
          r, alpha: 1, decay: 0.004 + Math.random() * 0.004,
          settled: false, sx, sy,
        })
      }
    }

    let exploded = false

    const draw = (now: number) => {
      const t = (now - start) / duration // 0 → 1

      ctx.fillStyle = `rgba(0,0,0,${t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15})`
      ctx.fillRect(0, 0, W, H)

      if (t > 0.38 && !exploded) { exploded = true; explode() }

      // Phase 1: pulse dot
      if (t < 0.38) {
        const pulse = Math.sin(t * Math.PI * 8) * 0.5 + 0.5
        const dotR = t < 0.28 ? 3 + pulse * 4 : 3 * (1 - (t - 0.28) / 0.1)
        ctx.beginPath(); ctx.arc(cx, cy, Math.max(dotR, 0), 0, Math.PI * 2)
        ctx.fillStyle = "#fff"
        ctx.shadowBlur = 20 + pulse * 30; ctx.shadowColor = accentColor
        ctx.fill(); ctx.shadowBlur = 0
      }

      // Phase 2: shockwave ring
      if (t > 0.38 && t < 0.72) {
        const st = (t - 0.38) / 0.34
        const R = st * Math.min(W, H) * 0.6
        const op = Math.max(0, 1 - st * 1.2)
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${hexToRgb(accentColor)},${op})`
        ctx.lineWidth = 2.5 * (1 - st); ctx.stroke()
      }

      // Field stars (settle in after explosion)
      if (t > 0.4) {
        const sa = Math.min(1, (t - 0.4) / 0.3)
        for (const s of fieldStars) {
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${sa * 0.55})`; ctx.fill()
        }
      }

      // Explosion particles
      for (const p of particles) {
        if (!p.settled) {
          const dx = p.sx - p.x, dy = p.sy - p.y
          const dist = Math.hypot(dx, dy)
          if (dist < 3) { p.settled = true; p.x = p.sx; p.y = p.sy }
          else { p.x += dx * 0.06; p.y += dy * 0.06 }
          p.alpha = Math.max(0.15, p.alpha - p.decay)
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`; ctx.fill()
      }

      // Title fade in
      if (t > 0.55) {
        titleOpacity = Math.min(1, (t - 0.55) / 0.3)
        ctx.globalAlpha = titleOpacity
        ctx.fillStyle = "#fff"
        ctx.font = `700 clamp(24px,4vw,52px) 'Courier New', monospace`
        ctx.letterSpacing = "0.2em"
        ctx.textAlign = "center"
        ctx.shadowBlur = 30; ctx.shadowColor = accentColor
        ctx.fillText(title, cx, cy + 8)
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
      }

      if (t < 1) {
        animId = requestAnimationFrame(draw)
      } else {
        if (overlay) overlay.style.opacity = "0"
        setTimeout(() => { onComplete?.() }, 350)
      }
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [onComplete, title, accentColor, duration])

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: "#000", transition: "opacity 0.35s ease",
        pointerEvents: "all",
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  )
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}
