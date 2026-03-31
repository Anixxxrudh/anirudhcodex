"use client"
import { useEffect, useRef, useState } from "react"

const QUOTES = [
  {
    text: "The most beautiful thing we can experience is the mysterious. It is the source of all true art and science.",
    author: "Albert Einstein",
  },
  {
    text: "Research is to see what everybody else has seen, and to think what nobody else has thought.",
    author: "Albert Szent-Györgyi",
  },
  {
    text: "An investment in knowledge pays the best interest.",
    author: "Benjamin Franklin",
  },
]

const FLOAT_QUOTES = [
  { text: "The cosmos is within us. We are made of star-stuff.", author: "Carl Sagan" },
  { text: "Not only is the universe stranger than we think, it is stranger than we can think.", author: "Heisenberg" },
  { text: "Physics is the only real science. The rest are just stamp collecting.", author: "Rutherford" },
  { text: "The important thing is to not stop questioning.", author: "Einstein" },
  { text: "In the middle of difficulty lies opportunity.", author: "Einstein" },
  { text: "Look up at the stars and not down at your feet.", author: "Hawking" },
  { text: "The universe is under no obligation to make sense to you.", author: "Neil deGrasse Tyson" },
  { text: "We are a way for the cosmos to know itself.", author: "Carl Sagan" },
  { text: "Science is a way of thinking much more than it is a body of knowledge.", author: "Carl Sagan" },
  { text: "The good thing about science is that it's true whether or not you believe in it.", author: "Neil deGrasse Tyson" },
]

function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

type FloatItem = {
  id: number; text: string; author: string
  x: number; y: number; rot: number
  dur: number; delay: number; driftX: number; driftY: number
  opacity: number; fontSize: number
}

// ── Wormhole canvas ───────────────────────────────────────────────────────────
function useWormhole(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    let animId: number
    let t = 0

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = () => {
      const W = canvas.width, H = canvas.height
      const cx = W / 2, cy = H / 2
      const rx = W / 2 - 2, ry = H / 2 - 2

      ctx.clearRect(0, 0, W, H)
      ctx.save()

      // Clip to ellipse
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.clip()

      // ── Deep space background ──
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry))
      bg.addColorStop(0,    "rgb(0,0,12)")
      bg.addColorStop(0.35, "rgb(0,3,20)")
      bg.addColorStop(0.70, "rgb(2,8,36)")
      bg.addColorStop(1,    "rgb(8,18,55)")
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // ── Convergence radial rays ──
      const numRays = 32
      for (let i = 0; i < numRays; i++) {
        const ang = (i / numRays) * Math.PI * 2 + t * 0.018
        const x0 = cx + Math.cos(ang) * rx * 0.04
        const y0 = cy + Math.sin(ang) * ry * 0.04
        const x1 = cx + Math.cos(ang) * rx
        const y1 = cy + Math.sin(ang) * ry
        const grad = ctx.createLinearGradient(x0, y0, x1, y1)
        grad.addColorStop(0,   "rgba(77,184,255,0)")
        grad.addColorStop(0.4, "rgba(77,184,255,0.025)")
        grad.addColorStop(1,   "rgba(120,80,255,0.10)")
        ctx.beginPath()
        ctx.moveTo(x0, y0); ctx.lineTo(x1, y1)
        ctx.strokeStyle = grad
        ctx.lineWidth = 0.8
        ctx.stroke()
      }

      // ── Concentric tunnel rings ──
      const numRings = 16
      for (let i = 1; i <= numRings; i++) {
        const ratio   = i / numRings
        // Compress toward center using perspective — inner rings tighter
        const perspective = Math.pow(ratio, 1.6)
        const rX = rx * perspective
        const rY = ry * perspective
        // Each ring rotates at different speed; inner faster
        const spin = t * (0.4 / ratio) * 0.022
        // Warp: slightly non-circular via sin distortion
        const warp = 1 + Math.sin(t * 0.03 + i * 0.7) * 0.04

        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(spin)
        ctx.beginPath()
        ctx.ellipse(0, 0, rX * warp, rY / warp, 0, 0, Math.PI * 2)
        const alpha = (1 - ratio) * 0.18 + 0.03
        const blue  = Math.floor(180 + ratio * 75)
        ctx.strokeStyle = `rgba(60,${blue},255,${alpha})`
        ctx.lineWidth = ratio < 0.25 ? 1.5 : 0.7
        ctx.stroke()
        ctx.restore()
      }

      // ── Shimmer particles on ring edges ──
      for (let i = 0; i < 28; i++) {
        const ang = seededRand(i * 17) * Math.PI * 2 + t * (0.015 + seededRand(i * 5) * 0.02)
        const ring = 0.55 + seededRand(i * 11) * 0.4
        const px = cx + Math.cos(ang) * rx * ring
        const py = cy + Math.sin(ang) * ry * ring
        const flicker = 0.3 + Math.sin(t * 0.12 + i * 2.3) * 0.25
        ctx.beginPath()
        ctx.arc(px, py, 0.9, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(160,210,255,${flicker})`
        ctx.fill()
      }

      // ── Event horizon core glow ──
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx * 0.22)
      core.addColorStop(0,   "rgba(30,60,160,0.55)")
      core.addColorStop(0.5, "rgba(10,30,100,0.25)")
      core.addColorStop(1,   "rgba(0,0,0,0)")
      ctx.fillStyle = core
      ctx.fillRect(0, 0, W, H)

      // ── Outer rim glow (two passes for bloom) ──
      for (const [inner, outer, alpha] of [
        [0.86, 1.0,  0.45] as const,
        [0.92, 1.02, 0.25] as const,
      ]) {
        const rim = ctx.createRadialGradient(cx, cy, rx * inner, cx, cy, rx * outer)
        const pulse = 0.85 + 0.15 * Math.sin(t * 0.05)
        rim.addColorStop(0,   `rgba(77,184,255,${alpha * pulse})`)
        rim.addColorStop(0.5, `rgba(100,60,255,${alpha * 0.6 * pulse})`)
        rim.addColorStop(1,   "rgba(0,0,0,0)")
        ctx.fillStyle = rim
        ctx.fillRect(0, 0, W, H)
      }

      ctx.restore()

      // ── Outer rim stroke ──
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
      const rimStroke = ctx.createLinearGradient(0, 0, W, H)
      rimStroke.addColorStop(0,    "rgba(77,184,255,0.7)")
      rimStroke.addColorStop(0.35, "rgba(160,100,255,0.55)")
      rimStroke.addColorStop(0.65, "rgba(77,184,255,0.65)")
      rimStroke.addColorStop(1,    "rgba(100,50,255,0.5)")
      ctx.strokeStyle = rimStroke
      ctx.lineWidth = 1.8
      ctx.stroke()
      ctx.restore()

      t++
      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animId); ro.disconnect() }
  }, [canvasRef])
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function QuotesSection() {
  const [active, setActive] = useState(0)
  const [fading,  setFading]  = useState(false)
  const [floaters, setFloaters] = useState<FloatItem[]>([])
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)

  useWormhole(canvasRef)

  const goTo = (idx: number) => {
    if (idx === active) return
    setFading(true)
    setTimeout(() => { setActive(idx); setFading(false) }, 300)
  }

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setFading(true)
      setTimeout(() => { setActive((a) => (a + 1) % QUOTES.length); setFading(false) }, 300)
    }, 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    const items: FloatItem[] = FLOAT_QUOTES.map((q, i) => ({
      id: i,
      text: q.text,
      author: q.author,
      // Spread across the whole bubble area
      x: 5 + seededRand(i * 3) * 78,
      y: 5 + seededRand(i * 7) * 82,
      rot: (seededRand(i * 11) - 0.5) * 14,
      dur:   10 + seededRand(i * 5)  * 10,
      delay: -(seededRand(i * 13) * 12),
      driftX: (seededRand(i * 17) - 0.5) * 55,
      driftY: (seededRand(i * 19) - 0.5) * 38,
      opacity: 0.38 + seededRand(i * 23) * 0.30,
      fontSize: 0.82 + seededRand(i * 29) * 0.32,
    }))
    setFloaters(items)
  }, [])

  const q = QUOTES[active]

  return (
    <section className="quotes-section snap-section">

      {/* Main rotating quote */}
      <div className="quote-text" style={{ opacity: fading ? 0 : 1 }}>
        &ldquo;{q.text}&rdquo;
      </div>
      <div className="quote-author" style={{ opacity: fading ? 0 : 1, transition: "opacity 0.3s ease" }}>
        — {q.author}
      </div>
      <div className="quote-dots">
        {QUOTES.map((_, i) => (
          <button key={i} className={`quote-dot${active === i ? " active" : ""}`}
            onClick={() => goTo(i)} aria-label={`Quote ${i + 1}`} />
        ))}
      </div>

      {/* Wormhole bubble */}
      <div className="wormhole-bubble" aria-hidden="true">
        {/* Animated wormhole canvas */}
        <canvas ref={canvasRef} className="wormhole-canvas" />

        {/* Floating quotes inside the bubble */}
        <div className="quotes-float-field">
          {floaters.map((f) => (
            <div
              key={f.id}
              className="quote-floater"
              style={{
                left: `${f.x}%`,
                top:  `${f.y}%`,
                opacity: f.opacity,
                fontSize: `${f.fontSize}rem`,
                transform: `rotate(${f.rot}deg)`,
                animationDuration: `${f.dur}s`,
                animationDelay: `${f.delay}s`,
                ["--drift-x" as string]: `${f.driftX}px`,
                ["--drift-y" as string]: `${f.driftY}px`,
              }}
            >
              <span className="qf-text">&ldquo;{f.text}&rdquo;</span>
              <span className="qf-author">— {f.author}</span>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}
