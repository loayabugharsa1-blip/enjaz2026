const CSRF_COOKIE = "injaz_csrf";
const CSRF_HEADER = "x-csrf-token";

export function getCSRFToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function fetchWithCSRF(
  url: string | URL,
  options: RequestInit = {}
): Promise<Response> {
  const token = getCSRFToken();
  const headers = new Headers(options.headers);

  if (token) {
    headers.set(CSRF_HEADER, token);
  }

  return fetch(url, { ...options, headers });
}
