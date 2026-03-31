"use client"
import React, { useEffect, useRef, useState } from "react"

interface Props {
  children: React.ReactNode
  dotColor?: string
  lineColor?: string
  dotCount?: number
  className?: string
  style?: React.CSSProperties
  as?: keyof React.JSX.IntrinsicElements
}

export default function ConstellationHeading({
  children,
  dotColor = "rgba(201,168,76,0.85)",
  lineColor = "rgba(201,168,76,0.22)",
  dotCount = 14,
  className,
  style,
  as: Tag = "h2",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hovered, setHovered] = useState(false)
  const alphaRef = useRef(0)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext("2d")!

    let W = wrap.offsetWidth, H = wrap.offsetHeight
    canvas.width = W; canvas.height = H

    // Generate deterministic star positions relative to heading
    const dots = Array.from({ length: dotCount }, (_, i) => ({
      x: (0.05 + (i * 0.137 % 0.9)) * W,
      y: (0.05 + (i * 0.237 % 0.9)) * H,
      r: 1.2 + (i % 3) * 0.5,
    }))

    // Connect nearby dots
    const edges: [number, number][] = []
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        if (Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y) < W * 0.28)
          edges.push([i, j])
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const a = alphaRef.current
      if (a <= 0) { animRef.current = requestAnimationFrame(draw); return }

      // Lines
      for (const [i, j] of edges) {
        ctx.beginPath()
        ctx.moveTo(dots[i].x, dots[i].y)
        ctx.lineTo(dots[j].x, dots[j].y)
        ctx.strokeStyle = lineColor.replace(/[\d.]+\)$/, `${a * 0.22})`)
        ctx.lineWidth = 0.7; ctx.stroke()
      }

      // Dots
      for (const d of dots) {
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = dotColor.replace(/[\d.]+\)$/, `${a * 0.85})`); ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    const targetRef = { current: hovered ? 1 : 0 }

    const animate = () => {
      const target = hovered ? 1 : 0
      const diff = target - alphaRef.current
      if (Math.abs(diff) > 0.005) alphaRef.current += diff * 0.08
      else alphaRef.current = target
      animRef.current = requestAnimationFrame(animate)
    }

    cancelAnimationFrame(animRef.current)
    animRef.current = requestAnimationFrame(() => { draw(); animate() })

    return () => cancelAnimationFrame(animRef.current)
  }, [hovered, dotColor, lineColor, dotCount])

  return (
    <div
      ref={wrapRef}
      style={{ position: "relative", display: "inline-block", ...style }}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute", inset: 0,
          pointerEvents: "none", zIndex: 1,
          width: "100%", height: "100%",
        }}
      />
      <Tag style={{ position: "relative", zIndex: 2 }}>{children}</Tag>
    </div>
  )
}
