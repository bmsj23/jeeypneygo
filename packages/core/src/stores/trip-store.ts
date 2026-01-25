import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import type { ActiveTrip, Route, Vehicle } from '../types/models';

const tripStorage: StateStorage = {
  getItem: async (name: string) => {
    return await AsyncStorage.getItem(name);
  },
  setItem: async (name: string, value: string) => {
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string) => {
    await AsyncStorage.removeItem(name);
  },
};

const REGULAR_FARE = 13;
const DISCOUNTED_FARE = 10;

export interface FareEntry {
  id: string;
  type: 'regular' | 'discounted';
  amount: number;
  timestamp: number;
}

interface TripState {
  activeTrip: ActiveTrip | null;
  selectedRoute: Route | null;
  vehicle: Vehicle | null;
  isStartingTrip: boolean;
  isEndingTrip: boolean;
  tripStartTime: number | null;
  error: Error | null;
  fareEntries: FareEntry[];
  totalFare: number;
  regularPassengers: number;
  discountedPassengers: number;
}

interface TripActions {
  setSelectedRoute: (route: Route | null) => void;
  setVehicle: (vehicle: Vehicle | null) => void;
  startTrip: (params: StartTripParams) => Promise<{ success: boolean; error?: Error }>;
  updatePassengerCount: (count: number) => Promise<{ success: boolean; error?: Error }>;
  updateLocation: (latitude: number, longitude: number, heading?: number, speed?: number) => Promise<{ success: boolean; error?: Error }>;
  pauseTrip: () => Promise<{ success: boolean; error?: Error }>;
  resumeTrip: () => Promise<{ success: boolean; error?: Error }>;
  endTrip: () => Promise<{ success: boolean; tripSummary?: TripSummary; error?: Error }>;
  clearError: () => void;
  reset: () => void;
  logFare: (type: 'regular' | 'discounted') => void;
  undoLastFare: () => void;
  clearFares: () => void;
}

interface StartTripParams {
  driverId: string;
  vehicleId: string;
  routeId: string;
  latitude: number;
  longitude: number;
}

export interface TripSummary {
  duration: number;
  totalPassengers: number;
  routeName: string;
  startedAt: string;
  endedAt: string;
  totalFare: number;
  regularPassengers: number;
  discountedPassengers: number;
  grossEarnings: number;
}

type TripStore = TripState & TripActions;

const initialState: TripState = {
  activeTrip: null,
  selectedRoute: null,
  vehicle: null,
  isStartingTrip: false,
  isEndingTrip: false,
  tripStartTime: null,
  error: null,
  fareEntries: [],
  totalFare: 0,
  regularPassengers: 0,
  discountedPassengers: 0,
};

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedRoute: (route) => set({ selectedRoute: route }),

      setVehicle: (vehicle) => set({ vehicle }),

      logFare: (type) => {
        const amount = type === 'regular' ? REGULAR_FARE : DISCOUNTED_FARE;
        const entry: FareEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          type,
          amount,
          timestamp: Date.now(),
        };

        set((state) => ({
          fareEntries: [...state.fareEntries, entry],
          totalFare: state.totalFare + amount,
          regularPassengers: state.regularPassengers + (type === 'regular' ? 1 : 0),
          discountedPassengers: state.discountedPassengers + (type === 'discounted' ? 1 : 0),
        }));

        const { activeTrip, regularPassengers, discountedPassengers } = get();
        if (activeTrip) {
          const newCount = regularPassengers + discountedPassengers + 1;
          get().updatePassengerCount(newCount);
        }
      },

      undoLastFare: () => {
        const { fareEntries } = get();
        if (fareEntries.length === 0) return;

        const lastEntry = fareEntries[fareEntries.length - 1];

        set((state) => ({
          fareEntries: state.fareEntries.slice(0, -1),
          totalFare: state.totalFare - lastEntry.amount,
          regularPassengers: state.regularPassengers - (lastEntry.type === 'regular' ? 1 : 0),
          discountedPassengers: state.discountedPassengers - (lastEntry.type === 'discounted' ? 1 : 0),
        }));

        const { activeTrip, regularPassengers, discountedPassengers } = get();
        if (activeTrip) {
          const newCount = regularPassengers + discountedPassengers - 1;
          get().updatePassengerCount(Math.max(0, newCount));
        }
      },

      clearFares: () => {
        set({
          fareEntries: [],
          totalFare: 0,
          regularPassengers: 0,
          discountedPassengers: 0,
        });
      },

      startTrip: async ({ driverId, vehicleId, routeId, latitude, longitude }) => {
        try {
          set({ isStartingTrip: true, error: null });

          set({
            fareEntries: [],
            totalFare: 0,
            regularPassengers: 0,
            discountedPassengers: 0,
          });

          const tripData = {
            driver_id: driverId,
            vehicle_id: vehicleId,
            route_id: routeId,
            current_latitude: latitude,
            current_longitude: longitude,
            passenger_count: 0,
            status: 'active' as const,
            heading: 0,
            speed: 0,
          };

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase as any)
            .from('active_trips')
            .insert(tripData)
            .select()
            .single();

          if (error) {
            throw new Error(error.message);
          }

          set({
            activeTrip: data,
            tripStartTime: Date.now(),
            isStartingTrip: false,
          });

          return { success: true };
        } catch (err) {
          const error = err as Error;
          set({ error, isStartingTrip: false });
          return { success: false, error };
        }
      },

      updatePassengerCount: async (count) => {
        const { activeTrip, vehicle } = get();
        if (!activeTrip) {
          return { success: false, error: new Error('No active trip') };
        }

        const maxCapacity = vehicle?.capacity ?? 20;
        const clampedCount = Math.max(0, Math.min(count, maxCapacity));

        try {
          const updateData = { passenger_count: clampedCount };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (supabase as any)
            .from('active_trips')
            .update(updateData)
            .eq('id', activeTrip.id);

          if (error) {
            throw new Error(error.message);
          }

          set({
            activeTrip: { ...activeTrip, passenger_count: clampedCount },
          });

          return { success: true };
        } catch (err) {
          return { success: false, error: err as Error };
        }
      },

      updateLocation: async (latitude, longitude, heading = 0, speed = 0) => {
        const { activeTrip } = get();
        if (!activeTrip) {
          return { success: false, error: new Error('No active trip') };
        }

        try {
          const updateData = {
            current_latitude: latitude,
            current_longitude: longitude,
            heading,
            speed,
            last_updated: new Date().toISOString(),
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (supabase as any)
            .from('active_trips')
            .update(updateData)
            .eq('id', activeTrip.id);

          if (error) {
            throw new Error(error.message);
          }

          set({
            activeTrip: {
              ...activeTrip,
              current_latitude: latitude,
              current_longitude: longitude,
              heading,
              speed,
            },
          });

          return { success: true };
        } catch (err) {
          return { success: false, error: err as Error };
        }
      },

      pauseTrip: async () => {
        const { activeTrip } = get();
        if (!activeTrip) {
          return { success: false, error: new Error('No active trip') };
        }

        try {
          const updateData = { status: 'paused' as const };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (supabase as any)
            .from('active_trips')
            .update(updateData)
            .eq('id', activeTrip.id);

          if (error) {
            throw new Error(error.message);
          }

          set({
            activeTrip: { ...activeTrip, status: 'paused' },
          });

          return { success: true };
        } catch (err) {
          return { success: false, error: err as Error };
        }
      },

      resumeTrip: async () => {
        const { activeTrip } = get();
        if (!activeTrip) {
          return { success: false, error: new Error('No active trip') };
        }

        try {
          const updateData = { status: 'active' as const };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (supabase as any)
            .from('active_trips')
            .update(updateData)
            .eq('id', activeTrip.id);

          if (error) {
            throw new Error(error.message);
          }

          set({
            activeTrip: { ...activeTrip, status: 'active' },
          });

          return { success: true };
        } catch (err) {
          return { success: false, error: err as Error };
        }
      },

      endTrip: async () => {
        const { activeTrip, selectedRoute, tripStartTime, totalFare, regularPassengers, discountedPassengers } = get();
        if (!activeTrip) {
          return { success: false, error: new Error('No active trip') };
        }

        try {
          set({ isEndingTrip: true, error: null });

          const endedAt = new Date().toISOString();
          const startedAt = activeTrip.started_at;

          const grossEarnings = totalFare;

          const historyData = {
            vehicle_id: activeTrip.vehicle_id,
            driver_id: activeTrip.driver_id,
            route_id: activeTrip.route_id,
            started_at: startedAt,
            ended_at: endedAt,
            total_passengers: regularPassengers + discountedPassengers,
            distance_km: 0,
            total_fare: totalFare,
            regular_passengers: regularPassengers,
            discounted_passengers: discountedPassengers,
            gross_earnings: grossEarnings,
          };

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: historyError } = await (supabase as any)
            .from('trip_history')
            .insert(historyData);

          if (historyError) {
            throw new Error(historyError.message);
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: deleteError } = await (supabase as any)
            .from('active_trips')
            .delete()
            .eq('id', activeTrip.id);

          if (deleteError) {
            throw new Error(deleteError.message);
          }

          const duration = tripStartTime
            ? Math.floor((Date.now() - tripStartTime) / 1000)
            : Math.floor((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000);

          const tripSummary: TripSummary = {
            duration,
            totalPassengers: regularPassengers + discountedPassengers,
            routeName: selectedRoute?.name || 'Unknown Route',
            startedAt,
            endedAt,
            totalFare,
            regularPassengers,
            discountedPassengers,
            grossEarnings,
          };

          set({
            ...initialState,
            isEndingTrip: false,
          });

          return { success: true, tripSummary };
        } catch (err) {
          const error = err as Error;
          set({ error, isEndingTrip: false });
          return { success: false, error };
        }
      },

      clearError: () => set({ error: null }),

      reset: () => set(initialState),
    }),
    {
      name: 'jeepneygo-trip',
      storage: createJSONStorage(() => tripStorage),
      partialize: (state) => ({
        activeTrip: state.activeTrip,
        selectedRoute: state.selectedRoute,
        tripStartTime: state.tripStartTime,
        fareEntries: state.fareEntries,
        totalFare: state.totalFare,
        regularPassengers: state.regularPassengers,
        discountedPassengers: state.discountedPassengers,
      }),
    }
  )
);
