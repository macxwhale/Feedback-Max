
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/components/auth/AuthWrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { MessageSquare } from 'lucide-react';
import { AfricasTalkingSettings } from './sms/AfricasTalkingSettings';
import { SmsStatusToggle } from './sms/SmsStatusToggle';
import { WebhookUrlDisplay } from './sms/WebhookUrlDisplay';
import { SmsProvidersList } from './sms/SmsProvidersList';
import { PhoneNumberManagement } from './sms/PhoneNumberManagement';
import { SmsCampaigns } from './sms/SmsCampaigns';
import { smsProviders } from './sms/smsProviders';
import { getSmsSettingsValue } from './sms/utils';
import { supabase } from '@/integrations/supabase/client';

export const SmsIntegrations: React.FC = () => {
  const { organization } = useOrganization();
  const { isAdmin, isOrgAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // Check if user has admin access
  const hasAdminAccess = isAdmin || isOrgAdmin;

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
    enabled: !!organization?.id && hasAdminAccess,
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

  if (!hasAdminAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            SMS Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You need admin access to manage SMS integrations.
          </p>
        </CardContent>
      </Card>
    );
  }

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

  const isSmsConfigured = orgData?.sms_enabled && 
    getSmsSettingsValue(orgData?.sms_settings, 'username') && 
    getSmsSettingsValue(orgData?.sms_settings, 'apiKey');

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          SMS Integrations
        </CardTitle>
        <CardDescription>
          Enable SMS feedback collection from your customers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        {/* SMS Management Tabs - Only show if SMS is configured */}
        {isSmsConfigured && (
          <div className="mt-6">
            <Tabs defaultValue="phone-numbers" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="phone-numbers">Phone Numbers</TabsTrigger>
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              </TabsList>
              
              <TabsContent value="phone-numbers" className="mt-6">
                <PhoneNumberManagement />
              </TabsContent>
              
              <TabsContent value="campaigns" className="mt-6">
                <SmsCampaigns />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
