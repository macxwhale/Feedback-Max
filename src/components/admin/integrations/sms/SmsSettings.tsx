
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Save } from 'lucide-react';

interface SmsSettingsProps {
  organization: any;
  currentSettings: any;
  onSettingsUpdate: () => void;
}

export const SmsSettings: React.FC<SmsSettingsProps> = ({
  organization,
  currentSettings,
  onSettingsUpdate
}) => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    username: currentSettings?.sms_settings?.username || '',
    apiKey: currentSettings?.sms_settings?.apiKey || '',
    senderId: currentSettings?.sms_sender_id || ''
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: typeof settings) => {
      const { data, error } = await supabase.functions.invoke('update-sms-settings', {
        body: {
          orgId: organization.id,
          enabled: true,
          senderId: newSettings.senderId,
          username: newSettings.username,
          apiKey: newSettings.apiKey
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SMS settings updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['organization-sms-settings'] });
      onSettingsUpdate();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update SMS settings",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settings.username.trim() || !settings.apiKey.trim() || !settings.senderId.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    updateSettingsMutation.mutate(settings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          SMS Provider Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              type="text"
              value={settings.username}
              onChange={(e) => setSettings(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Enter your SMS provider username"
              required
            />
          </div>

          <div>
            <Label htmlFor="apiKey">API Key *</Label>
            <Input
              id="apiKey"
              type="password"
              value={settings.apiKey}
              onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Enter your SMS provider API key"
              required
            />
          </div>

          <div>
            <Label htmlFor="senderId">Sender ID *</Label>
            <Input
              id="senderId"
              type="text"
              value={settings.senderId}
              onChange={(e) => setSettings(prev => ({ ...prev, senderId: e.target.value }))}
              placeholder="Enter your sender ID (e.g., 12345)"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              This is your SMS sender identifier that recipients will see
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={updateSettingsMutation.isPending}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
