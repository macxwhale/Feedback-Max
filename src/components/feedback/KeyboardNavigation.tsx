
import React, { useEffect } from 'react';

interface KeyboardNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  isFirstQuestion: boolean;
}

export const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  onNext,
  onPrevious,
  canGoNext,
  isFirstQuestion
}) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent navigation when typing in inputs
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'ArrowRight':
        case 'Enter':
          if (canGoNext) {
            event.preventDefault();
            onNext();
          }
          break;
        case 'ArrowLeft':
          if (!isFirstQuestion) {
            event.preventDefault();
            onPrevious();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onNext, onPrevious, canGoNext, isFirstQuestion]);

  return (
    <div className="fixed bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-lg border text-xs text-gray-500">
      <div>← → Navigate • Enter Submit</div>
    </div>
  );
};
