"use client"

import { useState, useEffect, useRef } from "react"
import BackgroundCanvas from "../components/BackgroundCanvas"
import Navbar from "../components/Navbar"
import LoadingScreen from "../components/LoadingScreen"
import Timeline from "../components/Timeline"
import NowSection from "../components/NowSection"
import SkillsSection from "../components/SkillsSection"
import EasterEgg from "../components/EasterEgg"
import HeroCanvas      from "../components/HeroCanvas"
import AtomCanvas      from "../components/AtomCanvas"
import SolarSystem     from "../components/SolarSystem"
import BlogSection     from "../components/BlogSection"
import ContactForm     from "../components/ContactForm"

const SECTIONS = [
  { key: "home",     label: "HOME",     mode: "home"     },
  { key: "about",    label: "ABOUT",    mode: "about"    },
  { key: "projects", label: "PROJECTS", mode: "projects" },
  { key: "physics",  label: "PHYSICS",  mode: "physics"  },
  { key: "music",    label: "MUSIC",    mode: "music"    },
  { key: "climbing", label: "CLIMBING", mode: "climbing" },
  { key: "timeline", label: "TIMELINE", mode: "home"     },
  { key: "now",      label: "NOW",      mode: "home"     },
  { key: "skills",   label: "SKILLS",   mode: "physics"  },
  { key: "blog",     label: "WRITING",  mode: "about"    },
  { key: "contact",  label: "CONTACT",  mode: "contact"  },
]

export default function Page() {
  const [loaded,          setLoaded]         = useState(false)
  const [scrolled,        setScrolled]       = useState(false)
  const [scrollProgress,  setScrollProgress] = useState(0)
  const [mode,            setMode]           = useState("home")
  const [activeSection,   setActiveSection]  = useState(0)

  const snapRef  = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  // Section refs
  const homeRef     = useRef<HTMLElement>(null)
  const aboutRef    = useRef<HTMLElement>(null)
  const projectsRef = useRef<HTMLElement>(null)
  const physicsRef  = useRef<HTMLElement>(null)
  const musicRef    = useRef<HTMLElement>(null)
  const climbingRef = useRef<HTMLElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const nowRef      = useRef<HTMLDivElement>(null)
  const skillsRef   = useRef<HTMLDivElement>(null)
  const blogRef     = useRef<HTMLDivElement>(null)
  const contactRef  = useRef<HTMLElement>(null)

  // ─── DERIVE MODE FROM ACTIVE SECTION ─────────────────────────────
  useEffect(() => {
    setMode(SECTIONS[activeSection]?.mode ?? "home")
  }, [activeSection])

  // ─── HIDE SWIPE HINT AFTER FIRST SCROLL ──────────────────────────
  useEffect(() => {
    if (activeSection > 0) setScrolled(true)
  }, [activeSection])

  // ─── SCROLL PROGRESS BAR ──────────────────────────────────────────
  useEffect(() => {
    const container = snapRef.current
    if (!container) return
    const onScroll = () => {
      const max = container.scrollHeight - container.clientHeight
      setScrollProgress(max > 0 ? container.scrollTop / max : 0)
    }
    container.addEventListener("scroll", onScroll, { passive: true })
    return () => container.removeEventListener("scroll", onScroll)
  }, [])

  // ─── PARALLAX TITLE ───────────────────────────────────────────────
  useEffect(() => {
    if (window.innerWidth < 768) return
    const onMove = (e: MouseEvent) => {
      const el = titleRef.current
      if (!el) return
      const cx = window.innerWidth  / 2
      const cy = window.innerHeight / 2
      const x  = ((e.clientX - cx) / cx) * 12
      const y  = ((e.clientY - cy) / cy) * 12
      el.style.transform = `translate(${x}px, ${y}px)`
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  // ─── ACTIVE SECTION DETECTION (for dots + label + mode) ──────────
  useEffect(() => {
    const container = snapRef.current
    if (!container) return
    const sectionEls = container.querySelectorAll<HTMLElement>(".snap-section")
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Array.from(sectionEls).indexOf(entry.target as HTMLElement)
            if (idx >= 0) setActiveSection(idx)
          }
        })
      },
      { root: container, threshold: 0.4 }
    )
    sectionEls.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // ─── SECTION FLASH + FADE-IN ──────────────────────────────────────
  useEffect(() => {
    const FLASH_COLOR: Record<string, string> = {
      home:     "rgba(77,184,255,0.7)",
      about:    "rgba(77,184,255,0.7)",
      projects: "rgba(77,184,255,0.7)",
      physics:  "rgba(0,229,255,0.7)",
      music:    "rgba(255,124,56,0.7)",
      climbing: "rgba(126,217,87,0.7)",
      contact:  "rgba(77,184,255,0.7)",
    }

    const container = snapRef.current
    const sectionEls = document.querySelectorAll<HTMLElement>("section[data-mode]")
    const flash = flashRef.current

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view")
            if (flash) {
              const m = (entry.target as HTMLElement).dataset.mode ?? "home"
              flash.style.background = FLASH_COLOR[m] ?? FLASH_COLOR.home
              flash.classList.remove("section-flash--active")
              void flash.offsetWidth
              flash.classList.add("section-flash--active")
            }
          }
        })
      },
      { root: container, threshold: 0.15 }
    )
    sectionEls.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // ─── ATOM CURSOR ──────────────────────────────────────────────────
  useEffect(() => {
    const nucleus  = document.getElementById("cursor-nucleus")
    const orbit    = document.getElementById("cursor-orbit")
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

    const interactables = document.querySelectorAll(
      "button, a, .project-card, .contact-link, .resume-btn, .navbar-brand"
    )
    interactables.forEach((el) => {
      el.addEventListener("mouseenter", onEnter)
      el.addEventListener("mouseleave", onLeave)
    })

    const loop = () => {
      orbitX += (curX - orbitX) * 0.1
      orbitY += (curY - orbitY) * 0.1
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

  // ─── CURSOR TRAIL ─────────────────────────────────────────────────
  useEffect(() => {
    const trail = Array.from({ length: 10 }, () => ({ x: 0, y: 0, alpha: 0 }))
    const dots  = Array.from({ length: 10 }, (_, i) =>
      document.getElementById(`trail-${i}`) as HTMLDivElement | null
    )
    let animId: number

    const onMove = (e: MouseEvent) => {
      for (let i = trail.length - 1; i > 0; i--) {
        trail[i] = { ...trail[i - 1] }
      }
      trail[0] = { x: e.clientX, y: e.clientY, alpha: 1 }
    }
    window.addEventListener("mousemove", onMove)

    const loop = () => {
      trail.forEach((p, i) => {
        p.alpha = Math.max(0, p.alpha - 0.08)
        const d = dots[i]
        if (!d) return
        d.style.left    = p.x + "px"
        d.style.top     = p.y + "px"
        d.style.opacity = String(p.alpha)
      })
      animId = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("mousemove", onMove)
    }
  }, [])

  // ─── SCROLL TO SECTION ────────────────────────────────────────────
  const scrollToSection = (section: string) => {
    const map = {
      home:     homeRef,
      about:    aboutRef,
      projects: projectsRef,
      physics:  physicsRef,
      music:    musicRef,
      climbing: climbingRef,
      timeline: timelineRef,
      now:      nowRef,
      skills:   skillsRef,
      blog:     blogRef,
      contact:  contactRef,
    } as Record<string, React.RefObject<HTMLElement | null>>
    map[section]?.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <>
      {/* Scroll progress bar */}
      <div className="scroll-progress" style={{ width: `${scrollProgress * 100}%` }} />

      {/* Section flash */}
      <div ref={flashRef} className="section-flash" />

      {/* Loading screen */}
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      {/* Easter egg */}
      <EasterEgg />

      {/* Atom cursor */}
      <div id="cursor-nucleus" />
      <div id="cursor-orbit"   />
      <div id="cursor-electron" />

      {/* Cursor trail */}
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} id={`trail-${i}`} className="cursor-trail-dot" />
      ))}

      {/* Background canvas */}
      <BackgroundCanvas mode={mode} />

      {/* Navbar */}
      <Navbar setMode={setMode} mode={mode} scrollToSection={scrollToSection} />

      {/* Section indicator dots */}
      <div className="section-dots">
        {SECTIONS.map((s, i) => (
          <button
            key={s.key}
            className={`section-dot${activeSection === i ? " active" : ""}`}
            onClick={() => scrollToSection(s.key)}
            aria-label={`Go to ${s.label}`}
            title={s.label}
          />
        ))}
      </div>

      {/* Current section label */}
      <div className="current-section-label">
        {SECTIONS[activeSection]?.label}
      </div>

      {/* ── SNAP SCROLL CONTAINER ──────────────────────────────────── */}
      <div className="snap-container" ref={snapRef}>
        <main>

          {/* ── HOME ──────────────────────────────────────────────── */}
          <section ref={homeRef} className="home-section snap-section" data-mode="home" style={{ position: "relative" }}>
            <HeroCanvas />
            <div className="home-content">
              <h1 ref={titleRef} className="home-name" data-text="THE ANIRUDH PROTOCOL">
                THE ANIRUDH PROTOCOL
              </h1>
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

              {/* Swipe hint */}
              <div
                className="swipe-hint"
                style={{
                  opacity:       scrolled ? 0 : 1,
                  transition:    "opacity 0.5s ease",
                  pointerEvents: "none",
                }}
              >
                <div className="swipe-hint-line" />
                <div className="swipe-hint-dot"  />
              </div>
            </div>
          </section>

          {/* ── ABOUT ─────────────────────────────────────────────── */}
          <section ref={aboutRef} className="about-section fade-section snap-section" data-mode="about">
            <div className="about-grid">
              <div className="about-photo-wrapper">
                <img src="/profile.jpg" alt="Anirudh Menon" className="about-photo" />
                <div className="about-photo-glow" />
              </div>
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

          {/* ── PROJECTS ──────────────────────────────────────────── */}
          <section ref={projectsRef} className="projects-section fade-section snap-section" data-mode="projects">
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

          {/* ── PHYSICS ───────────────────────────────────────────── */}
          <section ref={physicsRef} className="fade-section snap-section" data-mode="physics" style={{ paddingTop: "100px", paddingBottom: "80px" }}>
            <div className="placeholder-section mode-physics">
              <div className="section-eyebrow">Physics / Space</div>
              <h2 className="section-title">The Universe,<br />Engineered.</h2>
              <div className="lab-image-wrapper">
                <img src="/lab.jpg" alt="PVIC Research Lab" className="lab-image" />
                <div className="lab-image-caption">Wright Center for Photovoltaics Innovation — PVIC Lab</div>
              </div>
              <div className="placeholder-grid">
                {[
                  { label: "Research Focus", title: "Solar Photovoltaics",         body: "At PVIC, I work on improving the efficiency of CdTe/CdSeTe thin-film solar cells through back-interface engineering. The work involves fabricating devices, running JV and EQE characterization, and analyzing how carbon nanotube networks and ALD-deposited aluminum oxide affect carrier recombination. Physics applied to a problem that matters." },
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
            <AtomCanvas />
            <SolarSystem />
          </section>

          {/* ── MUSIC ─────────────────────────────────────────────── */}
          <section ref={musicRef} className="fade-section snap-section" data-mode="music" style={{ paddingTop: "100px", paddingBottom: "80px" }}>
            <div className="placeholder-section mode-music">
              <div className="section-eyebrow">Music / DJ</div>
              <h2 className="section-title">Sound as<br />a System.</h2>
              <div className="placeholder-grid">
                {[
                  { label: "Genre",   title: "House, Techno, Ambient",  body: "I mix electronic music that leans atmospheric — deep house, minimal techno, and ambient textures that build space rather than just energy. The goal is always immersion over impact." },
                  { label: "Practice", title: "Set Building",           body: "DJing is how I think about flow and structure outside the lab. A good set moves like a narrative — tension, release, texture, resolution. I build sets that feel like a journey from start to finish, not just a playlist." },
                  { label: "Mixes — Coming Soon", title: "SoundCloud / Stream", body: "Recorded sets and mixes will be embedded here via SoundCloud. Reach out directly if you want to hear something sooner." },
                ].map((c) => (
                  <div className="placeholder-card" key={c.title}>
                    <span className="placeholder-card-label">{c.label}</span>
                    <h3 className="placeholder-card-title">{c.title}</h3>
                    <p className="placeholder-card-body">{c.body}</p>
                  </div>
                ))}
              </div>
              <div className="music-embed-wrapper">
                <iframe
                  allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                  height="450"
                  style={{ width: "100%", maxWidth: "660px", overflow: "hidden", borderRadius: "10px", border: 0 }}
                  sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                  src="https://embed.music.apple.com/us/playlist/my-axiom/pl.u-8aAVoV6HvRXxB1z"
                />
              </div>
            </div>
          </section>

          {/* ── CLIMBING ──────────────────────────────────────────── */}
          <section ref={climbingRef} className="fade-section snap-section" data-mode="climbing" style={{ paddingTop: "100px", paddingBottom: "80px" }}>
            <div className="placeholder-section mode-climbing">
              <div className="section-eyebrow">Climbing / Outdoors</div>
              <h2 className="section-title">Problems on<br />Rock.</h2>
              <div className="placeholder-grid">
                {[
                  { label: "Discipline",  title: "Intermediate Climbing",         body: "Mostly indoor right now, working toward more outdoor routes. Climbing, for me, is a mental discipline as much as a physical one — reading a problem, committing to a sequence, staying precise under pressure. The same qualities that make a good researcher." },
                  { label: "Leadership",  title: "Wilderness Exploration Club",   body: "As President, I plan and execute day hikes, climbing sessions, and multi-day wilderness trips for the club. Logistics, safety, and keeping people moving — it is a different kind of systems problem, but a real one." },
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

          {/* ── TIMELINE ──────────────────────────────────────────── */}
          <div className="snap-section" ref={timelineRef}>
            <Timeline />
          </div>

          {/* ── NOW ───────────────────────────────────────────────── */}
          <div className="snap-section" ref={nowRef}>
            <NowSection />
          </div>

          {/* ── SKILLS ────────────────────────────────────────────── */}
          <div className="snap-section" ref={skillsRef}>
            <SkillsSection />
          </div>

          {/* ── BLOG / WRITING ────────────────────────────────────── */}
          <div className="snap-section" ref={blogRef}>
            <BlogSection />
          </div>

          {/* ── CONTACT ───────────────────────────────────────────── */}
          <section ref={contactRef} className="contact-section fade-section snap-section" data-mode="contact">
            <div className="section-eyebrow">Contact</div>
            <h2 className="section-title" style={{ textAlign: "center" }}>Let's Connect</h2>
            <p className="contact-sub">
              Open to research collaborations, internships, and conversations
              about physics, renewable energy, and technology.
            </p>

            <ContactForm />

            <div className="contact-links">
              <a href="mailto:akunnat3@rockets.utoledo.edu" className="contact-link">
                <span className="contact-link-label">University Email</span>
                <span className="contact-link-value">akunnat3@rockets.utoledo.edu</span>
              </a>
              <a href="mailto:anirudhmenon2k10@gmail.com" className="contact-link">
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

            {/* Footer lives inside contact to stay reachable */}
            <footer className="site-footer">
              <span className="site-footer-copy">© 2026 Anirudh Menon · THE ANIRUDH PROTOCOL</span>
              <div className="site-footer-links">
                <a href="https://github.com/Anixxxrudh"   target="_blank" rel="noreferrer">GitHub</a>
                <a href="https://www.linkedin.com/in/anirudh-menon-kunnath-pathayapura-247b07246/" target="_blank" rel="noreferrer">LinkedIn</a>
                <a href="https://instagram.com/anixxrudh" target="_blank" rel="noreferrer">@anixxrudh</a>
              </div>
            </footer>
          </section>

        </main>
      </div>
    </>
  )
}
