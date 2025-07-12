
import React from 'react';
import { useMobileDetection } from '@/hooks/useMobileDetection';

interface TouchOptimizedInputProps {
  children: React.ReactNode;
  className?: string;
}

export const TouchOptimizedInput: React.FC<TouchOptimizedInputProps> = ({
  children,
  className = ''
}) => {
  const { isMobile, isTouchDevice } = useMobileDetection();

  const wrapperClasses = `
    ${isMobile && isTouchDevice ? 'touch-manipulation' : ''}
    ${isMobile ? 'min-h-[44px]' : 'min-h-[40px]'}
    ${className}
  `;

  return (
    <div className={wrapperClasses} style={{ WebkitTapHighlightColor: 'transparent' }}>
      {children}
    </div>
  );
};
