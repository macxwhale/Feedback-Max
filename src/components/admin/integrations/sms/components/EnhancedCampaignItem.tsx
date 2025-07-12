
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Copy, 
  Calendar, 
  Trash2, 
  Edit3,
  MessageSquare,
  Users,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

interface EnhancedCampaignItemProps {
  campaign: Campaign;
  onSend: (campaignId: string) => void;
  onResend: (campaignId: string) => void;
  onRetry: (campaignId: string) => void;
  onCancel: (campaignId: string) => void;
  onPause: (campaignId: string) => void;
  onResume: (campaignId: string) => void;
  onDuplicate: (campaignId: string) => void;
  onSchedule: (campaignId: string) => void;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
  isLoading: boolean;
}

export const EnhancedCampaignItem: React.FC<EnhancedCampaignItemProps> = ({
  campaign,
  onSend,
  onResend,
  onRetry,
  onCancel,
  onPause,
  onResume,
  onDuplicate,
  onSchedule,
  onEdit,
  onDelete,
  isLoading
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sending': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'sending': return <Clock className="w-4 h-4" />;
      default: return null;
    }
  };

  const canSend = campaign.status === 'draft';
  const canResend = campaign.status === 'completed';
  const canRetry = campaign.status === 'failed';
  const canPause = campaign.status === 'sending';
  const canResume = campaign.status === 'paused';
  const canCancel = campaign.status === 'sending' || campaign.status === 'paused';
  const canEdit = campaign.status === 'draft' || campaign.status === 'failed';
  const canDelete = campaign.status === 'draft' || campaign.status === 'cancelled' || campaign.status === 'failed';

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
              <Badge className={`${getStatusColor(campaign.status)} flex items-center gap-1`}>
                {getStatusIcon(campaign.status)}
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-500 mb-3">
              Created {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{campaign.total_recipients || 0} recipients</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{campaign.sent_count || 0} sent</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>{campaign.delivered_count || 0} delivered</span>
              </div>
              {campaign.failed_count > 0 && (
                <div className="flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>{campaign.failed_count} failed</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-4">
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(campaign)}
                disabled={isLoading}
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}

            {canSend && (
              <Button
                onClick={() => onSend(campaign.id)}
                disabled={isLoading}
                size="sm"
              >
                <Play className="w-4 h-4 mr-1" />
                Send
              </Button>
            )}

            {canResend && (
              <Button
                variant="outline"
                onClick={() => onResend(campaign.id)}
                disabled={isLoading}
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Resend
              </Button>
            )}

            {canRetry && (
              <Button
                variant="outline"
                onClick={() => onRetry(campaign.id)}
                disabled={isLoading}
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            )}

            {canPause && (
              <Button
                variant="outline"
                onClick={() => onPause(campaign.id)}
                disabled={isLoading}
                size="sm"
              >
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </Button>
            )}

            {canResume && (
              <Button
                variant="outline"
                onClick={() => onResume(campaign.id)}
                disabled={isLoading}
                size="sm"
              >
                <Play className="w-4 h-4 mr-1" />
                Resume
              </Button>
            )}

            {canCancel && (
              <Button
                variant="outline"
                onClick={() => onCancel(campaign.id)}
                disabled={isLoading}
                size="sm"
              >
                Cancel
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => onDuplicate(campaign.id)}
              disabled={isLoading}
              size="sm"
            >
              <Copy className="w-4 h-4 mr-1" />
              Duplicate
            </Button>

            <Button
              variant="outline"
              onClick={() => onSchedule(campaign.id)}
              disabled={isLoading}
              size="sm"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Schedule
            </Button>

            {canDelete && (
              <Button
                variant="outline"
                onClick={() => onDelete(campaign)}
                disabled={isLoading}
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Message Preview */}
        <div className="mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isExpanded ? 'Hide' : 'Show'} message preview
          </button>
          
          {isExpanded && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {campaign.message_template}
              </p>
            </div>
          )}
        </div>

        {/* Timestamps */}
        {(campaign.started_at || campaign.completed_at) && (
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            {campaign.started_at && (
              <div>Started: {new Date(campaign.started_at).toLocaleString()}</div>
            )}
            {campaign.completed_at && (
              <div>Completed: {new Date(campaign.completed_at).toLocaleString()}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
