"use client";
import { useState, useCallback } from "react";
import { getDirection, setDirection as setDir } from "@/lib/utils/storage";

export function useDirection() {
  const [dir, setDirState] = useState<"rtl" | "ltr">(() => getDirection());

  const toggleDirection = useCallback(() => {
    const next = dir === "rtl" ? "ltr" : "rtl";
    setDir(next);
    setDirState(next);
  }, [dir]);

  return { dir, toggleDirection, isRtl: dir === "rtl" };
}
