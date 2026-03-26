"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import BackgroundCanvas from "../components/BackgroundCanvas"
import Navbar from "../components/Navbar"
import LoadingScreen from "../components/LoadingScreen"
import Timeline from "../components/Timeline"
import SkillsSection from "../components/SkillsSection"
import EasterEgg from "../components/EasterEgg"
import HeroCanvas      from "../components/HeroCanvas"
import AtomCanvas      from "../components/AtomCanvas"
import SolarSystem     from "../components/SolarSystem"
import BlogSection     from "../components/BlogSection"
import ContactForm     from "../components/ContactForm"
import ScrambleText    from "../components/ScrambleText"
import TiltCard        from "../components/TiltCard"
import QuotesSection   from "../components/QuotesSection"
import CommandPalette    from "../components/CommandPalette"
import ContextMenu       from "../components/ContextMenu"
import CollabSection     from "../components/CollabSection"

const SECTIONS = [
  { key: "home",     label: "HOME",     mode: "home"     },
  { key: "about",    label: "ABOUT",    mode: "about"    },
  { key: "projects", label: "PROJECTS", mode: "projects" },
  { key: "physics",  label: "PHYSICS",  mode: "physics"  },
  { key: "music",    label: "MUSIC",    mode: "music"    },
  { key: "climbing", label: "CLIMBING", mode: "climbing" },
  { key: "timeline", label: "TIMELINE", mode: "home"     },
  { key: "skills",   label: "SKILLS",   mode: "physics"  },
  { key: "blog",     label: "WRITING",  mode: "about"    },
  { key: "collab",   label: "COLLAB",   mode: "about"    },
  { key: "quotes",   label: "QUOTES",   mode: "about"    },
  { key: "contact",  label: "CONTACT",  mode: "contact"  },
]

const FLASH_CLASS: Record<string, string> = {
  home:     "flash-blue",
  about:    "flash-blue",
  projects: "flash-blue",
  physics:  "flash-blue",
  music:    "flash-orange",
  climbing: "flash-green",
  contact:  "flash-blue",
}

export default function Page() {
  const [loaded,        setLoaded]        = useState(false)
  const [scrolled,      setScrolled]      = useState(false)
  const [scrollProgress,setScrollProgress]= useState(0)
  const [sectionProgress,setSectionProgress] = useState(0)
  const [mode,          setMode]          = useState("home")
  const [activeSection, setActiveSection] = useState(0)
  const [cmdOpen,       setCmdOpen]       = useState(false)
  const [kbTooltip,     setKbTooltip]     = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [expandedCard,  setExpandedCard]  = useState<string | null>(null)

  const transitioning = useRef(false)

  const snapRef  = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const fullFlashRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const activeSectionRef = useRef(0)

  // Section refs
  const homeRef     = useRef<HTMLElement>(null)
  const aboutRef    = useRef<HTMLElement>(null)
  const projectsRef = useRef<HTMLElement>(null)
  const physicsRef  = useRef<HTMLElement>(null)
  const musicRef    = useRef<HTMLElement>(null)
  const climbingRef = useRef<HTMLElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const skillsRef   = useRef<HTMLDivElement>(null)
  const blogRef     = useRef<HTMLDivElement>(null)
  const collabRef   = useRef<HTMLDivElement>(null)
  const quotesRef   = useRef<HTMLDivElement>(null)
  const contactRef  = useRef<HTMLElement>(null)

  // Keep activeSection ref in sync for wheel handler closure
  useEffect(() => { activeSectionRef.current = activeSection }, [activeSection])

  // ─── SCROLL TO SECTION ────────────────────────────────────────────
  const scrollToSection = useCallback((section: string) => {
    const map = {
      home:     homeRef,
      about:    aboutRef,
      projects: projectsRef,
      physics:  physicsRef,
      music:    musicRef,
      climbing: climbingRef,
      timeline: timelineRef,
      skills:   skillsRef,
      blog:     blogRef,
      collab:   collabRef,
      quotes:   quotesRef,
      contact:  contactRef,
    } as Record<string, React.RefObject<HTMLElement | null>>
    map[section]?.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // ─── WORMHOLE NAV (navbar clicks only) ───────────────────────────
  const navigateWithTransition = useCallback((section: string) => {
    if (transitioning.current) return
    transitioning.current = true
    setIsTransitioning(true)
    setTimeout(() => scrollToSection(section), 350)
    setTimeout(() => { setIsTransitioning(false); transitioning.current = false }, 700)
  }, [scrollToSection])

  // ─── DERIVE MODE FROM ACTIVE SECTION ─────────────────────────────
  useEffect(() => {
    setMode(SECTIONS[activeSection]?.mode ?? "home")
  }, [activeSection])

  // ─── HIDE SWIPE HINT AFTER FIRST SCROLL ──────────────────────────
  useEffect(() => {
    if (activeSection > 0) setScrolled(true)
  }, [activeSection])

  // ─── SCROLL PROGRESS BAR ─────────────────────────────────────────
  useEffect(() => {
    const container = snapRef.current
    if (!container) return
    const onScroll = () => {
      const max = container.scrollHeight - container.clientHeight
      setScrollProgress(max > 0 ? container.scrollTop / max : 0)

      // Per-section progress for dots
      const sectionEls = container.querySelectorAll<HTMLElement>(".snap-section")
      const activeEl = sectionEls[activeSectionRef.current]
      if (activeEl) {
        const sectionTop = activeEl.offsetTop
        const sectionH = activeEl.offsetHeight
        const scrollTop = container.scrollTop
        const within = scrollTop - sectionTop
        const range = Math.max(1, sectionH - container.clientHeight)
        const prog = Math.max(0, Math.min(100, (within / range) * 100))
        setSectionProgress(prog)
      }
    }
    container.addEventListener("scroll", onScroll, { passive: true })
    return () => container.removeEventListener("scroll", onScroll)
  }, [])

  // ─── PARALLAX TITLE ──────────────────────────────────────────────
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

  // ─── ACTIVE SECTION DETECTION ────────────────────────────────────
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

  // ─── SECTION FLASH + FADE-IN ─────────────────────────────────────
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
    const fullFlash = fullFlashRef.current

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view")
            const m = (entry.target as HTMLElement).dataset.mode ?? "home"

            // 1px bar flash (existing)
            if (flash) {
              flash.style.background = FLASH_COLOR[m] ?? FLASH_COLOR.home
              flash.classList.remove("section-flash--active")
              void flash.offsetWidth
              flash.classList.add("section-flash--active")
            }

            // Full-screen cinematic flash (new)
            if (fullFlash) {
              const cls = FLASH_CLASS[m] ?? "flash-blue"
              fullFlash.className = ""
              void fullFlash.offsetWidth
              fullFlash.id = "section-flash-full"
              fullFlash.classList.add(cls)
              setTimeout(() => fullFlash.classList.remove(cls), 400)
            }
          }
        })
      },
      { root: container, threshold: 0.15 }
    )
    sectionEls.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // ─── COMMAND PALETTE (⌘K / Ctrl+K) ───────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCmdOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // ─── KEYBOARD NAVIGATION ─────────────────────────────────────────
  useEffect(() => {
    const KEYS = ["home","about","projects","physics","music","climbing","timeline","skills","blog","collab","quotes","contact"]
    let gPressed = false
    let gTimer: ReturnType<typeof setTimeout> | null = null
    let kbShownRef = false

    const showTooltip = () => {
      if (kbShownRef) return
      kbShownRef = true
      setKbTooltip(true)
      setTimeout(() => setKbTooltip(false), 2000)
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (cmdOpen) return

      if (e.key === "g" || e.key === "G") {
        gPressed = true
        if (gTimer) clearTimeout(gTimer)
        gTimer = setTimeout(() => { gPressed = false }, 500)
        return
      }

      if (gPressed) {
        if (e.key === "h" || e.key === "H") { scrollToSection("home");    gPressed = false; return }
        if (e.key === "c" || e.key === "C") { scrollToSection("contact"); gPressed = false; return }
      }

      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault()
        showTooltip()
        setActiveSection((cur) => {
          const next = Math.min(cur + 1, KEYS.length - 1)
          scrollToSection(KEYS[next])
          return next
        })
      }
      if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault()
        showTooltip()
        setActiveSection((cur) => {
          const next = Math.max(cur - 1, 0)
          scrollToSection(KEYS[next])
          return next
        })
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [scrollToSection, cmdOpen])

  return (
    <>
      {/* Scroll progress bar */}
      <div className="scroll-progress" style={{ width: `${scrollProgress * 100}%` }} />

      {/* Section flash — 1px bar */}
      <div ref={flashRef} className="section-flash" />

      {/* Cinematic full-screen flash */}
      <div ref={fullFlashRef} id="section-flash-full" />

      {/* Wormhole transition overlay */}
      {isTransitioning && (
        <div className="wormhole-overlay">
          <div className="wormhole-core" />
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="wormhole-ring" style={{ animationDelay: `${i * 35}ms` }} />
          ))}
        </div>
      )}

      {/* Loading screen */}
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      {/* Easter egg */}
      <EasterEgg />

      {/* Background canvas */}
      <BackgroundCanvas mode={mode} />

      {/* Navbar */}
      <Navbar setMode={setMode} mode={mode} scrollToSection={navigateWithTransition} />

      {/* ⌘K hint */}
      <button
        className="navbar-cmd-hint"
        style={{ position: "fixed", top: 14, right: 24, zIndex: 101 }}
        onClick={() => setCmdOpen(true)}
        aria-label="Open command palette"
      >
        ⌘K
      </button>

      {/* Command palette */}
      {cmdOpen && (
        <CommandPalette
          scrollToSection={scrollToSection}
          onClose={() => setCmdOpen(false)}
        />
      )}

      {/* Context menu */}
      <ContextMenu scrollToSection={scrollToSection} />

      {/* Section indicator dots */}
      <div className="section-dots">
        {SECTIONS.map((s, i) => (
          <button
            key={s.key}
            className={`section-dot${activeSection === i ? " active" : ""}`}
            onClick={() => scrollToSection(s.key)}
            aria-label={`Go to ${s.label}`}
            title={s.label}
            style={activeSection === i ? {
              ["--dot-progress" as string]: `${sectionProgress}%`,
            } : {}}
          />
        ))}
      </div>

      {/* Current section label */}
      <div className="current-section-label">
        {SECTIONS[activeSection]?.label}
      </div>

      {/* Keyboard nav tooltip */}
      {kbTooltip && (
        <div className="kb-tooltip">
          Keyboard navigation active — ↑↓ to move between sections
        </div>
      )}

      {/* ── SNAP SCROLL CONTAINER ─────────────────────────────────── */}
      <div className="snap-container" ref={snapRef}>
        <main>

          {/* ── HOME ────────────────────────────────────────────── */}
          <section ref={homeRef} className="home-section snap-section" data-mode="home" style={{ position: "relative" }}>
            <HeroCanvas />
            <div className="home-content">
              <h1 ref={titleRef} className="home-name" data-text="THE ANIRUDH PROTOCOL">
                THE ANIRUDH PROTOCOL
              </h1>
              <p className="home-tagline">
                Astrophysics&nbsp;&nbsp;·&nbsp;&nbsp;Photovoltaics&nbsp;&nbsp;·&nbsp;&nbsp;Climbing&nbsp;&nbsp;·&nbsp;&nbsp;Music
              </p>
              <div className="crawl-wrapper">
                <div className={`crawl-inner${loaded ? "" : " crawl-paused"}`}>
                  <p>A long time ago, in a lab not so far away...</p>
                  <p>EPISODE II — THE ANIRUDH PROTOCOL</p>
                  <p>Sophomore physicist at the University of Toledo, charting a course through thin-film solar cells and the expanding universe.</p>
                  <p>At the Wright Center for Photovoltaics (PVIC), our hero engineers CdTe/CdSeTe devices — pushing back-interface recombination to the outer rim using SWCNT networks and ALD-deposited Al₂O₃ interlayers.</p>
                  <p>By day: sputtering, ALD, JV curves, EQE spectra, Python pipelines. By night: deep house mixes, climbing walls, and staring at the dark energy driving the universe apart.</p>
                  <p>As President of the Wilderness Exploration Club, he leads expeditions into Cuyahoga Valley, the Smoky Mountains, and beyond — 20 to 30 rebels at a time.</p>
                  <p>Physics track. Astrophysics focus. Data Science minor. Hackathon logistics commander. Portfolio architect.</p>
                  <p>From solar cells to distant galaxies — from sound waves to mountain walls — this is where science, creativity, and motion converge.</p>
                  <p>This is The Anirudh Protocol.</p>
                </div>
              </div>
              <div
                className="swipe-hint"
                style={{ opacity: scrolled ? 0 : 1, transition: "opacity 0.5s ease", pointerEvents: "none" }}
              >
                <div className="swipe-hint-line" />
                <div className="swipe-hint-dot"  />
              </div>
            </div>
          </section>

          {/* ── ABOUT (split screen) ─────────────────────────────── */}
          <section ref={aboutRef} className="about-section fade-section snap-section" data-mode="about" style={{ padding: 0, position: "relative" }}>
            <span className="section-ghost-number">01</span>
            <div className="about-split">
              {/* Left: image */}
              <div className="about-split-image">
                <img src="/profile.jpg" alt="Anirudh Menon" />
              </div>
              {/* Right: content */}
              <div className="about-split-content">
                <div className="section-eyebrow">About</div>
                <h2 className="section-title">Physicist.<br />Researcher.<br />Builder.</h2>
                <p className="about-lead">
                  Sophomore at the University of Toledo — Physics (Astrophysics track), minor in Data Science.
                  Researcher at the Wright Center for Photovoltaics (PVIC) and President of the Wilderness Exploration Club.
                </p>
                <p className="about-body">
                  At PVIC, I engineer CdTe/CdSeTe thin-film solar devices — focusing on back-interface recombination
                  reduction via SWCNT networks and ALD-deposited Al₂O₃. Full fabrication and characterization pipeline:
                  sputtering, ALD, gold deposition, JV/EQE analysis in Python, JMP, and IGOR.
                </p>
                <div className="about-tags">
                  {["Device Fabrication","ALD","Sputtering","JV / EQE","Python","JMP","IGOR","Data Science","CdTe/CdSeTe"].map((t) => (
                    <span className="tag" key={t}>{t}</span>
                  ))}
                </div>
                {/* Stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                  {[
                    { label: "Institution",   value: "University of Toledo" },
                    { label: "Major",         value: "Physics — Astrophysics Track" },
                    { label: "Minor",         value: "Data Science" },
                    { label: "Research Lab",  value: "Wright Center for Photovoltaics (PVIC)" },
                    { label: "Leadership",    value: "President, Wilderness Exploration Club" },
                  ].map((s) => (
                    <div className="about-stat" key={s.label}>
                      <div className="about-stat-label">{s.label}</div>
                      <div className="about-stat-value">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── PROJECTS ─────────────────────────────────────────── */}
          <section ref={projectsRef} className="projects-grid-section fade-section snap-section" data-mode="projects" style={{ position: "relative" }}>
            <span className="section-ghost-number">02</span>
            <div className="projects-grid-header">
              <div className="section-eyebrow">Projects</div>
              <h2 className="section-title">Selected Work</h2>
            </div>
            <div className="projects-grid">
              {([
                {
                  idx: "01", icon: "⚛", title: "Photovoltaics Research — CdTe Solar Cells",
                  subtitle: "Thin-Film Solar Innovation @ University of Toledo (PVIC)",
                  collapsedDesc: "Engineering the back interface of CdTe thin-film solar cells to reduce recombination losses and push efficiency limits at the Wright Center for Photovoltaics (PVIC).",
                  role: "Researcher — Fabrication, Characterization, Analysis",
                  impact: "Advancing next-generation thin-film solar efficiency",
                  sections: [
                    { heading: "RESEARCH FOCUS", items: ["Interface engineering for CdTe solar cells", "Improving Voc and fill factor", "Reducing back contact recombination losses"] },
                    { heading: "TECHNIQUES & TOOLS", items: ["ALD deposition (Al₂O₃)", "Sputtering (ZnTe:Cu)", "SWCNT networks", "JV & EQE characterization", "UV-Vis spectroscopy", "JMP, IGOR Pro, Python"] },
                    { heading: "KEY CONTRIBUTIONS", items: ["Integrated SWCNT networks with ALD Al₂O₃ interlayers", "Investigated interface passivation strategies", "Built and ran full fabrication + characterization pipeline", "Worked in cleanroom, vacuum systems, thin-film deposition rigs"] },
                    { heading: "IMPACT", items: ["Driving improvements toward higher efficiency solar cells and scalable renewable energy solutions."] },
                  ],
                  badges: ["Research", "Clean Energy", "Nanotechnology", "Thin Films"],
                },
                {
                  idx: "02", icon: "◈", title: "RocketHacks — Event Logistics System",
                  subtitle: "University Hackathon Operations",
                  collapsedDesc: "End-to-end logistics design and execution for a 24-hour university hackathon. Coordinated participant flow, scheduling, sponsor engagement, and real-time operations across a large, multi-track event.",
                  role: "Event Logistics Lead",
                  impact: "Seamless experience delivered across hundreds of participants",
                  sections: [
                    { heading: "RESPONSIBILITIES", items: ["Designed and executed full event logistics for 24-hour hackathon", "Managed participant flow, track scheduling, and venue operations", "Coordinated sponsor engagement and real-time communications", "Led a team of volunteers across multiple event tracks"] },
                    { heading: "IMPACT", items: ["Delivered a smooth, high-energy experience for hundreds of student participants across the University of Toledo."] },
                  ],
                  badges: ["Leadership", "Events", "Operations", "Teamwork"],
                },
                {
                  idx: "03", icon: "◈", title: "Cinematic Portfolio Website",
                  subtitle: "Personal Brand & Digital Identity",
                  collapsedDesc: "A visually immersive personal portfolio featuring animated star-field backgrounds, scroll-driven section transitions, Star Wars perspective crawl, and a dynamic canvas that responds to each section's identity.",
                  role: "Creator / Designer — AI-assisted development",
                  impact: "Personal brand expressed through design, motion, and technology",
                  sections: [
                    { heading: "FEATURES", items: ["Animated star-field & section-reactive canvas backgrounds", "Snap-scroll with wormhole transition animation", "Star Wars perspective crawl on the home screen", "Command palette (⌘K) and keyboard navigation", "Expandable project cards with CSS transitions"] },
                    { heading: "STACK", items: ["Next.js 15 (App Router)", "React 19", "TypeScript", "Pure CSS animations — no animation libraries"] },
                  ],
                  badges: ["Design", "React", "Next.js", "CSS"],
                },
                {
                  idx: "04", icon: "▲", title: "WEX — Wilderness Exploration Club",
                  subtitle: "President | Outdoor Leadership & Expedition Planning",
                  collapsedDesc: "Leading the Wilderness Exploration Club at the University of Toledo — organizing multi-day expeditions, managing logistics for 20–30+ participants, and building a thriving outdoor community on campus.",
                  role: "President — WEX, University of Toledo",
                  impact: "Creating accessible outdoor experiences that build resilience and real connection",
                  sections: [
                    { heading: "RESPONSIBILITIES", items: ["Planned and led multi-day trips (camping, hiking, climbing)", "Organized large-scale group logistics (20–30+ participants)", "Managed budgeting, SAC funding, and trip coordination", "Built and grew the outdoor community on campus"] },
                    { heading: "EXPEDITIONS ORGANIZED", items: ["Cuyahoga Valley National Park (camping + hiking)", "Snow Trails skiing & snowboarding trips", "Campus climbing gym events", "Smoky Mountains multi-day expedition"] },
                    { heading: "SKILLS DEVELOPED", items: ["Leadership & team coordination", "Logistics & operations planning", "Risk management in outdoor environments"] },
                    { heading: "IMPACT", items: ["Created accessible outdoor experiences and helped students disconnect, explore nature, and build genuine connections beyond campus life."] },
                  ],
                  badges: ["Leadership", "Outdoors", "Expeditions", "Community"],
                },
              ] as const).map((p) => {
                const isOpen = expandedCard === p.idx
                return (
                  <div
                    key={p.idx}
                    className={`project-card-h${isOpen ? " project-card-h--open" : ""}`}
                    onClick={() => setExpandedCard(isOpen ? null : p.idx)}
                  >
                    <div className="pcard-top">
                      <span className="project-index">{p.idx}</span>
                      <span className="pcard-icon">{p.icon}</span>
                    </div>
                    <h3 className="project-title">{p.title}</h3>
                    <p className="pcard-subtitle">{p.subtitle}</p>
                    <p className="project-desc">{p.collapsedDesc}</p>
                    <div className="project-footer">
                      <span className="project-role">{p.role}</span>
                      <span className="project-impact">{p.impact}</span>
                    </div>
                    <div className="pcard-expanded">
                      {p.sections.map((s) => (
                        <div key={s.heading} className="pcard-section">
                          <p className="pcard-section-heading">{s.heading}</p>
                          <ul className="pcard-list">
                            {s.items.map((item) => <li key={item}>{item}</li>)}
                          </ul>
                        </div>
                      ))}
                      <div className="pcard-badges">
                        {p.badges.map((b) => <span key={b} className="pcard-badge">{b}</span>)}
                      </div>
                    </div>
                    <div className="pcard-toggle">{isOpen ? "↑ Close" : "↓ Details"}</div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* ── PHYSICS ─────────────────────────────────────────── */}
          <section ref={physicsRef} className="fade-section snap-section" data-mode="physics" style={{ paddingTop: "100px", paddingBottom: "80px", position: "relative" }}>
            <span className="section-ghost-number">03</span>
            <div className="placeholder-section mode-physics">
              <div className="section-eyebrow">Physics / Space</div>
              <ScrambleText text={"The Universe,\nEngineered."} className="section-title" />
              <div className="lab-image-wrapper">
                <img src="/lab.jpg" alt="PVIC Research Lab" className="lab-image" />
                <div className="lab-image-caption">Wright Center for Photovoltaics Innovation — PVIC Lab</div>
              </div>
              <div className="placeholder-grid">
                {[
                  { label: "Research Focus", title: "Solar Photovoltaics",          body: "At PVIC, I work on improving the efficiency of CdTe/CdSeTe thin-film solar cells through back-interface engineering. The work involves fabricating devices, running JV and EQE characterization, and analyzing how carbon nanotube networks and ALD-deposited aluminum oxide affect carrier recombination. Physics applied to a problem that matters." },
                  { label: "Interest Area",  title: "Cosmology & the Early Universe", body: "The questions that pull me most are the large-scale ones — what triggered the Big Bang, what dark matter actually is, and how dark energy is driving the accelerating expansion of the universe. These are not just abstract puzzles. They define the structure of everything that exists." },
                  { label: "Lab Visuals — Coming Soon", title: "Research Images & Data", body: "Lab photographs, device characterization plots, and JV/EQE data visualizations from PVIC research will be displayed here." },
                ].map((c) => (
                  <TiltCard key={c.title} className="placeholder-card">
                    <span className="placeholder-card-label">{c.label}</span>
                    <h3 className="placeholder-card-title">{c.title}</h3>
                    <p className="placeholder-card-body">{c.body}</p>
                  </TiltCard>
                ))}
              </div>
            </div>
            <AtomCanvas />
            <SolarSystem />
          </section>

          {/* ── MUSIC ───────────────────────────────────────────── */}
          <section ref={musicRef} className="fade-section snap-section" data-mode="music" style={{ paddingTop: "100px", paddingBottom: "80px", position: "relative" }}>
            <span className="section-ghost-number">04</span>
            <div className="placeholder-section mode-music">
              <div className="section-eyebrow">Music / DJ</div>
              <ScrambleText text={"Sound as\na System."} className="section-title" />
              <div className="placeholder-grid">
                {[
                  { label: "Genre",   title: "House, Techno, Ambient",  body: "I mix electronic music that leans atmospheric — deep house, minimal techno, and ambient textures that build space rather than just energy. The goal is always immersion over impact." },
                  { label: "Practice", title: "Set Building",           body: "DJing is how I think about flow and structure outside the lab. A good set moves like a narrative — tension, release, texture, resolution. I build sets that feel like a journey from start to finish, not just a playlist." },
                  { label: "Mixes — Coming Soon", title: "SoundCloud / Stream", body: "Recorded sets and mixes will be embedded here via SoundCloud. Reach out directly if you want to hear something sooner." },
                ].map((c) => (
                  <TiltCard key={c.title} className="placeholder-card">
                    <span className="placeholder-card-label">{c.label}</span>
                    <h3 className="placeholder-card-title">{c.title}</h3>
                    <p className="placeholder-card-body">{c.body}</p>
                  </TiltCard>
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

          {/* ── CLIMBING ────────────────────────────────────────── */}
          <section ref={climbingRef} className="fade-section snap-section" data-mode="climbing" style={{ paddingTop: "100px", paddingBottom: "80px", position: "relative" }}>
            <span className="section-ghost-number">05</span>
            <div className="placeholder-section mode-climbing">
              <div className="section-eyebrow">Climbing / Outdoors</div>
              <ScrambleText text={"Problems on\nRock."} className="section-title" />
              <div className="placeholder-grid">
                {[
                  { label: "Discipline",  title: "Intermediate Climbing",          body: "Mostly indoor right now, working toward more outdoor routes. Climbing, for me, is a mental discipline as much as a physical one — reading a problem, committing to a sequence, staying precise under pressure. The same qualities that make a good researcher." },
                  { label: "Leadership",  title: "Wilderness Exploration Club",    body: "As President, I plan and execute day hikes, climbing sessions, and multi-day wilderness trips for the club. Logistics, safety, and keeping people moving — it is a different kind of systems problem, but a real one." },
                  { label: "Gallery — Coming Soon", title: "Trip Photos & Routes", body: "Photos, trip logs, and route documentation from club expeditions will be added here. Check back after the next trip." },
                ].map((c) => (
                  <TiltCard key={c.title} className="placeholder-card">
                    <span className="placeholder-card-label">{c.label}</span>
                    <h3 className="placeholder-card-title">{c.title}</h3>
                    <p className="placeholder-card-body">{c.body}</p>
                  </TiltCard>
                ))}
              </div>
            </div>
          </section>

          {/* ── TIMELINE ────────────────────────────────────────── */}
          <div className="snap-section" ref={timelineRef} style={{ position: "relative" }}>
            <span className="section-ghost-number">06</span>
            <Timeline />
          </div>

          {/* ── SKILLS ──────────────────────────────────────────── */}
          <div className="snap-section" ref={skillsRef} style={{ position: "relative" }}>
            <span className="section-ghost-number">08</span>
            <SkillsSection />
          </div>

          {/* ── WRITING / BLOG ──────────────────────────────────── */}
          <div className="snap-section" ref={blogRef}>
            <BlogSection />
          </div>

          {/* ── COLLAB ──────────────────────────────────────────── */}
          <div ref={collabRef as React.RefObject<HTMLDivElement>} className="snap-section">
            <CollabSection />
          </div>

          {/* ── QUOTES ──────────────────────────────────────────── */}
          <div ref={quotesRef} className="snap-section" style={{ position: "relative" }}>
            <span className="section-ghost-number">10</span>
            <QuotesSection />
          </div>

          {/* ── CONTACT ─────────────────────────────────────────── */}
          <section ref={contactRef} className="contact-section fade-section snap-section" data-mode="contact" style={{ position: "relative" }}>
            <span className="section-ghost-number">11</span>
            <div className="section-eyebrow">Contact</div>
            <ScrambleText text="Let's Connect" className="section-title" as="h2" />
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
              <a href="/resume.pdf" download className="resume-btn">Download Resume</a>
            </div>

            {/* Classified hint — subtle */}
            <a href="/classified" className="classified-hint">
              Access Level: Restricted — /classified
            </a>

            <footer className="site-footer">
              <span className="site-footer-copy">© 2026 Anirudh Menon · THE ANIRUDH PROTOCOL</span>
              <div className="site-footer-links">
                <a href="https://github.com/Anixxxrudh"   target="_blank" rel="noreferrer" className="footer-link">GitHub</a>
                <a href="https://www.linkedin.com/in/anirudh-menon-kunnath-pathayapura-247b07246/" target="_blank" rel="noreferrer" className="footer-link">LinkedIn</a>
                <a href="https://instagram.com/anixxrudh" target="_blank" rel="noreferrer" className="footer-link">@anixxrudh</a>
              </div>
            </footer>
          </section>

        </main>
      </div>
    </>
  )
}
