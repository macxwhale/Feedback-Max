
import React from 'react';
import { PrivacyNotice } from './PrivacyNotice';
import { SimpleThankYouModal } from './SimpleThankYouModal';
import { FeedbackResponse, QuestionConfig } from '../FeedbackForm';

interface FeedbackModalsProps {
  showPrivacyNotice: boolean;
  isComplete: boolean;
  finalResponses: FeedbackResponse[];
  questions: QuestionConfig[];
  onAcceptPrivacy: () => void;
  onReset: () => void;
}

export const FeedbackModals: React.FC<FeedbackModalsProps> = ({
  showPrivacyNotice,
  isComplete,
  finalResponses,
  questions,
  onAcceptPrivacy,
  onReset
}) => {
  return (
    <>
      <PrivacyNotice
        isVisible={showPrivacyNotice}
        onAccept={onAcceptPrivacy}
      />
      
      <SimpleThankYouModal
        isOpen={isComplete}
        responses={finalResponses}
        questions={questions}
        onClose={onReset}
      />
    </>
  );
};
