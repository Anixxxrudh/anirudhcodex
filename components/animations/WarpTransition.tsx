"use client"
import { useEffect, useRef, useImperativeHandle, forwardRef } from "react"

export interface WarpTransitionHandle {
  trigger: () => void
}

interface Props {
  duration?: number // ms
  starCount?: number
  color?: string
}

const WarpTransition = forwardRef<WarpTransitionHandle, Props>(function WarpTransition(
  { duration = 420, starCount = 200, color = "255,255,255" },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)

  useImperativeHandle(ref, () => ({
    trigger() {
      const canvas = canvasRef.current
      const overlay = overlayRef.current
      if (!canvas || !overlay) return

      const W = window.innerWidth, H = window.innerHeight
      canvas.width = W; canvas.height = H
      const ctx = canvas.getContext("2d")!
      const cx = W / 2, cy = H / 2

      overlay.style.pointerEvents = "all"
      overlay.style.opacity = "1"

      const stars = Array.from({ length: starCount }, () => {
        const ang = Math.random() * Math.PI * 2
        const r = 20 + Math.random() * Math.min(W, H) * 0.5
        return { ang, r, speed: 0.5 + Math.random() * 1.5, alpha: 0.4 + Math.random() * 0.6 }
      })

      const start = performance.now()
      cancelAnimationFrame(animRef.current)

      const draw = (now: number) => {
        const t = Math.min((now - start) / duration, 1)
        ctx.fillStyle = `rgba(0,0,0,${t < 0.5 ? t * 0.7 : (1 - t) * 1.4})`
        ctx.fillRect(0, 0, W, H)

        for (const s of stars) {
          const progress = t * s.speed
          const r0 = s.r
          const r1 = s.r + progress * 180 * t
          const x0 = cx + Math.cos(s.ang) * r0
          const y0 = cy + Math.sin(s.ang) * r0
          const x1 = cx + Math.cos(s.ang) * r1
          const y1 = cy + Math.sin(s.ang) * r1

          const grad = ctx.createLinearGradient(x0, y0, x1, y1)
          grad.addColorStop(0, `rgba(${color},0)`)
          grad.addColorStop(1, `rgba(${color},${s.alpha * (1 - t)})`)

          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1)
          ctx.strokeStyle = grad
          ctx.lineWidth = 1 + t * 1.5; ctx.stroke()
        }

        if (t < 1) {
          animRef.current = requestAnimationFrame(draw)
        } else {
          ctx.clearRect(0, 0, W, H)
          overlay.style.opacity = "0"
          overlay.style.pointerEvents = "none"
        }
      }

      animRef.current = requestAnimationFrame(draw)
    },
  }))

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        opacity: 0, pointerEvents: "none",
        transition: "opacity 0.1s ease",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  )
})

export default WarpTransition
