
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { EnhancedRole } from '@/utils/userManagementUtils';

interface Member {
  id: string;
  user_id: string;
  email: string;
  role: string;
  enhanced_role?: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
  invited_by?: { email: string } | null;
}

export const useUserManagement = (organizationId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['organization-members', organizationId],
    queryFn: async () => {
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

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        invited_by: null
      })) as Member[];
    },
    enabled: !!organizationId,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: EnhancedRole }) => {
      const { error } = await supabase
        .from('organization_users')
        .update({ 
          enhanced_role: newRole,
          role: newRole, // Keep legacy role in sync for backward compatibility
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('organization_id', organizationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-members', organizationId] });
      toast({
        title: "Role updated",
        description: "Member role has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update role",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('organization_users')
        .delete()
        .eq('user_id', userId)
        .eq('organization_id', organizationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-members', organizationId] });
      toast({
        title: "Member removed",
        description: "Member has been removed from the organization.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove member",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleUpdateRole = (userId: string, newRole: EnhancedRole) => {
    updateRoleMutation.mutate({ userId, newRole });
  };

  const handleRemoveMember = (userId: string) => {
    removeMemberMutation.mutate(userId);
  };

  const activeMembers = members?.filter(m => m.status === 'active') || [];

  return {
    membersLoading,
    invitationsLoading: false, // Simplified - no separate invitations tracking
    handleUpdateRole,
    handleRemoveMember,
    handleCancelInvitation: () => {}, // Simplified - no invitation cancellation needed
    activeMembers,
    pendingInvitations: [], // Simplified - no separate pending invitations
  };
};
