"use client"
import { useEffect, useRef } from "react"

interface Props {
  starCount?: number
  lensRadius?: number   // px — warp influence radius
  lensStrength?: number // 0–1
  starColor?: string
  style?: React.CSSProperties
  className?: string
}

interface Star { x: number; y: number; r: number; alpha: number }

export default function GravLensCursor({
  starCount = 260,
  lensRadius = 140,
  lensStrength = 0.42,
  starColor = "255,255,255",
  style,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    let W = canvas.offsetWidth
    let H = canvas.offsetHeight
    canvas.width = W; canvas.height = H

    let mx = -9999, my = -9999
    let animId: number

    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      alpha: 0.3 + Math.random() * 0.6,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      for (const s of stars) {
        const dx = mx - s.x
        const dy = my - s.y
        const dist = Math.hypot(dx, dy)
        let px = s.x, py = s.y

        if (dist < lensRadius && dist > 0) {
          const falloff = 1 - dist / lensRadius
          const warp = falloff * falloff * lensStrength * lensRadius
          px = s.x + (dx / dist) * warp
          py = s.y + (dy / dist) * warp
        }

        ctx.beginPath(); ctx.arc(px, py, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${starColor},${s.alpha})`; ctx.fill()
      }
      animId = requestAnimationFrame(draw)
    }

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mx = e.clientX - rect.left
      my = e.clientY - rect.top
    }
    const onLeave = () => { mx = -9999; my = -9999 }

    const onResize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight
      canvas.width = W; canvas.height = H
    }

    canvas.addEventListener("mousemove", onMove)
    canvas.addEventListener("mouseleave", onLeave)
    window.addEventListener("resize", onResize)
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      canvas.removeEventListener("mousemove", onMove)
      canvas.removeEventListener("mouseleave", onLeave)
      window.removeEventListener("resize", onResize)
    }
  }, [starCount, lensRadius, lensStrength, starColor])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
    />
  )
}
