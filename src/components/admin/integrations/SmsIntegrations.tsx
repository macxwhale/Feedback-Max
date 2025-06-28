
import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthWrapper';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { SmsSettings } from './sms/SmsSettings';
import { SmsStatusToggle } from './sms/SmsStatusToggle';
import { WebhookUrlDisplay } from './sms/WebhookUrlDisplay';
import { SmsProvidersList } from './sms/SmsProvidersList';
import { validateSmsSettings } from './sms/utils';
import { SmsIntegrationsHeader } from './sms/components/SmsIntegrationsHeader';
import { SmsLoadingState } from './sms/components/SmsLoadingState';
import { SmsErrorState } from './sms/components/SmsErrorState';
import { SmsAccessDenied } from './sms/components/SmsAccessDenied';
import { SmsManagementTabs } from './sms/components/SmsManagementTabs';
import { useSmsSettings } from './sms/hooks/useSmsSettings';

export const SmsIntegrations: React.FC = () => {
  const { isAdmin, isOrgAdmin } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const { orgData, isLoading, error, updateSmsStatus, organization } = useSmsSettings();

  const hasAdminAccess = isAdmin || isOrgAdmin;

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
            <WebhookUrlDisplay
              webhookSecret={orgData?.webhook_secret || ''}
              isVisible={true}
              isFlaskWrapper={true}
            />
          )}

          <SmsProvidersList
            selectedProvider={selectedProvider}
            onProviderSelect={setSelectedProvider}
          />

          {selectedProvider === 'sms-provider' && (
            <SmsSettings 
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
