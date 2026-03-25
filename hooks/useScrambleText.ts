import { useState, useEffect, useRef } from "react"

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&"

export function useScrambleText(text: string, trigger: boolean) {
  const [display, setDisplay] = useState(text)
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!trigger || startedRef.current) return
    startedRef.current = true

    const chars = text.split("")
    const resolved = new Array(chars.length).fill(false)

    // rapid scramble interval
    frameRef.current = setInterval(() => {
      setDisplay(
        chars
          .map((ch, i) =>
            resolved[i]
              ? ch
              : ch === " " || ch === "\n"
              ? ch
              : CHARS[Math.floor(Math.random() * CHARS.length)]
          )
          .join("")
      )
    }, 40)

    // resolve letters one by one with staggered delays
    chars.forEach((ch, i) => {
      if (ch === " " || ch === "\n") {
        resolved[i] = true
        return
      }
      setTimeout(() => {
        resolved[i] = true
        // if all resolved, clear interval
        if (resolved.every(Boolean)) {
          if (frameRef.current) clearInterval(frameRef.current)
          setDisplay(text)
        }
      }, 400 + i * 40)
    })

    return () => {
      if (frameRef.current) clearInterval(frameRef.current)
    }
  }, [trigger, text])

  return display
}
