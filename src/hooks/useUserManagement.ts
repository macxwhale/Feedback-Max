
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

interface Invitation {
  id: string;
  email: string;
  role: string;
  enhanced_role?: string;
  status: string;
  created_at: string;
  expires_at: string;
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

  const { data: invitations, isLoading: invitationsLoading } = useQuery({
    queryKey: ['organization-invitations', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_invitations')
        .select(`
          id,
          email,
          role,
          enhanced_role,
          status,
          created_at,
          expires_at,
          invited_by_user_id
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString()) // Only show non-expired invitations
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Error fetching invitations:', error);
        return [];
      }
      
      return (data || []).map(item => ({
        ...item,
        invited_by: null
      })) as Invitation[];
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

  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('user_invitations')
        .update({ 
          status: 'cancelled', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-invitations', organizationId] });
      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to cancel invitation",
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

  const handleCancelInvitation = (invitationId: string) => {
    cancelInvitationMutation.mutate(invitationId);
  };

  const activeMembers = members?.filter(m => m.status === 'active') || [];
  const pendingInvitations = invitations || [];

  return {
    membersLoading,
    invitationsLoading,
    handleUpdateRole,
    handleRemoveMember,
    handleCancelInvitation,
    activeMembers,
    pendingInvitations,
  };
};
