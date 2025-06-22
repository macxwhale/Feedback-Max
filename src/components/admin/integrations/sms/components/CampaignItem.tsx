
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, RefreshCw, RotateCcw } from 'lucide-react';

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

interface CampaignItemProps {
  campaign: Campaign;
  onSend: (campaignId: string) => void;
  onResend: (campaignId: string) => void;
  onRetry: (campaignId: string) => void;
  isLoading: boolean;
}

export const CampaignItem: React.FC<CampaignItemProps> = ({
  campaign,
  onSend,
  onResend,
  onRetry,
  isLoading
}) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'sending': return 'secondary';
      case 'failed': return 'destructive';
      case 'draft': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h5 className="font-medium">{campaign.name}</h5>
          <p className="text-sm text-muted-foreground">
            Created {new Date(campaign.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadgeVariant(campaign.status)}>
            {campaign.status}
          </Badge>
          {campaign.status === 'draft' && (
            <Button
              size="sm"
              onClick={() => onSend(campaign.id)}
              disabled={isLoading}
            >
              <Play className="w-4 h-4 mr-2" />
              Send Now
            </Button>
          )}
          {campaign.status === 'failed' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRetry(campaign.id)}
              disabled={isLoading}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Campaign
            </Button>
          )}
          {(campaign.status === 'completed' && campaign.failed_count > 0) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResend(campaign.id)}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Resend Failed
            </Button>
          )}
        </div>
      </div>
      
      <div className="text-sm space-y-2">
        <div className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
          <strong>Message:</strong>
          <p className="mt-1">{campaign.message_template}</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
          <div className="text-center">
            <div className="font-medium">{campaign.total_recipients}</div>
            <div className="text-xs text-muted-foreground">Recipients</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-green-600">{campaign.sent_count}</div>
            <div className="text-xs text-muted-foreground">Sent</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{campaign.delivered_count}</div>
            <div className="text-xs text-muted-foreground">Delivered</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-red-600">{campaign.failed_count}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
        </div>
      </div>
    </div>
  );
};
