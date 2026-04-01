"use client"
import { useRef, useImperativeHandle, forwardRef, useEffect } from "react"

export interface BlackHoleHandle {
  trigger(): void
}

export default forwardRef<BlackHoleHandle>(function BlackHoleTransition(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)

  useImperativeHandle(ref, () => ({
    trigger() {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")!
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      const W = canvas.width, H = canvas.height
      const cx = W / 2, cy = H / 2

      canvas.style.opacity = "1"

      const N = 110
      interface P { x: number; y: number; vx: number; vy: number; r: number; op: number }
      const pts: P[] = Array.from({ length: N }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: 0, vy: 0,
        r: 1 + Math.random() * 2.5,
        op: 0.4 + Math.random() * 0.6,
      }))

      let t = 0
      const COLLAPSE = 30
      const HOLD     = 8
      const EXPAND   = 22

      cancelAnimationFrame(rafRef.current)
      const tick = () => {
        t++
        ctx.clearRect(0, 0, W, H)

        if (t <= COLLAPSE) {
          const prog = t / COLLAPSE
          ctx.fillStyle = `rgba(0,0,0,${prog * 0.9})`
          ctx.fillRect(0, 0, W, H)

          for (const p of pts) {
            const dx = cx - p.x, dy = cy - p.y
            const dist = Math.hypot(dx, dy) || 1
            const force = dist * 0.05 * prog
            p.vx += (dx / dist) * force
            p.vy += (dy / dist) * force
            p.vx *= 0.88; p.vy *= 0.88
            p.x += p.vx; p.y += p.vy
            ctx.beginPath()
            ctx.arc(p.x, p.y, Math.max(0.3, p.r * (1 - prog * 0.7)), 0, Math.PI * 2)
            ctx.fillStyle = `rgba(77,184,255,${p.op * (1 - prog * 0.5)})`
            ctx.fill()
          }

          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50 + prog * 80)
          g.addColorStop(0,   "rgba(0,0,0,1)")
          g.addColorStop(0.5, `rgba(0,229,255,${prog * 0.5})`)
          g.addColorStop(1,   "rgba(0,0,0,0)")
          ctx.beginPath(); ctx.arc(cx, cy, 50 + prog * 80, 0, Math.PI * 2)
          ctx.fillStyle = g; ctx.fill()

        } else if (t <= COLLAPSE + HOLD) {
          ctx.fillStyle = "rgba(0,0,0,0.96)"
          ctx.fillRect(0, 0, W, H)
          ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.fill()

        } else if (t <= COLLAPSE + HOLD + EXPAND) {
          const prog = (t - COLLAPSE - HOLD) / EXPAND
          ctx.fillStyle = `rgba(0,0,0,${(1 - prog) * 0.9})`
          ctx.fillRect(0, 0, W, H)

          for (const p of pts) {
            const dx = p.x - cx, dy = p.y - cy
            const dist = Math.hypot(dx, dy) || 1
            p.vx += (dx / dist) * prog * 4
            p.vy += (dy / dist) * prog * 4
            p.x += p.vx; p.y += p.vy
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(77,184,255,${p.op * (1 - prog)})`
            ctx.fill()
          }

          const ring = ctx.createRadialGradient(cx, cy, prog * W * 0.55, cx, cy, prog * W * 0.55 + 50)
          ring.addColorStop(0, `rgba(0,229,255,${(1 - prog) * 0.35})`)
          ring.addColorStop(1, "rgba(0,0,0,0)")
          ctx.beginPath(); ctx.arc(cx, cy, prog * W * 0.55 + 50, 0, Math.PI * 2)
          ctx.fillStyle = ring; ctx.fill()

        } else {
          ctx.clearRect(0, 0, W, H)
          canvas.style.opacity = "0"
          return
        }

        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    },
  }))

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0,
        width: "100vw", height: "100vh",
        zIndex: 9995,
        pointerEvents: "none",
        opacity: 0,
      }}
    />
  )
})
