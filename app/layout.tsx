import type { Metadata, Viewport } from "next";
import { Inter, Cairo } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { DirectionProvider } from "@/components/layout/direction-provider";
import { PWARegister } from "@/components/pwa-register";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cairo = Cairo({ subsets: ["arabic"], variable: "--font-cairo" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#18181b",
};

const SITE_URL = "https://injaz-phi.vercel.app";
const SITE_NAME_AR = "إنجاز للدعاية و الاعلان";
const SITE_NAME_EN = "Enjaz Advertising";
const SITE_DESC_AR = "متخصصون في الطباعة والتصميم والدروع والأكواب المخصصة واللوحات الإعلانية منذ 2021، بالإضافة إلى تصميم مواقع الويب ومنظومات المبيعات الاحترافية.";
const SITE_DESC_EN = "Specialists in printing, design, custom shields, cups, and billboards since 2021, plus web & POS system development.";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME_AR} | ${SITE_NAME_EN}`,
    template: `%s | ${SITE_NAME_EN}`,
  },
  description: SITE_DESC_AR,
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/icon.png",
    apple: { url: "/icon.png", sizes: "180x180", type: "image/png" },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "إنجاز",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    locale: "ar_AR",
    alternateLocale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME_EN,
    title: `${SITE_NAME_AR} | ${SITE_NAME_EN}`,
    description: SITE_DESC_AR,
    images: [{ url: "/og-image.png", width: 1200, height: 630, type: "image/png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME_AR} | ${SITE_NAME_EN}`,
    description: SITE_DESC_EN,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: {
    google: "drFaRVkxCdoBjVNkS6CDH9b0AtNCX5rDw31nbK8Mz8A",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "إنجاز",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html dir="rtl" lang="ar" className={`${inter.variable} ${cairo.variable}`}>
      <body className="min-h-screen bg-zinc-900 text-zinc-100 font-sans antialiased">
        <PWARegister />
        <DirectionProvider>{children}</DirectionProvider>
        <Script id="schema-localbusiness" type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "إنجاز للدعاية و الاعلان | Enjaz Advertising",
            description: SITE_DESC_AR,
            url: SITE_URL,
            telephone: "+218910884726",
            email: "enjazprinting2021@gmail.com",
            address: { "@type": "PostalAddress", addressLocality: "سرت", addressCountry: "LY" },
            foundingDate: "2021",
            sameAs: [
              "https://www.facebook.com/enjazprinting2021.2022/",
              "https://www.instagram.com/abugharsa97/",
            ],
          }),
        }} />
      </body>
    </html>
  );
}
