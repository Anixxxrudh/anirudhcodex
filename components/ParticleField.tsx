"use client"
import { useEffect, useRef } from "react"

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    let W = canvas.offsetWidth
    let H = canvas.offsetHeight
    canvas.width  = W
    canvas.height = H

    let mouseX = -9999
    let mouseY = -9999

    // Build particles with a home position
    const COUNT = 120
    const particles = Array.from({ length: COUNT }, () => {
      const x = Math.random() * W
      const y = Math.random() * H
      return {
        x, y,
        homeX: x,
        homeY: y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r:  Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.5 + 0.15,
        // alternate between blue and white
        blue: Math.random() > 0.45,
      }
    })

    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      for (const p of particles) {
        // Repulsion
        const dx = p.x - mouseX
        const dy = p.y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 100 && dist > 0) {
          const force = (100 - dist) / 100
          p.vx += (dx / dist) * force * 0.9
          p.vy += (dy / dist) * force * 0.9
        }

        // Spring back to home
        p.vx += (p.homeX - p.x) * 0.018
        p.vy += (p.homeY - p.y) * 0.018

        // Dampen
        p.vx *= 0.88
        p.vy *= 0.88

        p.x += p.vx
        p.y += p.vy

        // Draw
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.blue
          ? `rgba(77,184,255,${p.alpha})`
          : `rgba(255,255,255,${p.alpha})`
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }
    const onLeave = () => { mouseX = -9999; mouseY = -9999 }

    canvas.addEventListener("mousemove", onMove)
    canvas.addEventListener("mouseleave", onLeave)

    const onResize = () => {
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width  = W
      canvas.height = H
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(animId)
      canvas.removeEventListener("mousemove", onMove)
      canvas.removeEventListener("mouseleave", onLeave)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-field" />
}
