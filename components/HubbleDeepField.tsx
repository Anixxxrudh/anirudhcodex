"use client"
import { useRef, useEffect } from "react"

interface HubbleDeepFieldProps {
  renderScale?: number
  rotationSpeed?: number
  starCount?: number
  galaxyCount?: number
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

// ── Spectral types ─────────────────────────────────────────────────────────────
type SpectralType = "O" | "B" | "A" | "G" | "K" | "M"

const SPECTRAL_RGB: Record<SpectralType, [number, number, number]> = {
  O: [150, 180, 255],
  B: [170, 195, 255],
  A: [220, 235, 255],
  G: [255, 248, 220],
  K: [255, 220, 160],
  M: [255, 160, 100],
}

const SPECTRAL_CDF: [SpectralType, number][] = [
  ["O", 0.001], ["B", 0.006], ["A", 0.066],
  ["G", 0.166], ["K", 0.296], ["M", 1.000],
]

function pickSpectral(u: number): SpectralType {
  for (const [t, c] of SPECTRAL_CDF) if (u < c) return t
  return "M"
}

// ── Interfaces ─────────────────────────────────────────────────────────────────
interface StarData {
  x: number; y: number
  brightness: number
  cr: number; cg: number; cb: number
  radiusNorm: number          // fraction of min(offW, offH)
  twinklePhase: number
  twinkleSpeed: number
  isDiffraction: boolean
}

interface GalaxyParticle {
  dx: number; dy: number
  brightness: number
  colorStr: string
}

type GalaxyType = "elliptical" | "spiral" | "irregular"

interface GalaxyData {
  x: number; y: number
  type: GalaxyType
  sizeNorm: number
  z: number
  angle: number
  rotSpeed: number
  axisRatio: number
  tiltAngle: number
  particles: GalaxyParticle[]
  baseAlpha: number
  coreStr: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function rshift(r: number, g: number, b: number, z: number): [number, number, number] {
  const sh = z * 0.65
  return [
    Math.min(255, Math.round(r + sh * 40)),
    Math.max(0,   Math.round(g * (1 - sh * 0.45))),
    Math.max(0,   Math.round(b * (1 - sh * 0.78))),
  ]
}

// ── Data builders ──────────────────────────────────────────────────────────────
function buildStars(count: number, rng: () => number): StarData[] {
  return Array.from({ length: count }, () => {
    const u = rng()
    const brightness = u * u * u
    const [cr, cg, cb] = SPECTRAL_RGB[pickSpectral(rng())]
    return {
      x: rng(), y: rng(), brightness, cr, cg, cb,
      radiusNorm: 0.0005 + brightness * 0.003,
      twinklePhase: rng() * Math.PI * 2,
      twinkleSpeed: 0.006 + rng() * 0.028,
      isDiffraction: u > 0.97,
    }
  })
}

function buildGalaxies(count: number, rng: () => number, rotSpeed: number): GalaxyData[] {
  const out: GalaxyData[] = []
  for (let i = 0; i < count; i++) {
    const z    = Math.pow(rng(), 0.65)
    const roll = rng()
    const type: GalaxyType = roll < 0.35 ? "elliptical" : roll < 0.70 ? "spiral" : "irregular"
    const sizeNorm = (0.009 + rng() * 0.033) * (1 - z * 0.78)
    const dir  = rng() < 0.5 ? 1 : -1
    const base: [number, number, number] =
      type === "elliptical" ? [255, 210, 150] :
      type === "spiral"     ? [255, 248, 200] : [200, 215, 255]
    const [cr, cg, cb] = rshift(...base, z)

    const particles: GalaxyParticle[] = []
    if (type === "spiral") {
      const arms = 2 + Math.floor(rng() * 3)
      for (let a = 0; a < arms; a++) {
        const offset = (a / arms) * Math.PI * 2
        for (let j = 1; j <= 55; j++) {
          const t = j / 55
          const dx = Math.cos(offset + t * Math.PI * 2.8) * (0.12 + t * 0.88)
                   + (rng() - 0.5) * (0.05 + t * 0.13)
          const dy = Math.sin(offset + t * Math.PI * 2.8) * (0.12 + t * 0.88)
                   + (rng() - 0.5) * (0.05 + t * 0.13) * 0.55
          const [pr, pg, pb] = rshift(188, 210, 255, z)
          particles.push({
            dx, dy,
            brightness: Math.pow(1 - t * 0.65, 1.6) * (0.35 + rng() * 0.65),
            colorStr: `${pr},${pg},${pb}`,
          })
        }
      }
    } else if (type === "irregular") {
      const clusters = Array.from({ length: 2 + Math.floor(rng() * 3) }, () => ({
        cx: (rng() - 0.5) * 1.4, cy: (rng() - 0.5) * 1.4, w: 0.2 + rng() * 0.8,
      }))
      const tw = clusters.reduce((s, c) => s + c.w, 0)
      for (let j = 0; j < 35 + Math.floor(rng() * 22); j++) {
        let roll2 = rng() * tw, ch = clusters[0]
        for (const c of clusters) { roll2 -= c.w; if (roll2 <= 0) { ch = c; break } }
        const bBase: [number, number, number] = rng() < 0.5 ? [178, 222, 255] : [255, 232, 178]
        const [pr, pg, pb] = rshift(...bBase, z)
        particles.push({
          dx: ch.cx + (rng() - 0.5) * 0.75,
          dy: ch.cy + (rng() - 0.5) * 0.75,
          brightness: 0.3 + rng() * 0.7,
          colorStr: `${pr},${pg},${pb}`,
        })
      }
    }

    out.push({
      x: rng(), y: rng(), type, sizeNorm, z,
      angle: rng() * Math.PI * 2,
      rotSpeed: dir * rotSpeed * (0.4 + rng() * 0.6) * (1 - z * 0.65),
      axisRatio: type === "elliptical" ? 0.32 + rng() * 0.56 : 1.0,
      tiltAngle: rng() * Math.PI,
      particles,
      baseAlpha: Math.max(0.08, 1 - z * 0.65),
      coreStr: `${cr},${cg},${cb}`,
    })
  }
  return out.sort((a, b) => b.z - a.z)
}

// ── Bake static star field ─────────────────────────────────────────────────────
// Called once (and on resize). Draws plain dots + glows for brightest stars.
// No twinkle — that's cheap and handled per-frame for diffraction stars only.
function bakeStars(
  bakeCanvas: HTMLCanvasElement,
  stars: StarData[],
): void {
  const ctx  = bakeCanvas.getContext("2d")!
  const W    = bakeCanvas.width
  const H    = bakeCanvas.height
  const minD = Math.min(W, H)

  ctx.clearRect(0, 0, W, H)

  for (const s of stars) {
    const x = s.x * W
    const y = s.y * H
    const r = Math.max(0.3, s.radiusNorm * minD)
    const { cr, cg, cb, brightness } = s

    // Soft glow — only for distinctly bright stars to keep bake cheap
    if (brightness > 0.82) {
      const gr = ctx.createRadialGradient(x, y, 0, x, y, r * 5)
      gr.addColorStop(0, `rgba(${cr},${cg},${cb},${brightness * 0.28})`)
      gr.addColorStop(1, `rgba(${cr},${cg},${cb},0)`)
      ctx.beginPath(); ctx.arc(x, y, r * 5, 0, Math.PI * 2)
      ctx.fillStyle = gr; ctx.fill()
    }

    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${cr},${cg},${cb},${brightness})`
    ctx.fill()
  }
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function HubbleDeepField({
  renderScale   = 0.25,    // lower default — still looks great upscaled
  rotationSpeed = 0.002,
  starCount     = 1000,
  galaxyCount   = 22,
  paused        = false,
  className,
}: HubbleDeepFieldProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const starsRef     = useRef<StarData[]>([])
  const galaxiesRef  = useRef<GalaxyData[]>([])
  const animRef      = useRef<number>(0)
  const pausedRef    = useRef(paused)
  const timeRef      = useRef(0)

  useEffect(() => { pausedRef.current = paused }, [paused])

  // ── Generate data once ────────────────────────────────────────────────────
  useEffect(() => {
    const rng = mulberry32(0xDEEFF1E1)
    starsRef.current   = buildStars(starCount, rng)
    galaxiesRef.current = buildGalaxies(galaxyCount, rng, rotationSpeed)
  }, [starCount, galaxyCount, rotationSpeed])

  // ── RAF loop ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const off      = document.createElement("canvas")  // reduced-res render target
    const bake     = document.createElement("canvas")  // static star bake
    const offCtx   = off.getContext("2d")!
    const ctx      = canvas.getContext("2d")!

    const getRS = () =>
      window.innerWidth < 768 ? Math.min(renderScale, 0.2) : renderScale

    let needsBake = true  // flag: re-bake when off canvas resizes

    const resize = () => {
      const W = canvas.clientWidth  || window.innerWidth
      const H = canvas.clientHeight || window.innerHeight
      canvas.width = W; canvas.height = H
      const rs = getRS()
      const nw = Math.max(1, Math.floor(W * rs))
      const nh = Math.max(1, Math.floor(H * rs))
      if (off.width !== nw || off.height !== nh) {
        off.width   = nw;  off.height  = nh
        bake.width  = nw;  bake.height = nh
        needsBake = true
      }
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const io = new IntersectionObserver(
      ([e]) => { pausedRef.current = !e.isIntersecting || paused },
      { threshold: 0.01 }
    )
    io.observe(canvas)

    const draw = () => {
      // Bake starfield if resolution changed (once on mount, once per resize)
      if (needsBake) {
        bakeStars(bake, starsRef.current)
        needsBake = false
      }

      const OW = off.width, OH = off.height
      const CW = canvas.width, CH = canvas.height
      const minD = Math.min(OW, OH)
      const t = timeRef.current

      // Background
      offCtx.fillStyle = "#00000c"
      offCtx.fillRect(0, 0, OW, OH)

      // ── Blit pre-baked static stars (0 gradients this call) ──────────────
      offCtx.drawImage(bake, 0, 0)

      // ── Animate diffraction spikes only (~3% of stars, ~30 at 1000 count) ─
      for (const s of starsRef.current) {
        if (!s.isDiffraction) continue
        const x = s.x * OW, y = s.y * OH
        const r = Math.max(0.3, s.radiusNorm * minD)
        const tw = 0.72 + 0.28 * Math.sin(t * s.twinkleSpeed + s.twinklePhase)
        const sa = s.brightness * tw * 0.5
        const sLen = r * 18
        const dirs: [number, number, number, number][] = [
          [x - sLen, y, x + sLen, y],
          [x, y - sLen, x, y + sLen],
        ]
        for (const [x1, y1, x2, y2] of dirs) {
          const sg = offCtx.createLinearGradient(x1, y1, x2, y2)
          sg.addColorStop(0,   `rgba(${s.cr},${s.cg},${s.cb},0)`)
          sg.addColorStop(0.5, `rgba(${s.cr},${s.cg},${s.cb},${sa})`)
          sg.addColorStop(1,   `rgba(${s.cr},${s.cg},${s.cb},0)`)
          offCtx.beginPath(); offCtx.moveTo(x1, y1); offCtx.lineTo(x2, y2)
          offCtx.strokeStyle = sg
          offCtx.lineWidth   = Math.max(0.3, r * 0.32)
          offCtx.stroke()
        }
      }

      // ── Galaxies ──────────────────────────────────────────────────────────
      for (const g of galaxiesRef.current) {
        g.angle += g.rotSpeed

        const gx  = g.x * OW, gy = g.y * OH
        const sz  = g.sizeNorm * minD
        const ba  = g.baseAlpha
        const cs  = g.coreStr

        if (g.type === "elliptical") {
          offCtx.save()
          offCtx.translate(gx, gy)
          offCtx.rotate(g.tiltAngle)

          // Body — squashed via scale(1, axisRatio)
          offCtx.save()
          offCtx.scale(1, g.axisRatio)
          const mG = offCtx.createRadialGradient(0, 0, 0, 0, 0, sz * 2.2)
          mG.addColorStop(0,   `rgba(${cs},${ba * 0.72})`)
          mG.addColorStop(0.4, `rgba(${cs},${ba * 0.30})`)
          mG.addColorStop(1,   `rgba(${cs},0)`)
          offCtx.beginPath(); offCtx.arc(0, 0, sz * 2.2, 0, Math.PI * 2)
          offCtx.fillStyle = mG; offCtx.fill()
          offCtx.restore()

          // Nucleus
          const nG = offCtx.createRadialGradient(0, 0, 0, 0, 0, sz * 0.25)
          nG.addColorStop(0, `rgba(255,255,255,${ba * 0.85})`)
          nG.addColorStop(1, `rgba(${cs},0)`)
          offCtx.beginPath(); offCtx.arc(0, 0, sz * 0.25, 0, Math.PI * 2)
          offCtx.fillStyle = nG; offCtx.fill()
          offCtx.restore()

        } else if (g.type === "spiral") {
          offCtx.save()
          offCtx.translate(gx, gy)
          offCtx.rotate(g.angle)

          // Arm particles — cheap arcs, no gradients
          const pR = Math.max(0.38, sz * 0.052)
          for (const p of g.particles) {
            const a = p.brightness * ba * (1 - g.z * 0.28)
            if (a < 0.015) continue
            offCtx.beginPath()
            offCtx.arc(p.dx * sz, p.dy * sz, pR, 0, Math.PI * 2)
            offCtx.fillStyle = `rgba(${p.colorStr},${a})`
            offCtx.fill()
          }

          // Bulge
          const bG = offCtx.createRadialGradient(0, 0, 0, 0, 0, sz * 0.3)
          bG.addColorStop(0,   `rgba(255,250,230,${ba})`)
          bG.addColorStop(0.4, `rgba(${cs},${ba * 0.55})`)
          bG.addColorStop(1,   "rgba(0,0,0,0)")
          offCtx.beginPath(); offCtx.arc(0, 0, sz * 0.3, 0, Math.PI * 2)
          offCtx.fillStyle = bG; offCtx.fill()
          offCtx.restore()

        } else {
          // Irregular — plain dots
          offCtx.save()
          offCtx.translate(gx, gy)
          offCtx.rotate(g.angle)
          const pR = Math.max(0.45, sz * 0.07)
          for (const p of g.particles) {
            const a = p.brightness * ba
            if (a < 0.012) continue
            offCtx.beginPath()
            offCtx.arc(p.dx * sz, p.dy * sz, pR, 0, Math.PI * 2)
            offCtx.fillStyle = `rgba(${p.colorStr},${a})`
            offCtx.fill()
          }
          offCtx.restore()
        }
      }

      // Upscale to display canvas
      ctx.drawImage(off, 0, 0, CW, CH)
    }

    const tick = () => {
      if (!pausedRef.current) {
        timeRef.current += 1
        draw()
      }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
      io.disconnect()
    }
  }, [renderScale, paused])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  )
}
