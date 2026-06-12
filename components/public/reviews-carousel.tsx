"use client";
import { useEffect, useState } from "react";
import { useDirection } from "@/hooks/use-direction";
import { getApprovedReviews, seedSampleReviews } from "@/lib/reviews-storage";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import type { ReviewSubmission } from "@/types/common";

export function ReviewsCarousel() {
  const { isRtl } = useDirection();
  const [reviews, setReviews] = useState<ReviewSubmission[]>([]);

  useEffect(() => {
    seedSampleReviews();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReviews(getApprovedReviews());
  }, []);

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">{isRtl ? "ماذا قال عملاؤنا" : "What Our Clients Say"}</h2>
        <p className="text-zinc-400 text-center mb-12 max-w-xl mx-auto">
          {isRtl ? "آراء العملاء تعكس التزامنا بالجودة والاحترافية" : "Client reviews reflect our commitment to quality and professionalism"}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className="flex flex-col">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-zinc-700"}`} />
                ))}
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed flex-1">&ldquo;{isRtl ? review.textAr : review.textEn}&rdquo;</p>
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-200">{review.name}</span>
                <span className="text-xs text-zinc-600">{new Date(review.createdAt).toLocaleDateString(isRtl ? "ar-SA" : "en-US")}</span>
              </div>
            </Card>
          ))}
        </div>
        {reviews.length === 0 && (
          <p className="text-zinc-500 text-center py-10">{isRtl ? "لا توجد تقييمات بعد" : "No reviews yet"}</p>
        )}
      </div>
    </section>
  );
}
