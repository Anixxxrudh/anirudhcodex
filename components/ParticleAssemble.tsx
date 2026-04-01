"use client"
import { useRef, useEffect, useState } from "react"

interface Props {
  children: React.ReactNode
  className?: string
  delay?: number
}

export default function ParticleAssemble({ children, className = "", delay = 0 }: Props) {
  const wrapRef     = useRef<HTMLDivElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const rafRef      = useRef<number>(0)
  const [revealed,  setRevealed]  = useState(false)
  const revealedRef = useRef(false)

  useEffect(() => {
    const wrap   = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const run = () => {
      if (revealedRef.current) return
      revealedRef.current = true

      const rect = wrap.getBoundingClientRect()
      const W = Math.max(1, Math.round(rect.width))
      const H = Math.max(1, Math.round(rect.height))
      canvas.width  = W
      canvas.height = H
      const ctx = canvas.getContext("2d")!

      const N = Math.min(70, Math.round((W * H) / 3000) + 20)
      interface P { x: number; y: number; vx: number; vy: number; r: number }
      const particles: P[] = Array.from({ length: N }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        r: 1 + Math.random() * 2,
      }))

      const FRAMES = 45
      let t = 0
      const tick = () => {
        t++
        const prog = t / FRAMES
        ctx.clearRect(0, 0, W, H)

        for (const p of particles) {
          p.vx += (W / 2 - p.x) * 0.035 * prog
          p.vy += (H / 2 - p.y) * 0.035 * prog
          p.vx *= 0.86; p.vy *= 0.86
          p.x += p.vx; p.y += p.vy

          ctx.beginPath()
          ctx.arc(p.x, p.y, Math.max(0.3, p.r * (1 - prog * 0.6)), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(77,184,255,${(1 - prog * 0.9) * 0.9})`
          ctx.fill()
        }

        if (t < FRAMES) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          ctx.clearRect(0, 0, W, H)
          setRevealed(true)
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTimeout(run, delay) },
      { threshold: 0.1 }
    )
    obs.observe(wrap)
    return () => { obs.disconnect(); cancelAnimationFrame(rafRef.current) }
  }, [delay])

  return (
    <div ref={wrapRef} className={className} style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute", inset: 0,
          pointerEvents: "none",
          zIndex: 10,
          opacity: revealed ? 0 : 1,
          transition: "opacity 0.4s ease",
        }}
      />
      <div style={{ opacity: revealed ? 1 : 0, transition: "opacity 0.5s ease 0.1s" }}>
        {children}
      </div>
    </div>
  )
}
