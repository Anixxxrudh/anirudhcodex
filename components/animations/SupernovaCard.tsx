"use client"
import { useRef, useState } from "react"

interface Props {
  children: React.ReactNode
  glowColor?: string
  pulseColor?: string
  className?: string
  style?: React.CSSProperties
  borderColor?: string
}

export default function SupernovaCard({
  children,
  glowColor = "rgba(201,168,76,0.18)",
  pulseColor = "rgba(201,168,76,0.35)",
  className,
  style,
  borderColor = "rgba(201,168,76,0.22)",
}: Props) {
  const [hovered, setHovered] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const cardRef = useRef<HTMLDivElement>(null)

  const onMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current!.getBoundingClientRect()
    setOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
    setHovered(true)
  }

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${borderColor}`,
        transition: "border-color 0.3s ease, transform 0.3s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        ...style,
      }}
    >
      {/* Supernova pulse layers */}
      {hovered && (
        <>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
            background: `radial-gradient(circle at ${origin.x}% ${origin.y}%, ${glowColor} 0%, transparent 65%)`,
          }} />
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
            background: `radial-gradient(circle at ${origin.x}% ${origin.y}%, ${pulseColor} 0%, transparent 30%)`,
            animation: "snova-pulse 1.8s ease-out infinite",
          }} />
        </>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      <style>{`
        @keyframes snova-pulse {
          0%   { transform: scale(0.4); opacity: 1; }
          60%  { transform: scale(1.6); opacity: 0.3; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
