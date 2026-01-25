import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { useFavoritesStore } from '../stores/favorites-store';
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

// wrapper hook that syncs auth user to favorites store and provides backwards-compatible interface
export function useFavorites(): UseFavoritesReturn {
  const user = useAuthStore((state) => state.user);

  const favorites = useFavoritesStore((state) => state.favorites);
  const isLoading = useFavoritesStore((state) => state.isLoading);
  const error = useFavoritesStore((state) => state.error);
  const setUserId = useFavoritesStore((state) => state.setUserId);
  const fetchFavorites = useFavoritesStore((state) => state.fetchFavorites);
  const addFavoriteAction = useFavoritesStore((state) => state.addFavorite);
  const removeFavoriteAction = useFavoritesStore((state) => state.removeFavorite);
  const isFavoriteCheck = useFavoritesStore((state) => state.isFavorite);

  useEffect(() => {
    setUserId(user?.id || null);
  }, [user?.id, setUserId]);

  const addFavorite = async (stopId: string): Promise<boolean> => {
    const result = await addFavoriteAction(stopId);
    return result.success;
  };

  const removeFavorite = async (stopId: string): Promise<boolean> => {
    const result = await removeFavoriteAction(stopId);
    return result.success;
  };

  return {
    favorites,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite: isFavoriteCheck,
    refetch: fetchFavorites,
  };
}
