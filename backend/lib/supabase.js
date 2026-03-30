import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Vérifier que les variables d'environnement sont présentes
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is required in .env');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in .env');
}

/**
 * Client Supabase avec service role key
 * Utilisé côté serveur pour bypasser RLS si nécessaire
 */
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Client Supabase pour un utilisateur spécifique
 * Respecte les RLS policies
 * @param {string} accessToken - JWT token de l'utilisateur
 * @returns {SupabaseClient}
 */
export function createUserClient(accessToken) {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    }
  );
}
