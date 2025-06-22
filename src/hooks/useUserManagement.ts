
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface UseUserManagementProps {
  organizationId: string;
}

export const useUserManagement = (organizationId: string) => {
  const queryClient = useQueryClient();

  const {
    data: membersData,
    isLoading: membersLoading,
    error: membersError,
  } = useQuery({
    queryKey: ['organization-members', organizationId],
    queryFn: async () => {
      console.log('Fetching organization members for:', organizationId);
      
      // Use the RPC function instead of direct table access to avoid RLS issues
      const { data, error } = await supabase.rpc('get_organization_members', {
        p_org_id: organizationId
      });

      if (error) {
        console.error('Error fetching organization members:', error);
        throw error;
      }

      console.log('Organization members fetched:', data);
      return data || [];
    },
    enabled: !!organizationId,
    retry: 3,
    retryDelay: 1000,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      console.log('Updating user role:', { userId, newRole, organizationId });
      
      const { data, error } = await supabase
        .from('organization_users')
        .update({ 
          enhanced_role: newRole,
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

  const handleUpdateRole = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, newRole });
  };

  const activeMembers = membersData?.filter((member: any) => 
    member.status === 'active'
  ) || [];

  return {
    activeMembers,
    membersLoading,
    membersError,
    handleUpdateRole,
    updateRoleMutation,
  };
};
