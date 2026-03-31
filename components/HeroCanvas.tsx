"use client"
import { useEffect, useRef } from "react"

interface FieldStar { x: number; y: number; r: number; alpha: number; phase: number; speed: number; color: string }
interface ShootStar { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; alpha: number }
interface Particle  { x: number; y: number; homeX: number; homeY: number; vx: number; vy: number; r: number; alpha: number; blue: boolean }
interface Orbit     { rx: number; ry: number; tilt: number; speed: number; angle: number; color: string; trail: { x: number; y: number }[] }
interface PlasmaParticle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; r: number; hue: number }
interface Rocket {
  x: number; y: number
  angle: number; targetAngle: number
  speed: number; steerTimer: number
  trail: { x: number; y: number }[]
  plasma: PlasmaParticle[]
  exhaustPhase: number
}

function buildFieldStars(W: number, H: number, count: number): FieldStar[] {
  return Array.from({ length: count }, () => {
    const roll = Math.random()
    const color =
      roll < 0.06 ? "155,176,255"   // O/B: hot blue-white
    : roll < 0.18 ? "170,191,255"   // A: blue-white
    : roll < 0.36 ? "220,230,255"   // F: white
    : roll < 0.55 ? "255,244,234"   // G: yellow-white (solar)
    : roll < 0.73 ? "255,218,181"   // K: orange
    :               "255,190,140"   // M: reddish
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: 0.3 + Math.random() * 1.2,
      alpha: 0.08 + Math.random() * 0.32,
      phase: Math.random() * Math.PI * 2,
      speed: 0.004 + Math.random() * 0.012,
      color,
    }
  })
}

function buildRocket(W: number, H: number): Rocket {
  const angle = Math.random() * Math.PI * 2
  return {
    x: W * (0.2 + Math.random() * 0.6),
    y: H * (0.2 + Math.random() * 0.6),
    angle, targetAngle: angle,
    speed: 1.4 + Math.random() * 0.8,
    steerTimer: 0, trail: [], plasma: [],
    exhaustPhase: Math.random() * Math.PI * 2,
  }
}

function drawRocketBody(ctx: CanvasRenderingContext2D, r: Rocket, t: number): void {
  ctx.save()
  ctx.translate(r.x, r.y)
  ctx.rotate(r.angle + Math.PI / 2)

  // Engine bloom — ONE shadowBlur call, not in a loop
  const bloom = ctx.createRadialGradient(0, 14, 0, 0, 14, 18)
  bloom.addColorStop(0, `rgba(0,220,255,${0.5 + 0.15 * Math.sin(t * 0.18 + r.exhaustPhase)})`)
  bloom.addColorStop(0.5, "rgba(120,80,255,0.14)")
  bloom.addColorStop(1, "rgba(0,0,0,0)")
  ctx.shadowBlur = 20; ctx.shadowColor = "#00dcff"
  ctx.beginPath(); ctx.arc(0, 14, 18, 0, Math.PI * 2)
  ctx.fillStyle = bloom; ctx.fill()

  // Exhaust plume
  ctx.shadowBlur = 0
  const plumeLen = 18 + 6 * Math.sin(t * 0.22 + r.exhaustPhase)
  const pg = ctx.createLinearGradient(0, 14, 0, 14 + plumeLen)
  pg.addColorStop(0, "rgba(255,255,255,0.8)")
  pg.addColorStop(0.25, "rgba(0,220,255,0.55)")
  pg.addColorStop(0.65, "rgba(100,60,255,0.25)")
  pg.addColorStop(1, "rgba(0,0,0,0)")
  ctx.beginPath()
  ctx.moveTo(-4, 14)
  ctx.quadraticCurveTo(-7, 14 + plumeLen * 0.5, -1.2, 14 + plumeLen)
  ctx.lineTo(1.2, 14 + plumeLen)
  ctx.quadraticCurveTo(7, 14 + plumeLen * 0.5, 4, 14)
  ctx.closePath()
  ctx.fillStyle = pg; ctx.fill()

  // Body — no shadow in body path
  ctx.beginPath()
  ctx.moveTo(0, -18); ctx.lineTo(5, -6); ctx.lineTo(5.5, 8)
  ctx.lineTo(4, 14); ctx.lineTo(-4, 14); ctx.lineTo(-5.5, 8)
  ctx.lineTo(-5, -6); ctx.closePath()
  const bg = ctx.createLinearGradient(-6, -18, 6, 14)
  bg.addColorStop(0, "rgba(220,245,255,0.92)")
  bg.addColorStop(0.4, "rgba(100,190,255,0.8)")
  bg.addColorStop(1, "rgba(50,90,200,0.7)")
  ctx.fillStyle = bg; ctx.fill()
  ctx.strokeStyle = "rgba(0,220,255,0.6)"; ctx.lineWidth = 0.7; ctx.stroke()

  // Fins
  ctx.beginPath(); ctx.moveTo(-4.5, 8); ctx.lineTo(-11, 17); ctx.lineTo(-4, 14); ctx.closePath()
  ctx.fillStyle = "rgba(70,150,255,0.7)"; ctx.fill()
  ctx.beginPath(); ctx.moveTo(4.5, 8); ctx.lineTo(11, 17); ctx.lineTo(4, 14); ctx.closePath()
  ctx.fill()

  // Cockpit — one targeted shadow
  ctx.shadowBlur = 8; ctx.shadowColor = "#00ffff"
  const wg = ctx.createRadialGradient(-1.2, -8, 0, 0, -6, 4.5)
  wg.addColorStop(0, "rgba(200,255,255,1)")
  wg.addColorStop(0.5, "rgba(0,200,255,0.75)")
  wg.addColorStop(1, "rgba(0,50,180,0.45)")
  ctx.beginPath(); ctx.ellipse(0, -7, 3, 3.8, 0, 0, Math.PI * 2)
  ctx.fillStyle = wg; ctx.fill()

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
      fieldStars = buildFieldStars(W, H, 260)   // was 520
      rockets = [buildRocket(W, H), buildRocket(W, H)]
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const particles: Particle[] = Array.from({ length: 70 }, () => { // was 140
      const x = Math.random() * W, y = Math.random() * H
      return { x, y, homeX: x, homeY: y,
        vx: (Math.random()-0.5)*0.25, vy: (Math.random()-0.5)*0.25,
        r: Math.random()*1.5+1, alpha: Math.random()*0.4+0.1,
        blue: Math.random() > 0.45 }
    })

    const TRAIL = 18   // was 28
    const orbits: Orbit[] = [
      { rx:195, ry:72, tilt:0,          speed:0.007, angle:0,            color:"#4db8ff", trail:[] },
      { rx:195, ry:72, tilt:Math.PI/3,  speed:0.011, angle:Math.PI*2/3, color:"#00e5ff", trail:[] },
      { rx:195, ry:72, tilt:-Math.PI/3, speed:0.009, angle:Math.PI*4/3, color:"#80cfff", trail:[] },
    ]

    const nebulae = [
      { xF:0.15, yF:0.20, rF:0.32, c0:"rgba(30,80,160,0.055)",  c1:"rgba(0,0,0,0)" },
      { xF:0.82, yF:0.35, rF:0.28, c0:"rgba(20,60,130,0.04)",   c1:"rgba(0,0,0,0)" },
      { xF:0.50, yF:0.75, rF:0.38, c0:"rgba(40,100,200,0.045)", c1:"rgba(0,0,0,0)" },
    ]

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouseX = e.clientX - r.left; mouseY = e.clientY - r.top
    }
    const onLeave = () => { mouseX = -9999; mouseY = -9999 }
    canvas.addEventListener("mousemove", onMove)
    canvas.addEventListener("mouseleave", onLeave)

    const spawnShoot = () => {
      const life = 50 + Math.random() * 35
      const edge = Math.random() > 0.5
      const x = edge ? Math.random() * W : W * (0.7 + Math.random() * 0.3)
      const y = edge ? Math.random() * H * 0.4 : Math.random() * H * 0.3
      const speed = 4 + Math.random() * 5
      const angle = Math.PI * 0.2 + Math.random() * 0.35
      shoots.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
        life, maxLife: life, alpha: 0.85 + Math.random()*0.1 })
    }
    let shootTimer = 0

    const updateRockets = () => {
      for (const r of rockets) {
        r.exhaustPhase += 0.08
        r.steerTimer++
        if (r.steerTimer >= 100) {
          r.steerTimer = 0
          r.targetAngle = r.angle + (Math.random() - 0.5) * Math.PI * 1.1
        }
        const mx = W * 0.12, my = H * 0.12
        if (r.x < mx)     r.targetAngle = 0
        if (r.x > W - mx) r.targetAngle = Math.PI
        if (r.y < my)     r.targetAngle = Math.PI / 2
        if (r.y > H - my) r.targetAngle = -Math.PI / 2

        let da = r.targetAngle - r.angle
        while (da >  Math.PI) da -= Math.PI * 2
        while (da < -Math.PI) da += Math.PI * 2
        r.angle += da * 0.028

        r.x += Math.cos(r.angle) * r.speed
        r.y += Math.sin(r.angle) * r.speed

        r.trail.unshift({ x: r.x, y: r.y })
        if (r.trail.length > 40) r.trail.pop()   // was 60

        // emit 1 plasma particle per frame
        const ea = r.angle + Math.PI
        const a = ea + (Math.random() - 0.5) * 0.4
        const spd = 1.0 + Math.random() * 1.8
        const life = 14 + Math.random() * 10
        r.plasma.push({
          x: r.x + Math.cos(ea) * 9, y: r.y + Math.sin(ea) * 9,
          vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
          life, maxLife: life,
          r: 1.2 + Math.random() * 2, hue: 180 + Math.random() * 60,
        })

        for (let i = r.plasma.length - 1; i >= 0; i--) {
          const p = r.plasma[i]
          p.x += p.vx; p.y += p.vy; p.vx *= 0.94; p.vy *= 0.94; p.life--
          if (p.life <= 0) r.plasma.splice(i, 1)
        }
      }
    }

    const drawRockets = () => {
      ctx.shadowBlur = 0   // ensure off before loops

      for (const r of rockets) {
        // Ion trail — no shadowBlur
        for (let i = 1; i < r.trail.length; i++) {
          const frac = 1 - i / r.trail.length
          ctx.beginPath()
          ctx.moveTo(r.trail[i-1].x, r.trail[i-1].y)
          ctx.lineTo(r.trail[i].x,   r.trail[i].y)
          ctx.strokeStyle = `rgba(0,200,255,${frac * frac * 0.45})`
          ctx.lineWidth = frac * 2
          ctx.stroke()
        }

        // Plasma — no shadowBlur, simple arc fills
        for (const p of r.plasma) {
          const frac = p.life / p.maxLife
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r * frac, 0, Math.PI * 2)
          ctx.fillStyle = `hsla(${p.hue},100%,72%,${frac * frac * 0.85})`
          ctx.fill()
        }

        // Rocket body (has its own targeted shadowBlur inside)
        drawRocketBody(ctx, r, t)
        ctx.shadowBlur = 0   // reset after rocket draw
      }
    }

    const draw = () => {
      t++
      ctx.clearRect(0, 0, W, H)
      ctx.shadowBlur = 0   // always start clean

      // Nebula clouds
      for (const n of nebulae) {
        const nx = n.xF*W, ny = n.yF*H, nr = n.rF*W
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr)
        g.addColorStop(0, n.c0); g.addColorStop(1, n.c1)
        ctx.beginPath(); ctx.arc(nx, ny, nr, 0, Math.PI*2)
        ctx.fillStyle = g; ctx.fill()
      }

      // Starfield — realistic spectral colors + diffraction spikes on bright stars
      for (const s of fieldStars) {
        const a = s.alpha * (0.6 + 0.4 * Math.sin(s.phase + t * s.speed))
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2)
        ctx.fillStyle = `rgba(${s.color},${a})`; ctx.fill()
        // 4-point diffraction spike on larger/brighter stars
        if (s.r > 0.85 && a > 0.18) {
          const spikeLen = s.r * 5.5
          for (let sp = 0; sp < 4; sp++) {
            const sang = sp * Math.PI / 2
            const sg = ctx.createLinearGradient(s.x, s.y, s.x + Math.cos(sang)*spikeLen, s.y + Math.sin(sang)*spikeLen)
            sg.addColorStop(0, `rgba(${s.color},${a * 0.55})`)
            sg.addColorStop(1, `rgba(${s.color},0)`)
            ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + Math.cos(sang)*spikeLen, s.y + Math.sin(sang)*spikeLen)
            ctx.strokeStyle = sg; ctx.lineWidth = 0.5; ctx.stroke()
          }
        }
      }

      // Shooting stars — no shadowBlur in loop
      shootTimer++
      if (shootTimer >= 240) { shootTimer = 0; spawnShoot() }
      for (let i = shoots.length - 1; i >= 0; i--) {
        const s = shoots[i]
        const prog  = 1 - s.life / s.maxLife
        const alpha = s.alpha * Math.sin(prog * Math.PI)
        const len   = (s.vx**2 + s.vy**2)**0.5 * 4.5
        ctx.save()
        ctx.translate(s.x, s.y); ctx.rotate(Math.atan2(s.vy, s.vx))
        const g = ctx.createLinearGradient(-len, 0, 5, 0)
        g.addColorStop(0, "rgba(255,255,255,0)")
        g.addColorStop(0.6, `rgba(180,225,255,${alpha*0.55})`)
        g.addColorStop(1, `rgba(255,255,255,${alpha})`)
        ctx.beginPath(); ctx.moveTo(-len,-0.6); ctx.lineTo(5,0); ctx.lineTo(-len,0.6); ctx.closePath()
        ctx.fillStyle = g; ctx.fill()
        ctx.restore()
        s.x += s.vx; s.y += s.vy; s.life--
        if (s.life <= 0) shoots.splice(i, 1)
      }

      // Interactive particles — no shadowBlur
      for (const p of particles) {
        const dx = p.x-mouseX, dy = p.y-mouseY
        const dist = Math.sqrt(dx*dx+dy*dy)
        if (dist < 100 && dist > 0) {
          const f = (100-dist)/100
          p.vx += (dx/dist)*f*0.7; p.vy += (dy/dist)*f*0.7
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

      // Orbit ellipses — no shadowBlur on ellipse strokes
      ctx.save(); ctx.translate(cx, cy)
      for (const o of orbits) {
        ctx.save(); ctx.rotate(o.tilt)
        ctx.strokeStyle = `${o.color}18`; ctx.lineWidth = 4
        ctx.beginPath(); ctx.ellipse(0,0,o.rx+3,o.ry+3,0,0,Math.PI*2); ctx.stroke()
        ctx.strokeStyle=`${o.color}40`; ctx.lineWidth=1.2
        ctx.beginPath(); ctx.ellipse(0,0,o.rx,o.ry,0,0,Math.PI*2); ctx.stroke()
        ctx.restore()
      }
      ctx.restore()

      // Nucleus — shadowBlur only here (a handful of draws, not a loop)
      const pulse = 1 + 0.06*Math.sin(t*0.04)
      const nBase = 18*pulse
      ctx.save()
      const halo = ctx.createRadialGradient(cx,cy,nBase*0.6,cx,cy,nBase*6)
      halo.addColorStop(0,"rgba(77,184,255,0.10)"); halo.addColorStop(0.4,"rgba(77,184,255,0.03)"); halo.addColorStop(1,"rgba(0,0,0,0)")
      ctx.beginPath(); ctx.arc(cx,cy,nBase*6,0,Math.PI*2); ctx.fillStyle=halo; ctx.fill()
      ctx.shadowBlur=40; ctx.shadowColor="#4db8ff"
      const mid = ctx.createRadialGradient(cx,cy,0,cx,cy,nBase*3.5)
      mid.addColorStop(0,"rgba(160,220,255,0.30)"); mid.addColorStop(0.5,"rgba(77,184,255,0.12)"); mid.addColorStop(1,"rgba(0,0,0,0)")
      ctx.beginPath(); ctx.arc(cx,cy,nBase*3.5,0,Math.PI*2); ctx.fillStyle=mid; ctx.fill()
      ctx.shadowBlur=22; ctx.shadowColor="#ffffff"
      const inner = ctx.createRadialGradient(cx,cy,0,cx,cy,nBase)
      inner.addColorStop(0,"rgba(255,255,255,1)"); inner.addColorStop(0.3,"rgba(220,240,255,0.92)"); inner.addColorStop(0.7,"rgba(100,190,255,0.55)"); inner.addColorStop(1,"rgba(77,184,255,0)")
      ctx.beginPath(); ctx.arc(cx,cy,nBase,0,Math.PI*2); ctx.fillStyle=inner; ctx.fill()
      ctx.shadowBlur=14; ctx.shadowColor="#ffffff"
      const hot = ctx.createRadialGradient(cx,cy,0,cx,cy,nBase*0.45)
      hot.addColorStop(0,"rgba(255,255,255,1)"); hot.addColorStop(1,"rgba(255,255,255,0)")
      ctx.beginPath(); ctx.arc(cx,cy,nBase*0.45,0,Math.PI*2); ctx.fillStyle=hot; ctx.fill()
      ctx.restore()

      // Electrons — shadowBlur only on the electron head dot
      for (const o of orbits) {
        o.angle += o.speed
        const lx = o.rx*Math.cos(o.angle), ly = o.ry*Math.sin(o.angle)
        const ex = cx + lx*Math.cos(o.tilt) - ly*Math.sin(o.tilt)
        const ey = cy + lx*Math.sin(o.tilt) + ly*Math.cos(o.tilt)
        o.trail.unshift({ x:ex, y:ey })
        if (o.trail.length > TRAIL) o.trail.pop()
        // trail — no shadowBlur
        for (let i=1; i<o.trail.length; i++) {
          const frac=1-i/TRAIL, a=frac*frac*0.55, r=3*frac
          ctx.beginPath(); ctx.arc(o.trail[i].x,o.trail[i].y,r,0,Math.PI*2)
          ctx.fillStyle=`${o.color}${Math.round(a*255).toString(16).padStart(2,"0")}`; ctx.fill()
        }
        // electron head — single shadowBlur
        ctx.save(); ctx.shadowBlur=18; ctx.shadowColor=o.color
        const eg=ctx.createRadialGradient(ex,ey,0,ex,ey,8)
        eg.addColorStop(0,`${o.color}cc`); eg.addColorStop(0.5,`${o.color}44`); eg.addColorStop(1,`${o.color}00`)
        ctx.beginPath(); ctx.arc(ex,ey,8,0,Math.PI*2); ctx.fillStyle=eg; ctx.fill()
        ctx.beginPath(); ctx.arc(ex,ey,3,0,Math.PI*2); ctx.fillStyle="#ffffff"; ctx.fill()
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
