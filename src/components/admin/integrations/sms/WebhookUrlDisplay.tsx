
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface WebhookUrlDisplayProps {
  webhookSecret: string;
  isVisible: boolean;
}

export const WebhookUrlDisplay: React.FC<WebhookUrlDisplayProps> = ({
  webhookSecret,
  isVisible
}) => {
  const [showUrl, setShowUrl] = useState(false);
  
  // Use the hardcoded Supabase URL instead of process.env
  const supabaseUrl = 'https://rigurrwjiaucodxuuzeh.supabase.co';
  const webhookUrl = `${supabaseUrl}/functions/v1/handle-sms-webhook?secret=${webhookSecret}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast({ title: "Webhook URL copied to clipboard" });
    } catch (error) {
      console.error('Failed to copy webhook URL:', error);
      toast({ 
        title: "Failed to copy URL", 
        description: "Please copy the URL manually",
        variant: 'destructive' 
      });
    }
  };

  if (!isVisible || !webhookSecret) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">SMS Webhook URL</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Use this URL in your SMS provider's webhook configuration to receive incoming SMS messages.
        </p>
        
        <div className="flex items-center space-x-2">
          <Input
            value={showUrl ? webhookUrl : '•'.repeat(50)}
            readOnly
            className="font-mono text-xs"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUrl(!showUrl)}
          >
            {showUrl ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyUrl}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Method:</strong> POST</p>
          <p><strong>Content-Type:</strong> application/x-www-form-urlencoded or application/json</p>
        </div>
      </CardContent>
    </Card>
  );
};
