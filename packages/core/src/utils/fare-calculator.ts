import type { Route, Stop } from '../types/models';
import { calculateDistance } from './eta-calculator';

const MINIMUM_FARE = 13;
const FARE_PER_KM = 1.8;
const DISCOUNT_RATE = 0.2; // 20% discount for students, seniors, pwd

export interface FareCalculation {
  baseFare: number;
  distanceKm: number;
  regularFare: number;
  discountedFare: number;
}

export function calculateFare(
  route: Pick<Route, 'base_fare' | 'per_km_rate'>,
  distanceKm: number
): FareCalculation {
  const baseFare = route.base_fare ?? MINIMUM_FARE;
  const perKmRate = route.per_km_rate ?? FARE_PER_KM;

  const additionalKm = Math.max(0, distanceKm - 4);
  const regularFare = baseFare + additionalKm * perKmRate;

  const roundedFare = Math.round(regularFare);
  const discountedFare = Math.round(roundedFare * (1 - DISCOUNT_RATE));

  return {
    baseFare,
    distanceKm,
    regularFare: roundedFare,
    discountedFare,
  };
}

export function calculateFareBetweenStops(
  route: Pick<Route, 'base_fare' | 'per_km_rate'>,
  fromStop: Pick<Stop, 'latitude' | 'longitude'>,
  toStop: Pick<Stop, 'latitude' | 'longitude'>
): FareCalculation {
  const distanceKm = calculateDistance(
    { latitude: fromStop.latitude, longitude: fromStop.longitude },
    { latitude: toStop.latitude, longitude: toStop.longitude }
  );

  return calculateFare(route, distanceKm);
}

export function formatFare(amount: number): string {
  return `₱${amount.toFixed(2)}`;
}
