
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CampaignCreateFormProps {
  onSubmit: (name: string, template: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  phoneNumbersCount: number;
  organizationName?: string;
}

export const CampaignCreateForm: React.FC<CampaignCreateFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  phoneNumbersCount,
  organizationName
}) => {
  const [campaignName, setCampaignName] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');

  const defaultMessage = `Hi! We'd love your feedback on our service. Please text back 'START' to begin a quick survey. Your input helps us improve. Thank you! - ${organizationName || 'Your Company'}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim() || !messageTemplate.trim()) return;
    
    onSubmit(campaignName, messageTemplate);
    setCampaignName('');
    setMessageTemplate('');
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h4 className="font-medium">Create New Campaign</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            Recipients: {phoneNumbersCount} active phone numbers
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isLoading}
          >
            Create Campaign
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
