import type { Coordinates } from '../types/models';

const EARTH_RADIUS_KM = 6371;

const AVERAGE_SPEED_KMH = 15;

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function calculateETA(
  jeepneyLocation: Coordinates,
  stopLocation: Coordinates,
  speedKmh: number = AVERAGE_SPEED_KMH
): number {
  const distanceKm = calculateDistance(jeepneyLocation, stopLocation);
  const timeHours = distanceKm / speedKmh;
  return Math.round(timeHours * 60);
}

export function formatETA(minutes: number): string {
  if (minutes < 1) {
    return 'Arriving';
  }
  if (minutes === 1) {
    return '1 min';
  }
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) {
    return hours === 1 ? '1 hr' : `${hours} hrs`;
  }
  return `${hours} hr ${remainingMins} min`;
}

export function getTimeAgo(timestamp: string | Date): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 5) {
    return 'Just now';
  }
  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  return `${diffHours}h ago`;
}

export function isLocationStale(
  timestamp: string | Date,
  thresholdSeconds: number = 60
): boolean {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  return diffMs / 1000 > thresholdSeconds;
}
