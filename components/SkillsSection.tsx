"use client"
import { useEffect, useRef, useState } from "react"

const SKILLS = [
  { label: "JV / EQE Characterization", level: 9, color: "#00e5ff" },
  { label: "ALD / Sputtering",          level: 8, color: "#4db8ff" },
  { label: "Leadership",                level: 9, color: "#00e5ff" },
  { label: "JMP / IGOR",               level: 7, color: "#4db8ff" },
  { label: "Python",                    level: 6, color: "#7ed957" },
  { label: "Web / Design",             level: 5, color: "#7ed957" },
]

export default function SkillsSection() {
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect() } },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="skills-section" ref={ref}>
      <div className="section-eyebrow">Capabilities</div>
      <h2 className="section-title">Skills</h2>
      <div className="skills-list">
        {SKILLS.map((s) => (
          <div className="skill-row" key={s.label}>
            <div className="skill-meta">
              <span className="skill-label">{s.label}</span>
              <span className="skill-level">{s.level} / 10</span>
            </div>
            <div className="skill-track">
              <div
                className="skill-fill"
                style={{
                  width: started ? `${s.level * 10}%` : "0%",
                  background: `linear-gradient(90deg, ${s.color}88, ${s.color})`,
                  boxShadow: started ? `0 0 12px ${s.color}55` : "none",
                  transition: "width 1.2s cubic-bezier(0.16,1,0.3,1), box-shadow 1.2s ease",
                  transitionDelay: `${SKILLS.indexOf(s) * 0.1}s`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}