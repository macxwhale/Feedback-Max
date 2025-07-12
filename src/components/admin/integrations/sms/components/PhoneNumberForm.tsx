
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface PhoneNumberFormProps {
  phoneNumber: string;
  name: string;
  onPhoneNumberChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const PhoneNumberForm: React.FC<PhoneNumberFormProps> = ({
  phoneNumber,
  name,
  onPhoneNumberChange,
  onNameChange,
  onSubmit,
  isLoading
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="phone-number">Phone Number *</Label>
          <Input
            id="phone-number"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            placeholder="+1234567890"
            required
          />
        </div>
        <div>
          <Label htmlFor="name">Name (Optional)</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="John Doe"
          />
        </div>
        <div className="flex items-end">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Number
          </Button>
        </div>
      </div>
    </form>
  );
};
