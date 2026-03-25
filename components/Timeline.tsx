"use client"
import { useEffect, useRef, useState } from "react"
import TiltCard from "./TiltCard"
import ScrambleText from "./ScrambleText"

const MILESTONES = [
  { year: "2023", text: "Started undergraduate journey at University of Toledo — Physics / Astrophysics track." },
  { year: "2024", text: "Joined Wright Center for Photovoltaics Innovation (PVIC) research lab." },
  { year: "2025", text: "Began working on CdTe solar cell interface optimization using SWCNT networks and ALD-deposited Al₂O₃." },
  { year: "2025", text: "Presented research at NSM Undergraduate Research Expo." },
  { year: "2026", text: "Selected for Klar Leadership Academy." },
  { year: "2026", text: "Presented research at Carlson Library Undergraduate Exhibition." },
]

export default function Timeline() {
  const [visible, setVisible] = useState<boolean[]>(Array(MILESTONES.length).fill(false))
  const refs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers = refs.current.map((el, i) => {
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(v => { const n = [...v]; n[i] = true; return n })
            obs.disconnect()
          }
        },
        { threshold: 0.3 }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(o => o?.disconnect())
  }, [])

  return (
    <section className="timeline-section">
      <div className="section-eyebrow">Journey</div>
      <ScrambleText text="The Timeline" className="section-title" />

      <div className="timeline-track">
        <div className="timeline-line" />
        {MILESTONES.map((m, i) => (
          <div
            key={i}
            ref={el => { refs.current[i] = el }}
            className={`timeline-item ${i % 2 === 0 ? "timeline-left" : "timeline-right"} ${visible[i] ? "timeline-visible" : ""}`}
          >
            <div className="timeline-dot" />
            <TiltCard className="timeline-card">
              <span className="timeline-year">{m.year}</span>
              <p className="timeline-text">{m.text}</p>
            </TiltCard>
          </div>
        ))}
      </div>
    </section>
  )
}
