
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare } from 'lucide-react';
import { useSmsCampaigns } from './hooks/useSmsCampaigns';
import { CampaignCreateForm } from './components/CampaignCreateForm';
import { CampaignsList } from './components/CampaignsList';
import { EmptyPhoneNumbersState } from './components/EmptyPhoneNumbersState';

export const SmsCampaigns: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const {
    campaigns,
    campaignsLoading,
    phoneNumbers,
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

  if (campaignsLoading) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            SMS Campaigns ({campaigns?.length || 0})
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            disabled={!phoneNumbers || phoneNumbers.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!phoneNumbers || phoneNumbers.length === 0 ? (
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

            {campaigns && (
              <CampaignsList
                campaigns={campaigns}
                onSend={handleSendCampaign}
                onResend={handleResendCampaign}
                isLoading={sendCampaignMutation.isPending}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
