"use client"
import { useState, useEffect } from "react"

type CursorMode = "pulsar" | "lightsaber" | "spaceship" | "blackhole" | "whitehole" | "solarsystem"

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
  { key: "hobbies",  label: "Hobbies"  },
  { key: "contact",  label: "Contact"  },
]

const CURSOR_LIST: { id: CursorMode; label: string; icon: string }[] = [
  { id: "pulsar",      label: "Pulsar",       icon: "◉" },
  { id: "lightsaber",  label: "Lightsaber",   icon: "⟡" },
  { id: "spaceship",   label: "Spaceship",    icon: "▲" },
  { id: "blackhole",   label: "Black Hole",   icon: "◎" },
  { id: "whitehole",   label: "White Hole",   icon: "◉" },
  { id: "solarsystem", label: "Solar System", icon: "🪐" },
]

export default function Navbar({ mode, setMode, scrollToSection }: NavbarProps) {
  const [open,       setOpen]       = useState(false)
  const [cursorOpen, setCursorOpen] = useState(false)
  const [cursorMode, setCursorMode] = useState<CursorMode>("pulsar")

  useEffect(() => {
    const saved = localStorage.getItem("protocol-cursor") as CursorMode | null
    const valid: CursorMode[] = ["pulsar", "lightsaber", "spaceship", "blackhole", "whitehole", "solarsystem"]
    if (saved && valid.includes(saved)) setCursorMode(saved)
  }, [])

  const go = (key: string) => {
    setMode(key)
    scrollToSection(key)
    setOpen(false)
    setCursorOpen(false)
  }

  const selectCursor = (m: CursorMode) => {
    setCursorMode(m)
    localStorage.setItem("protocol-cursor", m)
    window.dispatchEvent(new CustomEvent("cursor-change", { detail: m }))
    setCursorOpen(false)
  }

  const currentCursor = CURSOR_LIST.find(c => c.id === cursorMode)

  return (
    <>
      <nav className="navbar" data-mode={mode}>
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

        {/* Cursor picker */}
        <div className="cursor-nav-picker">
          <button
            className={`cursor-nav-btn${cursorOpen ? " cursor-nav-btn--open" : ""}`}
            onClick={() => setCursorOpen(o => !o)}
            title="Change cursor style"
            aria-label="Cursor picker"
          >
            <span className="cursor-nav-icon">{currentCursor?.icon ?? "◉"}</span>
          </button>

          {cursorOpen && (
            <div className="cursor-nav-dropdown">
              <div className="cursor-nav-dropdown-label">CURSOR</div>
              {CURSOR_LIST.map((c) => (
                <button
                  key={c.id}
                  className={`cursor-nav-option${cursorMode === c.id ? " active" : ""}`}
                  onClick={() => selectCursor(c.id)}
                >
                  <span className="cursor-nav-option-icon">{c.icon}</span>
                  <span className="cursor-nav-option-label">{c.label}</span>
                  {cursorMode === c.id && <span className="cursor-nav-active-dot" />}
                </button>
              ))}
            </div>
          )}
        </div>

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
