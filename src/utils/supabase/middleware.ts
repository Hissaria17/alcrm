import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // Get user data from the profiles table
    const { data: userData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const path = new URL(request.url).pathname

    // Handle role-based redirects
    if (userData?.role === 'ADMIN') {
      // If admin tries to access user routes, redirect to admin dashboard
      if (path.startsWith('/dashboard') && !path.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
    }
    else if (userData?.role === 'USER') {
      // If user tries to access admin routes, redirect to user dashboard
      if (path.startsWith('/admin') && !path.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    else {
      // If user has no role or invalid role, redirect to signin
      return NextResponse.redirect(new URL('/signin', request.url))
    }
  }

  return { response, supabase }
} 