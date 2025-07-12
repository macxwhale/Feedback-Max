import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from './StarRating';
import { NPSRating } from './NPSRating';
import { LikertScale } from './LikertScale';
import { MultipleChoice } from './MultipleChoice';
import { OpenText } from './OpenText';
import { QuestionConfig } from '../FeedbackForm';
import { useDynamicBranding } from '@/hooks/useDynamicBranding';
import { useFeatureGate } from '@/hooks/useFeatureGate';

interface QuestionRendererProps {
  question: QuestionConfig;
  value: any;
  onChange: (value: any) => void;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange
}) => {
  const { colors } = useDynamicBranding();
  const { allowedQuestionTypes, plan } = useFeatureGate();

  if (!allowedQuestionTypes().includes(question.type)) {
    // Hide or disable unsupported question types for current plan
    return (
      <div className="mb-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded text-yellow-800">
          <strong>Feature unavailable:</strong> The <span className="font-mono">{question.type}</span> question type is not available for your plan (<b>{plan}</b>). 
          <br />Upgrade your plan to access this feature.
        </div>
      </div>
    );
  }

  const headerStyle = {
    background: `linear-gradient(to right, ${colors.primary}, ${colors.accent})`
  };

  return (
    <Card className="mb-8 shadow-lg border-0 animate-fade-in">
      <CardHeader className="text-white rounded-t-lg" style={headerStyle}>
        <CardTitle className="text-xl">
          {question.question}
        </CardTitle>
        {question.required && (
          <span className="text-orange-200 text-sm">* Required</span>
        )}
      </CardHeader>
      <CardContent className="p-6">
        {question.type === 'star' && (
          <StarRating
            value={value || 0}
            onChange={onChange}
          />
        )}
        {question.type === 'nps' && (
          <NPSRating
            value={value}
            onChange={onChange}
          />
        )}
        {question.type === 'likert' && (
          <LikertScale
            value={value}
            onChange={onChange}
            scale={question.scale}
          />
        )}
        {(question.type === 'single-choice' || question.type === 'multi-choice') && (
          <MultipleChoice
            options={question.options || []}
            value={value}
            onChange={onChange}
            multiple={question.type === 'multi-choice'}
          />
        )}
        {question.type === 'text' && (
          <OpenText
            value={value || ''}
            onChange={onChange}
            placeholder="Please share your thoughts..."
          />
        )}
      </CardContent>
    </Card>
  );
};
