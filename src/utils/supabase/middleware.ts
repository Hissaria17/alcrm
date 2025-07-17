import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'
import { 
  AUTH_ROUTES,
  DEFAULT_REDIRECTS,
  isAdminRoute,
  isUserRoute,
  isPublicRoute,
  validateUserAccess,
  type UserRole
} from '@/lib/auth-utils'

export async function updateSession(request: NextRequest) {
  const requestPath = new URL(request.url).pathname
  console.log(`[MIDDLEWARE] Processing request for path: ${requestPath}`)
  
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

  const isProtectedRoute = isAdminRoute(requestPath) || isUserRoute(requestPath)

  // Helper function to create signin URL with return parameter
  const createSigninUrl = (returnPath?: string) => {
    const signinUrl = new URL(AUTH_ROUTES.SIGNIN, request.url)
    if (returnPath && returnPath !== AUTH_ROUTES.SIGNIN && returnPath !== AUTH_ROUTES.SIGNUP) {
      signinUrl.searchParams.set('returnUrl', returnPath)
    }
    return signinUrl
  }

  // Handle unauthenticated users
  if (!user) {
    // Allow access to public routes and job browsing
    if (isPublicRoute(requestPath)) {
      return response
    }
    
    // If user is not authenticated and trying to access protected routes
    // Include the current path as returnUrl so user can be redirected back after signin
    if (isProtectedRoute) {
      return NextResponse.redirect(createSigninUrl(requestPath))
    }
    
    // For any other routes, redirect to signin with return URL
    return NextResponse.redirect(createSigninUrl(requestPath))
  }

  // User is authenticated, get user role
  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !userData) {
    // If we can't get user data, redirect to signin with return URL
    console.error('Error getting user data:', error)
    return NextResponse.redirect(createSigninUrl(requestPath))
  }

  const userRole = userData.role as UserRole

  // Validate user role
  if (!userRole || (userRole !== 'ADMIN' && userRole !== 'USER')) {
    console.error('Invalid or missing user role:', userRole, 'for user:', user.id)
    return NextResponse.redirect(createSigninUrl(requestPath))
  }

  // Comprehensive access validation
  const accessValidation = validateUserAccess(userRole, requestPath)

  // If user doesn't have access, redirect appropriately
  if (!accessValidation.hasAccess) {
    console.log(`Access denied for ${userRole} trying to access ${requestPath}. Redirecting to ${accessValidation.redirectTo}`)
    return NextResponse.redirect(new URL(accessValidation.redirectTo!, request.url))
  }

  // Special handling for auth routes when user is already authenticated
  if (requestPath === AUTH_ROUTES.SIGNIN || requestPath === AUTH_ROUTES.SIGNUP) {
    const redirectTo = userRole === 'ADMIN' ? DEFAULT_REDIRECTS.ADMIN : DEFAULT_REDIRECTS.USER
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  // User has access, continue
  return response
} 