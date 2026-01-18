import type { Database } from './database';

// table row types
export type User = Database['public']['Tables']['users']['Row'];
export type Vehicle = Database['public']['Tables']['vehicles']['Row'];
export type Route = Database['public']['Tables']['routes']['Row'];
export type Stop = Database['public']['Tables']['stops']['Row'];
export type ActiveTrip = Database['public']['Tables']['active_trips']['Row'];
export type LocationHistory = Database['public']['Tables']['location_history']['Row'];
export type TripHistory = Database['public']['Tables']['trip_history']['Row'];
export type UserFavorite = Database['public']['Tables']['user_favorites']['Row'];

// enums
export type UserRole = Database['public']['Enums']['user_role'];
export type TripStatus = Database['public']['Enums']['trip_status'];

// extended types with relations
export interface ActiveTripWithDetails extends ActiveTrip {
  vehicle: Vehicle;
  driver: Pick<User, 'id' | 'display_name'>;
  route: Route;
}

export interface StopWithRoute extends Stop {
  route: Route;
}

export interface RouteWithStops extends Route {
  stops: Stop[];
}

// auth types
export interface AuthState {
  user: User | null;
  session: { access_token: string; refresh_token: string } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// location types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationUpdate extends Coordinates {
  heading: number;
  speed: number;
  timestamp: number;
}
