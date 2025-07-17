'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function CrossTabLogoutHandler() {
  const { clearAuthData } = useAuthStore();

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth-logout-event' && event.newValue) {
        const currentPath = window.location.pathname;
        const isAlreadyOnAuthPage = currentPath === '/signin' || currentPath === '/signup';
        
        if (!isAlreadyOnAuthPage) {
          clearAuthData();
          
          localStorage.clear();
          
          window.location.href = '/signin';
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [clearAuthData]);

  return null;
} 