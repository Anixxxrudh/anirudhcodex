"use client"
import { useEffect, useRef } from "react"

// ── Types ──────────────────────────────────────────────────────────────
interface TextStar {
  x: number; y: number
  r: number
  baseAlpha: number
  phase: number
  pSpeed: number
  bright: boolean
  colorIdx: number
}

interface Particle {
  x: number; y: number
  homeX: number; homeY: number
  vx: number; vy: number
  r: number; alpha: number; blue: boolean
}

interface Orbit {
  rx: number; ry: number
  tilt: number; speed: number; angle: number
  color: string
  trail: { x: number; y: number }[]
}

// ── Neon palette ───────────────────────────────────────────────────────
const STAR_COLORS = [
  "77,184,255",   // cold blue     — 60 %
  "110,215,255",  // lighter blue  — 20 %
  "180,235,255",  // near-white    — 12 %
  "255,255,255",  // pure white    —  8 %
]

function colorIdx(): number {
  const r = Math.random()
  if (r < 0.60) return 0
  if (r < 0.80) return 1
  if (r < 0.92) return 2
  return 3
}

// ── 4-point spike star ─────────────────────────────────────────────────
function drawSpike(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number
) {
  ctx.beginPath()
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 4
    const d = i % 2 === 0 ? r : r * 0.22
    i === 0
      ? ctx.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d)
      : ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d)
  }
  ctx.closePath()
}

// ── Sample text pixels into star positions ─────────────────────────────
function buildTextStars(W: number, H: number): TextStar[] {
  const oc    = document.createElement("canvas")
  oc.width    = W
  oc.height   = H
  const octx  = oc.getContext("2d")!

  // Font size: fill ~72 % of width
  const fontSize = Math.round(Math.min(W * 0.215, H * 0.28))
  octx.clearRect(0, 0, W, H)
  octx.fillStyle    = "#fff"
  octx.font         = `900 ${fontSize}px "Orbitron", sans-serif`
  octx.textAlign    = "center"
  octx.textBaseline = "middle"
  // Sit in lower 40 % of canvas so it doesn't clash with the atom
  octx.fillText("DIYA", W / 2, H * 0.72)

  const { data } = octx.getImageData(0, 0, W, H)
  const stars: TextStar[] = []
  // Step: roughly 160 stars across the width
  const step = Math.max(4, Math.round(W / 160))

  for (let py = 0; py < H; py += step) {
    for (let px = 0; px < W; px += step) {
      if (data[(py * W + px) * 4 + 3] > 100) {
        const bright = Math.random() > 0.80
        stars.push({
          x: px + (Math.random() - 0.5) * step * 0.7,
          y: py + (Math.random() - 0.5) * step * 0.7,
          r:          bright ? 1.9 + Math.random() * 1.4 : 0.55 + Math.random() * 0.85,
          baseAlpha:  bright ? 0.70 + Math.random() * 0.30 : 0.22 + Math.random() * 0.38,
          phase:      Math.random() * Math.PI * 2,
          pSpeed:     0.006 + Math.random() * 0.022,
          bright,
          colorIdx:   colorIdx(),
        })
      }
    }
  }
  return stars
}

// ── Component ──────────────────────────────────────────────────────────
export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    let W = 0, H = 0, cx = 0, cy = 0
    let mouseX = -9999, mouseY = -9999
    let animId: number
    let t = 0
    let textStars: TextStar[] = []

    // Resize
    const resize = () => {
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width  = W
      canvas.height = H
      cx = W / 2
      cy = H / 2
      textStars = buildTextStars(W, H)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Background field particles
    const COUNT = 120
    const particles: Particle[] = Array.from({ length: COUNT }, () => {
      const x = Math.random() * W
      const y = Math.random() * H
      return {
        x, y, homeX: x, homeY: y,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r:  Math.random() * 1.5 + 1,
        alpha: Math.random() * 0.45 + 0.1,
        blue:  Math.random() > 0.45,
      }
    })

    // Atom orbits
    const TRAIL_LEN = 28
    const orbits: Orbit[] = [
      { rx: 195, ry: 72, tilt: 0,             speed: 0.007, angle: 0,               color: "#4db8ff", trail: [] },
      { rx: 195, ry: 72, tilt: Math.PI / 3,   speed: 0.011, angle: Math.PI * 2 / 3, color: "#00e5ff", trail: [] },
      { rx: 195, ry: 72, tilt: -Math.PI / 3,  speed: 0.009, angle: Math.PI * 4 / 3, color: "#80cfff", trail: [] },
    ]

    // Mouse
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouseX = e.clientX - r.left
      mouseY = e.clientY - r.top
    }
    const onLeave = () => { mouseX = -9999; mouseY = -9999 }
    canvas.addEventListener("mousemove", onMove)
    canvas.addEventListener("mouseleave", onLeave)

    // ── Draw loop ────────────────────────────────────────────────────
    const draw = () => {
      t++
      ctx.clearRect(0, 0, W, H)

      // ── LAYER 0: DIYA text — stars + neon glow ─────────────────────
      const globalPulse = 0.78 + 0.22 * Math.sin(t * 0.008)

      // Soft background glow behind the text
      const textCY = H * 0.72
      const glowH  = H * 0.18
      const bg = ctx.createRadialGradient(cx, textCY, 0, cx, textCY, W * 0.45)
      bg.addColorStop(0,   `rgba(40,110,200,${0.07 * globalPulse})`)
      bg.addColorStop(0.5, `rgba(20,70,160,${0.04 * globalPulse})`)
      bg.addColorStop(1,   "rgba(0,0,0,0)")
      ctx.beginPath()
      ctx.ellipse(cx, textCY, W * 0.45, glowH * 2.5, 0, 0, Math.PI * 2)
      ctx.fillStyle = bg
      ctx.fill()

      for (const s of textStars) {
        const twinkle = 0.55 + 0.45 * Math.sin(s.phase + t * s.pSpeed)
        const alpha   = Math.min(s.baseAlpha * globalPulse * twinkle, 1)
        const col     = STAR_COLORS[s.colorIdx]

        if (s.bright) {
          // Spike glow halo
          const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5)
          halo.addColorStop(0,   `rgba(77,184,255,${alpha * 0.45})`)
          halo.addColorStop(0.5, `rgba(77,184,255,${alpha * 0.12})`)
          halo.addColorStop(1,   "rgba(0,0,0,0)")
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2)
          ctx.fillStyle = halo
          ctx.fill()

          // 4-point spike
          ctx.save()
          ctx.shadowBlur  = 14
          ctx.shadowColor = `rgba(120,210,255,0.9)`
          drawSpike(ctx, s.x, s.y, s.r * 1.8)
          ctx.fillStyle = `rgba(220,245,255,${Math.min(alpha * 1.25, 1)})`
          ctx.fill()
          ctx.restore()
        } else {
          // Regular dot
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${col},${alpha})`
          ctx.fill()
        }
      }

      // ── LAYER 1: Background particles ─────────────────────────────
      for (const p of particles) {
        const dx   = p.x - mouseX
        const dy   = p.y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 110 && dist > 0) {
          const f = (110 - dist) / 110
          p.vx += (dx / dist) * f * 0.8
          p.vy += (dy / dist) * f * 0.8
        }
        p.vx += (p.homeX - p.x) * 0.03
        p.vy += (p.homeY - p.y) * 0.03
        p.vx *= 0.88; p.vy *= 0.88
        p.x  += p.vx;  p.y  += p.vy
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.blue
          ? `rgba(77,184,255,${p.alpha})`
          : `rgba(255,255,255,${p.alpha})`
        ctx.fill()
      }

      // ── LAYER 2: Orbit ellipses ────────────────────────────────────
      ctx.save()
      ctx.translate(cx, cy)
      for (const o of orbits) {
        ctx.save()
        ctx.rotate(o.tilt)
        ctx.strokeStyle = `${o.color}18`
        ctx.lineWidth   = 4
        ctx.beginPath()
        ctx.ellipse(0, 0, o.rx + 3, o.ry + 3, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.shadowBlur  = 14
        ctx.shadowColor = o.color
        ctx.strokeStyle = `${o.color}40`
        ctx.lineWidth   = 1.2
        ctx.beginPath()
        ctx.ellipse(0, 0, o.rx, o.ry, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }
      ctx.restore()

      // ── LAYER 3: Nucleus ───────────────────────────────────────────
      const pulse  = 1 + 0.06 * Math.sin(t * 0.04)
      const nBase  = 18 * pulse
      ctx.save()

      const halo = ctx.createRadialGradient(cx, cy, nBase * 0.6, cx, cy, nBase * 6)
      halo.addColorStop(0,   "rgba(77,184,255,0.12)")
      halo.addColorStop(0.4, "rgba(77,184,255,0.04)")
      halo.addColorStop(1,   "rgba(0,0,0,0)")
      ctx.beginPath(); ctx.arc(cx, cy, nBase * 6, 0, Math.PI * 2)
      ctx.fillStyle = halo; ctx.fill()

      ctx.shadowBlur  = 60; ctx.shadowColor = "#4db8ff"
      const mid = ctx.createRadialGradient(cx, cy, 0, cx, cy, nBase * 3.5)
      mid.addColorStop(0,   "rgba(160,220,255,0.35)")
      mid.addColorStop(0.5, "rgba(77,184,255,0.15)")
      mid.addColorStop(1,   "rgba(0,0,0,0)")
      ctx.beginPath(); ctx.arc(cx, cy, nBase * 3.5, 0, Math.PI * 2)
      ctx.fillStyle = mid; ctx.fill()

      ctx.shadowBlur  = 30; ctx.shadowColor = "#ffffff"
      const inner = ctx.createRadialGradient(cx, cy, 0, cx, cy, nBase)
      inner.addColorStop(0,   "rgba(255,255,255,1)")
      inner.addColorStop(0.3, "rgba(220,240,255,0.95)")
      inner.addColorStop(0.7, "rgba(100,190,255,0.6)")
      inner.addColorStop(1,   "rgba(77,184,255,0)")
      ctx.beginPath(); ctx.arc(cx, cy, nBase, 0, Math.PI * 2)
      ctx.fillStyle = inner; ctx.fill()

      ctx.shadowBlur  = 20; ctx.shadowColor = "#ffffff"
      const hot = ctx.createRadialGradient(cx, cy, 0, cx, cy, nBase * 0.45)
      hot.addColorStop(0, "rgba(255,255,255,1)")
      hot.addColorStop(1, "rgba(255,255,255,0)")
      ctx.beginPath(); ctx.arc(cx, cy, nBase * 0.45, 0, Math.PI * 2)
      ctx.fillStyle = hot; ctx.fill()

      ctx.restore()

      // ── LAYER 4: Electrons ─────────────────────────────────────────
      for (const o of orbits) {
        o.angle += o.speed
        const lx = o.rx * Math.cos(o.angle)
        const ly = o.ry * Math.sin(o.angle)
        const ex = cx + lx * Math.cos(o.tilt) - ly * Math.sin(o.tilt)
        const ey = cy + lx * Math.sin(o.tilt) + ly * Math.cos(o.tilt)

        o.trail.unshift({ x: ex, y: ey })
        if (o.trail.length > TRAIL_LEN) o.trail.pop()

        for (let i = 1; i < o.trail.length; i++) {
          const frac  = 1 - i / TRAIL_LEN
          const alpha = frac * frac * 0.6
          const r     = 3.5 * frac
          ctx.beginPath()
          ctx.arc(o.trail[i].x, o.trail[i].y, r, 0, Math.PI * 2)
          ctx.fillStyle = `${o.color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`
          ctx.fill()
        }

        ctx.save()
        ctx.shadowBlur  = 22; ctx.shadowColor = o.color
        const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 9)
        eg.addColorStop(0,   `${o.color}cc`)
        eg.addColorStop(0.5, `${o.color}55`)
        eg.addColorStop(1,   `${o.color}00`)
        ctx.beginPath(); ctx.arc(ex, ey, 9, 0, Math.PI * 2)
        ctx.fillStyle = eg; ctx.fill()
        ctx.beginPath(); ctx.arc(ex, ey, 3.5, 0, Math.PI * 2)
        ctx.fillStyle = "#ffffff"; ctx.fill()
        ctx.restore()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      canvas.removeEventListener("mousemove", onMove)
      canvas.removeEventListener("mouseleave", onLeave)
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
        zIndex: 1,
        pointerEvents: "all",
      }}
    />
  )
}
