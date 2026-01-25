import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import type { User, AuthState } from '../types/models';
import { supabase } from '../services/supabase';

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
  updateProfile: (updates: Partial<Pick<User, 'display_name' | 'phone' | 'email' | 'avatar_url'>>) => Promise<{ error: Error | null }>;
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
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (profileError) {
                console.error('Error fetching user profile:', profileError);
              }

              set({
                user: profile || {
                  id: session.user.id,
                  email: session.user.email ?? null,
                  phone: session.user.phone ?? null,
                  display_name: session.user.email?.split('@')[0] || 'User',
                  role: 'commuter',
                  is_approved: false,
                  avatar_url: null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
                session: {
                  access_token: session.access_token,
                  refresh_token: session.refresh_token,
                },
                isAuthenticated: true,
                isLoading: false,
              });
            } else if (event === 'SIGNED_OUT') {
              set({
                user: null,
                session: null,
                isAuthenticated: false,
              });
            }
          });

          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError) {
              console.error('Error fetching user profile on init:', profileError);
            }

            set({
              user: profile || {
                id: session.user.id,
                email: session.user.email ?? null,
                phone: session.user.phone ?? null,
                display_name: session.user.email?.split('@')[0] || 'User',
                role: 'commuter',
                is_approved: false,
                avatar_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              session: {
                access_token: session.access_token,
                refresh_token: session.refresh_token,
              },
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            const currentState = get();
            if (currentState.session) {
              const { data: { session: restoredSession } } = await supabase.auth.setSession({
                access_token: currentState.session.access_token,
                refresh_token: currentState.session.refresh_token,
              });

              if (!restoredSession) {
                set({
                  user: null,
                  session: null,
                  isAuthenticated: false,
                  isLoading: false,
                });
              }
            } else {
              set({ isLoading: false });
            }
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
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.session.user.id)
              .single();

            if (profileError) {
              console.warn('Profile not found after OTP, using fallback:', profileError.message);
            }

            set({
              user: profile || {
                id: data.session.user.id,
                email: data.session.user.email ?? null,
                phone: data.session.user.phone || phone,
                display_name: data.session.user.phone || 'User',
                role: 'commuter',
                is_approved: true,
                avatar_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
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
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.session.user.id)
              .single();

            if (profileError) {
              console.warn('Profile not found, using fallback:', profileError.message);
            }

            set({
              user: profile || {
                id: data.session.user.id,
                email: data.session.user.email ?? null,
                phone: data.session.user.phone ?? null,
                display_name: data.session.user.email?.split('@')[0] || 'User',
                role: 'commuter',
                is_approved: true,
                avatar_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
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

          if (data.session?.user) {
            const { data: existingProfile } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.session.user.id)
              .single();

            const userProfile = existingProfile || {
              id: data.session.user.id,
              phone: null,
              email: data.session.user.email || null,
              display_name: displayName,
              role: 'commuter' as const,
              is_approved: true,
              avatar_url: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            set({
              user: userProfile,
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

      signOut: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User | null) => set({ user }),

      updateProfile: async (updates) => {
        try {
          const currentUser = get().user;
          if (!currentUser) {
            return { error: new Error('No user logged in') };
          }

          const updateData: Record<string, string | null | undefined> = {};
          if (updates.display_name !== undefined) updateData.display_name = updates.display_name;
          if (updates.phone !== undefined) updateData.phone = updates.phone;
          if (updates.email !== undefined) updateData.email = updates.email;
          if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;

          if (Object.keys(updateData).length === 0) {
            return { error: null };
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase as any)
            .from('users')
            .update(updateData)
            .eq('id', currentUser.id)
            .select()
            .single();

          if (error) {
            return { error: new Error(error.message) };
          }

          set({ user: data });

          return { error: null };
        } catch (error) {
          return { error: error as Error };
        }
      },
    }),
    {
      name: 'jeepneygo-auth',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        session: state.session,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
