import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { verifyFallback } from "@/lib/fallback-cookie";

const SESSION_COOKIE = "injaz_session";
const CSRF_COOKIE = "injaz_csrf";
const CSRF_HEADER = "x-csrf-token";

const PUBLIC_PATHS = [
  "/auth/login",
  "/",
  "/services",
  "/packages",
  "/reviews",
  "/track",
  "/order",
];

const PUBLIC_API_GET = [
  "/api/services",
  "/api/track",
  "/api/ping",
  "/api/portfolio",
];

const PUBLIC_API_POST = [
  "/api/orders",
  "/api/auth/login",
];

const PROTECTED_PATHS = [
  "/dashboard",
  "/admin",
];

// Role-based API access:
//   admin → everything
//   employee → orders + customers (full CRUD)
//   staff → orders + customers (read-only GET)
const ADMIN_ONLY = [
  "/api/services",
  "/api/inventory",
  "/api/upload",
  "/api/portfolio",
  "/api/users/sync",
  "/api/orders/delete",
];
const EMPLOYEE_ACCESS = [
  ...ADMIN_ONLY,
  "/api/orders/create",
  "/api/orders/update",
  "/api/orders/status",
  "/api/orders/list",
  "/api/orders/stats",
  "/api/customers",
];
const STAFF_READONLY = [
  "/api/orders/list",
  "/api/orders/stats",
  "/api/customers",
];

const API_MUTATING = ["POST", "PUT", "DELETE", "PATCH"];

function matches(list: string[], pathname: string): boolean {
  return list.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

const FALLBACK_COOKIE = "injaz_fb";

async function getSession(request: NextRequest): Promise<{ role?: string } | null> {
  // 1. Try signed httpOnly cookie (set by API on success)
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (cookie) {
    try {
      const decoded = decodeURIComponent(cookie);
      const payload = await verifySession(decoded);
      if (payload) return JSON.parse(payload);
    } catch {
      // fall through to fallback
    }
  }

  // 2. Fallback: non-httpOnly cookie (signed, set by client when API unavailable)
  const fb = request.cookies.get(FALLBACK_COOKIE)?.value;
  if (fb) {
    try {
      const decoded = atob(fb);
      const payload = await verifyFallback(decoded);
      if (payload) return JSON.parse(payload);
    } catch {
      return null;
    }
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const session = await getSession(request);
  const isAuthenticated = !!session;

  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://*.supabase.co https://wa.me; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );

  if (matches(PROTECTED_PATHS, pathname)) {
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  }

  // CSRF token cookie for authenticated pages
  if (isAuthenticated && (pathname.startsWith("/api/") || matches(PROTECTED_PATHS, pathname))) {
    const existingToken = request.cookies.get(CSRF_COOKIE)?.value;
    if (!existingToken || existingToken.length < 16) {
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(36).padStart(2, "0"))
        .join("");
      response.cookies.set(CSRF_COOKIE, token, {
        path: "/",
        sameSite: "strict",
        secure: true,
        httpOnly: false,
        maxAge: 86400,
      });
    }
  }

  // 1. Public pages — no auth
  if (matches(PUBLIC_PATHS, pathname)) return response;

  // 2. Public POST APIs (exact match only — prevents /api/orders from leaking to sub-routes)
  if (method === "POST" && PUBLIC_API_POST.some((p) => pathname === p)) return response;

  // 3. Public GET APIs (service listing, tracking, ping)
  if (!API_MUTATING.includes(method) && matches(PUBLIC_API_GET, pathname)) return response;

  // 4. Protected pages — require login
  if (matches(PROTECTED_PATHS, pathname)) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // 5. ALL /api/ routes — role-based authorization
  if (pathname.startsWith("/api/")) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: "غير مصرح. يرجى تسجيل الدخول." }, { status: 401 });
    }

    // CSRF check for ALL mutating API calls (applies to admin + employee)
    if (API_MUTATING.includes(method) && !PUBLIC_API_POST.some((p) => pathname === p)) {
      const csrfCookie = request.cookies.get(CSRF_COOKIE)?.value;
      const csrfHeader = request.headers.get(CSRF_HEADER);
      if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        return NextResponse.json({ error: "طلب غير مصرح (CSRF)" }, { status: 403 });
      }
    }

    const role = session?.role || "";

    // Staff can only read (GET) specific endpoints
    if (role === "staff") {
      if (API_MUTATING.includes(method)) {
        return NextResponse.json({ error: "غير مصرح. حساب المشاهدة فقط." }, { status: 403 });
      }
      if (!matches(STAFF_READONLY, pathname)) {
        return NextResponse.json({ error: "غير مصرح. صلاحيات غير كافية." }, { status: 403 });
      }
      return response;
    }

    // Employee can access orders/customers but not admin-only
    if (role === "employee") {
      if (!matches(EMPLOYEE_ACCESS, pathname)) {
        return NextResponse.json({ error: "غير مصرح. صلاحيات غير كافية." }, { status: 403 });
      }
      // Employee cannot access admin-only resources (services, inventory, upload, etc.)
      if (matches(ADMIN_ONLY, pathname)) {
        return NextResponse.json({ error: "غير مصرح. صلاحيات المسؤول مطلوبة." }, { status: 403 });
      }
      return response;
    }

    // Admin can access everything
    if (role !== "admin") {
      return NextResponse.json({ error: "غير مصرح. صلاحية غير معروفة." }, { status: 403 });
    }

    return response;
  }

  // 6. Everything else (static assets, etc.) — allow
  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|images/|favicon.ico|icon-|og-image.png|manifest.webmanifest|robots.txt|sitemap.xml|sw.js).*)",
};
