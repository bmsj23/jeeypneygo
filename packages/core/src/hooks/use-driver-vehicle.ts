import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Vehicle } from '../types/models';

interface UseDriverVehicleReturn {
  vehicle: Vehicle | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useDriverVehicle(driverId: string | undefined): UseDriverVehicleReturn {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVehicle = async () => {
    if (!driverId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('driver_id', driverId)
        .eq('is_active', true)
        .single();

      if (queryError) {
        // no vehicle assigned is not an error, just means driver has no vehicle
        if (queryError.code === 'PGRST116') {
          setVehicle(null);
        } else {
          throw new Error(queryError.message);
        }
      } else {
        setVehicle(data);
      }
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching driver vehicle:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicle();
  }, [driverId]);

  return {
    vehicle,
    isLoading,
    error,
    refetch: fetchVehicle,
  };
}
