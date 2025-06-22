
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, Users, MessageCircle, AlertTriangle } from 'lucide-react';

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
  started_at?: string;
  completed_at?: string;
}

interface CampaignAnalyticsProps {
  campaign: Campaign;
}

export const CampaignAnalytics: React.FC<CampaignAnalyticsProps> = ({ campaign }) => {
  const deliveryRate = campaign.sent_count > 0 ? (campaign.delivered_count / campaign.sent_count) * 100 : 0;
  const failureRate = campaign.sent_count > 0 ? (campaign.failed_count / campaign.sent_count) * 100 : 0;
  const sendProgress = campaign.total_recipients > 0 ? (campaign.sent_count / campaign.total_recipients) * 100 : 0;

  const getDuration = () => {
    if (!campaign.started_at) return null;
    const start = new Date(campaign.started_at);
    const end = campaign.completed_at ? new Date(campaign.completed_at) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    return diffMins < 60 ? `${diffMins}m` : `${Math.round(diffMins / 60)}h ${diffMins % 60}m`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
        <Users className="w-4 h-4 text-blue-600" />
        <div>
          <div className="text-sm font-medium text-blue-900">{campaign.sent_count}</div>
          <div className="text-xs text-blue-600">Sent</div>
          <Progress value={sendProgress} className="h-1 mt-1" />
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
        <TrendingUp className="w-4 h-4 text-green-600" />
        <div>
          <div className="text-sm font-medium text-green-900">{deliveryRate.toFixed(1)}%</div>
          <div className="text-xs text-green-600">Delivered</div>
          <div className="text-xs text-gray-500 mt-1">{campaign.delivered_count}/{campaign.sent_count}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <div>
          <div className="text-sm font-medium text-red-900">{failureRate.toFixed(1)}%</div>
          <div className="text-xs text-red-600">Failed</div>
          <div className="text-xs text-gray-500 mt-1">{campaign.failed_count}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
        <Clock className="w-4 h-4 text-purple-600" />
        <div>
          <div className="text-sm font-medium text-purple-900">{getDuration() || 'N/A'}</div>
          <div className="text-xs text-purple-600">Duration</div>
          <Badge variant="outline" className="text-xs mt-1">
            {campaign.status}
          </Badge>
        </div>
      </div>
    </div>
  );
};
