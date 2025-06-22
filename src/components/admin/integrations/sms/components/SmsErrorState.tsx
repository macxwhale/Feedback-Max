
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, MessageSquare } from 'lucide-react';

interface SmsErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const SmsErrorState: React.FC<SmsErrorStateProps> = ({ 
  title = "SMS Integrations",
  message,
  onRetry 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center p-4">
          <p className="text-sm text-red-600 mb-2">
            Organization not found or failed to load
          </p>
          <p className="text-xs text-gray-500 mb-4">
            {message}
          </p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="text-sm text-blue-600 hover:underline"
            >
              Try again
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
