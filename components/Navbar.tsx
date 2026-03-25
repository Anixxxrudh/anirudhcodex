"use client"

type NavbarProps = {
  mode: string
  setMode: (mode: string) => void
  scrollToSection: (section: string) => void
}

export default function Navbar({ mode, setMode, scrollToSection }: NavbarProps) {
  const navItems = [
    { key: "home", label: "Home" },
    { key: "about", label: "About" },
    { key: "projects", label: "Projects" },
    { key: "physics", label: "Physics" },
    { key: "music", label: "Music" },
    { key: "climbing", label: "Climbing" },
    { key: "contact", label: "Contact" },
  ]

  return (
    <div className="navbar">
      {navItems.map(({ key, label }) => (
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
    </div>
  )
}