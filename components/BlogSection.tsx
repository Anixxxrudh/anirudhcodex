"use client"

const POSTS = [
  {
    title:   "How Carbon Nanotubes Improve Solar Cell Efficiency",
    date:    "March 2026",
    tag:     "Research",
    excerpt: "A look at how SWCNT networks reduce back-interface recombination in CdTe devices.",
  },
  {
    title:   "What Dark Energy Tells Us About the Universe's Fate",
    date:    "February 2026",
    tag:     "Astrophysics",
    excerpt: "Exploring the implications of an accelerating universe and what it means for cosmology.",
  },
  {
    title:   "Building This Portfolio: Design Decisions and Tech Stack",
    date:    "March 2026",
    tag:     "Design",
    excerpt: "The thinking behind TheAnirudhProtocol — from the warp background to the atom cursor.",
  },
]

const TAG_COLORS: Record<string, string> = {
  Research:    "rgba(0,229,255,0.15)",
  Astrophysics:"rgba(160,100,255,0.15)",
  Design:      "rgba(126,217,87,0.15)",
}
const TAG_BORDER: Record<string, string> = {
  Research:    "rgba(0,229,255,0.4)",
  Astrophysics:"rgba(160,100,255,0.4)",
  Design:      "rgba(126,217,87,0.4)",
}
const TAG_TEXT: Record<string, string> = {
  Research:    "#00e5ff",
  Astrophysics:"#a064ff",
  Design:      "#7ed957",
}

export default function BlogSection() {
  return (
    <section className="blog-section">
      <div className="section-eyebrow">Blog / Research</div>
      <h2 className="section-title">Field Notes</h2>

      <div className="blog-grid">
        {POSTS.map((p) => (
          <div className="blog-card" key={p.title}>
            <div className="blog-card-top">
              <span
                className="blog-tag"
                style={{
                  background:   TAG_COLORS[p.tag],
                  border:       `1px solid ${TAG_BORDER[p.tag]}`,
                  color:        TAG_TEXT[p.tag],
                }}
              >
                {p.tag}
              </span>
              <span className="blog-date">{p.date}</span>
            </div>
            <h3 className="blog-title">{p.title}</h3>
            <p className="blog-excerpt">{p.excerpt}</p>
          </div>
        ))}
      </div>

      <p className="blog-coming-soon">
        Coming Soon — Full posts arriving shortly.
      </p>
    </section>
  )
}
