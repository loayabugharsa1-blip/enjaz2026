import bcrypt from "bcryptjs";
import type { User, Session, Role } from "@/types/auth";
import { addAuditEntry } from "@/lib/audit";
const SALT_ROUNDS = 10;
const STORAGE_KEY = "injaz_users";
const SESSION_KEY = "injaz_session";
const SYNC_URL = "/api/users/sync";

function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("[auth/storage] Failed to parse users, resetting:", err);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export async function seedDefaultUsers(): Promise<void> {
  try {
    const users = getUsers();
    if (users.length > 0) return;
    const adminHash = await bcrypt.hash("admin123", SALT_ROUNDS);
    const employeeHash = await bcrypt.hash("employee123", SALT_ROUNDS);
    const staffHash = await bcrypt.hash("staff123", SALT_ROUNDS);
    const defaultUsers: User[] = [
      { id: crypto.randomUUID(), username: "admin", passwordHash: adminHash, role: "admin", name: "مدير النظام", createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), username: "employee", passwordHash: employeeHash, role: "employee", name: "موظف", createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), username: "staff", passwordHash: staffHash, role: "staff", name: "موظف عادي", createdAt: new Date().toISOString() },
    ];
    saveUsers(defaultUsers);
  } catch (err) {
    console.error("[auth/storage] seedDefaultUsers failed, forcing empty state:", err);
    localStorage.removeItem(STORAGE_KEY);
  }
}

export async function login(username: string, password: string): Promise<{ success: boolean; session?: Session; error?: string }> {
  // 1. Try server-side API (Supabase)
  try {
    const resp = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await resp.json();
    if (resp.ok && data.success && data.session) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.session));
      addAuditEntry("تسجيل دخول", data.session.userId, data.session.name, `دخول ${data.session.name} (@${data.session.username})`);
      return { success: true, session: data.session };
    }
  } catch (err) {
    console.warn("[login] Server API unavailable, falling back to localStorage:", err);
  }

  // 2. Fallback: localStorage auth (ensures zero lockout risk)
  const users = getUsers();
  const user = users.find((u) => u.username === username);
  if (!user) return { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" };

  const session: Session = { userId: user.id, username: user.username, role: user.role, name: user.name, loginAt: new Date().toISOString() };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

  const { signSession } = await import("@/lib/auth/session");
  const signed = await signSession(JSON.stringify(session));
  document.cookie = `injaz_session=${encodeURIComponent(signed)}; path=/; max-age=86400; SameSite=Lax; Secure`;

  addAuditEntry("تسجيل دخول", user.id, user.name, `دخول ${user.name} (@${user.username})`);
  return { success: true, session };
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
  document.cookie = `${SESSION_KEY}=; path=/; max-age=0; SameSite=Lax; Secure`;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("[auth/storage] Failed to parse session:", err);
    return null;
  }
}

async function trySyncToSupabase(): Promise<void> {
  try {
    const users = getUsers().map(({ passwordHash, ...rest }) => ({ ...rest, password_hash: passwordHash }));
    const res = await fetch(SYNC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users }),
    });
    if (!res.ok) console.warn("[trySyncToSupabase] Sync failed:", await res.text().catch(() => "unknown"));
  } catch (err) {
    console.warn("[trySyncToSupabase] Network error (offline?):", err);
  }
}

export async function addUser(username: string, password: string, role: Role, name: string): Promise<boolean> {
  const users = getUsers();
  if (users.find((u) => u.username === username)) return false;
  if (!["admin", "employee", "staff"].includes(role)) return false;
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  users.push({ id: crypto.randomUUID(), username, passwordHash: hash, role, name, createdAt: new Date().toISOString() });
  saveUsers(users);
  await trySyncToSupabase();
  const session = getSession();
  addAuditEntry("إضافة مستخدم", session?.userId || "system", session?.name || "system", `إضافة مستخدم ${name} (@${username}) بصلاحية ${role}`);
  return true;
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < 6) return { success: false, error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" };
  // Update localStorage first
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return { success: false, error: "المستخدم غير موجود" };
  users[idx].passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  saveUsers(users);
  // Then try Supabase sync (best-effort)
  try {
    await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: oldPassword, newPassword }),
    });
  } catch (err) {
    console.warn("[changePassword] Supabase sync failed:", err);
  }
  addAuditEntry("تغيير كلمة المرور", userId, users[idx]?.name || "", `تغيير كلمة مرور المستخدم`);
  return { success: true };
}

export async function adminChangePassword(username: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < 6) return { success: false, error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" };
  // Update localStorage first (always works)
  const users = getUsers();
  const idx = users.findIndex((u) => u.username === username);
  if (idx === -1) return { success: false, error: "المستخدم غير موجود" };
  users[idx].passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  saveUsers(users);
  // Then try syncing to Supabase (best-effort)
  try {
    await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUsername: username, newPassword }),
    });
  } catch (err) {
    console.warn("[adminChangePassword] Supabase sync failed:", err);
  }
  const session = getSession();
  addAuditEntry("تغيير كلمة مرور", session?.userId || "system", session?.name || "system", `تغيير كلمة مرور المستخدم ${username}`);
  return { success: true };
}

export function deleteUser(userId: string): boolean {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return false;
  if (users[idx].role === "admin" && users.filter((u) => u.role === "admin").length <= 1) return false;
  const deleted = users[idx];
  users.splice(idx, 1);
  saveUsers(users);
  trySyncToSupabase();
  const session = getSession();
  addAuditEntry("حذف مستخدم", session?.userId || "system", session?.name || "system", `حذف المستخدم ${deleted.name} (@${deleted.username})`);
  return true;
}

export function getAllUsers(): User[] {
  return getUsers().map((u) => ({ id: u.id, username: u.username, role: u.role, name: u.name, createdAt: u.createdAt, passwordHash: "" }));
}
