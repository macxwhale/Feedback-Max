
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  enhanced_role?: string;
  status: string;
  created_at: string;
  expires_at: string;
  invited_by_user_id: string;
  invited_by?: { email: string };
}

export const useOrganizationInvitations = (organizationId: string) => {
  return useQuery({
    queryKey: ['organization-invitations', organizationId],
    queryFn: async (): Promise<PendingInvitation[]> => {
      console.log('Fetching organization invitations for:', organizationId);
      
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching organization invitations:', error);
        throw error;
      }

      // Fetch invited_by user details for each invitation
      const invitationsWithInviter = await Promise.all(
        (data || []).map(async (invitation) => {
          if (invitation.invited_by_user_id) {
            const { data: userData } = await supabase
              .from('organization_users')
              .select('email')
              .eq('user_id', invitation.invited_by_user_id)
              .eq('organization_id', organizationId)
              .single();
            
            return {
              ...invitation,
              invited_by: userData ? { email: userData.email } : null
            };
          }
          return { ...invitation, invited_by: null };
        })
      );

      console.log('Organization invitations fetched:', invitationsWithInviter);
      return invitationsWithInviter;
    },
    enabled: !!organizationId,
    retry: 3,
    retryDelay: 1000,
  });
};
