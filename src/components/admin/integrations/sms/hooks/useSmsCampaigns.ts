
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useSmsCampaigns = () => {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading: campaignsLoading, error: campaignsError } = useQuery({
    queryKey: ['sms-campaigns', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      console.log('Fetching SMS campaigns for organization:', organization.id);
      
      const { data, error } = await supabase
        .from('sms_campaigns')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching SMS campaigns:', error);
        throw error;
      }
      
      console.log('SMS campaigns fetched:', data?.length || 0);
      return data || [];
    },
    enabled: !!organization?.id,
    retry: 2,
    retryDelay: 1000,
  });

  const { data: phoneNumbers, isLoading: phoneNumbersLoading, error: phoneNumbersError } = useQuery({
    queryKey: ['sms-phone-numbers', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      console.log('Fetching SMS phone numbers for organization:', organization.id);
      
      const { data, error } = await supabase
        .from('sms_phone_numbers')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('status', 'active');
      
      if (error) {
        console.error('Error fetching SMS phone numbers:', error);
        throw error;
      }
      
      console.log('SMS phone numbers fetched:', data?.length || 0);
      return data || [];
    },
    enabled: !!organization?.id,
    retry: 2,
    retryDelay: 1000,
  });

  const createCampaignMutation = useMutation({
    mutationFn: async ({ name, template }: { name: string; template: string }) => {
      if (!organization?.id) {
        throw new Error('Organization not found');
      }

      if (!name.trim()) {
        throw new Error('Campaign name is required');
      }

      if (!template.trim()) {
        throw new Error('Message template is required');
      }

      console.log('Creating SMS campaign:', { name, template, orgId: organization.id });
      
      const { data, error } = await supabase
        .from('sms_campaigns')
        .insert({
          organization_id: organization.id,
          name: name.trim(),
          message_template: template.trim(),
          total_recipients: phoneNumbers?.length || 0
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating SMS campaign:', error);
        throw error;
      }
      
      console.log('SMS campaign created:', data);
      return data;
    },
    onSuccess: () => {
      toast({ title: "Campaign created successfully" });
      queryClient.invalidateQueries({ queryKey: ['sms-campaigns', organization?.id] });
    },
    onError: (error: any) => {
      console.error('Create campaign error:', error);
      toast({ 
        title: "Error creating campaign", 
        description: error.message || 'An unexpected error occurred', 
        variant: 'destructive' 
      });
    }
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async ({ campaignId, isResend = false, isRetry = false }: { campaignId: string; isResend?: boolean; isRetry?: boolean }) => {
      if (!organization?.id) {
        throw new Error('Organization not found');
      }

      if (!phoneNumbers || phoneNumbers.length === 0) {
        throw new Error('No active phone numbers found');
      }

      const campaign = campaigns?.find(c => c.id === campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      console.log('Sending SMS campaign:', { campaignId, isResend, isRetry, recipientCount: phoneNumbers.length });

      // Update campaign status to sending
      await supabase
        .from('sms_campaigns')
        .update({ 
          status: 'sending',
          started_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      // For resend, only get failed phone numbers
      let targetPhoneNumbers = phoneNumbers.map(p => p.phone_number);
      
      if (isResend) {
        // Get failed sends for this campaign
        const { data: failedSends } = await supabase
          .from('sms_sends')
          .select('phone_number')
          .eq('campaign_id', campaignId)
          .eq('status', 'failed');
        
        if (failedSends && failedSends.length > 0) {
          targetPhoneNumbers = failedSends.map(s => s.phone_number);
        } else {
          throw new Error('No failed sends to retry for this campaign');
        }
      }

      // For retry, send to all numbers again
      if (isRetry) {
        targetPhoneNumbers = phoneNumbers.map(p => p.phone_number);
      }

      // Call the send-sms edge function
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          phoneNumbers: targetPhoneNumbers,
          message: campaign.message_template,
          organizationId: organization.id,
          campaignId: campaignId
        }
      });

      if (error) {
        console.error('Error sending SMS campaign:', error);
        throw new Error(error.message || 'Failed to send campaign');
      }

      console.log('SMS campaign sent successfully:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      let action = 'Sent';
      if (variables.isResend) action = 'Resent';
      if (variables.isRetry) action = 'Retried';
      
      toast({ 
        title: `Campaign ${action.toLowerCase()} successfully`,
        description: `${action} to ${data.summary.sent} recipients`
      });
      queryClient.invalidateQueries({ queryKey: ['sms-campaigns', organization?.id] });
    },
    onError: (error: any) => {
      console.error('Send campaign error:', error);
      toast({ 
        title: "Error sending campaign", 
        description: error.message || 'An unexpected error occurred', 
        variant: 'destructive' 
      });
    }
  });

  return {
    campaigns: campaigns || [],
    campaignsLoading,
    campaignsError,
    phoneNumbers: phoneNumbers || [],
    phoneNumbersLoading,
    phoneNumbersError,
    createCampaignMutation,
    sendCampaignMutation,
    organization
  };
};
