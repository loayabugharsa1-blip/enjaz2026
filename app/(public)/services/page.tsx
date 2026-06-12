import { ServicesGrid } from "@/components/public/services-grid";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ServicesPage() {
  return (
    <div className="pt-8">
      <ServicesGrid />
    </div>
  );
}
