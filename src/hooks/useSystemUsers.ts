
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SystemUser {
  id: string;
  user_id: string;
  email: string;
  role: string;
  enhanced_role?: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
  organization_id: string;
  organizations: {
    name: string;
    slug: string;
  };
  organization_user_created_at?: string | null;
}

export interface SystemInvitation {
  id: string;
  email: string;
  role: string;
  enhanced_role?: string;
  status: string;
  created_at: string;
  expires_at: string;
  organization_id: string;
  organizations: {
    name: string;
    slug: string;
  };
}

interface SystemUserManagementData {
  users: SystemUser[];
  invitations: SystemInvitation[];
}

export const useSystemUserManagementData = () => {
  return useQuery({
    queryKey: ['system-user-management'],
    queryFn: async (): Promise<SystemUserManagementData> => {
      const { data, error } = await supabase.functions.invoke('system-user-management');
      
      if (error) {
        if (error.context && typeof error.context.json === 'function') {
          try {
            const errorBody = await error.context.json();
            if (errorBody.error) {
              throw new Error(errorBody.error);
            }
          } catch (e) {
            // Ignore JSON parsing errors
          }
        }
        throw new Error(`Failed to fetch system user data: ${error.message}`);
      }

      // Process data to use enhanced roles consistently
      const processedData = {
        ...data,
        users: (data?.users || []).map((user: any) => ({
          ...user,
          organization_user_created_at: user.organization_user_created_at ?? user.created_at ?? null,
          // Prioritize enhanced_role, fallback to role for display
          role: user.enhanced_role || user.role || 'member',
        })),
        invitations: (data?.invitations || []).map((invitation: any) => ({
          ...invitation,
          // Prioritize enhanced_role, fallback to role for display
          role: invitation.enhanced_role || invitation.role || 'member',
        })),
      };

      return processedData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export interface AssignUserToOrgInput {
  userId: string;
  email: string;
  organizationId: string;
  role: string;
}

export const useAssignUserToOrg = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      email,
      organizationId,
      role,
    }: AssignUserToOrgInput) => {
      const { data, error } = await supabase.functions.invoke('assign-user-to-org', {
        body: { user_id: userId, organization_id: organizationId, role },
      });

      if (error) {
        if (error.context && typeof error.context.json === 'function') {
          try {
            const errorBody = await error.context.json();
            if (errorBody.error) {
              throw new Error(errorBody.error);
            }
          } catch {}
        }
        throw new Error(error.message || 'An unknown error occurred.');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-user-management'] });
    },
  });
};

export const useApproveAllInvitations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<{ approvedCount: number; failedCount: number }> => {
      const { data, error } = await supabase.functions.invoke('admin-approve-invitations');

      if (error) {
        if (error.context && typeof error.context.json === 'function') {
          try {
            const errorBody = await error.context.json();
            if (errorBody.error) {
              throw new Error(errorBody.error);
            }
          } catch {}
        }
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-user-management'] });
    },
  });
};
