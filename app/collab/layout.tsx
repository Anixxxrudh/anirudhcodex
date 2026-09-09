import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collab — The Anirudh Protocol",
  description:
    "Open to research partnerships, internships, and creative collaborations in physics, engineering, and technology.",
  openGraph: {
    title: "Collab — The Anirudh Protocol",
    description:
      "Open to research partnerships, internships, and creative collaborations in physics, engineering, and technology.",
    url: "https://theanirudhprotocol.vercel.app/collab",
  },
};

export default function CollabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
