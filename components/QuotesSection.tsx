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

const FLOAT_QUOTES = [
  { text: "The cosmos is within us. We are made of star-stuff.", author: "Carl Sagan" },
  { text: "Not only is the universe stranger than we think, it is stranger than we can think.", author: "Heisenberg" },
  { text: "Physics is the only real science. The rest are just stamp collecting.", author: "Rutherford" },
  { text: "The important thing is to not stop questioning.", author: "Einstein" },
  { text: "In the middle of difficulty lies opportunity.", author: "Einstein" },
  { text: "Look up at the stars and not down at your feet.", author: "Hawking" },
  { text: "The universe is under no obligation to make sense to you.", author: "Neil deGrasse Tyson" },
  { text: "We are a way for the cosmos to know itself.", author: "Carl Sagan" },
  { text: "Science is a way of thinking much more than it is a body of knowledge.", author: "Carl Sagan" },
  { text: "The good thing about science is that it's true whether or not you believe in it.", author: "Neil deGrasse Tyson" },
]

// Deterministic pseudo-random from seed
function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

type FloatItem = {
  id: number; text: string; author: string
  x: number; y: number; rot: number
  dur: number; delay: number; driftX: number; driftY: number
  opacity: number; fontSize: number
}

export default function QuotesSection() {
  const [active, setActive] = useState(0)
  const [fading, setFading] = useState(false)
  const [floaters, setFloaters] = useState<FloatItem[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goTo = (idx: number) => {
    if (idx === active) return
    setFading(true)
    setTimeout(() => { setActive(idx); setFading(false) }, 300)
  }

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setFading(true)
      setTimeout(() => { setActive((a) => (a + 1) % QUOTES.length); setFading(false) }, 300)
    }, 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    const items: FloatItem[] = FLOAT_QUOTES.map((q, i) => ({
      id: i,
      text: q.text,
      author: q.author,
      x: 4 + seededRand(i * 3) * 82,
      y: 52 + seededRand(i * 7) * 42,
      rot: (seededRand(i * 11) - 0.5) * 14,
      dur: 10 + seededRand(i * 5) * 10,
      delay: -(seededRand(i * 13) * 12),
      driftX: (seededRand(i * 17) - 0.5) * 60,
      driftY: (seededRand(i * 19) - 0.5) * 40,
      opacity: 0.32 + seededRand(i * 23) * 0.28,
      fontSize: 0.82 + seededRand(i * 29) * 0.32,
    }))
    setFloaters(items)
  }, [])

  const q = QUOTES[active]

  return (
    <section className="quotes-section snap-section">
      {/* Floating zero-gravity quotes */}
      <div className="quotes-float-field" aria-hidden="true">
        {floaters.map((f) => (
          <div
            key={f.id}
            className="quote-floater"
            style={{
              left: `${f.x}%`,
              top:  `${f.y}%`,
              opacity: f.opacity,
              fontSize: `${f.fontSize}rem`,
              transform: `rotate(${f.rot}deg)`,
              animationDuration: `${f.dur}s`,
              animationDelay: `${f.delay}s`,
              ["--drift-x" as string]: `${f.driftX}px`,
              ["--drift-y" as string]: `${f.driftY}px`,
            }}
          >
            <span className="qf-text">&ldquo;{f.text}&rdquo;</span>
            <span className="qf-author">— {f.author}</span>
          </div>
        ))}
      </div>

      {/* Main rotating quote */}
      <div className="quote-text" style={{ opacity: fading ? 0 : 1 }}>
        &ldquo;{q.text}&rdquo;
      </div>
      <div className="quote-author" style={{ opacity: fading ? 0 : 1, transition: "opacity 0.3s ease" }}>
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
