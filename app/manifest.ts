import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "إنجاز للدعاية و الاعلان | Enjaz Advertising",
    short_name: "إنجاز",
    description:
      "خدمات الطباعة والتصميم والدروع والأكواب المخصصة واللوحات الإعلانية",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#18181b",
    theme_color: "#dc2626",
    dir: "rtl",
    lang: "ar",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["business", "services", "advertising"],
  };
}
