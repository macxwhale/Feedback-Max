
import React from 'react';
import { BrandedButton } from './BrandedButton';
import { MobileNavigationButtons } from './MobileNavigationButtons';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMobileDetection } from '@/hooks/useMobileDetection';

interface NavigationButtonsProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = (props) => {
  const { isMobile } = useMobileDetection();

  if (isMobile) {
    return <MobileNavigationButtons {...props} />;
  }

  const { currentQuestionIndex, totalQuestions, canGoNext, onPrevious, onNext } = props;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="flex justify-between items-center animate-fade-in">
      <BrandedButton
        variant="outline"
        onClick={onPrevious}
        disabled={currentQuestionIndex === 0}
        className="flex items-center gap-2"
      >
        <ChevronLeft size={16} />
        Previous
      </BrandedButton>

      <BrandedButton
        onClick={onNext}
        disabled={!canGoNext}
        className="flex items-center gap-2"
      >
        {isLastQuestion ? 'Submit' : 'Next'}
        {!isLastQuestion && <ChevronRight size={16} />}
      </BrandedButton>
    </div>
  );
};
