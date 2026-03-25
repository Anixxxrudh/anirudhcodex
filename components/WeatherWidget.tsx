"use client"

import { useEffect, useState } from "react"

type WeatherInfo = { label: string; dot: string }

const CODE_MAP: Record<number, WeatherInfo> = {
  0:  { label: "Clear Sky",     dot: "#ffd700" },
  1:  { label: "Partly Cloudy", dot: "rgba(255,255,255,0.5)" },
  2:  { label: "Partly Cloudy", dot: "rgba(255,255,255,0.5)" },
  3:  { label: "Partly Cloudy", dot: "rgba(255,255,255,0.5)" },
  45: { label: "Foggy",         dot: "rgba(255,255,255,0.3)" },
  48: { label: "Foggy",         dot: "rgba(255,255,255,0.3)" },
  51: { label: "Drizzle",       dot: "#4db8ff" },
  53: { label: "Drizzle",       dot: "#4db8ff" },
  55: { label: "Drizzle",       dot: "#4db8ff" },
  61: { label: "Rain",          dot: "#4db8ff" },
  63: { label: "Rain",          dot: "#4db8ff" },
  65: { label: "Rain",          dot: "#4db8ff" },
  71: { label: "Snow",          dot: "#fff" },
  73: { label: "Snow",          dot: "#fff" },
  75: { label: "Snow",          dot: "#fff" },
  80: { label: "Showers",       dot: "#4db8ff" },
  81: { label: "Showers",       dot: "#4db8ff" },
  82: { label: "Showers",       dot: "#4db8ff" },
  95: { label: "Thunderstorm",  dot: "#ffd700" },
}

export default function WeatherWidget() {
  const [data, setData] = useState<{ temp: number; code: number } | null>(null)

  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=41.6639&longitude=-83.5552&current=temperature_2m,weathercode&temperature_unit=fahrenheit"
    )
      .then((r) => r.json())
      .then((d) => {
        setData({
          temp: Math.round(d.current.temperature_2m),
          code: d.current.weathercode,
        })
      })
      .catch(() => {}) // silently fail — show nothing on error
  }, [])

  if (!data) return null

  const info: WeatherInfo = CODE_MAP[data.code] ?? { label: "Overcast", dot: "rgba(255,255,255,0.3)" }

  return (
    <div className="weather-widget">
      <span className="weather-dot" style={{ background: info.dot }} />
      Toledo, OH — {data.temp}°F — {info.label}
    </div>
  )
}
