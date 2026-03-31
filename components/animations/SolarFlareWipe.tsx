"use client"
import { useEffect, useRef, useImperativeHandle, forwardRef } from "react"

export interface SolarFlareWipeHandle {
  trigger: () => void
}

interface Props {
  duration?: number
  color?: string   // CSS color for the flare arc
  opacity?: number
}

const SolarFlareWipe = forwardRef<SolarFlareWipeHandle, Props>(function SolarFlareWipe(
  { duration = 700, color = "#C9A84C", opacity = 0.85 },
  ref
) {
  const svgRef = useRef<SVGSVGElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    trigger() {
      const overlay = overlayRef.current
      const svg = svgRef.current
      if (!overlay || !svg) return

      overlay.style.pointerEvents = "all"
      overlay.style.opacity = "1"

      // Animate clipPath rect sliding across diagonally
      const rect = svg.querySelector<SVGRectElement>("#sf-clip-rect")
      const arc = svg.querySelector<SVGPathElement>("#sf-arc")
      if (!rect || !arc) return

      // Reset
      rect.style.transition = "none"
      rect.setAttribute("x", "-110%")
      arc.style.opacity = "0"

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          rect.style.transition = `x ${duration * 0.55}ms cubic-bezier(0.4,0,0.2,1)`
          rect.setAttribute("x", "110%")
          arc.style.opacity = String(opacity)
          arc.style.transition = `opacity ${duration * 0.3}ms ease`

          setTimeout(() => {
            arc.style.opacity = "0"
            overlay.style.opacity = "0"
            overlay.style.pointerEvents = "none"
          }, duration * 0.6)
        })
      })
    },
  }))

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed", inset: 0, zIndex: 9997,
        opacity: 0, pointerEvents: "none",
        transition: "opacity 0.2s ease",
      }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%", overflow: "hidden" }}
      >
        <defs>
          <clipPath id="sf-clip">
            <rect id="sf-clip-rect" x="-110%" y="-10%" width="120%" height="120%" transform="rotate(-12, 50, 50)" />
          </clipPath>
          <linearGradient id="sf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="30%" stopColor={color} stopOpacity="0.9" />
            <stop offset="55%" stopColor="#fff" stopOpacity="1" />
            <stop offset="75%" stopColor={color} stopOpacity="0.7" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect
          id="sf-arc"
          x="-10%" y="40%"
          width="120%" height="18%"
          fill="url(#sf-grad)"
          transform="rotate(-12, 50, 50)"
          clipPath="url(#sf-clip)"
          style={{ opacity: 0 }}
          rx="2"
        />
      </svg>
    </div>
  )
})

export default SolarFlareWipe
