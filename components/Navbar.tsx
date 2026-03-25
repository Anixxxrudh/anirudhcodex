"use client"

type NavbarProps = {
  mode: string
  setMode: (mode: string) => void
  scrollToSection: (section: string) => void
}

export default function Navbar({ mode, setMode, scrollToSection }: NavbarProps) {
  return (
    <div className="navbar">

      <button
        className={mode === "home" ? "active" : ""}
        onClick={() => {
          setMode("home")
          scrollToSection("home")
        }}
      >
        Home
      </button>

      <button
        className={mode === "physics" ? "active" : ""}
        onClick={() => {
          setMode("physics")
          scrollToSection("physics")
        }}
      >
        Physics
      </button>

      <button
        className={mode === "music" ? "active" : ""}
        onClick={() => {
          setMode("music")
          scrollToSection("music")
        }}
      >
        Music
      </button>

      <button
        className={mode === "climbing" ? "active" : ""}
        onClick={() => {
          setMode("climbing")
          scrollToSection("climbing")
        }}
      >
        Climbing
      </button>

    </div>
  )
}