
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Define the member type that matches the RPC function return
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
      
      // Fetch organization users with invited_by information
      const { data, error } = await supabase
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
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching organization members:', error);
        throw error;
      }

      // Fetch invited_by user details for each member
      const membersWithInviter = await Promise.all(
        (data || []).map(async (member) => {
          let invited_by = null;
          
          if (member.invited_by_user_id) {
            // Try to get the inviter's email from organization_users first
            const { data: inviterData } = await supabase
              .from('organization_users')
              .select('email')
              .eq('user_id', member.invited_by_user_id)
              .eq('organization_id', organizationId)
              .single();
            
            if (inviterData) {
              invited_by = { email: inviterData.email };
            } else {
              // Fallback: try to get from auth.users via admin function if needed
              // For now, we'll just show as unknown
              invited_by = { email: 'Unknown' };
            }
          }
          
          return {
            ...member,
            invited_by
          };
        })
      );

      console.log('Organization members fetched:', membersWithInviter);
      return membersWithInviter;
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
