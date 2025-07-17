'use client';

import { useClientRouteGuard } from '@/hooks/useClientRouteGuard';

/**
 * Client-side route guard component that automatically protects routes
 * based on user role. Add this to layouts for automatic protection.
 */
export function ClientRouteGuard() {
  useClientRouteGuard();
  return null;
}

export default ClientRouteGuard; 