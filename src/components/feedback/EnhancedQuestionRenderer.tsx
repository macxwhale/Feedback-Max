
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StarRating } from './StarRating';
import { NPSRating } from './NPSRating';
import { LikertScale } from './LikertScale';
import { MultipleChoice } from './MultipleChoice';
import { OpenText } from './OpenText';
import { EmojiRating } from './EmojiRating';
import { RankingQuestion } from './RankingQuestion';
import { MatrixQuestion } from './MatrixQuestion';
import { EnhancedSlider } from './EnhancedSlider';
import { AnimatedQuestionCard } from './AnimatedQuestionCard';
import { MobileQuestionCard } from './MobileQuestionCard';
import { TouchOptimizedInput } from './TouchOptimizedInput';
import { QuestionConfig } from '../FeedbackForm';
import { AlertCircle, Info } from 'lucide-react';
import { useMobileDetection } from '@/hooks/useMobileDetection';

interface EnhancedQuestionRendererProps {
  question: QuestionConfig;
  value: any;
  onChange: (value: any) => void;
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export const EnhancedQuestionRenderer: React.FC<EnhancedQuestionRendererProps> = ({
  question,
  value,
  onChange,
  validation
}) => {
  const { isMobile } = useMobileDetection();
  const hasValue = value !== undefined && value !== null && value !== '';
  const isValid = validation?.isValid !== false;

  const renderQuestionInput = () => {
    const inputProps = { value, onChange };
    
    switch (question.type) {
      case 'star': return <StarRating {...inputProps} />;
      case 'nps': return <NPSRating {...inputProps} />;
      case 'likert': return <LikertScale {...inputProps} scale={question.scale} />;
      case 'emoji': return <EmojiRating {...inputProps} options={question.options || []} />;
      case 'ranking': return <RankingQuestion {...inputProps} options={question.options || []} />;
      case 'matrix': return <MatrixQuestion {...inputProps} options={question.options || []} scale={question.scale} />;
      case 'slider': return <EnhancedSlider {...inputProps} scale={question.scale} />;
      case 'single-choice':
      case 'multi-choice': return <MultipleChoice options={question.options || []} {...inputProps} multiple={question.type === 'multi-choice'} />;
      case 'text': return <OpenText value={value || ''} onChange={onChange} placeholder="Please share your thoughts..." />;
      default: return null;
    }
  };

  const QuestionCard = isMobile ? MobileQuestionCard : AnimatedQuestionCard;

  return (
    <QuestionCard
      title={question.question}
      required={question.required}
      isAnswered={hasValue && isValid}
    >
      {validation?.errors && validation.errors.length > 0 && (
        <Alert className="mb-4 border-red-200 bg-red-50 animate-fade-in">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{validation.errors[0]}</AlertDescription>
        </Alert>
      )}
      
      {validation?.warnings && validation.warnings.length > 0 && (
        <Alert className="mb-4 border-yellow-200 bg-yellow-50 animate-fade-in">
          <Info className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700">{validation.warnings[0]}</AlertDescription>
        </Alert>
      )}

      <TouchOptimizedInput>
        <div role="group" aria-labelledby={`question-${question.id}`} className="animate-fade-in">
          {renderQuestionInput()}
        </div>
      </TouchOptimizedInput>
    </QuestionCard>
  );
};
