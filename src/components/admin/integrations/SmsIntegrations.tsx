
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { MessageSquare, Settings, Check, AlertCircle } from 'lucide-react';
import { AfricasTalkingSettings } from './sms/AfricasTalkingSettings';
import { supabase } from '@/integrations/supabase/client';

interface SmsProvider {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'available' | 'coming_soon';
}

const smsProviders: SmsProvider[] = [
  {
    id: 'africastalking',
    name: "Africa's Talking",
    description: 'SMS services across Africa with reliable delivery',
    icon: <MessageSquare className="w-6 h-6" />,
    status: 'available'
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Global SMS and communication platform',
    icon: <MessageSquare className="w-6 h-6" />,
    status: 'coming_soon'
  },
  {
    id: 'vonage',
    name: 'Vonage',
    description: 'SMS API for global messaging',
    icon: <MessageSquare className="w-6 h-6" />,
    status: 'coming_soon'
  }
];

export const SmsIntegrations: React.FC = () => {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const { data: orgData, isLoading } = useQuery({
    queryKey: ['organization-sms', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return null;
      const { data, error } = await supabase
        .from('organizations')
        .select('sms_enabled, sms_sender_id, sms_settings, webhook_secret')
        .eq('id', organization.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
  });

  const updateSmsStatus = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { data, error } = await supabase.functions.invoke('update-sms-settings', {
        body: {
          orgId: organization!.id,
          enabled,
          senderId: orgData?.sms_sender_id || '',
          username: orgData?.sms_settings?.username || '',
          apiKey: orgData?.sms_settings?.apiKey || ''
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "SMS status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['organization-sms', organization?.id] });
    },
    onError: (error) => {
      toast({ 
        title: "Error updating SMS status", 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const handleToggleSms = (enabled: boolean) => {
    updateSmsStatus.mutate(enabled);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            SMS Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          SMS Integrations
        </CardTitle>
        <CardDescription>
          Enable SMS feedback collection from your customers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">SMS Feedback</h4>
            <p className="text-sm text-muted-foreground">
              Allow customers to provide feedback via SMS
            </p>
          </div>
          <Switch
            checked={orgData?.sms_enabled || false}
            onCheckedChange={handleToggleSms}
            disabled={updateSmsStatus.isPending}
          />
        </div>

        {orgData?.sms_enabled && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">SMS Webhook URL:</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <code className="text-sm break-all">
                {`${window.location.origin}/functions/v1/handle-sms-webhook/${orgData?.webhook_secret}`}
              </code>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this URL as your SMS webhook endpoint in your provider's dashboard
            </p>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-medium">Available Providers</h4>
          
          {smsProviders.map((provider) => (
            <div
              key={provider.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedProvider === provider.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => provider.status === 'available' && setSelectedProvider(
                selectedProvider === provider.id ? null : provider.id
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {provider.icon}
                  <div>
                    <h5 className="font-medium">{provider.name}</h5>
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {provider.status === 'available' ? (
                    <>
                      <Badge variant="default">Available</Badge>
                      {selectedProvider === provider.id && (
                        <Check className="w-4 h-4 text-blue-500" />
                      )}
                    </>
                  ) : (
                    <Badge variant="secondary">Coming Soon</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedProvider === 'africastalking' && (
          <AfricasTalkingSettings 
            organization={organization!}
            currentSettings={orgData}
            onSettingsUpdate={() => {
              queryClient.invalidateQueries({ queryKey: ['organization-sms', organization?.id] });
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};
