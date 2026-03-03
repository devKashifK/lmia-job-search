import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

let _browserClient: SupabaseClient<Database> | null = null;
let _serverClient: SupabaseClient<Database> | null = null;

function createDb(): SupabaseClient<Database> {
  const isBrowser = typeof window !== "undefined";

  if (isBrowser) {
    if (_browserClient) return _browserClient;
    const proxyUrl = `${window.location.origin}/api/proxy-supabase`;
    _browserClient = createClient<Database>(proxyUrl, "hidden-key");
    return _browserClient;
  }

  if (_serverClient) return _serverClient;
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase server environment variables. Set SUPABASE_URL and SUPABASE_KEY (or NEXT_PUBLIC_ equivalents)."
    );
  }
  _serverClient = createClient<Database>(url, key);
  return _serverClient;
}

// Export a Proxy that lazily initialises the real client on first property access.
// IMPORTANT: functions must be bound to the real client so that `this` inside
// SDK methods resolves to the SupabaseClient instance, not the Proxy.
const db = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const client = createDb();
    const value = (client as any)[prop];
    // Bind functions so internal `this` references (e.g. this.headers, this.fetch)
    // resolve correctly against the real client, not this Proxy object.
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export default db;

