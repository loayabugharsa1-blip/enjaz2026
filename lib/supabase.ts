import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseAnonKey) {
    return createNullClient();
  }

  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "public" },
    global: {
      fetch: resilientFetch,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  return client;
}

async function resilientFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const method = (init?.method || "GET").toUpperCase();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(input, { ...init, signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) {
      if (method === "GET") {
        return emptyResponse();
      }
      return response;
    }
    return response;
  } catch {
    if (method === "GET") {
      return emptyResponse();
    }
    throw new TypeError("فشل الاتصال بقاعدة البيانات. يرجى التحقق من اتصال الإنترنت.");
  }
}

function emptyResponse(): Response {
  const body = JSON.stringify([]);
  return new Response(body, {
    status: 200,
    statusText: "OK",
    headers: { "Content-Type": "application/json" },
  });
}

function createNullClient(): SupabaseClient {
  return createClient("https://placeholder.supabase.co", "placeholder-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: async () => emptyResponse(),
    },
  });
}

export const supabase = new Proxy(
  {},
  {
    get(_, prop) {
      const c = getSupabase();
      const value = (c as unknown as Record<string | symbol, unknown>)[prop];
      if (typeof value === "function") {
        return value.bind(c);
      }
      return value;
    },
  }
) as SupabaseClient;
