
import React from 'react';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';

interface ThankYouActionsProps {
  onClose: () => void;
}

export const ThankYouActions: React.FC<ThankYouActionsProps> = ({ onClose }) => {
  return (
    <div className="text-center space-y-4 pt-4">
      <p className="text-gray-600">
        Your feedback helps us improve our services. Thank you for taking the time to share your thoughts!
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          className="bg-gradient-to-r from-[#073763] to-[#007ACE] hover:from-[#062c52] hover:to-[#0066a6] text-white"
          onClick={() => {
            console.log('Navigate to rewards page');
          }}
        >
          <Gift className="mr-2 h-4 w-4" />
          View Your Rewards
        </Button>
        
        <Button
          variant="outline"
          onClick={onClose}
          className="border-[#073763] text-[#073763] hover:bg-[#073763] hover:text-white"
        >
          Submit Another Response
        </Button>
      </div>
    </div>
  );
};
