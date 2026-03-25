"use client"
import { useEffect, useState } from "react"

export default function EasterEgg() {
  const [show, setShow]       = useState(false)
  const [count, setCount]     = useState(0)
  const [glitch, setGlitch]   = useState(false)
  const [typed, setTyped]     = useState("")

  useEffect(() => {
    const target = "protocol"
    const onKey = (e: KeyboardEvent) => {
      const next = (typed + e.key).slice(-target.length)
      setTyped(next)
      if (next === target) {
        setTyped("")
        setGlitch(true)
        setTimeout(() => {
          setGlitch(false)
          setShow(true)
          setCount(c => c + 1)
        }, 600)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [typed])

  if (!show) return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9998 }}>
      {glitch && <div className="glitch-overlay" />}
    </div>
  )

  return (
    <>
      {glitch && <div className="glitch-overlay" />}
      <div className="easter-overlay" onClick={() => setShow(false)}>
        <div className="easter-box">
          {count <= 1 ? (
            <>
              <div className="easter-status">ACCESS GRANTED</div>
              <h2 className="easter-title">Welcome, Operator.</h2>
              <p className="easter-body">You've discovered the hidden layer.</p>
              <div className="easter-list">
                <div className="easter-item">— Building systems</div>
                <div className="easter-item">— Breaking limits</div>
                <div className="easter-item">— Not finished yet</div>
              </div>
              <span className="easter-close">[ click anywhere to close ]</span>
            </>
          ) : (
            <>
              <h2 className="easter-title">Bro how did you even find this 💀</h2>
              <p className="easter-body">Go back to the homepage.</p>
              <span className="easter-close">[ click anywhere to close ]</span>
            </>
          )}
        </div>
      </div>
    </>
  )
}