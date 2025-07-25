// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rigurrwjiaucodxuuzeh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZ3VycndqaWF1Y29keHV1emVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NDI1NTYsImV4cCI6MjA2NTMxODU1Nn0.nr5QAlB0UyA3VQWXolIsc8lXXzwj0Ur6Nj-ddr7f7AQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});