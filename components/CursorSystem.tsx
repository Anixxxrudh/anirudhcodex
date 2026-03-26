"use client"
import { useEffect, useRef, useState } from "react"

export type CursorMode = "pulsar" | "lightsaber" | "spaceship" | "blackhole"

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

  const pulsarSt     = useRef(initPulsar())
  const lightsaberSt = useRef(initLightsaber())
  const spaceshipSt  = useRef(initSpaceship())
  const blackholeSt  = useRef(initBlackhole())

  useEffect(() => {
    const saved = localStorage.getItem("protocol-cursor") as CursorMode | null
    const valid: CursorMode[] = ["pulsar", "lightsaber", "spaceship", "blackhole"]
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
      if      (m === "pulsar")     drawPulsar(ctx, pulsarSt.current, isHovered.current, justClicked, vx.current, vy.current, now)
      else if (m === "lightsaber") drawLightsaber(ctx, lightsaberSt.current, isHovered.current, justClicked, vx.current, vy.current)
      else if (m === "spaceship")  drawSpaceship(ctx, spaceshipSt.current, isHovered.current, justClicked, vx.current, vy.current)
      else if (m === "blackhole")  drawBlackhole(ctx, blackholeSt.current, isHovered.current, justClicked, now)

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
  )
}
