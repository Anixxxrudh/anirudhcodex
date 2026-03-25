"use client"

import { useState, useEffect, useRef } from "react"
import BackgroundCanvas from "../components/BackgroundCanvas"
import Navbar from "../components/Navbar"

export default function Page() {
  // ✅ FIX: default is now HOME
  const [mode, setMode] = useState("home")

  const homeRef = useRef(null)
  const physicsRef = useRef(null)
  const musicRef = useRef(null)
  const climbingRef = useRef(null)

  // 🔥 SCROLL → MODE DETECTION
  useEffect(() => {
    const sections = [
      { ref: homeRef, mode: "home" },
      { ref: physicsRef, mode: "physics" },
      { ref: musicRef, mode: "music" },
      { ref: climbingRef, mode: "climbing" },
    ]

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const found = sections.find(
              (s) => s.ref.current === entry.target
            )
            if (found) setMode(found.mode)
          }
        })
      },
      { threshold: 0.5 } // ✅ smoother detection
    )

    sections.forEach((s) => {
      if (s.ref.current) observer.observe(s.ref.current)
    })

    return () => observer.disconnect()
  }, [])

  // ✅ scroll function (for navbar)
  const scrollToSection = (section: string) => {
    const map: any = {
      home: homeRef,
      physics: physicsRef,
      music: musicRef,
      climbing: climbingRef,
    }

    map[section]?.current?.scrollIntoView({
      behavior: "smooth",
    })
  }

  return (
    <><section id="home" className="home-section">
    <h1 className="name">ANIRUDH MENON</h1>
  
    <div className="intro-container">
      <div className="crawl">
        <p>
          A physics-driven creator exploring the universe through
          astrophysics, photovoltaics, and technology.
        </p>
  
        <p>
          From solar cell research to rock climbing and music,
          I build, explore, and push boundaries.
        </p>
  
        <p>
          This is my journey.
        </p>
      </div>
    </div>
  </section>
      {/* 🌌 BACKGROUND */}
      <BackgroundCanvas mode={mode} />

      {/* 🔝 NAVBAR */}
      <Navbar
        setMode={setMode}
        mode={mode}
        scrollToSection={scrollToSection}
      />

      {/* 📄 CONTENT */}
      <main className="text-white relative z-10">

        {/* 🏠 HOME */}
        <section
  ref={homeRef}
  className="min-h-screen flex flex-col justify-center items-center text-center px-4"
>
<h1 className="text-6xl font-bold tracking-wide drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
            ANIRUDH CODEX
          </h1>
          <p className="mt-4 text-lg opacity-70">
            Astrophysics • Photovoltaics • Climbing • Music
          </p>
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

      </main>
    </>
  )
}