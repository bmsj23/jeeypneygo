import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import type { User, AuthState } from '../types/models';
import { supabase } from '../services/supabase';

// secure storage adapter for zustand persistence
const secureStorage: StateStorage = {
  getItem: async (name: string) => {
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  },
};

interface AuthStore extends AuthState {
  initialize: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<{ error: Error | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            set({
              user: profile,
              session: {
                access_token: session.access_token,
                refresh_token: session.refresh_token,
              },
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ isLoading: false });
        }
      },

      signInWithPhone: async (phone: string) => {
        try {
          const { error } = await supabase.auth.signInWithOtp({ phone });
          return { error: error ? new Error(error.message) : null };
        } catch (error) {
          return { error: error as Error };
        }
      },

      verifyOtp: async (phone: string, token: string) => {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            phone,
            token,
            type: 'sms',
          });

          if (error) return { error: new Error(error.message) };

          if (data.session?.user) {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.session.user.id)
              .single();

            set({
              user: profile,
              session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
              },
              isAuthenticated: true,
            });
          }

          return { error: null };
        } catch (error) {
          return { error: error as Error };
        }
      },

      signInWithEmail: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) return { error: new Error(error.message) };

          if (data.session?.user) {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.session.user.id)
              .single();

            set({
              user: profile,
              session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
              },
              isAuthenticated: true,
            });
          }

          return { error: null };
        } catch (error) {
          return { error: error as Error };
        }
      },

      signUpWithEmail: async (email: string, password: string, displayName: string) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { display_name: displayName },
            },
          });

          if (error) return { error: new Error(error.message) };

          // profile will be created via database trigger
          return { error: null };
        } catch (error) {
          return { error: error as Error };
        }
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User | null) => set({ user }),
    }),
    {
      name: 'jeepneygo-auth',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        session: state.session,
      }),
    }
  )
);
