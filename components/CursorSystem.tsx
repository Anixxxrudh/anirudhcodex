"use client"
import { useEffect, useRef, useState } from "react"

type CursorMode = "solar" | "constellation" | "pulsar" | "glitch" | "magnetic"

const HOVER_SEL =
  "button, a, .project-card, .tilt-card, .contact-link, .resume-btn, " +
  ".navbar-brand, .now-card, .placeholder-card, .timeline-card, " +
  ".about-stat, .cursor-option, .cursor-switcher-btn"

const CURSOR_LIST: { id: CursorMode; label: string; icon: string }[] = [
  { id: "solar",         label: "SOLAR GRID",   icon: "⊞" },
  { id: "constellation", label: "CONSTELLATION", icon: "✦" },
  { id: "pulsar",        label: "PULSAR",        icon: "◉" },
  { id: "glitch",        label: "GLITCH",        icon: "▣" },
  { id: "magnetic",      label: "MAGNETIC",      icon: "⊙" },
]

const W = 70   // main canvas size
const CX = 35  // canvas center x
const CY = 35  // canvas center y

// ─────────────────────────────────────────────────────────────────────────────
// CURSOR 1: SOLAR GRID
// ─────────────────────────────────────────────────────────────────────────────
interface SolarState {
  ringAngle: number
  cells: { alpha: number; target: number }[]
  lastPulse: number
  trail: { x: number; y: number }[]
  clickFlash: number
}
function initSolar(): SolarState {
  return {
    ringAngle: 0,
    cells: Array.from({ length: 9 }, () => ({ alpha: 0.12, target: 0.12 })),
    lastPulse: 0,
    trail: [],
    clickFlash: 0,
  }
}

function drawSolar(
  ctx: CanvasRenderingContext2D,
  st: SolarState,
  hovered: boolean, justClicked: boolean,
  mx: number, my: number,
  vx: number, vy: number,
  now: number
) {
  ctx.clearRect(0, 0, W, W)
  const speed = Math.hypot(vx, vy)

  // Update trail
  st.trail.unshift({ x: mx, y: my })
  if (st.trail.length > 6) st.trail.length = 6

  // Draw trail (canvas-relative — same position = center since canvas moves with mouse)
  for (let i = 1; i < st.trail.length; i++) {
    const tp = st.trail[i]
    const ox = tp.x - mx + CX
    const oy = tp.y - my + CY
    if (ox < 0 || ox > W || oy < 0 || oy > W) continue
    const alpha = 0.03 + (0.1 - 0.03) * (1 - i / st.trail.length)
    ctx.beginPath()
    ctx.arc(ox, oy, 2, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(77,184,255,${alpha})`
    ctx.fill()
  }

  if (justClicked) {
    st.clickFlash = 2
    st.cells.forEach(c => { c.alpha = 1; c.target = 0.12 })
  }
  if (st.clickFlash > 0) st.clickFlash--

  // Idle pulse: random cell every 300ms
  if (!hovered && speed < 2 && now - st.lastPulse > 300) {
    st.cells[Math.floor(Math.random() * 9)].target = 0.55
    st.lastPulse = now
  }

  // Movement wave
  if (speed > 2.5) {
    const ang = Math.atan2(vy, vx)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if ((c - 1) * Math.cos(ang) + (r - 1) * Math.sin(ang) > 0.3)
          st.cells[r * 3 + c].target = Math.min(0.65, st.cells[r * 3 + c].target + 0.12)
      }
    }
  }

  // Hover: all cells bright
  if (hovered) st.cells.forEach(c => { c.target = 0.65 })

  // Update cell alphas toward targets
  for (const c of st.cells) {
    c.alpha += (c.target - c.alpha) * 0.1
    if (c.target > 0.12 && Math.abs(c.alpha - c.target) < 0.008) c.target = 0.12
  }

  // Ring
  st.ringAngle += hovered ? 3.5 : speed > 2.5 ? 2.2 : 0.8
  const ringR = hovered ? 34 : 28
  ctx.save()
  ctx.translate(CX, CY)
  ctx.rotate(st.ringAngle * Math.PI / 180)
  ctx.strokeStyle = hovered ? "rgba(77,184,255,0.7)" : "rgba(77,184,255,0.4)"
  ctx.lineWidth = 1
  ctx.setLineDash([4, 3])
  ctx.beginPath(); ctx.arc(0, 0, ringR, 0, Math.PI * 2); ctx.stroke()
  if (hovered) {
    ctx.strokeStyle = "rgba(77,184,255,0.15)"
    ctx.lineWidth = 0.5; ctx.setLineDash([2, 5])
    ctx.beginPath(); ctx.arc(0, 0, ringR + 6, 0, Math.PI * 2); ctx.stroke()
  }
  ctx.restore(); ctx.setLineDash([])

  // 3×3 grid
  const CELL = 6, GAP = 1.5
  const tot = 3 * CELL + 2 * GAP
  const off = (W - tot) / 2
  const base = hovered ? 0.45 : speed > 2.5 ? 0.3 : 0.12
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const i = r * 3 + c
      const x = off + c * (CELL + GAP), y = off + r * (CELL + GAP)
      const a = Math.max(base, st.cells[i].alpha)
      ctx.fillStyle = `rgba(77,184,255,${a})`
      ctx.fillRect(x, y, CELL, CELL)
      ctx.strokeStyle = `rgba(77,184,255,${Math.min(a * 2.5, 0.9)})`
      ctx.lineWidth = 0.5; ctx.strokeRect(x, y, CELL, CELL)
    }
  }

  // Click ripple
  if (st.clickFlash > 0) {
    ctx.beginPath()
    ctx.arc(CX, CY, 28 + (2 - st.clickFlash) * 12, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(77,184,255,${st.clickFlash * 0.3})`
    ctx.lineWidth = 1; ctx.stroke()
  }

  // Center dot
  ctx.beginPath(); ctx.arc(CX, CY, 2, 0, Math.PI * 2)
  ctx.fillStyle = "white"; ctx.fill()
}

// ─────────────────────────────────────────────────────────────────────────────
// CURSOR 2: CONSTELLATION
// ─────────────────────────────────────────────────────────────────────────────
interface Star {
  wx: number; wy: number
  age: number; maxAge: number
  sz: number; dx: number; dy: number
}
interface ConstellationState {
  stars: Star[]
  lastSpawn: number
}
function initConstellation(): ConstellationState {
  return { stars: [], lastSpawn: 0 }
}

function drawConstellation(
  ctx: CanvasRenderingContext2D,
  st: ConstellationState,
  hovered: boolean, justClicked: boolean,
  mx: number, my: number, pmx: number, pmy: number,
  now: number
) {
  ctx.clearRect(0, 0, W, W)
  const speed = Math.hypot(mx - pmx, my - pmy)

  // Spawn star when moving
  if (speed > 0.8 && now - st.lastSpawn > 80 && st.stars.length < 12) {
    st.stars.push({
      wx: mx, wy: my,
      age: 0, maxAge: 150,
      sz: 1.5 + Math.random(),
      dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6,
    })
    st.lastSpawn = now
  }

  if (justClicked) {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      st.stars.push({
        wx: mx + Math.cos(a) * 10, wy: my + Math.sin(a) * 10,
        age: 0, maxAge: 100,
        sz: 1.5 + Math.random(),
        dx: Math.cos(a) * 0.8, dy: Math.sin(a) * 0.8,
      })
    }
    if (st.stars.length > 18) st.stars = st.stars.slice(-12)
  }

  // Update stars
  const alive: Star[] = []
  for (const s of st.stars) {
    s.wx += s.dx; s.wy += s.dy; s.age++
    if (s.age >= s.maxAge) continue
    alive.push(s)
    const t = s.age / s.maxAge
    let alpha = 1 - t * t
    if (Math.hypot(s.wx - mx, s.wy - my) < 60) alpha = Math.min(1, alpha + 0.2)
    const sx = s.wx - mx + CX, sy = s.wy - my + CY
    ctx.beginPath(); ctx.arc(sx, sy, s.sz, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,255,255,${alpha})`; ctx.fill()
  }
  st.stars = alive

  // Constellation lines between neighbors
  for (let i = 0; i < alive.length; i++) {
    const near = alive
      .map((sj, j) => ({ sj, j, d: Math.hypot(alive[i].wx - sj.wx, alive[i].wy - sj.wy) }))
      .filter(e => e.j !== i && e.d < 100)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
    const ti = 1 - alive[i].age / alive[i].maxAge
    for (const { sj, d } of near) {
      const tj = 1 - sj.age / sj.maxAge
      const alpha = 0.15 * (1 - d / 100) * ti * tj
      ctx.beginPath()
      ctx.moveTo(alive[i].wx - mx + CX, alive[i].wy - my + CY)
      ctx.lineTo(sj.wx - mx + CX, sj.wy - my + CY)
      ctx.strokeStyle = `rgba(77,184,255,${alpha})`
      ctx.lineWidth = 0.5; ctx.stroke()
    }
  }

  // Center dot
  const r = hovered ? 5 : 3
  ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2)
  ctx.fillStyle = "white"
  if (hovered) { ctx.shadowBlur = 12; ctx.shadowColor = "rgba(77,184,255,0.8)" }
  ctx.fill(); ctx.shadowBlur = 0
}

// ─────────────────────────────────────────────────────────────────────────────
// CURSOR 3: PULSAR
// ─────────────────────────────────────────────────────────────────────────────
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
  const rate = hovered ? 250 : speed > 2 ? 400 : 800

  if (now - st.lastEmit > rate) {
    st.rings.push({ t0: now, maxR: 36, dur: 1000 })
    st.lastEmit = now
  }
  if (justClicked) {
    st.rings.push({ t0: now,       maxR: 60, dur: 800 })
    st.rings.push({ t0: now - 80,  maxR: 36, dur: 800 })
    st.rings.push({ t0: now - 160, maxR: 36, dur: 800 })
    if (st.rings.length > 9) st.rings = st.rings.slice(-9)
  }

  // Purge old rings
  st.rings = st.rings.filter(r => now - r.t0 < r.dur)

  const ang = Math.atan2(vy, vx)
  for (const ring of st.rings) {
    const t = (now - ring.t0) / ring.dur
    const r = ring.maxR * t
    const op = (1 - t) * (hovered ? 1 : 0.7)
    if (op <= 0 || r <= 0) continue
    ctx.save(); ctx.translate(CX, CY)
    if (speed > 2) {
      const elong = 1 + (speed / 50) * 0.25
      ctx.rotate(ang); ctx.scale(elong, 1 / elong); ctx.rotate(-ang)
    }
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(77,184,255,${op})`
    ctx.lineWidth = 1; ctx.stroke(); ctx.restore()
  }

  // Center dot
  ctx.beginPath(); ctx.arc(CX, CY, hovered ? 5 : 3, 0, Math.PI * 2)
  ctx.fillStyle = "white"
  ctx.shadowBlur = hovered ? 12 : 6
  ctx.shadowColor = "rgba(77,184,255,0.9)"
  ctx.fill(); ctx.shadowBlur = 0
}

// ─────────────────────────────────────────────────────────────────────────────
// CURSOR 4: GLITCH
// ─────────────────────────────────────────────────────────────────────────────
interface GlitchState {
  glitching: boolean
  gframe: number; gdur: number
  lastGlitch: number; nextGlitch: number
}
function initGlitch(): GlitchState {
  return {
    glitching: false, gframe: 0, gdur: 0,
    lastGlitch: 0, nextGlitch: 2000 + Math.random() * 2000,
  }
}

function drawGlitch(
  ctx: CanvasRenderingContext2D,
  st: GlitchState,
  hovered: boolean, justClicked: boolean,
  vx: number, vy: number, now: number
) {
  ctx.clearRect(0, 0, W, W)
  const speed = Math.hypot(vx, vy)

  if (justClicked) { st.glitching = true; st.gframe = 0; st.gdur = 15 }

  // Auto glitch
  const interval = hovered ? 800 : st.nextGlitch
  if (!st.glitching && now - st.lastGlitch > interval) {
    st.glitching = true; st.gframe = 0
    st.gdur = 8 + Math.floor(Math.random() * 4)
    st.lastGlitch = now
    st.nextGlitch = hovered ? 800 : 2000 + Math.random() * 2000
  }
  if (st.glitching) { st.gframe++; if (st.gframe >= st.gdur) st.glitching = false }

  const drawAt = (ox: number, oy: number, col: string, dash?: number[]) => {
    const x = CX + ox, y = CY + oy
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = col; ctx.fill()
    ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2)
    ctx.strokeStyle = col; ctx.lineWidth = 1
    ctx.setLineDash(dash ?? []); ctx.stroke(); ctx.setLineDash([])
  }

  if (st.glitching) {
    const os = justClicked ? 8 : 4
    ctx.globalAlpha = 0.7
    drawAt(os, -os / 2, "rgba(255,50,50,0.9)", [2, 4])
    drawAt(-os, os / 2, "rgba(50,255,200,0.9)", [2, 4])
    drawAt(0, os * 0.75, "rgba(77,184,255,0.8)", [2, 4])
    ctx.globalAlpha = 1
    for (let sy = CY - 12; sy < CY + 12; sy += 4) {
      ctx.fillStyle = `rgba(77,184,255,${0.03 + Math.random() * 0.04})`
      ctx.fillRect(CX - 14, sy, 28, 1)
    }
  } else if (speed > 1.5) {
    // Motion blur
    ctx.globalAlpha = 0.3; drawAt(-vx * 0.3, -vy * 0.3, "rgba(255,255,255,0.9)"); ctx.globalAlpha = 1
    ctx.globalAlpha = 0.15; drawAt(-vx * 0.6, -vy * 0.6, "rgba(255,255,255,0.9)"); ctx.globalAlpha = 1
  }

  drawAt(0, 0, "white")
}

// ─────────────────────────────────────────────────────────────────────────────
// CURSOR 5: MAGNETIC
// ─────────────────────────────────────────────────────────────────────────────
interface MagTarget { cx: number; cy: number; w: number; h: number }
interface MagState {
  rx: number; ry: number
  breath: number
  clickPhase: number
  targets: MagTarget[]
  lastTargetUpdate: number
}
function initMagnetic(): MagState {
  return { rx: -9999, ry: -9999, breath: 0, clickPhase: 0, targets: [], lastTargetUpdate: 0 }
}

function drawMagnetic(
  ctx: CanvasRenderingContext2D,
  st: MagState,
  hovered: boolean, justClicked: boolean,
  mx: number, my: number, now: number
) {
  ctx.clearRect(0, 0, W, W)
  if (st.rx === -9999) { st.rx = mx; st.ry = my }

  // Refresh targets every 500ms
  if (now - st.lastTargetUpdate > 500) {
    st.lastTargetUpdate = now
    const els = document.querySelectorAll<HTMLElement>(HOVER_SEL)
    st.targets = Array.from(els).map(el => {
      const r = el.getBoundingClientRect()
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width, h: r.height }
    })
  }

  // Compute magnetic pull
  let pullX = 0, pullY = 0
  let nearestDist = Infinity
  let nearestTarget: MagTarget | null = null
  for (const t of st.targets) {
    const d = Math.hypot(st.rx - t.cx, st.ry - t.cy)
    if (d < nearestDist) { nearestDist = d; nearestTarget = t }
    if (d < 80) {
      const strength = Math.pow(1 - d / 80, 2)
      pullX += (t.cx - st.rx) * strength * 0.4
      pullY += (t.cy - st.ry) * strength * 0.4
    }
  }
  const pullLen = Math.hypot(pullX, pullY)
  if (pullLen > 24) { pullX = pullX / pullLen * 24; pullY = pullY / pullLen * 24 }

  if (justClicked) st.clickPhase = 0.01
  if (st.clickPhase > 0) { st.clickPhase += 0.3; if (st.clickPhase > Math.PI * 2) st.clickPhase = 0 }
  const springMult = st.clickPhase > 0 ? 1 - 0.35 * Math.sin(st.clickPhase) : 1

  // Lerp ring toward (mouse + pull)
  const targetRx = mx + pullX, targetRy = my + pullY
  st.rx += (targetRx - st.rx) * 0.08
  st.ry += (targetRy - st.ry) * 0.08

  // Breathing
  st.breath += 0.04
  const snapped = nearestDist < 40 && nearestTarget !== null
  const breathScale = snapped ? 1 : (0.95 + 0.05 * Math.sin(st.breath))
  const scale = breathScale * springMult

  // Ring in canvas coords (canvas center = mouse position)
  const rcx = Math.max(16, Math.min(W - 16, st.rx - mx + CX))
  const rcy = Math.max(16, Math.min(W - 16, st.ry - my + CY))

  const ringR = snapped && nearestTarget
    ? Math.max(10, Math.min(nearestTarget.w, nearestTarget.h) * 0.3) * scale
    : 16 * scale

  // Elastic line
  if (Math.hypot(rcx - CX, rcy - CY) > 5) {
    ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(rcx, rcy)
    ctx.strokeStyle = "rgba(77,184,255,0.25)"; ctx.lineWidth = 0.5; ctx.stroke()
  }

  // Outer ring (stretches toward nearest target)
  if (nearestDist < 80 && nearestTarget) {
    const dx = nearestTarget.cx - st.rx, dy = nearestTarget.cy - st.ry
    const ang = Math.atan2(dy, dx)
    const stretch = 1 + (1 - nearestDist / 80) * 0.25
    ctx.save(); ctx.translate(rcx, rcy); ctx.rotate(ang); ctx.scale(stretch, 1 / stretch); ctx.rotate(-ang)
    ctx.beginPath(); ctx.arc(0, 0, ringR, 0, Math.PI * 2)
    ctx.strokeStyle = snapped ? "rgba(77,184,255,0.35)" : "rgba(255,255,255,0.25)"
    ctx.lineWidth = 1; ctx.stroke(); ctx.restore()
  } else {
    ctx.beginPath(); ctx.arc(rcx, rcy, ringR, 0, Math.PI * 2)
    ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 1; ctx.stroke()
  }

  // Inner dot at mouse (canvas center)
  ctx.beginPath(); ctx.arc(CX, CY, 4, 0, Math.PI * 2)
  ctx.fillStyle = "white"; ctx.fill()
}

// ─────────────────────────────────────────────────────────────────────────────
// MINI PREVIEW RENDERERS (simplified, 32×32)
// ─────────────────────────────────────────────────────────────────────────────
type StopFn = () => void

function miniSolar(c: HTMLCanvasElement): StopFn {
  const ctx = c.getContext("2d")!; const S = c.width
  const cells = Array.from({ length: 9 }, () => ({ a: 0.12 }))
  let frame = 0, lastPulse = 0, id = 0
  const loop = (now: number) => {
    ctx.clearRect(0, 0, S, S); frame++
    const cx = S / 2
    ctx.save(); ctx.translate(cx, cx); ctx.rotate(frame * 0.8 * Math.PI / 180)
    ctx.strokeStyle = "rgba(77,184,255,0.4)"; ctx.lineWidth = 0.5
    ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.arc(0, 0, S * 0.38, 0, Math.PI * 2); ctx.stroke()
    ctx.restore(); ctx.setLineDash([])
    if (now - lastPulse > 300) { cells[Math.floor(Math.random() * 9)].a = 0.6; lastPulse = now }
    for (const c of cells) c.a += (0.12 - c.a) * 0.1
    const cell = S * 0.17, gap = S * 0.04, tot = 3 * cell + 2 * gap, off = (S - tot) / 2
    for (let r = 0; r < 3; r++) for (let cc = 0; cc < 3; cc++) {
      ctx.fillStyle = `rgba(77,184,255,${cells[r * 3 + cc].a})`
      ctx.fillRect(off + cc * (cell + gap), off + r * (cell + gap), cell, cell)
    }
    ctx.beginPath(); ctx.arc(cx, cx, 1.5, 0, Math.PI * 2); ctx.fillStyle = "white"; ctx.fill()
    id = requestAnimationFrame(loop)
  }
  id = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(id)
}

function miniConstellation(c: HTMLCanvasElement): StopFn {
  const ctx = c.getContext("2d")!; const S = c.width, cx = S / 2
  const stars = Array.from({ length: 6 }, () => ({
    x: cx + (Math.random() - 0.5) * S * 0.8,
    y: cx + (Math.random() - 0.5) * S * 0.8,
    a: Math.random(),
  }))
  let id = 0
  const loop = () => {
    ctx.clearRect(0, 0, S, S)
    for (let i = 0; i < stars.length; i++) {
      stars[i].a = Math.max(0.1, Math.min(0.9, stars[i].a + (Math.random() - 0.5) * 0.02))
      ctx.beginPath(); ctx.arc(stars[i].x, stars[i].y, 1.2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${stars[i].a})`; ctx.fill()
      if (i < stars.length - 1) {
        const d = Math.hypot(stars[i].x - stars[i + 1].x, stars[i].y - stars[i + 1].y)
        ctx.beginPath(); ctx.moveTo(stars[i].x, stars[i].y); ctx.lineTo(stars[i + 1].x, stars[i + 1].y)
        ctx.strokeStyle = `rgba(77,184,255,${0.12 * (1 - d / S)})`; ctx.lineWidth = 0.5; ctx.stroke()
      }
    }
    ctx.beginPath(); ctx.arc(cx, cx, 2, 0, Math.PI * 2); ctx.fillStyle = "white"; ctx.fill()
    id = requestAnimationFrame(loop)
  }
  id = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(id)
}

function miniPulsar(c: HTMLCanvasElement): StopFn {
  const ctx = c.getContext("2d")!; const S = c.width, cx = S / 2
  let id = 0, lastEmit = 0
  const rings: { t0: number; dur: number; maxR: number }[] = []
  const loop = (now: number) => {
    ctx.clearRect(0, 0, S, S)
    if (now - lastEmit > 800) { rings.push({ t0: now, dur: 1000, maxR: cx * 0.88 }); lastEmit = now }
    for (let i = rings.length - 1; i >= 0; i--) {
      const t = (now - rings[i].t0) / rings[i].dur
      if (t >= 1) { rings.splice(i, 1); continue }
      ctx.beginPath(); ctx.arc(cx, cx, rings[i].maxR * t, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(77,184,255,${(1 - t) * 0.7})`; ctx.lineWidth = 0.5; ctx.stroke()
    }
    ctx.beginPath(); ctx.arc(cx, cx, 2, 0, Math.PI * 2); ctx.fillStyle = "white"
    ctx.shadowBlur = 4; ctx.shadowColor = "rgba(77,184,255,0.8)"; ctx.fill(); ctx.shadowBlur = 0
    id = requestAnimationFrame(loop)
  }
  id = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(id)
}

function miniGlitch(c: HTMLCanvasElement): StopFn {
  const ctx = c.getContext("2d")!; const S = c.width, cx = S / 2
  let id = 0, frame = 0, glitch = 0
  const loop = () => {
    ctx.clearRect(0, 0, S, S); frame++
    if (glitch > 0) {
      glitch--
      ctx.globalAlpha = 0.7
      ctx.beginPath(); ctx.arc(cx + 2, cx - 1, 2.5, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,50,50,1)"; ctx.fill()
      ctx.beginPath(); ctx.arc(cx - 2, cx + 1, 2.5, 0, Math.PI * 2); ctx.fillStyle = "rgba(50,255,200,1)"; ctx.fill()
      ctx.globalAlpha = 1
      ctx.beginPath(); ctx.arc(cx, cx, cx * 0.7, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(77,184,255,0.4)"; ctx.lineWidth = 0.5
      ctx.setLineDash([2, 3]); ctx.stroke(); ctx.setLineDash([])
    } else {
      if (frame % 120 === 0) glitch = 8
      ctx.beginPath(); ctx.arc(cx, cx, cx * 0.7, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 0.5; ctx.stroke()
    }
    ctx.beginPath(); ctx.arc(cx, cx, 2.5, 0, Math.PI * 2); ctx.fillStyle = "white"; ctx.fill()
    id = requestAnimationFrame(loop)
  }
  id = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(id)
}

function miniMagnetic(c: HTMLCanvasElement): StopFn {
  const ctx = c.getContext("2d")!; const S = c.width, cx = S / 2
  let id = 0, phase = 0, rx = cx, ry = cx
  const loop = () => {
    ctx.clearRect(0, 0, S, S); phase += 0.04
    rx += (cx + Math.sin(phase * 0.7) * 4 - rx) * 0.05
    ry += (cx + Math.cos(phase * 0.5) * 4 - ry) * 0.05
    const scale = 0.95 + 0.05 * Math.sin(phase)
    if (Math.hypot(rx - cx, ry - cx) > 2) {
      ctx.beginPath(); ctx.moveTo(cx, cx); ctx.lineTo(rx, ry)
      ctx.strokeStyle = "rgba(77,184,255,0.2)"; ctx.lineWidth = 0.4; ctx.stroke()
    }
    ctx.beginPath(); ctx.arc(rx, ry, cx * 0.52 * scale, 0, Math.PI * 2)
    ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 0.5; ctx.stroke()
    ctx.beginPath(); ctx.arc(cx, cx, 2, 0, Math.PI * 2); ctx.fillStyle = "white"; ctx.fill()
    id = requestAnimationFrame(loop)
  }
  id = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(id)
}

const MINI_RUNNERS = [miniSolar, miniConstellation, miniPulsar, miniGlitch, miniMagnetic]

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function CursorSystem() {
  const [mode, setMode] = useState<CursorMode>("solar")
  const [panelOpen, setPanelOpen] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRefs = useRef<(HTMLCanvasElement | null)[]>([null, null, null, null, null])

  // Shared mouse state (refs — not state, updated every frame)
  const mx = useRef(-999), my = useRef(-999)
  const pmx = useRef(-999), pmy = useRef(-999)
  const vx = useRef(0), vy = useRef(0)
  const isHovered = useRef(false)
  const isClicked = useRef(false)
  const prevClicked = useRef(false)

  // Keep mode ref in sync so rAF closure always has the current mode
  const modeRef = useRef<CursorMode>("solar")
  useEffect(() => { modeRef.current = mode }, [mode])

  // Per-cursor states (refs — mutated each frame)
  const solarSt        = useRef(initSolar())
  const constellationSt = useRef(initConstellation())
  const pulsarSt       = useRef(initPulsar())
  const glitchSt       = useRef(initGlitch())
  const magneticSt     = useRef(initMagnetic())

  // Load saved cursor from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("protocol-cursor") as CursorMode | null
    const valid: CursorMode[] = ["solar", "constellation", "pulsar", "glitch", "magnetic"]
    if (saved && valid.includes(saved)) {
      setMode(saved)
      modeRef.current = saved
    }
  }, [])

  // Main rAF draw loop + event listeners
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    let animId: number

    const onMove = (e: MouseEvent) => {
      pmx.current = mx.current; pmy.current = my.current
      mx.current = e.clientX; my.current = e.clientY
      vx.current = mx.current - pmx.current
      vy.current = my.current - pmy.current
      canvas.style.left = mx.current - W / 2 + "px"
      canvas.style.top  = my.current - W / 2 + "px"
    }
    const onDown = () => { isClicked.current = true }
    const onUp   = () => { isClicked.current = false }

    let hoverCheckX = -999, hoverCheckY = -999

    const draw = (now: number) => {
      // elementFromPoint only when mouse has moved — skip on stationary frames
      if (mx.current !== hoverCheckX || my.current !== hoverCheckY) {
        hoverCheckX = mx.current; hoverCheckY = my.current
        if (mx.current !== -999) {
          const el = document.elementFromPoint(mx.current, my.current)
          isHovered.current = !!(el && el !== canvas && el.closest(HOVER_SEL))
        }
      }

      // Edge-detect click: true only on the first frame of a mousedown
      const justClicked = isClicked.current && !prevClicked.current
      prevClicked.current = isClicked.current

      const m = modeRef.current
      if (m === "solar") {
        drawSolar(ctx, solarSt.current, isHovered.current, justClicked, mx.current, my.current, vx.current, vy.current, now)
      } else if (m === "constellation") {
        drawConstellation(ctx, constellationSt.current, isHovered.current, justClicked, mx.current, my.current, pmx.current, pmy.current, now)
      } else if (m === "pulsar") {
        drawPulsar(ctx, pulsarSt.current, isHovered.current, justClicked, vx.current, vy.current, now)
      } else if (m === "glitch") {
        drawGlitch(ctx, glitchSt.current, isHovered.current, justClicked, vx.current, vy.current, now)
      } else if (m === "magnetic") {
        drawMagnetic(ctx, magneticSt.current, isHovered.current, justClicked, mx.current, my.current, now)
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

  // Mini preview rAF loops — start when panel opens, stop when it closes
  useEffect(() => {
    if (!panelOpen) return
    const stops: StopFn[] = []
    for (let i = 0; i < 5; i++) {
      const c = previewRefs.current[i]
      if (c) stops.push(MINI_RUNNERS[i](c))
    }
    return () => stops.forEach(fn => fn())
  }, [panelOpen])

  const selectMode = (m: CursorMode) => {
    setMode(m)
    modeRef.current = m
    localStorage.setItem("protocol-cursor", m)
    setTimeout(() => setPanelOpen(false), 400)
  }

  const currentIcon = CURSOR_LIST.find(c => c.id === mode)?.icon ?? "⊞"

  return (
    <>
      {/* Main cursor canvas */}
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

      {/* Cursor switcher panel — redesigned grid */}
      <div className="cursor-switcher">
        {panelOpen && (
          <div className="cursor-panel-v2">
            <div className="cursor-panel-header">SELECT CURSOR MODE</div>
            <div className="cursor-panel-grid">
              {CURSOR_LIST.map((c, i) => (
                <div
                  key={c.id}
                  className={`cursor-option-v2${mode === c.id ? " active" : ""}`}
                  onClick={() => selectMode(c.id)}
                >
                  {mode === c.id && <span className="cursor-active-badge" />}
                  <canvas
                    ref={el => { previewRefs.current[i] = el }}
                    width={44}
                    height={44}
                    style={{ width: 44, height: 44, flexShrink: 0 }}
                  />
                  <span className="cursor-option-v2-label">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span className="cursor-switcher-label">CURSOR</span>
          <button
            className="cursor-switcher-btn-v2"
            onClick={() => setPanelOpen(o => !o)}
            aria-label="Toggle cursor switcher"
          >
            <span style={{ fontSize: "1rem", color: "rgba(77,184,255,0.9)", lineHeight: 1 }}>
              {currentIcon}
            </span>
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.3rem",
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.25)",
            }}>
              {panelOpen ? "CLOSE" : "CHANGE"}
            </span>
          </button>
        </div>
      </div>
    </>
  )
}
