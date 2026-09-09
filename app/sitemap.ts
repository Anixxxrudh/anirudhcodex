import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://theanirudhprotocol.vercel.app";

  const hobbies = ["climbing", "guitar", "djing", "badminton", "hiking", "art"];

  return [
    { url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/collab`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/field-notes`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...hobbies.map((h) => ({
      url: `${base}/hobbies/${h}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
