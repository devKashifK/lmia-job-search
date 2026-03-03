import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export function createClient() {
    const isBrowser = typeof window !== 'undefined'

    // Use our proxy URL in the browser to hide the real Supabase URL/anon key from network tab
    const supabaseUrl = isBrowser
        ? `${window.location.origin}/api/proxy-supabase`
        : process.env.NEXT_PUBLIC_SUPABASE_URL!

    const supabaseKey = isBrowser
        ? 'hidden-key'
        : process.env.NEXT_PUBLIC_SUPABASE_KEY!

    return createBrowserClient<Database>(
        supabaseUrl,
        supabaseKey
    )
}
