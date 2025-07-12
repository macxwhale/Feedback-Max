
import { supabase } from '@/integrations/supabase/client';

/**
 * Get the Supabase anon key from the client configuration
 * This avoids hardcoding the key in multiple places
 */
export const getSupabaseAnonKey = (): string => {
  // Extract the anon key from the Supabase client
  // The anon key is available in the supabaseKey property of the client
  return (supabase as any).supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZ3VycndqaWF1Y29keHV1emVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NDI1NTYsImV4cCI6MjA2NTMxODU1Nn0.nr5QAlB0UyA3VQWXolIsc8lXXzwj0Ur6Nj-ddr7f7AQ';
};

/**
 * Create a redirect URL with the Supabase anon key included
 */
export const createAuthRedirectUrl = (path: string): string => {
  const baseUrl = window.location.origin;
  const anonKey = getSupabaseAnonKey();
  const separator = path.includes('?') ? '&' : '?';
  
  return `${baseUrl}${path}${separator}apikey=${anonKey}`;
};
