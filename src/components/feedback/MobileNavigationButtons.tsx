
import React from 'react';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileNavigationButtonsProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const MobileNavigationButtons: React.FC<MobileNavigationButtonsProps> = ({
  currentQuestionIndex,
  totalQuestions,
  canGoNext,
  onPrevious,
  onNext
}) => {
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-3">
        <div className="flex justify-between items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={onPrevious}
            disabled={currentQuestionIndex === 0}
            className="flex-1 border-[#073763] text-[#073763] hover:bg-[#073763] hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Previous
          </Button>

          <Button
            size="lg"
            onClick={onNext}
            disabled={!canGoNext}
            className="flex-1 bg-gradient-to-r from-[#073763] to-[#007ACE] hover:from-[#062c52] hover:to-[#0066a6] text-white disabled:opacity-30"
          >
            {isLastQuestion ? (
              <>
                <Send className="h-5 w-5 mr-1" />
                Submit
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-5 w-5 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
