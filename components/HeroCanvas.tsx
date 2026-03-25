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

    // ── Layer 2: Atom orbits ──────────────────────────────────────────
    const orbits = [
      { rx: 90, ry: 35, tilt: 0,                speed: 0.008, angle: 0              },
      { rx: 90, ry: 35, tilt: Math.PI / 3,       speed: 0.012, angle: Math.PI * 2/3 },
      { rx: 90, ry: 35, tilt: -Math.PI / 3,      speed: 0.007, angle: Math.PI * 4/3 },
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
        // Spring back + lerp toward home
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

      // — Atom orbits —
      ctx.save()
      ctx.translate(cx, cy)
      for (const o of orbits) {
        ctx.save()
        ctx.rotate(o.tilt)
        ctx.strokeStyle = "rgba(77,184,255,0.25)"
        ctx.lineWidth   = 0.8
        ctx.beginPath()
        ctx.ellipse(0, 0, o.rx, o.ry, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }
      ctx.restore()

      // — Nucleus glow —
      ctx.save()
      ctx.shadowBlur  = 18
      ctx.shadowColor = "#4db8ff"
      const ng = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12)
      ng.addColorStop(0,   "rgba(255,255,255,1)")
      ng.addColorStop(0.4, "rgba(180,220,255,0.7)")
      ng.addColorStop(1,   "rgba(77,184,255,0)")
      ctx.beginPath()
      ctx.arc(cx, cy, 6, 0, Math.PI * 2)
      ctx.fillStyle = ng
      ctx.fill()
      ctx.restore()

      // — Electrons —
      ctx.save()
      ctx.shadowBlur  = 12
      ctx.shadowColor = "#4db8ff"
      for (const o of orbits) {
        o.angle += o.speed
        const lx = o.rx * Math.cos(o.angle)
        const ly = o.ry * Math.sin(o.angle)
        const ex = cx + lx * Math.cos(o.tilt) - ly * Math.sin(o.tilt)
        const ey = cy + lx * Math.sin(o.tilt) + ly * Math.cos(o.tilt)
        ctx.beginPath()
        ctx.arc(ex, ey, 3, 0, Math.PI * 2)
        ctx.fillStyle = "#4db8ff"
        ctx.fill()
      }
      ctx.restore()

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
