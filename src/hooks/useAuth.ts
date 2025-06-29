import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const isAdmin = user?.role === 'ADMIN';
  const isUser = user?.role === 'USER';

  const requireAuth = () => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin');
      return false;
    }
    return true;
  };

  const requireRole = (roles: string[]) => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin');
      return false;
    }

    if (!isLoading && user && !roles.includes(user.role)) {
      router.push('/unauthorized');
      return false;
    }

    return true;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    isUser,
    requireAuth,
    requireRole,
  };
};