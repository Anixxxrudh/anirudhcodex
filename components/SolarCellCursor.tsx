"use client"
import { useEffect, useRef } from "react"

const CANVAS   = 60
const RADIUS   = 18
const GRID_N   = 3
const CELL     = 6
const GAP      = 1.5
const GRID_TOT = GRID_N * CELL + (GRID_N - 1) * GAP   // 21px
const OFFSET   = (CANVAS - GRID_TOT) / 2               // 19.5px

export default function SolarCellCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    let mx = -999, my = -999, pmx = -999, pmy = -999
    let ringAngle = 0
    let speed = 0
    let isHovered = false
    let animId: number
    let lastPulse = 0

    // Per-cell state: alpha + target alpha
    const cells = Array.from({ length: 9 }, () => ({ alpha: 0.15, target: 0.15 }))

    // ── Mouse tracking ───────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      pmx = mx; pmy = my
      mx = e.clientX; my = e.clientY
      canvas.style.left = mx - CANVAS / 2 + "px"
      canvas.style.top  = my - CANVAS / 2 + "px"
      const dx = mx - pmx, dy = my - pmy
      speed = Math.sqrt(dx * dx + dy * dy)
    }

    // ── Hover detection ──────────────────────────────────────────────
    const onEnter = () => { isHovered = true }
    const onLeave = () => { isHovered = false }
    const attach = () => {
      document.querySelectorAll("button, a, .project-card, .now-card, .placeholder-card, .timeline-card, .navbar-brand").forEach(el => {
        el.addEventListener("mouseenter", onEnter)
        el.addEventListener("mouseleave", onLeave)
      })
    }
    // attach after short delay to ensure DOM is ready
    const attachTimer = setTimeout(attach, 800)

    // ── Draw loop ────────────────────────────────────────────────────
    const draw = (now: number) => {
      ctx.clearRect(0, 0, CANVAS, CANVAS)
      const cx = CANVAS / 2, cy = CANVAS / 2

      // Decay speed
      speed *= 0.80

      // ── Idle pulse: fire one random cell every ~300ms ─────────────
      if (now - lastPulse > 300 && !isHovered && speed < 2) {
        cells[Math.floor(Math.random() * 9)].target = 0.55
        lastPulse = now
      }

      // ── Movement wave: brighten cells in direction of travel ──────
      if (speed > 2.5 && pmx !== -999) {
        const dx = mx - pmx, dy = my - pmy
        const travelAngle = Math.atan2(dy, dx)
        for (let row = 0; row < GRID_N; row++) {
          for (let col = 0; col < GRID_N; col++) {
            const dot = (col - 1) * Math.cos(travelAngle) + (row - 1) * Math.sin(travelAngle)
            if (dot > 0.3) cells[row * GRID_N + col].target = Math.min(0.65, cells[row * GRID_N + col].target + 0.12)
          }
        }
      }

      // ── Hover: all cells full brightness ─────────────────────────
      if (isHovered) {
        cells.forEach(c => { c.target = 0.6 })
      }

      // ── Update cell alpha toward target ───────────────────────────
      for (const c of cells) {
        c.alpha += (c.target - c.alpha) * 0.1
        if (c.target > 0.15 && Math.abs(c.alpha - c.target) < 0.008) {
          c.target = 0.15   // fade back after reaching peak
        }
      }

      const baseAlpha = isHovered ? 0.45 : speed > 2.5 ? 0.30 : 0.15

      // ── Ring rotation speed ───────────────────────────────────────
      ringAngle += isHovered ? 3.5 : speed > 2.5 ? 2.2 : 0.7

      // ── Draw outer dashed rotating ring ──────────────────────────
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate((ringAngle * Math.PI) / 180)
      ctx.strokeStyle = isHovered
        ? "rgba(77,184,255,0.75)"
        : `rgba(77,184,255,${speed > 2.5 ? 0.55 : 0.35})`
      ctx.lineWidth = 1
      ctx.setLineDash([4, 3])
      ctx.beginPath()
      ctx.arc(0, 0, isHovered ? RADIUS + 2 : RADIUS, 0, Math.PI * 2)
      ctx.stroke()

      // Second faint ring at slightly larger radius on hover
      if (isHovered) {
        ctx.strokeStyle = "rgba(77,184,255,0.2)"
        ctx.lineWidth = 0.5
        ctx.setLineDash([2, 5])
        ctx.beginPath()
        ctx.arc(0, 0, RADIUS + 6, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()

      // ── Draw 3×3 solar cell grid ──────────────────────────────────
      ctx.setLineDash([])
      for (let row = 0; row < GRID_N; row++) {
        for (let col = 0; col < GRID_N; col++) {
          const i   = row * GRID_N + col
          const x   = OFFSET + col * (CELL + GAP)
          const y   = OFFSET + row * (CELL + GAP)
          const a   = Math.max(baseAlpha, cells[i].alpha)

          // Fill
          ctx.fillStyle = `rgba(77,184,255,${a})`
          ctx.fillRect(x, y, CELL, CELL)

          // Grid lines (thin electrode-style lines)
          ctx.strokeStyle = `rgba(77,184,255,${Math.min(a * 2.5, 0.9)})`
          ctx.lineWidth   = 0.5
          ctx.strokeRect(x, y, CELL, CELL)

          // Diagonal "charge carrier" line inside each cell at high brightness
          if (a > 0.35) {
            ctx.strokeStyle = `rgba(200,235,255,${(a - 0.35) * 1.5})`
            ctx.lineWidth   = 0.4
            ctx.beginPath()
            ctx.moveTo(x + 1, y + CELL - 1)
            ctx.lineTo(x + CELL - 1, y + 1)
            ctx.stroke()
          }
        }
      }

      // ── Center dot ────────────────────────────────────────────────
      ctx.beginPath()
      ctx.arc(cx, cy, isHovered ? 2.5 : 2, 0, Math.PI * 2)
      ctx.fillStyle = isHovered ? "#4db8ff" : "rgba(255,255,255,0.9)"
      if (isHovered) {
        ctx.shadowBlur  = 6
        ctx.shadowColor = "#4db8ff"
      }
      ctx.fill()
      ctx.shadowBlur = 0

      animId = requestAnimationFrame(draw)
    }

    window.addEventListener("mousemove", onMove)
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      clearTimeout(attachTimer)
      window.removeEventListener("mousemove", onMove)
      document.querySelectorAll("button, a, .project-card, .now-card, .placeholder-card, .timeline-card, .navbar-brand").forEach(el => {
        el.removeEventListener("mouseenter", onEnter)
        el.removeEventListener("mouseleave", onLeave)
      })
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS}
      height={CANVAS}
      style={{
        position:      "fixed",
        pointerEvents: "none",
        zIndex:        9999,
        left:          "-999px",
        top:           "-999px",
        imageRendering: "pixelated",
      }}
    />
  )
}
