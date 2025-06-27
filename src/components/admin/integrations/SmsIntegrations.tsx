
import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthWrapper';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { AfricasTalkingSettings } from './sms/AfricasTalkingSettings';
import { SmsStatusToggle } from './sms/SmsStatusToggle';
import { FlaskWrapperToggle } from './sms/FlaskWrapperToggle';
import { WebhookUrlDisplay } from './sms/WebhookUrlDisplay';
import { SmsProvidersList } from './sms/SmsProvidersList';
import { smsProviders } from './sms/smsProviders';
import { validateSmsSettings } from './sms/utils';
import { SmsIntegrationsHeader } from './sms/components/SmsIntegrationsHeader';
import { SmsLoadingState } from './sms/components/SmsLoadingState';
import { SmsErrorState } from './sms/components/SmsErrorState';
import { SmsAccessDenied } from './sms/components/SmsAccessDenied';
import { SmsManagementTabs } from './sms/components/SmsManagementTabs';
import { useSmsSettings } from './sms/hooks/useSmsSettings';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const SmsIntegrations: React.FC = () => {
  const { isAdmin, isOrgAdmin } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const { orgData, isLoading, error, updateSmsStatus, organization } = useSmsSettings();
  const queryClient = useQueryClient();

  const hasAdminAccess = isAdmin || isOrgAdmin;

  const updateFlaskWrapperMutation = useMutation({
    mutationFn: async (useFlaskWrapper: boolean) => {
      if (!organization?.id) throw new Error('Organization not found');

      const { error } = await supabase
        .from('organizations')
        .update({
          sms_integration_type: useFlaskWrapper ? 'flask_wrapper' : 'direct'
        })
        .eq('id', organization.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-settings'] });
      toast({
        title: "Success",
        description: "SMS integration method updated successfully"
      });
    },
    onError: (error) => {
      console.error('Error updating Flask wrapper setting:', error);
      toast({
        title: "Error",
        description: "Failed to update SMS integration method",
        variant: "destructive"
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

  const handleToggleFlaskWrapper = (enabled: boolean) => {
    if (!hasAdminAccess) {
      toast({ 
        title: "Access denied", 
        description: "You need admin access to manage SMS settings", 
        variant: 'destructive' 
      });
      return;
    }

    updateFlaskWrapperMutation.mutate(enabled);
  };

  // Early returns for different states
  if (!hasAdminAccess) {
    return <SmsAccessDenied />;
  }

  if (isLoading) {
    return <SmsLoadingState />;
  }

  if (error) {
    const errorMessage = typeof error === 'string' ? error : 'Failed to load SMS settings';
    return <SmsErrorState message={errorMessage} />;
  }

  const isSmsConfigured = orgData?.sms_enabled && validateSmsSettings(orgData?.sms_settings);
  const isFlaskWrapper = orgData?.sms_integration_type === 'flask_wrapper';

  return (
    <div className="w-full">
      <Card className="w-full">
        <SmsIntegrationsHeader />
        <CardContent className="space-y-6 p-6">
          <SmsStatusToggle
            enabled={orgData?.sms_enabled || false}
            onToggle={handleToggleSms}
            isLoading={updateSmsStatus.isPending}
          />

          {orgData?.sms_enabled && (
            <>
              <FlaskWrapperToggle
                enabled={isFlaskWrapper}
                onToggle={handleToggleFlaskWrapper}
                isLoading={updateFlaskWrapperMutation.isPending}
              />

              <WebhookUrlDisplay
                webhookSecret={orgData?.webhook_secret || ''}
                isVisible={true}
                isFlaskWrapper={isFlaskWrapper}
              />
            </>
          )}

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
                // This will be handled by the hook's query invalidation
              }}
            />
          )}

          {isSmsConfigured && (
            <div className="w-full">
              <SmsManagementTabs />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
