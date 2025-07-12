
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface OrganizationInvitation {
  id: string;
  email: string;
  role: string;
  enhanced_role: string;
  status: string;
  created_at: string;
  expires_at: string;
  invited_by_user_id: string;
  organization_id: string;
  invited_by?: {
    email: string;
  };
}

export const useOrganizationInvitations = (organizationId: string) => {
  return useQuery({
    queryKey: ['organization-invitations', organizationId],
    queryFn: async (): Promise<OrganizationInvitation[]> => {
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
          invited_by_user_id,
          organization_id
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching organization invitations:', error);
        throw error;
      }

      // Fetch invited_by user information separately to avoid RLS issues
      const invitationsWithInvitedBy = await Promise.all(
        (data || []).map(async (invitation) => {
          if (invitation.invited_by_user_id) {
            try {
              const { data: orgUser } = await supabase
                .from('organization_users')
                .select('email')
                .eq('user_id', invitation.invited_by_user_id)
                .eq('organization_id', organizationId)
                .single();
              
              return {
                ...invitation,
                invited_by: orgUser ? { email: orgUser.email } : null
              };
            } catch (error) {
              console.error('Error fetching invited by user:', error);
              return {
                ...invitation,
                invited_by: null
              };
            }
          }
          return invitation;
        })
      );

      return invitationsWithInvitedBy;
    },
    enabled: !!organizationId,
    retry: 2,
    staleTime: 30 * 1000, // 30 seconds
  });
};
