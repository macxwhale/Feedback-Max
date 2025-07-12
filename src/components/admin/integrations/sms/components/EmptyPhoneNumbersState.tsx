
import React from 'react';
import { Users } from 'lucide-react';

export const EmptyPhoneNumbersState: React.FC = () => {
  return (
    <div className="text-center p-8 text-muted-foreground">
      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>No active phone numbers found.</p>
      <p className="text-sm">Add phone numbers before creating campaigns.</p>
    </div>
  );
};
