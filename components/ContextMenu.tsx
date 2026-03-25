"use client"
import { useEffect, useRef, useState } from "react"

type Props = {
  scrollToSection: (s: string) => void
}

type MenuItem =
  | { type: "item"; label: string; icon: string; action: () => void }
  | { type: "divider" }

export default function ContextMenu({ scrollToSection }: Props) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const items: MenuItem[] = [
    { type: "item", label: "Go Home",         icon: "⌫", action: () => { scrollToSection("home"); close() } },
    { type: "divider" },
    { type: "item", label: "View GitHub",     icon: "◇", action: () => { window.open("https://github.com/Anixxxrudh", "_blank"); close() } },
    { type: "item", label: "Copy Email",      icon: "◈", action: () => {
      navigator.clipboard.writeText("akunnat3@rockets.utoledo.edu")
      setCopied(true)
      setTimeout(() => { setCopied(false); close() }, 1200)
    }},
    { type: "item", label: "Download Resume", icon: "↓", action: () => { window.open("/resume.pdf", "_blank"); close() } },
    { type: "item", label: "View LinkedIn",   icon: "◈", action: () => { window.open("https://www.linkedin.com/in/anirudh-menon-kunnath-pathayapura-247b07246/", "_blank"); close() } },
  ]

  const close = () => { setPos(null); setCopied(false) }

  useEffect(() => {
    const onContext = (e: MouseEvent) => {
      e.preventDefault()
      const x = e.clientX
      const y = e.clientY
      // will be clamped after mount via useEffect
      setPos({ x, y })
    }
    const onClose = () => close()
    document.addEventListener("contextmenu", onContext)
    document.addEventListener("click", onClose)
    return () => {
      document.removeEventListener("contextmenu", onContext)
      document.removeEventListener("click", onClose)
    }
  }, [])

  // clamp position to viewport after menu renders
  useEffect(() => {
    if (!pos || !menuRef.current) return
    const menu = menuRef.current
    const rect = menu.getBoundingClientRect()
    let { x, y } = pos
    if (x + rect.width  > window.innerWidth  - 8) x = window.innerWidth  - rect.width  - 8
    if (y + rect.height > window.innerHeight - 8) y = window.innerHeight - rect.height - 8
    if (x < 8) x = 8
    if (y < 8) y = 8
    menu.style.left = x + "px"
    menu.style.top  = y + "px"
  }, [pos])

  if (!pos) return null

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ left: pos.x, top: pos.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, i) =>
        item.type === "divider" ? (
          <div key={i} className="context-divider" />
        ) : (
          <div key={item.label} className="context-item" onClick={item.action}>
            <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>{item.icon}</span>
            {item.label === "Copy Email" && copied ? "Copied!" : item.label}
          </div>
        )
      )}
    </div>
  )
}
