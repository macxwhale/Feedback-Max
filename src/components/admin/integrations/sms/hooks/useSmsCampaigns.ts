
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthWrapper';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from '@/components/ui/use-toast';

export const useSmsCampaigns = () => {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  // Fetch campaigns
  const { data: campaigns = [], isLoading: campaignsLoading, error: campaignsError } = useQuery({
    queryKey: ['sms-campaigns', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data, error } = await supabase
        .from('sms_campaigns')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!organization?.id
  });

  // Fetch phone numbers
  const { data: phoneNumbers = [], isLoading: phoneNumbersLoading, error: phoneNumbersError } = useQuery({
    queryKey: ['sms-phone-numbers', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data, error } = await supabase
        .from('sms_phone_numbers')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!organization?.id
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async ({ name, template }: { name: string; template: string }) => {
      if (!organization?.id || !user?.id) throw new Error('Missing organization or user');

      const { data, error } = await supabase
        .from('sms_campaigns')
        .insert({
          organization_id: organization.id,
          name,
          message_template: template,
          created_by_user_id: user.id,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-campaigns'] });
      toast({
        title: "Success",
        description: "Campaign created successfully"
      });
    },
    onError: (error) => {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive"
      });
    }
  });

  // Update campaign mutation
  const updateCampaignMutation = useMutation({
    mutationFn: async ({ campaignId, name, template }: { 
      campaignId: string; 
      name: string; 
      template: string; 
    }) => {
      const { data, error } = await supabase
        .from('sms_campaigns')
        .update({
          name,
          message_template: template,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-campaigns'] });
      toast({
        title: "Success",
        description: "Campaign updated successfully"
      });
    },
    onError: (error) => {
      console.error('Error updating campaign:', error);
      toast({
        title: "Error",
        description: "Failed to update campaign",
        variant: "destructive"
      });
    }
  });

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const { error } = await supabase
        .from('sms_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-campaigns'] });
      toast({
        title: "Success",
        description: "Campaign deleted successfully"
      });
    },
    onError: (error) => {
      console.error('Error deleting campaign:', error);
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive"
      });
    }
  });

  // Send campaign mutation - Uses Flask wrapper only
  const sendCampaignMutation = useMutation({
    mutationFn: async ({ campaignId, isResend = false, isRetry = false }: { 
      campaignId: string; 
      isResend?: boolean; 
      isRetry?: boolean; 
    }) => {
      const { data, error } = await supabase.functions.invoke('send-sms-flask', {
        body: { 
          campaignId, 
          isResend, 
          isRetry 
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sms-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['sms-sends'] });
      
      toast({
        title: "Success",
        description: `Campaign sent successfully! ${data.sentCount}/${data.sentCount + data.failedCount} messages delivered.`
      });
    },
    onError: (error) => {
      console.error('Error sending campaign:', error);
      toast({
        title: "Error",
        description: "Failed to send campaign",
        variant: "destructive"
      });
    }
  });

  // Campaign control mutation (pause, resume, cancel)
  const campaignControlMutation = useMutation({
    mutationFn: async ({ campaignId, action }: { campaignId: string; action: 'pause' | 'resume' | 'cancel' }) => {
      let status: string;
      switch (action) {
        case 'pause':
          status = 'paused';
          break;
        case 'resume':
          status = 'sending';
          break;  
        case 'cancel':
          status = 'cancelled';
          break;
        default:
          throw new Error('Invalid action');
      }

      const { error } = await supabase
        .from('sms_campaigns')
        .update({ status })
        .eq('id', campaignId);

      if (error) throw error;
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['sms-campaigns'] });
      toast({
        title: "Success",
        description: `Campaign ${action}d successfully`
      });
    },
    onError: (error) => {
      console.error('Error controlling campaign:', error);
      toast({
        title: "Error",
        description: "Failed to update campaign status",
        variant: "destructive"
      });
    }
  });

  return {
    campaigns,
    campaignsLoading,
    campaignsError,
    phoneNumbers,
    phoneNumbersLoading,
    phoneNumbersError,
    createCampaignMutation,
    updateCampaignMutation,
    deleteCampaignMutation,
    sendCampaignMutation,
    campaignControlMutation,
    organization
  };
};
