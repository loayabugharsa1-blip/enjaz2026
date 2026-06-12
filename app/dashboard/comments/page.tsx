"use client";
import { useEffect, useState, useCallback } from "react";
import { useDirection } from "@/hooks/use-direction";
import { useAuth } from "@/hooks/use-auth";
import { getAllReviews, toggleApproval, deleteReview } from "@/lib/reviews-storage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Check, X, Trash2 } from "lucide-react";
import type { ReviewSubmission } from "@/types/common";

export default function CommentsPage() {
  const { isRtl } = useDirection();
  const { isAdmin } = useAuth();
  const [reviews, setReviews] = useState<ReviewSubmission[]>([]);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");

  const load = useCallback(() => {
    try {
      setReviews(getAllReviews());
    } catch (err) {
      console.warn("[comments] Failed to load reviews:", err);
      setReviews([]);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const handleToggle = useCallback((id: string) => {
    toggleApproval(id);
    load();
  }, [load]);

  const handleDelete = useCallback((id: string) => {
    if (!isRtl) {
      if (!confirm("Are you sure you want to delete this review?")) return;
    } else {
      if (!confirm("هل أنت متأكد من حذف هذا التعليق؟")) return;
    }
    deleteReview(id);
    load();
  }, [load, isRtl]);

  const filtered = reviews.filter((r) => {
    if (filter === "approved") return r.isApproved;
    if (filter === "pending") return !r.isApproved;
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-100 mb-2">
        {isRtl ? "إدارة التعليقات" : "Comments Moderation"}
      </h1>
      <p className="text-zinc-500 text-sm mb-6">
        {isRtl ? "مراجعة وقبول أو رفض تعليقات الزوار" : "Review, approve or reject visitor comments"}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "approved", "pending"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? "bg-[#dc2626] text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {isRtl
              ? (f === "all" ? "الكل" : f === "approved" ? "مقبول" : "معلق")
              : (f === "all" ? "All" : f === "approved" ? "Approved" : "Pending")}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((review) => (
          <Card key={review.id}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-medium text-zinc-100">{review.name}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-zinc-700"}`} />
                    ))}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    review.isApproved
                      ? "border-green-700 text-green-400"
                      : "border-yellow-700 text-yellow-400"
                  }`}>
                    {review.isApproved
                      ? (isRtl ? "مقبول" : "Approved")
                      : (isRtl ? "معلق" : "Pending")}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">&ldquo;{isRtl ? review.textAr : review.textEn}&rdquo;</p>
                <p className="text-xs text-zinc-600 mt-2">
                  {new Date(review.createdAt).toLocaleDateString(isRtl ? "ar-SA" : "en-US")}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handleToggle(review.id)}
                  className={review.isApproved ? "text-yellow-400" : "text-green-400"}
                >
                  {review.isApproved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  {review.isApproved
                    ? (isRtl ? "رفض" : "Reject")
                    : (isRtl ? "قبول" : "Approve")}
                </Button>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 hover:bg-red-900/50 rounded-lg text-red-400 transition-colors"
                    title={isRtl ? "حذف" : "Delete"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-zinc-500 text-center py-10">{isRtl ? "لا توجد تعليقات" : "No comments found"}</p>
        )}
      </div>
    </div>
  );
}
