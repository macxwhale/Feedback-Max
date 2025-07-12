
import React from 'react';
import { Send } from 'lucide-react';
import { CampaignItem } from './CampaignItem';

interface Campaign {
  id: string;
  name: string;
  message_template: string;
  status: string;
  created_at: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
}

interface CampaignsListProps {
  campaigns: Campaign[];
  onSend: (campaignId: string) => void;
  onResend: (campaignId: string) => void;
  onRetry: (campaignId: string) => void;
  isLoading: boolean;
}

export const CampaignsList: React.FC<CampaignsListProps> = ({
  campaigns,
  onSend,
  onResend,
  onRetry,
  isLoading
}) => {
  if (campaigns.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <Send className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No campaigns created yet.</p>
        <p className="text-sm">Create your first SMS campaign to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Your Campaigns</h4>
      {campaigns.map((campaign) => (
        <CampaignItem
          key={campaign.id}
          campaign={campaign}
          onSend={onSend}
          onResend={onResend}
          onRetry={onRetry}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};
