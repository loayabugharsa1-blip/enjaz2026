"use client";
import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.debug("[PWA] SW registered"))
        .catch((err) => console.warn("[PWA] SW registration failed:", err));
    }
  }, []);
  return null;
}
