
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, MessageSquare } from 'lucide-react';

interface SmsProvidersListProps {
  selectedProvider: string | null;
  onProviderSelect: (providerId: string | null) => void;
}

export const SmsProvidersList: React.FC<SmsProvidersListProps> = ({
  selectedProvider,
  onProviderSelect
}) => {
  const provider = {
    id: 'sms-provider',
    name: "SMS Provider (Flask Wrapper)",
    description: 'SMS services via Flask wrapper integration',
    icon: MessageSquare,
    status: 'available' as const
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium">SMS Integration</h4>
      
      <div
        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
          selectedProvider === provider.id 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => onProviderSelect(
          selectedProvider === provider.id ? null : provider.id
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <provider.icon className="w-6 h-6" />
            <div>
              <h5 className="font-medium">{provider.name}</h5>
              <p className="text-sm text-muted-foreground">{provider.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default">Available</Badge>
            {selectedProvider === provider.id && (
              <Check className="w-4 h-4 text-blue-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
