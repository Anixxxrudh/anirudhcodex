import type { Metadata } from "next";
import { Orbitron, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "The Anirudh Protocol — Physics, Energy, and Creative Systems",
  description:
    "A cinematic portfolio exploring astrophysics, renewable energy research, music, and outdoor exploration.",
  openGraph: {
    title: "The Anirudh Protocol — Physics, Energy, and Creative Systems",
    description:
      "A cinematic portfolio exploring astrophysics, renewable energy research, music, and outdoor exploration.",
    url: "https://anirudhcodex.vercel.app",
    siteName: "The Anirudh Protocol",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Anirudh Protocol — Physics, Energy, and Creative Systems",
    description:
      "A cinematic portfolio exploring astrophysics, renewable energy research, music, and outdoor exploration.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div aria-hidden="true" className="noise-overlay" />
{children}
        <Analytics />
      </body>
    </html>
  );
}