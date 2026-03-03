import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function updateSession(request: NextRequest) {
    // Let the main middleware process the request chain first
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Create an SSR client pointing directly to Supabase to validate cookies
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // This will securely check the session cookie and conditionally refresh 
    // the user's auth token before returning the HTML.
    // It is explicitly safe to ignore the user payload here, we just need
    // the side-effect of refreshing the cookie via setAll().
    await supabase.auth.getUser()

    return supabaseResponse
}
