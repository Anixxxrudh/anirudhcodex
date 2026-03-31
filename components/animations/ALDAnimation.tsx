"use client"
import { useState } from "react"

interface Layer {
  name: string
  color: string
  thickness: number // px
}

interface Props {
  layers?: Layer[]
  substrateColor?: string
  labelColor?: string
  speed?: number  // ms per layer
  width?: number
  height?: number
  style?: React.CSSProperties
  className?: string
}

const DEFAULT_LAYERS: Layer[] = [
  { name: "Al₂O₃ (ALD)", color: "rgba(77,184,255,0.85)",   thickness: 14 },
  { name: "ZnTe:Cu",      color: "rgba(201,168,76,0.85)",   thickness: 10 },
  { name: "SWCNT net",    color: "rgba(120,240,120,0.75)",  thickness: 8  },
  { name: "Al₂O₃ (ALD)", color: "rgba(77,184,255,0.7)",    thickness: 12 },
  { name: "CdSeTe abs",   color: "rgba(200,120,255,0.8)",   thickness: 20 },
  { name: "CdS buffer",   color: "rgba(255,230,80,0.75)",   thickness: 10 },
  { name: "ITO front",    color: "rgba(180,220,255,0.65)",  thickness: 8  },
]

export default function ALDAnimation({
  layers = DEFAULT_LAYERS,
  substrateColor = "rgba(80,80,80,0.9)",
  labelColor = "#F5F0E8",
  speed = 420,
  width = 320,
  height = 260,
  style,
  className,
}: Props) {
  const [hovered, setHovered] = useState(false)
  const [visibleCount, setVisibleCount] = useState(0)
  const timerRef = useState<ReturnType<typeof setTimeout> | null>(null)

  const startAnimation = () => {
    setVisibleCount(0)
    let count = 0
    const tick = () => {
      count++
      setVisibleCount(count)
      if (count < layers.length) timerRef[1](setTimeout(tick, speed))
    }
    timerRef[1](setTimeout(tick, speed * 0.5))
  }

  const stopAnimation = () => {
    if (timerRef[0]) clearTimeout(timerRef[0])
    setVisibleCount(0)
  }

  const substrateH = 28
  const totalLayerH = layers.reduce((s, l) => s + l.thickness, 0)
  const svgH = substrateH + totalLayerH + 20

  // Compute y position of each layer from bottom up
  let currentY = svgH - substrateH
  const layerRects = layers.map((l) => {
    currentY -= l.thickness
    return { ...l, y: currentY }
  })

  return (
    <div
      className={className}
      onMouseEnter={() => { setHovered(true); startAnimation() }}
      onMouseLeave={() => { setHovered(false); stopAnimation() }}
      style={{
        display: "inline-block",
        cursor: "default",
        userSelect: "none",
        ...style,
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${svgH}`}
        width={width}
        height={svgH}
        style={{ display: "block", maxWidth: "100%" }}
      >
        {/* Substrate */}
        <rect x="30" y={svgH - substrateH} width={width - 60} height={substrateH}
          fill={substrateColor} rx="2" />
        <text x={width / 2} y={svgH - substrateH / 2 + 4}
          textAnchor="middle" fill={labelColor}
          fontSize="9" fontFamily="monospace" opacity="0.7">
          Glass Substrate
        </text>

        {/* Layers */}
        {layerRects.map((l, i) => {
          const visible = i < visibleCount
          return (
            <g key={i}>
              <rect
                x="30" y={l.y} width={width - 60} height={l.thickness}
                fill={l.color} rx="1"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "scaleY(1)" : "scaleY(0)",
                  transformOrigin: `${width / 2}px ${l.y}px`,
                  transition: `opacity ${speed * 0.4}ms ease, transform ${speed * 0.4}ms cubic-bezier(0.4,0,0.2,1)`,
                }}
              />
              {/* Layer label */}
              <text
                x={width - 25}
                y={l.y + l.thickness / 2 + 3.5}
                fontSize="7.5"
                fontFamily="monospace"
                fill={labelColor}
                opacity={visible ? 0.75 : 0}
                style={{ transition: `opacity ${speed * 0.3}ms ease` }}
              >
                {l.name}
              </text>
              {/* Thickness line */}
              <line
                x1="25" y1={l.y}
                x2="25" y2={l.y + l.thickness}
                stroke={l.color} strokeWidth="0.8"
                opacity={visible ? 0.5 : 0}
                style={{ transition: `opacity ${speed * 0.3}ms ease` }}
              />
            </g>
          )
        })}

        {/* Deposition beam animation */}
        {hovered && visibleCount < layers.length && (
          <line
            x1="30" x2={width - 30}
            y1={layerRects[visibleCount]?.y ?? 0}
            y2={layerRects[visibleCount]?.y ?? 0}
            stroke="rgba(77,184,255,0.9)"
            strokeWidth="1"
            strokeDasharray="4 3"
          >
            <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="0.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.4;1" dur="0.5s" repeatCount="indefinite" />
          </line>
        )}

        {/* Arrow markers on left */}
        {hovered && Array.from({ length: 5 }, (_, i) => (
          <g key={i}>
            <line
              x1={38 + i * ((width - 76) / 4)}
              y1={layerRects[Math.max(0, visibleCount - 1)]?.y ?? 0}
              x2={38 + i * ((width - 76) / 4)}
              y2={(layerRects[Math.max(0, visibleCount - 1)]?.y ?? 0) - 14}
              stroke="rgba(77,184,255,0.55)"
              strokeWidth="0.8"
              markerEnd="url(#arrow-down)"
            >
              <animate attributeName="y1"
                values={`${(layerRects[Math.max(0, visibleCount - 1)]?.y ?? 0) - 18};${(layerRects[Math.max(0, visibleCount - 1)]?.y ?? 0)}`}
                dur="0.6s" repeatCount="indefinite" />
              <animate attributeName="y2"
                values={`${(layerRects[Math.max(0, visibleCount - 1)]?.y ?? 0) - 32};${(layerRects[Math.max(0, visibleCount - 1)]?.y ?? 0) - 14}`}
                dur="0.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="0.6s" repeatCount="indefinite" />
            </line>
          </g>
        ))}
      </svg>

      {!hovered && (
        <div style={{ textAlign: "center", marginTop: 6, fontSize: "0.6rem",
          color: labelColor, opacity: 0.45, fontFamily: "monospace", letterSpacing: "0.1em" }}>
          HOVER TO SIMULATE ALD
        </div>
      )}
    </div>
  )
}
