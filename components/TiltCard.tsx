"use client"
import { useTilt } from "../hooks/useTilt"

type Props = {
  children: React.ReactNode
  className?: string
}

export default function TiltCard({ children, className = "" }: Props) {
  const { ref, onMouseMove, onMouseLeave } = useTilt<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={`tilt-card ${className}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  )
}
