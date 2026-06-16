import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth/session";

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

const ADMIN_API_PREFIXES = [
  "/api/services",
  "/api/inventory",
  "/api/upload",
  "/api/portfolio",
  "/api/users/sync",
  "/api/orders/delete",
  "/api/orders/update",
  "/api/orders/status",
  "/api/orders/list",
  "/api/orders/stats",
  "/api/orders/create",
  "/api/customers",
];

const API_MUTATING = ["POST", "PUT", "DELETE", "PATCH"];

function matches(list: string[], pathname: string): boolean {
  return list.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

async function getSession(request: NextRequest): Promise<{ role?: string } | null> {
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = decodeURIComponent(cookie);
    const payload = await verifySession(decoded);
    if (!payload) return null;
    return JSON.parse(payload);
  } catch {
    return null;
  }
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

  // 5. ALL /api/ routes — require auth + admin check for sensitive endpoints
  if (pathname.startsWith("/api/")) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: "غير مصرح. يرجى تسجيل الدخول." }, { status: 401 });
    }
    if (matches(ADMIN_API_PREFIXES, pathname) && session?.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح. صلاحيات المسؤول مطلوبة." }, { status: 403 });
    }
    // CSRF check for mutating API calls (POST/PUT/DELETE/PATCH on protected endpoints)
    if (API_MUTATING.includes(method) && !PUBLIC_API_POST.some((p) => pathname === p)) {
      const csrfCookie = request.cookies.get(CSRF_COOKIE)?.value;
      const csrfHeader = request.headers.get(CSRF_HEADER);
      if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        return NextResponse.json({ error: "طلب غير مصرح (CSRF)" }, { status: 403 });
      }
    }
    return response;
  }

  // 6. Everything else (static assets, etc.) — allow
  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|images/|favicon.ico|icon-|og-image.png|manifest.webmanifest|robots.txt|sitemap.xml|sw.js).*)",
};
