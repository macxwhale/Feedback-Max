
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

  const canDelete = campaign.status === 'draft' || campaign.status === 'cancelled' || campaign.status === 'failed';

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
          
          {!canDelete && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                This campaign cannot be deleted because it has been sent or is currently active. 
                Only draft, cancelled, or failed campaigns can be deleted.
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
              disabled={isLoading || !canDelete}
            >
              {isLoading ? 'Deleting...' : 'Delete Campaign'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
