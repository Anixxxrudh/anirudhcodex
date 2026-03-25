"use client"

import { useState, useEffect, useRef } from "react"
import BackgroundCanvas from "../components/BackgroundCanvas"
import Navbar from "../components/Navbar"
import LoadingScreen from "../components/LoadingScreen"
import Timeline from "../components/Timeline"
import NowSection from "../components/NowSection"
import SkillsSection from "../components/SkillsSection"
import EasterEgg from "../components/EasterEgg"

export default function Page() {
  const [loaded, setLoaded] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mode, setMode] = useState("home")

  const homeRef     = useRef<HTMLElement>(null)
  const aboutRef    = useRef<HTMLElement>(null)
  const projectsRef = useRef<HTMLElement>(null)
  const physicsRef  = useRef<HTMLElement>(null)
  const musicRef    = useRef<HTMLElement>(null)
  const climbingRef = useRef<HTMLElement>(null)
  const contactRef  = useRef<HTMLElement>(null)

  // ─── SCROLL HINT FADE ─────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => { if (window.scrollY > 60) setScrolled(true) }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // ─── SCROLL → MODE DETECTION ──────────────────────────────────────
  useEffect(() => {
    const sections = [
      { ref: homeRef,     mode: "home"     },
      { ref: aboutRef,    mode: "about"    },
      { ref: projectsRef, mode: "projects" },
      { ref: physicsRef,  mode: "physics"  },
      { ref: musicRef,    mode: "music"    },
      { ref: climbingRef, mode: "climbing" },
      { ref: contactRef,  mode: "contact"  },
    ]

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const found = sections.find((s) => s.ref.current === entry.target)
            if (found) setMode(found.mode)
          }
        })
      },
      { threshold: 0.35 }
    )

    sections.forEach((s) => { if (s.ref.current) observer.observe(s.ref.current) })
    return () => observer.disconnect()
  }, [])

  // ─── ATOM CURSOR ──────────────────────────────────────────────────
  useEffect(() => {
    const nucleus = document.getElementById("cursor-nucleus")
    const orbit   = document.getElementById("cursor-orbit")
    const electron = document.getElementById("cursor-electron")
    if (!nucleus || !orbit || !electron) return

    let orbitX = 0, orbitY = 0
    let curX = 0, curY = 0
    let angle = 0
    let animId: number = 0
    let isHovered = false

    const onMove = (e: MouseEvent) => {
      curX = e.clientX
      curY = e.clientY
      nucleus.style.left = curX + "px"
      nucleus.style.top  = curY + "px"
    }

    const onEnter = () => { isHovered = true }
    const onLeave = () => { isHovered = false }

    const interactables = document.querySelectorAll("button, a, .project-card, .contact-link, .resume-btn, .navbar-brand")
    interactables.forEach((el) => {
      el.addEventListener("mouseenter", onEnter)
      el.addEventListener("mouseleave", onLeave)
    })

    const loop = () => {
      // Orbit lags behind cursor
      orbitX += (curX - orbitX) * 0.1
      orbitY += (curY - orbitY) * 0.1

      // Electron orbits continuously, faster on hover
      angle += isHovered ? 0.08 : 0.04
      const radius = isHovered ? 20 : 14
      const eX = orbitX + Math.cos(angle) * radius
      const eY = orbitY + Math.sin(angle) * (radius * 0.45)

      orbit.style.left   = orbitX + "px"
      orbit.style.top    = orbitY + "px"
      orbit.style.width  = `${radius * 2}px`
      orbit.style.height = `${radius * 0.9}px`
      orbit.style.borderColor = isHovered
        ? "rgba(77,184,255,0.8)"
        : "rgba(77,184,255,0.45)"

      electron.style.left = eX + "px"
      electron.style.top  = eY + "px"
      electron.style.boxShadow = isHovered
        ? "0 0 8px rgba(77,184,255,1)"
        : "0 0 5px rgba(77,184,255,0.8)"

      animId = requestAnimationFrame(loop)
    }

    window.addEventListener("mousemove", onMove)
    loop()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("mousemove", onMove)
      interactables.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter)
        el.removeEventListener("mouseleave", onLeave)
      })
    }
  }, [])

  // ─── SCROLL TO ────────────────────────────────────────────────────
  const scrollToSection = (section: string) => {
    const map = {
      home:     homeRef,
      about:    aboutRef,
      projects: projectsRef,
      physics:  physicsRef,
      music:    musicRef,
      climbing: climbingRef,
      contact:  contactRef,
    } as Record<string, React.RefObject<HTMLElement | null>>
    map[section]?.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <>
      {/* Loading screen */}
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      {/* Easter egg */}
      <EasterEgg />

      {/* Atom cursor */}
      <div id="cursor-nucleus" />
      <div id="cursor-orbit"   />
      <div id="cursor-electron" />

      {/* Background */}
      <BackgroundCanvas mode={mode} />

      {/* Navbar */}
      <Navbar setMode={setMode} mode={mode} scrollToSection={scrollToSection} />

      <main>

        {/* ── HOME ──────────────────────────────────────────────────── */}
        <section ref={homeRef} className="home-section">
          <h1 className="home-name">THE ANIRUDH PROTOCOL</h1>
          <p className="home-tagline">
            Astrophysics&nbsp;&nbsp;·&nbsp;&nbsp;Photovoltaics&nbsp;&nbsp;·&nbsp;&nbsp;Climbing&nbsp;&nbsp;·&nbsp;&nbsp;Music
          </p>

          {/* Star Wars crawl */}
          <div className="crawl-wrapper">
            <div className={`crawl-inner${loaded ? "" : " crawl-paused"}`}>
              <p>
                From solar cells to distant galaxies,
                from sound waves to mountain walls —
              </p>
              <p>
                this is where science, creativity,
                and motion converge.
              </p>
              <p>
                This is The Anirudh Protocol.
              </p>
            </div>
          </div>

          <span className="home-scroll-hint" style={{ opacity: scrolled ? 0 : undefined }}>scroll to explore</span>
        </section>

        {/* ── ABOUT ─────────────────────────────────────────────────── */}
        <section ref={aboutRef} className="about-section">
          <div className="about-grid">
            <div className="about-left">
              <div className="about-stat">
                <div className="about-stat-label">Institution</div>
                <div className="about-stat-value">University of Toledo</div>
              </div>
              <div className="about-stat">
                <div className="about-stat-label">Major</div>
                <div className="about-stat-value">Physics — Astrophysics Track</div>
              </div>
              <div className="about-stat">
                <div className="about-stat-label">Minor</div>
                <div className="about-stat-value">Data Science</div>
              </div>
              <div className="about-stat">
                <div className="about-stat-label">Research Lab</div>
                <div className="about-stat-value">Wright Center for Photovoltaics (PVIC)</div>
              </div>
              <div className="about-stat">
                <div className="about-stat-label">Leadership</div>
                <div className="about-stat-value">President, Wilderness Exploration Club</div>
              </div>
            </div>

            <div className="about-right">
              <div className="section-eyebrow">About</div>
              <h2 className="section-title">Physicist.<br />Researcher.<br />Builder.</h2>
              <p className="about-lead">
                Sophomore at the University of Toledo, majoring in Physics with
                an astrophysics focus and a minor in Data Science. I research
                thin-film solar cells at PVIC and lead the Wilderness Exploration Club.
              </p>
              <p className="about-body">
                My work sits at the intersection of fundamental physics and applied engineering.
                At PVIC, I focus on improving CdTe/CdSeTe solar device efficiency through interface
                engineering — using single-walled carbon nanotube networks and ALD-deposited
                aluminum oxide to reduce back-interface recombination. I work hands-on with device
                fabrication, sputtering, ALD, gold deposition, and characterization via JV and EQE
                measurements, with analysis pipelines in Python, JMP, and IGOR.
              </p>
              <p className="about-body">
                Outside the lab, I organize large-scale outdoor expeditions and contribute to
                events like RocketHacks. I believe the best work happens when curiosity, craft,
                and collaboration converge.
              </p>
              <div className="about-tags">
                {["Device Fabrication", "ALD", "Sputtering", "JV / EQE", "Python", "JMP", "IGOR", "Data Science", "CdTe/CdSeTe"].map((t) => (
                  <span className="tag" key={t}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PROJECTS ──────────────────────────────────────────────── */}
        <section ref={projectsRef} className="projects-section">
          <div className="projects-header">
            <div className="section-eyebrow">Projects</div>
            <h2 className="section-title">Selected Work</h2>
          </div>

          <div className="projects-grid">
            <div className="project-card">
              <span className="project-index">01</span>
              <h3 className="project-title">CdTe Solar Cell Interface Optimization</h3>
              <p className="project-desc">
                Investigating back-interface recombination in CdTe/CdSeTe photovoltaic
                devices using SWCNT networks and ALD-deposited Al₂O₃ interlayers.
                Full fabrication and characterization pipeline handled in-house at PVIC.
              </p>
              <div className="project-footer">
                <span className="project-role">Researcher — Fabrication, Characterization, Analysis</span>
                <span className="project-impact">Advancing interface engineering for next-generation thin-film solar efficiency</span>
              </div>
            </div>

            <div className="project-card">
              <span className="project-index">02</span>
              <h3 className="project-title">RocketHacks — Event Logistics System</h3>
              <p className="project-desc">
                End-to-end logistics design and execution for a 24-hour university
                hackathon. Coordinated participant flow, scheduling, sponsor engagement,
                and real-time operations across a large, multi-track event.
              </p>
              <div className="project-footer">
                <span className="project-role">Event Logistics Lead</span>
                <span className="project-impact">Seamless experience delivered across hundreds of participants</span>
              </div>
            </div>

            <div className="project-card">
              <span className="project-index">03</span>
              <h3 className="project-title">Cinematic Portfolio Website</h3>
              <p className="project-desc">
                A visually immersive personal portfolio featuring animated star-field
                backgrounds, scroll-driven section transitions, Star Wars perspective
                crawl, and a dynamic canvas that responds to each section's identity.
              </p>
              <div className="project-footer">
                <span className="project-role">Creator / Designer — AI-assisted development</span>
                <span className="project-impact">Personal brand expressed through design, motion, and technology</span>
              </div>
            </div>

            <div className="project-card">
              <span className="project-index">04</span>
              <h3 className="project-title">Photovoltaics Research Portfolio</h3>
              <p className="project-desc">
                A deeper look into my work at the Wright Center for Photovoltaics,
                including device fabrication, JV and EQE characterization, and interface
                engineering techniques using carbon nanotubes and ALD-deposited aluminum oxide.
              </p>
              <div className="project-footer">
                <span className="project-role">Researcher — PVIC, University of Toledo</span>
                <span className="project-impact">Hands-on experience in advanced solar cell research and performance optimization</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── PHYSICS ───────────────────────────────────────────────── */}
        <section ref={physicsRef} style={{ minHeight: "100vh", paddingTop: "100px", paddingBottom: "80px" }}>
          <div className="placeholder-section mode-physics">
            <div className="section-eyebrow">Physics / Space</div>
            <h2 className="section-title">The Universe,<br />Engineered.</h2>
            <div className="placeholder-grid">
              {[
                { label: "Research Focus", title: "Solar Photovoltaics", body: "At PVIC, I work on improving the efficiency of CdTe/CdSeTe thin-film solar cells through back-interface engineering. The work involves fabricating devices, running JV and EQE characterization, and analyzing how carbon nanotube networks and ALD-deposited aluminum oxide affect carrier recombination. Physics applied to a problem that matters." },
                { label: "Interest Area",  title: "Cosmology & the Early Universe", body: "The questions that pull me most are the large-scale ones — what triggered the Big Bang, what dark matter actually is, and how dark energy is driving the accelerating expansion of the universe. These are not just abstract puzzles. They define the structure of everything that exists." },
                { label: "Lab Visuals — Coming Soon", title: "Research Images & Data", body: "Lab photographs, device characterization plots, and JV/EQE data visualizations from PVIC research will be displayed here." },
              ].map((c) => (
                <div className="placeholder-card" key={c.title}>
                  <span className="placeholder-card-label">{c.label}</span>
                  <h3 className="placeholder-card-title">{c.title}</h3>
                  <p className="placeholder-card-body">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MUSIC ─────────────────────────────────────────────────── */}
        <section ref={musicRef} style={{ minHeight: "100vh", paddingTop: "100px", paddingBottom: "80px" }}>
          <div className="placeholder-section mode-music">
            <div className="section-eyebrow">Music / DJ</div>
            <h2 className="section-title">Sound as<br />a System.</h2>
            <div className="placeholder-grid">
              {[
                { label: "Genre", title: "House, Techno, Ambient", body: "I mix electronic music that leans atmospheric — deep house, minimal techno, and ambient textures that build space rather than just energy. The goal is always immersion over impact." },
                { label: "Practice", title: "Set Building", body: "DJing is how I think about flow and structure outside the lab. A good set moves like a narrative — tension, release, texture, resolution. I build sets that feel like a journey from start to finish, not just a playlist." },
                { label: "Mixes — Coming Soon", title: "SoundCloud / Stream", body: "Recorded sets and mixes will be embedded here via SoundCloud. Reach out directly if you want to hear something sooner." },
              ].map((c) => (
                <div className="placeholder-card" key={c.title}>
                  <span className="placeholder-card-label">{c.label}</span>
                  <h3 className="placeholder-card-title">{c.title}</h3>
                  <p className="placeholder-card-body">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CLIMBING ──────────────────────────────────────────────── */}
        <section ref={climbingRef} style={{ minHeight: "100vh", paddingTop: "100px", paddingBottom: "80px" }}>
          <div className="placeholder-section mode-climbing">
            <div className="section-eyebrow">Climbing / Outdoors</div>
            <h2 className="section-title">Problems on<br />Rock.</h2>
            <div className="placeholder-grid">
              {[
                { label: "Discipline", title: "Intermediate Climbing", body: "Mostly indoor right now, working toward more outdoor routes. Climbing, for me, is a mental discipline as much as a physical one — reading a problem, committing to a sequence, staying precise under pressure. The same qualities that make a good researcher." },
                { label: "Leadership", title: "Wilderness Exploration Club", body: "As President, I plan and execute day hikes, climbing sessions, and multi-day wilderness trips for the club. Logistics, safety, and keeping people moving — it is a different kind of systems problem, but a real one." },
                { label: "Gallery — Coming Soon", title: "Trip Photos & Routes", body: "Photos, trip logs, and route documentation from club expeditions will be added here. Check back after the next trip." },
              ].map((c) => (
                <div className="placeholder-card" key={c.title}>
                  <span className="placeholder-card-label">{c.label}</span>
                  <h3 className="placeholder-card-title">{c.title}</h3>
                  <p className="placeholder-card-body">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TIMELINE ──────────────────────────────────────────────── */}
        <Timeline />

        {/* ── NOW ───────────────────────────────────────────────────── */}
        <NowSection />

        {/* ── SKILLS ────────────────────────────────────────────────── */}
        <SkillsSection />

        {/* ── CONTACT ───────────────────────────────────────────────── */}
        <section ref={contactRef} className="contact-section">
          <div className="section-eyebrow">Contact</div>
          <h2 className="section-title" style={{ textAlign: "center" }}>Let's Connect</h2>
          <p className="contact-sub">
            Open to research collaborations, internships, and conversations
            about physics, renewable energy, and technology.
          </p>

          <div className="contact-links">
            <a href="mailto:akunnat3@rockets.utoledo.edu" className="contact-link">
              <span className="contact-link-label">University Email</span>
              <span className="contact-link-value">akunnat3@rockets.utoledo.edu</span>
            </a>
            <a href="mailto:anirudhmenon2k10@gmail.com" className="contact-link contact-link--secondary">
              <span className="contact-link-label">Personal</span>
              <span className="contact-link-value">anirudhmenon2k10@gmail.com</span>
            </a>
            <a href="https://www.linkedin.com/in/anirudh-menon-kunnath-pathayapura-247b07246/" target="_blank" rel="noreferrer" className="contact-link">
              <span className="contact-link-label">LinkedIn</span>
              <span className="contact-link-value">Anirudh Menon Kunnath</span>
            </a>
            <a href="https://github.com/Anixxxrudh" target="_blank" rel="noreferrer" className="contact-link">
              <span className="contact-link-label">GitHub</span>
              <span className="contact-link-value">github.com/Anixxxrudh</span>
            </a>
          </div>

          {/* Social row */}
          <div className="social-row">
            <a href="https://instagram.com/anixxrudh" target="_blank" rel="noreferrer" className="social-link">
              <span className="social-label">Instagram</span>
              <span className="social-handle">@anixxrudh</span>
            </a>
            <a href="https://instagram.com/theLostplankton" target="_blank" rel="noreferrer" className="social-link">
              <span className="social-label">Art</span>
              <span className="social-handle">@theLostplankton</span>
            </a>
            <a href="https://instagram.com/_chu.climbs" target="_blank" rel="noreferrer" className="social-link">
              <span className="social-label">Climbing</span>
              <span className="social-handle">@_chu.climbs</span>
            </a>
            <a href="https://music.apple.com/us/playlist/my-axiom/pl.u-8aAVoV6HvRXxB1z" target="_blank" rel="noreferrer" className="social-link social-link--music">
              <span className="social-label">Apple Music</span>
              <span className="social-handle">My Axiom — Playlist</span>
            </a>
          </div>

          <div className="resume-block">
            <p className="resume-line">
              My resume covers research experience, technical skills, and leadership roles.
              Download a copy or reach out directly for more.
            </p>
            <a href="/resume.pdf" download className="resume-btn">
              Download Resume
            </a>
          </div>
        </section>

      </main>
    </>
  )
}