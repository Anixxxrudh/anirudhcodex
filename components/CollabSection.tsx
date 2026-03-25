const COLLAB_ITEMS = [
  {
    icon: "⚛",
    title: "Research Partnerships",
    body: "Photovoltaics, astrophysics, renewable energy, data analysis.",
  },
  {
    icon: "◆",
    title: "Internship Opportunities",
    body: "Summer 2026 and beyond. Physics, engineering, data science, tech.",
  },
  {
    icon: "◎",
    title: "Hackathon Teams",
    body: "Fast builder, systems thinker. Let's make something in 24 hours.",
  },
  {
    icon: "△",
    title: "Outdoor Adventures",
    body: "Climbing, hiking, wilderness trips. Always looking for partners.",
  },
  {
    icon: "♫",
    title: "Music Collabs",
    body: "DJ sets, ambient production, anything atmospheric and interesting.",
  },
]

export default function CollabSection() {
  return (
    <section className="collab-section snap-section" style={{ position: "relative" }}>
      <span className="section-ghost-number">09</span>
      <div className="section-eyebrow">Collaboration</div>
      <h2 className="section-title">Open To</h2>
      <div className="collab-grid">
        {COLLAB_ITEMS.map((item) => (
          <div key={item.title} className="collab-card">
            <span className="collab-icon">{item.icon}</span>
            <div className="collab-title">{item.title}</div>
            <p className="collab-body">{item.body}</p>
          </div>
        ))}
      </div>
      <a href="mailto:akunnat3@rockets.utoledo.edu" className="collab-cta">
        Get in touch → akunnat3@rockets.utoledo.edu
      </a>
    </section>
  )
}
