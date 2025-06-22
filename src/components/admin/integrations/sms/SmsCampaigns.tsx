
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useSmsCampaigns } from './hooks/useSmsCampaigns';
import { CampaignCreateForm } from './components/CampaignCreateForm';
import { EnhancedCampaignsList } from './components/EnhancedCampaignsList';
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
    campaignControlMutation,
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

  const handleRetryCampaign = (campaignId: string) => {
    sendCampaignMutation.mutate({ campaignId, isRetry: true });
  };

  const handleCancelCampaign = (campaignId: string) => {
    campaignControlMutation.mutate({ campaignId, action: 'cancel' });
  };

  const handlePauseCampaign = (campaignId: string) => {
    campaignControlMutation.mutate({ campaignId, action: 'pause' });
  };

  const handleResumeCampaign = (campaignId: string) => {
    campaignControlMutation.mutate({ campaignId, action: 'resume' });
  };

  const handleDuplicateCampaign = (campaignId: string) => {
    const originalCampaign = campaigns.find(c => c.id === campaignId);
    if (originalCampaign) {
      createCampaignMutation.mutate({
        name: `${originalCampaign.name} (Copy)`,
        template: originalCampaign.message_template
      });
      toast({ title: "Campaign duplicated successfully" });
    }
  };

  const handleScheduleCampaign = (campaignId: string) => {
    // TODO: Implement scheduling functionality
    toast({ 
      title: "Scheduling feature coming soon", 
      description: "Campaign scheduling will be available in the next update." 
    });
  };

  const handleDeleteCampaign = (campaignId: string) => {
    // TODO: Implement delete functionality
    toast({ 
      title: "Delete feature coming soon", 
      description: "Campaign deletion will be available in the next update." 
    });
  };

  if (campaignsLoading || phoneNumbersLoading) {
    return (
      <div className="w-full">
        <Card className="w-full">
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
      </div>
    );
  }

  if (campaignsError || phoneNumbersError) {
    return (
      <div className="w-full">
        <Card className="w-full">
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
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              SMS Campaigns
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {phoneNumbers.length === 0 ? (
            <EmptyPhoneNumbersState />
          ) : (
            <div className="w-full space-y-6">
              {showCreateForm && (
                <div className="w-full">
                  <CampaignCreateForm
                    onSubmit={handleCreateCampaign}
                    onCancel={() => setShowCreateForm(false)}
                    isLoading={createCampaignMutation.isPending}
                    phoneNumbersCount={phoneNumbers.length}
                    organizationName={organization?.name}
                  />
                </div>
              )}

              <div className="w-full">
                <EnhancedCampaignsList
                  campaigns={campaigns}
                  onSend={handleSendCampaign}
                  onResend={handleResendCampaign}
                  onRetry={handleRetryCampaign}
                  onCancel={handleCancelCampaign}
                  onPause={handlePauseCampaign}
                  onResume={handleResumeCampaign}
                  onDuplicate={handleDuplicateCampaign}
                  onSchedule={handleScheduleCampaign}
                  onDelete={handleDeleteCampaign}
                  onCreateNew={() => setShowCreateForm(true)}
                  isLoading={sendCampaignMutation.isPending || campaignControlMutation.isPending}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
