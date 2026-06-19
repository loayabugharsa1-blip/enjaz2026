import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function createMockClient(): SupabaseClient {
  return {
    from: () => ({
      select: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      insert: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      update: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      delete: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }) }),
      order: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
    }),
    storage: {
      listBuckets: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      createBucket: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      }),
    },
    rpc: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
    auth: {
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      signUp: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      signOut: () => Promise.resolve({ error: new Error("Supabase not configured") }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  } as unknown as SupabaseClient;
}

export const supabaseAdmin: SupabaseClient = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      db: { schema: "public" },
    })
  : createMockClient();
