
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { SmsProvider } from './smsProviders';

interface SmsProvidersListProps {
  providers: SmsProvider[];
  selectedProvider: string | null;
  onProviderSelect: (providerId: string | null) => void;
}

export const SmsProvidersList: React.FC<SmsProvidersListProps> = ({
  providers,
  selectedProvider,
  onProviderSelect
}) => {
  return (
    <div className="space-y-3">
      <h4 className="font-medium">Available Providers</h4>
      
      {providers.map((provider) => (
        <div
          key={provider.id}
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            selectedProvider === provider.id 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => provider.status === 'available' && onProviderSelect(
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
  );
};
