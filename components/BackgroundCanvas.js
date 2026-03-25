"use client"
import { useEffect, useRef } from "react"

export default function BackgroundCanvas({ mode }) {
  const canvasRef = useRef(null)
  const modeRef = useRef(mode)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let animId

    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width = W
    canvas.height = H

    const onResize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
    }
    window.addEventListener("resize", onResize)

    // ─── MODE CONFIG ──────────────────────────────────────────────────
    const modeConfig = {
      home:     { warpSpeed: 6,    warpColor: [180, 220, 255], nebulaHue: 210, bgAlpha: 0.18 },
      about:    { warpSpeed: 0.4,  warpColor: [210, 220, 240], nebulaHue: 220, bgAlpha: 0.26 },
      projects: { warpSpeed: 2.5,  warpColor: [100, 215, 255], nebulaHue: 190, bgAlpha: 0.20 },
      physics:  { warpSpeed: 3.5,  warpColor: [90,  210, 255], nebulaHue: 195, bgAlpha: 0.18 },
      music:    { warpSpeed: 14,   warpColor: [255, 135, 70],  nebulaHue: 18,  bgAlpha: 0.14 },
      climbing: { warpSpeed: 1.0,  warpColor: [155, 215, 100], nebulaHue: 95,  bgAlpha: 0.22 },
      contact:  { warpSpeed: 0.6,  warpColor: [195, 210, 255], nebulaHue: 230, bgAlpha: 0.28 },
    }

    const lerp  = (a, b, t) => a + (b - a) * t
    const lerpA = (a, b, t) => a.map((v, i) => lerp(v, b[i], t))

    let cur = {
      warpSpeed: 6,
      warpColor: [180, 220, 255],
      nebulaHue: 210,
      bgAlpha:   0.18,
    }

    // ─── WARP STARS ───────────────────────────────────────────────────
    const NSTARS = 280
    const makeStar = (spread = false) => {
      const angle = Math.random() * Math.PI * 2
      const r     = Math.random() * 1.2 + 0.3
      return {
        angle,
        r,
        dist:  spread ? Math.random() * Math.min(W, H) * 0.55 : r + Math.random() * 3,
        speed: Math.random() * 0.5 + 0.5,
        len:   0,
        bright: Math.random() * 0.5 + 0.5,
      }
    }
    const stars = Array.from({ length: NSTARS }, () => makeStar(true))

    // ─── DRIFT PARTICLES ──────────────────────────────────────────────
    const NDRIFT = 90
    const drift = Array.from({ length: NDRIFT }, () => ({
      x:       Math.random() * W,
      y:       Math.random() * H,
      vy:      -(Math.random() * 0.22 + 0.04),
      vx:      (Math.random() - 0.5) * 0.07,
      size:    Math.random() * 1.6 + 0.3,
      alpha:   Math.random() * 0.45 + 0.1,
      twinkle: Math.random() * Math.PI * 2,
    }))

    // ─── PULSE RINGS (music) ──────────────────────────────────────────
    const NRINGS = 7
    const maxR   = () => Math.max(W, H) * 0.7
    const rings  = Array.from({ length: NRINGS }, (_, i) => ({
      phase: (i / NRINGS) * 3000,
      speed: 0.55 + i * 0.15,
    }))

    // ─── NEBULA BLOBS ─────────────────────────────────────────────────
    const NNEBULA = 5
    const nebula = Array.from({ length: NNEBULA }, () => ({
      x:   W * (0.1 + Math.random() * 0.8),
      y:   H * (0.1 + Math.random() * 0.8),
      rx:  130 + Math.random() * 190,
      ry:  80  + Math.random() * 140,
      rot: Math.random() * Math.PI,
      a:   0.016 + Math.random() * 0.02,
    }))

    let frame = 0

    const draw = (now) => {
      animId = requestAnimationFrame(draw)
      frame++

      const cfg   = modeConfig[modeRef.current] || modeConfig.home
      const SPEED = 0.022

      cur.warpSpeed = lerp(cur.warpSpeed, cfg.warpSpeed, SPEED)
      cur.warpColor = lerpA(cur.warpColor, cfg.warpColor, SPEED)
      cur.nebulaHue = lerp(cur.nebulaHue, cfg.nebulaHue, SPEED)
      cur.bgAlpha   = lerp(cur.bgAlpha,   cfg.bgAlpha,   SPEED)

      const m = modeRef.current

      // Background
      ctx.fillStyle = `rgba(0,0,0,${cur.bgAlpha})`
      ctx.fillRect(0, 0, W, H)

      // ── Nebula ─────────────────────────────────────────────────────
      nebula.forEach((n, i) => {
        const pulse = Math.sin(frame * 0.003 + i * 1.4) * 0.25 + 1
        const hue   = ((cur.nebulaHue + i * 28) % 360).toFixed(0)
        ctx.save()
        ctx.translate(n.x, n.y)
        ctx.rotate(n.rot + frame * 0.00025)
        ctx.scale(1, n.ry / n.rx)
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, n.rx * pulse)
        grd.addColorStop(0,    `hsla(${hue},68%,58%,${n.a * 2.8})`)
        grd.addColorStop(0.45, `hsla(${hue},55%,38%,${n.a})`)
        grd.addColorStop(1,    `hsla(${hue},40%,18%,0)`)
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(0, 0, n.rx * pulse, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // ── Music pulse rings ──────────────────────────────────────────
      if (m === "music") {
        const [r, g, b] = cur.warpColor
        const mr = maxR()
        rings.forEach((ring) => {
          const age   = ((now + ring.phase) * ring.speed * 0.06) % mr
          const ratio = age / mr
          const alpha = (1 - ratio) * 0.38

          ctx.beginPath()
          ctx.arc(W / 2, H / 2, age, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${r},${Math.round(g * 0.5)},${Math.round(b * 0.25)},${alpha})`
          ctx.lineWidth   = (1 - ratio) * 2.5
          ctx.stroke()
        })

        // Beat spikes every ~8 frames
        if (frame % 8 === 0) {
          for (let i = 0; i < 10; i++) {
            const ang = (i / 10) * Math.PI * 2
            const len = 30 + Math.random() * 100
            ctx.beginPath()
            ctx.moveTo(W / 2, H / 2)
            ctx.lineTo(W / 2 + Math.cos(ang) * len, H / 2 + Math.sin(ang) * len)
            ctx.strokeStyle = `rgba(${r},${Math.round(g * 0.4)},${Math.round(b * 0.15)},0.1)`
            ctx.lineWidth   = 1
            ctx.stroke()
          }
        }
      }

      // ── Warp stars ─────────────────────────────────────────────────
      const [r, g, b] = cur.warpColor
      const cx = W / 2, cy = H / 2

      stars.forEach((s) => {
        const prevX = cx + Math.cos(s.angle) * s.dist
        const prevY = cy + Math.sin(s.angle) * s.dist

        s.dist += cur.warpSpeed * s.speed * 0.45
        s.len   = Math.min(s.len + cur.warpSpeed * 0.25, cur.warpSpeed * 9)

        const nx = cx + Math.cos(s.angle) * s.dist
        const ny = cy + Math.sin(s.angle) * s.dist

        if (s.dist > Math.max(W, H) * 0.75) {
          Object.assign(s, makeStar(false))
          return
        }

        const alpha = Math.min((s.dist / (Math.min(W, H) * 0.08)) * s.bright, 1)
        const streak = Math.max(s.len, 0.5)

        // Streak
        ctx.beginPath()
        ctx.moveTo(prevX - Math.cos(s.angle) * streak * 0.5, prevY - Math.sin(s.angle) * streak * 0.5)
        ctx.lineTo(nx, ny)
        const grd = ctx.createLinearGradient(prevX, prevY, nx, ny)
        grd.addColorStop(0, `rgba(${r},${g},${b},0)`)
        grd.addColorStop(1, `rgba(${r},${g},${b},${alpha * 0.92})`)
        ctx.strokeStyle = grd
        ctx.lineWidth   = s.r * (m === "music" ? 1.4 : 0.85)
        ctx.stroke()

        // Tip dot
        ctx.beginPath()
        ctx.arc(nx, ny, s.r * 0.65, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.55})`
        ctx.fill()
      })

      // ── Drift particles (about / climbing / contact) ────────────────
      if (m === "about" || m === "climbing" || m === "contact") {
        drift.forEach((p) => {
          p.twinkle += 0.018
          p.y += p.vy
          p.x += p.vx
          if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W }
          const tw = (Math.sin(p.twinkle) * 0.28 + 0.72) * p.alpha
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r},${g},${b},${tw})`
          ctx.fill()
        })
      }

      // ── Vignette ───────────────────────────────────────────────────
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.18, W / 2, H / 2, H * 0.88)
      vig.addColorStop(0, "rgba(0,0,0,0)")
      vig.addColorStop(1, "rgba(0,0,0,0.58)")
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, W, H)
    }

    draw(0)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", top: 0, left: 0, zIndex: 0, pointerEvents: "none" }}
    />
  )
}