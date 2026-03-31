"use client"
import { useEffect, useRef, useState } from "react"

interface Props {
  children: React.ReactNode
  threshold?: number  // 0–1 intersection ratio
  duration?: number   // ms
  color?: string      // nebula tint rgba
  className?: string
  style?: React.CSSProperties
}

export default function NebulaSectionReveal({
  children,
  threshold = 0.18,
  duration = 900,
  color = "rgba(100,60,200,0.07)",
  className,
  style,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        position: "relative",
        WebkitMaskImage: revealed
          ? "radial-gradient(ellipse 160% 160% at 50% 50%, black 0%, black 100%)"
          : "radial-gradient(ellipse 0% 0% at 50% 50%, black 0%, transparent 0%)",
        maskImage: revealed
          ? "radial-gradient(ellipse 160% 160% at 50% 50%, black 0%, black 100%)"
          : "radial-gradient(ellipse 0% 0% at 50% 50%, black 0%, transparent 0%)",
        transition: `mask-image ${duration}ms cubic-bezier(0.22,1,0.36,1), -webkit-mask-image ${duration}ms cubic-bezier(0.22,1,0.36,1)`,
        ...style,
      }}
    >
      {/* Nebula bloom overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${color}, transparent 70%)`,
          opacity: revealed ? 1 : 0,
          transition: `opacity ${duration * 0.7}ms ease`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  )
}
