"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 p-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-zinc-100 mb-2">حدث خطأ غير متوقع</h2>
        <p className="text-zinc-500 mb-4 text-sm">Something went wrong</p>
        <Button onClick={reset}>إعادة المحاولة</Button>
      </div>
    </div>
  );
}
