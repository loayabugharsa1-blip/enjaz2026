"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Menu } from "lucide-react";

const STAFF_ONLY = ["/dashboard/orders"];
const ADMIN_ONLY = ["/dashboard/pricing", "/dashboard/comments", "/dashboard/services", "/dashboard/users", "/dashboard/audit"];

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, isAdmin, isStaff } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!session) {
      router.replace("/auth/login");
      return;
    }
    if (isStaff && !STAFF_ONLY.includes(pathname)) {
      router.replace("/dashboard/orders");
    }
    if (!isAdmin && ADMIN_ONLY.includes(pathname)) {
      router.replace("/dashboard/orders");
    }
  }, [session, isAdmin, isStaff, pathname, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: close sidebar on route change
    setMobileOpen(false);
  }, [pathname]);

  if (!session) return null;

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 start-3 z-40 md:hidden p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      {/* Sidebar */}
      <div className={`no-print fixed inset-y-0 start-0 z-30 transform transition-transform duration-200 md:relative md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar onClose={() => setMobileOpen(false)} />
      </div>
      <main className="md:ps-56 pt-16 min-h-screen">
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}
