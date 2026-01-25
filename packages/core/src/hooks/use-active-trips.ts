import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';
import type { ActiveTripWithDetails, ActiveTrip, Vehicle, User, Route } from '../types/models';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseActiveTripsOptions {
  routeId?: string;
  syncInterval?: number;
}

interface UseActiveTripsReturn {
  trips: ActiveTripWithDetails[];
  isLoading: boolean;
  error: Error | null;
  connectionState: ConnectionState;
  refetch: () => Promise<void>;
}

const relationsCache = {
  vehicles: new Map<string, Vehicle>(),
  drivers: new Map<string, Pick<User, 'id' | 'display_name'>>(),
  routes: new Map<string, Route>(),
};

export function useActiveTrips(options: UseActiveTripsOptions | string = {}): UseActiveTripsReturn {
  const { routeId, syncInterval = 30000 } = typeof options === 'string' ? { routeId: options } : options;

  const [trips, setTrips] = useState<ActiveTripWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');

  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);

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

    const trip = data as unknown as ActiveTripWithDetails;
    if (trip.vehicle) relationsCache.vehicles.set(trip.vehicle_id, trip.vehicle);
    if (trip.driver) relationsCache.drivers.set(trip.driver_id, trip.driver);
    if (trip.route) relationsCache.routes.set(trip.route_id, trip.route);

    return trip;
  }, []);

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

  const handleInsert = useCallback(async (payload: RealtimePostgresChangesPayload<ActiveTrip>) => {
    const newTrip = payload.new as ActiveTrip;

    if (routeId && newTrip.route_id !== routeId) return;

    const tripWithDetails = await fetchTripWithDetails(newTrip.id);
    if (!tripWithDetails || !isMountedRef.current) return;

    setTrips((prev) => {
      if (prev.some((t) => t.id === tripWithDetails.id)) return prev;
      return [...prev, tripWithDetails];
    });
  }, [routeId, fetchTripWithDetails]);

  const handleUpdate = useCallback((payload: RealtimePostgresChangesPayload<ActiveTrip>) => {
    const updatedTrip = payload.new as ActiveTrip;

    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id !== updatedTrip.id) return trip;

        return {
          ...trip,
          ...updatedTrip,
          vehicle: relationsCache.vehicles.get(updatedTrip.vehicle_id) || trip.vehicle,
          driver: relationsCache.drivers.get(updatedTrip.driver_id) || trip.driver,
          route: relationsCache.routes.get(updatedTrip.route_id) || trip.route,
        };
      })
    );
  }, []);

  const handleDelete = useCallback((payload: RealtimePostgresChangesPayload<ActiveTrip>) => {
    const deletedTrip = payload.old as Partial<ActiveTrip>;
    const deletedId = deletedTrip?.id;

    if (!deletedId) {
      console.warn('DELETE event received without id, triggering refetch');
      fetchTrips();
      return;
    }

    setTrips((prev) => prev.filter((trip) => trip.id !== deletedId));
  }, [fetchTrips]);

  const subscribe = useCallback(() => {
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

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const attempt = reconnectAttemptsRef.current;
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

  useEffect(() => {
    isMountedRef.current = true;

    fetchTrips();

    subscribe();

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
