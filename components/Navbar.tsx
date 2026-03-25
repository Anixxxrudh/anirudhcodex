"use client"
import { useState } from "react"

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
  const [open, setOpen] = useState(false)

  const go = (key: string) => {
    setMode(key)
    scrollToSection(key)
    setOpen(false)
  }

  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand" onClick={() => go("home")}>
          THE ANIRUDH PROTOCOL
        </span>
        <div className="navbar-divider" />

        {/* Desktop nav items */}
        {NAV_ITEMS.map(({ key, label }) => (
          <button
            key={key}
            className={`navbar-desktop-btn${mode === key ? " active" : ""}`}
            onClick={() => go(key)}
          >
            {label}
          </button>
        ))}

        {/* Mobile hamburger */}
        <button
          className={`hamburger${open ? " hamburger--open" : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Mobile overlay */}
      <div className={`mobile-overlay${open ? " mobile-overlay--open" : ""}`}>
        <nav className="mobile-nav">
          {NAV_ITEMS.map(({ key, label }, i) => (
            <button
              key={key}
              className="mobile-nav-item"
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => go(key)}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </>
  )
}
