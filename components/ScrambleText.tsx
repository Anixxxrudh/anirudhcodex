"use client"
import { useEffect, useRef, useState } from "react"
import { useScrambleText } from "../hooks/useScrambleText"

type Props = {
  text: string
  className?: string
  as?: "h2" | "h1" | "h3" | "span" | "p"
}

export default function ScrambleText({ text, className, as: Tag = "h2" }: Props) {
  const [triggered, setTriggered] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const displayed = useScrambleText(text, triggered)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true)
          obs.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Render preserving line breaks (text may contain \n or <br>-style splits)
  const lines = displayed.split("\n")

  return (
    <Tag className={className} ref={ref as React.RefObject<HTMLElement & HTMLHeadingElement>}>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </Tag>
  )
}
