import { HyperjumpLink } from "@/components/HyperjumpLink"
import "../../globals.css"

const HOBBIES: Record<string, { name: string; tagline: string; accent: string; description: string }> = {
  climbing: {
    name: "Climbing",
    tagline: "Reading rock like code.",
    accent: "#7ed957",
    description: "Mostly indoor right now, working toward more outdoor routes. Climbing is a mental discipline as much as a physical one — reading a problem, committing to a sequence, staying precise under pressure.",
  },
  guitar: {
    name: "Guitar",
    tagline: "Six strings, infinite patterns.",
    accent: "#4db8ff",
    description: "Self-taught. Drawn to fingerpicking patterns and ambient textures over shredding. The guitar is a tool for patience.",
  },
  djing: {
    name: "DJing",
    tagline: "Sets built like narratives.",
    accent: "#a78bfa",
    description: "Deep house, minimal techno, ambient. Sets are built like narratives — tension, release, texture, resolution. Immersion over impact.",
  },
  badminton: {
    name: "Badminton",
    tagline: "Precision under pressure.",
    accent: "#fbbf24",
    description: "Competitive and casual. Fast reflexes, precise footwork. The court is where physics becomes instinct.",
  },
  hiking: {
    name: "Hiking",
    tagline: "Wilderness, measured in miles.",
    accent: "#34d399",
    description: "Day hikes and multi-day expeditions. As President of WEX, organized trips to Cuyahoga Valley, Smoky Mountains, and more.",
  },
  art: {
    name: "Art",
    tagline: "Making sense through making.",
    accent: "#f472b6",
    description: "Digital and analog — visual work, illustration, and creative experiments. Art is where I think through things that don't fit into equations.",
  },
}

export function generateStaticParams() {
  return Object.keys(HOBBIES).map((hobby) => ({ hobby }))
}

export default async function HobbyPage({ params }: { params: Promise<{ hobby: string }> }) {
  const { hobby } = await params
  const data = HOBBIES[hobby]

  if (!data) {
    return (
      <main className="hobby-page-shell">
        <HyperjumpLink href="/#hobbies" className="hobby-back">← Back</HyperjumpLink>
        <h1 className="hobby-page-title" style={{ color: "rgba(255,255,255,0.5)" }}>Not found.</h1>
      </main>
    )
  }

  return (
    <main className="hobby-page-shell">
      {/* Back */}
      <HyperjumpLink href="/#hobbies" className="hobby-back">← Back to Hobbies</HyperjumpLink>

      {/* Header */}
      <div className="hobby-page-header">
        <p className="hobby-page-eyebrow" style={{ color: data.accent }}>Hobbies</p>
        <h1 className="hobby-page-title" style={{ color: data.accent }}>{data.name}</h1>
        <p className="hobby-page-tagline">{data.tagline}</p>
        <p className="hobby-page-desc">{data.description}</p>
      </div>

      {/* Media grid */}
      <div className="hobby-media-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="hobby-media-slot">
            <div className="hobby-media-placeholder">
              <span className="hobby-media-icon" style={{ color: data.accent }}>+</span>
              <span className="hobby-media-label">Coming Soon</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
