
export type UserRole = 'ADMIN' | 'USER';

// Route Constants
export const AUTH_ROUTES = {
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  UNAUTHORIZED: '/unauthorized',
} as const;

export const PUBLIC_ROUTES = [
  '/',
  '/about',
  AUTH_ROUTES.SIGNIN,
  AUTH_ROUTES.SIGNUP,
  AUTH_ROUTES.UNAUTHORIZED,
] as const;

// Admin-only routes
export const ADMIN_ROUTES = [
  '/admin',
  '/admin/dashboard',
  '/admin/dashboard/jobs',
  '/admin/dashboard/applications',
  '/admin/dashboard/companies',
  '/admin/dashboard/profile',
  '/admin/dashboard/free-resources',
] as const;

// User-only routes
export const USER_ROUTES = [
  '/dashboard',
  '/dashboard/jobs',
  '/dashboard/applied', 
  '/dashboard/career-guidance',
  '/dashboard/profile',
  '/dashboard/free-resources',
] as const;

// Routes accessible by both users and admins (with different context)
export const CONTEXTUAL_ROUTES = [
  '/jobs',
] as const;

// Default redirect paths for each role
export const DEFAULT_REDIRECTS = {
  ADMIN: '/admin/dashboard',
  USER: '/dashboard',
  UNAUTHENTICATED: AUTH_ROUTES.SIGNIN,
} as const;

/**
 * Checks if a user has permission to access a specific route
 */
export function hasRouteAccess(userRole: UserRole | null, path: string): boolean {
  // Public routes are accessible to everyone
  if ((PUBLIC_ROUTES as readonly string[]).includes(path) || path.startsWith('/jobs/')) {
    return true;
  }

  // If no user role, only public routes are accessible
  if (!userRole) {
    return false;
  }

  // Check admin routes
  if (ADMIN_ROUTES.some(route => path.startsWith(route))) {
    return userRole === 'ADMIN';
  }

  // Check user routes
  if (USER_ROUTES.some(route => path.startsWith(route))) {
    return userRole === 'USER';
  }

  // Contextual routes are accessible to both roles
  if (CONTEXTUAL_ROUTES.some(route => path.startsWith(route))) {
    return true;
  }

  // Default deny
  return false;
}

/**
 * Gets the appropriate redirect path for a user role
 */
export function getRedirectPath(userRole: UserRole | null): string {
  if (!userRole) {
    return DEFAULT_REDIRECTS.UNAUTHENTICATED;
  }
  
  return DEFAULT_REDIRECTS[userRole];
}

/**
 * Checks if a route is admin-only
 */
export function isAdminRoute(path: string): boolean {
  return ADMIN_ROUTES.some(route => path.startsWith(route));
}

/**
 * Checks if a route is user-only
 */
export function isUserRoute(path: string): boolean {
  return USER_ROUTES.some(route => path.startsWith(route));
}

/**
 * Checks if a route is public (no authentication required)
 */
export function isPublicRoute(path: string): boolean {
  return (PUBLIC_ROUTES as readonly string[]).includes(path) || path.startsWith('/jobs/');
}

/**
 * Checks if a route is contextual (accessible by both roles)
 */
export function isContextualRoute(path: string): boolean {
  return CONTEXTUAL_ROUTES.some(route => path.startsWith(route));
}

/**
 * Gets the appropriate unauthorized redirect based on user role
 */
export function getUnauthorizedRedirect(userRole: UserRole | null): string {
  if (userRole === 'ADMIN') {
    return DEFAULT_REDIRECTS.ADMIN;
  } else if (userRole === 'USER') {
    return AUTH_ROUTES.UNAUTHORIZED;
  }
  return DEFAULT_REDIRECTS.UNAUTHENTICATED;
}

/**
 * Validates if a user should be on the current path and returns redirect if needed
 */
export function validateUserAccess(
  userRole: UserRole | null, 
  currentPath: string
): { hasAccess: boolean; redirectTo?: string } {
  // Check if user has access
  if (hasRouteAccess(userRole, currentPath)) {
    return { hasAccess: true };
  }

  // User doesn't have access, determine where to redirect
  if (!userRole) {
    return { 
      hasAccess: false, 
      redirectTo: DEFAULT_REDIRECTS.UNAUTHENTICATED 
    };
  }

  // Redirect based on the type of unauthorized access
  if (userRole === 'USER' && isAdminRoute(currentPath)) {
    return { 
      hasAccess: false, 
      redirectTo: AUTH_ROUTES.UNAUTHORIZED 
    };
  }

  if (userRole === 'ADMIN' && isUserRoute(currentPath)) {
    return { 
      hasAccess: false, 
      redirectTo: DEFAULT_REDIRECTS.ADMIN 
    };
  }

  // Default redirect to user's dashboard
  return { 
    hasAccess: false, 
    redirectTo: getRedirectPath(userRole) 
  };
} 