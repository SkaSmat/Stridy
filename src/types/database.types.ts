// ===========================================================
// APPLICATION TYPES
// Types TypeScript pour l'application City Explorer
// ===========================================================
// Note: Ces types sont créés manuellement. Pour les régénérer depuis Supabase:
// npx supabase gen types typescript --project-id anujltoavoafclklucdx > src/integrations/supabase/types.ts

// ===========================================================
// DATABASE TABLES
// ===========================================================

export interface UserProfile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
  public_profile: boolean
  total_distance_meters: number
  total_streets_explored: number
  current_streak: number
  last_activity_date: string | null
}

export interface GPSTrack {
  id: string
  user_id: string
  city: string
  route_geometry: string // PostGIS LineString WKT format
  distance_meters: number
  duration_seconds: number
  started_at: string
  ended_at: string
  created_at: string
  source: 'gps' | 'strava'
  strava_activity_id: number | null
}

export interface ExploredStreet {
  id: string
  user_id: string
  city: string
  osm_id: number
  street_name: string | null
  street_geometry: string | null // PostGIS LineString WKT format
  first_explored_at: string
  times_explored: number
}

export interface CityProgress {
  id: string
  user_id: string
  city: string
  streets_explored: number
  total_distance_meters: number
  last_activity: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  unlocked_at: string
}

export interface StravaConnection {
  id: string
  user_id: string
  strava_athlete_id: number
  access_token: string
  refresh_token: string
  expires_at: string
  athlete_data: {
    id: number
    username: string
    firstname: string
    lastname: string
    profile: string
  }
  connected_at: string
  athlete_username: string | null
  athlete_firstname: string | null
  athlete_lastname: string | null
  athlete_profile: string | null
}

// ===========================================================
// RPC FUNCTION RETURN TYPES
// ===========================================================

export interface UserStats {
  total_distance: number
  total_streets: number
  total_cities: number
  current_streak: number
}

export interface LeaderboardEntry {
  user_id: string
  username: string
  avatar_url: string | null
  streets_explored: number
  total_distance_meters: number
}

// ===========================================================
// SUPABASE QUERY TYPES
// ===========================================================

export type UserProfileInsert = Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
export type UserProfileUpdate = Partial<UserProfileInsert>

export type GPSTrackInsert = Omit<GPSTrack, 'id' | 'created_at'>
export type GPSTrackUpdate = Partial<GPSTrackInsert>

export type ExploredStreetInsert = Omit<ExploredStreet, 'id' | 'first_explored_at'>
export type ExploredStreetUpdate = Partial<ExploredStreetInsert>

export type CityProgressInsert = Omit<CityProgress, 'id'>
export type CityProgressUpdate = Partial<CityProgressInsert>

export type StravaConnectionInsert = Omit<StravaConnection, 'id' | 'connected_at'>
export type StravaConnectionUpdate = Partial<StravaConnectionInsert>

// ===========================================================
// SUPABASE CLIENT HELPER TYPES
// ===========================================================

// Type-safe Supabase client for specific tables
export type TypedSupabaseClient = {
  from(table: 'user_profiles'): any // Will be properly typed below
  from(table: 'gps_tracks'): any
  from(table: 'explored_streets'): any
  from(table: 'city_progress'): any
  from(table: 'user_badges'): any
  from(table: 'strava_connections'): any
  rpc(fn: 'calculate_explored_streets_v2', params: {
    p_track_id: string
    p_user_id: string
    p_explored_osm_ids: number[]
    p_city: string
  }): Promise<{ data: number | null; error: any }>
  rpc(fn: 'get_user_stats', params: {
    p_user_id: string
  }): Promise<{ data: UserStats | null; error: any }>
  rpc(fn: 'get_city_leaderboard', params: {
    p_city: string
    p_limit?: number
  }): Promise<{ data: LeaderboardEntry[] | null; error: any }>
}

// ===========================================================
// HOW TO REGENERATE THESE TYPES
// ===========================================================
// 1. Make sure you have Supabase CLI installed: npm install -g supabase
// 2. Login: npx supabase login
// 3. Generate types:
//    npx supabase gen types typescript --project-id anujltoavoafclklucdx > src/integrations/supabase/types-generated.ts
// 4. Review the generated file and merge with these manual types
// 5. Update imports across the codebase
