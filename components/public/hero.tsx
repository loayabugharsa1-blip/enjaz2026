"use client";
import { useDirection } from "@/hooks/use-direction";
import Link from "next/link";
import { WHATSAPP_NUMBER } from "@/lib/config";

const WHATSAPP_MSG = "مرحباً شركة إنجاز، أريد طلب الخدمة والاستفسار عن تفاصيل الباقة";

export function Hero() {
  const { isRtl } = useDirection();
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`;

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#dc2626]/10 via-transparent to-zinc-900 pointer-events-none" />
      <div className="relative z-10 text-center max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          <span className="text-[#dc2626]">{isRtl ? "إنجاز" : "Enjaz"}</span>
          <br />
          {isRtl ? "للدعاية و الاعلان والطباعة" : "for Advertising & Printing"}
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed max-w-2xl mx-auto">
          {isRtl
            ? "متخصصون في الطباعة والتصميم والدروع والأكواب المخصصة واللوحات الإعلانية منذ 2021، بالإضافة إلى تصميم مواقع الويب ومنظومات المبيعات الاحترافية."
            : "Specialists in printing, design, custom shields, cups, and billboards since 2021, in addition to website and POS system development."}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/services" className="px-8 py-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg font-medium transition-colors">
            {isRtl ? "تصفح الخدمات" : "Browse Services"}
          </Link>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            {isRtl ? "احجز باقتك" : "Book Your Pack"}
          </a>
        </div>
      </div>
    </section>
  );
}
