"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase, useUser } from '@/contexts/SupabaseProvider';

export function useAuthGuard(redirectTo: string = '/signin') {
  const { loading } = useSupabase();
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading, isAuthenticated: !!user };
}

export function useGuestGuard(redirectTo: string = '/dashboard') {
  const { loading } = useSupabase();
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading, isGuest: !user };
} 