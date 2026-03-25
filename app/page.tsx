"use client"

import { useState, useEffect, useRef } from "react"
import BackgroundCanvas from "../components/BackgroundCanvas"
import Navbar from "../components/Navbar"

export default function Page() {
  const [mode, setMode] = useState("home")

  const homeRef = useRef(null)
  const aboutRef = useRef(null)
  const projectsRef = useRef(null)
  const physicsRef = useRef(null)
  const musicRef = useRef(null)
  const climbingRef = useRef(null)
  const contactRef = useRef(null)

  useEffect(() => {
    const sections = [
      { ref: homeRef, mode: "home" },
      { ref: aboutRef, mode: "home" },
      { ref: projectsRef, mode: "physics" },
      { ref: physicsRef, mode: "physics" },
      { ref: musicRef, mode: "music" },
      { ref: climbingRef, mode: "climbing" },
      { ref: contactRef, mode: "home" },
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
      { threshold: 0.4 }
    )

    sections.forEach((s) => {
      if (s.ref.current) observer.observe(s.ref.current)
    })

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (section: string) => {
    const map: any = {
      home: homeRef,
      about: aboutRef,
      projects: projectsRef,
      physics: physicsRef,
      music: musicRef,
      climbing: climbingRef,
      contact: contactRef,
    }
    map[section]?.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <>
      {/* BACKGROUND */}
      <BackgroundCanvas mode={mode} />

      {/* NAVBAR */}
      <Navbar setMode={setMode} mode={mode} scrollToSection={scrollToSection} />

      {/* CONTENT */}
      <main className="text-white relative z-10">

        {/* HOME */}
        <section
          ref={homeRef}
          className="min-h-screen flex flex-col justify-center items-center text-center px-4"
        >
          <h1 className="text-6xl font-bold tracking-wide drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
            ANIRUDH MENON
          </h1>
          <p className="mt-4 text-lg opacity-70 tracking-widest uppercase">
            Astrophysics &nbsp;•&nbsp; Photovoltaics &nbsp;•&nbsp; Climbing &nbsp;•&nbsp; Music
          </p>
          <p className="mt-6 text-sm opacity-40 tracking-wider">
            Scroll to explore
          </p>
        </section>

        {/* ABOUT */}
        <section
          ref={aboutRef}
          className="min-h-screen flex items-center justify-center px-6 py-24"
        >
          <div className="about-grid">
            <div className="about-label">About</div>
            <div className="about-content">
              <h2 className="section-title">Physicist. Researcher. Builder.</h2>
              <p className="about-short">
                Sophomore at the University of Toledo, majoring in Physics (Astrophysics track)
                with a minor in Data Science. I research thin-film solar cells at the Wright Center
                for Photovoltaics Innovation and Commercialization, and I lead the Wilderness
                Exploration Club when I'm not in the lab.
              </p>
              <p className="about-long">
                My work sits at the intersection of fundamental physics and applied engineering.
                At PVIC, I focus on improving the efficiency of CdTe/CdSeTe solar devices through
                interface engineering — specifically using single-walled carbon nanotube networks
                and ALD-deposited aluminum oxide to reduce back-interface recombination. I have
                hands-on experience with device fabrication, sputtering, ALD, gold deposition,
                and characterization techniques including JV and EQE measurements, with analysis
                pipelines built in Python, JMP, and IGOR.
              </p>
              <p className="about-long">
                Outside the lab, I organize large-scale outdoor expeditions as President of the
                Wilderness Exploration Club and contribute to university-wide events like
                RocketHacks, where I lead logistics and execution. I believe the best work happens
                when curiosity, craft, and collaboration converge.
              </p>
              <div className="about-tags">
                {["Device Fabrication", "ALD", "Sputtering", "Python", "JMP", "IGOR", "EQE / JV Characterization", "Data Science"].map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section
          ref={projectsRef}
          className="min-h-screen flex flex-col justify-center px-6 py-24"
        >
          <div className="section-header">
            <span className="about-label">Projects</span>
            <h2 className="section-title">Selected Work</h2>
          </div>

          <div className="projects-grid">

            <div className="project-card">
              <span className="project-index">01</span>
              <h3 className="project-title">CdTe Solar Cell Interface Optimization</h3>
              <p className="project-desc">
                Investigating back-interface recombination in CdTe/CdSeTe photovoltaic devices
                using SWCNT networks and ALD-deposited Al₂O₃ interlayers. Full fabrication
                and characterization pipeline handled in-house at PVIC.
              </p>
              <div className="project-meta">
                <span className="meta-role">Researcher — Fabrication, Characterization, Analysis</span>
                <span className="meta-impact">Advancing interface engineering for next-generation thin-film solar efficiency</span>
              </div>
            </div>

            <div className="project-card">
              <span className="project-index">02</span>
              <h3 className="project-title">RocketHacks — Event Logistics System</h3>
              <p className="project-desc">
                End-to-end logistics design and execution for a 24-hour university hackathon.
                Coordinated participant flow, scheduling, sponsor engagement, and real-time
                operations across a large, multi-track event.
              </p>
              <div className="project-meta">
                <span className="meta-role">Event Logistics Lead</span>
                <span className="meta-impact">Delivered a seamless experience across hundreds of participants and stakeholders</span>
              </div>
            </div>

            <div className="project-card">
              <span className="project-index">03</span>
              <h3 className="project-title">Cinematic Portfolio Website</h3>
              <p className="project-desc">
                A visually immersive personal portfolio featuring animated star-field backgrounds,
                scroll-driven section transitions, and a dynamic UI that responds to context.
                Built with Next.js, Tailwind CSS, and Canvas API.
              </p>
              <div className="project-meta">
                <span className="meta-role">Creator / Designer — AI-assisted development</span>
                <span className="meta-impact">Personal brand expressed through design, motion, and technology</span>
              </div>
            </div>

            <div className="project-card project-card--placeholder">
              <span className="project-index">04</span>
              <h3 className="project-title">Coming Soon</h3>
              <p className="project-desc">
                A new project is in progress. Check back soon — or reach out if you want
                to collaborate on something at the edge of physics, data, and design.
              </p>
            </div>

          </div>
        </section>

        {/* PHYSICS */}
        <section ref={physicsRef} className="min-h-screen flex items-center justify-center">
          <h2 className="text-4xl">Physics / Space</h2>
        </section>

        {/* MUSIC */}
        <section ref={musicRef} className="min-h-screen flex items-center justify-center">
          <h2 className="text-4xl">Music / DJ</h2>
        </section>

        {/* CLIMBING */}
        <section ref={climbingRef} className="min-h-screen flex items-center justify-center">
          <h2 className="text-4xl">Climbing</h2>
        </section>

        {/* CONTACT + RESUME */}
        <section
          ref={contactRef}
          className="min-h-screen flex flex-col justify-center items-center px-6 py-24 text-center"
        >
          <span className="about-label" style={{ justifyContent: "center" }}>Contact</span>
          <h2 className="section-title">Let's Connect</h2>
          <p className="contact-sub">
            Open to research collaborations, internships, and conversations about
            physics, renewable energy, and technology.
          </p>

          <div className="contact-links">
            <a href="mailto:your@email.com" className="contact-item">
              <span className="contact-label">Email</span>
              <span className="contact-value">your@email.com</span>
            </a>
            <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noreferrer" className="contact-item">
              <span className="contact-label">LinkedIn</span>
              <span className="contact-value">linkedin.com/in/yourprofile</span>
            </a>
            <a href="https://github.com/Anixxxrudh" target="_blank" rel="noreferrer" className="contact-item">
              <span className="contact-label">GitHub</span>
              <span className="contact-value">github.com/Anixxxrudh</span>
            </a>
          </div>

          {/* RESUME */}
          <div className="resume-block">
            <p className="resume-intro">
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