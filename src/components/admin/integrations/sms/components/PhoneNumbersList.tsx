
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Users } from 'lucide-react';

interface PhoneNumber {
  id: string;
  phone_number: string;
  name?: string;
  status: string;
  created_at: string;
}

interface PhoneNumbersListProps {
  phoneNumbers: PhoneNumber[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const PhoneNumbersList: React.FC<PhoneNumbersListProps> = ({
  phoneNumbers,
  onDelete,
  isDeleting
}) => {
  const formatPhoneNumber = (phoneNumber: string) => {
    if (phoneNumber.startsWith('+')) return phoneNumber;
    return `+${phoneNumber}`;
  };

  if (phoneNumbers.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No phone numbers added yet.</p>
        <p className="text-sm">Add phone numbers to start sending SMS campaigns.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium">Registered Phone Numbers</h4>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {phoneNumbers.map((phone) => (
          <div key={phone.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <div className="font-medium">{formatPhoneNumber(phone.phone_number)}</div>
              {phone.name && (
                <div className="text-sm text-muted-foreground">{phone.name}</div>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={phone.status === 'active' ? 'default' : 'secondary'}>
                  {phone.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Added {new Date(phone.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(phone.id)}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
