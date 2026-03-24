import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _browserClient: SupabaseClient | null = null;
let _serverClient: SupabaseClient | null = null;

function createDb(): SupabaseClient {
  const isBrowser = typeof window !== "undefined";
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY!;

  if (isBrowser) {
    if (_browserClient) return _browserClient;
    
    // On Capacitor, window.Capacitor is defined
    const isMobile = (window as any).Capacitor !== undefined ||
                     window.location.protocol.startsWith('capacitor') || 
                     (!window.location.protocol.startsWith('http:') && !window.location.protocol.startsWith('https:'));
    
    // Always use direct Supabase URL if was specially provided during build
    // but on mobile we MUST avoid the /api/proxy-supabase route as it is disabled in static export
    if (isMobile) {
      _browserClient = createClient(url, key);
    } else {
      // Standard web browser uses the proxy
      const proxyUrl = `${window.location.origin}/api/proxy-supabase`;
      _browserClient = createClient(proxyUrl, "hidden-key");
    }
    return _browserClient;
  }

  if (_serverClient) return _serverClient;
  _serverClient = createClient(url, key);
  return _serverClient;
}

const db = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = createDb();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default db;

