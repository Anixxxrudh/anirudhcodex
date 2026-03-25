"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Navbar from "../components/Navbar"

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    let animId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const NUM_STARS = 220
    type Star = { x: number; y: number; z: number }
    const stars: Star[] = Array.from({ length: NUM_STARS }, () => ({
      x: (Math.random() - 0.5) * 2000,
      y: (Math.random() - 0.5) * 2000,
      z: Math.random() * 1000,
    }))

    const loop = () => {
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      ctx.fillStyle = "rgba(0,0,0,0.18)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (const s of stars) {
        s.z -= 3.5
        if (s.z <= 1) {
          s.x = (Math.random() - 0.5) * 2000
          s.y = (Math.random() - 0.5) * 2000
          s.z = 1000
        }
        const sx = (s.x / s.z) * 600 + cx
        const sy = (s.y / s.z) * 600 + cy
        const r = Math.max(0.4, (1 - s.z / 1000) * 2.8)
        const alpha = 1 - s.z / 1000
        if (sx < 0 || sx > canvas.width || sy < 0 || sy > canvas.height) continue
        ctx.beginPath()
        ctx.arc(sx, sy, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.fill()
      }
      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <div className="not-found-page">
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
      />
      <Navbar setMode={() => {}} mode="home" scrollToSection={() => {}} />
      <div className="not-found-content">
        <span className="not-found-label" style={{ color: "rgba(255,80,80,0.55)", letterSpacing: "0.35em" }}>
          PROTOCOL ERROR
        </span>
        <div className="not-found-code">404</div>
        <span className="not-found-label">SECTOR NOT FOUND</span>
        <p className="not-found-desc">
          The coordinates you entered do not exist within The Protocol.
        </p>
        <Link href="/" className="resume-btn">
          RETURN TO PROTOCOL
        </Link>
      </div>
    </div>
  )
}
