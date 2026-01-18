import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { TripHistory, Route } from '../types/models';

interface TripHistoryWithRoute extends TripHistory {
  route?: Route;
}

interface UseTripHistoryOptions {
  driverId: string | undefined;
  limit?: number;
  includeRoute?: boolean;
}

interface UseTripHistoryReturn {
  trips: TripHistoryWithRoute[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTripHistory(options: UseTripHistoryOptions): UseTripHistoryReturn {
  const { driverId, limit = 50, includeRoute = true } = options;
  const [trips, setTrips] = useState<TripHistoryWithRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrips = async () => {
    if (!driverId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const query = supabase
        .from('trip_history')
        .select(includeRoute ? '*, route:routes(*)' : '*')
        .eq('driver_id', driverId)
        .order('ended_at', { ascending: false })
        .limit(limit);

      const { data, error: queryError } = await query;

      if (queryError) {
        throw new Error(queryError.message);
      }

      setTrips(data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching trip history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [driverId, limit, includeRoute]);

  return {
    trips,
    isLoading,
    error,
    refetch: fetchTrips,
  };
}

interface TodayStatsReturn {
  tripsToday: number;
  passengersToday: number;
  hoursOnline: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTodayStats(driverId: string | undefined): TodayStatsReturn {
  const [stats, setStats] = useState({
    tripsToday: 0,
    passengersToday: 0,
    hoursOnline: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    if (!driverId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: queryError } = await (supabase as any)
        .from('trip_history')
        .select('started_at, ended_at, total_passengers')
        .eq('driver_id', driverId)
        .gte('ended_at', today.toISOString())
        .lt('ended_at', tomorrow.toISOString());

      if (queryError) {
        throw new Error(queryError.message);
      }

      interface TripStats {
        started_at: string;
        ended_at: string;
        total_passengers: number;
      }

      const trips: TripStats[] = data || [];
      const tripsToday = trips.length;
      const passengersToday = trips.reduce((sum, trip) => sum + (trip.total_passengers || 0), 0);
      
      // calculate hours online from trip durations
      const totalSeconds = trips.reduce((sum, trip) => {
        const start = new Date(trip.started_at).getTime();
        const end = new Date(trip.ended_at).getTime();
        return sum + (end - start) / 1000;
      }, 0);
      const hoursOnline = Math.round((totalSeconds / 3600) * 10) / 10;

      setStats({ tripsToday, passengersToday, hoursOnline });
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching today stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [driverId]);

  return {
    ...stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
