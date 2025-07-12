
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FeedbackResponse, QuestionConfig } from '../FeedbackForm';

interface QuestionScoresProps {
  responses: FeedbackResponse[];
  questions: QuestionConfig[];
}

export const QuestionScores: React.FC<QuestionScoresProps> = ({ responses, questions }) => {
  const getQuestionText = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    return question?.question || 'Unknown Question';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-[#073763] mb-4">
        Your Question Scores:
      </h4>
      {responses.map((response, index) => (
        <Card key={response.questionId} className="border-l-4 border-l-[#007ACE]">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                <p className="text-sm text-gray-600 mb-1">
                  Question {index + 1}
                </p>
                <p className="font-medium text-gray-900">
                  {getQuestionText(response.questionId)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Your answer: {
                    Array.isArray(response.value) 
                      ? response.value.join(', ')
                      : String(response.value)
                  }
                </p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(response.score)}`}>
                  {response.score}
                </div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
