
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AuditLogParams {
  action: string;
  resourceType: string;
  resourceId?: string;
  organizationId?: string;
  oldValues?: any;
  newValues?: any;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: any;
}

export const useAuditLogging = () => {
  return useMutation({
    mutationFn: async (params: AuditLogParams) => {
      const { data, error } = await supabase.rpc('log_admin_action', {
        p_action: params.action,
        p_resource_type: params.resourceType,
        p_resource_id: params.resourceId || null,
        p_organization_id: params.organizationId || null,
        p_old_values: params.oldValues || null,
        p_new_values: params.newValues || null,
        p_severity: params.severity || 'info',
        p_metadata: params.metadata || {}
      });

      if (error) throw error;
      return data;
    }
  });
};
