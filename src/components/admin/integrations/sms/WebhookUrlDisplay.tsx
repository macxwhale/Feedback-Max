
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Eye, EyeOff, Webhook, Code } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface WebhookUrlDisplayProps {
  webhookSecret: string;
  isVisible: boolean;
  isFlaskWrapper?: boolean;
}

export const WebhookUrlDisplay: React.FC<WebhookUrlDisplayProps> = ({
  webhookSecret,
  isVisible,
  isFlaskWrapper = false
}) => {
  const [showSecret, setShowSecret] = useState(false);

  const baseUrl = window.location.origin;
  const webhookEndpoint = isFlaskWrapper 
    ? '/functions/v1/handle-flask-sms-callback'
    : '/functions/v1/handle-sms-webhook';
  const webhookUrl = `${baseUrl}${webhookEndpoint}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Webhook URL has been copied to your clipboard"
    });
  };

  if (!isVisible) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="w-5 h-5" />
          {isFlaskWrapper ? 'Flask Webhook Configuration' : 'SMS Webhook Configuration'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Webhook URL</Label>
          <div className="flex gap-2">
            <Input
              value={webhookUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              onClick={() => copyToClipboard(webhookUrl)}
              variant="outline"
              size="icon"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {isFlaskWrapper 
              ? 'Configure your Flask wrapper to send callbacks to this URL'
              : 'Configure this URL in your Africa\'s Talking SMS callback settings'
            }
          </p>
        </div>

        <div className="space-y-2">
          <Label>Webhook Secret</Label>
          <div className="flex gap-2">
            <Input
              type={showSecret ? "text" : "password"}
              value={webhookSecret}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              onClick={() => setShowSecret(!showSecret)}
              variant="outline"
              size="icon"
              type="button"
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button
              onClick={() => copyToClipboard(webhookSecret)}
              variant="outline"
              size="icon"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Use this secret to verify webhook authenticity
          </p>
        </div>

        {isFlaskWrapper && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-2">
              <Code className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium text-sm">Flask Integration Notes:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your Flask wrapper should forward SMS callbacks to the webhook URL above</li>
                  <li>• Include the webhook secret in your callback validation</li>
                  <li>• Ensure the callback format matches: {`{linkId, text, to, id, date, from}`}</li>
                  <li>• The 'to' field should contain your organization's sender ID</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
