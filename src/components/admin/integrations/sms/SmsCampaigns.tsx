
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, AlertCircle } from 'lucide-react';
import { useSmsCampaigns } from './hooks/useSmsCampaigns';
import { CampaignCreateForm } from './components/CampaignCreateForm';
import { CampaignsList } from './components/CampaignsList';
import { EmptyPhoneNumbersState } from './components/EmptyPhoneNumbersState';

export const SmsCampaigns: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const {
    campaigns,
    campaignsLoading,
    campaignsError,
    phoneNumbers,
    phoneNumbersLoading,
    phoneNumbersError,
    createCampaignMutation,
    sendCampaignMutation,
    organization
  } = useSmsCampaigns();

  const handleCreateCampaign = (name: string, template: string) => {
    createCampaignMutation.mutate({
      name,
      template
    }, {
      onSuccess: () => {
        setShowCreateForm(false);
      }
    });
  };

  const handleSendCampaign = (campaignId: string) => {
    sendCampaignMutation.mutate({ campaignId });
  };

  const handleResendCampaign = (campaignId: string) => {
    sendCampaignMutation.mutate({ campaignId, isResend: true });
  };

  if (campaignsLoading || phoneNumbersLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            SMS Campaigns
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

  if (campaignsError || phoneNumbersError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            SMS Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Failed to load campaigns or phone numbers
              </p>
              <p className="text-xs text-red-600 mt-1">
                {campaignsError?.message || phoneNumbersError?.message || 'An unexpected error occurred'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            SMS Campaigns ({campaigns.length})
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            disabled={phoneNumbers.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {phoneNumbers.length === 0 ? (
          <EmptyPhoneNumbersState />
        ) : (
          <>
            {showCreateForm && (
              <CampaignCreateForm
                onSubmit={handleCreateCampaign}
                onCancel={() => setShowCreateForm(false)}
                isLoading={createCampaignMutation.isPending}
                phoneNumbersCount={phoneNumbers.length}
                organizationName={organization?.name}
              />
            )}

            <CampaignsList
              campaigns={campaigns}
              onSend={handleSendCampaign}
              onResend={handleResendCampaign}
              isLoading={sendCampaignMutation.isPending}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
