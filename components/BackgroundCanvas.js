"use client"
import { useEffect, useRef } from "react"

export default function BackgroundCanvas({ mode }) {
  const canvasRef = useRef(null)
  const modeRef = useRef(mode)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    let width = window.innerWidth
    let height = window.innerHeight

    canvas.width = width
    canvas.height = height

    // 🌌 TRANSITION VALUES
    let currentSpeed = [0.1, 0.3, 0.6]
    let targetSpeed = [...currentSpeed]

    const configs = {
      home: [0.02, 0.05, 0.1], // ✅ added
      physics: [0.05, 0.2, 0.4],
      music: [0.2, 0.5, 0.8],
      climbing: [0.03, 0.1, 0.2],
    }

    const stars = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2,
    }))

    function animate() {
      // smooth interpolation
      const target = configs[modeRef.current] || configs.home
      currentSpeed = currentSpeed.map(
        (s, i) => s + (target[i] - s) * 0.02
      )

      ctx.fillStyle = "rgba(0,0,0,0.2)"
      ctx.fillRect(0, 0, width, height)

      stars.forEach((star, i) => {
        const layer = i % 3
        star.y += currentSpeed[layer] * 2

        if (star.y > height) star.y = 0

        ctx.fillStyle = "white"
        ctx.fillRect(star.x, star.y, star.size, star.size)
      })

      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
      }}
    />
  )
}