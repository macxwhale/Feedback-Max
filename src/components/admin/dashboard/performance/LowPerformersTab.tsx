
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Hourglass } from 'lucide-react';

interface LowPerformersTabProps {
  lowPerformers: Array<{
    question_text: string;
    avg_score: number;
    total_responses: number;
    completion_rate: number;
    avg_response_time_ms?: number;
  }>;
}

export const LowPerformersTab: React.FC<LowPerformersTabProps> = ({ lowPerformers }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-red-600">Slowest Answered Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lowPerformers.length > 0 ? lowPerformers.map((question, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <Badge className="bg-red-100 text-red-800">
                    Needs Attention
                  </Badge>
                </div>
                <h4 className="font-medium text-sm">{question.question_text}</h4>
                <p className="text-xs text-gray-600">
                  {question.total_responses} responses • {question.completion_rate}% completion
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-red-600">{((question.avg_response_time_ms || 0) / 1000).toFixed(1)}s</div>
                <Hourglass className="w-4 h-4 text-red-500 ml-auto mt-1" />
              </div>
            </div>
          )) : (
            <p className="text-gray-500 text-center py-8">No questions with slow response times found! 🎉</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
