export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          phone: string | null;
          email: string | null;
          display_name: string | null;
          role: 'commuter' | 'driver' | 'admin';
          is_approved: boolean;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          phone?: string | null;
          email?: string | null;
          display_name?: string | null;
          role?: 'commuter' | 'driver' | 'admin';
          is_approved?: boolean;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string | null;
          email?: string | null;
          display_name?: string | null;
          role?: 'commuter' | 'driver' | 'admin';
          is_approved?: boolean;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          plate_number: string;
          capacity: number;
          driver_id: string | null;
          route_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plate_number: string;
          capacity?: number;
          driver_id?: string | null;
          route_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plate_number?: string;
          capacity?: number;
          driver_id?: string | null;
          route_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      routes: {
        Row: {
          id: string;
          name: string;
          short_name: string;
          color: string;
          base_fare: number;
          per_km_rate: number;
          operating_start: string;
          operating_end: string;
          is_active: boolean;
          polyline: string | null;
          waypoints: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          short_name: string;
          color?: string;
          base_fare?: number;
          per_km_rate?: number;
          operating_start?: string;
          operating_end?: string;
          is_active?: boolean;
          polyline?: string | null;
          waypoints?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          short_name?: string;
          color?: string;
          base_fare?: number;
          per_km_rate?: number;
          operating_start?: string;
          operating_end?: string;
          is_active?: boolean;
          polyline?: string | null;
          waypoints?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      stops: {
        Row: {
          id: string;
          route_id: string;
          name: string;
          latitude: number;
          longitude: number;
          order_index: number;
          landmark: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          route_id: string;
          name: string;
          latitude: number;
          longitude: number;
          order_index: number;
          landmark?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          route_id?: string;
          name?: string;
          latitude?: number;
          longitude?: number;
          order_index?: number;
          landmark?: string | null;
          created_at?: string;
        };
      };
      active_trips: {
        Row: {
          id: string;
          vehicle_id: string;
          driver_id: string;
          route_id: string;
          current_latitude: number;
          current_longitude: number;
          heading: number;
          speed: number;
          passenger_count: number;
          status: 'active' | 'paused' | 'completed';
          started_at: string;
          last_updated: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          driver_id: string;
          route_id: string;
          current_latitude: number;
          current_longitude: number;
          heading?: number;
          speed?: number;
          passenger_count?: number;
          status?: 'active' | 'paused' | 'completed';
          started_at?: string;
          last_updated?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          driver_id?: string;
          route_id?: string;
          current_latitude?: number;
          current_longitude?: number;
          heading?: number;
          speed?: number;
          passenger_count?: number;
          status?: 'active' | 'paused' | 'completed';
          started_at?: string;
          last_updated?: string;
        };
      };
      location_history: {
        Row: {
          id: string;
          trip_id: string;
          latitude: number;
          longitude: number;
          heading: number;
          speed: number;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          latitude: number;
          longitude: number;
          heading?: number;
          speed?: number;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          latitude?: number;
          longitude?: number;
          heading?: number;
          speed?: number;
          recorded_at?: string;
        };
      };
      trip_history: {
        Row: {
          id: string;
          vehicle_id: string;
          driver_id: string;
          route_id: string;
          started_at: string;
          ended_at: string;
          total_passengers: number;
          distance_km: number;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          driver_id: string;
          route_id: string;
          started_at: string;
          ended_at: string;
          total_passengers?: number;
          distance_km?: number;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          driver_id?: string;
          route_id?: string;
          started_at?: string;
          ended_at?: string;
          total_passengers?: number;
          distance_km?: number;
        };
      };
      user_favorites: {
        Row: {
          id: string;
          user_id: string;
          stop_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stop_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stop_id?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: 'commuter' | 'driver' | 'admin';
      trip_status: 'active' | 'paused' | 'completed';
    };
  };
}