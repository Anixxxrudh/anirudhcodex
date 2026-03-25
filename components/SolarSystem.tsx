"use client"
import { useEffect, useRef } from "react"

export default function SolarSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = 400, H = 400
    canvas.width  = W
    canvas.height = H
    const cx = W / 2, cy = H / 2

    const planets = [
      { radius: 70,  speed: 0.028, angle: 0,                color: "rgba(100,160,255,0.9)", r: 5  },
      { radius: 115, speed: 0.017, angle: Math.PI * 2 / 3,  color: "rgba(210,150,70,0.85)", r: 7  },
      { radius: 160, speed: 0.009, angle: Math.PI * 4 / 3,  color: "rgba(110,200,120,0.8)", r: 6  },
    ]

    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // ── Orbit rings (dashed) ─────────────────────────────────────────
      ctx.setLineDash([3, 6])
      ctx.strokeStyle = "rgba(255,255,255,0.08)"
      ctx.lineWidth   = 1
      for (const p of planets) {
        ctx.beginPath()
        ctx.arc(cx, cy, p.radius, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.setLineDash([])

      // ── Sun ─────────────────────────────────────────────────────────
      const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22)
      sg.addColorStop(0,   "rgba(255,240,120,1)")
      sg.addColorStop(0.5, "rgba(255,160,40,0.8)")
      sg.addColorStop(1,   "rgba(255,80,0,0)")
      ctx.beginPath()
      ctx.arc(cx, cy, 22, 0, Math.PI * 2)
      ctx.fillStyle = sg
      ctx.fill()

      // Sun corona glow
      const cg = ctx.createRadialGradient(cx, cy, 16, cx, cy, 40)
      cg.addColorStop(0,   "rgba(255,180,40,0.25)")
      cg.addColorStop(1,   "rgba(255,100,0,0)")
      ctx.beginPath()
      ctx.arc(cx, cy, 40, 0, Math.PI * 2)
      ctx.fillStyle = cg
      ctx.fill()

      // ── Planets ─────────────────────────────────────────────────────
      for (const p of planets) {
        p.angle += p.speed
        const px = cx + Math.cos(p.angle) * p.radius
        const py = cy + Math.sin(p.angle) * p.radius

        // Planet glow
        const pg = ctx.createRadialGradient(px, py, 0, px, py, p.r * 2.5)
        pg.addColorStop(0, p.color)
        pg.addColorStop(1, "rgba(0,0,0,0)")
        ctx.beginPath()
        ctx.arc(px, py, p.r * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = pg
        ctx.fill()

        // Planet body
        ctx.beginPath()
        ctx.arc(px, py, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div className="solar-canvas-wrapper">
      <canvas ref={canvasRef} style={{ width: 400, height: 400 }} />
    </div>
  )
}
