import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Database } from '@/types/supabase';

type User = Database['public']['Tables']['users']['Row'];

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastAuthCheck: number | null;
  // Actions
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

const AUTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      lastAuthCheck: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (authError) throw authError;

          if (authData.user) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', authData.user.id)
              .single();

            if (userError) throw userError;

            set({ user: userData, isAuthenticated: true });
            toast.success('Logged in successfully');
            return userData;
          }

          throw new Error('No user data found');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
          });

          if (authError) throw authError;

          if (authData.user) {
            const { error: userError } = await supabase
              .from('users')
              .insert([
                {
                  id: authData.user.id,
                  email: authData.user.email!,
                  role: 'USER',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ]);

            if (userError) throw userError;

            set({
              user: {
                id: authData.user.id,
                email: authData.user.email!,
                role: 'USER',
                first_name: '',
                last_name: '',
                phone: '',
                bio: '',
                resume_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              isAuthenticated: true,
            });
            toast.success('Account created successfully');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred during signup';
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          set({ user: null, isAuthenticated: false, lastAuthCheck: null });
          toast.success('Logged out successfully');
          // Use router.push instead of window.location.href to avoid conflicts
          // The auth guard will handle the redirect automatically
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred during logout';
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      checkAuth: async () => {
        try {
          const state = get();
          const now = Date.now();
          
          // If we've checked auth recently, don't check again
          if (state.lastAuthCheck && now - state.lastAuthCheck < AUTH_CHECK_INTERVAL) {
            return;
          }

          set({ isLoading: true, error: null });
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (userError) throw userError;

            set({ 
              user: userData, 
              isAuthenticated: true,
              lastAuthCheck: now 
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false,
              lastAuthCheck: now 
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred during auth check';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateUserProfile: async (updates: Partial<User>) => {
        try {
          set({ isLoading: true, error: null });
          const currentUser = get().user;
          if (!currentUser) throw new Error('No user logged in');

          const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', currentUser.id);

          if (error) throw error;

          set({ user: { ...currentUser, ...updates } });
          toast.success('Profile updated successfully');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred during profile update';
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
); 