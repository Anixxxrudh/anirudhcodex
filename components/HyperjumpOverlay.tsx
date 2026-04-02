'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// ─── Constants ───────────────────────────────────────────────────────────────

const TOTAL_MS = 1100;
const ROUTER_PUSH_MS = 800;
const SEED = 0x4db8ff42;

// ─── Mulberry32 PRNG ─────────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

// ─── Web Audio synthesis ─────────────────────────────────────────────────────

function playHyperjumpSound(): void {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const comp = ctx.createDynamicsCompressor();
    comp.connect(ctx.destination);

    // Low rumble: sawtooth 40 → 80 Hz over 600 ms
    const rumble = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumble.type = 'sawtooth';
    rumble.frequency.setValueAtTime(40, now);
    rumble.frequency.linearRampToValueAtTime(80, now + 0.6);
    rumbleGain.gain.setValueAtTime(0.08, now);
    rumble.connect(rumbleGain);
    rumbleGain.connect(comp);
    rumble.start(now);
    rumble.stop(now + 1.0);

    // High whine: sine 200 → 2400 Hz over 900 ms
    const whine = ctx.createOscillator();
    const whineGain = ctx.createGain();
    whine.type = 'sine';
    whine.frequency.setValueAtTime(200, now);
    whine.frequency.linearRampToValueAtTime(2400, now + 0.9);
    whineGain.gain.setValueAtTime(0.04, now);
    whine.connect(whineGain);
    whineGain.connect(comp);
    whine.start(now);
    whine.stop(now + 1.0);

    // White noise burst: 0 → 0.06 over 200 ms → 0 over 400 ms
    const sr = ctx.sampleRate;
    const buf = ctx.createBuffer(1, sr, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < sr; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.06, now + 0.2);
    noiseGain.gain.linearRampToValueAtTime(0, now + 0.6);
    noise.connect(noiseGain);
    noiseGain.connect(comp);
    noise.start(now);
    noise.stop(now + 1.0);

    setTimeout(() => { try { ctx.close(); } catch { /* ignore */ } }, 1500);
  } catch { /* Web Audio blocked — silent fallback */ }
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Star {
  angle: number;
  dist: number;
  prevDist: number;
  speed: number;
  r: number;
  g: number;
  b: number;
}

interface ExpressLane {
  angle: number;
  width: number;
}

interface Dims {
  W: number;
  H: number;
  cx: number;
  cy: number;
  halfDiag: number;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface HyperjumpOverlayProps {
  active: boolean;
  targetHref: string;
  onComplete: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function HyperjumpOverlay({ active, targetHref, onComplete }: HyperjumpOverlayProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const routerFiredRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── Dimension setup via ResizeObserver (set once, not per-frame) ──────────
    function applyDims() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    applyDims();
    const ro = new ResizeObserver(applyDims);
    ro.observe(canvas);

    // ── Detect mobile ─────────────────────────────────────────────────────────
    const isMobile = window.innerWidth < 640;
    const starCount = isMobile ? 120 : 200;

    // ── PRNG initialised once per trigger ─────────────────────────────────────
    const rng = mulberry32(SEED);

    // ── Allocate star array once ──────────────────────────────────────────────
    const stars: Star[] = Array.from({ length: starCount }, () => {
      const roll = rng();
      const angle = rng() * Math.PI * 2;
      const dist = 0.04 + rng() * 0.08;   // 0.04 – 0.12
      const speed = 0.8 + rng() * 1.4;    // 0.8 – 2.2
      let r: number, g: number, b: number;
      if (roll < 0.15)      { r = 77;  g = 184; b = 255; } // #4db8ff  15%
      else if (roll < 0.23) { r = 201; g = 168; b = 76;  } // #C9A84C   8%
      else                  { r = 255; g = 255; b = 255; } // #ffffff  77%
      return { angle, dist, prevDist: dist, speed, r, g, b };
    });

    // ── Express lanes (desktop only) ──────────────────────────────────────────
    const express: ExpressLane[] = isMobile
      ? []
      : Array.from({ length: 12 }, () => ({
          angle: rng() * Math.PI * 2,
          width: 2.5 + rng() * 1.5,   // 2.5 – 4 px
        }));

    routerFiredRef.current = false;
    playHyperjumpSound();

    const startTime = performance.now();
    let lastTime = startTime;

    // ── RAF loop ──────────────────────────────────────────────────────────────
    function loop(now: number): void {
      const elapsed = now - startTime;
      const dt = now - lastTime;
      lastTime = now;

      // Fire router push exactly once at 800 ms
      if (elapsed >= ROUTER_PUSH_MS && !routerFiredRef.current) {
        routerFiredRef.current = true;
        router.push(targetHref);
      }

      drawFrame(ctx!, elapsed, dt, stars, express, isMobile, rng);

      if (elapsed >= TOTAL_MS) {
        // Draw final full-white frame before handing off to Framer Motion fade
        ctx!.fillStyle = 'rgb(255,255,255)';
        ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
        onCompleteRef.current();
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, targetHref]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="hyperjump-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.05 } }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            pointerEvents: 'all',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Frame renderer (extracted to keep the effect clean) ─────────────────────

function drawFrame(
  ctx: CanvasRenderingContext2D,
  elapsed: number,
  dt: number,
  stars: Star[],
  express: ExpressLane[],
  isMobile: boolean,
  rng: () => number,
): void {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const cx = W * 0.5;
  const cy = H * 0.5;
  const halfDiag = Math.sqrt(W * W + H * H) * 0.5;

  const t = Math.min(elapsed / TOTAL_MS, 1.0);
  const dtNorm = dt / 16.667; // normalise to 60 fps

  // ── Acceleration scalar (0–1 during phase 1, held at 1 thereafter) ─────────
  const accel = t < 0.3 ? t / 0.3 : 1.0;

  // ── Background ────────────────────────────────────────────────────────────
  if (t < 0.88) {
    // Interpolate from #000005 → #00000d across phase 1
    const blue = t < 0.3 ? Math.round(5 + (t / 0.3) * 8) : 13;
    ctx.fillStyle = `rgb(0,0,${blue})`;
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = '#00000d';
    ctx.fillRect(0, 0, W, H);
  }

  // ── Update + draw stars ───────────────────────────────────────────────────
  const lineBase = 0.6 + accel * 1.8;
  ctx.lineWidth = Math.max(0.5, lineBase);

  for (const star of stars) {
    star.prevDist = star.dist;
    star.dist += star.speed * accel * accel * 0.028 * dtNorm;

    // Wrap stars that exit the canvas (phase 2+ only — in phase 1 they haven't
    // reached the edge yet, but guard anyway)
    if (star.dist > 1.0) {
      star.angle = rng() * Math.PI * 2;
      star.dist = 0.02;
      star.prevDist = 0.02;
    }

    const cosA = Math.cos(star.angle);
    const sinA = Math.sin(star.angle);
    const px = cx + star.dist * cosA * halfDiag;
    const py = cy + star.dist * sinA * halfDiag;
    const ppx = cx + star.prevDist * cosA * halfDiag;
    const ppy = cy + star.prevDist * sinA * halfDiag;

    // Too short to be visible — render as a dot instead
    const dx = px - ppx;
    const dy = py - ppy;
    if (dx * dx + dy * dy < 0.25) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${star.r},${star.g},${star.b},1)`;
      ctx.arc(px, py, 0.8, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    // Blue-shift faster stars during warp phases
    let r = star.r, g = star.g, b = star.b;
    if (t >= 0.3) {
      const shift = Math.min(1, (star.speed - 0.8) / 1.4);
      r = Math.round(r + (200 - r) * shift * 0.15);
      g = Math.round(g + (220 - g) * shift * 0.10);
      b = Math.min(255, b + Math.round(shift * 20));
    }

    const grad = ctx.createLinearGradient(ppx, ppy, px, py);
    grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},1)`);
    ctx.beginPath();
    ctx.strokeStyle = grad;
    ctx.lineWidth = Math.max(0.5, lineBase);
    ctx.moveTo(ppx, ppy);
    ctx.lineTo(px, py);
    ctx.stroke();
  }

  // ── Phase 2 extras (30 – 88%) ─────────────────────────────────────────────
  if (t >= 0.3 && t < 0.88) {
    // Subtle blue radial vignette at centre
    const vigR = Math.max(W, H) * 0.45;
    const vig = ctx.createRadialGradient(cx, cy, 0, cx, cy, vigR);
    vig.addColorStop(0, 'rgba(0,20,60,0.3)');
    vig.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    // Express-lane hero streaks (desktop only)
    if (!isMobile && express.length > 0) {
      const startD = 0.04;
      const endD   = 0.95;
      for (const lane of express) {
        const cosA = Math.cos(lane.angle);
        const sinA = Math.sin(lane.angle);
        const sx = cx + startD * cosA * halfDiag;
        const sy = cy + startD * sinA * halfDiag;
        const ex = cx + endD   * cosA * halfDiag;
        const ey = cy + endD   * sinA * halfDiag;

        // Chromatic aberration: red offset −2 px, blue +2 px, white centre
        const layers: [number, number, string][] = [
          [-2, 0, 'rgba(255,60,60,0.55)'],
          [ 2, 0, 'rgba(60,60,255,0.55)'],
          [ 0, 0, 'rgba(255,255,255,1.0)'],
        ];
        for (const [offX, offY, headColor] of layers) {
          const g2 = ctx.createLinearGradient(
            sx + offX, sy + offY,
            ex + offX, ey + offY,
          );
          g2.addColorStop(0, 'rgba(255,255,255,0)');
          g2.addColorStop(1, headColor);
          ctx.beginPath();
          ctx.strokeStyle = g2;
          ctx.lineWidth = lane.width;
          ctx.moveTo(sx + offX, sy + offY);
          ctx.lineTo(ex + offX, ey + offY);
          ctx.stroke();
        }
      }
    }
  }

  // ── Phase 3: radial flash (75 – 88%) ─────────────────────────────────────
  if (t >= 0.75 && t < 0.88) {
    const localT = (t - 0.75) / 0.13;
    const flashRadius = localT * Math.max(W, H) * 0.7;
    const flashAlpha  = Math.sin(localT * Math.PI) * 0.85;

    const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, flashRadius);
    flash.addColorStop(0, `rgba(220,240,255,${flashAlpha})`);
    flash.addColorStop(1, 'rgba(220,240,255,0)');
    ctx.fillStyle = flash;
    ctx.fillRect(0, 0, W, H);
  }

  // ── Phase 4: whiteout (88 – 100%) ────────────────────────────────────────
  if (t >= 0.88) {
    const localT = (t - 0.88) / 0.12;
    ctx.fillStyle = `rgba(255,255,255,${localT})`;
    ctx.fillRect(0, 0, W, H);
  }
}
