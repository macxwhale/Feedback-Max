
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

export const useOrganizationMembers = (organizationId: string) => {
  return useQuery({
    queryKey: ['organization-members', organizationId],
    queryFn: async (): Promise<MemberWithInviter[]> => {
      console.log('Fetching organization members for:', organizationId);
      
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

      const membersWithInviter = await Promise.all(
        (data || []).map(async (member) => {
          let invited_by = null;
          
          if (member.invited_by_user_id) {
            const { data: inviterData } = await supabase
              .from('organization_users')
              .select('email')
              .eq('user_id', member.invited_by_user_id)
              .eq('organization_id', organizationId)
              .single();
            
            if (inviterData) {
              invited_by = { email: inviterData.email };
            } else {
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
};

export const useActiveMembers = (organizationId: string) => {
  const { data: membersData, ...rest } = useOrganizationMembers(organizationId);
  
  const activeMembers = membersData?.filter((member: MemberWithInviter) => 
    member.status === 'active'
  ) || [];

  return {
    activeMembers,
    ...rest
  };
};
