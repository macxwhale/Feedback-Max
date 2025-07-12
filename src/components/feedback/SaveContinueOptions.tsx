
import React from 'react';
import { Save, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface SaveContinueOptionsProps {
  onSave: () => void;
  onPause: () => void;
  hasUnsavedChanges: boolean;
}

export const SaveContinueOptions: React.FC<SaveContinueOptionsProps> = ({
  onSave,
  onPause,
  hasUnsavedChanges
}) => {
  const { toast } = useToast();

  const handleSave = () => {
    onSave();
    toast({
      title: "Progress saved",
      description: "You can continue later from where you left off",
    });
  };

  return (
    <div className="flex gap-2 justify-center">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSave}
        disabled={!hasUnsavedChanges}
        className="text-xs"
      >
        <Save className="h-3 w-3 mr-1" />
        Save Progress
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onPause}
        className="text-xs"
      >
        <Pause className="h-3 w-3 mr-1" />
        Pause & Exit
      </Button>
    </div>
  );
};
