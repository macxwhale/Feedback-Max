
import React, { useState } from 'react';
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
  const [showSecret, setShowSecret] = useState(false);

  if (!isVisible || !webhookSecret) {
    return null;
  }

  // Use the current domain in production, localhost in development
  const baseUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:54321' 
    : `https://${process.env.VITE_SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '')}.supabase.co`;
  
  const webhookUrl = `${baseUrl}/functions/v1/handle-sms-webhook?secret=${webhookSecret}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast({ title: "Webhook URL copied to clipboard" });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({ 
        title: "Failed to copy", 
        description: "Please copy the URL manually",
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">SMS Webhook URL</label>
      <p className="text-xs text-muted-foreground">
        Configure this URL in your Africa's Talking SMS callback settings
      </p>
      <div className="flex items-center space-x-2">
        <Input
          type={showSecret ? 'text' : 'password'}
          value={webhookUrl}
          readOnly
          className="font-mono text-sm"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSecret(!showSecret)}
        >
          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
        >
          <Copy className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
