"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDirection } from "@/hooks/use-direction";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Package, ClipboardList, Database, LogOut, LayoutDashboard, MessageSquare, DollarSign, Layers, UserCog, Key, X, Users, ImageIcon } from "lucide-react";

const ADMIN_ITEMS = {
  ar: [
    { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/dashboard/pos", label: "نقطة البيع", icon: ShoppingCart },
    { href: "/dashboard/inventory", label: "المخزن", icon: Package },
    { href: "/dashboard/services", label: "الخدمات والأصناف", icon: Layers },
    { href: "/dashboard/portfolio", label: "معرض الأعمال", icon: ImageIcon },
    { href: "/dashboard/orders", label: "الطلبات", icon: ClipboardList },
    { href: "/dashboard/customers", label: "العملاء", icon: Users },
    { href: "/dashboard/pricing", label: "أسعار الخدمات", icon: DollarSign },
    { href: "/dashboard/comments", label: "التعليقات", icon: MessageSquare },
    { href: "/dashboard/users", label: "المستخدمين", icon: UserCog },
    { href: "/dashboard/backup", label: "النسخ الاحتياطي", icon: Database },
    { href: "/dashboard/audit", label: "سجل الحركات", icon: ClipboardList },
  ],
  en: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/pos", label: "POS", icon: ShoppingCart },
    { href: "/dashboard/inventory", label: "Inventory", icon: Package },
    { href: "/dashboard/services", label: "Services & Categories", icon: Layers },
    { href: "/dashboard/portfolio", label: "Portfolio", icon: ImageIcon },
    { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
    { href: "/dashboard/customers", label: "Customers", icon: Users },
    { href: "/dashboard/pricing", label: "Pricing", icon: DollarSign },
    { href: "/dashboard/comments", label: "Comments", icon: MessageSquare },
    { href: "/dashboard/users", label: "Users", icon: UserCog },
    { href: "/dashboard/backup", label: "Backup", icon: Database },
    { href: "/dashboard/audit", label: "Audit Log", icon: ClipboardList },
  ],
};

const STAFF_ITEMS = {
  ar: [
    { href: "/dashboard/orders", label: "الطلبات", icon: ClipboardList },
  ],
  en: [
    { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  ],
};

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { isRtl } = useDirection();
  const { isStaff, logout, session } = useAuth();
  const items = isStaff ? STAFF_ITEMS : ADMIN_ITEMS;
  const navItems = isRtl ? items.ar : items.en;
  const [showPassModal, setShowPassModal] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passMsg, setPassMsg] = useState("");

  const handleChangePassword = async () => {
    setPassMsg("");
    if (!newPass || newPass.length < 6) { setPassMsg(isRtl ? "6 أحرف على الأقل" : "Min 6 characters"); return; }
    if (newPass !== confirmPass) { setPassMsg(isRtl ? "كلمات المرور غير متطابقة" : "Passwords don't match"); return; }
    const { changePassword } = await import("@/lib/auth/storage");
    const result = await changePassword(session?.userId || "", oldPass, newPass);
    if (!result.success) { setPassMsg(result.error || "فشل"); return; }
    setShowPassModal(false);
    setOldPass(""); setNewPass(""); setConfirmPass("");
  };

  return (
    <aside className="fixed top-0 start-0 bottom-0 w-56 bg-zinc-950 border-e border-zinc-800 z-30 pt-16 flex flex-col">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-lg font-bold text-[#dc2626]">{isRtl ? "إنجاز" : "Enjaz"}</span>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t border-zinc-800 space-y-1">
        <button onClick={() => setShowPassModal(true)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 w-full transition-colors">
          <Key className="w-4 h-4" />
          {isRtl ? "تغيير كلمة المرور" : "Change Password"}
        </button>
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-zinc-800 w-full transition-colors">
          <LogOut className="w-4 h-4" />
          {isRtl ? "خروج" : "Logout"}
        </button>
      </div>

      {showPassModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowPassModal(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-100">{isRtl ? "تغيير كلمة المرور" : "Change Password"}</h3>
              <button onClick={() => setShowPassModal(false)} className="p-1 hover:bg-zinc-800 rounded"><X className="w-4 h-4 text-zinc-400" /></button>
            </div>
            <div className="space-y-3">
              <Input label={isRtl ? "كلمة المرور الحالية" : "Current Password"} type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} />
              <Input label={isRtl ? "كلمة المرور الجديدة" : "New Password"} type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
              <Input label={isRtl ? "تأكيد كلمة المرور" : "Confirm Password"} type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
              {passMsg && <p className="text-sm text-red-400">{passMsg}</p>}
              <Button onClick={handleChangePassword} className="w-full">{isRtl ? "حفظ" : "Save"}</Button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
