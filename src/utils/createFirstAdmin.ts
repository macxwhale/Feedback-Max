
import { supabase } from '@/integrations/supabase/client';

export const createFirstAdmin = async (userId: string, email: string) => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        email: email,
        is_super_admin: true,
        role: 'super_admin'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating first admin:', error);
      return { error };
    }

    console.log('First admin created successfully:', data);
    return { data };
  } catch (error) {
    console.error('Error creating first admin:', error);
    return { error };
  }
};
