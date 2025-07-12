
import { useState } from 'react';

export const useFormNavigation = (totalQuestions: number) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const goToNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const resetNavigation = () => {
    setCurrentQuestionIndex(0);
  };

  return {
    currentQuestionIndex,
    goToNext,
    goToPrevious,
    resetNavigation,
    isLastQuestion: currentQuestionIndex === totalQuestions - 1,
    isFirstQuestion: currentQuestionIndex === 0
  };
};
