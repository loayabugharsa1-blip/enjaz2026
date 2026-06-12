"use client";
import { useState, useEffect, useCallback } from "react";
import { useDirection } from "@/hooks/use-direction";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Key, Trash2, Shield, UserCog } from "lucide-react";

interface ManagedUser {
  id: string;
  username: string;
  name: string;
  role: string;
  createdAt: string;
}

const ROLE_LABELS: Record<string, { ar: string; en: string }> = {
  admin: { ar: "مدير", en: "Admin" },
  employee: { ar: "موظف", en: "Employee" },
  staff: { ar: "موظف محدود", en: "Staff" },
};

export default function UsersPage() {
  const { isRtl } = useDirection();
  const { session } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const [newUsername, setNewUsername] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("employee");

  const [changePassUser, setChangePassUser] = useState("");
  const [changePassNew, setChangePassNew] = useState("");

  const showMsg = useCallback((msg: string, type: "success" | "error" = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  }, []);

  const loadUsers = useCallback(async () => {
    const { getAllUsers } = await import("@/lib/auth/storage");
    setUsers(getAllUsers());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, [loadUsers]);

  const handleAddUser = async () => {
    if (!newUsername?.trim() || !newName?.trim() || !newPassword?.trim()) {
      showMsg(isRtl ? "جميع الحقول مطلوبة" : "All fields required", "error");
      return;
    }
    const { addUser } = await import("@/lib/auth/storage");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ok = await addUser(newUsername.trim(), newPassword, newRole as any, newName.trim());
    if (!ok) {
      showMsg(isRtl ? "اسم المستخدم موجود مسبقاً" : "Username already exists", "error");
      return;
    }
    showMsg(isRtl ? "تم إضافة المستخدم" : "User added");
    setNewUsername("");
    setNewName("");
    setNewPassword("");
    loadUsers();
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm(isRtl ? "هل تريد حذف هذا المستخدم؟" : "Delete this user?")) return;
    const { deleteUser } = await import("@/lib/auth/storage");
    const ok = deleteUser(id);
    if (!ok) {
      showMsg(isRtl ? "لا يمكن حذف آخر مسؤول" : "Cannot delete last admin", "error");
      return;
    }
    showMsg(isRtl ? "تم حذف المستخدم" : "User deleted");
    loadUsers();
  };

  const handleAdminChangePassword = async () => {
    if (!changePassUser || !changePassNew?.trim()) {
      showMsg(isRtl ? "اختر مستخدم وأدخل كلمة مرور جديدة" : "Select user and enter new password", "error");
      return;
    }
    const { adminChangePassword } = await import("@/lib/auth/storage");
    const result = await adminChangePassword(changePassUser, changePassNew);
    if (!result.success) {
      showMsg(result.error || "فشل", "error");
      return;
    }
    showMsg(isRtl ? `تم تغيير كلمة مرور ${changePassUser}` : `${changePassUser} password changed`);
    setChangePassUser("");
    setChangePassNew("");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">{isRtl ? "إدارة المستخدمين" : "User Management"}</h1>

      {message && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${
          messageType === "success" ? "bg-green-900/30 text-green-400 border border-green-800" : "bg-red-900/30 text-red-400 border border-red-800"
        }`}>
          {message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-100 mb-4">
            <UserPlus className="w-5 h-5 text-green-400" />
            {isRtl ? "إضافة مستخدم جديد" : "Add New User"}
          </h2>
          <div className="space-y-3">
            <Input label={isRtl ? "اسم المستخدم" : "Username"} value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="admin" />
            <Input label={isRtl ? "الاسم الكامل" : "Full Name"} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={isRtl ? "مدير النظام" : "System Admin"} />
            <Input label={isRtl ? "كلمة المرور" : "Password"} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-zinc-400">{isRtl ? "الصلاحية" : "Role"}</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50">
                <option value="admin">{isRtl ? "مدير (كل الصلاحيات)" : "Admin (Full Access)"}</option>
                <option value="employee">{isRtl ? "موظف (طلبات + مخزن)" : "Employee (Orders + Inventory)"}</option>
                <option value="staff">{isRtl ? "موظف محدود (طلبات فقط)" : "Staff (Orders Only)"}</option>
              </select>
            </div>
            <Button onClick={handleAddUser} className="w-full">
              <UserPlus className="w-4 h-4 me-2" />
              {isRtl ? "إضافة" : "Add User"}
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-100 mb-4">
            <Key className="w-5 h-5 text-yellow-400" />
            {isRtl ? "تغيير كلمة مرور مستخدم" : "Change User Password"}
          </h2>
          <div className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-zinc-400">{isRtl ? "المستخدم" : "User"}</label>
              <select value={changePassUser} onChange={(e) => setChangePassUser(e.target.value)} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50">
                <option value="">{isRtl ? "-- اختر --" : "-- Select --"}</option>
                {users.map((u) => (
                  <option key={u.id} value={u.username}>{u.name} (@{u.username})</option>
                ))}
              </select>
            </div>
            <Input label={isRtl ? "كلمة المرور الجديدة" : "New Password"} type="password" value={changePassNew} onChange={(e) => setChangePassNew(e.target.value)} placeholder="••••••••" />
            <Button onClick={handleAdminChangePassword} className="w-full">
              <Key className="w-4 h-4 me-2" />
              {isRtl ? "تغيير كلمة المرور" : "Change Password"}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-100 mb-4">
          <UserCog className="w-5 h-5 text-blue-400" />
          {isRtl ? "المستخدمون الحاليون" : "Current Users"}
        </h2>
        <div className="space-y-2">
          {users.length === 0 && (
            <p className="text-zinc-500 text-center py-4">{isRtl ? "لا يوجد مستخدمون آخرون" : "No other users"}</p>
          )}
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className={`w-5 h-5 ${u.role === "admin" ? "text-red-400" : u.role === "employee" ? "text-blue-400" : "text-zinc-400"}`} />
                <div>
                  <p className="text-sm font-medium text-zinc-100">{u.name}</p>
                  <p className="text-xs text-zinc-500">@{u.username} — {ROLE_LABELS[u.role]?.[isRtl ? "ar" : "en"] || u.role}</p>
                </div>
              </div>
              {u.id !== session?.userId && (
                <button onClick={() => handleDeleteUser(u.id)} className="p-2 hover:bg-red-900/30 rounded-lg text-red-400 transition-colors" title={isRtl ? "حذف" : "Delete"}>
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
