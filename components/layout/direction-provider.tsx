"use client";
import { useEffect, type ReactNode } from "react";
import { getDirection } from "@/lib/utils/storage";

export function DirectionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const dir = getDirection();
    document.documentElement.dir = dir;
    document.documentElement.lang = dir === "rtl" ? "ar" : "en";
  }, []);

  return <>{children}</>;
}
