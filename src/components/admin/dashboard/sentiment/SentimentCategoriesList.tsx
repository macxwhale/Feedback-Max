
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Sentiment Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categorySentiments.map((category, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <SentimentIcon sentiment={category.sentiment} />
                  <Badge className={getSentimentColor(category.sentiment)}>
                    {category.sentiment}
                  </Badge>
                </div>
                <h4 className="font-medium">{category.category}</h4>
                <p className="text-sm text-gray-600">
                  {category.total_questions} questions • {category.total_responses} responses
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">{category.total_responses}</div>
                <div className="text-sm text-gray-500">responses</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
