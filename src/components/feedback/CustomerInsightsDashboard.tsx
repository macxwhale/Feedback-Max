
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Users,
  MessageSquare,
  Target,
  Lightbulb
} from 'lucide-react';
import { FeedbackResponse, QuestionConfig } from '../FeedbackForm';
import { 
  generateCustomerInsights, 
  generateImprovementSuggestions,
  CustomerInsight,
  ImprovementSuggestion
} from '@/services/customerInsightsService';

interface CustomerInsightsDashboardProps {
  responses: FeedbackResponse[];
  questions: QuestionConfig[];
}

export const CustomerInsightsDashboard: React.FC<CustomerInsightsDashboardProps> = ({
  responses,
  questions
}) => {
  const insights = generateCustomerInsights(responses);
  const suggestions = generateImprovementSuggestions(insights);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'negative': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <MessageSquare className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-[#073763]">Customer Insights Dashboard</h2>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold text-blue-600">{responses.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories Analyzed</p>
                <p className="text-2xl font-bold text-green-600">{insights.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Improvement Areas</p>
                <p className="text-2xl font-bold text-orange-600">{suggestions.filter(s => s.priority === 'high').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Category Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{insight.category}</h4>
                    <div className="flex items-center gap-2">
                      {getSentimentIcon(insight.sentiment)}
                      <Badge className={getSentimentColor(insight.sentiment)}>
                        {insight.sentiment}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Score:</span>
                      <span className={`font-bold ${getScoreColor(insight.averageScore)}`}>
                        {insight.averageScore}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Responses:</span>
                      <span className="font-medium">{insight.responseCount}</span>
                    </div>

                    {insight.keyIssues.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Key Issues:</p>
                        <div className="flex flex-wrap gap-1">
                          {insight.keyIssues.map((issue, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {issue}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {insight.recommendations.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Recommendations:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {insight.recommendations.slice(0, 2).map((rec, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-blue-500">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Improvement Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            AI-Generated Improvement Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p className="text-lg font-medium">Great job! No critical issues found.</p>
                <p className="text-sm">Your customers seem satisfied with the current service quality.</p>
              </div>
            ) : (
              suggestions.map((suggestion, index) => (
                <Card key={index} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority} priority
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {suggestion.category}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {suggestion.issue}
                        </h4>
                        <p className="text-sm text-gray-700 mb-2">
                          {suggestion.suggestion}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Impact: {suggestion.impact}</span>
                          <span>Effort: {suggestion.effort}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
