"use client"
import TiltCard from "./TiltCard"
import ScrambleText from "./ScrambleText"

const NOW = [
  { label: "Lab",               value: "Engineering CdTe solar cells with SWCNT networks + ALD Al₂O₃ to reduce back-interface recombination." },
  { label: "Reading / Watching", value: "Solar cell physics, device optimization papers, startup and tech content." },
  { label: "Listening To",      value: "Deep house and techno mixes. My Axiom playlist on Apple Music." },
  { label: "Climbing",          value: "Indoor top rope — building endurance and technique for outdoor climbs." },
]

export default function NowSection() {
  return (
    <section className="now-section">
      <div className="section-eyebrow">
        <span className="now-live-dot" />
        Present
      </div>
      <ScrambleText text="Now" className="section-title" />
      <div className="now-grid">
        {NOW.map((n) => (
          <TiltCard key={n.label} className="now-card">
            <span className="now-label">{n.label}</span>
            <p className="now-value">{n.value}</p>
          </TiltCard>
        ))}
      </div>
    </section>
  )
}
