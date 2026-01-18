import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/auth-store';
import type { UserFavorite, StopWithRoute } from '../types/models';

interface FavoriteWithStop extends UserFavorite {
  stop: StopWithRoute;
}

interface UseFavoritesReturn {
  favorites: FavoriteWithStop[];
  isLoading: boolean;
  error: Error | null;
  addFavorite: (stopId: string) => Promise<boolean>;
  removeFavorite: (stopId: string) => Promise<boolean>;
  isFavorite: (stopId: string) => boolean;
  refetch: () => Promise<void>;
}

export function useFavorites(): UseFavoritesReturn {
  const user = useAuthStore((state) => state.user);
  const [favorites, setFavorites] = useState<FavoriteWithStop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFavorites = async () => {
    if (!user?.id) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (queryError) {
        throw new Error(queryError.message);
      }

      setFavorites((data as unknown as FavoriteWithStop[]) || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching favorites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user?.id]);

  const addFavorite = useCallback(
    async (stopId: string): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        const { error: insertError } = await supabase.from('user_favorites').insert({
          user_id: user.id,
          stop_id: stopId,
        });

        if (insertError) {
          throw new Error(insertError.message);
        }

        await fetchFavorites();
        return true;
      } catch (err) {
        console.error('Error adding favorite:', err);
        return false;
      }
    },
    [user?.id]
  );

  const removeFavorite = useCallback(
    async (stopId: string): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        const { error: deleteError } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('stop_id', stopId);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        await fetchFavorites();
        return true;
      } catch (err) {
        console.error('Error removing favorite:', err);
        return false;
      }
    },
    [user?.id]
  );

  const isFavorite = useCallback(
    (stopId: string): boolean => {
      return favorites.some((fav) => fav.stop_id === stopId);
    },
    [favorites]
  );

  return {
    favorites,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    refetch: fetchFavorites,
  };
}
