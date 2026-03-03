import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Singleton instances (one per environment)
let _browserClient: SupabaseClient<Database> | null = null;
let _serverClient: SupabaseClient<Database> | null = null;

function createDb(): SupabaseClient<Database> {
  const isBrowser = typeof window !== "undefined";

  if (isBrowser) {
    if (_browserClient) return _browserClient;
    // In the browser, route all Supabase calls through our Next.js proxy
    // so the real Supabase URL and anon key are never exposed in the network tab.
    const proxyUrl = `${window.location.origin}/api/proxy-supabase`;
    _browserClient = createClient<Database>(proxyUrl, "hidden-key");
    return _browserClient;
  }

  // On the server (Server Actions, Route Handlers, Server Components, middleware)
  // Prefer non-NEXT_PUBLIC_ vars so they are never baked into the client bundle
  // and can be injected as runtime secrets on the deployment platform.
  if (_serverClient) return _serverClient;
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase server environment variables. Set SUPABASE_URL and SUPABASE_KEY."
    );
  }
  _serverClient = createClient<Database>(url, key);
  return _serverClient;
}

// Export a Proxy so that every property access lazily creates the real client.
// This ensures `window` is never accessed at module load time (SSR safe).
const db = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    return (createDb() as any)[prop];
  },
});

export default db;

