
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Campaign {
  id: string;
  name: string;
  message_template: string;
  status: string;
}

interface CampaignEditModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (campaignId: string, name: string, template: string) => void;
  isLoading: boolean;
}

export const CampaignEditModal: React.FC<CampaignEditModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onSave,
  isLoading
}) => {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('');

  useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setTemplate(campaign.message_template);
    }
  }, [campaign]);

  const handleSave = () => {
    if (campaign && name.trim() && template.trim()) {
      onSave(campaign.id, name.trim(), template.trim());
    }
  };

  const handleClose = () => {
    setName('');
    setTemplate('');
    onClose();
  };

  if (!campaign) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input
              id="campaign-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter campaign name"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="message-template">Message Template</Label>
            <Textarea
              id="message-template"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Enter your message template"
              rows={4}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !name.trim() || !template.trim()}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
