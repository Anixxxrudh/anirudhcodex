"use client"
import { useEffect, useRef } from "react"

export default function MusicBackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    let animId: number
    let vinylAngle = 0
    let waveRingAngle = 0

    // Ripple ring state — 5 rings expanding from center
    const RIPPLE_COUNT = 5
    const ripples = Array.from({ length: RIPPLE_COUNT }, (_, i) => ({
      r: 40 + (i / RIPPLE_COUNT) * 460,
      maxR: 500,
      minR: 40,
    }))

    // Sine wave phases
    const waves = [
      { amp: 20, freq: 0.008, phase: 0,  speed: 0.02,  opacity: 0.10, lw: 1.5 },
      { amp: 35, freq: 0.005, phase: 2,  speed: 0.015, opacity: 0.06, lw: 1.0 },
      { amp: 15, freq: 0.012, phase: 4,  speed: 0.025, opacity: 0.08, lw: 1.0 },
    ]

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    const draw = (now: number) => {
      const W  = canvas.width
      const H  = canvas.height
      const cx = W / 2
      const cy = H / 2
      // Vinyl radius: fits comfortably in the section
      const R  = Math.min(W, H) * 0.36

      ctx.clearRect(0, 0, W, H)

      // ── RIPPLE RINGS (behind vinyl) ──────────────────────────────────
      for (const rp of ripples) {
        rp.r += 0.6
        if (rp.r > rp.maxR) rp.r = rp.minR
        const t  = (rp.r - rp.minR) / (rp.maxR - rp.minR)
        const op = 0.13 * (1 - t)
        ctx.beginPath()
        ctx.arc(cx, cy, rp.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(77,184,255,${op})`
        ctx.lineWidth   = 0.8
        ctx.stroke()
      }

      // ── VINYL RECORD ─────────────────────────────────────────────────
      vinylAngle += (Math.PI * 2) / (20 * 60) // 20-second rotation

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(vinylAngle)

      // 1. Dark vinyl playing surface
      const diskGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, R)
      diskGrad.addColorStop(0,    "rgba(18,22,32,0.0)")   // transparent center → label area handles this
      diskGrad.addColorStop(0.30, "rgba(14,18,26,0.92)")  // label-to-groove transition
      diskGrad.addColorStop(0.55, "rgba(10,13,20,0.97)")  // mid grooves
      diskGrad.addColorStop(0.85, "rgba(7,10,16,1.0)")    // outer grooves
      diskGrad.addColorStop(1,    "rgba(4,7,12,0.85)")    // edge fades slightly
      ctx.beginPath()
      ctx.arc(0, 0, R, 0, Math.PI * 2)
      ctx.fillStyle = diskGrad
      ctx.fill()

      // 2. Groove rings (fine, concentric) — only over playing surface
      const GROOVE_START = Math.floor(R * 0.30)
      const GROOVE_END   = Math.floor(R * 0.95)
      const GROOVE_COUNT = 64
      for (let i = 0; i < GROOVE_COUNT; i++) {
        const t  = i / GROOVE_COUNT
        const gr = GROOVE_START + t * (GROOVE_END - GROOVE_START)
        // Alternate subtle/slightly-less-subtle for a micro-groove look
        const op = i % 3 === 0 ? 0.07 : 0.03
        ctx.beginPath()
        ctx.arc(0, 0, gr, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(77,184,255,${op})`
        ctx.lineWidth   = 0.5
        ctx.stroke()
      }

      // 3. Outer label area (dark, distinct)
      const labelR = R * 0.29
      const labelGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, labelR)
      labelGrad.addColorStop(0,    "rgba(8,14,28,1.0)")
      labelGrad.addColorStop(0.55, "rgba(12,20,38,1.0)")
      labelGrad.addColorStop(0.85, "rgba(18,28,50,1.0)")
      labelGrad.addColorStop(1,    "rgba(20,32,56,1.0)")
      ctx.beginPath()
      ctx.arc(0, 0, labelR, 0, Math.PI * 2)
      ctx.fillStyle = labelGrad
      ctx.fill()

      // Label edge ring
      ctx.beginPath()
      ctx.arc(0, 0, labelR, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(77,184,255,0.20)"
      ctx.lineWidth   = 0.8
      ctx.stroke()

      // Label inner ring detail
      ctx.beginPath()
      ctx.arc(0, 0, labelR * 0.65, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(77,184,255,0.08)"
      ctx.lineWidth   = 0.5
      ctx.stroke()

      // 4. Specular highlight — arc of soft light
      ctx.save()
      const specGrad = ctx.createLinearGradient(-R * 0.5, -R * 0.7, R * 0.1, -R * 0.1)
      specGrad.addColorStop(0,   "rgba(180,220,255,0.0)")
      specGrad.addColorStop(0.3, "rgba(180,220,255,0.035)")
      specGrad.addColorStop(0.6, "rgba(255,255,255,0.018)")
      specGrad.addColorStop(1,   "rgba(180,220,255,0.0)")
      ctx.beginPath()
      ctx.arc(0, 0, R, 0, Math.PI * 2)
      ctx.fillStyle = specGrad
      ctx.fill()
      ctx.restore()

      // 5. Outer rim
      ctx.beginPath()
      ctx.arc(0, 0, R, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(77,184,255,0.12)"
      ctx.lineWidth   = 1
      ctx.stroke()

      // 6. Center spindle hole
      const holeR = R * 0.028
      const holeGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, holeR * 3)
      holeGlow.addColorStop(0,   "rgba(200,230,255,0.9)")
      holeGlow.addColorStop(0.4, "rgba(120,190,255,0.5)")
      holeGlow.addColorStop(1,   "rgba(77,184,255,0.0)")
      ctx.beginPath()
      ctx.arc(0, 0, holeR * 3, 0, Math.PI * 2)
      ctx.fillStyle = holeGlow
      ctx.fill()
      // Hard hole punch
      ctx.beginPath()
      ctx.arc(0, 0, holeR, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(200,230,255,0.9)"
      ctx.fill()

      ctx.restore()

      // ── BREATHING WAVEFORM RING ──────────────────────────────────────
      waveRingAngle -= 0.003
      const ringBaseR = R * 1.18
      const POINTS    = 180
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(waveRingAngle)
      ctx.beginPath()
      for (let i = 0; i <= POINTS; i++) {
        const a            = (i / POINTS) * Math.PI * 2
        const displacement = 8 + 12 * Math.sin(a * 6 + now * 0.001) * Math.cos(a * 3 + now * 0.0007)
        const r            = ringBaseR + displacement
        const x            = Math.cos(a) * r
        const y            = Math.sin(a) * r
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.strokeStyle = "rgba(77,184,255,0.15)"
      ctx.lineWidth   = 1
      ctx.stroke()
      ctx.restore()

      // ── OSCILLOSCOPE SINE WAVES ──────────────────────────────────────
      for (const w of waves) {
        w.phase += w.speed
        ctx.beginPath()
        for (let x = 0; x <= W; x += 2) {
          const y = cy + Math.sin(x * w.freq + w.phase) * w.amp
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(77,184,255,${w.opacity})`
        ctx.lineWidth   = w.lw
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
