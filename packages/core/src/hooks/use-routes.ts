import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Route, RouteWithStops } from '../types/models';

interface UseRoutesOptions {
  includeStops?: boolean;
  activeOnly?: boolean;
}

interface UseRoutesReturn {
  routes: Route[] | RouteWithStops[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useRoutes(options: UseRoutesOptions = {}): UseRoutesReturn {
  const { includeStops = false, activeOnly = true } = options;
  const [routes, setRoutes] = useState<Route[] | RouteWithStops[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoutes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase.from('routes').select(
        includeStops ? '*, stops(*)' : '*'
      );

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error: queryError } = await query.order('name');

      if (queryError) {
        throw new Error(queryError.message);
      }

      // sort stops by order_index if included
      if (includeStops && data) {
        const routesWithSortedStops = data.map((route: RouteWithStops) => ({
          ...route,
          stops: route.stops?.sort((a, b) => a.order_index - b.order_index) || [],
        }));
        setRoutes(routesWithSortedStops);
      } else {
        setRoutes(data || []);
      }
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching routes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [includeStops, activeOnly]);

  return {
    routes,
    isLoading,
    error,
    refetch: fetchRoutes,
  };
}
