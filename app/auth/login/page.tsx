"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDirection } from "@/hooks/use-direction";
import { login, seedDefaultUsers, getSession } from "@/lib/auth/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const { isRtl } = useDirection();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(true);

  useEffect(() => {
    const fallback = setTimeout(() => setSeeding(false), 3000);
    seedDefaultUsers().then(() => {
      clearTimeout(fallback);
      setSeeding(false);
      const session = getSession();
      if (session) router.replace("/dashboard");
    }).catch(() => {
      clearTimeout(fallback);
      setSeeding(false);
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      router.replace("/dashboard");
    } else {
      setError(result.error || "فشل تسجيل الدخول");
    }
  };

  if (seeding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <div className="text-zinc-500">{isRtl ? "جاري التحميل..." : "Loading..."}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#dc2626]">{isRtl ? "إنجاز" : "Enjaz"}</h1>
          <p className="text-zinc-500 text-sm mt-2">{isRtl ? "تسجيل الدخول إلى النظام" : "Login to dashboard"}</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-900/20 border border-red-800 text-red-300 text-sm rounded-lg p-3">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <Input
              id="username"
              label={isRtl ? "اسم المستخدم" : "Username"}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isRtl ? "أدخل اسم المستخدم" : "Enter username"}
              required
              autoFocus
            />
            <Input
              id="password"
              label={isRtl ? "كلمة المرور" : "Password"}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (isRtl ? "جاري تسجيل الدخول..." : "Logging in...") : (isRtl ? "تسجيل الدخول" : "Login")}
            </Button>
          </form>
        </Card>
        <p className="text-center text-xs text-zinc-600 mt-4">
          {isRtl ? "للتجربة: admin / employee" : "Demo: admin / employee"}
        </p>
      </div>
    </div>
  );
}
