"use client"
import { useEffect, useRef, useState } from "react"

export interface Milestone {
  id: string
  label: string
  sublabel?: string
  year?: string
}

interface Props {
  milestones: Milestone[]
  arcColor?: string
  nodeColor?: string
  pulseColor?: string
  labelColor?: string
  width?: number
  height?: number
}

export default function OrbitalTimeline({
  milestones,
  arcColor = "rgba(201,168,76,0.25)",
  nodeColor = "#C9A84C",
  pulseColor = "rgba(201,168,76,0.45)",
  labelColor = "#F5F0E8",
  width = 700,
  height = 320,
}: Props) {
  const [active, setActive] = useState<Set<string>>(new Set())
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    nodeRefs.current.forEach((el, i) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setActive((prev) => new Set([...prev, milestones[i].id]))
            }, i * 120)
          }
        },
        { threshold: 0.5 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [milestones])

  const n = milestones.length
  // Place nodes along an elliptical arc (bottom half)
  const rx = (width - 80) / 2
  const ry = height * 0.52
  const cx = width / 2
  const cy = 28

  const nodePoints = milestones.map((_, i) => {
    const t = n === 1 ? 0 : i / (n - 1)
    const ang = Math.PI * (0.1 + t * 0.8)
    return {
      x: cx + rx * Math.cos(ang),
      y: cy + ry * Math.sin(ang),
    }
  })

  // Build SVG arc path through node points
  const arcD = nodePoints.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = nodePoints[i - 1]
    const mx = (prev.x + p.x) / 2
    const my = (prev.y + p.y) / 2 - 18
    return `${d} Q ${mx} ${my} ${p.x} ${p.y}`
  }, "")

  return (
    <div style={{ position: "relative", width, maxWidth: "100%", margin: "0 auto" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "auto", overflow: "visible" }}
      >
        {/* Arc */}
        <path d={arcD} fill="none" stroke={arcColor} strokeWidth="1.5" strokeDasharray="4 3" />

        {/* Nodes */}
        {nodePoints.map((p, i) => {
          const m = milestones[i]
          const isActive = active.has(m.id)
          const isLeft = p.x < cx
          return (
            <g key={m.id}>
              {/* Pulse ring */}
              {isActive && (
                <>
                  <circle cx={p.x} cy={p.y} r="14" fill="none" stroke={pulseColor} strokeWidth="1">
                    <animate attributeName="r" values="10;22;10" dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
              {/* Core dot */}
              <circle
                cx={p.x} cy={p.y}
                r={isActive ? 6 : 4}
                fill={isActive ? nodeColor : "rgba(201,168,76,0.3)"}
                stroke={nodeColor}
                strokeWidth="1.2"
                style={{ transition: "all 0.4s ease" }}
              />
              {/* Label */}
              {isActive && (
                <foreignObject
                  x={isLeft ? p.x - 140 : p.x + 14}
                  y={p.y - 22}
                  width="130"
                  height="60"
                  style={{ overflow: "visible" }}
                >
                  <div style={{
                    color: labelColor, fontSize: "0.7rem",
                    lineHeight: 1.35, animation: "ot-fadein 0.4s ease forwards",
                  }}>
                    <div style={{ fontWeight: 700, letterSpacing: "0.08em", fontSize: "0.65rem" }}>
                      {m.year}
                    </div>
                    <div style={{ fontWeight: 600 }}>{m.label}</div>
                    {m.sublabel && (
                      <div style={{ opacity: 0.65, fontSize: "0.6rem" }}>{m.sublabel}</div>
                    )}
                  </div>
                </foreignObject>
              )}
            </g>
          )
        })}
      </svg>

      {/* Invisible scroll triggers */}
      {nodePoints.map((p, i) => (
        <div
          key={milestones[i].id}
          ref={(el) => { nodeRefs.current[i] = el }}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: 1, height: 1,
            pointerEvents: "none",
          }}
        />
      ))}

      <style>{`@keyframes ot-fadein{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}
