import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const isBrowser = typeof window !== 'undefined';
const absoluteProxyUrl = isBrowser ? `${window.location.origin}/api/proxy-supabase` : '';

const supabaseUrl = isBrowser ? absoluteProxyUrl : process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = isBrowser ? 'hidden-key' : process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const db = createClient<Database>(supabaseUrl, supabaseKey);

export default db;
