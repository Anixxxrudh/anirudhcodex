"use client"
import { useEffect, useRef } from "react"

export default function BackgroundCanvas({ mode, scrollProgress = 0 }) {
  const canvasRef          = useRef(null)
  const modeRef            = useRef(mode)
  const scrollProgressRef  = useRef(scrollProgress)

  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { scrollProgressRef.current = scrollProgress }, [scrollProgress])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext("2d")
    let animId

    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width = W; canvas.height = H

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight
      canvas.width = W; canvas.height = H
    }
    window.addEventListener("resize", onResize)

    // ─── MODE CONFIG ──────────────────────────────────────────────────
    const modeConfig = {
      home:     { warpSpeed: 6,   warpColor: [180,220,255], nebulaHue: 210, bgAlpha: 0.18 },
      about:    { warpSpeed: 0.4, warpColor: [210,220,240], nebulaHue: 220, bgAlpha: 0.26 },
      projects: { warpSpeed: 2.5, warpColor: [100,215,255], nebulaHue: 190, bgAlpha: 0.20 },
      physics:  { warpSpeed: 3.5, warpColor: [90,210,255],  nebulaHue: 195, bgAlpha: 0.18 },
      hobbies:  { warpSpeed: 1.0, warpColor: [155,215,100], nebulaHue: 130, bgAlpha: 0.22 },
      contact:  { warpSpeed: 0.6, warpColor: [195,210,255], nebulaHue: 230, bgAlpha: 0.28 },
    }
    const lerp  = (a, b, t) => a + (b - a) * t
    const lerpA = (a, b, t) => a.map((v, i) => lerp(v, b[i], t))
    let cur = { warpSpeed: 6, warpColor: [180,220,255], nebulaHue: 210, bgAlpha: 0.18 }

    // ─── WARP STARS ───────────────────────────────────────────────────
    const NSTARS = 220
    const makeStar = (spread = false) => {
      const angle = Math.random() * Math.PI * 2
      const r     = Math.random() * 1.1 + 0.3
      return {
        angle, r,
        dist:  spread ? Math.random() * Math.min(W,H) * 0.55 : r + Math.random() * 3,
        speed: Math.random() * 0.5 + 0.5,
        len:   0,
        bright: Math.random() * 0.5 + 0.5,
      }
    }
    const stars = Array.from({ length: NSTARS }, () => makeStar(true))

    // ─── DRIFT PARTICLES ──────────────────────────────────────────────
    const NDRIFT = 70
    const drift = Array.from({ length: NDRIFT }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vy: -(Math.random() * 0.2 + 0.04),
      vx: (Math.random() - 0.5) * 0.06,
      size: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.4 + 0.1,
      twinkle: Math.random() * Math.PI * 2,
    }))

    // ─── NEBULA BLOBS ─────────────────────────────────────────────────
    const NNEBULA = 4
    const nebula = Array.from({ length: NNEBULA }, () => ({
      x: W * (0.1 + Math.random() * 0.8),
      y: H * (0.1 + Math.random() * 0.8),
      rx: 120 + Math.random() * 180,
      ry: 70  + Math.random() * 130,
      rot: Math.random() * Math.PI,
      a:   0.014 + Math.random() * 0.018,
    }))

    // ─── SCROLL SCENE DATA (pre-generated) ────────────────────────────

    // Asteroids (zone 2)
    const asteroids = Array.from({ length: 16 }, () => {
      const r = 3 + Math.random() * 8
      const nv = 6 + Math.floor(Math.random() * 4)
      return {
        x: Math.random() * W, y: H * (0.15 + Math.random() * 0.7),
        vx: (Math.random() - 0.5) * 0.18,
        r, rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.005,
        verts: Array.from({ length: nv }, (_, i) => ({
          a: (i / nv) * Math.PI * 2 + (Math.random() - 0.5) * 0.35,
          r: r * (0.62 + Math.random() * 0.72),
        })),
        baseAlpha: 0.5 + Math.random() * 0.35,
      }
    })

    // Galaxy stars (zone 6)
    const GALAXY_XF = 0.74, GALAXY_YF = 0.46
    const galaxyPts = Array.from({ length: 280 }, (_, i) => {
      const arm  = i % 3
      const t    = Math.random()
      const ang  = arm * (Math.PI * 2 / 3) + t * Math.PI * 2.6
      const dist = t * 0.18 + (Math.random() - 0.5) * 0.04
      const flat = 0.38
      return {
        xF: GALAXY_XF + Math.cos(ang) * dist,
        yF: GALAXY_YF + Math.sin(ang) * dist * flat,
        r:  0.3 + Math.random() * 1.4 * (1 - t * 0.4),
        a:  0.18 + Math.random() * 0.5 * (1 - t * 0.35),
        hue: t < 0.3 ? 200 + Math.random() * 40 : 180 + Math.random() * 80,
      }
    })

    // Star cluster pts (zone 8) — deterministic so no rebuild needed
    const clusterPts = Array.from({ length: 90 }, (_, i) => {
      const s1 = Math.sin(i * 127.1) * 43758.5453
      const s2 = Math.sin(i * 311.7) * 43758.5453
      const fx = (s1 - Math.floor(s1) - 0.5) * 0.38
      const fy = (s2 - Math.floor(s2) - 0.5) * 0.22
      const dist = Math.sqrt(fx * fx + fy * fy)
      return { fx, fy, dist, r: 0.4 + (s1 % 0.6) * 0.4, hue: 45 + (s2 % 0.3) * 40 }
    })

    // Comet (zone 9)
    let cometX = -300, cometY = H * 0.25, cometActive = false, cometTimer = 0
    const resetComet = () => {
      cometX = -300; cometY = H * (0.1 + Math.random() * 0.45); cometActive = true
    }

    // Pulsar beams (zone 5)
    let pulsarAngle = 0

    let frame = 0

    // ─── zone alpha helper ─────────────────────────────────────────────
    const zone = (sp, fi, pi, po, fo) => {
      if (sp <= fi) return 0
      if (sp <= pi) return (sp - fi) / (pi - fi)
      if (sp <= po) return 1
      if (sp <= fo) return 1 - (sp - po) / (fo - po)
      return 0
    }

    // ─── DRAW HELPERS ─────────────────────────────────────────────────

    const drawPlanet = (px, py, pr, c1, c2, alpha, rings, ringTilt = -0.25) => {
      ctx.save(); ctx.globalAlpha = alpha
      // atmosphere
      const atmo = ctx.createRadialGradient(px, py, pr * 0.85, px, py, pr * 1.65)
      atmo.addColorStop(0, c1.replace("rgb(","rgba(").replace(")",",0.10)"))
      atmo.addColorStop(1, "rgba(0,0,0,0)")
      ctx.beginPath(); ctx.arc(px, py, pr * 1.65, 0, Math.PI * 2)
      ctx.fillStyle = atmo; ctx.fill()
      // ring back half
      if (rings) {
        ctx.globalAlpha = alpha * 0.3
        ctx.beginPath()
        ctx.ellipse(px, py, pr * 2.3, pr * 2.3 * 0.21, ringTilt, Math.PI * 0.05, Math.PI * 0.95)
        ctx.strokeStyle = c1; ctx.lineWidth = pr * 0.26; ctx.stroke()
      }
      ctx.globalAlpha = alpha
      // body
      const body = ctx.createRadialGradient(px - pr*0.28, py - pr*0.28, pr*0.05, px, py, pr)
      body.addColorStop(0, "rgba(255,255,255,0.15)"); body.addColorStop(0.3, c1); body.addColorStop(1, c2)
      ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fillStyle = body; ctx.fill()
      // ring front half
      if (rings) {
        ctx.globalAlpha = alpha * 0.65
        ctx.beginPath()
        ctx.ellipse(px, py, pr * 2.3, pr * 2.3 * 0.21, ringTilt, Math.PI * 1.05, Math.PI * 1.95)
        ctx.strokeStyle = c1; ctx.lineWidth = pr * 0.26; ctx.stroke()
      }
      ctx.restore()
    }

    const drawBlackHole = (bx, by, br, alpha) => {
      ctx.save(); ctx.globalAlpha = alpha
      // outer glow
      const glow = ctx.createRadialGradient(bx, by, br, bx, by, br * 5)
      glow.addColorStop(0, "rgba(255,150,20,0.07)"); glow.addColorStop(1, "rgba(0,0,0,0)")
      ctx.beginPath(); ctx.arc(bx, by, br * 5, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill()
      // accretion rings
      for (let ring = 3; ring >= 1; ring--) {
        const dr = br * (1.3 + ring * 0.42)
        ctx.beginPath()
        ctx.ellipse(bx, by, dr, dr * 0.2, 0.18, 0, Math.PI * 2)
        const g = ctx.createLinearGradient(bx - dr, by, bx + dr, by)
        const a = 0.5 / ring
        g.addColorStop(0, "rgba(255,110,0,0)")
        g.addColorStop(0.3, `rgba(255,160,30,${a})`)
        g.addColorStop(0.5, `rgba(255,220,90,${a * 1.35})`)
        g.addColorStop(0.7, `rgba(255,160,30,${a})`)
        g.addColorStop(1, "rgba(255,110,0,0)")
        ctx.strokeStyle = g; ctx.lineWidth = br * 0.22; ctx.stroke()
      }
      // core
      const core = ctx.createRadialGradient(bx, by, 0, bx, by, br * 1.15)
      core.addColorStop(0, "#000"); core.addColorStop(0.78, "#000")
      core.addColorStop(0.88, "rgba(0,0,0,0.9)"); core.addColorStop(1, "rgba(0,0,0,0)")
      ctx.beginPath(); ctx.arc(bx, by, br * 1.15, 0, Math.PI * 2); ctx.fillStyle = core; ctx.fill()
      // photon ring
      ctx.beginPath(); ctx.arc(bx, by, br * 1.12, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(255,210,70,0.45)"; ctx.lineWidth = br * 0.07; ctx.stroke()
      ctx.restore()
    }

    const drawNebulaBig = (nx, ny, nr, alpha, fr) => {
      if (alpha <= 0.005) return
      const blobs = [
        { ox:0, oy:0, r:1, c:"rgba(180,40,120," },
        { ox:nr*0.28, oy:-nr*0.18, r:0.72, c:"rgba(110,25,200," },
        { ox:-nr*0.35, oy:nr*0.22, r:0.62, c:"rgba(200,55,75," },
        { ox:nr*0.12, oy:nr*0.32, r:0.52, c:"rgba(90,18,175," },
      ]
      ctx.save(); ctx.globalAlpha = alpha
      for (const b of blobs) {
        const bx = nx + b.ox + Math.sin(fr * 0.002 + b.ox) * 4
        const by = ny + b.oy + Math.cos(fr * 0.003 + b.oy) * 3
        const g  = ctx.createRadialGradient(bx, by, 0, bx, by, nr * b.r)
        g.addColorStop(0, b.c + "0.10)"); g.addColorStop(0.45, b.c + "0.05)"); g.addColorStop(1, b.c + "0)")
        ctx.beginPath(); ctx.arc(bx, by, nr * b.r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill()
      }
      ctx.restore()
    }

    const drawPulsar = (px, py, pr, alpha, fr) => {
      if (alpha <= 0.005) return
      ctx.save(); ctx.globalAlpha = alpha
      pulsarAngle += 0.018
      // rotating beams
      for (let b = 0; b < 2; b++) {
        const ang = pulsarAngle + b * Math.PI
        const beamLen = Math.min(W, H) * 0.35
        const g = ctx.createLinearGradient(px, py, px + Math.cos(ang) * beamLen, py + Math.sin(ang) * beamLen)
        g.addColorStop(0, "rgba(100,220,255,0.55)"); g.addColorStop(0.25, "rgba(60,180,255,0.18)"); g.addColorStop(1, "rgba(0,0,0,0)")
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(ang) * beamLen, py + Math.sin(ang) * beamLen)
        ctx.strokeStyle = g; ctx.lineWidth = pr * 0.5; ctx.stroke()
      }
      // star body
      const pulse = 1 + 0.08 * Math.sin(fr * 0.15)
      const gstar = ctx.createRadialGradient(px, py, 0, px, py, pr * 2.5 * pulse)
      gstar.addColorStop(0, "rgba(255,255,255,0.9)"); gstar.addColorStop(0.25, "rgba(140,230,255,0.4)"); gstar.addColorStop(1, "rgba(0,0,0,0)")
      ctx.beginPath(); ctx.arc(px, py, pr * 2.5 * pulse, 0, Math.PI * 2); ctx.fillStyle = gstar; ctx.fill()
      ctx.restore()
    }

    const drawGalaxy = (alpha) => {
      if (alpha <= 0.005) return
      const gcx = GALAXY_XF * W, gcy = GALAXY_YF * H
      const scl = Math.min(W, H)
      ctx.save(); ctx.globalAlpha = alpha
      // core glow
      const core = ctx.createRadialGradient(gcx, gcy, 0, gcx, gcy, scl * 0.065)
      core.addColorStop(0, "rgba(220,215,255,0.16)"); core.addColorStop(0.5, "rgba(150,170,255,0.06)"); core.addColorStop(1, "rgba(0,0,0,0)")
      ctx.beginPath(); ctx.arc(gcx, gcy, scl * 0.065, 0, Math.PI * 2); ctx.fillStyle = core; ctx.fill()
      // stars
      for (const s of galaxyPts) {
        ctx.beginPath(); ctx.arc(s.xF * W, s.yF * H, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${s.hue},70%,82%,${s.a * alpha})`; ctx.fill()
      }
      ctx.restore()
    }

    const drawSupergiant = (sx, sy, sr, alpha, fr) => {
      if (alpha <= 0.005) return
      ctx.save(); ctx.globalAlpha = alpha
      const pulse = 1 + 0.07 * Math.sin(fr * 0.025)
      // corona
      const corona = ctx.createRadialGradient(sx, sy, sr * 0.8, sx, sy, sr * 4.5 * pulse)
      corona.addColorStop(0, "rgba(255,90,30,0.12)"); corona.addColorStop(0.4, "rgba(200,50,10,0.04)"); corona.addColorStop(1, "rgba(0,0,0,0)")
      ctx.beginPath(); ctx.arc(sx, sy, sr * 4.5, 0, Math.PI * 2); ctx.fillStyle = corona; ctx.fill()
      // body
      const body = ctx.createRadialGradient(sx - sr*0.2, sy - sr*0.2, sr*0.05, sx, sy, sr * pulse)
      body.addColorStop(0, "rgba(255,230,150,0.95)"); body.addColorStop(0.4, "rgba(255,120,40,0.85)"); body.addColorStop(1, "rgba(180,30,0,0.6)")
      ctx.beginPath(); ctx.arc(sx, sy, sr * pulse, 0, Math.PI * 2); ctx.fillStyle = body; ctx.fill()
      ctx.restore()
    }

    const drawStarCluster = (alpha, fr) => {
      if (alpha <= 0.005) return
      const ccx = W * 0.28, ccy = H * 0.55, cr = Math.min(W, H) * 0.22
      ctx.save(); ctx.globalAlpha = alpha
      // glow core
      const core = ctx.createRadialGradient(ccx, ccy, 0, ccx, ccy, cr * 0.38)
      core.addColorStop(0, "rgba(255,240,200,0.10)"); core.addColorStop(1, "rgba(0,0,0,0)")
      ctx.beginPath(); ctx.arc(ccx, ccy, cr * 0.38, 0, Math.PI * 2); ctx.fillStyle = core; ctx.fill()
      for (const p of clusterPts) {
        const dist = p.dist
        const a = Math.max(0, (1 - dist / 0.22)) * 0.55 * (0.8 + 0.2 * Math.sin(fr * 0.018 + dist * 40))
        ctx.beginPath(); ctx.arc(ccx + p.fx * W * 2, ccy + p.fy * H * 2, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue},80%,88%,${a * alpha})`; ctx.fill()
      }
      ctx.restore()
    }

    // ─── DRAW LOOP ────────────────────────────────────────────────────
    const draw = (_now) => {
      animId = requestAnimationFrame(draw)
      frame++

      const cfg   = modeConfig[modeRef.current] || modeConfig.home
      const SPEED = 0.022
      cur.warpSpeed = lerp(cur.warpSpeed, cfg.warpSpeed, SPEED)
      cur.warpColor = lerpA(cur.warpColor, cfg.warpColor, SPEED)
      cur.nebulaHue = lerp(cur.nebulaHue, cfg.nebulaHue, SPEED)
      cur.bgAlpha   = lerp(cur.bgAlpha,   cfg.bgAlpha,   SPEED)

      const m  = modeRef.current
      const sp = scrollProgressRef.current   // 0 → 1

      ctx.fillStyle = `rgba(0,0,0,${cur.bgAlpha})`
      ctx.fillRect(0, 0, W, H)

      // ── Ambient nebulae ────────────────────────────────────────────
      nebula.forEach((n, i) => {
        const pulse = Math.sin(frame * 0.003 + i * 1.4) * 0.25 + 1
        const hue   = ((cur.nebulaHue + i * 28) % 360).toFixed(0)
        ctx.save()
        ctx.translate(n.x, n.y); ctx.rotate(n.rot + frame * 0.00025)
        ctx.scale(1, n.ry / n.rx)
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, n.rx * pulse)
        grd.addColorStop(0,    `hsla(${hue},68%,58%,${n.a * 2.8})`)
        grd.addColorStop(0.45, `hsla(${hue},55%,38%,${n.a})`)
        grd.addColorStop(1,    `hsla(${hue},40%,18%,0)`)
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(0, 0, n.rx * pulse, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      })

      // ── Warp stars ─────────────────────────────────────────────────
      const [r, g, b] = cur.warpColor
      const wcx = W / 2, wcy = H / 2
      stars.forEach((s) => {
        const prevX = wcx + Math.cos(s.angle) * s.dist
        const prevY = wcy + Math.sin(s.angle) * s.dist
        s.dist += cur.warpSpeed * s.speed * 0.45
        s.len   = Math.min(s.len + cur.warpSpeed * 0.25, cur.warpSpeed * 9)
        const nx = wcx + Math.cos(s.angle) * s.dist
        const ny = wcy + Math.sin(s.angle) * s.dist
        if (s.dist > Math.max(W, H) * 0.75) { Object.assign(s, makeStar(false)); return }
        const alpha = Math.min((s.dist / (Math.min(W,H) * 0.08)) * s.bright, 1)
        const streak = Math.max(s.len, 0.5)
        ctx.beginPath()
        ctx.moveTo(prevX - Math.cos(s.angle) * streak * 0.5, prevY - Math.sin(s.angle) * streak * 0.5)
        ctx.lineTo(nx, ny)
        const grd = ctx.createLinearGradient(prevX, prevY, nx, ny)
        grd.addColorStop(0, `rgba(${r},${g},${b},0)`)
        grd.addColorStop(1, `rgba(${r},${g},${b},${alpha * 0.9})`)
        ctx.strokeStyle = grd; ctx.lineWidth = s.r * 0.85; ctx.stroke()
        ctx.beginPath(); ctx.arc(nx, ny, s.r * 0.6, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.5})`; ctx.fill()
      })

      // ── Drift particles ────────────────────────────────────────────
      if (m === "about" || m === "hobbies" || m === "contact") {
        drift.forEach((p) => {
          p.twinkle += 0.018; p.y += p.vy; p.x += p.vx
          if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W }
          const tw = (Math.sin(p.twinkle) * 0.28 + 0.72) * p.alpha
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r},${g},${b},${tw})`; ctx.fill()
        })
      }

      // ── SCROLL-TRIGGERED REVEALS ───────────────────────────────────
      // Each zone(sp, fadeIn, peakIn, peakOut, fadeOut) returns 0-1

      // Zone 1 — Ringed planet (about, ~0.06-0.26)
      {
        const a = zone(sp, 0.04, 0.10, 0.20, 0.28)
        if (a > 0.005) {
          drawPlanet(W * 0.82, H * 0.38, Math.min(W,H) * 0.11,
            "rgb(70,110,220)", "rgb(12,30,110)", a, true)
        }
      }

      // Zone 2 — Asteroid belt (projects, ~0.18-0.40)
      {
        const a = zone(sp, 0.15, 0.22, 0.34, 0.42)
        if (a > 0.005) {
          for (const ast of asteroids) {
            ast.rot += ast.rotSpeed; ast.x += ast.vx
            if (ast.x < -20) ast.x = W + 20
            if (ast.x > W + 20) ast.x = -20
            ctx.save(); ctx.globalAlpha = a * ast.baseAlpha
            ctx.translate(ast.x, ast.y); ctx.rotate(ast.rot)
            ctx.beginPath()
            ctx.moveTo(ast.verts[0].r * Math.cos(ast.verts[0].a), ast.verts[0].r * Math.sin(ast.verts[0].a))
            for (const v of ast.verts) ctx.lineTo(v.r * Math.cos(v.a), v.r * Math.sin(v.a))
            ctx.closePath()
            ctx.fillStyle = "rgba(130,120,110,0.85)"; ctx.strokeStyle = "rgba(190,180,165,0.4)"
            ctx.lineWidth = 0.5; ctx.fill(); ctx.stroke()
            ctx.restore()
          }
        }
      }

      // Zone 3 — Black hole (physics, ~0.28-0.50)
      {
        const a = zone(sp, 0.26, 0.34, 0.44, 0.52)
        if (a > 0.005) drawBlackHole(W * 0.22, H * 0.46, Math.min(W,H) * 0.065, a)
      }

      // Zone 4 — Large colorful nebula (hobbies, ~0.40-0.58)
      {
        const a = zone(sp, 0.38, 0.45, 0.54, 0.62)
        drawNebulaBig(W * 0.62, H * 0.42, Math.min(W,H) * 0.36, a * 0.85, frame)
      }

      // Zone 5 — Pulsar (timeline, ~0.50-0.68)
      {
        const a = zone(sp, 0.48, 0.54, 0.64, 0.72)
        drawPulsar(W * 0.78, H * 0.38, Math.min(W,H) * 0.018, a, frame)
      }

      // Zone 6 — Spiral galaxy (skills, ~0.58-0.78)
      {
        const a = zone(sp, 0.56, 0.64, 0.74, 0.82)
        drawGalaxy(a)
      }

      // Zone 7 — Red supergiant (blog, ~0.68-0.86)
      {
        const a = zone(sp, 0.66, 0.73, 0.82, 0.90)
        drawSupergiant(W * 0.15, H * 0.35, Math.min(W,H) * 0.055, a, frame)
      }

      // Zone 8 — Dense star cluster (collab/quotes, ~0.78-0.96)
      {
        const a = zone(sp, 0.76, 0.83, 0.93, 0.99)
        drawStarCluster(a, frame)
      }

      // Zone 9 — Comet (contact, ~0.88-1.0)
      {
        const a = zone(sp, 0.86, 0.92, 0.99, 1.0)
        if (a > 0.3) {
          cometTimer++
          if (!cometActive && cometTimer > 160) { resetComet(); cometTimer = 0 }
          if (cometActive) {
            cometX += 5.5
            if (cometX > W + 260) cometActive = false
            const cLen = 90
            ctx.save(); ctx.globalAlpha = a * 0.75
            const cg = ctx.createLinearGradient(cometX - cLen, cometY, cometX, cometY)
            cg.addColorStop(0, "rgba(160,220,255,0)")
            cg.addColorStop(0.65, "rgba(190,235,255,0.4)")
            cg.addColorStop(1, "rgba(255,255,255,0.95)")
            ctx.beginPath()
            ctx.moveTo(cometX - cLen, cometY - 0.6); ctx.lineTo(cometX, cometY)
            ctx.lineTo(cometX - cLen, cometY + 0.6); ctx.closePath()
            ctx.fillStyle = cg; ctx.fill()
            ctx.restore()
          }
        }
      }

      // ── Vignette ───────────────────────────────────────────────────
      const vig = ctx.createRadialGradient(W/2, H/2, H*0.18, W/2, H/2, H*0.88)
      vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(0,0,0,0.55)")
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H)
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
      style={{ position:"fixed", top:0, left:0, zIndex:0, pointerEvents:"none" }}
    />
  )
}
