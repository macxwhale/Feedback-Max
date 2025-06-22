
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/components/auth/AuthWrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { AfricasTalkingSettings } from './sms/AfricasTalkingSettings';
import { SmsStatusToggle } from './sms/SmsStatusToggle';
import { WebhookUrlDisplay } from './sms/WebhookUrlDisplay';
import { SmsProvidersList } from './sms/SmsProvidersList';
import { PhoneNumberManagement } from './sms/PhoneNumberManagement';
import { SmsCampaigns } from './sms/SmsCampaigns';
import { smsProviders } from './sms/smsProviders';
import { getSmsSettingsValue, validateSmsSettings } from './sms/utils';
import { supabase } from '@/integrations/supabase/client';

export const SmsIntegrations: React.FC = () => {
  const { organization, isLoading: orgLoading, error: orgError } = useOrganization();
  const { isAdmin, isOrgAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // Check if user has admin access
  const hasAdminAccess = isAdmin || isOrgAdmin;

  // Early return if organization is still loading
  if (orgLoading) {
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

  // Handle organization loading error
  if (orgError || !organization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            SMS Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-sm text-red-600 mb-2">
              Organization not found or failed to load
            </p>
            <p className="text-xs text-gray-500">
              {typeof orgError === 'string' ? orgError : orgError?.message || 'Unable to load organization data'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { data: orgData, isLoading, error: orgDataError } = useQuery({
    queryKey: ['organization-sms-settings', organization.id],
    queryFn: async () => {
      console.log('Fetching SMS settings for organization:', organization.id);
      
      const { data, error } = await supabase
        .from('organizations')
        .select('sms_enabled, sms_sender_id, sms_settings, webhook_secret')
        .eq('id', organization.id)
        .single();
      
      if (error) {
        console.error('Error fetching organization SMS settings:', error);
        throw error;
      }
      
      console.log('Organization SMS settings fetched:', data);
      return data;
    },
    enabled: !!organization?.id && hasAdminAccess,
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
      queryClient.invalidateQueries({ queryKey: ['organization-sms-settings', organization.id] });
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

  const handleToggleSms = (enabled: boolean) => {
    if (!hasAdminAccess) {
      toast({ 
        title: "Access denied", 
        description: "You need admin access to manage SMS settings", 
        variant: 'destructive' 
      });
      return;
    }

    if (!organization?.id) {
      toast({ 
        title: "Error", 
        description: "Organization not found", 
        variant: 'destructive' 
      });
      return;
    }

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

  if (orgDataError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            SMS Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-sm text-red-600 mb-2">
              Failed to load SMS settings
            </p>
            <button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['organization-sms-settings', organization.id] })}
              className="text-sm text-blue-600 hover:underline"
            >
              Try again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isSmsConfigured = orgData?.sms_enabled && validateSmsSettings(orgData?.sms_settings);

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
      <CardContent className="space-y-6">
        <SmsStatusToggle
          enabled={orgData?.sms_enabled || false}
          onToggle={handleToggleSms}
          isLoading={updateSmsStatus.isPending}
        />

        {orgData?.sms_enabled && (
          <WebhookUrlDisplay
            webhookSecret={orgData?.webhook_secret || ''}
            isVisible={true}
          />
        )}

        <SmsProvidersList
          providers={smsProviders}
          selectedProvider={selectedProvider}
          onProviderSelect={setSelectedProvider}
        />

        {selectedProvider === 'africastalking' && (
          <AfricasTalkingSettings 
            organization={organization}
            currentSettings={orgData}
            onSettingsUpdate={() => {
              queryClient.invalidateQueries({ queryKey: ['organization-sms-settings', organization.id] });
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
