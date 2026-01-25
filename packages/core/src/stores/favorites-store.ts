import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { useToastStore } from './toast-store';
import type { UserFavorite, StopWithRoute } from '../types/models';

interface FavoriteWithStop extends UserFavorite {
  stop: StopWithRoute;
}

interface FavoritesState {
  favorites: FavoriteWithStop[];
  isLoading: boolean;
  error: Error | null;
  userId: string | null;
}

interface FavoritesActions {
  setUserId: (userId: string | null) => void;
  fetchFavorites: () => Promise<void>;
  addFavorite: (stopId: string) => Promise<{ success: boolean; error?: string }>;
  removeFavorite: (stopId: string) => Promise<{ success: boolean; error?: string }>;
  isFavorite: (stopId: string) => boolean;
  clearError: () => void;
}

type FavoritesStore = FavoritesState & FavoritesActions;

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favorites: [],
  isLoading: false,
  error: null,
  userId: null,

  setUserId: (userId) => {
    const currentUserId = get().userId;
    if (currentUserId !== userId) {
      set({ userId, favorites: [], isLoading: false });
      if (userId) {
        get().fetchFavorites();
      }
    }
  },

  fetchFavorites: async () => {
    const { userId } = get();
    if (!userId) {
      set({ favorites: [], isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });

      const { data, error: queryError } = await supabase
        .from('user_favorites')
        .select(
          `
          *,
          stop:stops(
            *,
            route:routes(*)
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (queryError) {
        throw new Error(queryError.message);
      }

      set({ favorites: (data as unknown as FavoriteWithStop[]) || [], isLoading: false });
    } catch (err) {
      set({ error: err as Error, isLoading: false });
      console.error('Error fetching favorites:', err);
    }
  },

  addFavorite: async (stopId) => {
    const { userId, favorites } = get();
    const { showSuccess, showError } = useToastStore.getState();

    if (!userId) {
      showError('Please sign in to add favorites');
      return { success: false, error: 'Please sign in to add favorites' };
    }

    const alreadyFavorite = favorites.some((fav) => fav.stop_id === stopId);
    if (alreadyFavorite) {
      return { success: true };
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase.from('user_favorites') as any).insert({
        user_id: userId,
        stop_id: stopId,
      });

      if (insertError) {
        if (insertError.code === '23505') {
          await get().fetchFavorites();
          return { success: true };
        }
        throw new Error(insertError.message);
      }

      await get().fetchFavorites();
      showSuccess('Added to favorites');
      return { success: true };
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to add favorite';
      console.error('Error adding favorite:', err);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  removeFavorite: async (stopId) => {
    const { userId, favorites } = get();
    const { showSuccess, showError } = useToastStore.getState();

    if (!userId) {
      showError('Please sign in to remove favorites');
      return { success: false, error: 'Please sign in to remove favorites' };
    }

    const isFav = favorites.some((fav) => fav.stop_id === stopId);
    if (!isFav) {
      return { success: true };
    }

    try {
      const { error: deleteError } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('stop_id', stopId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      set((state) => ({
        favorites: state.favorites.filter((fav) => fav.stop_id !== stopId),
      }));

      showSuccess('Removed from favorites');
      return { success: true };
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to remove favorite';
      console.error('Error removing favorite:', err);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  isFavorite: (stopId) => {
    return get().favorites.some((fav) => fav.stop_id === stopId);
  },

  clearError: () => set({ error: null }),
}));