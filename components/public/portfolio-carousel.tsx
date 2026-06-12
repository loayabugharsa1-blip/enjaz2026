"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useDirection } from "@/hooks/use-direction";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { fetchPortfolio } from "@/lib/portfolio-db";
import type { PortfolioItem } from "@/types/common";

export function PortfolioCarousel() {
  const { isRtl } = useDirection();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(0);

  useEffect(() => {
    fetchPortfolio().then((data) => {
      setItems(data || []);
      setLoading(false);
    });
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length === 0) return;
    intervalRef.current = window.setInterval(next, 4000);
    return () => window.clearInterval(intervalRef.current);
  }, [next, items.length]);

  const goTo = useCallback((i: number) => {
    setCurrent(i);
    window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(next, 4000);
  }, [next]);

  if (loading) return null;
  if (items.length === 0) return null;

  const item = items[current];

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">{isRtl ? "معرض أعمالنا" : "Our Portfolio"}</h2>
        <p className="text-zinc-400 text-center mb-12 max-w-xl mx-auto">
          {isRtl ? "نفخر بتقديم مجموعة من أعمالنا المميزة" : "We proudly present a selection of our distinguished work"}
        </p>

        <div className="relative max-w-4xl mx-auto group">
          <div
            className="relative aspect-video rounded-xl overflow-hidden cursor-pointer bg-zinc-800"
            onClick={() => setLightbox(current)}
          >
            <Image
              src={item.src}
              alt={isRtl ? item.altAr : item.altEn}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-6">
              <h3 className="text-xl font-bold text-white">{isRtl ? item.altAr : item.altEn}</h3>
            </div>
          </div>

          <button onClick={prev} className="absolute start-4 top-1/2 -translate-y-1/2 p-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={next} className="absolute end-4 top-1/2 -translate-y-1/2 p-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="flex justify-center gap-2 mt-6">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? "bg-[#dc2626] w-6" : "bg-zinc-600 hover:bg-zinc-500"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {lightbox !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-4 end-4 p-2 text-white/80 hover:text-white transition-colors">
            <X className="w-8 h-8" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + items.length) % items.length); }} className="absolute start-4 top-1/2 -translate-y-1/2 p-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="relative w-[90vw] h-[85vh]">
            <Image
              src={items[lightbox].src}
              alt={isRtl ? items[lightbox].altAr : items[lightbox].altEn}
              fill
              className="object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <button onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % items.length); }} className="absolute end-4 top-1/2 -translate-y-1/2 p-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-full transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-6 text-white/70 text-sm">
            {lightbox + 1} / {items.length}
          </div>
        </div>
      )}
    </section>
  );
}
