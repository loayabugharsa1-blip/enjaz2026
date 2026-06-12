import { ReviewsCarousel } from "@/components/public/reviews-carousel";
import { ReviewFormWrapper } from "@/components/public/review-form-wrapper";

export default function ReviewsPage() {
  return (
    <div className="pt-8">
      <ReviewsCarousel />
      <div className="max-w-lg mx-auto px-4 pb-20">
        <ReviewFormWrapper />
      </div>
    </div>
  );
}
