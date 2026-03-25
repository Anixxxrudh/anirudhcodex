"use client"
import { useEffect, useRef, useState } from "react"

const STATS = [
  { value: 2,   suffix: "+",    label: "Years of Research"          },
  { value: 120, suffix: "+",    label: "Solar Devices Fabricated"   },
  { value: 3,   suffix: "",     label: "Conferences Presented"      },
  { value: 1,   suffix: "",     label: "Club Led as President"      },
  { value: 9,   suffix: "/10",  label: "JV / EQE Proficiency"       },
  { value: 50,  suffix: "+",    label: "Wilderness Trips Organized" },
]

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function AnimatedCounter({ value, suffix, label, triggered }: {
  value: number; suffix: string; label: string; triggered: boolean
}) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number>(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!triggered || startedRef.current) return
    startedRef.current = true
    const duration = 2000

    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now
      const elapsed = now - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutExpo(progress)
      setCount(Math.round(eased * value))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [triggered, value])

  return (
    <div className="counter-item">
      <span className="counter-number">
        {count}{suffix}
      </span>
      <span className="counter-label">{label}</span>
    </div>
  )
}

export default function CounterSection() {
  const [triggered, setTriggered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); obs.disconnect() } },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div className="counter-section snap-section" ref={ref}>
      <div className="section-eyebrow">By the Numbers</div>
      <div className="counter-grid">
        {STATS.map((s) => (
          <AnimatedCounter key={s.label} {...s} triggered={triggered} />
        ))}
      </div>
    </div>
  )
}
