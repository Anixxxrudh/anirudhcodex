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
  { text: "Somewhere, something incredible is waiting to be known.", author: "Carl Sagan" },
  { text: "Equipped with his five senses, man explores the universe around him.", author: "Edwin Hubble" },
  { text: "The nitrogen in our DNA, the calcium in our teeth — we are stardust.", author: "Carl Sagan" },
  { text: "Energy cannot be created or destroyed, only transformed.", author: "Lavoisier" },
  { text: "If you want to find the secrets of the universe, think in terms of energy.", author: "Tesla" },
  { text: "Black holes are where God divided by zero.", author: "Steven Wright" },
  { text: "The universe is not required to be in perfect harmony with human ambition.", author: "Carl Sagan" },
  { text: "Two things are infinite: the universe and human stupidity.", author: "Einstein" },
]

type Body = {
  el: HTMLDivElement | null
  x: number; y: number   // center
  vx: number; vy: number
  r: number              // collision radius
  w: number; h: number
}

export default function QuotesSection() {
  const [active, setActive] = useState(0)
  const [fading, setFading] = useState(false)
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const elRefs       = useRef<(HTMLDivElement | null)[]>([])
  const bodiesRef    = useRef<Body[]>([])
  const animRef      = useRef<number>(0)

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

  // ── Physics loop ───────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Wait one frame for elements to paint and get real dimensions
    const init = () => {
      const CW = container.offsetWidth
      const CH = container.offsetHeight

      bodiesRef.current = elRefs.current.map((el, i) => {
        if (!el) return null
        const w = el.offsetWidth
        const h = el.offsetHeight
        // Collision radius: just outside the pill shape
        const r = (w + h) / 4 + 6
        // Spread evenly with some determinism, avoid edges
        const angle = (i / FLOAT_QUOTES.length) * Math.PI * 2
        const spread = 0.3 + (i % 3) * 0.15
        const x = CW / 2 + Math.cos(angle) * CW * spread * 0.38
        const y = CH / 2 + Math.sin(angle) * CH * spread * 0.38
        const speed = 0.28 + (i % 5) * 0.06
        const vAngle = angle + Math.PI * 0.5 + (i % 2 === 0 ? 0.3 : -0.3)
        return { el, x, y, vx: Math.cos(vAngle) * speed, vy: Math.sin(vAngle) * speed, r, w, h }
      }).filter((b): b is Body => b !== null)

      // Run 60 separation steps so initial placement is clean
      for (let step = 0; step < 60; step++) separateBodies(bodiesRef.current, CW, CH)

      // Flush initial positions to DOM
      for (const b of bodiesRef.current) setPos(b)

      // Start animation
      cancelAnimationFrame(animRef.current)
      const tick = () => {
        const cw = container.offsetWidth
        const ch = container.offsetHeight
        const bods = bodiesRef.current

        for (const b of bods) { b.x += b.vx; b.y += b.vy }
        wallBounce(bods, cw, ch)
        collidePairs(bods)
        for (const b of bods) setPos(b)

        animRef.current = requestAnimationFrame(tick)
      }
      animRef.current = requestAnimationFrame(tick)
    }

    // Small delay so the browser has rendered the elements
    const t = setTimeout(init, 80)
    return () => { clearTimeout(t); cancelAnimationFrame(animRef.current) }
  }, [])

  return (
    <section className="quotes-section snap-section">
      {/* Main rotating quote */}
      <div className="quote-text" style={{ opacity: fading ? 0 : 1 }}>
        &ldquo;{QUOTES[active].text}&rdquo;
      </div>
      <div className="quote-author" style={{ opacity: fading ? 0 : 1, transition: "opacity 0.3s ease" }}>
        — {QUOTES[active].author}
      </div>
      <div className="quote-dots">
        {QUOTES.map((_, i) => (
          <button key={i} className={`quote-dot${active === i ? " active" : ""}`}
            onClick={() => goTo(i)} aria-label={`Quote ${i + 1}`} />
        ))}
      </div>

      {/* Physics field */}
      <div ref={containerRef} className="quotes-float-field" aria-hidden="true">
        {FLOAT_QUOTES.map((q, i) => (
          <div
            key={i}
            ref={(el) => { elRefs.current[i] = el }}
            className="quote-floater"
          >
            <span className="qf-text">&ldquo;{q.text}&rdquo;</span>
            <span className="qf-author">— {q.author}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function setPos(b: Body) {
  if (b.el) b.el.style.transform = `translate(${b.x - b.w / 2}px, ${b.y - b.h / 2}px)`
}

function wallBounce(bods: Body[], cw: number, ch: number) {
  for (const b of bods) {
    if (b.x - b.r < 0)    { b.x = b.r;      b.vx =  Math.abs(b.vx) }
    if (b.x + b.r > cw)   { b.x = cw - b.r; b.vx = -Math.abs(b.vx) }
    if (b.y - b.r < 0)    { b.y = b.r;      b.vy =  Math.abs(b.vy) }
    if (b.y + b.r > ch)   { b.y = ch - b.r; b.vy = -Math.abs(b.vy) }
  }
}

function collidePairs(bods: Body[]) {
  for (let i = 0; i < bods.length; i++) {
    for (let j = i + 1; j < bods.length; j++) {
      const a = bods[i], b = bods[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.hypot(dx, dy) || 0.001
      const minD = a.r + b.r
      if (dist >= minD) continue

      // Push apart
      const nx = dx / dist, ny = dy / dist
      const overlap = (minD - dist) / 2
      a.x -= nx * overlap; a.y -= ny * overlap
      b.x += nx * overlap; b.y += ny * overlap

      // Elastic velocity exchange along collision normal
      const dvx = a.vx - b.vx, dvy = a.vy - b.vy
      const dot = dvx * nx + dvy * ny
      if (dot > 0) {
        a.vx -= dot * nx; a.vy -= dot * ny
        b.vx += dot * nx; b.vy += dot * ny
      }
    }
  }
}

function separateBodies(bods: Body[], cw: number, ch: number) {
  wallBounce(bods, cw, ch)
  collidePairs(bods)
}
