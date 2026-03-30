"use client"
import { useEffect, useRef } from "react"

interface FieldStar { x: number; y: number; r: number; alpha: number; phase: number; speed: number }
interface ShootStar { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; alpha: number }
interface Particle  { x: number; y: number; homeX: number; homeY: number; vx: number; vy: number; r: number; alpha: number; blue: boolean }
interface Orbit     { rx: number; ry: number; tilt: number; speed: number; angle: number; color: string; trail: { x: number; y: number }[] }
interface PlasmaParticle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; r: number; hue: number }
interface Rocket {
  x: number; y: number
  angle: number        // current heading (radians, 0 = right)
  targetAngle: number
  speed: number
  steerTimer: number
  trail: { x: number; y: number; age: number }[]
  plasma: PlasmaParticle[]
  exhaustPhase: number
}

function buildFieldStars(W: number, H: number, count: number): FieldStar[] {
  return Array.from({ length: count }, () => ({
    x:     Math.random() * W,
    y:     Math.random() * H,
    r:     0.3 + Math.random() * 1.1,
    alpha: 0.08 + Math.random() * 0.30,
    phase: Math.random() * Math.PI * 2,
    speed: 0.004 + Math.random() * 0.012,
  }))
}

function buildRocket(W: number, H: number): Rocket {
  const angle = Math.random() * Math.PI * 2
  return {
    x: W * (0.2 + Math.random() * 0.6),
    y: H * (0.2 + Math.random() * 0.6),
    angle,
    targetAngle: angle,
    speed: 1.4 + Math.random() * 0.8,
    steerTimer: 0,
    trail: [],
    plasma: [],
    exhaustPhase: Math.random() * Math.PI * 2,
  }
}

function spawnPlasma(r: Rocket): void {
  // emit from rocket engine (opposite of heading)
  const exhaustAngle = r.angle + Math.PI
  const spread = 0.45
  for (let i = 0; i < 2; i++) {
    const a = exhaustAngle + (Math.random() - 0.5) * spread
    const spd = 1.2 + Math.random() * 2.2
    const life = 22 + Math.random() * 18
    r.plasma.push({
      x: r.x + Math.cos(exhaustAngle) * 10,
      y: r.y + Math.sin(exhaustAngle) * 10,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      life, maxLife: life,
      r: 1.5 + Math.random() * 2.5,
      // hue: 180–240 = cyan/blue/indigo for cold fusion
      hue: 180 + Math.random() * 60,
    })
  }
}

function drawRocket(ctx: CanvasRenderingContext2D, r: Rocket, t: number): void {
  ctx.save()
  ctx.translate(r.x, r.y)
  // heading: angle=0 means moving right; rotate so nose points in direction of travel
  ctx.rotate(r.angle - Math.PI / 2)

  // — Engine glow bloom behind rocket —
  const bloom = ctx.createRadialGradient(0, 14, 0, 0, 14, 22)
  bloom.addColorStop(0, `rgba(0,220,255,${0.55 + 0.15 * Math.sin(t * 0.18 + r.exhaustPhase)})`)
  bloom.addColorStop(0.4, "rgba(120,80,255,0.18)")
  bloom.addColorStop(1, "rgba(0,0,0,0)")
  ctx.shadowBlur = 28
  ctx.shadowColor = "#00dcff"
  ctx.beginPath()
  ctx.arc(0, 14, 22, 0, Math.PI * 2)
  ctx.fillStyle = bloom
  ctx.fill()

  // — Exhaust plume cone (cold fusion plasma jet) —
  const plumeLen = 20 + 8 * Math.sin(t * 0.22 + r.exhaustPhase)
  const plumeGrad = ctx.createLinearGradient(0, 14, 0, 14 + plumeLen)
  plumeGrad.addColorStop(0, "rgba(255,255,255,0.85)")
  plumeGrad.addColorStop(0.2, "rgba(0,230,255,0.65)")
  plumeGrad.addColorStop(0.55, "rgba(100,60,255,0.35)")
  plumeGrad.addColorStop(1, "rgba(0,0,0,0)")
  ctx.beginPath()
  ctx.moveTo(-4.5, 14)
  ctx.quadraticCurveTo(-8, 14 + plumeLen * 0.5, -1.5, 14 + plumeLen)
  ctx.lineTo(1.5, 14 + plumeLen)
  ctx.quadraticCurveTo(8, 14 + plumeLen * 0.5, 4.5, 14)
  ctx.closePath()
  ctx.fillStyle = plumeGrad
  ctx.fill()

  // — Rocket body —
  ctx.shadowBlur = 18
  ctx.shadowColor = "#00e5ff"

  // fuselage
  ctx.beginPath()
  ctx.moveTo(0, -18)         // nose tip
  ctx.lineTo(5, -6)          // right shoulder
  ctx.lineTo(5.5, 8)         // right waist
  ctx.lineTo(4, 14)          // right base
  ctx.lineTo(-4, 14)         // left base
  ctx.lineTo(-5.5, 8)        // left waist
  ctx.lineTo(-5, -6)         // left shoulder
  ctx.closePath()
  const bodyGrad = ctx.createLinearGradient(-6, -18, 6, 14)
  bodyGrad.addColorStop(0, "rgba(220,245,255,0.95)")
  bodyGrad.addColorStop(0.4, "rgba(120,200,255,0.85)")
  bodyGrad.addColorStop(1, "rgba(60,100,200,0.75)")
  ctx.fillStyle = bodyGrad
  ctx.fill()
  ctx.strokeStyle = "rgba(0,230,255,0.7)"
  ctx.lineWidth = 0.8
  ctx.stroke()

  // left fin
  ctx.beginPath()
  ctx.moveTo(-4.5, 8)
  ctx.lineTo(-12, 18)
  ctx.lineTo(-4, 14)
  ctx.closePath()
  ctx.fillStyle = "rgba(80,160,255,0.75)"
  ctx.fill()
  ctx.strokeStyle = "rgba(0,200,255,0.5)"
  ctx.lineWidth = 0.6
  ctx.stroke()

  // right fin
  ctx.beginPath()
  ctx.moveTo(4.5, 8)
  ctx.lineTo(12, 18)
  ctx.lineTo(4, 14)
  ctx.closePath()
  ctx.fillStyle = "rgba(80,160,255,0.75)"
  ctx.fill()
  ctx.stroke()

  // cockpit window
  ctx.shadowBlur = 10
  ctx.shadowColor = "#00ffff"
  const winGrad = ctx.createRadialGradient(-1.5, -8, 0, 0, -6, 5)
  winGrad.addColorStop(0, "rgba(200,255,255,1)")
  winGrad.addColorStop(0.5, "rgba(0,200,255,0.8)")
  winGrad.addColorStop(1, "rgba(0,60,180,0.5)")
  ctx.beginPath()
  ctx.ellipse(0, -7, 3.2, 4, 0, 0, Math.PI * 2)
  ctx.fillStyle = winGrad
  ctx.fill()

  // nose tip hot point
  ctx.shadowBlur = 16
  ctx.shadowColor = "#ffffff"
  ctx.beginPath()
  ctx.arc(0, -18, 1.5, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(255,255,255,0.95)"
  ctx.fill()

  ctx.restore()
}

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    let W = 0, H = 0, cx = 0, cy = 0
    let mouseX = -9999, mouseY = -9999
    let animId: number
    let t = 0
    let fieldStars: FieldStar[] = []
    let shoots: ShootStar[] = []
    let rockets: Rocket[] = []

    const resize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight
      canvas.width = W; canvas.height = H
      cx = W / 2; cy = H / 2
      fieldStars = buildFieldStars(W, H, 520)
      rockets = [buildRocket(W, H), buildRocket(W, H)]
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Interactive particles
    const particles: Particle[] = Array.from({ length: 140 }, () => {
      const x = Math.random() * W, y = Math.random() * H
      return { x, y, homeX: x, homeY: y,
        vx: (Math.random()-0.5)*0.25, vy: (Math.random()-0.5)*0.25,
        r: Math.random()*1.5+1, alpha: Math.random()*0.45+0.1,
        blue: Math.random() > 0.45 }
    })

    // Atom orbits
    const TRAIL = 28
    const orbits: Orbit[] = [
      { rx:195, ry:72, tilt:0,          speed:0.007, angle:0,            color:"#4db8ff", trail:[] },
      { rx:195, ry:72, tilt:Math.PI/3,  speed:0.011, angle:Math.PI*2/3, color:"#00e5ff", trail:[] },
      { rx:195, ry:72, tilt:-Math.PI/3, speed:0.009, angle:Math.PI*4/3, color:"#80cfff", trail:[] },
    ]

    // Nebula blobs
    const nebulae = [
      { xF:0.15, yF:0.20, rF:0.32, c0:"rgba(30,80,160,0.055)",  c1:"rgba(0,0,0,0)" },
      { xF:0.82, yF:0.35, rF:0.28, c0:"rgba(20,60,130,0.04)",   c1:"rgba(0,0,0,0)" },
      { xF:0.50, yF:0.75, rF:0.38, c0:"rgba(40,100,200,0.05)",  c1:"rgba(0,0,0,0)" },
      { xF:0.70, yF:0.10, rF:0.22, c0:"rgba(60,40,150,0.035)",  c1:"rgba(0,0,0,0)" },
    ]

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouseX = e.clientX - r.left; mouseY = e.clientY - r.top
    }
    const onLeave = () => { mouseX = -9999; mouseY = -9999 }
    canvas.addEventListener("mousemove", onMove)
    canvas.addEventListener("mouseleave", onLeave)

    // Shooting stars
    const spawnShoot = () => {
      const life = 55 + Math.random() * 40
      const edge = Math.random() > 0.5
      const x = edge ? Math.random() * W : W * (0.7 + Math.random() * 0.3)
      const y = edge ? Math.random() * H * 0.4 : Math.random() * H * 0.3
      const speed = 4 + Math.random() * 6
      const angle = Math.PI * 0.2 + Math.random() * 0.35
      shoots.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
        life, maxLife: life, alpha: 0.9 + Math.random()*0.1 })
    }
    let shootTimer = 0

    // ── Rocket update ────────────────────────────────────────────
    const updateRockets = () => {
      for (const r of rockets) {
        r.exhaustPhase += 0.08

        // steering: pick new target angle every ~90 frames
        r.steerTimer++
        if (r.steerTimer >= 90) {
          r.steerTimer = 0
          r.targetAngle = r.angle + (Math.random() - 0.5) * Math.PI * 1.1
        }

        // steer away from edges (margin = 15% of dimension)
        const mx = W * 0.15, my = H * 0.15
        if (r.x < mx)        r.targetAngle = 0
        if (r.x > W - mx)    r.targetAngle = Math.PI
        if (r.y < my)        r.targetAngle = Math.PI / 2
        if (r.y > H - my)    r.targetAngle = -Math.PI / 2

        // smooth angle interpolation (short-path wrap)
        let da = r.targetAngle - r.angle
        while (da >  Math.PI) da -= Math.PI * 2
        while (da < -Math.PI) da += Math.PI * 2
        r.angle += da * 0.028

        // move
        r.x += Math.cos(r.angle) * r.speed
        r.y += Math.sin(r.angle) * r.speed

        // trail
        r.trail.unshift({ x: r.x, y: r.y, age: 0 })
        for (const pt of r.trail) pt.age++
        if (r.trail.length > 60) r.trail.pop()

        // emit plasma
        spawnPlasma(r)

        // update plasma particles
        for (let i = r.plasma.length - 1; i >= 0; i--) {
          const p = r.plasma[i]
          p.x += p.vx; p.y += p.vy
          p.vx *= 0.95; p.vy *= 0.95
          p.life--
          if (p.life <= 0) r.plasma.splice(i, 1)
        }
      }
    }

    // ── Rocket draw ──────────────────────────────────────────────
    const drawRockets = () => {
      for (const r of rockets) {
        // Ion trail (fading line)
        if (r.trail.length > 1) {
          for (let i = 1; i < r.trail.length; i++) {
            const frac = 1 - i / r.trail.length
            const alpha = frac * frac * 0.55
            const width = frac * 2.5
            ctx.beginPath()
            ctx.moveTo(r.trail[i-1].x, r.trail[i-1].y)
            ctx.lineTo(r.trail[i].x,   r.trail[i].y)
            ctx.strokeStyle = `rgba(0,210,255,${alpha})`
            ctx.lineWidth = width
            ctx.shadowBlur = frac * 8
            ctx.shadowColor = "#00dcff"
            ctx.stroke()
          }
        }

        // Plasma particles
        ctx.save()
        for (const p of r.plasma) {
          const frac = p.life / p.maxLife
          const alpha = frac * frac * 0.9
          ctx.shadowBlur = 12
          ctx.shadowColor = `hsl(${p.hue},100%,70%)`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r * frac, 0, Math.PI * 2)
          ctx.fillStyle = `hsla(${p.hue},100%,75%,${alpha})`
          ctx.fill()
        }
        ctx.restore()

        // Rocket body
        drawRocket(ctx, r, t)
      }
    }

    const draw = () => {
      t++
      ctx.clearRect(0, 0, W, H)

      // Nebula clouds
      for (const n of nebulae) {
        const nx = n.xF*W, ny = n.yF*H, nr = n.rF*W
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr)
        g.addColorStop(0, n.c0); g.addColorStop(1, n.c1)
        ctx.beginPath(); ctx.arc(nx, ny, nr, 0, Math.PI*2)
        ctx.fillStyle = g; ctx.fill()
      }

      // Deep starfield
      for (const s of fieldStars) {
        const a = s.alpha * (0.6 + 0.4 * Math.sin(s.phase + t * s.speed))
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2)
        ctx.fillStyle = `rgba(200,230,255,${a})`; ctx.fill()
      }

      // Shooting stars
      shootTimer++
      if (shootTimer >= 210) { shootTimer = 0; spawnShoot() }
      for (let i = shoots.length - 1; i >= 0; i--) {
        const s = shoots[i]
        const prog  = 1 - s.life / s.maxLife
        const alpha = s.alpha * Math.sin(prog * Math.PI)
        const len   = (s.vx**2 + s.vy**2)**0.5 * 5
        ctx.save()
        ctx.translate(s.x, s.y)
        ctx.rotate(Math.atan2(s.vy, s.vx))
        const g = ctx.createLinearGradient(-len, 0, 6, 0)
        g.addColorStop(0, `rgba(255,255,255,0)`)
        g.addColorStop(0.6, `rgba(180,225,255,${alpha*0.6})`)
        g.addColorStop(1,   `rgba(255,255,255,${alpha})`)
        ctx.beginPath(); ctx.moveTo(-len,-0.7); ctx.lineTo(6,0); ctx.lineTo(-len,0.7); ctx.closePath()
        ctx.fillStyle = g; ctx.fill()
        ctx.shadowBlur = 12; ctx.shadowColor = "rgba(180,230,255,0.9)"
        ctx.beginPath(); ctx.arc(6, 0, 1.8, 0, Math.PI*2)
        ctx.fillStyle = `rgba(255,255,255,${alpha})`; ctx.fill()
        ctx.restore()
        s.x += s.vx; s.y += s.vy; s.life--
        if (s.life <= 0) shoots.splice(i, 1)
      }

      // Interactive particles
      for (const p of particles) {
        const dx = p.x-mouseX, dy = p.y-mouseY
        const dist = Math.sqrt(dx*dx+dy*dy)
        if (dist < 110 && dist > 0) {
          const f = (110-dist)/110
          p.vx += (dx/dist)*f*0.8; p.vy += (dy/dist)*f*0.8
        }
        p.vx += (p.homeX-p.x)*0.03; p.vy += (p.homeY-p.y)*0.03
        p.vx *= 0.88; p.vy *= 0.88; p.x += p.vx; p.y += p.vy
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2)
        ctx.fillStyle = p.blue ? `rgba(77,184,255,${p.alpha})` : `rgba(255,255,255,${p.alpha})`
        ctx.fill()
      }

      // Rockets
      updateRockets()
      drawRockets()

      // Orbit ellipses
      ctx.save(); ctx.translate(cx, cy)
      for (const o of orbits) {
        ctx.save(); ctx.rotate(o.tilt)
        ctx.strokeStyle = `${o.color}18`; ctx.lineWidth = 4
        ctx.beginPath(); ctx.ellipse(0,0,o.rx+3,o.ry+3,0,0,Math.PI*2); ctx.stroke()
        ctx.shadowBlur=14; ctx.shadowColor=o.color
        ctx.strokeStyle=`${o.color}40`; ctx.lineWidth=1.2
        ctx.beginPath(); ctx.ellipse(0,0,o.rx,o.ry,0,0,Math.PI*2); ctx.stroke()
        ctx.restore()
      }
      ctx.restore()

      // Nucleus
      const pulse = 1 + 0.06*Math.sin(t*0.04)
      const nBase = 18*pulse
      ctx.save()
      const halo = ctx.createRadialGradient(cx,cy,nBase*0.6,cx,cy,nBase*6)
      halo.addColorStop(0,"rgba(77,184,255,0.12)"); halo.addColorStop(0.4,"rgba(77,184,255,0.04)"); halo.addColorStop(1,"rgba(0,0,0,0)")
      ctx.beginPath(); ctx.arc(cx,cy,nBase*6,0,Math.PI*2); ctx.fillStyle=halo; ctx.fill()
      ctx.shadowBlur=60; ctx.shadowColor="#4db8ff"
      const mid = ctx.createRadialGradient(cx,cy,0,cx,cy,nBase*3.5)
      mid.addColorStop(0,"rgba(160,220,255,0.35)"); mid.addColorStop(0.5,"rgba(77,184,255,0.15)"); mid.addColorStop(1,"rgba(0,0,0,0)")
      ctx.beginPath(); ctx.arc(cx,cy,nBase*3.5,0,Math.PI*2); ctx.fillStyle=mid; ctx.fill()
      ctx.shadowBlur=30; ctx.shadowColor="#ffffff"
      const inner = ctx.createRadialGradient(cx,cy,0,cx,cy,nBase)
      inner.addColorStop(0,"rgba(255,255,255,1)"); inner.addColorStop(0.3,"rgba(220,240,255,0.95)"); inner.addColorStop(0.7,"rgba(100,190,255,0.6)"); inner.addColorStop(1,"rgba(77,184,255,0)")
      ctx.beginPath(); ctx.arc(cx,cy,nBase,0,Math.PI*2); ctx.fillStyle=inner; ctx.fill()
      ctx.shadowBlur=20; ctx.shadowColor="#ffffff"
      const hot = ctx.createRadialGradient(cx,cy,0,cx,cy,nBase*0.45)
      hot.addColorStop(0,"rgba(255,255,255,1)"); hot.addColorStop(1,"rgba(255,255,255,0)")
      ctx.beginPath(); ctx.arc(cx,cy,nBase*0.45,0,Math.PI*2); ctx.fillStyle=hot; ctx.fill()
      ctx.restore()

      // Electrons
      for (const o of orbits) {
        o.angle += o.speed
        const lx = o.rx*Math.cos(o.angle), ly = o.ry*Math.sin(o.angle)
        const ex = cx + lx*Math.cos(o.tilt) - ly*Math.sin(o.tilt)
        const ey = cy + lx*Math.sin(o.tilt) + ly*Math.cos(o.tilt)
        o.trail.unshift({ x:ex, y:ey })
        if (o.trail.length > TRAIL) o.trail.pop()
        for (let i=1; i<o.trail.length; i++) {
          const frac=1-i/TRAIL, a=frac*frac*0.6, r=3.5*frac
          ctx.beginPath(); ctx.arc(o.trail[i].x,o.trail[i].y,r,0,Math.PI*2)
          ctx.fillStyle=`${o.color}${Math.round(a*255).toString(16).padStart(2,"0")}`; ctx.fill()
        }
        ctx.save(); ctx.shadowBlur=22; ctx.shadowColor=o.color
        const eg=ctx.createRadialGradient(ex,ey,0,ex,ey,9)
        eg.addColorStop(0,`${o.color}cc`); eg.addColorStop(0.5,`${o.color}55`); eg.addColorStop(1,`${o.color}00`)
        ctx.beginPath(); ctx.arc(ex,ey,9,0,Math.PI*2); ctx.fillStyle=eg; ctx.fill()
        ctx.beginPath(); ctx.arc(ex,ey,3.5,0,Math.PI*2); ctx.fillStyle="#ffffff"; ctx.fill()
        ctx.restore()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId); ro.disconnect()
      canvas.removeEventListener("mousemove", onMove)
      canvas.removeEventListener("mouseleave", onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position:"absolute", inset:0, width:"100%", height:"100%", zIndex:1, pointerEvents:"all" }}
    />
  )
}
