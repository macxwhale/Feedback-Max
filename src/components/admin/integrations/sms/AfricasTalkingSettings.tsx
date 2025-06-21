
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AfricasTalkingSettingsProps {
  organization: any;
  currentSettings: any;
  onSettingsUpdate: () => void;
}

export const AfricasTalkingSettings: React.FC<AfricasTalkingSettingsProps> = ({
  organization,
  currentSettings,
  onSettingsUpdate
}) => {
  const [username, setUsername] = useState(currentSettings?.sms_settings?.username || '');
  const [apiKey, setApiKey] = useState('');
  const [senderId, setSenderId] = useState(currentSettings?.sms_sender_id || '');

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('update-sms-settings', {
        body: {
          orgId: organization.id,
          enabled: currentSettings?.sms_enabled || false,
          senderId: senderId.trim(),
          username: username.trim(),
          apiKey: apiKey.trim()
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ 
        title: "Africa's Talking settings saved successfully",
        description: "Your SMS integration is now configured"
      });
      setApiKey(''); // Clear API key field for security
      onSettingsUpdate();
    },
    onError: (error) => {
      toast({ 
        title: "Error saving settings", 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({ 
        title: "Username required", 
        description: "Please enter your Africa's Talking username",
        variant: 'destructive' 
      });
      return;
    }
    if (!apiKey.trim() && !currentSettings?.sms_settings?.apiKey) {
      toast({ 
        title: "API Key required", 
        description: "Please enter your Africa's Talking API key",
        variant: 'destructive' 
      });
      return;
    }
    saveMutation.mutate();
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Africa's Talking Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="at-username">Username *</Label>
              <Input
                id="at-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your Africa's Talking username"
                required
              />
            </div>
            <div>
              <Label htmlFor="at-sender-id">Sender ID (Optional)</Label>
              <Input
                id="at-sender-id"
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                placeholder="e.g., YourBrand"
                maxLength={11}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Max 11 characters. Leave blank to use default.
              </p>
            </div>
          </div>
          
          <div>
            <Label htmlFor="at-api-key">API Key *</Label>
            <Input
              id="at-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={currentSettings?.sms_settings?.apiKey ? "Enter new API key (leave blank to keep current)" : "Your Africa's Talking API key"}
              required={!currentSettings?.sms_settings?.apiKey}
            />
            {currentSettings?.sms_settings?.apiKey && (
              <p className="text-xs text-muted-foreground mt-1">
                API key is configured. Enter a new key only if you want to update it.
              </p>
            )}
          </div>

          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Setup Instructions:</p>
              <ol className="list-decimal list-inside text-blue-700 space-y-1 mt-1">
                <li>Get your credentials from Africa's Talking dashboard</li>
                <li>Configure the webhook URL in your Africa's Talking app settings</li>
                <li>Test the integration by sending an SMS to your shortcode</li>
              </ol>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              type="submit" 
              disabled={saveMutation.isPending}
              className="flex items-center gap-2"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Save Configuration
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open('https://account.africastalking.com/', '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open Dashboard
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
