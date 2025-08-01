
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: string;
}

interface CampaignDeleteModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (campaignId: string) => void;
  isLoading: boolean;
}

export const CampaignDeleteModal: React.FC<CampaignDeleteModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onDelete,
  isLoading
}) => {
  const handleDelete = () => {
    if (campaign) {
      onDelete(campaign.id);
    }
  };

  if (!campaign) return null;

  const isActiveCampaign = campaign.status === 'sending' || campaign.status === 'completed';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Delete Campaign
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete the campaign "{campaign.name}"?
          </p>
          
          {isActiveCampaign && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium mb-1">
                Warning: This campaign has been sent or is active
              </p>
              <p className="text-sm text-yellow-700">
                Deleting this campaign will permanently remove all associated data including send records and statistics. This action cannot be undone.
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Campaign'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
