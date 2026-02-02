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
  type: 'regular' | 'discounted' | 'custom';
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
  // current passengers physically onboard (can be decremented when they alight)
  currentPassengersOnboard: number;
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
  fetchMyActiveTrip: (driverId: string) => Promise<{ success: boolean; error?: Error }>;
  clearForLogout: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
  logFare: (type: 'regular' | 'discounted') => void;
  logCustomFare: (amount: number) => void;
  undoLastFare: () => void;
  clearFares: () => void;
  decrementPassenger: () => void;
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
  currentPassengersOnboard: 0,
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
          currentPassengersOnboard: state.currentPassengersOnboard + 1,
        }));

        const { activeTrip, currentPassengersOnboard } = get();
        if (activeTrip) {
          get().updatePassengerCount(currentPassengersOnboard);
        }
      },

      logCustomFare: (amount) => {
        const entry: FareEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          type: 'custom',
          amount,
          timestamp: Date.now(),
        };

        set((state) => ({
          fareEntries: [...state.fareEntries, entry],
          totalFare: state.totalFare + amount,
          regularPassengers: state.regularPassengers + 1,
          currentPassengersOnboard: state.currentPassengersOnboard + 1,
        }));

        const { activeTrip, currentPassengersOnboard } = get();
        if (activeTrip) {
          get().updatePassengerCount(currentPassengersOnboard);
        }
      },

      undoLastFare: () => {
        const { fareEntries, currentPassengersOnboard } = get();
        if (fareEntries.length === 0) return;

        const lastEntry = fareEntries[fareEntries.length - 1];
        const wasRegular = lastEntry.type === 'regular' || lastEntry.type === 'custom';

        set((state) => ({
          fareEntries: state.fareEntries.slice(0, -1),
          totalFare: state.totalFare - lastEntry.amount,
          regularPassengers: state.regularPassengers - (wasRegular ? 1 : 0),
          discountedPassengers: state.discountedPassengers - (lastEntry.type === 'discounted' ? 1 : 0),
          // undo means passenger didnt actually board, so decrement both stats and onboard
          currentPassengersOnboard: Math.max(0, state.currentPassengersOnboard - 1),
        }));

        const newOnboard = Math.max(0, currentPassengersOnboard - 1);
        const { activeTrip } = get();
        if (activeTrip) {
          get().updatePassengerCount(newOnboard);
        }
      },

      clearFares: () => {
        set({
          fareEntries: [],
          totalFare: 0,
          regularPassengers: 0,
          discountedPassengers: 0,
          currentPassengersOnboard: 0,
        });
      },

      decrementPassenger: () => {
        const { activeTrip, currentPassengersOnboard } = get();

        // prevent negative passenger count
        if (currentPassengersOnboard <= 0) return;

        // only decrement currentPassengersOnboard (passengers alighting)
        // does NOT affect regularPassengers/discountedPassengers (total served for stats)
        // does NOT affect totalFare (they already paid)
        const newOnboard = currentPassengersOnboard - 1;
        set({ currentPassengersOnboard: newOnboard });

        // update the database passenger count
        if (activeTrip) {
          get().updatePassengerCount(newOnboard);
        }
      },

      startTrip: async ({ driverId, vehicleId, routeId, latitude, longitude }) => {
        try {
          set({ isStartingTrip: true, error: null });

          set({
            fareEntries: [],
            totalFare: 0,
            regularPassengers: 0,
            discountedPassengers: 0,
            currentPassengersOnboard: 0,
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
            .eq('id', activeTrip.id)
            .eq('driver_id', activeTrip.driver_id);

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
          const { error, count } = await (supabase as any)
            .from('active_trips')
            .update(updateData)
            .eq('id', activeTrip.id)
            .eq('driver_id', activeTrip.driver_id);

          if (error) {
            throw new Error(error.message);
          }

          if (count === 0) {
            return { success: false, error: new Error('Trip not found or driver mismatch') };
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
            .eq('id', activeTrip.id)
            .eq('driver_id', activeTrip.driver_id);

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
            .eq('id', activeTrip.id)
            .eq('driver_id', activeTrip.driver_id);

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
            .eq('id', activeTrip.id)
            .eq('driver_id', activeTrip.driver_id);

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

      fetchMyActiveTrip: async (driverId: string) => {
        try {
          // fetch only the driver's own active trip, not other drivers' trips
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase as any)
            .from('active_trips')
            .select(`
              *,
              vehicle:vehicles(*),
              route:routes(*)
            `)
            .eq('driver_id', driverId)
            .maybeSingle();

          if (error) {
            console.error('Error fetching my active trip:', error);
            return { success: false, error: new Error(error.message) };
          }

          if (data) {
            // restore the trip and route from database
            set({
              activeTrip: data,
              selectedRoute: data.route || null,
              vehicle: data.vehicle || null,
              tripStartTime: new Date(data.started_at).getTime(),
            });
          } else {
            // no active trip for this driver, clear any stale data
            set({
              activeTrip: null,
              tripStartTime: null,
            });
          }

          return { success: true };
        } catch (err) {
          return { success: false, error: err as Error };
        }
      },

      clearForLogout: async () => {
        // completely clear trip state and persisted storage on logout
        set(initialState);
        await AsyncStorage.removeItem('jeepneygo-trip');
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
        currentPassengersOnboard: state.currentPassengersOnboard,
      }),
    }
  )
);
