"use client"
import { useEffect, useRef, useState } from "react"

export type CursorMode = "pulsar" | "lightsaber" | "spaceship" | "blackhole" | "whitehole" | "solarsystem"

const W = 80
const CX = 40
const CY = 40

// ── PULSAR ────────────────────────────────────────────────────────────────────
interface PRing { t0: number; maxR: number; dur: number }
interface PulsarState { rings: PRing[]; lastEmit: number }
function initPulsar(): PulsarState { return { rings: [], lastEmit: 0 } }

function drawPulsar(
  ctx: CanvasRenderingContext2D,
  st: PulsarState,
  hovered: boolean, justClicked: boolean,
  vx: number, vy: number, now: number
) {
  ctx.clearRect(0, 0, W, W)
  const speed = Math.hypot(vx, vy)
  const rate = hovered ? 200 : speed > 2 ? 350 : 700
  if (now - st.lastEmit > rate) {
    st.rings.push({ t0: now, maxR: 34, dur: 900 })
    st.lastEmit = now
  }
  if (justClicked) {
    st.rings.push({ t0: now,        maxR: 56, dur: 700 })
    st.rings.push({ t0: now - 70,   maxR: 34, dur: 700 })
    st.rings.push({ t0: now - 140,  maxR: 34, dur: 700 })
    if (st.rings.length > 9) st.rings = st.rings.slice(-9)
  }
  st.rings = st.rings.filter(r => now - r.t0 < r.dur)
  const ang = Math.atan2(vy, vx)
  for (const ring of st.rings) {
    const t = (now - ring.t0) / ring.dur
    const r = ring.maxR * t
    const op = (1 - t) * (hovered ? 1 : 0.7)
    if (op <= 0 || r <= 0) continue
    ctx.save(); ctx.translate(CX, CY)
    if (speed > 2) {
      const e = 1 + (speed / 50) * 0.25
      ctx.rotate(ang); ctx.scale(e, 1 / e); ctx.rotate(-ang)
    }
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(77,184,255,${op})`
    ctx.lineWidth = 1; ctx.stroke(); ctx.restore()
  }
  ctx.beginPath(); ctx.arc(CX, CY, hovered ? 5 : 3, 0, Math.PI * 2)
  ctx.fillStyle = "white"
  ctx.shadowBlur = hovered ? 14 : 7
  ctx.shadowColor = "rgba(77,184,255,0.9)"
  ctx.fill(); ctx.shadowBlur = 0
}

// ── LIGHTSABER ────────────────────────────────────────────────────────────────
interface LightsaberState { angle: number; clickFlash: number }
function initLightsaber(): LightsaberState { return { angle: -Math.PI / 2, clickFlash: 0 } }

function drawLightsaber(
  ctx: CanvasRenderingContext2D,
  st: LightsaberState,
  hovered: boolean, justClicked: boolean,
  vx: number, vy: number
) {
  ctx.clearRect(0, 0, W, W)
  const speed = Math.hypot(vx, vy)
  if (speed > 0.8) {
    const target = Math.atan2(vy, vx) - Math.PI / 2
    let diff = target - st.angle
    while (diff > Math.PI)  diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2
    st.angle += diff * 0.12
  }
  if (justClicked) st.clickFlash = 6
  if (st.clickFlash > 0) st.clickFlash--

  const len = hovered ? 38 : speed > 2 ? 30 + speed * 0.5 : 26
  const flash = st.clickFlash > 0 ? 1.5 : 1

  ctx.save(); ctx.translate(CX, CY); ctx.rotate(st.angle)

  const layers: [number, string][] = [
    [20, "rgba(77,144,255,0.05)"],
    [13, "rgba(77,184,255,0.11)"],
    [7,  "rgba(100,200,255,0.24)"],
    [3.5, "rgba(160,220,255,0.7)"],
    [1.5, "rgba(255,255,255,0.96)"],
  ]
  for (const [lw, col] of layers) {
    ctx.beginPath()
    ctx.moveTo(0, -len / 2)
    ctx.lineTo(0, len * 0.42)
    ctx.strokeStyle = col
    ctx.lineWidth = lw * flash
    ctx.lineCap = "round"
    ctx.stroke()
  }

  // Hilt
  ctx.beginPath()
  ctx.moveTo(-4.5, len * 0.42)
  ctx.lineTo(4.5,  len * 0.42)
  ctx.strokeStyle = "rgba(200,200,200,0.55)"
  ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.stroke()

  ctx.restore()
  // Crossguard tip glow on click
  if (st.clickFlash > 0) {
    ctx.save(); ctx.translate(CX, CY); ctx.rotate(st.angle)
    ctx.beginPath()
    ctx.moveTo(-12, len * 0.35)
    ctx.lineTo( 12, len * 0.35)
    ctx.strokeStyle = `rgba(180,220,255,${st.clickFlash / 6 * 0.8})`
    ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.stroke()
    ctx.restore()
  }

  ctx.beginPath(); ctx.arc(CX, CY, 2, 0, Math.PI * 2)
  ctx.fillStyle = "white"; ctx.fill()
}

// ── SPACESHIP ─────────────────────────────────────────────────────────────────
interface SpaceshipState { angle: number; boost: number; thrustPulse: number }
function initSpaceship(): SpaceshipState { return { angle: -Math.PI / 2, boost: 0, thrustPulse: 0 } }

function drawSpaceship(
  ctx: CanvasRenderingContext2D,
  st: SpaceshipState,
  hovered: boolean, justClicked: boolean,
  vx: number, vy: number
) {
  ctx.clearRect(0, 0, W, W)
  const speed = Math.hypot(vx, vy)
  if (speed > 0.5) {
    const target = Math.atan2(vy, vx) - Math.PI / 2
    let diff = target - st.angle
    while (diff > Math.PI)  diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2
    st.angle += diff * 0.1
  }
  if (justClicked) st.boost = 10
  if (st.boost > 0) st.boost--
  st.thrustPulse += 0.22

  const sc = hovered ? 1.25 : 1
  ctx.save(); ctx.translate(CX, CY); ctx.rotate(st.angle + Math.PI / 2); ctx.scale(sc, sc)

  // Hull
  ctx.beginPath()
  ctx.moveTo(0,  -16)
  ctx.lineTo(-7,   7)
  ctx.lineTo(-3,   3)
  ctx.lineTo( 0,   6)
  ctx.lineTo( 3,   3)
  ctx.lineTo( 7,   7)
  ctx.closePath()
  ctx.strokeStyle = "rgba(77,184,255,0.85)"
  ctx.lineWidth = 1; ctx.stroke()
  ctx.fillStyle = "rgba(77,184,255,0.07)"; ctx.fill()

  // Thruster exhaust
  const ti = st.boost > 0 ? 0.95 : (speed > 1 ? 0.45 + speed * 0.04 : 0.18)
  const tl = st.boost > 0 ? 18 : (speed > 1 ? 7 + speed : 3)
  const tPulse = tl * (0.84 + 0.16 * Math.sin(st.thrustPulse))
  const grad = ctx.createLinearGradient(0, 7, 0, 7 + tPulse)
  grad.addColorStop(0,   `rgba(120,210,255,${ti})`)
  grad.addColorStop(0.5, `rgba(77,184,255,${ti * 0.5})`)
  grad.addColorStop(1,   "rgba(77,184,255,0)")
  ctx.beginPath()
  ctx.moveTo(-2.5, 7); ctx.lineTo(2.5, 7)
  ctx.lineTo(1.5, 7 + tPulse); ctx.lineTo(-1.5, 7 + tPulse)
  ctx.closePath()
  ctx.fillStyle = grad; ctx.fill()

  // Cockpit
  ctx.beginPath(); ctx.arc(0, -7, 2.2, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(160,230,255,0.8)"; ctx.fill()

  ctx.restore()
}

// ── BLACKHOLE ────────────────────────────────────────────────────────────────
interface BHParticle { angle: number; radius: number; speed: number; alpha: number }
interface BlackholeState { particles: BHParticle[]; diskAngle: number; pulse: number; lastSpawn: number }
function initBlackhole(): BlackholeState { return { particles: [], diskAngle: 0, pulse: 0, lastSpawn: 0 } }

function drawBlackhole(
  ctx: CanvasRenderingContext2D,
  st: BlackholeState,
  hovered: boolean, justClicked: boolean,
  now: number
) {
  ctx.clearRect(0, 0, W, W)
  st.diskAngle += hovered ? 0.055 : 0.025
  st.pulse += 0.07

  if (justClicked) {
    for (let i = 0; i < 5; i++) {
      st.particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 30, speed: 0.04 + Math.random() * 0.03, alpha: 1,
      })
    }
  }
  if (now - st.lastSpawn > 240 && st.particles.length < 10) {
    st.particles.push({
      angle: Math.random() * Math.PI * 2,
      radius: 28 + Math.random() * 8,
      speed: 0.025 + Math.random() * 0.025,
      alpha: 0.7,
    })
    st.lastSpawn = now
  }

  const alive: BHParticle[] = []
  for (const p of st.particles) {
    p.angle  += p.speed
    p.radius -= 0.1
    p.alpha  -= 0.006
    if (p.radius < 5 || p.alpha <= 0) continue
    alive.push(p)
    const px = CX + Math.cos(p.angle) * p.radius
    const py = CY + Math.sin(p.angle) * p.radius * 0.42
    ctx.beginPath(); ctx.arc(px, py, 1.2, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(100,185,255,${p.alpha})`; ctx.fill()
  }
  st.particles = alive

  // Accretion disk
  ctx.save(); ctx.translate(CX, CY); ctx.rotate(st.diskAngle); ctx.scale(1, 0.36)
  const diskR = hovered ? 28 : 23
  const g = ctx.createRadialGradient(0, 0, diskR * 0.45, 0, 0, diskR + 7)
  g.addColorStop(0,    "rgba(77,184,255,0.0)")
  g.addColorStop(0.55, "rgba(77,184,255,0.22)")
  g.addColorStop(0.82, "rgba(160,220,255,0.45)")
  g.addColorStop(1,    "rgba(77,184,255,0.0)")
  ctx.beginPath(); ctx.arc(0, 0, diskR + 7, 0, Math.PI * 2)
  ctx.fillStyle = g; ctx.fill()
  ctx.restore()

  // Event horizon ring
  const ehA = 0.65 + 0.35 * Math.sin(st.pulse * 2.2)
  ctx.beginPath(); ctx.arc(CX, CY, 11, 0, Math.PI * 2)
  ctx.strokeStyle = `rgba(150,220,255,${ehA})`
  ctx.lineWidth = 1.5; ctx.stroke()

  // Dark core
  ctx.beginPath(); ctx.arc(CX, CY, 8, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(0,0,0,0.97)"; ctx.fill()

  ctx.beginPath(); ctx.arc(CX, CY, 2, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fill()
}

// ── WHITE HOLE ────────────────────────────────────────────────────────────────
interface WHRing { t0: number; maxR: number; dur: number }
interface WhiteholeState { rings: WHRing[]; pulse: number; lastEmit: number; clickFlash: number }
function initWhitehole(): WhiteholeState { return { rings: [], pulse: 0, lastEmit: 0, clickFlash: 0 } }

function drawWhitehole(
  ctx: CanvasRenderingContext2D,
  st: WhiteholeState,
  hovered: boolean, justClicked: boolean,
  now: number
) {
  ctx.clearRect(0, 0, W, W)
  st.pulse += 0.07
  const rate = hovered ? 260 : 560
  if (now - st.lastEmit > rate) {
    st.rings.push({ t0: now, maxR: 34, dur: 950 })
    st.lastEmit = now
  }
  if (justClicked) {
    st.clickFlash = 10
    for (let i = 0; i < 4; i++) st.rings.push({ t0: now - i * 55, maxR: 50, dur: 720 })
  }
  if (st.clickFlash > 0) st.clickFlash--
  st.rings = st.rings.filter(r => now - r.t0 < r.dur)

  // Expanding rings
  for (const ring of st.rings) {
    const t = (now - ring.t0) / ring.dur
    const r = ring.maxR * t
    const op = (1 - t) * (hovered ? 0.75 : 0.5)
    ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(215,240,255,${op})`
    ctx.lineWidth = 1.8 * (1 - t * 0.6); ctx.stroke()
  }

  const coreR = 5 + 1.3 * Math.sin(st.pulse * 2.5)
  const flare = st.clickFlash > 0 ? st.clickFlash * 2.2 : 0

  // Outer glow corona
  const glowR = coreR + 15 + flare
  const glow = ctx.createRadialGradient(CX, CY, 0, CX, CY, glowR)
  glow.addColorStop(0,    "rgba(255,255,255,0.95)")
  glow.addColorStop(0.28, "rgba(200,228,255,0.68)")
  glow.addColorStop(0.58, "rgba(120,195,255,0.22)")
  glow.addColorStop(1,    "rgba(77,184,255,0)")
  ctx.beginPath(); ctx.arc(CX, CY, glowR, 0, Math.PI * 2)
  ctx.fillStyle = glow; ctx.fill()

  // Hard bright center
  ctx.beginPath(); ctx.arc(CX, CY, coreR, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(255,255,255,1)"
  ctx.shadowBlur = hovered ? 22 : 14
  ctx.shadowColor = "rgba(180,230,255,1)"
  ctx.fill(); ctx.shadowBlur = 0
}

// ── GRAVITATIONAL FIELD PARTICLES ─────────────────────────────────────────────
interface GravParticle { x: number; y: number; vx: number; vy: number; alpha: number; size: number }

function makeGravParticles(count: number): GravParticle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * (window.innerWidth || 1400),
    y: Math.random() * (window.innerHeight || 900),
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    alpha: 0.2 + Math.random() * 0.55,
    size: 0.7 + Math.random() * 1.3,
  }))
}

// ── SOLAR SYSTEM ──────────────────────────────────────────────────────────────
interface SSPlanet { orbitR: number; angle: number; speed: number; r: number; color: string; trail: { x: number; y: number }[] }
interface SolarSystemState { planets: SSPlanet[]; sunPulse: number; clickFlare: number }
function initSolarSystem(): SolarSystemState {
  return {
    planets: [
      { orbitR: 13, angle: 0,            speed: 0.07,  r: 2.2, color: "220,180,140", trail: [] },
      { orbitR: 22, angle: Math.PI * 0.7, speed: 0.042, r: 2.8, color: "100,180,255", trail: [] },
      { orbitR: 32, angle: Math.PI * 1.4, speed: 0.024, r: 2.0, color: "200,140,80",  trail: [] },
    ],
    sunPulse: 0,
    clickFlare: 0,
  }
}

function drawSolarSystem(
  ctx: CanvasRenderingContext2D,
  st: SolarSystemState,
  hovered: boolean, justClicked: boolean
) {
  ctx.clearRect(0, 0, W, W)
  const speedMult = hovered ? 2.2 : 1

  if (justClicked) st.clickFlare = 12

  st.sunPulse += 0.08
  if (st.clickFlare > 0) st.clickFlare--

  // Orbit rings
  for (const p of st.planets) {
    ctx.beginPath(); ctx.arc(CX, CY, p.orbitR, 0, Math.PI * 2)
    ctx.strokeStyle = "rgba(255,255,255,0.07)"
    ctx.lineWidth = 0.5; ctx.stroke()
  }

  // Sun
  const sunR = 4.5 + 0.5 * Math.sin(st.sunPulse)
  const flareExtra = st.clickFlare > 0 ? st.clickFlare * 1.2 : 0
  const sunGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, sunR + 8 + flareExtra)
  sunGrad.addColorStop(0,    "rgba(255,240,120,1)")
  sunGrad.addColorStop(0.35, "rgba(255,180,40,0.9)")
  sunGrad.addColorStop(0.7,  "rgba(255,100,20,0.35)")
  sunGrad.addColorStop(1,    "rgba(255,80,0,0)")
  ctx.beginPath(); ctx.arc(CX, CY, sunR + 8 + flareExtra, 0, Math.PI * 2)
  ctx.fillStyle = sunGrad; ctx.fill()

  ctx.beginPath(); ctx.arc(CX, CY, sunR, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(255,240,120,1)"
  ctx.shadowBlur = 10; ctx.shadowColor = "rgba(255,160,40,0.9)"
  ctx.fill(); ctx.shadowBlur = 0

  // Planets + trails
  for (const p of st.planets) {
    p.angle += p.speed * speedMult
    const px = CX + Math.cos(p.angle) * p.orbitR
    const py = CY + Math.sin(p.angle) * p.orbitR

    // Trail
    p.trail.push({ x: px, y: py })
    if (p.trail.length > 14) p.trail.shift()
    for (let i = 0; i < p.trail.length; i++) {
      const a = (i / p.trail.length) * 0.35
      ctx.beginPath(); ctx.arc(p.trail[i].x, p.trail[i].y, p.r * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${p.color},${a})`; ctx.fill()
    }

    // Planet body
    const pGrad = ctx.createRadialGradient(px - p.r * 0.3, py - p.r * 0.3, 0, px, py, p.r)
    pGrad.addColorStop(0, `rgba(${p.color},1)`)
    pGrad.addColorStop(1, `rgba(${p.color},0.5)`)
    ctx.beginPath(); ctx.arc(px, py, p.r, 0, Math.PI * 2)
    ctx.fillStyle = pGrad; ctx.fill()
  }

  // Saturn-style ring on planet 3
  const p3 = st.planets[2]
  const rx = CX + Math.cos(p3.angle) * p3.orbitR
  const ry = CY + Math.sin(p3.angle) * p3.orbitR
  ctx.save(); ctx.translate(rx, ry); ctx.scale(1, 0.38)
  ctx.beginPath(); ctx.arc(0, 0, p3.r + 3.5, 0, Math.PI * 2)
  ctx.strokeStyle = "rgba(200,140,80,0.55)"; ctx.lineWidth = 1.2; ctx.stroke()
  ctx.restore()
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const HOVER_SEL =
  "button, a, .project-card, .tilt-card, .contact-link, .resume-btn, " +
  ".navbar-brand, .placeholder-card, .timeline-card, .about-stat, .project-card-h"

export default function CursorSystem() {
  const [, setMode] = useState<CursorMode>("pulsar")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mx  = useRef(-999), my  = useRef(-999)
  const vx  = useRef(0),    vy  = useRef(0)
  const isHovered  = useRef(false)
  const isClicked  = useRef(false)
  const prevClicked = useRef(false)
  const modeRef = useRef<CursorMode>("pulsar")

  const pulsarSt      = useRef(initPulsar())
  const lightsaberSt  = useRef(initLightsaber())
  const spaceshipSt   = useRef(initSpaceship())
  const blackholeSt   = useRef(initBlackhole())
  const whiteHoleSt   = useRef(initWhitehole())
  const solarSystemSt = useRef(initSolarSystem())
  const fieldCanvasRef = useRef<HTMLCanvasElement>(null)
  const gravParticles  = useRef<GravParticle[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("protocol-cursor") as CursorMode | null
    const valid: CursorMode[] = ["pulsar", "lightsaber", "spaceship", "blackhole", "whitehole", "solarsystem"]
    if (saved && valid.includes(saved)) {
      setMode(saved); modeRef.current = saved
    }
  }, [])

  useEffect(() => {
    const onCursorChange = (e: Event) => {
      const m = (e as CustomEvent<CursorMode>).detail
      setMode(m); modeRef.current = m
    }
    window.addEventListener("cursor-change", onCursorChange)
    return () => window.removeEventListener("cursor-change", onCursorChange)
  }, [])

  useEffect(() => {
    gravParticles.current = makeGravParticles(90)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    let animId: number
    let hoverCheckX = -999, hoverCheckY = -999

    const onMove = (e: MouseEvent) => {
      const px = mx.current, py = my.current
      mx.current = e.clientX; my.current = e.clientY
      vx.current = mx.current - px
      vy.current = my.current - py
      canvas.style.left = mx.current - W / 2 + "px"
      canvas.style.top  = my.current - W / 2 + "px"
    }
    const onDown = () => { isClicked.current = true }
    const onUp   = () => { isClicked.current = false }

    const draw = (now: number) => {
      if (mx.current !== hoverCheckX || my.current !== hoverCheckY) {
        hoverCheckX = mx.current; hoverCheckY = my.current
        if (mx.current !== -999) {
          const el = document.elementFromPoint(mx.current, my.current)
          isHovered.current = !!(el && el !== canvas && el.closest(HOVER_SEL))
        }
      }
      const justClicked = isClicked.current && !prevClicked.current
      prevClicked.current = isClicked.current

      const m = modeRef.current
      if      (m === "pulsar")      drawPulsar(ctx, pulsarSt.current, isHovered.current, justClicked, vx.current, vy.current, now)
      else if (m === "lightsaber")  drawLightsaber(ctx, lightsaberSt.current, isHovered.current, justClicked, vx.current, vy.current)
      else if (m === "spaceship")   drawSpaceship(ctx, spaceshipSt.current, isHovered.current, justClicked, vx.current, vy.current)
      else if (m === "blackhole")   drawBlackhole(ctx, blackholeSt.current, isHovered.current, justClicked, now)
      else if (m === "whitehole")   drawWhitehole(ctx, whiteHoleSt.current, isHovered.current, justClicked, now)
      else if (m === "solarsystem") drawSolarSystem(ctx, solarSystemSt.current, isHovered.current, justClicked)

      // ── Gravitational field canvas ──────────────────────────────────────
      const fcv = fieldCanvasRef.current
      if (fcv) {
        const fctx = fcv.getContext("2d")!
        const vw = window.innerWidth, vh = window.innerHeight
        if (fcv.width !== vw || fcv.height !== vh) { fcv.width = vw; fcv.height = vh }

        if (m === "blackhole" || m === "whitehole") {
          fctx.clearRect(0, 0, vw, vh)
          const cx = mx.current, cy = my.current
          const pull = m === "blackhole"
          const particles = gravParticles.current

          for (const p of particles) {
            const dx = cx - p.x, dy = cy - p.y
            const dist = Math.hypot(dx, dy) || 1

            if (pull) {
              // Gravity pull toward cursor
              const force = Math.min(5500 / (dist * dist), 3.2)
              p.vx += (dx / dist) * force * 0.016
              p.vy += (dy / dist) * force * 0.016
              p.vx *= 0.972; p.vy *= 0.972
              // Consumed — respawn at random edge
              if (dist < 16) {
                p.x = Math.random() * vw; p.y = Math.random() * vh
                p.vx = (Math.random() - 0.5) * 0.4
                p.vy = (Math.random() - 0.5) * 0.4
                p.alpha = 0.15 + Math.random() * 0.4
              }
            } else {
              // Repulsion away from cursor
              const rdx = p.x - cx, rdy = p.y - cy
              const rd = Math.hypot(rdx, rdy) || 1
              const force = Math.min(6000 / (rd * rd + 60), 4)
              p.vx += (rdx / rd) * force * 0.016
              p.vy += (rdy / rd) * force * 0.016
              p.vx *= 0.965; p.vy *= 0.965
              // Flew off screen — respawn near cursor
              if (p.x < -60 || p.x > vw + 60 || p.y < -60 || p.y > vh + 60) {
                const ang = Math.random() * Math.PI * 2
                const d = 12 + Math.random() * 22
                p.x = cx + Math.cos(ang) * d; p.y = cy + Math.sin(ang) * d
                p.vx = 0; p.vy = 0
                p.alpha = 0.4 + Math.random() * 0.5
              }
            }

            p.x += p.vx; p.y += p.vy

            // Brightness boost when close (black hole) or near spawn (white hole)
            const distFactor = pull ? Math.min(1, 160 / (dist + 8)) : 1
            const a = Math.min(p.alpha * (0.5 + distFactor * 0.7), 0.9)

            // Core dot
            fctx.beginPath()
            fctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
            fctx.fillStyle = pull
              ? `rgba(100,190,255,${a})`
              : `rgba(220,240,255,${a})`
            fctx.fill()

            // Soft glow halo for brighter particles
            if (a > 0.38) {
              fctx.beginPath()
              fctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
              fctx.fillStyle = pull
                ? `rgba(77,160,255,${a * 0.12})`
                : `rgba(200,230,255,${a * 0.12})`
              fctx.fill()
            }
          }
        } else {
          fctx.clearRect(0, 0, vw, vh)
        }
      }

      animId = requestAnimationFrame(draw)
    }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mousedown", onDown)
    window.addEventListener("mouseup",   onUp)
    animId = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mousedown", onDown)
      window.removeEventListener("mouseup",   onUp)
    }
  }, [])

  return (
    <>
      {/* Full-screen gravitational field layer */}
      <canvas
        ref={fieldCanvasRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 9998,
        }}
      />
      {/* Cursor canvas */}
      <canvas
        ref={canvasRef}
        id="protocol-cursor"
        width={W}
        height={W}
        style={{
          position: "fixed",
          pointerEvents: "none",
          zIndex: 9999,
          left: "-999px",
          top: "-999px",
        }}
      />
    </>
  )
}
