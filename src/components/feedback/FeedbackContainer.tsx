
import React from 'react';
import { useMobileDetection } from '@/hooks/useMobileDetection';

interface FeedbackContainerProps {
  children: React.ReactNode;
}

export const FeedbackContainer: React.FC<FeedbackContainerProps> = ({ children }) => {
  const { isMobile } = useMobileDetection();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 ${isMobile ? 'pb-24' : ''}`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl" />
      </div>
      
      {children}
    </div>
  );
};
