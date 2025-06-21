
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { MessageSquare } from 'lucide-react';
import { AfricasTalkingSettings } from './sms/AfricasTalkingSettings';
import { SmsStatusToggle } from './sms/SmsStatusToggle';
import { WebhookUrlDisplay } from './sms/WebhookUrlDisplay';
import { SmsProvidersList } from './sms/SmsProvidersList';
import { smsProviders } from './sms/smsProviders';
import { getSmsSettingsValue } from './sms/utils';
import { supabase } from '@/integrations/supabase/client';

export const SmsIntegrations: React.FC = () => {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const { data: orgData, isLoading } = useQuery({
    queryKey: ['organization-sms', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return null;
      const { data, error } = await supabase
        .from('organizations')
        .select('sms_enabled, sms_sender_id, sms_settings, webhook_secret')
        .eq('id', organization.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
  });

  const updateSmsStatus = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { data, error } = await supabase.functions.invoke('update-sms-settings', {
        body: {
          orgId: organization!.id,
          enabled,
          senderId: orgData?.sms_sender_id || '',
          username: getSmsSettingsValue(orgData?.sms_settings, 'username'),
          apiKey: getSmsSettingsValue(orgData?.sms_settings, 'apiKey')
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "SMS status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['organization-sms', organization?.id] });
    },
    onError: (error) => {
      toast({ 
        title: "Error updating SMS status", 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const handleToggleSms = (enabled: boolean) => {
    updateSmsStatus.mutate(enabled);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            SMS Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          SMS Integrations
        </CardTitle>
        <CardDescription>
          Enable SMS feedback collection from your customers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SmsStatusToggle
          enabled={orgData?.sms_enabled || false}
          onToggle={handleToggleSms}
          isLoading={updateSmsStatus.isPending}
        />

        <WebhookUrlDisplay
          webhookSecret={orgData?.webhook_secret || ''}
          isVisible={orgData?.sms_enabled || false}
        />

        <SmsProvidersList
          providers={smsProviders}
          selectedProvider={selectedProvider}
          onProviderSelect={setSelectedProvider}
        />

        {selectedProvider === 'africastalking' && (
          <AfricasTalkingSettings 
            organization={organization!}
            currentSettings={orgData}
            onSettingsUpdate={() => {
              queryClient.invalidateQueries({ queryKey: ['organization-sms', organization?.id] });
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};
