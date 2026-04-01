"use client"
import { useRef, useCallback } from "react"

interface Props {
  children: React.ReactNode
  className?: string
  strength?: number
}

// Wraps a card grid — on mousemove, each .tidal-item is pushed away from the cursor
export default function TidalGrid({ children, className = "", strength = 20 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const grid = ref.current
    if (!grid) return
    for (const w of grid.querySelectorAll<HTMLElement>(".tidal-item")) {
      const r = w.getBoundingClientRect()
      const dx = (r.left + r.width  / 2) - e.clientX
      const dy = (r.top  + r.height / 2) - e.clientY
      const dist = Math.hypot(dx, dy) || 1
      const falloff = Math.max(0, 1 - dist / 380) ** 2
      w.style.transform = `translate(${(dx / dist) * strength * falloff}px, ${(dy / dist) * strength * falloff}px)`
    }
  }, [strength])

  const onMouseLeave = useCallback(() => {
    const grid = ref.current
    if (!grid) return
    for (const w of grid.querySelectorAll<HTMLElement>(".tidal-item")) {
      w.style.transform = ""
    }
  }, [])

  return (
    <div ref={ref} className={className} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      {children}
    </div>
  )
}
