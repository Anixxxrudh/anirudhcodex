"use client"

type NavbarProps = {
  mode: string
  setMode: (mode: string) => void
  scrollToSection: (section: string) => void
}

const NAV_ITEMS = [
  { key: "home",     label: "Home"     },
  { key: "about",    label: "About"    },
  { key: "projects", label: "Projects" },
  { key: "physics",  label: "Physics"  },
  { key: "music",    label: "Music"    },
  { key: "climbing", label: "Climbing" },
  { key: "contact",  label: "Contact"  },
]

export default function Navbar({ mode, setMode, scrollToSection }: NavbarProps) {
  return (
    <nav className="navbar">
      <span className="navbar-brand" onClick={() => { setMode("home"); scrollToSection("home") }}>
        THE ANIRUDH PROTOCOL
      </span>
      <div className="navbar-divider" />
      {NAV_ITEMS.map(({ key, label }) => (
        <button
          key={key}
          className={mode === key ? "active" : ""}
          onClick={() => {
            setMode(key)
            scrollToSection(key)
          }}
        >
          {label}
        </button>
      ))}
    </nav>
  )
}