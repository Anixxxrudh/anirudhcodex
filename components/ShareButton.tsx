"use client"

import { useState } from "react"

const SHARE_URL = "https://theanirudhprotocol.com"

export default function ShareButton() {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (typeof navigator === "undefined") return
    try {
      if (navigator.share) {
        await navigator.share({
          title: "THE ANIRUDH PROTOCOL",
          text: "Check out Anirudh Menon's portfolio",
          url: SHARE_URL,
        })
      } else {
        await navigator.clipboard.writeText(SHARE_URL)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // User cancelled share or clipboard failed — ignore
    }
  }

  return (
    <button
      className="share-btn"
      onClick={handleShare}
      aria-label="Share this site"
    >
      {copied && <span className="share-tooltip">LINK COPIED</span>}
      ↗
    </button>
  )
}
