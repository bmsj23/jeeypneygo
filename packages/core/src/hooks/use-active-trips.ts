import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { ActiveTripWithDetails } from '../types/models';

export function useActiveTrips(routeId?: string) {
  const [trips, setTrips] = useState<ActiveTripWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTrips = async () => {
      try {
        let query = supabase
          .from('active_trips')
          .select(`
            *,
            vehicle:vehicles(*),
            driver:users(id, display_name),
            route:routes(*)
          `)
          .eq('status', 'active');

        if (routeId) {
          query = query.eq('route_id', routeId);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        if (isMounted) {
          setTrips(data as unknown as ActiveTripWithDetails[]);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setIsLoading(false);
        }
      }
    };

    fetchTrips();

    // subscribe to real-time updates
    const channel = supabase
      .channel('active_trips_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_trips',
          filter: routeId ? `route_id=eq.${routeId}` : undefined,
        },
        () => {
          // refetch on any change
          fetchTrips();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [routeId]);

  return { trips, isLoading, error };
}
