"use client"
import { useEffect, useRef } from "react"

interface Star { x: number; y: number; r: number; a: number }

export default function MusicBackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    // Pre-computed stars (once on mount, stored in closure)
    let stars: Star[] = []
    let animId: number
    let vinylAngle = 0
    let waveRingAngle = 0

    // Ripple ring state
    const RIPPLE_COUNT = 5
    const ripples = Array.from({ length: RIPPLE_COUNT }, (_, i) => ({
      r: 40 + (i / RIPPLE_COUNT) * 460,
      maxR: 500,
      minR: 40,
    }))

    // Sine wave phases
    const waves = [
      { amp: 20, freq: 0.008, phase: 0, speed: 0.02,  opacity: 0.12, lw: 1.5 },
      { amp: 35, freq: 0.005, phase: 2, speed: 0.015, opacity: 0.07, lw: 1.0 },
      { amp: 15, freq: 0.012, phase: 4, speed: 0.025, opacity: 0.09, lw: 1.0 },
    ]

    const buildStars = (cx: number, cy: number, diskR: number) => {
      stars = []
      for (let i = 0; i < 380; i++) {
        // Random point inside circle
        const angle = Math.random() * Math.PI * 2
        const dist  = Math.sqrt(Math.random()) * diskR * 0.96
        stars.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          r: 0.5 + Math.random() * 1.0,
          a: 0.3 + Math.random() * 0.5,
        })
      }
    }

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      const diskR = Math.min(canvas.width, canvas.height) * 0.35
      buildStars(cx, cy, diskR)
    }

    const draw = (now: number) => {
      const W = canvas.width
      const H = canvas.height
      const cx = W / 2
      const cy = H / 2
      const diskR = Math.min(W, H) * 0.35

      ctx.clearRect(0, 0, W, H)

      // ── LAYER 4: RIPPLE RINGS (draw behind vinyl) ─────────────────────
      for (const rp of ripples) {
        rp.r += 0.7
        if (rp.r > rp.maxR) rp.r = rp.minR
        const t = (rp.r - rp.minR) / (rp.maxR - rp.minR)
        const op = 0.15 * (1 - t)
        ctx.beginPath()
        ctx.arc(cx, cy, rp.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(77,184,255,${op})`
        ctx.lineWidth = 0.8
        ctx.stroke()
      }

      // ── LAYER 1: MILKY WAY VINYL RECORD ──────────────────────────────
      vinylAngle += (Math.PI * 2) / (18 * 60) // 18s per rotation at 60fps

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(vinylAngle)
      ctx.globalAlpha = 0.55

      // Disk fill — radial gradient (galactic core)
      const diskGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, diskR)
      diskGrad.addColorStop(0,    "rgba(180,210,255,0.15)")
      diskGrad.addColorStop(0.35, "rgba(77,184,255,0.09)")
      diskGrad.addColorStop(0.7,  "rgba(77,184,255,0.04)")
      diskGrad.addColorStop(1,    "rgba(0,0,0,0)")
      ctx.beginPath()
      ctx.arc(0, 0, diskR, 0, Math.PI * 2)
      ctx.fillStyle = diskGrad
      ctx.fill()

      // Vinyl groove rings
      const GROOVE_COUNT = 52
      for (let i = 1; i <= GROOVE_COUNT; i++) {
        const gr = (i / GROOVE_COUNT) * diskR * 0.96
        const op = i % 2 === 0 ? 0.08 : 0.04
        ctx.beginPath()
        ctx.arc(0, 0, gr, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(77,184,255,${op})`
        ctx.lineWidth = 0.6
        ctx.stroke()
      }

      // Stars scattered across disk (pre-computed, draw in rotated space)
      for (const s of stars) {
        // Stars are in world space; compensate rotation so they rotate with vinyl
        const cosA = Math.cos(-vinylAngle)
        const sinA = Math.sin(-vinylAngle)
        const lx = s.x - cx
        const ly = s.y - cy
        const rx = lx * cosA - ly * sinA
        const ry = lx * sinA + ly * cosA
        ctx.beginPath()
        ctx.arc(rx, ry, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.a})`
        ctx.fill()
      }

      // Center hole
      const holeGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 18)
      holeGlow.addColorStop(0,   "rgba(220,240,255,0.9)")
      holeGlow.addColorStop(0.4, "rgba(180,220,255,0.6)")
      holeGlow.addColorStop(1,   "rgba(77,184,255,0)")
      ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2)
      ctx.fillStyle = holeGlow; ctx.fill()
      ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(220,240,255,0.85)"; ctx.fill()

      ctx.globalAlpha = 1
      ctx.restore()

      // ── LAYER 3: BREATHING WAVEFORM RING ─────────────────────────────
      waveRingAngle -= 0.003 // counter-clockwise, slower
      const ringBaseR = diskR * 1.18
      const POINTS = 180
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(waveRingAngle)
      ctx.beginPath()
      for (let i = 0; i <= POINTS; i++) {
        const a = (i / POINTS) * Math.PI * 2
        const displacement = 8 + 12 * Math.sin(a * 6 + now * 0.001) * Math.cos(a * 3 + now * 0.0007)
        const r = ringBaseR + displacement
        const x = Math.cos(a) * r
        const y = Math.sin(a) * r
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.strokeStyle = "rgba(77,184,255,0.18)"
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()

      // ── LAYER 2: OSCILLOSCOPE SINE WAVES ─────────────────────────────
      for (const w of waves) {
        w.phase += w.speed
        ctx.beginPath()
        for (let x = 0; x <= W; x += 2) {
          const y = cy + Math.sin(x * w.freq + w.phase) * w.amp
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(77,184,255,${w.opacity})`
        ctx.lineWidth = w.lw
        ctx.stroke()
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener("resize", resize)
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0, left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  )
}
