"use client"
import { useEffect, useRef, useState } from "react"

interface Props {
  text: string
  charDelay?: number     // ms between chars
  flickerDur?: number    // ms each char flickers before settling
  className?: string
  onDone?: () => void
  color?: string
  glitchColor?: string
}

const NOISE_CHARS = "█▓▒░╳×◌◦⊕⊗~!?#"

export default function SignalTypewriter({
  text,
  charDelay = 65,
  flickerDur = 320,
  className = "",
  onDone,
  color = "#F5F0E8",
  glitchColor = "#C9A84C",
}: Props) {
  const [chars, setChars] = useState<{ char: string; settled: boolean }[]>([])
  const [noiseMap, setNoiseMap] = useState<Record<number, string>>({})
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let idx = 0
    setChars([])
    setNoiseMap({})

    intervalRef.current = setInterval(() => {
      if (idx >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        onDone?.()
        return
      }

      const i = idx
      setChars((prev) => [...prev, { char: text[i], settled: false }])

      // Flicker the new char
      const flickerStart = Date.now()
      const tickFlicker = () => {
        const elapsed = Date.now() - flickerStart
        if (elapsed >= flickerDur) {
          setChars((prev) => {
            const n = [...prev]
            if (n[i]) n[i] = { ...n[i], settled: true }
            return n
          })
          setNoiseMap((prev) => { const n = { ...prev }; delete n[i]; return n })
          return
        }
        setNoiseMap((prev) => ({
          ...prev,
          [i]: NOISE_CHARS[Math.floor(Math.random() * NOISE_CHARS.length)],
        }))
        setTimeout(tickFlicker, 40 + Math.random() * 30)
      }
      setTimeout(tickFlicker, 20)

      idx++
    }, charDelay)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [text, charDelay, flickerDur, onDone])

  return (
    <span className={className} style={{ display: "inline-block" }}>
      {chars.map((c, i) => {
        const noise = noiseMap[i]
        return (
          <span
            key={i}
            style={{
              color: noise ? glitchColor : color,
              opacity: noise ? 0.7 + Math.random() * 0.3 : 1,
              transition: c.settled ? "color 0.15s ease, opacity 0.15s ease" : "none",
              display: "inline-block",
              whiteSpace: "pre",
            }}
          >
            {noise ?? c.char}
          </span>
        )
      })}
      <span
        style={{
          display: "inline-block",
          width: "2px",
          height: "1em",
          background: glitchColor,
          marginLeft: "2px",
          verticalAlign: "middle",
          animation: "st-blink 0.8s step-end infinite",
        }}
      />
      <style>{`@keyframes st-blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </span>
  )
}
