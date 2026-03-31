"use client"
import { useEffect, useRef, useState } from "react"

// ── Data ──────────────────────────────────────────────────────────────────────

interface FQ { text: string; author: string; bio: string; size: number }

const ALL_FLOAT_QUOTES: FQ[] = [
  { text: "The cosmos is within us. We are made of star-stuff.", author: "Carl Sagan", bio: "Astronomer, author of Cosmos, and science communicator who brought the universe to millions.", size: 1.35 },
  { text: "Somewhere, something incredible is waiting to be known.", author: "Carl Sagan", bio: "Astronomer, author of Cosmos, and science communicator who brought the universe to millions.", size: 1.2 },
  { text: "We are a way for the cosmos to know itself.", author: "Carl Sagan", bio: "Astronomer, author of Cosmos, and science communicator who brought the universe to millions.", size: 1.1 },
  { text: "Science is a way of thinking much more than it is a body of knowledge.", author: "Carl Sagan", bio: "Astronomer, author of Cosmos, and science communicator who brought the universe to millions.", size: 1.0 },
  { text: "The important thing is to not stop questioning.", author: "Albert Einstein", bio: "Theoretical physicist. Special & General Relativity, E=mc², Nobel Prize 1921.", size: 1.3 },
  { text: "Imagination is more important than knowledge.", author: "Albert Einstein", bio: "Theoretical physicist. Special & General Relativity, E=mc², Nobel Prize 1921.", size: 1.4 },
  { text: "Two things are infinite: the universe and human stupidity.", author: "Albert Einstein", bio: "Theoretical physicist. Special & General Relativity, E=mc², Nobel Prize 1921.", size: 1.15 },
  { text: "Look up at the stars and not down at your feet.", author: "Stephen Hawking", bio: "Theoretical physicist, cosmologist. Author of A Brief History of Time.", size: 1.3 },
  { text: "Black holes are where God divided by zero.", author: "Stephen Hawking", bio: "Theoretical physicist, cosmologist. Author of A Brief History of Time.", size: 1.1 },
  { text: "The universe is under no obligation to make sense to you.", author: "Neil deGrasse Tyson", bio: "Astrophysicist and director of the Hayden Planetarium. Host of StarTalk.", size: 1.2 },
  { text: "The good thing about science is that it's true whether or not you believe in it.", author: "Neil deGrasse Tyson", bio: "Astrophysicist and director of the Hayden Planetarium. Host of StarTalk.", size: 1.1 },
  { text: "Not only is the universe stranger than we think, it is stranger than we can think.", author: "Werner Heisenberg", bio: "Pioneer of quantum mechanics. Formulated the uncertainty principle.", size: 1.15 },
  { text: "If you want to find the secrets of the universe, think in terms of energy.", author: "Nikola Tesla", bio: "Inventor and engineer who developed AC electricity systems.", size: 1.1 },
  { text: "The nitrogen in our DNA, the calcium in our teeth — we are stardust.", author: "Carl Sagan", bio: "Astronomer, author of Cosmos, and science communicator who brought the universe to millions.", size: 0.95 },
  { text: "Physics is the only real science. The rest are just stamp collecting.", author: "Ernest Rutherford", bio: "Physicist who discovered the nucleus of the atom. Nobel Prize 1908.", size: 1.0 },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", bio: "Theoretical physicist. Special & General Relativity, E=mc², Nobel Prize 1921.", size: 0.9 },
  { text: "Equipped with his five senses, man explores the universe around him.", author: "Edwin Hubble", bio: "Astronomer who proved galaxies exist beyond the Milky Way. Hubble's Law.", size: 1.0 },
  { text: "Energy cannot be created or destroyed, only transformed.", author: "Antoine Lavoisier", bio: "Father of modern chemistry. Conservation of mass.", size: 0.9 },
]

// Extra quotes that spawn in every 30s
const SPAWN_POOL: FQ[] = [
  { text: "The electron is not as simple as it looks.", author: "W.L. Bragg", bio: "Physicist, Nobel Prize 1915 for X-ray crystallography.", size: 0.9 },
  { text: "An experiment is a question which science poses to Nature.", author: "Max Planck", bio: "Originator of quantum theory. Nobel Prize 1918.", size: 1.0 },
  { text: "Everything existing in the universe is the fruit of chance and necessity.", author: "Democritus", bio: "Ancient Greek philosopher who proposed the concept of atoms.", size: 0.9 },
  { text: "The most exciting phrase in science is not Eureka! but That's funny…", author: "Isaac Asimov", bio: "Prolific science fiction author and biochemistry professor.", size: 1.0 },
]

const UNIQUE_AUTHORS = [...new Set(ALL_FLOAT_QUOTES.map(q => q.author))].sort()

// Color per author — consistent across renders
const AUTHOR_COLORS: Record<string, string> = {
  "Albert Einstein":    "#f0c040",
  "Carl Sagan":         "#4db8ff",
  "Stephen Hawking":    "#b87aff",
  "Neil deGrasse Tyson":"#40e0d0",
  "Werner Heisenberg":  "#ff6eb4",
  "Nikola Tesla":       "#ff8c42",
  "Ernest Rutherford":  "#7ed957",
  "Edwin Hubble":       "#5fd4f4",
  "Antoine Lavoisier":  "#ffcc66",
}
const authorColor = (a: string) => AUTHOR_COLORS[a] ?? "#aaa"
const authorInitials = (a: string) => a.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

// ── Types ─────────────────────────────────────────────────────────────────────

type Body = {
  el: HTMLDivElement | null
  x: number; y: number; vx: number; vy: number
  r: number; w: number; h: number
  trail: { x: number; y: number }[]
  spawning: number   // 0→1 birth animation
  idx: number        // index into allQuotesRef
}

interface Star { x: number; y: number; vx: number; vy: number; alpha: number; decay: number }

// ── Physics helpers ───────────────────────────────────────────────────────────

function setPos(b: Body) {
  if (!b.el) return
  const s = Math.min(b.spawning, 1)
  b.el.style.transform = `translate(${b.x - b.w / 2}px, ${b.y - b.h / 2}px) scale(${s})`
  b.el.style.opacity = String(s)
}

function wallBounce(bods: Body[], cw: number, ch: number) {
  for (const b of bods) {
    if (b.x - b.r < 0)   { b.x = b.r;      b.vx =  Math.abs(b.vx) }
    if (b.x + b.r > cw)  { b.x = cw - b.r; b.vx = -Math.abs(b.vx) }
    if (b.y - b.r < 0)   { b.y = b.r;      b.vy =  Math.abs(b.vy) }
    if (b.y + b.r > ch)  { b.y = ch - b.r; b.vy = -Math.abs(b.vy) }
  }
}

function collidePairs(bods: Body[]) {
  for (let i = 0; i < bods.length; i++) {
    for (let j = i + 1; j < bods.length; j++) {
      const a = bods[i], b = bods[j]
      if (a.spawning < 0.5 || b.spawning < 0.5) continue
      const dx = b.x - a.x, dy = b.y - a.y
      const dist = Math.hypot(dx, dy) || 0.001
      const minD = a.r + b.r
      if (dist >= minD) continue
      const nx = dx / dist, ny = dy / dist
      const ov = (minD - dist) / 2
      a.x -= nx * ov; a.y -= ny * ov
      b.x += nx * ov; b.y += ny * ov
      const dvx = a.vx - b.vx, dvy = a.vy - b.vy
      const dot = dvx * nx + dvy * ny
      if (dot > 0) {
        a.vx -= dot * nx; a.vy -= dot * ny
        b.vx += dot * nx; b.vy += dot * ny
      }
    }
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function QuotesSection() {
  const [expanded, setExpanded] = useState<FQ | null>(null)
  const [filter,     setFilter]     = useState<string | null>(null)
  const [allQuotes,  setAllQuotes]  = useState<FQ[]>(ALL_FLOAT_QUOTES)

  const containerRef = useRef<HTMLDivElement>(null)
  const elRefs       = useRef<(HTMLDivElement | null)[]>([])
  const bodiesRef    = useRef<Body[]>([])
  const animRef      = useRef<number>(0)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const filterRef    = useRef<string | null>(null)
  const hoveredRef   = useRef<string | null>(null)
  const starsRef     = useRef<Star[]>([])
  const lastStarRef  = useRef<number>(0)
  const spawnIdxRef  = useRef<number>(0)
  const dragRef      = useRef<{
    bi: number; ox: number; oy: number
    lx: number; ly: number; lvx: number; lvy: number; moved: boolean
  } | null>(null)

  // Sync refs
  useEffect(() => { filterRef.current = filter }, [filter])


  // ── Physics + canvas loop ────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    const canvas    = canvasRef.current
    if (!container || !canvas) return

    const init = () => {
      const CW = container.offsetWidth
      const CH = container.offsetHeight
      canvas.width  = CW
      canvas.height = CH

      bodiesRef.current = elRefs.current.map((el, i) => {
        if (!el) return null
        const w = el.offsetWidth, h = el.offsetHeight
        const q = allQuotes[i]
        const r = (w + h) / 4 + 6
        const angle = (i / allQuotes.length) * Math.PI * 2
        const spread = 0.28 + (i % 4) * 0.09
        return {
          el, w, h, r, trail: [] as { x: number; y: number }[],
          x:  CW / 2 + Math.cos(angle) * CW * spread * 0.38,
          y:  CH / 2 + Math.sin(angle) * CH * spread * 0.38,
          vx: Math.cos(angle + Math.PI / 2) * (0.28 + (i % 5) * 0.055),
          vy: Math.sin(angle + Math.PI / 2) * (0.28 + (i % 5) * 0.055),
          spawning: 1,
          idx: i,
        }
      }).filter((b): b is Body => b !== null)

      // Settle
      for (let s = 0; s < 80; s++) { wallBounce(bodiesRef.current, CW, CH); collidePairs(bodiesRef.current) }
      bodiesRef.current.forEach(setPos)

      cancelAnimationFrame(animRef.current)
      const ctx = canvas.getContext("2d")!
      let frame = 0

      const tick = (now: number) => {
        const cw = container.offsetWidth
        const ch = container.offsetHeight
        if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch }
        const bods = bodiesRef.current

        // Update spawning
        for (const b of bods) if (b.spawning < 1) b.spawning = Math.min(1, b.spawning + 0.025)

        // Move (skip dragged)
        const dragged = dragRef.current?.bi ?? -1
        for (let i = 0; i < bods.length; i++) {
          if (i === dragged) continue
          bods[i].x += bods[i].vx
          bods[i].y += bods[i].vy
        }

        wallBounce(bods, cw, ch)
        collidePairs(bods)

        // Trails
        frame++
        if (frame % 3 === 0) {
          for (const b of bods) {
            if (b.spawning < 1) continue
            b.trail.push({ x: b.x, y: b.y })
            if (b.trail.length > 10) b.trail.shift()
          }
        }

        // Update filter opacity
        const f = filterRef.current
        for (const b of bods) {
          if (!b.el) continue
          const q = allQuotes[b.idx]
          const matched = !f || q?.author === f
          b.el.style.filter = matched ? "" : "opacity(0.18)"
        }

        // ── Canvas draw ──
        ctx.clearRect(0, 0, cw, ch)

        // Trails
        for (const b of bods) {
          if (b.trail.length < 2 || b.spawning < 1) continue
          const q = allQuotes[b.idx]
          const dimmed = f && q?.author !== f
          for (let i = 1; i < b.trail.length; i++) {
            const a = (i / b.trail.length) * (dimmed ? 0.04 : 0.13)
            ctx.beginPath()
            ctx.moveTo(b.trail[i - 1].x, b.trail[i - 1].y)
            ctx.lineTo(b.trail[i].x, b.trail[i].y)
            ctx.strokeStyle = `rgba(120,200,255,${a})`
            ctx.lineWidth = (i / b.trail.length) * 3
            ctx.stroke()
          }
        }

        // Author connection lines on hover
        const ha = hoveredRef.current
        if (ha) {
          const peers = bods.filter(b => allQuotes[b.idx]?.author === ha && b.spawning >= 1)
          for (let i = 0; i < peers.length; i++) {
            for (let j = i + 1; j < peers.length; j++) {
              const a = peers[i], b = peers[j]
              const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
              grad.addColorStop(0, "rgba(77,184,255,0.55)")
              grad.addColorStop(1, "rgba(160,100,255,0.55)")
              ctx.beginPath()
              ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
              ctx.strokeStyle = grad; ctx.lineWidth = 0.8
              ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([])
            }
          }
        }

        // Shooting stars
        if (now - lastStarRef.current > 11000 + Math.random() * 8000) {
          lastStarRef.current = now
          // Always left-to-right at shallow angle
          const yStart = ch * (0.05 + Math.random() * 0.6)
          starsRef.current.push({
            x: -20,
            y: yStart,
            vx: 3.5 + Math.random() * 2.5,
            vy: 0.6 + Math.random() * 0.8,
            alpha: 0.42, decay: 0.006 + Math.random() * 0.005,
          })
        }
        starsRef.current = starsRef.current.filter(s => s.alpha > 0 && s.x < cw + 80)
        for (const s of starsRef.current) {
          s.x += s.vx; s.y += s.vy; s.alpha -= s.decay
          const spd = Math.hypot(s.vx, s.vy)
          const tailLen = 55 + spd * 14
          const ang = Math.atan2(s.vy, s.vx)
          const tx = s.x - Math.cos(ang) * tailLen
          const ty = s.y - Math.sin(ang) * tailLen
          const sg = ctx.createLinearGradient(tx, ty, s.x, s.y)
          sg.addColorStop(0,    "rgba(255,255,255,0)")
          sg.addColorStop(0.55, `rgba(210,228,255,${s.alpha * 0.18})`)
          sg.addColorStop(0.85, `rgba(230,242,255,${s.alpha * 0.55})`)
          sg.addColorStop(1,    `rgba(255,255,255,${s.alpha * 0.72})`)
          ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(s.x, s.y)
          ctx.strokeStyle = sg; ctx.lineWidth = 0.85; ctx.stroke()
          // Tiny soft head glow only
          const hg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 2.5)
          hg.addColorStop(0, `rgba(255,255,255,${s.alpha * 0.65})`)
          hg.addColorStop(1, "rgba(255,255,255,0)")
          ctx.beginPath(); ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = hg; ctx.fill()
        }

        bods.forEach(setPos)
        animRef.current = requestAnimationFrame(tick)
      }

      animRef.current = requestAnimationFrame(tick)
    }

    const t = setTimeout(init, 80)
    return () => { clearTimeout(t); cancelAnimationFrame(animRef.current) }
  }, [allQuotes])  // re-init when quotes list grows

  // ── Spawn new quotes every 30s ─────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      if (spawnIdxRef.current >= SPAWN_POOL.length) return
      const q = SPAWN_POOL[spawnIdxRef.current++]
      setAllQuotes(prev => [...prev, q])
    }, 30000)
    return () => clearInterval(t)
  }, [])

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>, bi: number) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { bi, ox: e.clientX, oy: e.clientY, lx: e.clientX, ly: e.clientY, lvx: 0, lvy: 0, moved: false }
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current
    if (!d) return
    const dx = e.clientX - d.lx, dy = e.clientY - d.ly
    if (Math.hypot(e.clientX - d.ox, e.clientY - d.oy) > 6) d.moved = true
    const b = bodiesRef.current[d.bi]
    if (b) { b.x += dx; b.y += dy }
    d.lvx = dx; d.lvy = dy; d.lx = e.clientX; d.ly = e.clientY
  }
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>, bi: number, q: FQ) => {
    const d = dragRef.current
    dragRef.current = null
    if (!d) return
    const b = bodiesRef.current[bi]
    if (b) {
      // Apply throw velocity, cap speed
      const spd = Math.hypot(d.lvx, d.lvy)
      const cap = 4
      const sc = spd > cap ? cap / spd : 1
      b.vx = d.lvx * sc; b.vy = d.lvy * sc
    }
    if (!d.moved) setExpanded(q)
  }

  return (
    <section className="quotes-section snap-section">

      {/* Scientist selector */}
      <div className="sci-selector">
        <div className="section-eyebrow" style={{ marginBottom: 16 }}>Voices of Science</div>
        <div className="sci-nodes">
          {/* All button */}
          <button
            className={`sci-node${!filter ? " sci-node--active" : ""}`}
            onClick={() => setFilter(null)}
            style={{ ["--sci-color" as string]: "rgba(255,255,255,0.7)" }}
          >
            <span className="sci-orb">✦</span>
            <span className="sci-name">All</span>
          </button>

          {UNIQUE_AUTHORS.map(a => {
            const count = allQuotes.filter(q => q.author === a).length
            const color = authorColor(a)
            const active = filter === a
            const orbSize = 28 + count * 4
            return (
              <button
                key={a}
                className={`sci-node${active ? " sci-node--active" : ""}`}
                onClick={() => setFilter(f => f === a ? null : a)}
                style={{ ["--sci-color" as string]: color }}
              >
                <span
                  className="sci-orb"
                  style={{
                    width: orbSize, height: orbSize,
                    fontSize: orbSize * 0.36,
                    background: `radial-gradient(circle at 35% 35%, ${color}33, ${color}11)`,
                    borderColor: active ? color : `${color}55`,
                    boxShadow: active
                      ? `0 0 16px ${color}88, 0 0 6px ${color}55, inset 0 1px 0 ${color}33`
                      : `0 0 8px ${color}33`,
                    color,
                  }}
                >
                  {authorInitials(a)}
                </span>
                <span className="sci-name" style={{ color: active ? color : undefined }}>{a.split(" ").slice(-1)[0]}</span>
                <span className="sci-count">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Physics field */}
      <div ref={containerRef} className="quotes-float-field" aria-hidden="true">
        <canvas ref={canvasRef} className="qf-canvas" />
        {allQuotes.map((fq, i) => (
          <div
            key={i}
            ref={el => { elRefs.current[i] = el }}
            className="quote-floater"
            style={{ fontSize: `${fq.size * 0.72}rem` }}
            onPointerDown={e => onPointerDown(e, i)}
            onPointerMove={onPointerMove}
            onPointerUp={e => onPointerUp(e, i, fq)}
            onMouseEnter={() => { hoveredRef.current = fq.author }}
            onMouseLeave={() => { hoveredRef.current = null }}
            aria-hidden="false"
          >
            <span className="qf-text">&ldquo;{fq.text}&rdquo;</span>
            <span className="qf-author">— {fq.author}</span>
          </div>
        ))}
      </div>

      {/* Expanded modal */}
      {expanded && (
        <div className="qe-overlay" onClick={() => setExpanded(null)}>
          <div className="qe-modal" onClick={e => e.stopPropagation()}>
            <button className="qe-close" onClick={() => setExpanded(null)}>✕</button>
            <div className="qe-quote">&ldquo;{expanded.text}&rdquo;</div>
            <div className="qe-author">— {expanded.author}</div>
            <p className="qe-bio">{expanded.bio}</p>
          </div>
        </div>
      )}
    </section>
  )
}
