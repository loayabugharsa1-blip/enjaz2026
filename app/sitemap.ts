import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://injaz-phi.vercel.app";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/packages`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/order`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/track`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/reviews`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}
