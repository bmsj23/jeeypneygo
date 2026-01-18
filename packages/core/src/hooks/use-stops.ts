import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import type { Stop, StopWithRoute } from '../types/models';

interface UseStopsOptions {
  routeId?: string;
  includeRoute?: boolean;
  searchQuery?: string;
}

interface UseStopsReturn {
  stops: Stop[] | StopWithRoute[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useStops(options: UseStopsOptions = {}): UseStopsReturn {
  const { routeId, includeRoute = false, searchQuery } = options;
  const [stops, setStops] = useState<Stop[] | StopWithRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStops = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase.from('stops').select(includeRoute ? '*, route:routes(*)' : '*');

      if (routeId) {
        query = query.eq('route_id', routeId);
      }

      const { data, error: queryError } = await query.order('order_index');

      if (queryError) {
        throw new Error(queryError.message);
      }

      setStops(data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching stops:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStops();
  }, [routeId, includeRoute]);

  // filter stops based on search query
  const filteredStops = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      return stops;
    }

    const query = searchQuery.toLowerCase().trim();
    return stops.filter((stop) => stop.name.toLowerCase().includes(query));
  }, [stops, searchQuery]);

  return {
    stops: filteredStops,
    isLoading,
    error,
    refetch: fetchStops,
  };
}
