import { Hero } from "@/components/public/hero";
import { ServicesGrid } from "@/components/public/services-grid";
import { PackagesList } from "@/components/public/packages-list";
import { PortfolioCarousel } from "@/components/public/portfolio-carousel";
import { ReviewsCarousel } from "@/components/public/reviews-carousel";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <PackagesList />
      <PortfolioCarousel />
      <ReviewsCarousel />
    </>
  );
}
