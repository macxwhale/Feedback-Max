
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FeedbackResponse } from '../FeedbackForm';

interface TotalScoreProps {
  responses: FeedbackResponse[];
}

export const TotalScore: React.FC<TotalScoreProps> = ({ responses }) => {
  const totalScore = responses.reduce((sum, response) => sum + response.score, 0);

  return (
    <Card className="bg-gray-50">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-[#1e3a8a]">
            Total Points Earned:
          </span>
          <span className="text-2xl font-bold text-[#f97316]">
            {totalScore} pts
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Based on {responses.length} answered question{responses.length !== 1 ? 's' : ''}
        </p>
      </CardContent>
    </Card>
  );
};
