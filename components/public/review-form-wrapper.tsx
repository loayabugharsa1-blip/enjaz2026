"use client";
import dynamic from "next/dynamic";

const ReviewForm = dynamic(() => import("@/components/public/review-form").then((m) => ({ default: m.ReviewForm })), { ssr: false });

export function ReviewFormWrapper() {
  return <ReviewForm />;
}
