"use client"
import { useEffect, useRef } from "react"

interface Props {
  scrollRef?: React.RefObject<HTMLElement | HTMLDivElement | null>
  style?: React.CSSProperties
  className?: string
  layerCounts?: [number, number, number]   // [back, mid, front]
  layerSpeeds?: [number, number, number]   // parallax multipliers
  layerAlphas?: [number, number, number]
}

interface LayerStar { x: number; y: number; r: number; alpha: number }

export default function ParallaxStars({
  scrollRef,
  style,
  className,
  layerCounts = [120, 70, 40],
  layerSpeeds = [0.08, 0.22, 0.48],
  layerAlphas = [0.35, 0.55, 0.85],
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    let W = canvas.offsetWidth
    let H = canvas.offsetHeight
    canvas.width = W; canvas.height = H

    let scrollY = 0
    let animId: number

    const layers: LayerStar[][] = layerCounts.map((count, li) =>
      Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H * 3, // tall virtual space
        r: 0.4 + li * 0.5 + Math.random() * 0.6,
        alpha: layerAlphas[li] * (0.7 + Math.random() * 0.3),
      }))
    )

    const getScrollY = () => {
      if (scrollRef?.current) return scrollRef.current.scrollTop
      return window.scrollY
    }

    const draw = () => {
      scrollY = getScrollY()
      ctx.clearRect(0, 0, W, H)

      layers.forEach((layer, li) => {
        const offset = scrollY * layerSpeeds[li]
        for (const s of layer) {
          const dy = ((s.y - offset) % (H * 3) + H * 3) % (H * 3) - H
          if (dy < -5 || dy > H + 5) continue
          ctx.beginPath(); ctx.arc(s.x, dy, s.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${s.alpha})`; ctx.fill()
        }
      })

      animId = requestAnimationFrame(draw)
    }

    const onResize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight
      canvas.width = W; canvas.height = H
    }
    window.addEventListener("resize", onResize)
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", onResize)
    }
  }, [scrollRef, layerCounts, layerSpeeds, layerAlphas])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
    />
  )
}
