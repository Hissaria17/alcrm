'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { validateUserAccess, type UserRole } from '@/lib/auth-utils';
import React from 'react';

/**
 * Client-side route guard that checks user role from localStorage/store
 * and redirects if user doesn't have access to current route
 */
export function useClientRouteGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Skip if not authenticated
    if (!isAuthenticated || !user) {
      return;
    }

    const userRole = user.role as UserRole;
    
    // Double-check with localStorage as backup
    try {
      const storedUser = localStorage.getItem('supabase.auth.token');
      if (storedUser) {
       JSON.parse(storedUser);
        // Additional validation could be added here
      }
    } catch (error) {
      console.warn('[CLIENT GUARD] Could not parse localStorage auth data:', error);
    }
    
    // Skip validation for public routes
    if (pathname === '/' || pathname === '/about' || pathname === '/signin' || pathname === '/signup') {
      return;
    }

    // Validate access to current route
    const accessValidation = validateUserAccess(userRole, pathname);

    if (!accessValidation.hasAccess && accessValidation.redirectTo) {
      console.log(`[CLIENT GUARD] Access denied for ${userRole} on ${pathname}. Redirecting to ${accessValidation.redirectTo}`);
      
      // Use replace to prevent back button issues
      router.replace(accessValidation.redirectTo);
    }
  }, [pathname, router, isAuthenticated, user]);
}

/**
 * Higher-order component that wraps a component with client-side route protection
 */
export function withClientRouteGuard<T extends Record<string, unknown>>(
  WrappedComponent: React.ComponentType<T>
): React.ComponentType<T> {
  const GuardedComponent = (props: T) => {
    useClientRouteGuard();
    return React.createElement(WrappedComponent, props);
  };
  
  GuardedComponent.displayName = `withClientRouteGuard(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return GuardedComponent;
} 