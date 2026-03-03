import { createClient } from "@supabase/supabase-js";

// Determine if we are running in the browser
const isBrowser = typeof window !== 'undefined';

// If in browser, use our Next.js API proxy to hide real credentials from Network tab
const supabaseUrl = isBrowser
  ? '/api/proxy-supabase'
  : process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseKey = isBrowser
  ? 'hidden-key' // Dummy key, real key injected by Middleware
  : process.env.NEXT_PUBLIC_SUPABASE_KEY!;

const db = createClient(supabaseUrl, supabaseKey);

export default db;
