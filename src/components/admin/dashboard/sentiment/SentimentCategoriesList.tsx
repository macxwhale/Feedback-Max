
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SentimentIcon } from './SentimentIcon';
import { getSentimentColor } from './sentimentUtils';

interface SentimentCategoriesListProps {
  categorySentiments: Array<{
    category: string;
    sentiment: string;
    total_questions: number;
    total_responses: number;
  }>;
}

export const SentimentCategoriesList: React.FC<SentimentCategoriesListProps> = ({
  categorySentiments
}) => {
  const totalQuestions = categorySentiments.reduce((sum, cat) => sum + cat.total_questions, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categorySentiments.map((category, index) => {
            const questionPercentage = totalQuestions > 0 
              ? Math.round((category.total_questions / totalQuestions) * 100) 
              : 0;

            return (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <SentimentIcon sentiment={category.sentiment} />
                    <h4 className="font-medium">{category.category}</h4>
                    <Badge className={getSentimentColor(category.sentiment)}>
                      {category.sentiment === 'positive' ? 'Performing Well' : 
                       category.sentiment === 'negative' ? 'Needs Improvement' : 'Average Performance'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {category.total_questions} question{category.total_questions !== 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Category Coverage</span>
                    <span>{questionPercentage}%</span>
                  </div>
                  <Progress value={questionPercentage} className="h-2" />
                  
                  <div className="text-xs text-gray-500">
                    {category.total_responses} total responses
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
