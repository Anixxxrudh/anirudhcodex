'use client'

import Navbar from '@/components/Navbar'
import CursorSystem from '@/components/CursorSystem'
import { useHyperjump } from '@/hooks/useHyperjump'

const COLLAB_ITEMS = [
  {
    icon: '⚛',
    accent: '#00e5ff',
    title: 'Research Partnerships',
    body: 'Photovoltaics, astrophysics, renewable energy, data analysis. Always interested in collaborating on meaningful problems.',
  },
  {
    icon: '◆',
    accent: '#4db8ff',
    title: 'Internship Opportunities',
    body: 'Actively seeking Summer 2026 and beyond. Physics, engineering, data science, tech — open to all directions.',
  },
  {
    icon: '◎',
    accent: '#7ed957',
    title: 'Hackathon Teams',
    body: 'Fast builder, systems thinker, comfortable under pressure. Let\'s make something in 24 hours.',
  },
  {
    icon: '△',
    accent: '#C9A84C',
    title: 'Outdoor Adventures',
    body: 'Climbing, hiking, wilderness trips. President of WEX — always looking for people who want to explore.',
  },
  {
    icon: '♫',
    accent: '#a064ff',
    title: 'Music Collabs',
    body: 'DJ sets, ambient production, anything atmospheric and interesting. Reach out if you make music.',
  },
  {
    icon: '✦',
    accent: '#f472b6',
    title: 'Creative Projects',
    body: 'Design, digital art, portfolio work, or anything that sits at the intersection of science and creativity.',
  },
]

export default function CollabPage() {
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
            Collaboration
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 900,
            letterSpacing: '0.04em',
            color: '#fff',
            marginBottom: 16,
          }}>
            Open To
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.45)',
            maxWidth: 480,
          }}>
            I work best at the edges — where physics meets code, research meets design, or science meets the outdoors.
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 24,
          marginBottom: 72,
        }}>
          {COLLAB_ITEMS.map((item) => (
            <div
              key={item.title}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 8,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                transition: 'border-color 0.25s ease, background 0.25s ease',
                cursor: 'none',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `${item.accent}44`
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'
              }}
            >
              <span style={{ fontSize: '1.6rem', lineHeight: 1, color: item.accent }}>
                {item.icon}
              </span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#fff',
              }}>
                {item.title}
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.84rem',
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.7,
              }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          textAlign: 'center',
          padding: '48px 0',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.6rem',
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            Get in touch
          </p>
          <a
            href="mailto:akunnat3@rockets.utoledo.edu"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.9rem',
              letterSpacing: '0.08em',
              color: '#4db8ff',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(77,184,255,0.3)',
              paddingBottom: 2,
              transition: 'color 0.2s ease, border-color 0.2s ease',
              cursor: 'none',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#fff'
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.5)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#4db8ff'
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(77,184,255,0.3)'
            }}
          >
            akunnat3@rockets.utoledo.edu
          </a>

          <div style={{ marginTop: 40 }}>
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
        </div>
      </main>
    </div>
  )
}
