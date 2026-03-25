"use client"
import { useEffect, useRef, useState, useCallback } from "react"

type Props = {
  scrollToSection: (s: string) => void
  onClose: () => void
}

const makeCommands = (scrollToSection: (s: string) => void) => [
  { label: "Go Home",             icon: "⌫", action: () => scrollToSection("home")     },
  { label: "About Me",            icon: "◈", action: () => scrollToSection("about")    },
  { label: "View Projects",       icon: "◆", action: () => scrollToSection("projects") },
  { label: "Physics & Research",  icon: "⚛", action: () => scrollToSection("physics")  },
  { label: "Music",               icon: "◎", action: () => scrollToSection("music")    },
  { label: "Climbing",            icon: "△", action: () => scrollToSection("climbing") },
  { label: "Timeline",            icon: "—", action: () => scrollToSection("timeline") },
  { label: "Skills",              icon: "▣", action: () => scrollToSection("skills")   },
  { label: "Contact Me",          icon: "◉", action: () => scrollToSection("contact")  },
  { label: "View GitHub",         icon: "◇", action: () => window.open("https://github.com/Anixxxrudh", "_blank") },
  { label: "Email Me",            icon: "◈", action: () => window.open("mailto:akunnat3@rockets.utoledo.edu") },
  { label: "Download Resume",     icon: "↓", action: () => window.open("/resume.pdf", "_blank") },
  { label: "View LinkedIn",       icon: "◈", action: () => window.open("https://www.linkedin.com/in/anirudh-menon-kunnath-pathayapura-247b07246/", "_blank") },
]

export default function CommandPalette({ scrollToSection, onClose }: Props) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const commands = makeCommands(scrollToSection)
  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setSelected(0)
  }, [query])

  const execute = useCallback((idx: number) => {
    filtered[idx]?.action()
    onClose()
  }, [filtered, onClose])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelected((s) => Math.min(s + 1, filtered.length - 1))
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelected((s) => Math.max(s - 1, 0))
      }
      if (e.key === "Enter") {
        e.preventDefault()
        execute(selected)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [filtered, selected, execute, onClose])

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-box" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="cmd-input"
          placeholder="Type a command..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="cmd-list">
          {filtered.map((cmd, i) => (
            <div
              key={cmd.label}
              className={`cmd-item${selected === i ? " selected" : ""}`}
              onMouseEnter={() => setSelected(i)}
              onClick={() => execute(i)}
            >
              <span className="cmd-icon">{cmd.icon}</span>
              <span className="cmd-label">{cmd.label}</span>
            </div>
          ))}
        </div>
        <div className="cmd-hint">↑↓ NAVIGATE · ENTER SELECT · ESC CLOSE</div>
      </div>
    </div>
  )
}
