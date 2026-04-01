"use client"
import { useRef, useEffect } from "react"

// ── Props ──────────────────────────────────────────────────────────────────────
interface HubbleDeepFieldProps {
  renderScale?: number    // 0.2–0.6, default 0.38
  rotationSpeed?: number  // galaxy drift speed, default 0.002
  starCount?: number      // default 1800
  galaxyCount?: number    // default 45
  paused?: boolean
  className?: string
}

// ── Mulberry32 deterministic PRNG ─────────────────────────────────────────────
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
  O: [150, 180, 255],   // hot blue
  B: [170, 195, 255],   // blue-white
  A: [220, 235, 255],   // white-blue
  G: [255, 248, 220],   // yellow-white
  K: [255, 220, 160],   // orange
  M: [255, 160, 100],   // red
}

// Cumulative distribution — M stars dominate (~70%), O are rarest (<0.1%)
const SPECTRAL_CDF: [SpectralType, number][] = [
  ["O", 0.001],
  ["B", 0.006],
  ["A", 0.066],
  ["G", 0.166],
  ["K", 0.296],
  ["M", 1.000],
]

function pickSpectralType(u: number): SpectralType {
  for (const [t, cdf] of SPECTRAL_CDF) if (u < cdf) return t
  return "M"
}

// ── Data interfaces ────────────────────────────────────────────────────────────
interface StarData {
  x: number; y: number
  brightness: number          // 0–1, power-law distributed
  cr: number; cg: number; cb: number
  radiusNorm: number          // fraction of Math.min(offW, offH)
  twinklePhase: number
  twinkleSpeed: number
  isDiffraction: boolean      // top ~3% by base draw rate
}

interface GalaxyParticle {
  dx: number; dy: number      // relative to center, –1 to 1
  brightness: number
  colorStr: string            // precomputed "r,g,b" string
}

type GalaxyType = "elliptical" | "spiral" | "irregular"

interface GalaxyData {
  x: number; y: number        // 0–1 normalized
  type: GalaxyType
  sizeNorm: number            // fraction of Math.min(offW, offH)
  z: number                   // redshift 0–1
  angle: number               // current rotation (mutated per frame)
  rotSpeed: number            // rad/frame
  axisRatio: number           // b/a for ellipticals, < 1 = squashed
  tiltAngle: number           // fixed orientation angle for ellipticals
  particles: GalaxyParticle[]
  baseAlpha: number           // precomputed: max(0.08, 1 - z * 0.65)
  coreStr: string             // precomputed "r,g,b" after redshift
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function redshift(
  r: number, g: number, b: number, z: number
): [number, number, number] {
  const sh = z * 0.65
  return [
    Math.min(255, Math.round(r + sh * 40)),
    Math.max(0,   Math.round(g * (1 - sh * 0.45))),
    Math.max(0,   Math.round(b * (1 - sh * 0.78))),
  ]
}

function rgb(r: number, g: number, b: number): string {
  return `${r},${g},${b}`
}

// ── Data generation ────────────────────────────────────────────────────────────
function buildStars(count: number, rng: () => number): StarData[] {
  const stars: StarData[] = []
  for (let i = 0; i < count; i++) {
    const u = rng()
    const brightness = u * u * u          // power-law: cube → mostly dim
    const [cr, cg, cb] = SPECTRAL_RGB[pickSpectralType(rng())]
    stars.push({
      x: rng(), y: rng(),
      brightness,
      cr, cg, cb,
      radiusNorm: 0.0005 + brightness * 0.0028,
      twinklePhase: rng() * Math.PI * 2,
      twinkleSpeed: 0.006 + rng() * 0.028,
      isDiffraction: u > 0.97,            // top 3% by base frequency
    })
  }
  return stars
}

function buildGalaxies(
  count: number,
  rng: () => number,
  rotSpeed: number
): GalaxyData[] {
  const galaxies: GalaxyData[] = []

  for (let i = 0; i < count; i++) {
    // Bias toward higher redshift (more distant galaxies are more common)
    const z = Math.pow(rng(), 0.65)

    const typeRoll = rng()
    const type: GalaxyType =
      typeRoll < 0.35 ? "elliptical" :
      typeRoll < 0.70 ? "spiral" : "irregular"

    // Distant galaxies are smaller
    const baseSize = 0.009 + rng() * 0.033
    const sizeNorm  = baseSize * (1 - z * 0.78)

    // Distant galaxies rotate slower
    const dir      = rng() < 0.5 ? 1 : -1
    const speed    = dir * rotSpeed * (0.4 + rng() * 0.6) * (1 - z * 0.65)

    // Core color — shifted by redshift
    const coreBase: [number, number, number] =
      type === "elliptical" ? [255, 210, 150] :
      type === "spiral"     ? [255, 248, 200] :
                              [200, 215, 255]
    const [cr, cg, cb] = redshift(...coreBase, z)

    // Build arm / cloud particles
    const particles: GalaxyParticle[] = []

    if (type === "spiral") {
      const arms = 2 + Math.floor(rng() * 3)          // 2–4 arms
      const perArm = 65
      for (let a = 0; a < arms; a++) {
        const offset = (a / arms) * Math.PI * 2
        for (let j = 1; j <= perArm; j++) {
          const t = j / perArm
          // 1.4 full rotations = 2.8π, Archimedean wind
          const theta  = offset + t * Math.PI * 2.8
          const r      = 0.12 + t * 0.88
          const spread = 0.05 + t * 0.13
          const dx = Math.cos(theta) * r + (rng() - 0.5) * spread
          const dy = Math.sin(theta) * r + (rng() - 0.5) * spread * 0.55
          const bright = Math.pow(1 - t * 0.65, 1.6) * (0.35 + rng() * 0.65)
          const [pr, pg, pb] = redshift(188, 210, 255, z) // blue-white arms
          particles.push({ dx, dy, brightness: bright, colorStr: rgb(pr, pg, pb) })
        }
      }
    } else if (type === "irregular") {
      const numClusters = 2 + Math.floor(rng() * 3)
      const clusters = Array.from({ length: numClusters }, () => ({
        cx: (rng() - 0.5) * 1.4,
        cy: (rng() - 0.5) * 1.4,
        w:  0.2 + rng() * 0.8,
      }))
      const totalW = clusters.reduce((s, c) => s + c.w, 0)
      const pCount = 38 + Math.floor(rng() * 28)

      for (let j = 0; j < pCount; j++) {
        let roll = rng() * totalW, chosen = clusters[0]
        for (const c of clusters) { roll -= c.w; if (roll <= 0) { chosen = c; break } }
        const dx = chosen.cx + (rng() - 0.5) * 0.75
        const dy = chosen.cy + (rng() - 0.5) * 0.75
        const bright = 0.3 + rng() * 0.7
        const base: [number, number, number] =
          rng() < 0.5 ? [178, 222, 255] : [255, 232, 178]
        const [pr, pg, pb] = redshift(...base, z)
        particles.push({ dx, dy, brightness: bright, colorStr: rgb(pr, pg, pb) })
      }
    }
    // Ellipticals: pure gradient, no particles

    galaxies.push({
      x: rng(), y: rng(), type, sizeNorm, z,
      angle: rng() * Math.PI * 2,
      rotSpeed: speed,
      axisRatio:  type === "elliptical" ? 0.32 + rng() * 0.56 : 1.0,
      tiltAngle:  rng() * Math.PI,
      particles,
      baseAlpha:  Math.max(0.08, 1 - z * 0.65),
      coreStr:    rgb(cr, cg, cb),
    })
  }

  // Pre-sort farthest → nearest so distant galaxies render first (back to front)
  return galaxies.sort((a, b) => b.z - a.z)
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function HubbleDeepField({
  renderScale  = 0.38,
  rotationSpeed = 0.002,
  starCount    = 1800,
  galaxyCount  = 45,
  paused       = false,
  className,
}: HubbleDeepFieldProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const starsRef   = useRef<StarData[]>([])
  const galaxiesRef = useRef<GalaxyData[]>([])
  const animRef    = useRef<number>(0)
  const pausedRef  = useRef(paused)
  const timeRef    = useRef(0)

  useEffect(() => { pausedRef.current = paused }, [paused])

  // ── Generate all data once on mount ───────────────────────────────────────
  useEffect(() => {
    const rng = mulberry32(0xDEEFF1E1)       // fixed seed = deterministic layout
    starsRef.current   = buildStars(starCount, rng)
    galaxiesRef.current = buildGalaxies(galaxyCount, rng, rotationSpeed)
  }, [starCount, galaxyCount, rotationSpeed])

  // ── RAF draw loop + ResizeObserver + IntersectionObserver ─────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Offscreen canvas — all rendering happens here at reduced resolution
    const off = document.createElement("canvas")
    const offCtx = off.getContext("2d")!
    const ctx    = canvas.getContext("2d")!

    const isMobile = () => window.innerWidth < 768
    const getRS    = () => isMobile() ? Math.min(renderScale, 0.25) : renderScale

    const resize = () => {
      const W = canvas.clientWidth  || window.innerWidth
      const H = canvas.clientHeight || window.innerHeight
      canvas.width  = W
      canvas.height = H
      const rs  = getRS()
      off.width  = Math.max(1, Math.floor(W * rs))
      off.height = Math.max(1, Math.floor(H * rs))
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // IntersectionObserver — pause rendering when canvas is off-screen
    const io = new IntersectionObserver(
      ([entry]) => { pausedRef.current = !entry.isIntersecting || paused },
      { threshold: 0.01 }
    )
    io.observe(canvas)

    // ── Draw frame ──────────────────────────────────────────────────────────
    const drawFrame = () => {
      const OW = off.width, OH = off.height
      const CW = canvas.width, CH = canvas.height
      const minD = Math.min(OW, OH)
      const t    = timeRef.current

      // Background — deep space near-black
      offCtx.fillStyle = "#00000b"
      offCtx.fillRect(0, 0, OW, OH)

      // ── Stars ──────────────────────────────────────────────────────────────
      for (const s of starsRef.current) {
        const x = s.x * OW
        const y = s.y * OH
        const twinkle = 0.75 + 0.25 * Math.sin(t * s.twinkleSpeed + s.twinklePhase)
        const a  = s.brightness * twinkle
        const r  = Math.max(0.35, s.radiusNorm * minD)
        const { cr, cg, cb } = s

        // Soft glow halo for brighter stars
        if (s.brightness > 0.42) {
          const gr = offCtx.createRadialGradient(x, y, 0, x, y, r * 5)
          gr.addColorStop(0, `rgba(${cr},${cg},${cb},${a * 0.32})`)
          gr.addColorStop(1, `rgba(${cr},${cg},${cb},0)`)
          offCtx.beginPath(); offCtx.arc(x, y, r * 5, 0, Math.PI * 2)
          offCtx.fillStyle = gr; offCtx.fill()
        }

        // Star core
        offCtx.beginPath(); offCtx.arc(x, y, r, 0, Math.PI * 2)
        offCtx.fillStyle = `rgba(${cr},${cg},${cb},${a})`
        offCtx.fill()

        // Diffraction spikes — two perpendicular gradient lines
        if (s.isDiffraction) {
          const sLen = r * 18
          const sa   = a * 0.52
          const dirs: [number, number, number, number][] = [
            [x - sLen, y,        x + sLen, y       ],  // horizontal
            [x,        y - sLen, x,        y + sLen],  // vertical
          ]
          for (const [x1, y1, x2, y2] of dirs) {
            const sg = offCtx.createLinearGradient(x1, y1, x2, y2)
            sg.addColorStop(0,   `rgba(${cr},${cg},${cb},0)`)
            sg.addColorStop(0.5, `rgba(${cr},${cg},${cb},${sa})`)
            sg.addColorStop(1,   `rgba(${cr},${cg},${cb},0)`)
            offCtx.beginPath(); offCtx.moveTo(x1, y1); offCtx.lineTo(x2, y2)
            offCtx.strokeStyle = sg
            offCtx.lineWidth   = Math.max(0.3, r * 0.32)
            offCtx.stroke()
          }
        }
      }

      // ── Galaxies (pre-sorted farthest→nearest) ────────────────────────────
      for (const g of galaxiesRef.current) {
        g.angle += g.rotSpeed              // mutate angle in ref — no React state

        const gx   = g.x * OW
        const gy   = g.y * OH
        const sz   = g.sizeNorm * minD
        const ba   = g.baseAlpha
        const cs   = g.coreStr

        if (g.type === "elliptical") {
          // De Vaucouleurs r^(1/4) profile approximated with 3 nested radial gradients
          offCtx.save()
          offCtx.translate(gx, gy)
          offCtx.rotate(g.tiltAngle)

          // Outer halo
          offCtx.save()
          offCtx.scale(1, g.axisRatio)
          const oG = offCtx.createRadialGradient(0, 0, 0, 0, 0, sz * 2.8)
          oG.addColorStop(0,    `rgba(${cs},${ba * 0.32})`)
          oG.addColorStop(0.18, `rgba(${cs},${ba * 0.20})`)
          oG.addColorStop(0.55, `rgba(${cs},${ba * 0.07})`)
          oG.addColorStop(1,    `rgba(${cs},0)`)
          offCtx.beginPath(); offCtx.arc(0, 0, sz * 2.8, 0, Math.PI * 2)
          offCtx.fillStyle = oG; offCtx.fill()
          offCtx.restore()

          // Mid body
          offCtx.save()
          offCtx.scale(1, g.axisRatio)
          const mG = offCtx.createRadialGradient(0, 0, 0, 0, 0, sz)
          mG.addColorStop(0,   `rgba(${cs},${ba * 0.72})`)
          mG.addColorStop(0.4, `rgba(${cs},${ba * 0.42})`)
          mG.addColorStop(1,   `rgba(${cs},0)`)
          offCtx.beginPath(); offCtx.arc(0, 0, sz, 0, Math.PI * 2)
          offCtx.fillStyle = mG; offCtx.fill()
          offCtx.restore()

          // Bright nucleus
          const nG = offCtx.createRadialGradient(0, 0, 0, 0, 0, sz * 0.22)
          nG.addColorStop(0,   `rgba(255,255,255,${ba * 0.88})`)
          nG.addColorStop(0.5, `rgba(${cs},${ba * 0.5})`)
          nG.addColorStop(1,   "rgba(0,0,0,0)")
          offCtx.beginPath(); offCtx.arc(0, 0, sz * 0.22, 0, Math.PI * 2)
          offCtx.fillStyle = nG; offCtx.fill()

          offCtx.restore()

        } else if (g.type === "spiral") {
          offCtx.save()
          offCtx.translate(gx, gy)
          offCtx.rotate(g.angle)

          // Diffuse outer disk
          const dG = offCtx.createRadialGradient(0, 0, 0, 0, 0, sz * 1.7)
          dG.addColorStop(0, `rgba(${cs},${ba * 0.11})`)
          dG.addColorStop(1, "rgba(0,0,0,0)")
          offCtx.beginPath(); offCtx.arc(0, 0, sz * 1.7, 0, Math.PI * 2)
          offCtx.fillStyle = dG; offCtx.fill()

          // Arm particles
          const pR = Math.max(0.38, sz * 0.052)
          for (const p of g.particles) {
            const a = p.brightness * ba * (1 - g.z * 0.28)
            if (a < 0.014) continue
            offCtx.beginPath()
            offCtx.arc(p.dx * sz, p.dy * sz, pR, 0, Math.PI * 2)
            offCtx.fillStyle = `rgba(${p.colorStr},${a})`
            offCtx.fill()
          }

          // Central bulge — yellow-white gradient
          const bulgeR = sz * 0.28
          const bG = offCtx.createRadialGradient(0, 0, 0, 0, 0, bulgeR)
          bG.addColorStop(0,    `rgba(255,250,230,${ba})`)
          bG.addColorStop(0.35, `rgba(${cs},${ba * 0.62})`)
          bG.addColorStop(1,    "rgba(0,0,0,0)")
          offCtx.beginPath(); offCtx.arc(0, 0, bulgeR, 0, Math.PI * 2)
          offCtx.fillStyle = bG; offCtx.fill()

          offCtx.restore()

        } else {
          // Irregular — scattered particle cloud, no defined center
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

      // Upscale offscreen to display canvas — the upscaling gives a natural
      // soft-focus bloom that suits the deep-field aesthetic
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(off, 0, 0, CW, CH)
    }

    // ── Animation loop ──────────────────────────────────────────────────────
    const tick = () => {
      if (!pausedRef.current) {
        timeRef.current += 1
        drawFrame()
      }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
      io.disconnect()
    }
  }, [renderScale, paused])  // re-init if renderScale changes (rare)

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  )
}
