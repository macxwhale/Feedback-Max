
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface WebhookUrlDisplayProps {
  webhookSecret: string;
  isVisible: boolean;
}

export const WebhookUrlDisplay: React.FC<WebhookUrlDisplayProps> = ({
  webhookSecret,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-medium">SMS Webhook URL:</span>
      </div>
      <div className="p-3 bg-gray-50 rounded-md">
        <code className="text-sm break-all">
          {`${window.location.origin}/functions/v1/handle-sms-webhook/${webhookSecret}`}
        </code>
      </div>
      <p className="text-xs text-muted-foreground">
        Use this URL as your SMS webhook endpoint in your provider's dashboard
      </p>
    </div>
  );
};
