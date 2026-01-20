import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';
import type { ActiveTripWithDetails, ActiveTrip, Vehicle, User, Route } from '../types/models';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// connection states for reconnection handling
type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseActiveTripsOptions {
  routeId?: string;
  // enables periodic full sync for data consistency (default: 30s)
  syncInterval?: number;
}

interface UseActiveTripsReturn {
  trips: ActiveTripWithDetails[];
  isLoading: boolean;
  error: Error | null;
  connectionState: ConnectionState;
  refetch: () => Promise<void>;
}

// cached relations to avoid refetching on every update
const relationsCache = {
  vehicles: new Map<string, Vehicle>(),
  drivers: new Map<string, Pick<User, 'id' | 'display_name'>>(),
  routes: new Map<string, Route>(),
};

export function useActiveTrips(options: UseActiveTripsOptions | string = {}): UseActiveTripsReturn {
  // handle legacy string parameter for backwards compatibility
  const { routeId, syncInterval = 30000 } = typeof options === 'string' ? { routeId: options } : options;

  const [trips, setTrips] = useState<ActiveTripWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');

  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);

  // fetch full trip with relations
  const fetchTripWithDetails = useCallback(async (tripId: string): Promise<ActiveTripWithDetails | null> => {
    const { data, error: fetchError } = await supabase
      .from('active_trips')
      .select(`
        *,
        vehicle:vehicles(*),
        driver:users(id, display_name),
        route:routes(*)
      `)
      .eq('id', tripId)
      .single();

    if (fetchError || !data) return null;

    // cache the relations for future updates
    const trip = data as unknown as ActiveTripWithDetails;
    if (trip.vehicle) relationsCache.vehicles.set(trip.vehicle_id, trip.vehicle);
    if (trip.driver) relationsCache.drivers.set(trip.driver_id, trip.driver);
    if (trip.route) relationsCache.routes.set(trip.route_id, trip.route);

    return trip;
  }, []);

  // full data fetch
  const fetchTrips = useCallback(async () => {
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
      if (isMountedRef.current) {
        const fetchedTrips = data as unknown as ActiveTripWithDetails[];

        // cache all relations
        fetchedTrips.forEach((trip) => {
          if (trip.vehicle) relationsCache.vehicles.set(trip.vehicle_id, trip.vehicle);
          if (trip.driver) relationsCache.drivers.set(trip.driver_id, trip.driver);
          if (trip.route) relationsCache.routes.set(trip.route_id, trip.route);
        });

        setTrips(fetchedTrips);
        setIsLoading(false);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err as Error);
        setIsLoading(false);
      }
    }
  }, [routeId]);

  // handle real-time insert event
  const handleInsert = useCallback(async (payload: RealtimePostgresChangesPayload<ActiveTrip>) => {
    const newTrip = payload.new as ActiveTrip;

    // skip if filtering by route and this trip doesn't match
    if (routeId && newTrip.route_id !== routeId) return;

    // fetch full trip details
    const tripWithDetails = await fetchTripWithDetails(newTrip.id);
    if (!tripWithDetails || !isMountedRef.current) return;

    setTrips((prev) => {
      // avoid duplicates
      if (prev.some((t) => t.id === tripWithDetails.id)) return prev;
      return [...prev, tripWithDetails];
    });
  }, [routeId, fetchTripWithDetails]);

  // handle real-time update event with direct state mutation
  const handleUpdate = useCallback((payload: RealtimePostgresChangesPayload<ActiveTrip>) => {
    const updatedTrip = payload.new as ActiveTrip;

    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id !== updatedTrip.id) return trip;

        // merge updated fields while preserving cached relations
        return {
          ...trip,
          ...updatedTrip,
          // preserve relations from cache or existing trip
          vehicle: relationsCache.vehicles.get(updatedTrip.vehicle_id) || trip.vehicle,
          driver: relationsCache.drivers.get(updatedTrip.driver_id) || trip.driver,
          route: relationsCache.routes.get(updatedTrip.route_id) || trip.route,
        };
      })
    );
  }, []);

  // handle real-time delete event
  const handleDelete = useCallback((payload: RealtimePostgresChangesPayload<ActiveTrip>) => {
    // supabase DELETE events may only contain the id in old record
    // depending on replica identity settings
    const deletedTrip = payload.old as Partial<ActiveTrip>;
    const deletedId = deletedTrip?.id;

    if (!deletedId) {
      console.warn('DELETE event received without id, triggering refetch');
      fetchTrips();
      return;
    }

    setTrips((prev) => prev.filter((trip) => trip.id !== deletedId));
  }, [fetchTrips]);

  // subscribe to real-time channel with reconnection logic
  const subscribe = useCallback(() => {
    // clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channelName = routeId ? `active_trips_${routeId}` : 'active_trips_all';

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'active_trips',
          filter: routeId ? `route_id=eq.${routeId}` : undefined,
        },
        handleInsert
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'active_trips',
          filter: routeId ? `route_id=eq.${routeId}` : undefined,
        },
        handleUpdate
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'active_trips',
          filter: routeId ? `route_id=eq.${routeId}` : undefined,
        },
        handleDelete
      )
      .subscribe((status) => {
        if (!isMountedRef.current) return;

        switch (status) {
          case 'SUBSCRIBED':
            setConnectionState('connected');
            reconnectAttemptsRef.current = 0;
            break;
          case 'CHANNEL_ERROR':
          case 'TIMED_OUT':
            setConnectionState('error');
            scheduleReconnect();
            break;
          case 'CLOSED':
            setConnectionState('disconnected');
            break;
        }
      });

    channelRef.current = channel;
  }, [routeId, handleInsert, handleUpdate, handleDelete]);

  // exponential backoff reconnection
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const attempt = reconnectAttemptsRef.current;
    // exponential backoff: 1s, 2s, 4s, 8s, max 30s
    const delay = Math.min(1000 * Math.pow(2, attempt), 30000);

    reconnectTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        reconnectAttemptsRef.current += 1;
        setConnectionState('connecting');
        subscribe();
        fetchTrips();
      }
    }, delay);
  }, [subscribe, fetchTrips]);

  // initial setup and cleanup
  useEffect(() => {
    isMountedRef.current = true;

    // initial fetch
    fetchTrips();

    // subscribe to real-time updates
    subscribe();

    // periodic full sync for data consistency
    const syncIntervalId = setInterval(() => {
      if (isMountedRef.current) {
        fetchTrips();
      }
    }, syncInterval);

    return () => {
      isMountedRef.current = false;

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      clearInterval(syncIntervalId);
    };
  }, [fetchTrips, subscribe, syncInterval]);

  return { trips, isLoading, error, connectionState, refetch: fetchTrips };
}
