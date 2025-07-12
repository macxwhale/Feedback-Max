
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessAnimationProps {
  show: boolean;
  message?: string;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  show,
  message = 'Success!'
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="animate-scale-in">
        <div className="bg-white rounded-full p-4 shadow-lg border-4 border-green-500 animate-pulse-success">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <p className="text-center mt-2 text-green-600 font-medium animate-fade-in">
          {message}
        </p>
      </div>
    </div>
  );
};
