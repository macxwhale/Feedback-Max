
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface QuestionResponse {
  id: string;
  response_value: any;
  created_at: string;
  question_category: string;
}

interface QuestionDrillDownProps {
  questionId: string;
  questionText: string;
  questionType: string;
  responses: QuestionResponse[];
  avgScore: number; // Keep for now but won't use
  completionRate: number;
}

export const QuestionDrillDown: React.FC<QuestionDrillDownProps> = ({
  questionId,
  questionText,
  questionType,
  responses,
  completionRate
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch real recent responses from database
  const { data: recentResponses } = useQuery({
    queryKey: ['question-responses', questionId],
    queryFn: async () => {
      const { data } = await supabase
        .from('feedback_responses')
        .select('id, response_value, created_at, question_category')
        .eq('question_id', questionId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      return data || [];
    },
    enabled: isExpanded
  });

  // Calculate response distribution
  const responseDistribution = () => {
    if (!recentResponses || recentResponses.length === 0) return [];

    const distribution: Record<string, number> = {};
    recentResponses.forEach(response => {
      const value = String(response.response_value || 'No Response');
      distribution[value] = (distribution[value] || 0) + 1;
    });

    return Object.entries(distribution).map(([value, count]) => ({
      value,
      count,
      percentage: (count / recentResponses.length) * 100
    }));
  };

  const getTrendIcon = (questionType: string) => {
    // Simple trend determination based on question type
    switch (questionType.toLowerCase()) {
      case 'star rating':
      case 'nps score':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'text input':
        return <Minus className="w-4 h-4 text-gray-600" />;
      default:
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatResponseValue = (value: any, questionType: string): string => {
    if (value === null || value === undefined) return 'No Response';
    
    switch (questionType.toLowerCase()) {
      case 'star rating':
        return `${value} stars`;
      case 'nps score':
        return `${value}/10`;
      case 'single choice':
      case 'multiple choice':
        return Array.isArray(value) ? value.join(', ') : String(value);
      case 'slider':
        return `${value}`;
      default:
        return String(value);
    }
  };

  const options = responseDistribution();

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{questionText}</CardTitle>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant="outline">{questionType}</Badge>
              <span className="text-sm text-gray-600">{responses.length} responses</span>
              <span className="text-sm text-gray-600">{completionRate}% completion</span>
              <div className="flex items-center space-x-1">
                {getTrendIcon(questionType)}
                <span className="text-sm text-gray-600">Active</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="space-y-6">
            {/* Response Distribution for Selection Questions */}
            {options.length > 0 && ['single choice', 'multiple choice', 'star rating', 'emoji rating'].includes(questionType.toLowerCase()) && (
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <PieChart className="w-4 h-4 mr-2" />
                  Response Distribution
                </h4>
                <div className="space-y-3">
                  {options.slice(0, 5).map((option, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium truncate">{option.value}</span>
                        <span>{option.count} ({Math.round(option.percentage)}%)</span>
                      </div>
                      <Progress value={option.percentage} className="h-2" />
                    </div>
                  ))}
                  {options.length > 5 && (
                    <p className="text-sm text-gray-500">... and {options.length - 5} more responses</p>
                  )}
                </div>
              </div>
            )}

            {/* Response Patterns for Other Question Types */}
            {questionType.toLowerCase() === 'text input' && recentResponses && recentResponses.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Response Analysis
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-900">Total Responses</div>
                    <div className="text-2xl font-bold text-blue-600">{recentResponses.length}</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-900">Response Rate</div>
                    <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Responses Sample */}
            <div>
              <h4 className="font-medium mb-3">Recent Responses</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentResponses && recentResponses.length > 0 ? (
                  recentResponses.slice(0, 5).map((response, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">
                          {formatResponseValue(response.response_value, questionType)}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {new Date(response.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-gray-600 text-xs mt-1">
                        Category: {response.question_category}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No responses yet</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
