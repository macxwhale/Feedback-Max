
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Send, Plus, MessageSquare, Users, Play, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const SmsCampaigns: React.FC = () => {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['sms-campaigns', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_campaigns')
        .select('*')
        .eq('organization_id', organization!.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id
  });

  const { data: phoneNumbers } = useQuery({
    queryKey: ['sms-phone-numbers', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_phone_numbers')
        .select('*')
        .eq('organization_id', organization!.id)
        .eq('status', 'active');
      
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id
  });

  const createCampaignMutation = useMutation({
    mutationFn: async ({ name, template }: { name: string; template: string }) => {
      const { data, error } = await supabase
        .from('sms_campaigns')
        .insert({
          organization_id: organization!.id,
          name: name.trim(),
          message_template: template.trim(),
          total_recipients: phoneNumbers?.length || 0
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Campaign created successfully" });
      setCampaignName('');
      setMessageTemplate('');
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ['sms-campaigns', organization?.id] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error creating campaign", 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async ({ campaignId, isResend = false }: { campaignId: string; isResend?: boolean }) => {
      if (!phoneNumbers || phoneNumbers.length === 0) {
        throw new Error('No active phone numbers found');
      }

      const campaign = campaigns?.find(c => c.id === campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Update campaign status to sending
      await supabase
        .from('sms_campaigns')
        .update({ 
          status: 'sending',
          started_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      // For resend, only get failed phone numbers
      let targetPhoneNumbers = phoneNumbers.map(p => p.phone_number);
      
      if (isResend) {
        // Get failed sends for this campaign
        const { data: failedSends } = await supabase
          .from('sms_sends')
          .select('phone_number')
          .eq('campaign_id', campaignId)
          .eq('status', 'failed');
        
        if (failedSends && failedSends.length > 0) {
          targetPhoneNumbers = failedSends.map(s => s.phone_number);
        } else {
          throw new Error('No failed sends to retry for this campaign');
        }
      }

      // Call the send-sms edge function
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          phoneNumbers: targetPhoneNumbers,
          message: campaign.message_template,
          organizationId: organization!.id,
          campaignId: campaignId
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      const action = variables.isResend ? 'Resent' : 'Sent';
      toast({ 
        title: `Campaign ${action.toLowerCase()} successfully`,
        description: `${action} to ${data.summary.sent} recipients`
      });
      queryClient.invalidateQueries({ queryKey: ['sms-campaigns', organization?.id] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error sending campaign", 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim() || !messageTemplate.trim()) return;
    
    createCampaignMutation.mutate({
      name: campaignName,
      template: messageTemplate
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'sending': return 'secondary';
      case 'failed': return 'destructive';
      case 'draft': return 'outline';
      default: return 'secondary';
    }
  };

  if (campaignsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            SMS Campaigns
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

  const defaultMessage = `Hi! We'd love your feedback on our service. Please text back 'START' to begin a quick survey. Your input helps us improve. Thank you! - ${organization?.name || 'Your Company'}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            SMS Campaigns ({campaigns?.length || 0})
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            disabled={!phoneNumbers || phoneNumbers.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!phoneNumbers || phoneNumbers.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No active phone numbers found.</p>
            <p className="text-sm">Add phone numbers before creating campaigns.</p>
          </div>
        ) : (
          <>
            {/* Create Campaign Form */}
            {showCreateForm && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium">Create New Campaign</h4>
                <form onSubmit={handleCreateCampaign} className="space-y-4">
                  <div>
                    <Label htmlFor="campaign-name">Campaign Name *</Label>
                    <Input
                      id="campaign-name"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="Feedback Request Campaign"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="message-template">Message Template *</Label>
                    <Textarea
                      id="message-template"
                      value={messageTemplate}
                      onChange={(e) => setMessageTemplate(e.target.value)}
                      placeholder={defaultMessage}
                      rows={4}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Recipients: {phoneNumbers.length} active phone numbers
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={createCampaignMutation.isPending}
                    >
                      Create Campaign
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Campaigns List */}
            {campaigns && campaigns.length > 0 ? (
              <div className="space-y-4">
                <h4 className="font-medium">Your Campaigns</h4>
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-medium">{campaign.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(campaign.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        {campaign.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => sendCampaignMutation.mutate({ campaignId: campaign.id })}
                            disabled={sendCampaignMutation.isPending}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Send Now
                          </Button>
                        )}
                        {(campaign.status === 'completed' && campaign.failed_count > 0) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendCampaignMutation.mutate({ campaignId: campaign.id, isResend: true })}
                            disabled={sendCampaignMutation.isPending}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Resend Failed
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm space-y-2">
                      <div className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                        <strong>Message:</strong>
                        <p className="mt-1">{campaign.message_template}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                        <div className="text-center">
                          <div className="font-medium">{campaign.total_recipients}</div>
                          <div className="text-xs text-muted-foreground">Recipients</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-green-600">{campaign.sent_count}</div>
                          <div className="text-xs text-muted-foreground">Sent</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{campaign.delivered_count}</div>
                          <div className="text-xs text-muted-foreground">Delivered</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-red-600">{campaign.failed_count}</div>
                          <div className="text-xs text-muted-foreground">Failed</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <Send className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No campaigns created yet.</p>
                <p className="text-sm">Create your first SMS campaign to get started.</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
