
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface UseUserManagementProps {
  organizationId: string;
}

// Define the member type that matches what we expect from the RPC function
interface MemberWithInviter {
  id: string;
  user_id: string;
  email: string;
  role?: string;
  enhanced_role?: string;
  status: string;
  created_at: string;
  accepted_at?: string;
  invited_by?: { email: string } | null;
}

export const useUserManagement = (organizationId: string) => {
  const queryClient = useQueryClient();

  const {
    data: membersData,
    isLoading: membersLoading,
    error: membersError,
  } = useQuery({
    queryKey: ['organization-members', organizationId],
    queryFn: async (): Promise<MemberWithInviter[]> => {
      console.log('Fetching organization members for:', organizationId);
      
      // Get organization members with enhanced role information
      const { data: membersData, error: membersError } = await supabase
        .from('organization_users')
        .select(`
          id,
          user_id,
          email,
          role,
          enhanced_role,
          status,
          created_at,
          accepted_at,
          invited_by_user_id
        `)
        .eq('organization_id', organizationId);

      if (membersError) {
        console.error('Error fetching organization members:', membersError);
        throw membersError;
      }

      // Transform the data to match expected format
      const transformedData: MemberWithInviter[] = await Promise.all(
        (membersData || []).map(async (member) => {
          let invitedBy = null;
          
          if (member.invited_by_user_id) {
            const { data: inviterData } = await supabase
              .from('organization_users')
              .select('email')
              .eq('user_id', member.invited_by_user_id)
              .single();
            
            if (inviterData) {
              invitedBy = { email: inviterData.email };
            }
          }

          return {
            id: member.id,
            user_id: member.user_id,
            email: member.email,
            role: member.role || 'member',
            enhanced_role: member.enhanced_role || 'member',
            status: member.status,
            created_at: member.created_at,
            accepted_at: member.accepted_at,
            invited_by: invitedBy
          };
        })
      );

      console.log('Organization members fetched:', transformedData);
      return transformedData;
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

  const handleUpdateRole = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, newRole });
  };

  const activeMembers = membersData?.filter((member: MemberWithInviter) => 
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
