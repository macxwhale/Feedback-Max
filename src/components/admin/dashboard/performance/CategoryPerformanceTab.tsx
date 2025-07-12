
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getResponseTimeColor } from './performanceUtils';

interface CategoryPerformanceTabProps {
  categoryPerformance: Array<{
    category: string;
    avg_score: number;
    total_questions: number;
    total_responses: number;
    completion_rate: number;
    avg_response_time_ms?: number;
  }>;
}

export const CategoryPerformanceTab: React.FC<CategoryPerformanceTabProps> = ({ categoryPerformance }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categoryPerformance.map((category, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline">#{index + 1}</Badge>
                </div>
                <h4 className="font-medium">{category.category}</h4>
                <p className="text-sm text-gray-600">
                  {category.total_questions} questions • {category.total_responses} responses
                </p>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold ${getResponseTimeColor(category.avg_response_time_ms || 0)}`}>
                  {((category.avg_response_time_ms || 0) / 1000).toFixed(1)}s
                </div>
                <div className="text-sm text-gray-500">
                  {category.completion_rate}% completion
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
