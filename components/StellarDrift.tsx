"use client"
import { useRef, useEffect } from "react"

// ── Props ──────────────────────────────────────────────────────────────────────
interface StellarDriftProps {
  shootingStars?: boolean   // default true
  scrollParallax?: boolean  // default true
  driftSpeed?: number       // multiplier 0.5–2.0, default 1.0
  paused?: boolean
  className?: string
}

// ── Mulberry32 PRNG ────────────────────────────────────────────────────────────
function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6D2B79F5) >>> 0
    let z = Math.imul(s ^ (s >>> 15), 1 | s)
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296
  }
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface Star {
  x: number; y: number        // pixel coords, mutated each frame
  vx: number; vy: number      // pixels/frame
  r: number                   // radius px
  baseOp: number              // base opacity
  fadePeriod: number          // frames per fade cycle
  fadePhase: number           // initial phase offset
  cr: number; cg: number; cb: number
  hasGlow: boolean
  hasDiffraction: boolean
  spikeLen: number            // 0 if no diffraction
  wobbleAmp: number           // 0 unless layer 1
  wobblePeriod: number        // frames, 0 if unused
  layer: 1 | 2 | 3
}

interface ShootingStar {
  x: number; y: number
  vx: number; vy: number
  trailLen: number
}

// ── Color palettes ─────────────────────────────────────────────────────────────
const L1_COLS: [number, number, number][] = [
  [255, 255, 255],   // white
  [176, 200, 255],   // #b0c8ff cool blue
]
const L2_COLS: [number, number, number][] = [
  [255, 255, 255],   // white
  [77,  184, 255],   // #4db8ff
  [255, 248, 220],   // #fff8dc warm
]
const L3_COLS: [number, number, number][] = [
  [255, 255, 255],   // white
  [0,   229, 255],   // #00e5ff
  [201, 168, 76],    // #C9A84C gold
]

// ── Component ──────────────────────────────────────────────────────────────────
export default function StellarDrift({
  shootingStars  = true,
  scrollParallax = true,
  driftSpeed     = 1.0,
  paused         = false,
  className,
}: StellarDriftProps) {
  const canvasRef        = useRef<HTMLCanvasElement>(null)
  const l1Ref            = useRef<Star[]>([])
  const l2Ref            = useRef<Star[]>([])
  const l3Ref            = useRef<Star[]>([])
  const ssRef            = useRef<ShootingStar[]>([])
  const timeRef          = useRef(0)
  const rawScrollRef     = useRef(0)
  const lerpScrollRef    = useRef(0)
  const nextShootRef     = useRef(300)
  const pausedRef        = useRef(paused)
  const animRef          = useRef<number>(0)

  useEffect(() => { pausedRef.current = paused }, [paused])

  // ── Generate all star data once on mount ─────────────────────────────────
  useEffect(() => {
    const W      = window.innerWidth
    const H      = window.innerHeight
    const mobile = W < 640
    const sc     = mobile ? 0.5 : 1.0
    const rng    = mulberry32(0xc0dec0de)
    const pick   = (cols: [number, number, number][]) =>
      cols[Math.floor(rng() * cols.length)]

    // Layer 1 — Far field
    l1Ref.current = Array.from({ length: Math.round(800 * sc) }, () => {
      const [cr, cg, cb] = pick(L1_COLS)
      return {
        x: rng() * W, y: rng() * H,
        vx: 0.008 + rng() * 0.012, vy: 0,
        r:       0.3 + rng() * 0.5,
        baseOp:  0.2 + rng() * 0.3,
        fadePeriod: (4 + rng() * 4) * 60,    // 4–8 s × 60 fps
        fadePhase:   rng() * Math.PI * 2,
        cr, cg, cb,
        hasGlow: false, hasDiffraction: false, spikeLen: 0,
        wobbleAmp: 0.3,
        wobblePeriod: (12 + rng() * 8) * 60, // 12–20 s
        layer: 1,
      }
    })

    // Layer 2 — Mid field
    l2Ref.current = Array.from({ length: Math.round(400 * sc) }, () => {
      const [cr, cg, cb] = pick(L2_COLS)
      return {
        x: rng() * W, y: rng() * H,
        vx: 0.025 + rng() * 0.035,
        vy: 0.005 + rng() * 0.005,           // slight diagonal drift
        r:       0.6 + rng() * 0.8,
        baseOp:  0.4 + rng() * 0.35,
        fadePeriod: (2 + rng() * 3) * 60,    // 2–5 s
        fadePhase:   rng() * Math.PI * 2,
        cr, cg, cb,
        hasGlow: rng() < 0.05, hasDiffraction: false, spikeLen: 0,
        wobbleAmp: 0, wobblePeriod: 0,
        layer: 2,
      }
    })

    // Layer 3 — Near field
    l3Ref.current = Array.from({ length: Math.round(150 * sc) }, () => {
      const [cr, cg, cb] = pick(L3_COLS)
      const hasDiffraction = !mobile && rng() < 0.20
      return {
        x: rng() * W, y: rng() * H,
        vx: 0.07 + rng() * 0.08, vy: 0,
        r:       1.2 + rng() * 1.6,
        baseOp:  0.6 + rng() * 0.3,
        fadePeriod: (1 + rng() * 2) * 60,    // 1–3 s
        fadePhase:   rng() * Math.PI * 2,
        cr, cg, cb,
        hasGlow: false, hasDiffraction,
        spikeLen: hasDiffraction ? 6 + rng() * 8 : 0,
        wobbleAmp: 0, wobblePeriod: 0,
        layer: 3,
      }
    })

    nextShootRef.current = 240 + Math.floor(rng() * 240)
  }, [])

  // ── RAF draw loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()

    const onScroll = () => { rawScrollRef.current = window.scrollY }
    window.addEventListener("resize",  resize)
    window.addEventListener("scroll",  onScroll, { passive: true })

    // ── Star draw helper ────────────────────────────────────────────────────
    const drawStar = (
      s: Star,
      W: number, H: number,
      t: number,
      parallaxOff: number,   // pixels to add to y from scroll
      randomYOnRightWrap: boolean,
    ) => {
      // Drift position
      s.x += s.vx * driftSpeed
      s.y += s.vy * driftSpeed

      // Edge wrapping
      if (s.x > W) { s.x = 0;  if (randomYOnRightWrap) s.y = Math.random() * H }
      if (s.x < 0)  s.x = W
      if (s.y > H)  s.y = 0
      if (s.y < 0)  s.y = H

      // Draw coords — wobble + parallax applied only at render time
      const wobbleY = s.wobbleAmp > 0
        ? s.wobbleAmp * Math.sin(t / s.wobblePeriod + s.fadePhase)
        : 0
      const dx = s.x
      const dy = ((s.y + wobbleY + parallaxOff) % H + H) % H

      // Fade opacity — never below 0.08
      const op = Math.max(0.08,
        s.baseOp * (0.6 + 0.4 * Math.sin(s.fadePhase + t / s.fadePeriod))
      )

      // Soft glow halo (L2 5%)
      if (s.hasGlow) {
        const g = ctx.createRadialGradient(dx, dy, 0, dx, dy, 4)
        g.addColorStop(0, `rgba(${s.cr},${s.cg},${s.cb},${op * 0.45})`)
        g.addColorStop(1, `rgba(${s.cr},${s.cg},${s.cb},0)`)
        ctx.beginPath(); ctx.arc(dx, dy, 4, 0, Math.PI * 2)
        ctx.fillStyle = g; ctx.fill()
      }

      // Core dot
      ctx.beginPath(); ctx.arc(dx, dy, Math.max(0.3, s.r), 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${s.cr},${s.cg},${s.cb},${op})`
      ctx.fill()

      // 4-point diffraction spikes (L3 20%)
      if (s.hasDiffraction) {
        const sl = s.spikeLen
        const sa = op * 0.55
        const axes: [number, number, number, number][] = [
          [dx - sl, dy,      dx + sl, dy     ],
          [dx,      dy - sl, dx,      dy + sl],
        ]
        for (const [x1, y1, x2, y2] of axes) {
          const sg = ctx.createLinearGradient(x1, y1, x2, y2)
          sg.addColorStop(0,   `rgba(${s.cr},${s.cg},${s.cb},0)`)
          sg.addColorStop(0.5, `rgba(${s.cr},${s.cg},${s.cb},${sa})`)
          sg.addColorStop(1,   `rgba(${s.cr},${s.cg},${s.cb},0)`)
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
          ctx.strokeStyle = sg; ctx.lineWidth = 0.8; ctx.stroke()
        }
      }
    }

    // ── Main tick ───────────────────────────────────────────────────────────
    const tick = () => {
      animRef.current = requestAnimationFrame(tick)

      // Page Visibility API — skip if hidden
      if (document.hidden || pausedRef.current) return

      const W = canvas.width, H = canvas.height
      timeRef.current++
      const t = timeRef.current

      // Smooth scroll
      lerpScrollRef.current += (rawScrollRef.current - lerpScrollRef.current) * 0.08
      const mobile = window.innerWidth < 640
      const ls = scrollParallax && !mobile ? lerpScrollRef.current : 0

      ctx.clearRect(0, 0, W, H)

      // Draw star layers (back to front)
      for (const s of l1Ref.current) drawStar(s, W, H, t, ls * 0.015, false)
      for (const s of l2Ref.current) drawStar(s, W, H, t, ls * 0.035, false)
      for (const s of l3Ref.current) drawStar(s, W, H, t, ls * 0.07,  true)

      // ── Shooting stars ────────────────────────────────────────────────────
      if (shootingStars) {
        nextShootRef.current--
        if (nextShootRef.current <= 0 && ssRef.current.length < 2) {
          const speed    = 8 + Math.random() * 8                  // 8–16 px/f
          const angleDeg = 20 + Math.random() * 20                // 20–40°
          const rad      = (angleDeg * Math.PI) / 180
          const trailLen = 80 + Math.random() * 60                // 80–140 px
          // Spawn along top or left edge
          const fromTop = Math.random() < 0.5
          ssRef.current.push({
            x: fromTop ? Math.random() * W       : -trailLen,
            y: fromTop ? -trailLen               : Math.random() * H * 0.65,
            vx: Math.cos(rad) * speed,
            vy: Math.sin(rad) * speed,
            trailLen,
          })
          nextShootRef.current = 240 + Math.floor(Math.random() * 240) // 4–8 s
        }

        ssRef.current = ssRef.current.filter(ss => {
          ss.x += ss.vx; ss.y += ss.vy
          if (ss.x > W + 100 || ss.y > H + 100) return false

          // Gradient trail
          const ang = Math.atan2(ss.vy, ss.vx)
          const tx = ss.x - Math.cos(ang) * ss.trailLen
          const ty = ss.y - Math.sin(ang) * ss.trailLen
          const tg  = ctx.createLinearGradient(tx, ty, ss.x, ss.y)
          tg.addColorStop(0,    "rgba(255,255,255,0)")
          tg.addColorStop(0.65, "rgba(255,255,255,0.38)")
          tg.addColorStop(1,    "rgba(255,255,255,0.9)")
          ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(ss.x, ss.y)
          ctx.strokeStyle = tg; ctx.lineWidth = 1.5; ctx.stroke()

          // Bright tip
          ctx.beginPath(); ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fill()
          return true
        })
      }
    }

    animRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener("resize", resize)
      window.removeEventListener("scroll", onScroll)
    }
  }, [shootingStars, scrollParallax, driftSpeed])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        width:         "100vw",
        height:        "100vh",
        zIndex:        0,
        pointerEvents: "none",
        display:       "block",
      }}
    />
  )
}
