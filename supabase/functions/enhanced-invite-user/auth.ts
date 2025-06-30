
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const authenticateUser = async (
  supabaseClient: SupabaseClient
): Promise<{ user?: any; error?: string }> => {
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
  
  if (userError || !user) {
    console.error('Failed to get user:', userError);
    return { error: 'Invalid authentication token' };
  }

  console.log('User authenticated:', user.email);
  return { user };
};

export const findExistingUser = async (
  supabaseAdmin: SupabaseClient,
  email: string
): Promise<{ userId?: string; exists: boolean }> => {
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const userExists = existingUsers.users.find(u => u.email === email.toLowerCase().trim());
  
  return {
    userId: userExists?.id,
    exists: !!userExists
  };
};
