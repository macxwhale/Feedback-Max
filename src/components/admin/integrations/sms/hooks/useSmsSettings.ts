
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { getSmsSettingsValue } from '../utils';

export const useSmsSettings = () => {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  const { data: orgData, isLoading, error } = useQuery({
    queryKey: ['organization-sms-settings', organization?.id],
    queryFn: async () => {
      console.log('Fetching SMS settings for organization:', organization?.id);
      
      const { data, error } = await supabase
        .from('organizations')
        .select('sms_enabled, sms_sender_id, sms_settings, webhook_secret')
        .eq('id', organization!.id)
        .single();
      
      if (error) {
        console.error('Error fetching organization SMS settings:', error);
        throw error;
      }
      
      console.log('Organization SMS settings fetched:', data);
      return data;
    },
    enabled: !!organization?.id,
    retry: 3,
    retryDelay: 1000,
  });

  const updateSmsStatus = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!organization?.id) {
        throw new Error('Organization not found');
      }

      console.log('Updating SMS status:', { enabled, orgId: organization.id });
      
      const { data, error } = await supabase.functions.invoke('update-sms-settings', {
        body: {
          orgId: organization.id,
          enabled,
          senderId: orgData?.sms_sender_id || '',
          username: getSmsSettingsValue(orgData?.sms_settings, 'username'),
          apiKey: getSmsSettingsValue(orgData?.sms_settings, 'apiKey')
        }
      });
      
      if (error) {
        console.error('SMS status update error:', error);
        throw new Error(error.message || 'Failed to update SMS settings');
      }
      
      console.log('SMS status updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      toast({ title: "SMS status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['organization-sms-settings', organization?.id] });
    },
    onError: (error: any) => {
      console.error('SMS toggle error:', error);
      toast({ 
        title: "Error updating SMS status", 
        description: error.message || 'An unexpected error occurred', 
        variant: 'destructive' 
      });
    }
  });

  return {
    orgData,
    isLoading,
    error,
    updateSmsStatus,
    organization
  };
};
