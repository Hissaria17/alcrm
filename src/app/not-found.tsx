'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { getRedirectPath } from '@/lib/auth-utils';
import { UserRole } from '@/lib/auth-utils';

export default function NotFound() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    const handleRedirect = async () => {
      // Check authentication status first
      if (!isAuthenticated) {
        await checkAuth();
        return;
      }

      // Get user role and redirect to appropriate dashboard
      const userRole = user?.role as UserRole | null;
      const redirectPath = getRedirectPath(userRole);
      
      // Add a small delay to show the 404 message briefly before redirecting
      setTimeout(() => {
        router.push(redirectPath);
      }, 2000);
    };

    handleRedirect();
  }, [user, isAuthenticated, checkAuth, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-muted-foreground">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Redirecting you back to your dashboard...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 