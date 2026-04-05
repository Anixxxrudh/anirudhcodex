'use client'

import Navbar from '@/components/Navbar'
import CursorSystem from '@/components/CursorSystem'
import { useHyperjump } from '@/hooks/useHyperjump'

const POSTS = [
  {
    title:   'How Carbon Nanotubes Improve Solar Cell Efficiency',
    date:    'March 2026',
    tag:     'Research',
    excerpt: 'A look at how SWCNT networks reduce back-interface recombination in CdTe devices — and what the data actually shows.',
  },
  {
    title:   'What Dark Energy Tells Us About the Universe\'s Fate',
    date:    'February 2026',
    tag:     'Astrophysics',
    excerpt: 'Exploring the implications of an accelerating universe and what it means for cosmology over the next 100 billion years.',
  },
  {
    title:   'Building This Portfolio: Design Decisions and Tech Stack',
    date:    'March 2026',
    tag:     'Design',
    excerpt: 'The thinking behind The Anirudh Protocol — from the warp background to the custom cursor system and hyperjump transitions.',
  },
  {
    title:   'CdTe Solar Cells: Where We Are and Where We\'re Going',
    date:    'April 2026',
    tag:     'Research',
    excerpt: 'An overview of cadmium telluride photovoltaics, current efficiency records, and the open questions driving lab work right now.',
  },
  {
    title:   'The Physics of Climbing',
    date:    'January 2026',
    tag:     'Physics',
    excerpt: 'Friction coefficients, center of mass, and why footwork matters more than grip strength. A physicist\'s take on the wall.',
  },
  {
    title:   'Sets as Narratives: On DJing and Structure',
    date:    'December 2025',
    tag:     'Music',
    excerpt: 'What deep house and ambient techno share with long-form writing — tension, release, texture, and the art of the transition.',
  },
]

const TAG: Record<string, { bg: string; border: string; color: string }> = {
  Research:    { bg: 'rgba(0,229,255,0.08)',    border: 'rgba(0,229,255,0.35)',    color: '#00e5ff' },
  Astrophysics:{ bg: 'rgba(160,100,255,0.08)',  border: 'rgba(160,100,255,0.35)',  color: '#a064ff' },
  Design:      { bg: 'rgba(126,217,87,0.08)',   border: 'rgba(126,217,87,0.35)',   color: '#7ed957' },
  Physics:     { bg: 'rgba(77,184,255,0.08)',   border: 'rgba(77,184,255,0.35)',   color: '#4db8ff' },
  Music:       { bg: 'rgba(201,168,76,0.08)',   border: 'rgba(201,168,76,0.35)',   color: '#C9A84C' },
}

export default function FieldNotesPage() {
  const jump = useHyperjump()

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      <CursorSystem />
      <Navbar mode="about" scrollToSection={() => {}} />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '120px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.6rem',
            letterSpacing: '0.3em',
            color: '#4db8ff',
            marginBottom: 16,
            textTransform: 'uppercase',
          }}>
            Blog / Research
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 900,
            letterSpacing: '0.04em',
            color: '#fff',
            marginBottom: 16,
          }}>
            Field Notes
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.45)',
            maxWidth: 480,
          }}>
            Observations from the lab, the telescope, and everything in between.
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 24,
        }}>
          {POSTS.map((p) => {
            const t = TAG[p.tag] ?? TAG.Research
            return (
              <article
                key={p.title}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 8,
                  padding: 28,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  transition: 'border-color 0.2s ease, background 0.2s ease',
                  cursor: 'none',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(77,184,255,0.25)'
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.5rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: 3,
                    background: t.bg,
                    border: `1px solid ${t.border}`,
                    color: t.color,
                  }}>
                    {p.tag}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.72rem',
                    color: 'rgba(255,255,255,0.3)',
                  }}>
                    {p.date}
                  </span>
                </div>

                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: '#fff',
                  lineHeight: 1.4,
                }}>
                  {p.title}
                </h2>

                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem',
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.7,
                  flexGrow: 1,
                }}>
                  {p.excerpt}
                </p>

                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.5rem',
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.2)',
                  textTransform: 'uppercase',
                  marginTop: 4,
                }}>
                  Coming soon
                </p>
              </article>
            )
          })}
        </div>

        {/* Back */}
        <div style={{ marginTop: 72, textAlign: 'center' }}>
          <button
            onClick={() => jump('/')}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.54rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
              background: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4,
              padding: '8px 20px',
              cursor: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = '#fff'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.3)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'
            }}
          >
            ← Return to Protocol
          </button>
        </div>
      </main>
    </div>
  )
}
