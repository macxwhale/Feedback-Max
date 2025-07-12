import React, { useEffect, useState } from 'react';
import { WelcomeScreen } from './feedback/WelcomeScreen';
import { EnhancedLoading } from './feedback/EnhancedLoading';
import { FeedbackContainer } from './feedback/FeedbackContainer';
import { FeedbackContent } from './feedback/FeedbackContent';
import { FeedbackModals } from './feedback/FeedbackModals';
import { FeedbackErrorBoundary } from './feedback/FeedbackErrorBoundary';
import { useFeedbackForm } from '@/hooks/useFeedbackForm';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePrivacyConsent } from '@/hooks/usePrivacyConsent';
import { useSaveContinue } from '@/hooks/useSaveContinue';
import { useOrganization } from '@/hooks/useOrganization';

export interface QuestionConfig {
  id: string;
  type: 'star' | 'nps' | 'likert' | 'single-choice' | 'multi-choice' | 'text' | 'emoji' | 'ranking' | 'matrix' | 'slider';
  question: string;
  required: boolean;
  category: 'QualityCommunication' | 'QualityStaff' | 'ValueForMoney' | 'QualityService' | 'LikeliRecommend' | 'DidWeMakeEasy' | 'Comments';
  options?: string[];
  scale?: {
    min: number;
    max: number;
    minLabel?: string;
    maxLabel?: string;
  };
}

export interface FeedbackResponse {
  questionId: string;
  value: any;
  score: number;
  category: string;
}

const FeedbackForm = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const { organization, isLoading: orgLoading, error: orgError } = useOrganization();
  
  console.log('FeedbackForm - Organization state:', { organization, orgLoading, orgError });

  const {
    questions,
    currentQuestionIndex,
    responses,
    isComplete,
    finalResponses,
    isLoading,
    questionsError,
    completedQuestions,
    handleResponse,
    isCurrentQuestionAnswered,
    goToNext,
    goToPrevious,
    resetForm,
    getValidationResult
  } = useFeedbackForm();

  const {
    trackQuestionStart,
    trackQuestionResponse,
    getAverageResponseTime,
    getEstimatedTimeRemaining
  } = useAnalytics(responses, questions.length, finalResponses);

  const { hasConsented, showPrivacyNotice, acceptPrivacy } = usePrivacyConsent();
  const { saveProgress, pauseAndExit, hasUnsavedChanges } = useSaveContinue(
    responses,
    currentQuestionIndex,
    completedQuestions
  );

  useEffect(() => {
    if (!showWelcome && questions.length > 0) {
      trackQuestionStart();
    }
  }, [currentQuestionIndex, trackQuestionStart, showWelcome, questions.length]);

  const handleQuestionResponse = (questionId: string, value: any) => {
    handleResponse(questionId, value);
    trackQuestionResponse();
  };

  const handleStart = () => {
    setShowWelcome(false);
  };

  const handleReset = () => {
    resetForm();
    setShowWelcome(true);
  };

  // Check for error boundary conditions
  if (orgLoading) {
    console.log('FeedbackForm - Showing loading state');
    return <EnhancedLoading />;
  }

  if (orgError || !organization) {
    console.log('FeedbackForm - Showing error boundary for org');
    return (
      <FeedbackErrorBoundary 
        orgLoading={orgLoading}
        orgError={orgError}
        organization={organization}
      />
    );
  }

  if (questionsError) {
    console.log('FeedbackForm - Showing error boundary for questions');
    return (
      <FeedbackErrorBoundary 
        orgLoading={false}
        orgError={questionsError}
        organization={organization}
      />
    );
  }

  if (isLoading) {
    console.log('FeedbackForm - Questions loading');
    return <EnhancedLoading />;
  }

  if (showWelcome) {
    console.log('FeedbackForm - Showing welcome screen');
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (questions.length === 0) {
    console.log('FeedbackForm - No questions available');
    return (
      <FeedbackErrorBoundary 
        orgLoading={false}
        orgError="No questions configured for this organization"
        organization={organization}
      />
    );
  }

  console.log('FeedbackForm - Rendering main content');
  return (
    <FeedbackContainer>
      <FeedbackContent
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        responses={responses}
        completedQuestions={completedQuestions}
        hasConsented={hasConsented}
        canGoNext={isCurrentQuestionAnswered()}
        estimatedTimeRemaining={getEstimatedTimeRemaining(currentQuestionIndex)}
        averageResponseTime={getAverageResponseTime()}
        hasUnsavedChanges={hasUnsavedChanges}
        onQuestionResponse={handleQuestionResponse}
        onNext={goToNext}
        onPrevious={goToPrevious}
        onSaveProgress={saveProgress}
        onPauseAndExit={pauseAndExit}
        getValidationResult={getValidationResult}
      />

      <FeedbackModals
        showPrivacyNotice={showPrivacyNotice}
        isComplete={isComplete}
        finalResponses={finalResponses}
        questions={questions}
        onAcceptPrivacy={acceptPrivacy}
        onReset={handleReset}
      />
    </FeedbackContainer>
  );
};

export default FeedbackForm;
