"use client"
import { useEffect, useRef } from "react"

export default function BackgroundCanvas({ mode, scrollProgress = 0 }) {
  const canvasRef         = useRef(null)
  const modeRef           = useRef(mode)
  const scrollProgressRef = useRef(scrollProgress)

  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { scrollProgressRef.current = scrollProgress }, [scrollProgress])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext("2d")
    let animId

    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width = W; canvas.height = H

    const onResize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H }
    window.addEventListener("resize", onResize)

    // ─── MODE CONFIG ──────────────────────────────────────────────────
    const modeConfig = {
      home:     { warpSpeed: 6,   warpColor: [180,220,255], nebulaHue: 210, bgAlpha: 0.18 },
      about:    { warpSpeed: 0.4, warpColor: [210,220,240], nebulaHue: 220, bgAlpha: 0.26 },
      projects: { warpSpeed: 2.5, warpColor: [100,215,255], nebulaHue: 190, bgAlpha: 0.20 },
      physics:  { warpSpeed: 3.5, warpColor: [90,210,255],  nebulaHue: 195, bgAlpha: 0.18 },
      hobbies:  { warpSpeed: 1.0, warpColor: [155,215,100], nebulaHue: 130, bgAlpha: 0.22 },
      contact:  { warpSpeed: 0.6, warpColor: [195,210,255], nebulaHue: 230, bgAlpha: 0.28 },
    }
    const lerp  = (a, b, t) => a + (b - a) * t
    const lerpA = (a, b, t) => a.map((v, i) => lerp(v, b[i], t))
    let cur = { warpSpeed: 6, warpColor: [180,220,255], nebulaHue: 210, bgAlpha: 0.18 }

    // ─── WARP STARS ───────────────────────────────────────────────────
    const NSTARS = 200
    const makeStar = (spread = false) => {
      const angle = Math.random() * Math.PI * 2
      const r     = Math.random() * 1.1 + 0.3
      return { angle, r,
        dist:   spread ? Math.random() * Math.min(W,H) * 0.55 : r + Math.random() * 3,
        speed:  Math.random() * 0.5 + 0.5,
        len:    0,
        bright: Math.random() * 0.5 + 0.5,
      }
    }
    const stars = Array.from({ length: NSTARS }, () => makeStar(true))

    // ─── DRIFT PARTICLES ──────────────────────────────────────────────
    const drift = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vy: -(Math.random() * 0.18 + 0.03), vx: (Math.random() - 0.5) * 0.05,
      size: Math.random() * 1.4 + 0.3, alpha: Math.random() * 0.38 + 0.08,
      twinkle: Math.random() * Math.PI * 2,
    }))

    // ─── AMBIENT NEBULA BLOBS ─────────────────────────────────────────
    const ambientNebulae = Array.from({ length: 4 }, () => ({
      x: W * (0.1 + Math.random() * 0.8), y: H * (0.1 + Math.random() * 0.8),
      rx: 110 + Math.random() * 170, ry: 65 + Math.random() * 120,
      rot: Math.random() * Math.PI, a: 0.012 + Math.random() * 0.016,
    }))

    // ─── SCROLL SCENE DATA ────────────────────────────────────────────

    // Asteroids — 3 types (C=dark, S=medium, M=metallic)
    const AST_TYPES = [
      { fill: 'rgba(80,72,62,', stroke: 'rgba(110,100,88,', lit: 'rgba(130,118,102,' },  // C-type
      { fill: 'rgba(110,98,78,', stroke: 'rgba(155,140,115,', lit: 'rgba(190,170,140,' },  // S-type
      { fill: 'rgba(130,125,118,', stroke: 'rgba(175,168,158,', lit: 'rgba(210,200,185,' },  // M-type
    ]
    const asteroids = Array.from({ length: 18 }, () => {
      const r  = 3 + Math.random() * 10
      const nv = 6 + Math.floor(Math.random() * 5)
      const tp = Math.floor(Math.random() * 3)
      // light direction: upper-left
      const lightAng = -Math.PI * 0.62
      return {
        x: Math.random() * W, y: H * (0.12 + Math.random() * 0.76),
        vx: (Math.random() - 0.5) * 0.16, r, rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.005, type: tp, lightAng,
        verts: Array.from({ length: nv }, (_, i) => ({
          a: (i / nv) * Math.PI * 2 + (Math.random() - 0.5) * 0.4,
          r: r * (0.58 + Math.random() * 0.76),
        })),
        craters: Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => ({
          a: Math.random() * Math.PI * 2,
          d: r * (0.25 + Math.random() * 0.5),
          r: r * (0.08 + Math.random() * 0.14),
        })),
        baseAlpha: 0.55 + Math.random() * 0.35,
      }
    })

    // Galaxy star particles (zone 6)
    const GALAXY_XF = 0.73, GALAXY_YF = 0.46
    const galaxyPts = Array.from({ length: 400 }, (_, i) => {
      const arm   = i % 3
      const t     = (i < 60) ? (Math.random() * 0.12) : Math.random()  // dense core
      const ang   = arm * (Math.PI * 2 / 3) + t * Math.PI * 2.8 + (Math.random() - 0.5) * 0.3
      const dist  = t * 0.20 + (Math.random() - 0.5) * 0.03
      const flat  = 0.36
      // Color: bulge = yellow-orange, arms = blue-white, outer = mixed
      const inArm = (Math.abs((ang % (Math.PI*2/3)) - Math.PI/3) < 0.5)
      const hue   = t < 0.15 ? 35 + Math.random() * 20  // bulge: warm yellow
                  : inArm ? 200 + Math.random() * 40     // arms: blue-white
                  : 220 + Math.random() * 60             // inter-arm: mixed
      const sat   = t < 0.15 ? 60 : inArm ? 40 : 20
      const lum   = t < 0.15 ? 70 + Math.random() * 15 : 75 + Math.random() * 20
      const alph  = t < 0.15 ? 0.5 + Math.random() * 0.4
                  : 0.12 + Math.random() * 0.45 * (1 - t * 0.5)
      // Dust lane: darker region along inner arm edges
      const isDust = (Math.abs((ang % (Math.PI*2/3))) < 0.18) && t > 0.12 && t < 0.65
      return {
        xF: GALAXY_XF + Math.cos(ang) * dist,
        yF: GALAXY_YF + Math.sin(ang) * dist * flat,
        r: isDust ? 0 : 0.3 + Math.random() * 1.5 * (1 - t * 0.35),
        a: isDust ? 0 : alph,
        hue, sat, lum,
        isHII: inArm && t > 0.2 && t < 0.7 && Math.random() < 0.06,  // HII star-forming regions
      }
    })

    // Globular star cluster (zone 8) — King profile
    const clusterPts = Array.from({ length: 260 }, (_, i) => {
      // King profile: density ∝ 1/(1+(r/rc)^2) - approximate with rejection sampling
      const rc = 0.04   // core radius (fraction of min(W,H))
      const rt = 0.20   // tidal radius
      let fx, fy, r2
      // Box-Muller for core concentration
      const u1 = Math.random(), u2 = Math.random()
      const mag = rc * Math.sqrt(-2 * Math.log(Math.max(u1, 0.0001)))
      fx = mag * Math.cos(2 * Math.PI * u2) * (0.5 + Math.random() * 1.5)
      fy = mag * Math.sin(2 * Math.PI * u2) * (0.5 + Math.random() * 1.5)
      r2 = Math.sqrt(fx * fx + fy * fy)
      // Star types: red giants (40%), main seq (40%), blue stragglers (10%), white dwarfs (10%)
      const roll = Math.random()
      const type = roll < 0.4 ? 'rg' : roll < 0.8 ? 'ms' : roll < 0.9 ? 'bs' : 'wd'
      const hue  = type === 'rg' ? 20 + Math.random() * 20
                 : type === 'ms' ? 45 + Math.random() * 20
                 : type === 'bs' ? 210 + Math.random() * 30
                 : 200 + Math.random() * 20
      const sat  = type === 'rg' ? 80 : type === 'ms' ? 55 : type === 'bs' ? 65 : 40
      const lum  = 70 + Math.random() * 25
      const sz   = type === 'rg' ? 0.8 + Math.random() * 0.9
                 : type === 'bs' ? 0.6 + Math.random() * 0.7
                 : 0.3 + Math.random() * 0.6
      return { fx, fy, r2, sz, hue, sat, lum, a: 0.35 + Math.random() * 0.55 * (1 - Math.min(r2/rt,1)) }
    })

    // Supergiant convection cells (zone 7) — pre-generated
    const convCells = Array.from({ length: 22 }, (_, i) => ({
      aF: Math.random(), bF: Math.random(),   // position (fraction of star radius)
      ang: Math.random() * Math.PI * 2,
      r: 0.12 + Math.random() * 0.28,          // fraction of star radius
      delta: (Math.random() - 0.5) * 0.08,     // brightness delta
      drift: (Math.random() - 0.5) * 0.0004,   // slow rotation
    }))

    // Comet (zone 9)
    let cometX = -400, cometY = H * 0.25, cometActive = false, cometTimer = 0
    const resetComet = () => {
      cometX = -400; cometY = H * (0.08 + Math.random() * 0.42); cometActive = true
    }
    // Sun direction for comet tails (upper-right)
    const SUN_ANG = -Math.PI * 0.35

    // Pulsar
    let pulsarAngle = 0

    let frame = 0

    // ─── ZONE HELPER ──────────────────────────────────────────────────
    const zone = (sp, fi, pi, po, fo) => {
      if (sp <= fi) return 0
      if (sp <= pi) return (sp - fi) / (pi - fi)
      if (sp <= po) return 1
      if (sp <= fo) return 1 - (sp - po) / (fo - po)
      return 0
    }

    // ═══════════════════════════════════════════════════════════════════
    // ULTRA-REALISTIC DRAW HELPERS
    // ═══════════════════════════════════════════════════════════════════

    // ─── PLANET: Saturn/Neptune hybrid with full ring system ──────────
    const drawRingSystem = (px, py, pr, alpha, tilt, flat, front) => {
      // 5 ring bands: C (inner faint), B (bright), Cassini Gap, A, F (faint outer)
      const bands = [
        { inner: 1.22, outer: 1.52, r: 148, g: 132, b: 104, op: 0.20 },  // C ring
        { inner: 1.52, outer: 1.95, r: 200, g: 188, b: 162, op: 0.62 },  // B ring
        { inner: 1.95, outer: 2.02, r:   4, g:   3, b:   8, op: 0.90 },  // Cassini Division
        { inner: 2.02, outer: 2.40, r: 182, g: 170, b: 146, op: 0.44 },  // A ring
        { inner: 2.42, outer: 2.48, r: 162, g: 150, b: 126, op: 0.16 },  // F ring
      ]
      const startA = front ? 0       : Math.PI
      const endA   = front ? Math.PI : Math.PI * 2
      ctx.save()
      ctx.globalAlpha = alpha
      for (const b of bands) {
        const midR   = ((b.inner + b.outer) / 2) * pr
        const width  = (b.outer - b.inner) * pr
        // Back: slightly darker (shadowed), Front: a bit lighter
        const shade  = front ? 1.0 : 0.72
        ctx.beginPath()
        ctx.ellipse(px, py, midR, midR * flat, tilt, startA, endA)
        ctx.strokeStyle = `rgba(${Math.round(b.r*shade)},${Math.round(b.g*shade)},${Math.round(b.b*shade)},${b.op})`
        ctx.lineWidth = width
        ctx.stroke()
      }
      ctx.restore()
    }

    const drawPlanet = (px, py, pr, alpha) => {
      if (alpha <= 0.005) return
      const tilt = -0.22
      const flat = 0.19   // ring flatness (edge-on ~18°)

      // 1. Atmospheric halo
      ctx.save(); ctx.globalAlpha = alpha * 0.6
      const atmo = ctx.createRadialGradient(px, py, pr * 0.88, px, py, pr * 2.1)
      atmo.addColorStop(0, 'rgba(60,100,210,0.14)'); atmo.addColorStop(0.4, 'rgba(30,60,160,0.05)'); atmo.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath(); ctx.arc(px, py, pr * 2.1, 0, Math.PI * 2); ctx.fillStyle = atmo; ctx.fill()
      ctx.restore()

      // 2. Ring system — BACK half
      drawRingSystem(px, py, pr, alpha, tilt, flat, false)

      // 3. Planet body with limb darkening
      ctx.save(); ctx.globalAlpha = alpha
      const body = ctx.createRadialGradient(px - pr*0.22, py - pr*0.24, pr*0.04, px, py, pr)
      body.addColorStop(0,    'rgba(140,185,248,0.96)')  // lit highlight
      body.addColorStop(0.18, 'rgba(80,128,218,0.95)')   // bright face
      body.addColorStop(0.48, 'rgba(38,72,178,0.92)')    // mid
      body.addColorStop(0.75, 'rgba(14,38,118,0.94)')    // limb darkening
      body.addColorStop(0.90, 'rgba(5,14,62,0.96)')      // dark limb
      body.addColorStop(1,    'rgba(2,5,24,0.98)')       // edge
      ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fillStyle = body; ctx.fill()

      // 4. Atmospheric bands (clip to planet sphere)
      ctx.save()
      ctx.beginPath(); ctx.arc(px, py, pr * 0.995, 0, Math.PI * 2); ctx.clip()
      const bands = [
        { y: -0.62, w: 0.10, r: 90, g: 140, b: 240, a: 0.09 },
        { y: -0.40, w: 0.07, r: 170,g: 200, b: 255, a: 0.07 },
        { y: -0.18, w: 0.14, r: 28, g: 58,  b: 190, a: 0.11 },
        { y:  0.08, w: 0.10, r: 100,g: 150, b: 230, a: 0.08 },
        { y:  0.28, w: 0.08, r: 50, g: 90,  b: 210, a: 0.09 },
        { y:  0.50, w: 0.12, r: 18, g: 44,  b: 170, a: 0.10 },
        { y:  0.68, w: 0.08, r: 80, g: 120, b: 210, a: 0.07 },
      ]
      for (const bnd of bands) {
        ctx.globalAlpha = alpha * bnd.a
        ctx.beginPath()
        ctx.ellipse(px, py + bnd.y * pr, pr * 0.98, bnd.w * pr, 0, 0, Math.PI * 2)
        ctx.fillStyle = `rgb(${bnd.r},${bnd.g},${bnd.b})`; ctx.fill()
      }
      ctx.restore()

      // 5. Great Dark Spot (storm vortex)
      ctx.save()
      ctx.beginPath(); ctx.arc(px, py, pr * 0.995, 0, Math.PI * 2); ctx.clip()
      ctx.globalAlpha = alpha * 0.18
      const spot = ctx.createRadialGradient(px + pr*0.24, py - pr*0.12, 0, px + pr*0.24, py - pr*0.12, pr*0.22)
      spot.addColorStop(0, 'rgba(4,10,70,0.95)'); spot.addColorStop(0.5, 'rgba(10,28,100,0.5)'); spot.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath(); ctx.ellipse(px + pr*0.24, py - pr*0.12, pr*0.22, pr*0.14, 0.3, 0, Math.PI*2)
      ctx.fillStyle = spot; ctx.fill()
      ctx.restore()

      // 6. Ring shadow on planet
      ctx.save()
      ctx.beginPath(); ctx.arc(px, py, pr * 0.995, 0, Math.PI * 2); ctx.clip()
      ctx.globalAlpha = alpha * 0.20
      ctx.beginPath()
      ctx.ellipse(px, py - pr*0.06, pr*0.94, pr*0.08, tilt, 0, Math.PI*2)
      ctx.fillStyle = 'rgba(0,0,12,1)'; ctx.fill()
      ctx.restore()

      // 7. Specular highlight (sun reflection)
      ctx.save()
      ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.clip()
      ctx.globalAlpha = alpha * 0.45
      const spec = ctx.createRadialGradient(px - pr*0.30, py - pr*0.30, 0, px - pr*0.30, py - pr*0.30, pr*0.44)
      spec.addColorStop(0, 'rgba(220,235,255,0.80)'); spec.addColorStop(0.35, 'rgba(180,210,255,0.22)'); spec.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = spec
      ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill()
      ctx.restore()

      ctx.restore()

      // 8. Ring system — FRONT half
      drawRingSystem(px, py, pr, alpha, tilt, flat, true)
    }

    // ─── BLACK HOLE: Interstellar-accurate with relativistic beaming ──
    const drawBlackHole = (bx, by, br, alpha) => {
      if (alpha <= 0.005) return
      ctx.save()

      // 1. Outer X-ray corona glow
      ctx.globalAlpha = alpha * 0.35
      const xray = ctx.createRadialGradient(bx, by, br * 1.4, bx, by, br * 7)
      xray.addColorStop(0, 'rgba(255,140,40,0.08)'); xray.addColorStop(0.35, 'rgba(180,80,10,0.03)'); xray.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath(); ctx.arc(bx, by, br * 7, 0, Math.PI * 2); ctx.fillStyle = xray; ctx.fill()

      ctx.globalAlpha = alpha

      // Disk geometry: near edge-on, slight tilt
      const diskW = br * 3.6    // horizontal half-width
      const diskH = br * 0.52   // vertical half-height (foreshortened)
      const tilt  = 0.12        // slight rotation

      // 2. Lensed far-disk arc (thin bright arc visible ABOVE the shadow due to gravitational lensing)
      ctx.save()
      ctx.globalAlpha = alpha * 0.55
      const lensArcGrad = ctx.createLinearGradient(bx - diskW*0.7, by, bx + diskW*0.7, by)
      lensArcGrad.addColorStop(0, 'rgba(255,200,80,0)')
      lensArcGrad.addColorStop(0.25, 'rgba(255,220,120,0.35)')
      lensArcGrad.addColorStop(0.5,  'rgba(255,245,180,0.55)')
      lensArcGrad.addColorStop(0.75, 'rgba(255,220,120,0.35)')
      lensArcGrad.addColorStop(1, 'rgba(255,200,80,0)')
      ctx.beginPath()
      ctx.ellipse(bx, by - br*0.62, diskW*0.68, diskH*0.38, tilt, Math.PI, Math.PI*2)
      ctx.strokeStyle = lensArcGrad
      ctx.lineWidth = br * 0.18
      ctx.stroke()
      ctx.restore()

      // 3. Main accretion disk — 4 temperature zones (hot inner → cool outer)
      // Temperature: inner ~10^8K (blue-white) → outer ~10^4K (orange-red)
      // Doppler beaming: approaching side (left) is brighter
      const diskZones = [
        { rMin: 1.28, rMax: 1.65, r1:255,g1:250,b1:240, r2:255,g2:220,b2:140, op: 0.85 },  // hot inner
        { rMin: 1.65, rMax: 2.10, r1:255,g1:200,b1:80,  r2:255,g2:160,b2:30,  op: 0.78 },  // mid
        { rMin: 2.10, rMax: 2.70, r1:255,g1:140,b1:20,  r2:220,g2:90,b2:10,   op: 0.65 },  // cool outer
        { rMin: 2.70, rMax: 3.55, r1:180,g1:70,b1:10,   r2:120,g2:40,b2:5,    op: 0.42 },  // very outer
      ]

      for (const dz of diskZones) {
        const midR  = (dz.rMin + dz.rMax) / 2 * br
        const width = (dz.rMax - dz.rMin) * br

        // Temperature gradient: vertical (top center = hottest visible)
        const tGrad = ctx.createLinearGradient(bx, by, bx + midR * 1.1, by)
        // Relativistic beaming: left (approaching) ~2.5x brighter, right (receding) ~0.4x
        tGrad.addColorStop(0,    `rgba(${dz.r1},${dz.g1},${dz.b1},0)`)
        tGrad.addColorStop(0.12, `rgba(${dz.r1},${dz.g1},${dz.b1},${dz.op * 0.85})`)  // far left bright
        tGrad.addColorStop(0.38, `rgba(${dz.r1},${dz.g1},${dz.b1},${dz.op})`)         // left peak
        tGrad.addColorStop(0.52, `rgba(${dz.r2},${dz.g2},${dz.b2},${dz.op * 0.75})`)  // center
        tGrad.addColorStop(0.72, `rgba(${dz.r2},${dz.g2},${dz.b2},${dz.op * 0.32})`)  // right fading (receding)
        tGrad.addColorStop(1,    `rgba(${dz.r2},${dz.g2},${dz.b2},0)`)

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.ellipse(bx, by, midR, midR * diskH/diskW, tilt, 0, Math.PI*2)
        ctx.strokeStyle = tGrad
        ctx.lineWidth = width
        ctx.stroke()
        ctx.restore()
      }

      // 4. Event horizon shadow (perfect black)
      ctx.save()
      ctx.globalAlpha = 1.0
      const shadow = ctx.createRadialGradient(bx, by, 0, bx, by, br * 1.25)
      shadow.addColorStop(0,    '#000000')
      shadow.addColorStop(0.82, '#000000')
      shadow.addColorStop(0.92, 'rgba(0,0,0,0.96)')
      shadow.addColorStop(1,    'rgba(0,0,0,0)')
      ctx.beginPath(); ctx.arc(bx, by, br * 1.25, 0, Math.PI*2); ctx.fillStyle = shadow; ctx.fill()
      ctx.restore()

      // 5. Photon ring (thin, bright, orange-gold)
      ctx.save()
      ctx.globalAlpha = alpha * 0.72
      ctx.beginPath(); ctx.arc(bx, by, br * 1.18, 0, Math.PI*2)
      ctx.strokeStyle = 'rgba(255,220,80,0.60)'; ctx.lineWidth = br * 0.06; ctx.stroke()
      // Inner photon ring edge
      ctx.beginPath(); ctx.arc(bx, by, br * 1.10, 0, Math.PI*2)
      ctx.strokeStyle = 'rgba(255,240,120,0.25)'; ctx.lineWidth = br * 0.03; ctx.stroke()
      ctx.restore()

      ctx.restore()
    }

    // ─── EMISSION NEBULA: H-alpha + OIII + dust pillars ──────────────
    const drawNebulaBig = (nx, ny, nr, alpha, fr) => {
      if (alpha <= 0.005) return
      ctx.save(); ctx.globalAlpha = alpha

      // 1. Faint outer halo (ionized hydrogen boundary)
      const outerGlow = ctx.createRadialGradient(nx, ny, nr*0.5, nx, ny, nr*1.2)
      outerGlow.addColorStop(0, 'rgba(180,30,30,0.04)'); outerGlow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath(); ctx.arc(nx, ny, nr*1.2, 0, Math.PI*2); ctx.fillStyle = outerGlow; ctx.fill()

      // 2. H-alpha emission (dominant red/pink) — 3 overlapping blobs
      const hAlpha = [
        { ox:0,       oy:0,        rf:1.00, r:210, g:28,  b:42,  a:0.092 },
        { ox: nr*0.3, oy:-nr*0.2,  rf:0.72, r:220, g:35,  b:55,  a:0.075 },
        { ox:-nr*0.28,oy: nr*0.18, rf:0.65, r:195, g:22,  b:38,  a:0.068 },
      ]
      for (const h of hAlpha) {
        const bx = nx + h.ox + Math.sin(fr*0.0008 + h.ox) * 3
        const by = ny + h.oy + Math.cos(fr*0.0010 + h.oy) * 2
        const g  = ctx.createRadialGradient(bx, by, 0, bx, by, nr*h.rf)
        g.addColorStop(0,    `rgba(${h.r},${h.g},${h.b},${h.a*2.2})`)
        g.addColorStop(0.35, `rgba(${h.r},${h.g},${h.b},${h.a})`)
        g.addColorStop(0.70, `rgba(${h.r},${h.g},${h.b},${h.a*0.4})`)
        g.addColorStop(1,    `rgba(${h.r},${h.g},${h.b},0)`)
        ctx.beginPath(); ctx.arc(bx, by, nr*h.rf, 0, Math.PI*2); ctx.fillStyle = g; ctx.fill()
      }

      // 3. OIII emission (teal-green, offset from H-alpha)
      const oiii = [
        { ox: nr*0.20, oy:-nr*0.30, rf:0.55, r:40, g:180, b:185, a:0.058 },
        { ox:-nr*0.15, oy:-nr*0.12, rf:0.42, r:30, g:160, b:170, a:0.045 },
      ]
      for (const o of oiii) {
        const bx = nx + o.ox; const by = ny + o.oy
        const g  = ctx.createRadialGradient(bx, by, 0, bx, by, nr*o.rf)
        g.addColorStop(0,    `rgba(${o.r},${o.g},${o.b},${o.a*2.0})`)
        g.addColorStop(0.40, `rgba(${o.r},${o.g},${o.b},${o.a})`)
        g.addColorStop(1,    `rgba(${o.r},${o.g},${o.b},0)`)
        ctx.beginPath(); ctx.arc(bx, by, nr*o.rf, 0, Math.PI*2); ctx.fillStyle = g; ctx.fill()
      }

      // 4. Dark dust absorption pillars (Pillars of Creation style)
      ctx.save()
      ctx.globalAlpha = alpha * 0.55
      // Pillar 1 (tall, left-center)
      const p1x = nx - nr*0.10, p1y = ny + nr*0.45
      const p1grad = ctx.createLinearGradient(p1x, p1y - nr*0.55, p1x, p1y)
      p1grad.addColorStop(0, 'rgba(2,1,4,0.0)'); p1grad.addColorStop(0.3, 'rgba(2,1,5,0.62)'); p1grad.addColorStop(1, 'rgba(3,2,6,0.75)')
      ctx.beginPath()
      ctx.moveTo(p1x - nr*0.04, p1y)
      ctx.quadraticCurveTo(p1x - nr*0.06, p1y - nr*0.28, p1x - nr*0.01, p1y - nr*0.52)
      ctx.quadraticCurveTo(p1x + nr*0.02, p1y - nr*0.52, p1x + nr*0.05, p1y - nr*0.28)
      ctx.lineTo(p1x + nr*0.05, p1y); ctx.closePath()
      ctx.fillStyle = p1grad; ctx.fill()
      // Pillar 2 (shorter, right)
      const p2x = nx + nr*0.22, p2y = ny + nr*0.45
      const p2grad = ctx.createLinearGradient(p2x, p2y - nr*0.38, p2x, p2y)
      p2grad.addColorStop(0, 'rgba(2,1,4,0.0)'); p2grad.addColorStop(0.35, 'rgba(3,2,6,0.52)'); p2grad.addColorStop(1, 'rgba(3,2,7,0.68)')
      ctx.beginPath()
      ctx.moveTo(p2x - nr*0.035, p2y)
      ctx.quadraticCurveTo(p2x - nr*0.05, p2y - nr*0.20, p2x + nr*0.005, p2y - nr*0.36)
      ctx.quadraticCurveTo(p2x + nr*0.02, p2y - nr*0.36, p2x + nr*0.045, p2y - nr*0.18)
      ctx.lineTo(p2x + nr*0.045, p2y); ctx.closePath()
      ctx.fillStyle = p2grad; ctx.fill()
      ctx.restore()

      // 5. Ionization front (bright rim at the illuminated edge of the pillar tops)
      ctx.save()
      ctx.globalAlpha = alpha * 0.35
      ctx.beginPath(); ctx.arc(p1x, p1y - nr*0.52, nr*0.028, 0, Math.PI*2)
      ctx.fillStyle = 'rgba(255,220,160,0.8)'; ctx.fill()
      ctx.beginPath(); ctx.arc(p2x, p2y - nr*0.36, nr*0.020, 0, Math.PI*2)
      ctx.fillStyle = 'rgba(255,215,155,0.7)'; ctx.fill()
      ctx.restore()

      // 6. Embedded O/B stars (bright ionizing sources)
      const embStars = [
        { ox:-nr*0.32, oy:-nr*0.35, br:0.018 },
        { ox: nr*0.18, oy:-nr*0.28, br:0.014 },
        { ox:-nr*0.08, oy:-nr*0.18, br:0.012 },
        { ox: nr*0.38, oy:-nr*0.10, br:0.010 },
      ]
      ctx.save()
      ctx.globalAlpha = alpha * 0.75
      for (const es of embStars) {
        const ex = nx + es.ox, ey = ny + es.oy
        const sg = ctx.createRadialGradient(ex, ey, 0, ex, ey, nr*es.br*3)
        sg.addColorStop(0, 'rgba(220,240,255,0.95)'); sg.addColorStop(0.25, 'rgba(180,220,255,0.4)'); sg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.beginPath(); ctx.arc(ex, ey, nr*es.br*3, 0, Math.PI*2); ctx.fillStyle = sg; ctx.fill()
        ctx.beginPath(); ctx.arc(ex, ey, nr*es.br, 0, Math.PI*2); ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill()
      }
      ctx.restore()

      ctx.restore()
    }

    // ─── PULSAR: millisecond pulsar with lighthouse beams ─────────────
    const drawPulsar = (px, py, pr, alpha, fr) => {
      if (alpha <= 0.005) return
      ctx.save(); ctx.globalAlpha = alpha
      pulsarAngle += 0.045   // very fast rotation (millisecond pulsar)
      const beamLen = Math.min(W, H) * 0.38

      // 1. Synchrotron radiation torus (equatorial, perpendicular to spin axis)
      ctx.save()
      ctx.globalAlpha = alpha * 0.22
      ctx.beginPath()
      ctx.ellipse(px, py, pr * 18, pr * 4, pulsarAngle * 0.08, 0, Math.PI*2)
      const synch = ctx.createRadialGradient(px, py, pr*3, px, py, pr*18)
      synch.addColorStop(0, 'rgba(80,180,255,0.25)'); synch.addColorStop(0.5, 'rgba(40,120,220,0.08)'); synch.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = synch; ctx.fill()
      ctx.restore()

      // 2. Two focused radio/X-ray beams
      for (let b = 0; b < 2; b++) {
        const ang = pulsarAngle + b * Math.PI
        const beamOpacity = 0.5 + 0.15 * Math.sin(fr * 0.5 + b * Math.PI)  // slight flicker
        ctx.save()
        ctx.globalAlpha = alpha * beamOpacity
        ctx.translate(px, py); ctx.rotate(ang)
        const bg = ctx.createLinearGradient(0, 0, beamLen, 0)
        bg.addColorStop(0,    'rgba(120,230,255,0.70)')
        bg.addColorStop(0.08, 'rgba(80,200,255,0.45)')
        bg.addColorStop(0.30, 'rgba(40,160,255,0.15)')
        bg.addColorStop(1,    'rgba(0,0,0,0)')
        ctx.beginPath()
        ctx.moveTo(0, -pr*6); ctx.lineTo(beamLen, -pr*16)
        ctx.lineTo(beamLen,  pr*16); ctx.lineTo(0,  pr*6)
        ctx.closePath()
        ctx.fillStyle = bg; ctx.fill()
        ctx.restore()
      }

      // 3. Neutron star body (tiny, intensely hot — blue-white)
      ctx.save()
      ctx.globalAlpha = alpha
      const pulse = 1 + 0.12 * Math.sin(fr * 0.3)
      const nsg = ctx.createRadialGradient(px, py, 0, px, py, pr * 4 * pulse)
      nsg.addColorStop(0,    'rgba(255,255,255,1.0)')
      nsg.addColorStop(0.15, 'rgba(200,240,255,0.85)')
      nsg.addColorStop(0.40, 'rgba(120,200,255,0.35)')
      nsg.addColorStop(1,    'rgba(0,0,0,0)')
      ctx.beginPath(); ctx.arc(px, py, pr * 4 * pulse, 0, Math.PI*2); ctx.fillStyle = nsg; ctx.fill()
      ctx.restore()

      ctx.restore()
    }

    // ─── GALAXY: barred spiral with dust lanes + HII regions ──────────
    const drawGalaxy = (alpha) => {
      if (alpha <= 0.005) return
      const gcx = GALAXY_XF * W, gcy = GALAXY_YF * H
      const scl = Math.min(W, H)
      ctx.save()

      // 1. Outer stellar halo (faint, spherical)
      ctx.globalAlpha = alpha * 0.35
      const halo = ctx.createRadialGradient(gcx, gcy, scl*0.08, gcx, gcy, scl*0.26)
      halo.addColorStop(0, 'rgba(210,195,160,0.06)'); halo.addColorStop(0.6, 'rgba(180,165,130,0.02)'); halo.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath(); ctx.arc(gcx, gcy, scl*0.26, 0, Math.PI*2); ctx.fillStyle = halo; ctx.fill()

      // 2. Galactic disk glow
      ctx.globalAlpha = alpha * 0.5
      const diskGlow = ctx.createRadialGradient(gcx, gcy, 0, gcx, gcy, scl*0.20)
      diskGlow.addColorStop(0, 'rgba(255,240,200,0.10)'); diskGlow.addColorStop(0.4, 'rgba(200,185,155,0.04)'); diskGlow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath(); ctx.ellipse(gcx, gcy, scl*0.20, scl*0.075, 0, 0, Math.PI*2); ctx.fillStyle = diskGlow; ctx.fill()

      // 3. Individual stars
      ctx.globalAlpha = alpha
      for (const s of galaxyPts) {
        if (s.r <= 0) continue
        ctx.beginPath(); ctx.arc(s.xF * W, s.yF * H, s.r, 0, Math.PI*2)
        ctx.fillStyle = `hsla(${s.hue},${s.sat}%,${s.lum}%,${s.a * alpha})`; ctx.fill()
      }

      // 4. HII star-forming regions (bright pink-red blobs in spiral arms)
      ctx.globalAlpha = alpha * 0.7
      for (const s of galaxyPts) {
        if (!s.isHII) continue
        const hx = s.xF * W, hy = s.yF * H
        const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, scl*0.012)
        hg.addColorStop(0, 'rgba(255,100,120,0.55)'); hg.addColorStop(0.5, 'rgba(200,50,80,0.20)'); hg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.beginPath(); ctx.arc(hx, hy, scl*0.012, 0, Math.PI*2); ctx.fillStyle = hg; ctx.fill()
        ctx.beginPath(); ctx.arc(hx, hy, scl*0.003, 0, Math.PI*2)
        ctx.fillStyle = 'rgba(255,220,230,0.9)'; ctx.fill()
      }

      // 5. Galactic bar (central bar of old stars)
      ctx.globalAlpha = alpha * 0.4
      const bar = ctx.createLinearGradient(gcx - scl*0.06, gcy, gcx + scl*0.06, gcy)
      bar.addColorStop(0, 'rgba(255,240,200,0)'); bar.addColorStop(0.25, 'rgba(255,235,190,0.18)'); bar.addColorStop(0.5, 'rgba(255,240,200,0.28)'); bar.addColorStop(0.75, 'rgba(255,235,190,0.18)'); bar.addColorStop(1, 'rgba(255,240,200,0)')
      ctx.fillRect(gcx - scl*0.06, gcy - scl*0.018, scl*0.12, scl*0.036)
      ctx.fillStyle = bar
      ctx.fillRect(gcx - scl*0.06, gcy - scl*0.018, scl*0.12, scl*0.036)

      // 6. Central bulge (bright, dense, old stars — warm yellow)
      ctx.globalAlpha = alpha * 0.8
      const bulge = ctx.createRadialGradient(gcx, gcy, 0, gcx, gcy, scl*0.045)
      bulge.addColorStop(0, 'rgba(255,245,210,0.50)'); bulge.addColorStop(0.3, 'rgba(240,220,170,0.25)'); bulge.addColorStop(0.7, 'rgba(210,185,130,0.10)'); bulge.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath(); ctx.arc(gcx, gcy, scl*0.045, 0, Math.PI*2); ctx.fillStyle = bulge; ctx.fill()

      ctx.restore()
    }

    // ─── RED SUPERGIANT: Betelgeuse-like with convection cells ────────
    const drawSupergiant = (sx, sy, sr, alpha, fr) => {
      if (alpha <= 0.005) return
      ctx.save(); ctx.globalAlpha = alpha

      const pulse = 1 + 0.055 * Math.sin(fr * 0.018)

      // 1. Stellar wind (expanding shells)
      for (let w = 1; w <= 3; w++) {
        const wr = sr * (3.5 + w * 1.8) * pulse
        const wa = 0.025 / w
        const wg = ctx.createRadialGradient(sx, sy, wr*0.88, sx, sy, wr)
        wg.addColorStop(0, `rgba(220,80,20,${wa})`); wg.addColorStop(1, `rgba(180,50,10,0)`)
        ctx.beginPath(); ctx.arc(sx, sy, wr, 0, Math.PI*2); ctx.fillStyle = wg; ctx.fill()
      }

      // 2. Outer corona
      ctx.globalAlpha = alpha * 0.5
      const corona = ctx.createRadialGradient(sx, sy, sr*0.75, sx, sy, sr*4.8*pulse)
      corona.addColorStop(0, 'rgba(255,80,18,0.14)'); corona.addColorStop(0.35, 'rgba(210,45,8,0.05)'); corona.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath(); ctx.arc(sx, sy, sr*4.8, 0, Math.PI*2); ctx.fillStyle = corona; ctx.fill()

      ctx.globalAlpha = alpha

      // 3. Main photosphere (deep red, convective)
      ctx.save()
      ctx.beginPath(); ctx.arc(sx, sy, sr*pulse, 0, Math.PI*2); ctx.clip()
      // Base color
      const phot = ctx.createRadialGradient(sx - sr*0.18, sy - sr*0.18, sr*0.05, sx, sy, sr*pulse)
      phot.addColorStop(0,    'rgba(255,140,50,0.95)')   // bright highlight
      phot.addColorStop(0.22, 'rgba(235,80,20,0.96)')    // orange-red
      phot.addColorStop(0.55, 'rgba(195,45,10,0.97)')    // deep red
      phot.addColorStop(0.80, 'rgba(140,22,5,0.98)')     // limb darkening
      phot.addColorStop(1,    'rgba(80,10,2,0.99)')      // dark limb
      ctx.beginPath(); ctx.arc(sx, sy, sr*pulse, 0, Math.PI*2); ctx.fillStyle = phot; ctx.fill()

      // 4. Convection cells (granulation)
      for (const cell of convCells) {
        cell.ang += cell.drift
        const cx = sx + Math.cos(cell.ang) * cell.aF * sr * 0.82
        const cy = sy + Math.sin(cell.ang) * cell.bF * sr * 0.82
        const cellR = cell.r * sr
        const brightness = cell.delta > 0
          ? `rgba(255,${Math.round(100 + cell.delta*500)},${Math.round(20 + cell.delta*200)},${0.08 + cell.delta*0.4})`
          : `rgba(80,${Math.round(10 + Math.abs(cell.delta)*100)},2,${0.06 + Math.abs(cell.delta)*0.25})`
        ctx.globalAlpha = alpha * 0.65
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cellR)
        cg.addColorStop(0, brightness); cg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.beginPath(); ctx.arc(cx, cy, cellR, 0, Math.PI*2); ctx.fillStyle = cg; ctx.fill()
      }
      ctx.restore()

      // 5. Chromosphere rim
      ctx.save()
      ctx.globalAlpha = alpha * 0.38
      ctx.beginPath(); ctx.arc(sx, sy, sr*pulse*1.04, 0, Math.PI*2)
      ctx.strokeStyle = 'rgba(255,180,80,0.45)'; ctx.lineWidth = sr*0.06; ctx.stroke()
      ctx.restore()

      // 6. Prominences (arching magnetic loops)
      ctx.save()
      ctx.globalAlpha = alpha * 0.45
      const promAngles = [0.3, 1.1, 2.2, 3.8, 4.8]
      for (let pi = 0; pi < promAngles.length; pi++) {
        const pa  = promAngles[pi] + fr * 0.0005
        const px1 = sx + Math.cos(pa) * sr * pulse
        const py1 = sy + Math.sin(pa) * sr * pulse
        const px2 = sx + Math.cos(pa + 0.4) * sr * pulse
        const py2 = sy + Math.sin(pa + 0.4) * sr * pulse
        const pcx = sx + Math.cos(pa + 0.2) * sr * (pulse + 0.55 + pi * 0.08)
        const pcy = sy + Math.sin(pa + 0.2) * sr * (pulse + 0.55 + pi * 0.08)
        ctx.beginPath(); ctx.moveTo(px1, py1); ctx.quadraticCurveTo(pcx, pcy, px2, py2)
        ctx.strokeStyle = `rgba(255,${160 + pi*8},60,0.38)`; ctx.lineWidth = sr*0.035; ctx.stroke()
      }
      ctx.restore()

      ctx.restore()
    }

    // ─── GLOBULAR STAR CLUSTER: M13-like, King profile density ────────
    const drawStarCluster = (alpha, fr) => {
      if (alpha <= 0.005) return
      const ccx = W * 0.28, ccy = H * 0.55
      const scl = Math.min(W, H)
      ctx.save()

      // 1. Outer glow halo
      ctx.globalAlpha = alpha * 0.5
      const outerG = ctx.createRadialGradient(ccx, ccy, scl*0.04, ccx, ccy, scl*0.22)
      outerG.addColorStop(0, 'rgba(255,240,195,0.12)'); outerG.addColorStop(0.5, 'rgba(230,210,160,0.04)'); outerG.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath(); ctx.arc(ccx, ccy, scl*0.22, 0, Math.PI*2); ctx.fillStyle = outerG; ctx.fill()

      // 2. Resolved stars
      ctx.globalAlpha = alpha
      for (const p of clusterPts) {
        const distFrac = Math.min(p.r2 / 0.20, 1)
        const a = p.a * (1 - distFrac * 0.7) * (0.82 + 0.18 * Math.sin(fr * 0.012 + p.r2 * 80))
        ctx.beginPath()
        ctx.arc(ccx + p.fx * scl, ccy + p.fy * scl, p.sz, 0, Math.PI*2)
        ctx.fillStyle = `hsla(${p.hue},${p.sat}%,${p.lum}%,${a * alpha})`
        ctx.fill()
      }

      // 3. Dense unresolved core
      ctx.globalAlpha = alpha * 0.7
      const core = ctx.createRadialGradient(ccx, ccy, 0, ccx, ccy, scl*0.038)
      core.addColorStop(0, 'rgba(255,248,215,0.45)'); core.addColorStop(0.3, 'rgba(245,230,185,0.22)'); core.addColorStop(0.7, 'rgba(220,200,150,0.08)'); core.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath(); ctx.arc(ccx, ccy, scl*0.038, 0, Math.PI*2); ctx.fillStyle = core; ctx.fill()

      ctx.restore()
    }

    // ─── DRAW LOOP ────────────────────────────────────────────────────
    const draw = () => {
      animId = requestAnimationFrame(draw)
      frame++

      const cfg   = modeConfig[modeRef.current] || modeConfig.home
      const SPEED = 0.022
      cur.warpSpeed = lerp(cur.warpSpeed, cfg.warpSpeed, SPEED)
      cur.warpColor = lerpA(cur.warpColor, cfg.warpColor, SPEED)
      cur.nebulaHue = lerp(cur.nebulaHue, cfg.nebulaHue, SPEED)
      cur.bgAlpha   = lerp(cur.bgAlpha,   cfg.bgAlpha,   SPEED)

      const m  = modeRef.current
      const sp = scrollProgressRef.current

      ctx.fillStyle = `rgba(0,0,0,${cur.bgAlpha})`
      ctx.fillRect(0, 0, W, H)

      // ── Ambient nebula blobs ────────────────────────────────────────
      ambientNebulae.forEach((n, i) => {
        const pulse = Math.sin(frame * 0.003 + i * 1.4) * 0.25 + 1
        const hue   = ((cur.nebulaHue + i * 28) % 360).toFixed(0)
        ctx.save()
        ctx.translate(n.x, n.y); ctx.rotate(n.rot + frame * 0.00025)
        ctx.scale(1, n.ry / n.rx)
        const grd = ctx.createRadialGradient(0,0,0,0,0, n.rx * pulse)
        grd.addColorStop(0,    `hsla(${hue},65%,55%,${n.a*2.5})`)
        grd.addColorStop(0.45, `hsla(${hue},52%,36%,${n.a})`)
        grd.addColorStop(1,    `hsla(${hue},38%,16%,0)`)
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(0,0, n.rx*pulse, 0, Math.PI*2); ctx.fill()
        ctx.restore()
      })

      // ── Warp stars ─────────────────────────────────────────────────
      const [r, g, b] = cur.warpColor
      const wcx = W/2, wcy = H/2
      stars.forEach((s) => {
        const prevX = wcx + Math.cos(s.angle) * s.dist
        const prevY = wcy + Math.sin(s.angle) * s.dist
        s.dist += cur.warpSpeed * s.speed * 0.45
        s.len   = Math.min(s.len + cur.warpSpeed * 0.25, cur.warpSpeed * 9)
        const nx = wcx + Math.cos(s.angle) * s.dist
        const ny = wcy + Math.sin(s.angle) * s.dist
        if (s.dist > Math.max(W,H) * 0.75) { Object.assign(s, makeStar(false)); return }
        const alph  = Math.min((s.dist / (Math.min(W,H) * 0.08)) * s.bright, 1)
        const streak = Math.max(s.len, 0.5)
        ctx.beginPath()
        ctx.moveTo(prevX - Math.cos(s.angle)*streak*0.5, prevY - Math.sin(s.angle)*streak*0.5)
        ctx.lineTo(nx, ny)
        const grd = ctx.createLinearGradient(prevX, prevY, nx, ny)
        grd.addColorStop(0, `rgba(${r},${g},${b},0)`)
        grd.addColorStop(1, `rgba(${r},${g},${b},${alph*0.88})`)
        ctx.strokeStyle = grd; ctx.lineWidth = s.r * 0.85; ctx.stroke()
        ctx.beginPath(); ctx.arc(nx, ny, s.r*0.6, 0, Math.PI*2)
        ctx.fillStyle = `rgba(${r},${g},${b},${alph*0.5})`; ctx.fill()
      })

      // ── Drift particles ────────────────────────────────────────────
      if (m === "about" || m === "hobbies" || m === "contact") {
        drift.forEach((p) => {
          p.twinkle += 0.018; p.y += p.vy; p.x += p.vx
          if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W }
          const tw = (Math.sin(p.twinkle) * 0.28 + 0.72) * p.alpha
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2)
          ctx.fillStyle = `rgba(${r},${g},${b},${tw})`; ctx.fill()
        })
      }

      // ─ SCROLL-TRIGGERED REVEALS ────────────────────────────────────

      // Zone 1 — Saturn/Neptune planet (about, ~0.04-0.28)
      {
        const a = zone(sp, 0.04, 0.10, 0.20, 0.28)
        if (a > 0.005) drawPlanet(W * 0.82, H * 0.38, Math.min(W,H) * 0.11, a)
      }

      // Zone 2 — Asteroid belt (projects, ~0.15-0.42)
      {
        const a = zone(sp, 0.15, 0.22, 0.34, 0.42)
        if (a > 0.005) {
          for (const ast of asteroids) {
            ast.rot += ast.rotSpeed; ast.x += ast.vx
            if (ast.x < -20) ast.x = W + 20
            if (ast.x > W + 20) ast.x = -20
            const tp = AST_TYPES[ast.type]
            ctx.save()
            ctx.globalAlpha = a * ast.baseAlpha
            ctx.translate(ast.x, ast.y); ctx.rotate(ast.rot)

            // Shadow side (dark fill)
            ctx.beginPath()
            const verts = ast.verts
            ctx.moveTo(verts[0].r * Math.cos(verts[0].a), verts[0].r * Math.sin(verts[0].a))
            for (const v of verts) ctx.lineTo(v.r * Math.cos(v.a), v.r * Math.sin(v.a))
            ctx.closePath()
            ctx.fillStyle = tp.fill + '0.92)'; ctx.fill()
            ctx.strokeStyle = tp.stroke + '0.4)'; ctx.lineWidth = 0.5; ctx.stroke()

            // Light face (directional illumination)
            ctx.save()
            ctx.clip()
            const litGrad = ctx.createRadialGradient(
              Math.cos(ast.lightAng) * ast.r * 0.6, Math.sin(ast.lightAng) * ast.r * 0.6, 0,
              0, 0, ast.r * 1.3
            )
            litGrad.addColorStop(0, tp.lit + '0.55)')
            litGrad.addColorStop(0.5, tp.lit + '0.10)')
            litGrad.addColorStop(1, 'rgba(0,0,0,0.35)')
            ctx.fillStyle = litGrad
            ctx.beginPath()
            ctx.moveTo(verts[0].r * Math.cos(verts[0].a), verts[0].r * Math.sin(verts[0].a))
            for (const v of verts) ctx.lineTo(v.r * Math.cos(v.a), v.r * Math.sin(v.a))
            ctx.closePath(); ctx.fill()
            ctx.restore()

            // Craters
            ctx.save(); ctx.clip()
            ctx.globalAlpha = a * ast.baseAlpha * 0.55
            for (const cr of ast.craters) {
              const crx = Math.cos(cr.a) * cr.d, cry = Math.sin(cr.a) * cr.d
              ctx.beginPath(); ctx.arc(crx, cry, cr.r, 0, Math.PI*2)
              ctx.fillStyle = 'rgba(30,25,20,0.7)'; ctx.fill()
              ctx.beginPath(); ctx.arc(crx - cr.r*0.3, cry - cr.r*0.3, cr.r*0.35, 0, Math.PI*2)
              ctx.fillStyle = 'rgba(200,185,165,0.35)'; ctx.fill()
            }
            ctx.restore()
            ctx.restore()
          }
        }
      }

      // Zone 3 — Black hole (physics, ~0.26-0.52)
      {
        const a = zone(sp, 0.26, 0.34, 0.44, 0.52)
        if (a > 0.005) drawBlackHole(W * 0.22, H * 0.46, Math.min(W,H) * 0.068, a)
      }

      // Zone 4 — Emission nebula (hobbies, ~0.38-0.62)
      {
        const a = zone(sp, 0.38, 0.45, 0.54, 0.62)
        drawNebulaBig(W * 0.62, H * 0.44, Math.min(W,H) * 0.34, a * 0.88, frame)
      }

      // Zone 5 — Pulsar (timeline, ~0.48-0.72)
      {
        const a = zone(sp, 0.48, 0.54, 0.64, 0.72)
        drawPulsar(W * 0.80, H * 0.36, Math.min(W,H) * 0.020, a, frame)
      }

      // Zone 6 — Spiral galaxy (skills, ~0.56-0.82)
      {
        const a = zone(sp, 0.56, 0.64, 0.74, 0.82)
        drawGalaxy(a)
      }

      // Zone 7 — Red supergiant (blog, ~0.66-0.88)
      {
        const a = zone(sp, 0.66, 0.73, 0.82, 0.90)
        drawSupergiant(W * 0.15, H * 0.35, Math.min(W,H) * 0.058, a, frame)
      }

      // Zone 8 — Globular cluster (collab/quotes, ~0.76-0.96)
      {
        const a = zone(sp, 0.76, 0.83, 0.93, 0.99)
        drawStarCluster(a, frame)
      }

      // Zone 9 — Comet with dual tails (contact, ~0.86-1.0)
      {
        const a = zone(sp, 0.86, 0.92, 0.99, 1.0)
        if (a > 0.25) {
          cometTimer++
          if (!cometActive && cometTimer > 150) { resetComet(); cometTimer = 0 }
          if (cometActive) {
            const speed = 5.0
            cometX += speed
            if (cometX > W + 450) cometActive = false
            const cx = cometX, cy = cometY

            ctx.save()
            ctx.globalAlpha = a

            // Dust tail: wide, yellowish-white, gentle curve (radiation pressure)
            const dustLen = 180
            const dustAng = SUN_ANG + 0.15  // slightly curved from ion tail
            ctx.save()
            ctx.translate(cx, cy); ctx.rotate(dustAng)
            const dustGrad = ctx.createLinearGradient(0, 0, -dustLen, 0)
            dustGrad.addColorStop(0,    'rgba(255,248,220,0.0)')
            dustGrad.addColorStop(0.08, 'rgba(255,242,200,0.22)')
            dustGrad.addColorStop(0.35, 'rgba(240,225,180,0.12)')
            dustGrad.addColorStop(1,    'rgba(220,200,155,0.0)')
            ctx.beginPath()
            ctx.moveTo(0, -18); ctx.lineTo(-dustLen, -45)
            ctx.lineTo(-dustLen, 45); ctx.lineTo(0, 18); ctx.closePath()
            ctx.fillStyle = dustGrad; ctx.fill()
            ctx.restore()

            // Ion tail: narrow, straight blue-white, points directly away from sun
            const ionLen = 240
            ctx.save()
            ctx.translate(cx, cy); ctx.rotate(SUN_ANG)
            const ionGrad = ctx.createLinearGradient(0, 0, -ionLen, 0)
            ionGrad.addColorStop(0,    'rgba(180,220,255,0.0)')
            ionGrad.addColorStop(0.06, 'rgba(180,225,255,0.45)')
            ionGrad.addColorStop(0.30, 'rgba(140,200,255,0.20)')
            ionGrad.addColorStop(1,    'rgba(100,180,255,0.0)')
            ctx.beginPath()
            ctx.moveTo(0, -5); ctx.lineTo(-ionLen, -10)
            ctx.lineTo(-ionLen, 10); ctx.lineTo(0, 5); ctx.closePath()
            ctx.fillStyle = ionGrad; ctx.fill()
            ctx.restore()

            // Coma (diffuse glow around nucleus)
            const comaGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28)
            comaGrad.addColorStop(0,    'rgba(220,240,255,0.85)')
            comaGrad.addColorStop(0.25, 'rgba(180,220,255,0.35)')
            comaGrad.addColorStop(0.65, 'rgba(140,200,255,0.10)')
            comaGrad.addColorStop(1,    'rgba(0,0,0,0)')
            ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI*2); ctx.fillStyle = comaGrad; ctx.fill()

            // Nucleus (dark, rocky, irregular)
            ctx.save()
            ctx.translate(cx, cy); ctx.rotate(frame * 0.02)
            ctx.beginPath()
            ctx.ellipse(0, 0, 5, 3.5, 0.3, 0, Math.PI*2)
            ctx.fillStyle = 'rgba(60,50,42,0.95)'; ctx.fill()
            // nucleus highlight
            ctx.beginPath(); ctx.ellipse(-1.5, -1, 2, 1.2, -0.3, 0, Math.PI*2)
            ctx.fillStyle = 'rgba(140,128,112,0.55)'; ctx.fill()
            ctx.restore()

            ctx.restore()
          }
        }
      }

      // ── Vignette ───────────────────────────────────────────────────
      const vig = ctx.createRadialGradient(W/2, H/2, H*0.18, W/2, H/2, H*0.88)
      vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.52)')
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position:'fixed', top:0, left:0, zIndex:0, pointerEvents:'none' }}
    />
  )
}
