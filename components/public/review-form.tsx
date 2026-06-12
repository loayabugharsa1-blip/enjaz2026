"use client";
import { useState } from "react";
import { useDirection } from "@/hooks/use-direction";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { addReview } from "@/lib/reviews-storage";

export function ReviewForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const { isRtl } = useDirection();
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    addReview(name.trim(), text.trim(), text.trim(), rating);
    setName("");
    setText("");
    setRating(5);
    setSubmitted(true);
    onSubmitted?.();
  };

  if (submitted) {
    return (
      <Card className="text-center py-8">
        <div className="text-4xl mb-3">✅</div>
        <p className="text-zinc-100 font-medium text-lg mb-1">
          {isRtl ? "شكراً لك!" : "Thank you!"}
        </p>
        <p className="text-zinc-400 text-sm">
          {isRtl ? "تم إرسال تقييمك وسيظهر بعد مراجعة الإدارة" : "Your review has been submitted and will appear after admin approval"}
        </p>
        <Button variant="secondary" className="mt-4" onClick={() => setSubmitted(false)}>
          {isRtl ? "إضافة تقييم آخر" : "Add another review"}
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-xl font-semibold text-zinc-100 mb-1">
        {isRtl ? "أضف تقييمك" : "Add Your Review"}
      </h3>
      <p className="text-sm text-zinc-500 mb-6">
        {isRtl ? "شاركنا تجربتك مع خدماتنا" : "Share your experience with our services"}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            {isRtl ? "الاسم" : "Name"}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            placeholder={isRtl ? "اكتب اسمك" : "Enter your name"}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            {isRtl ? "التقييم" : "Rating"}
          </label>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                className="p-1"
              >
                <Star
                  className={`w-6 h-6 ${
                    i < rating ? "text-yellow-500 fill-yellow-500" : "text-zinc-700"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            {isRtl ? "التعليق" : "Comment"}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            rows={4}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 resize-none"
            placeholder={isRtl ? "اكتب تقييمك..." : "Write your review..."}
          />
        </div>
        <Button type="submit" className="w-full">
          {isRtl ? "إرسال التقييم" : "Submit Review"}
        </Button>
      </form>
    </Card>
  );
}
