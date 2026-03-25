import { useRef, useCallback } from "react"

export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const isTouch = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches

  const onMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      if (isTouch) return
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const rotateX = ((mouseY / rect.height) - 0.5) * -16
      const rotateY = ((mouseX / rect.width)  - 0.5) *  16
      el.style.transition = "transform 0.15s ease"
      el.style.transform  = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
    },
    [isTouch]
  )

  const onMouseLeave = useCallback(() => {
    if (isTouch) return
    const el = ref.current
    if (!el) return
    el.style.transition = "transform 0.4s ease"
    el.style.transform  = "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)"
  }, [isTouch])

  return { ref, onMouseMove, onMouseLeave }
}
