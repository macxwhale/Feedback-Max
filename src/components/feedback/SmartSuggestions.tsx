
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { QuestionConfig } from '../FeedbackForm';

interface SmartSuggestionsProps {
  currentQuestion: QuestionConfig;
  responses: Record<string, any>;
  onSuggestionClick: (value: any) => void;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  currentQuestion,
  responses,
  onSuggestionClick
}) => {
  const generateSuggestions = () => {
    const prevResponses = Object.values(responses);
    const avgPositivity = prevResponses.filter(r => 
      (typeof r === 'number' && r >= 4) || 
      (typeof r === 'string' && r.includes('good'))
    ).length / prevResponses.length;

    switch (currentQuestion.type) {
      case 'star':
        return avgPositivity > 0.6 ? [5, 4] : [3, 4];
      case 'text':
        return avgPositivity > 0.6 
          ? ['Great service overall!', 'Very satisfied with the experience']
          : ['Could be improved', 'Good but has room for enhancement'];
      case 'single-choice':
        return currentQuestion.options?.slice(0, 2) || [];
      default:
        return [];
    }
  };

  const suggestions = generateSuggestions();
  if (suggestions.length === 0) return null;

  return (
    <Card className="mt-4 bg-blue-50 border-blue-200 animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
          <Lightbulb className="h-4 w-4" />
          Smart Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {suggestions.slice(0, 2).map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="w-full justify-between text-left h-auto p-3 hover:bg-blue-100"
              onClick={() => onSuggestionClick(suggestion)}
            >
              <span className="truncate">{String(suggestion)}</span>
              <ArrowRight className="h-3 w-3 ml-2 flex-shrink-0" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
