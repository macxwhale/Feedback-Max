
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  MessageSquare, 
  TrendingUp, 
  Filter,
  BarChart3
} from 'lucide-react';
import type { QuestionAnalytics, CategoryAnalytics } from '@/types/analytics';

interface ResponsesAnalyticsTableProps {
  questions: QuestionAnalytics[];
  categories: CategoryAnalytics[];
}

export const ResponsesAnalyticsTable: React.FC<ResponsesAnalyticsTableProps> = ({ 
  questions, 
  categories 
}) => {
  const [viewMode, setViewMode] = useState<'questions' | 'categories'>('questions');

  // Calculate response insights
  const totalResponses = questions.reduce((sum, q) => sum + q.total_responses, 0);
  const avgResponsesPerQuestion = questions.length > 0 ? totalResponses / questions.length : 0;
  
  // Top performing questions/categories
  const topQuestions = [...questions]
    .sort((a, b) => b.total_responses - a.total_responses)
    .slice(0, 5);
    
  const topCategories = [...categories]
    .sort((a, b) => b.total_responses - a.total_responses)
    .slice(0, 5);

  // Response distribution insights
  const getResponseDistributionInsights = () => {
    const insights = [];
    
    // High response questions
    const highResponseQuestions = questions.filter(q => q.total_responses > avgResponsesPerQuestion * 1.5);
    if (highResponseQuestions.length > 0) {
      insights.push({
        type: 'success',
        title: 'High Engagement Questions',
        count: highResponseQuestions.length,
        description: 'Questions with above-average response rates'
      });
    }
    
    // Low response questions
    const lowResponseQuestions = questions.filter(q => q.total_responses < avgResponsesPerQuestion * 0.5);
    if (lowResponseQuestions.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Low Engagement Questions',
        count: lowResponseQuestions.length,
        description: 'Questions that may need optimization'
      });
    }
    
    // Positive trend questions
    const positiveTrendQuestions = questions.filter(q => q.trend === 'positive');
    if (positiveTrendQuestions.length > 0) {
      insights.push({
        type: 'success',
        title: 'Positive Trend Questions',
        count: positiveTrendQuestions.length,
        description: 'Questions showing positive response patterns'
      });
    }
    
    return insights;
  };

  const insights = getResponseDistributionInsights();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Response Analysis</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'questions' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('questions')}
          >
            By Questions
          </Button>
          <Button
            variant={viewMode === 'categories' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('categories')}
          >
            By Categories
          </Button>
        </div>
      </div>

      {/* Response Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <Card key={index} className={`border-l-4 ${
            insight.type === 'success' ? 'border-l-green-500' : 'border-l-yellow-500'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{insight.count}</div>
                  <div className="font-medium">{insight.title}</div>
                  <div className="text-sm text-gray-600">{insight.description}</div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  insight.type === 'success' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  <MessageSquare className={`w-4 h-4 ${
                    insight.type === 'success' ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Top Performing {viewMode === 'questions' ? 'Questions' : 'Categories'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(viewMode === 'questions' ? topQuestions : topCategories).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm truncate max-w-xs">
                      {viewMode === 'questions' 
                        ? (item as QuestionAnalytics).question_text 
                        : (item as CategoryAnalytics).category
                      }
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {viewMode === 'questions' 
                        ? `${(item as QuestionAnalytics).total_responses} responses` 
                        : `${(item as CategoryAnalytics).total_questions} questions • ${(item as CategoryAnalytics).total_responses} responses`
                      }
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">{item.total_responses} responses</Badge>
                    <div className="w-16">
                      <Progress value={item.completion_rate} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Response Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded">
                  <div className="text-2xl font-bold text-blue-600">{totalResponses}</div>
                  <div className="text-sm text-gray-600">Total Responses</div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(avgResponsesPerQuestion)}
                  </div>
                  <div className="text-sm text-gray-600">Avg per Question</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Response Rate Distribution</h4>
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{category.category}</span>
                    <div className="flex items-center space-x-2 w-32">
                      <div className="flex-1">
                        <Progress value={category.completion_rate} className="h-2" />
                      </div>
                      <span className="text-xs w-8">{category.completion_rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
