
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useUpdateUserRole = (organizationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      console.log('Updating user role:', { userId, newRole, organizationId });
      
      const { data, error } = await supabase
        .from('organization_users')
        .update({ 
          enhanced_role: newRole as 'owner' | 'admin' | 'manager' | 'analyst' | 'member' | 'viewer',
          role: newRole === 'owner' || newRole === 'admin' ? 'admin' : 'member'
        })
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user role:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast({ title: "User role updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['organization-members', organizationId] });
    },
    onError: (error: any) => {
      console.error('Role update error:', error);
      toast({ 
        title: "Error updating user role", 
        description: error.message || 'An unexpected error occurred', 
        variant: 'destructive' 
      });
    }
  });
};
