"use client";
import Link from "next/link";
import Image from "next/image";
import { useDirection } from "@/hooks/use-direction";
import { usePathname } from "next/navigation";

const links = {
  ar: [
    { href: "/", label: "الرئيسية" },
    { href: "/services", label: "الخدمات" },
    { href: "/packages", label: "الباقات" },
    { href: "/order", label: "طلب أونلاين" },
    { href: "/track", label: "تتبع طلبك" },
    { href: "/reviews", label: "التقييمات" },
  ],
  en: [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/packages", label: "Packages" },
    { href: "/order", label: "Order Online" },
    { href: "/track", label: "Track Order" },
    { href: "/reviews", label: "Reviews" },
  ],
};

const FACEBOOK_URL = "https://www.facebook.com/enjazprinting2021.2022/";

export function Navbar() {
  const { toggleDirection, isRtl } = useDirection();
  const pathname = usePathname();
  const navLinks = isRtl ? links.ar : links.en;

  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 min-h-16 flex flex-wrap items-center justify-between gap-2 py-2">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-200/10 flex items-center justify-center p-1 ring-1 ring-white/10">
            <Image src="/logo.png" alt="Enjaz" width={36} height={36} className="object-contain" />
          </div>
          <span className="text-base sm:text-xl font-bold text-[#dc2626]">{isRtl ? "إنجاز للدعاية و الاعلان" : "Enjaz Advertising"}</span>
        </Link>

        <div className="flex items-center gap-1 flex-wrap" dir="ltr">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                pathname === link.href ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="p-1.5 sm:p-2 text-zinc-400 hover:text-[#1877F2] transition-colors" title="Facebook">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>

          <button onClick={toggleDirection} className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors" title={isRtl ? "English" : "العربية"}>
            {isRtl ? "EN" : "AR"}
          </button>

          <Link href="/auth/login" className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg text-xs sm:text-sm font-medium transition-colors">
            {isRtl ? "دخول" : "Login"}
          </Link>
        </div>
      </div>
    </nav>
  );
}
