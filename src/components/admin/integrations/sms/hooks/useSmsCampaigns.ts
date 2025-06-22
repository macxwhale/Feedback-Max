
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useSmsCampaigns = () => {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['sms-campaigns', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_campaigns')
        .select('*')
        .eq('organization_id', organization!.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id
  });

  const { data: phoneNumbers } = useQuery({
    queryKey: ['sms-phone-numbers', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_phone_numbers')
        .select('*')
        .eq('organization_id', organization!.id)
        .eq('status', 'active');
      
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id
  });

  const createCampaignMutation = useMutation({
    mutationFn: async ({ name, template }: { name: string; template: string }) => {
      const { data, error } = await supabase
        .from('sms_campaigns')
        .insert({
          organization_id: organization!.id,
          name: name.trim(),
          message_template: template.trim(),
          total_recipients: phoneNumbers?.length || 0
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Campaign created successfully" });
      queryClient.invalidateQueries({ queryKey: ['sms-campaigns', organization?.id] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error creating campaign", 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async ({ campaignId, isResend = false }: { campaignId: string; isResend?: boolean }) => {
      if (!phoneNumbers || phoneNumbers.length === 0) {
        throw new Error('No active phone numbers found');
      }

      const campaign = campaigns?.find(c => c.id === campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

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

      // Call the send-sms edge function
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          phoneNumbers: targetPhoneNumbers,
          message: campaign.message_template,
          organizationId: organization!.id,
          campaignId: campaignId
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      const action = variables.isResend ? 'Resent' : 'Sent';
      toast({ 
        title: `Campaign ${action.toLowerCase()} successfully`,
        description: `${action} to ${data.summary.sent} recipients`
      });
      queryClient.invalidateQueries({ queryKey: ['sms-campaigns', organization?.id] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error sending campaign", 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  return {
    campaigns,
    campaignsLoading,
    phoneNumbers,
    createCampaignMutation,
    sendCampaignMutation,
    organization
  };
};
