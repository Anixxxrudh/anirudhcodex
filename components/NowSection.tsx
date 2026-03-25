"use client"

const NOW = [
  { label: "Lab",              value: "Engineering CdTe solar cells with SWCNT networks + ALD Al₂O₃ to reduce back-interface recombination." },
  { label: "Reading / Watching", value: "Solar cell physics, device optimization papers, startup and tech content." },
  { label: "Listening To",    value: "Deep house and techno mixes. My Axiom playlist on Apple Music." },
  { label: "Climbing",        value: "Indoor top rope — building endurance and technique for outdoor climbs." },
]

export default function NowSection() {
  return (
    <section className="now-section">
      <div className="section-eyebrow">Present</div>
      <h2 className="section-title">Now</h2>
      <div className="now-grid">
        {NOW.map((n) => (
          <div className="now-card" key={n.label}>
            <span className="now-label">{n.label}</span>
            <p className="now-value">{n.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}