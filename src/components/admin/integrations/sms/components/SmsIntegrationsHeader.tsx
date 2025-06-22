
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export const SmsIntegrationsHeader: React.FC = () => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        SMS Integrations
      </CardTitle>
      <CardDescription>
        Enable SMS feedback collection from your customers
      </CardDescription>
    </CardHeader>
  );
};
