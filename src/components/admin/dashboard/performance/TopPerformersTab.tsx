
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Timer } from 'lucide-react';

interface TopPerformersTabProps {
  topPerformers: Array<{
    question_text: string;
    avg_score: number;
    total_responses: number;
    completion_rate: number;
    avg_response_time_ms?: number;
  }>;
}

export const TopPerformersTab: React.FC<TopPerformersTabProps> = ({ topPerformers }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-green-600">Fastest Answered Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topPerformers.length > 0 ? topPerformers.map((question, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className="bg-green-100 text-green-800">
                    #{index + 1}
                  </Badge>
                  <Award className="w-4 h-4 text-green-600" />
                </div>
                <h4 className="font-medium text-sm">{question.question_text}</h4>
                <p className="text-xs text-gray-600">
                  {question.total_responses} responses • {question.completion_rate}% completion
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">{((question.avg_response_time_ms || 0) / 1000).toFixed(1)}s</div>
                <Timer className="w-4 h-4 text-green-500 ml-auto mt-1" />
              </div>
            </div>
          )) : (
            <p className="text-gray-500 text-center py-8">No response time data yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
