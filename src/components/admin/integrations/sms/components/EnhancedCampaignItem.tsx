
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Play, RefreshCw, RotateCcw, Copy, Pause, Calendar, MoreVertical, Eye, Trash2, Square, AlertTriangle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CampaignAnalytics } from './CampaignAnalytics';

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
  onDuplicate: (campaignId: string) => void;
  onSchedule: (campaignId: string) => void;
  onDelete: (campaignId: string) => void;
  onCancel: (campaignId: string) => void;
  onPause: (campaignId: string) => void;
  onResume: (campaignId: string) => void;
  isLoading: boolean;
}

export const EnhancedCampaignItem: React.FC<EnhancedCampaignItemProps> = ({
  campaign,
  onSend,
  onResend,
  onRetry,
  onDuplicate,
  onSchedule,
  onDelete,
  onCancel,
  onPause,
  onResume,
  isLoading
}) => {
  const [showAnalytics, setShowAnalytics] = useState(false);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'sending': return 'secondary';
      case 'paused': return 'outline';
      case 'failed': return 'destructive';
      case 'draft': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'sending': return 'text-blue-600';
      case 'paused': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      case 'draft': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const sendProgress = campaign.total_recipients > 0 ? (campaign.sent_count / campaign.total_recipients) * 100 : 0;
  const isStuckSending = campaign.status === 'sending' && campaign.started_at && 
    new Date().getTime() - new Date(campaign.started_at).getTime() > 10 * 60 * 1000; // 10 minutes

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h5 className="font-semibold text-lg">{campaign.name}</h5>
              <Badge variant={getStatusBadgeVariant(campaign.status)} className={getStatusColor(campaign.status)}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </Badge>
              {isStuckSending && (
                <Badge variant="destructive" className="text-orange-700 bg-orange-100">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Stuck
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Created {new Date(campaign.created_at).toLocaleDateString()} • {campaign.total_recipients} recipients
            </p>
            {(campaign.status === 'sending' || campaign.status === 'paused') && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{campaign.sent_count}/{campaign.total_recipients}</span>
                </div>
                <Progress value={sendProgress} className="h-2" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Actions */}
            {campaign.status === 'draft' && (
              <Button
                size="sm"
                onClick={() => onSend(campaign.id)}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Send Now
              </Button>
            )}
            
            {campaign.status === 'sending' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPause(campaign.id)}
                  disabled={isLoading}
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onCancel(campaign.id)}
                  disabled={isLoading}
                >
                  <Square className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}

            {campaign.status === 'paused' && (
              <Button
                size="sm"
                onClick={() => onResume(campaign.id)}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume
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
                Retry
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

            {isStuckSending && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRetry(campaign.id)}
                disabled={isLoading}
                className="border-orange-500 text-orange-700 hover:bg-orange-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Force Retry
              </Button>
            )}

            {/* More Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowAnalytics(!showAnalytics)}>
                  <Eye className="w-4 h-4 mr-2" />
                  {showAnalytics ? 'Hide' : 'Show'} Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(campaign.id)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate Campaign
                </DropdownMenuItem>
                {campaign.status === 'draft' && (
                  <DropdownMenuItem onClick={() => onSchedule(campaign.id)}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Campaign
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Campaign
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{campaign.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(campaign.id)} className="bg-red-600 hover:bg-red-700">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Message Preview */}
        <div className="mb-4">
          <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm font-medium text-blue-900 mb-1">Message Preview:</p>
            <p className="text-sm text-blue-800 leading-relaxed">
              {campaign.message_template.length > 120 
                ? `${campaign.message_template.substring(0, 120)}...` 
                : campaign.message_template}
            </p>
          </div>
        </div>

        {/* Analytics Section */}
        {showAnalytics && <CampaignAnalytics campaign={campaign} />}
      </CardContent>
    </Card>
  );
};
