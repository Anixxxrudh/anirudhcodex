"use client"
import { useEffect, useRef } from "react"

// ── Types ──────────────────────────────────────────────────────────────
interface TextStar {
  x: number; y: number
  r: number
  baseAlpha: number
  phase: number; pSpeed: number
  bright: boolean
  colorIdx: number
}
interface FieldStar  { x: number; y: number; r: number; alpha: number; phase: number; speed: number }
interface ShootStar  { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; alpha: number }
interface Particle   { x: number; y: number; homeX: number; homeY: number; vx: number; vy: number; r: number; alpha: number; blue: boolean }
interface Orbit      { rx: number; ry: number; tilt: number; speed: number; angle: number; color: string; trail: { x: number; y: number }[] }

// ── Neon palette ───────────────────────────────────────────────────────
const STAR_COLORS = [
  "77,184,255",   // cold blue     60 %
  "110,215,255",  // lighter blue  20 %
  "180,235,255",  // near-white    12 %
  "255,255,255",  //  white         8 %
]
function pickColorIdx(): number {
  const r = Math.random()
  return r < 0.60 ? 0 : r < 0.80 ? 1 : r < 0.92 ? 2 : 3
}

// ── 4-point spike ──────────────────────────────────────────────────────
function drawSpike(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath()
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 4
    const d = i % 2 === 0 ? r : r * 0.20
    i === 0 ? ctx.moveTo(x + Math.cos(a)*d, y + Math.sin(a)*d)
            : ctx.lineTo(x + Math.cos(a)*d, y + Math.sin(a)*d)
  }
  ctx.closePath()
}

// ── Sample DIYA text pixels → star positions ───────────────────────────
function buildTextStars(W: number, H: number): TextStar[] {
  const oc   = document.createElement("canvas")
  oc.width   = W
  oc.height  = H
  const octx = oc.getContext("2d")!

  // Larger font — fills ~82 % of width
  const fontSize = Math.round(Math.min(W * 0.265, H * 0.32))
  octx.clearRect(0, 0, W, H)
  octx.fillStyle    = "#fff"
  octx.font         = `900 ${fontSize}px "Orbitron", sans-serif`
  octx.textAlign    = "center"
  octx.textBaseline = "middle"
  // Lower third so it doesn't sit under the hero text
  octx.fillText("DIYA", W / 2, H * 0.74)

  const { data } = octx.getImageData(0, 0, W, H)
  const stars: TextStar[] = []
  // Denser sampling → clearer letterforms
  const step = Math.max(3, Math.round(W / 220))

  for (let py = 0; py < H; py += step) {
    for (let px = 0; px < W; px += step) {
      if (data[(py * W + px) * 4 + 3] > 90) {
        const bright = Math.random() > 0.78
        stars.push({
          x:          px + (Math.random() - 0.5) * step * 0.6,
          y:          py + (Math.random() - 0.5) * step * 0.6,
          r:          bright ? 2.2 + Math.random() * 1.6 : 0.7 + Math.random() * 1.0,
          baseAlpha:  bright ? 0.82 + Math.random() * 0.18 : 0.38 + Math.random() * 0.42,
          phase:      Math.random() * Math.PI * 2,
          pSpeed:     0.005 + Math.random() * 0.020,
          bright,
          colorIdx:   pickColorIdx(),
        })
      }
    }
  }
  return stars
}

// ── Build ambient starfield ────────────────────────────────────────────
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

// ── Component ──────────────────────────────────────────────────────────
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
    let textStars:  TextStar[]  = []
    let fieldStars: FieldStar[] = []
    let shoots:     ShootStar[] = []

    const resize = () => {
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width  = W
      canvas.height = H
      cx = W / 2; cy = H / 2
      textStars  = buildTextStars(W, H)
      fieldStars = buildFieldStars(W, H, 520)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Interactive particles
    const COUNT = 140
    const particles: Particle[] = Array.from({ length: COUNT }, () => {
      const x = Math.random() * W, y = Math.random() * H
      return { x, y, homeX: x, homeY: y,
        vx: (Math.random()-0.5)*0.25, vy: (Math.random()-0.5)*0.25,
        r:  Math.random()*1.5+1, alpha: Math.random()*0.45+0.1,
        blue: Math.random() > 0.45 }
    })

    // Atom orbits
    const TRAIL = 28
    const orbits: Orbit[] = [
      { rx:195, ry:72, tilt:0,           speed:0.007, angle:0,             color:"#4db8ff", trail:[] },
      { rx:195, ry:72, tilt:Math.PI/3,   speed:0.011, angle:Math.PI*2/3,  color:"#00e5ff", trail:[] },
      { rx:195, ry:72, tilt:-Math.PI/3,  speed:0.009, angle:Math.PI*4/3,  color:"#80cfff", trail:[] },
    ]

    // Nebula blob definitions (positioned once at mount, not rebuild on resize)
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

    // ── Spawn a shooting star ──────────────────────────────────────────
    const spawnShoot = () => {
      const life = 55 + Math.random() * 40
      // Start along top or right edge
      const edge = Math.random() > 0.5
      const x = edge ? Math.random() * W : W * (0.7 + Math.random() * 0.3)
      const y = edge ? Math.random() * H * 0.4 : Math.random() * H * 0.3
      const speed = 4 + Math.random() * 6
      const angle = Math.PI * 0.2 + Math.random() * 0.35
      shoots.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
        life, maxLife: life, alpha: 0.9 + Math.random()*0.1 })
    }

    let shootTimer = 0
    const SHOOT_INTERVAL = 210 // frames between shooting stars

    // ── Main draw loop ─────────────────────────────────────────────────
    const draw = () => {
      t++
      ctx.clearRect(0, 0, W, H)

      // ── LAYER 0a: Nebula clouds ──────────────────────────────────────
      for (const n of nebulae) {
        const nx = n.xF * W, ny = n.yF * H, nr = n.rF * W
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr)
        g.addColorStop(0, n.c0); g.addColorStop(1, n.c1)
        ctx.beginPath(); ctx.arc(nx, ny, nr, 0, Math.PI*2)
        ctx.fillStyle = g; ctx.fill()
      }

      // ── LAYER 0b: Deep starfield ─────────────────────────────────────
      for (const s of fieldStars) {
        const a = s.alpha * (0.6 + 0.4 * Math.sin(s.phase + t * s.speed))
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2)
        ctx.fillStyle = `rgba(200,230,255,${a})`; ctx.fill()
      }

      // ── LAYER 0c: Shooting stars ─────────────────────────────────────
      shootTimer++
      if (shootTimer >= SHOOT_INTERVAL) { shootTimer = 0; spawnShoot() }

      for (let i = shoots.length - 1; i >= 0; i--) {
        const s = shoots[i]
        const prog  = 1 - s.life / s.maxLife
        const alpha = s.alpha * Math.sin(prog * Math.PI) // fade in + out
        const len   = (s.vx**2 + s.vy**2)**0.5 * 5

        ctx.save()
        ctx.translate(s.x, s.y)
        ctx.rotate(Math.atan2(s.vy, s.vx))
        const g = ctx.createLinearGradient(-len, 0, 6, 0)
        g.addColorStop(0, `rgba(255,255,255,0)`)
        g.addColorStop(0.6, `rgba(180,225,255,${alpha * 0.6})`)
        g.addColorStop(1,   `rgba(255,255,255,${alpha})`)
        ctx.beginPath()
        ctx.moveTo(-len, -0.7); ctx.lineTo(6, 0); ctx.lineTo(-len, 0.7)
        ctx.closePath()
        ctx.fillStyle = g; ctx.fill()

        // Bright head dot
        ctx.shadowBlur = 12; ctx.shadowColor = "rgba(180,230,255,0.9)"
        ctx.beginPath(); ctx.arc(6, 0, 1.8, 0, Math.PI*2)
        ctx.fillStyle = `rgba(255,255,255,${alpha})`; ctx.fill()
        ctx.restore()

        s.x += s.vx; s.y += s.vy; s.life--
        if (s.life <= 0) shoots.splice(i, 1)
      }

      // ── LAYER 1: DIYA text stars ─────────────────────────────────────
      const globalPulse = 0.82 + 0.18 * Math.sin(t * 0.007)

      // Broad glow behind letters
      const textCY = H * 0.74
      const bg = ctx.createRadialGradient(cx, textCY, 0, cx, textCY, W * 0.48)
      bg.addColorStop(0,   `rgba(40,110,220,${0.10 * globalPulse})`)
      bg.addColorStop(0.4, `rgba(20, 70,160,${0.05 * globalPulse})`)
      bg.addColorStop(1,   "rgba(0,0,0,0)")
      ctx.beginPath(); ctx.ellipse(cx, textCY, W*0.48, H*0.16, 0, 0, Math.PI*2)
      ctx.fillStyle = bg; ctx.fill()

      for (const s of textStars) {
        const twinkle = 0.50 + 0.50 * Math.sin(s.phase + t * s.pSpeed)
        const alpha   = Math.min(s.baseAlpha * globalPulse * twinkle, 1)
        const col     = STAR_COLORS[s.colorIdx]

        if (s.bright) {
          // Outer halo
          const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 6)
          halo.addColorStop(0,   `rgba(77,184,255,${alpha * 0.55})`)
          halo.addColorStop(0.4, `rgba(77,184,255,${alpha * 0.15})`)
          halo.addColorStop(1,   "rgba(0,0,0,0)")
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r*6, 0, Math.PI*2)
          ctx.fillStyle = halo; ctx.fill()
          // Spike
          ctx.save()
          ctx.shadowBlur  = 18
          ctx.shadowColor = "rgba(140,220,255,0.95)"
          drawSpike(ctx, s.x, s.y, s.r * 2.0)
          ctx.fillStyle = `rgba(230,248,255,${Math.min(alpha*1.3, 1)})`
          ctx.fill()
          ctx.restore()
        } else {
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2)
          ctx.fillStyle = `rgba(${col},${alpha})`; ctx.fill()
        }
      }

      // ── LAYER 2: Interactive particles ──────────────────────────────
      for (const p of particles) {
        const dx = p.x - mouseX, dy = p.y - mouseY
        const dist = Math.sqrt(dx*dx + dy*dy)
        if (dist < 110 && dist > 0) {
          const f = (110-dist)/110
          p.vx += (dx/dist)*f*0.8; p.vy += (dy/dist)*f*0.8
        }
        p.vx += (p.homeX - p.x)*0.03; p.vy += (p.homeY - p.y)*0.03
        p.vx *= 0.88; p.vy *= 0.88; p.x += p.vx; p.y += p.vy
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2)
        ctx.fillStyle = p.blue ? `rgba(77,184,255,${p.alpha})` : `rgba(255,255,255,${p.alpha})`
        ctx.fill()
      }

      // ── LAYER 3: Orbit ellipses ──────────────────────────────────────
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

      // ── LAYER 4: Nucleus ─────────────────────────────────────────────
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

      // ── LAYER 5: Electrons ───────────────────────────────────────────
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
