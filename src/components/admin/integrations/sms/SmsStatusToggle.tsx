
import React from 'react';
import { Switch } from '@/components/ui/switch';

interface SmsStatusToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  isLoading: boolean;
}

export const SmsStatusToggle: React.FC<SmsStatusToggleProps> = ({
  enabled,
  onToggle,
  isLoading
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-medium">SMS Feedback</h4>
        <p className="text-sm text-muted-foreground">
          Allow customers to provide feedback via SMS
        </p>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        disabled={isLoading}
      />
    </div>
  );
};
