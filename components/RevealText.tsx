"use client"
import { motion } from "framer-motion"
import { useRef } from "react"
import { useInView } from "framer-motion"

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const wordVar = {
  hidden: { opacity: 0, y: 52, filter: "blur(10px)" },
  show: (i: number) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { delay: i * 0.10, duration: 0.65, ease: EASE },
  }),
}

export default function RevealText({
  text, className, style,
}: { text: string; className?: string; style?: React.CSSProperties }) {
  const ref  = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })

  return (
    <div ref={ref} className={className} style={{ ...style, overflow: "hidden" }}>
      {text.split("\n").map((line, li) => (
        <div key={li} style={{ display: "flex", flexWrap: "wrap", gap: "0 0.22em", overflow: "hidden" }}>
          {line.split(" ").map((word, wi) => (
            <div key={wi} style={{ overflow: "hidden", display: "inline-block" }}>
              <motion.span
                custom={li * 4 + wi}
                variants={wordVar}
                initial="hidden"
                animate={inView ? "show" : "hidden"}
                style={{ display: "inline-block" }}
              >
                {word}
              </motion.span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
