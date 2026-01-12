import { createClient } from '@supabase/supabase-js';

// Client Supabase externe pour les données géospatiales (PostGIS)
// IMPORTANT: Ces clés sont stockées dans les secrets Lovable Cloud
const supabaseUrl = import.meta.env.VITE_EXTERNAL_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_EXTERNAL_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_EXTERNAL_SUPABASE_SERVICE_KEY;

// Validation des variables d'environnement
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Variables d\'environnement Supabase Geo non configurées.\n' +
    'Les fonctionnalités géospatiales seront limitées.'
  );
}

// Créer le client seulement si les variables sont disponibles
export const supabaseGeo = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Client admin avec service_role (bypass RLS)
export const supabaseGeoAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabaseGeo;

// Helper pour sync user entre Lovable et Supabase externe
export async function ensureUserInGeo(userId: string, username?: string) {
  try {
    const { error } = await supabaseGeo
      .from('user_profiles')
      .upsert(
        { 
          id: userId,
          username: username || 'Explorer',
          created_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );
    
    if (error) {
      console.error('Error syncing user to geo DB:', error);
    }
  } catch (err) {
    console.error('Exception syncing user:', err);
  }
}
