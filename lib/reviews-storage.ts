import type { ReviewSubmission } from "@/types/common";
import { sanitize } from "@/lib/sanitize";

const STORAGE_KEY = "injaz_reviews";
const SEED_VERSION_KEY = "injaz_reviews_seed_version";
const SEED_VERSION = "1.0";
const RATE_LIMIT_KEY = "injaz_review_last_submit";
const RATE_LIMIT_MS = 30_000;

function checkRateLimit(): boolean {
  if (typeof window === "undefined") return true;
  const last = localStorage.getItem(RATE_LIMIT_KEY);
  if (last && Date.now() - Number(last) < RATE_LIMIT_MS) return false;
  localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
  return true;
}

function getAll(): ReviewSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("[reviews] Failed to parse reviews:", err);
    return [];
  }
}

function saveAll(reviews: ReviewSubmission[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export function getApprovedReviews(): ReviewSubmission[] {
  return getAll().filter((r) => r.isApproved);
}

export function getPendingReviews(): ReviewSubmission[] {
  return getAll().filter((r) => !r.isApproved);
}

export function getAllReviews(): ReviewSubmission[] {
  return getAll();
}

export function addReview(name: string, textAr: string, textEn: string, rating: number): ReviewSubmission | null {
  if (!checkRateLimit()) return null;
  let seeded = false;
  try { seeded = localStorage.getItem(SEED_VERSION_KEY) === SEED_VERSION; } catch {}
  if (seeded) {
    try { localStorage.removeItem(SEED_VERSION_KEY); } catch {}
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }
  const review: ReviewSubmission = {
    id: crypto.randomUUID(),
    name: sanitize(name),
    textAr: sanitize(textAr),
    textEn: sanitize(textEn),
    rating,
    isApproved: true,
    createdAt: new Date().toISOString(),
  };
  const all = seeded ? [] : getAll();
  all.unshift(review);
  saveAll(all);
  return review;
}

export function toggleApproval(id: string): ReviewSubmission | null {
  const all = getAll();
  const found = all.find((r) => r.id === id);
  if (!found) return null;
  found.isApproved = !found.isApproved;
  saveAll(all);
  return found;
}

export function deleteReview(id: string): boolean {
  const all = getAll();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  saveAll(all);
  return true;
}

export function seedSampleReviews(): void {
  let seeded = false;
  try { seeded = localStorage.getItem(SEED_VERSION_KEY) === SEED_VERSION; } catch {}
  const existing = getAll();
  if (existing.length > 0 || seeded) return;
  const samples: ReviewSubmission[] = [
    { id: crypto.randomUUID(), name: "أحمد الصالح", textAr: "تعاملت مع إنجاز لطباعة دروع تكريم للموظفين، الجودة كانت ممتازة والتسليم في الوقت المحدد. أنصح بالتعامل معهم.", textEn: "Dealt with Injaz for printing employee appreciation shields. Excellent quality and on-time delivery. Highly recommend.", rating: 5, isApproved: true, createdAt: "2026-05-15T10:00:00.000Z" },
    { id: crypto.randomUUID(), name: "سارة الحربي", textAr: "صمموا لنا هوية بصرية متكاملة للشركة، إبداع واحترافية في العمل. سعرة منافس جداً مقارنة بالجودة.", textEn: "They designed a complete visual identity for our company. Creative and professional work at very competitive prices.", rating: 5, isApproved: true, createdAt: "2026-04-20T10:00:00.000Z" },
    { id: crypto.randomUUID(), name: "محمد القحطاني", textAr: "طلبنا مطبوعات دعائية لمؤتمر، التصميم والطباعة كانوا رائعين. سرعة في التنفيذ وتعاون رائع.", textEn: "Ordered promotional prints for a conference. Amazing design and printing quality with fast delivery.", rating: 4, isApproved: true, createdAt: "2026-03-10T10:00:00.000Z" },
    { id: crypto.randomUUID(), name: "نورة الدوسري", textAr: "أكواب مخصصة للهدايا موظفين، الطبعة ثابتة وجودة السيراميك ممتازة. سعيدة جداً بالتعامل.", textEn: "Custom cups for employee gifts. Print is durable and ceramic quality is excellent. Very satisfied.", rating: 5, isApproved: true, createdAt: "2026-02-05T10:00:00.000Z" },
    { id: crypto.randomUUID(), name: "فهد العتيبي", textAr: "لافتة المحل نفذوها باحترافية، تركيب وتصميم رائع. تغيير كبير في شكل المحل. شكراً إنجاز.", textEn: "They executed the shop sign professionally with great design and installation. Transformed the shop's look.", rating: 5, isApproved: true, createdAt: "2026-01-18T10:00:00.000Z" },
  ];
  saveAll(samples);
  try { localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION); } catch {}
}
