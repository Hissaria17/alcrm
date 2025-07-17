import { useAuthStore } from '@/store/useAuthStore';
import { useCallback } from 'react';
export const useLogout = () => {
  const { logout } = useAuthStore();

  const handleLogout = useCallback(async () => {
    try {
      // The logout function in useAuthStore will handle:
      // 1. Supabase sign out
      // 2. Clear auth store data
      // 3. Trigger cross-tab logout event
      // 4. Clear localStorage
      // 5. Redirect to signin page
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Fallback: Force redirect even if logout fails
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/signin';
      }
    }
  }, [logout]);

  return { handleLogout };
}; 