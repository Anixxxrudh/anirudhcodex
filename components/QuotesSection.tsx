"use client"
import { useEffect, useRef, useState } from "react"

const QUOTES = [
  {
    text: "The most beautiful thing we can experience is the mysterious. It is the source of all true art and science.",
    author: "Albert Einstein",
  },
  {
    text: "Research is to see what everybody else has seen, and to think what nobody else has thought.",
    author: "Albert Szent-Györgyi",
  },
  {
    text: "An investment in knowledge pays the best interest.",
    author: "Benjamin Franklin",
  },
]

export default function QuotesSection() {
  const [active, setActive] = useState(0)
  const [fading, setFading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goTo = (idx: number) => {
    if (idx === active) return
    setFading(true)
    setTimeout(() => {
      setActive(idx)
      setFading(false)
    }, 300)
  }

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setActive((a) => (a + 1) % QUOTES.length)
        setFading(false)
      }, 300)
    }, 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const q = QUOTES[active]

  return (
    <section className="quotes-section snap-section">
      <div
        className="quote-text"
        style={{ opacity: fading ? 0 : 1 }}
      >
        &ldquo;{q.text}&rdquo;
      </div>
      <div
        className="quote-author"
        style={{ opacity: fading ? 0 : 1, transition: "opacity 0.3s ease" }}
      >
        — {q.author}
      </div>
      <div className="quote-dots">
        {QUOTES.map((_, i) => (
          <button
            key={i}
            className={`quote-dot${active === i ? " active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Quote ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
