import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://prompt.seguimiento360.com";
  return [{ url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }, { url: `${base}/ayuda`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 }];
}
