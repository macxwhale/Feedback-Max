
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getCompletionColor } from './performanceUtils';

interface CompletionAnalysisTabProps {
  completionTrends: Array<{
    question_text: string;
    completion_rate: number;
    total_responses: number;
  }>;
}

export const CompletionAnalysisTab: React.FC<CompletionAnalysisTabProps> = ({ completionTrends }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Completion Rate Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {completionTrends.map((question, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-sm truncate">{question.question_text}</h4>
                <p className="text-xs text-gray-600">{question.total_responses} responses</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className={`text-sm font-bold ${getCompletionColor(question.completion_rate)}`}>
                    {question.completion_rate}%
                  </div>
                </div>
                <Progress 
                  value={question.completion_rate} 
                  className="w-20 h-2" 
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
