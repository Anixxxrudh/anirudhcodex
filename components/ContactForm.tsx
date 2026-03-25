"use client"
import { useRef, useState } from "react"
import emailjs from "@emailjs/browser"

export default function ContactForm() {
  const formRef                   = useRef<HTMLFormElement>(null)
  const [status, setStatus]       = useState<"idle"|"sending"|"ok"|"err">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formRef.current) return
    setStatus("sending")
    try {
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID  ?? "",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
        formRef.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY  ?? "",
      )
      setStatus("ok")
      formRef.current.reset()
    } catch {
      setStatus("err")
    }
  }

  return (
    <form ref={formRef} className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form-row">
        <div className="contact-form-field">
          <label className="contact-form-label">Name</label>
          <input
            className="contact-form-input"
            type="text"
            name="from_name"
            placeholder="Your name"
            required
          />
        </div>
        <div className="contact-form-field">
          <label className="contact-form-label">Email</label>
          <input
            className="contact-form-input"
            type="email"
            name="reply_to"
            placeholder="your@email.com"
            required
          />
        </div>
      </div>
      <div className="contact-form-field">
        <label className="contact-form-label">Message</label>
        <textarea
          className="contact-form-input contact-form-textarea"
          name="message"
          placeholder="What's on your mind?"
          rows={5}
          required
        />
      </div>

      <div className="contact-form-footer">
        <button
          type="submit"
          className="resume-btn"
          disabled={status === "sending"}
          style={{ cursor: status === "sending" ? "wait" : undefined }}
        >
          {status === "sending" ? "Sending..." : "Send Message"}
        </button>

        {status === "ok"  && <p className="contact-form-msg contact-form-msg--ok">Message sent. I&apos;ll respond soon.</p>}
        {status === "err" && <p className="contact-form-msg contact-form-msg--err">Something went wrong. Try emailing directly.</p>}
      </div>
    </form>
  )
}
