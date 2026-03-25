"use client"
import { useEffect, useRef } from "react"

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    let W = 0, H = 0, cx = 0, cy = 0
    let mouseX = -9999, mouseY = -9999
    let animId: number
    let t = 0

    // ── Resize ────────────────────────────────────────────────────────
    const resize = () => {
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width  = W
      canvas.height = H
      cx = W / 2
      cy = H / 2
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // ── Layer 1: Particles ────────────────────────────────────────────
    const COUNT = 120
    const particles = Array.from({ length: COUNT }, () => {
      const x = Math.random() * W
      const y = Math.random() * H
      return {
        x, y,
        homeX: x, homeY: y,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r:  Math.random() * 1.5 + 1,
        alpha: Math.random() * 0.45 + 0.1,
        blue: Math.random() > 0.45,
      }
    })

    // ── Layer 2: Realistic Atom Orbits ────────────────────────────────
    // Much larger, with electron trail history
    const TRAIL_LEN = 28
    const orbits = [
      {
        rx: 195, ry: 72, tilt: 0,
        speed: 0.007, angle: 0,
        color: "#4db8ff",
        trail: [] as { x: number; y: number }[],
      },
      {
        rx: 195, ry: 72, tilt: Math.PI / 3,
        speed: 0.011, angle: Math.PI * 2 / 3,
        color: "#00e5ff",
        trail: [] as { x: number; y: number }[],
      },
      {
        rx: 195, ry: 72, tilt: -Math.PI / 3,
        speed: 0.009, angle: Math.PI * 4 / 3,
        color: "#80cfff",
        trail: [] as { x: number; y: number }[],
      },
    ]

    // ── Mouse ──────────────────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }
    const onLeave = () => { mouseX = -9999; mouseY = -9999 }
    canvas.addEventListener("mousemove", onMove)
    canvas.addEventListener("mouseleave", onLeave)

    // ── Draw ──────────────────────────────────────────────────────────
    const draw = () => {
      t++
      ctx.clearRect(0, 0, W, H)

      // — Particles —
      for (const p of particles) {
        const dx   = p.x - mouseX
        const dy   = p.y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 110 && dist > 0) {
          const force = (110 - dist) / 110
          p.vx += (dx / dist) * force * 0.8
          p.vy += (dy / dist) * force * 0.8
        }
        p.vx += (p.homeX - p.x) * 0.03
        p.vy += (p.homeY - p.y) * 0.03
        p.vx *= 0.88
        p.vy *= 0.88
        p.x  += p.vx
        p.y  += p.vy

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.blue
          ? `rgba(77,184,255,${p.alpha})`
          : `rgba(255,255,255,${p.alpha})`
        ctx.fill()
      }

      // — Orbit ellipses with glowing strokes —
      ctx.save()
      ctx.translate(cx, cy)
      for (const o of orbits) {
        ctx.save()
        ctx.rotate(o.tilt)

        // Outer faint ring
        ctx.strokeStyle = `${o.color}18`
        ctx.lineWidth   = 4
        ctx.beginPath()
        ctx.ellipse(0, 0, o.rx + 3, o.ry + 3, 0, 0, Math.PI * 2)
        ctx.stroke()

        // Main orbit line
        ctx.shadowBlur  = 14
        ctx.shadowColor = o.color
        ctx.strokeStyle = `${o.color}40`
        ctx.lineWidth   = 1.2
        ctx.beginPath()
        ctx.ellipse(0, 0, o.rx, o.ry, 0, 0, Math.PI * 2)
        ctx.stroke()

        ctx.restore()
      }
      ctx.restore()

      // — Multi-layer Nucleus —
      const pulse  = 1 + 0.06 * Math.sin(t * 0.04)
      const nBase  = 18 * pulse

      ctx.save()

      // Outermost halo
      const halo = ctx.createRadialGradient(cx, cy, nBase * 0.6, cx, cy, nBase * 6)
      halo.addColorStop(0,   "rgba(77,184,255,0.12)")
      halo.addColorStop(0.4, "rgba(77,184,255,0.04)")
      halo.addColorStop(1,   "rgba(0,0,0,0)")
      ctx.beginPath()
      ctx.arc(cx, cy, nBase * 6, 0, Math.PI * 2)
      ctx.fillStyle = halo
      ctx.fill()

      // Soft mid glow
      ctx.shadowBlur  = 60
      ctx.shadowColor = "#4db8ff"
      const mid = ctx.createRadialGradient(cx, cy, 0, cx, cy, nBase * 3.5)
      mid.addColorStop(0,   "rgba(160,220,255,0.35)")
      mid.addColorStop(0.5, "rgba(77,184,255,0.15)")
      mid.addColorStop(1,   "rgba(0,0,0,0)")
      ctx.beginPath()
      ctx.arc(cx, cy, nBase * 3.5, 0, Math.PI * 2)
      ctx.fillStyle = mid
      ctx.fill()

      // Inner bright core
      ctx.shadowBlur  = 30
      ctx.shadowColor = "#ffffff"
      const inner = ctx.createRadialGradient(cx, cy, 0, cx, cy, nBase)
      inner.addColorStop(0,   "rgba(255,255,255,1)")
      inner.addColorStop(0.3, "rgba(220,240,255,0.95)")
      inner.addColorStop(0.7, "rgba(100,190,255,0.6)")
      inner.addColorStop(1,   "rgba(77,184,255,0)")
      ctx.beginPath()
      ctx.arc(cx, cy, nBase, 0, Math.PI * 2)
      ctx.fillStyle = inner
      ctx.fill()

      // Hot white pinpoint
      ctx.shadowBlur  = 20
      ctx.shadowColor = "#ffffff"
      const hot = ctx.createRadialGradient(cx, cy, 0, cx, cy, nBase * 0.45)
      hot.addColorStop(0, "rgba(255,255,255,1)")
      hot.addColorStop(1, "rgba(255,255,255,0)")
      ctx.beginPath()
      ctx.arc(cx, cy, nBase * 0.45, 0, Math.PI * 2)
      ctx.fillStyle = hot
      ctx.fill()

      ctx.restore()

      // — Electrons with trails —
      for (const o of orbits) {
        o.angle += o.speed
        const lx = o.rx * Math.cos(o.angle)
        const ly = o.ry * Math.sin(o.angle)
        const ex = cx + lx * Math.cos(o.tilt) - ly * Math.sin(o.tilt)
        const ey = cy + lx * Math.sin(o.tilt) + ly * Math.cos(o.tilt)

        // Store trail
        o.trail.unshift({ x: ex, y: ey })
        if (o.trail.length > TRAIL_LEN) o.trail.pop()

        // Draw trail
        for (let i = 1; i < o.trail.length; i++) {
          const frac  = 1 - i / TRAIL_LEN
          const alpha = frac * frac * 0.6
          const r     = 3.5 * frac
          ctx.beginPath()
          ctx.arc(o.trail[i].x, o.trail[i].y, r, 0, Math.PI * 2)
          ctx.fillStyle = `${o.color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`
          ctx.fill()
        }

        // Electron glow
        ctx.save()
        ctx.shadowBlur  = 22
        ctx.shadowColor = o.color

        // Outer glow ring
        const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 9)
        eg.addColorStop(0,   `${o.color}cc`)
        eg.addColorStop(0.5, `${o.color}55`)
        eg.addColorStop(1,   `${o.color}00`)
        ctx.beginPath()
        ctx.arc(ex, ey, 9, 0, Math.PI * 2)
        ctx.fillStyle = eg
        ctx.fill()

        // Bright core dot
        ctx.beginPath()
        ctx.arc(ex, ey, 3.5, 0, Math.PI * 2)
        ctx.fillStyle = "#ffffff"
        ctx.fill()

        ctx.restore()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      canvas.removeEventListener("mousemove", onMove)
      canvas.removeEventListener("mouseleave", onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        pointerEvents: "all",
      }}
    />
  )
}
