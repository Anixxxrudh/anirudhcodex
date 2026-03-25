"use client"
import { useEffect, useRef } from "react"

export default function AtomCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = 300, H = 300
    canvas.width  = W
    canvas.height = H
    const cx = W / 2, cy = H / 2

    // Three orbits: angle of tilt, semi-major/minor axes, orbital speed
    const orbits = [
      { rx: 110, ry: 34, tilt: 0,              speed: 0.022, angle: 0          },
      { rx: 110, ry: 34, tilt: Math.PI / 3,    speed: 0.017, angle: Math.PI * 2 / 3 },
      { rx: 110, ry: 34, tilt: -Math.PI / 3,   speed: 0.013, angle: Math.PI * 4 / 3 },
    ]

    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // ── Orbits ──────────────────────────────────────────────────────
      ctx.strokeStyle = "rgba(77,184,255,0.28)"
      ctx.lineWidth   = 1
      for (const o of orbits) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(o.tilt)
        ctx.beginPath()
        ctx.ellipse(0, 0, o.rx, o.ry, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }

      // ── Nucleus ─────────────────────────────────────────────────────
      const ng = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10)
      ng.addColorStop(0,   "rgba(255,255,255,1)")
      ng.addColorStop(0.4, "rgba(180,220,255,0.7)")
      ng.addColorStop(1,   "rgba(77,184,255,0)")
      ctx.beginPath()
      ctx.arc(cx, cy, 10, 0, Math.PI * 2)
      ctx.fillStyle = ng
      ctx.fill()

      // ── Electrons ───────────────────────────────────────────────────
      for (const o of orbits) {
        o.angle += o.speed
        // Point on the ellipse in local space, then rotate by tilt
        const lx = o.rx * Math.cos(o.angle)
        const ly = o.ry * Math.sin(o.angle)
        const ex = cx + lx * Math.cos(o.tilt) - ly * Math.sin(o.tilt)
        const ey = cy + lx * Math.sin(o.tilt) + ly * Math.cos(o.tilt)

        const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 7)
        eg.addColorStop(0,   "rgba(77,184,255,1)")
        eg.addColorStop(0.5, "rgba(77,184,255,0.4)")
        eg.addColorStop(1,   "rgba(77,184,255,0)")
        ctx.beginPath()
        ctx.arc(ex, ey, 4, 0, Math.PI * 2)
        ctx.fillStyle = eg
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div className="atom-canvas-wrapper">
      <canvas ref={canvasRef} style={{ width: 300, height: 300 }} />
    </div>
  )
}
