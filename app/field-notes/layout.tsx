import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Field Notes — The Anirudh Protocol",
  description:
    "Writing on astrophysics, renewable energy research, and observations from the intersection of science and exploration.",
  openGraph: {
    title: "Field Notes — The Anirudh Protocol",
    description:
      "Writing on astrophysics, renewable energy research, and observations from the intersection of science and exploration.",
    url: "https://theanirudhprotocol.vercel.app/field-notes",
  },
};

export default function FieldNotesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
