
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { QuestionDrillDown } from './QuestionDrillDown';
import { ChevronRight, BarChart3, List, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import type { QuestionAnalytics, CategoryAnalytics } from '@/types/analytics';

interface AnalyticsTableProps {
  questions: QuestionAnalytics[];
  categories: CategoryAnalytics[];
  summary: {
    total_questions: number;
    total_responses: number;
    overall_avg_score: number;
    overall_completion_rate: number;
  };
  showDrillDown?: boolean;
}

export const AnalyticsTable: React.FC<AnalyticsTableProps> = ({
  questions,
  categories,
  summary,
  showDrillDown = false
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  console.log('AnalyticsTable - Rendering with data:', {
    questionsCount: questions?.length,
    categoriesCount: categories?.length,
    summary,
    showDrillDown
  });

  const getAnalysisIcon = (trend: string) => {
    switch (trend) {
      case 'positive':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'mixed':
        return <TrendingUp className="w-4 h-4 text-yellow-600" />;
      default:
        return <TrendingUp className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAnalysisColor = (trend: string): string => {
    switch (trend) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      case 'mixed':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendLabel = (trend: string): string => {
    switch (trend) {
      case 'positive':
        return 'Positive';
      case 'negative':
        return 'Needs Attention';
      case 'mixed':
        return 'Mixed Results';
      default:
        return 'Neutral';
    }
  };

  // Show fallback content if no data
  if (!questions && !categories) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Analytics Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No analytics data available yet</p>
            <p className="text-sm text-gray-400 mt-2">Data will appear here once feedback is collected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Analytics Dashboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="questions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="questions" className="flex items-center space-x-2">
              <List className="w-4 h-4" />
              <span>Questions ({questions?.length || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="categories">Categories ({categories?.length || 0})</TabsTrigger>
          </TabsList>
          <TabsContent value="questions">
            <div className="space-y-4">
              {questions && questions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Responses</TableHead>
                      <TableHead>Completion Rate</TableHead>
                      <TableHead>Trend</TableHead>
                      <TableHead>Key Insights</TableHead>
                      {showDrillDown && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((question) => (
                      <React.Fragment key={question.id}>
                        <TableRow>
                          <TableCell className="font-medium max-w-xs truncate">
                            {question.question_text}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{question.question_type}</Badge>
                          </TableCell>
                          <TableCell>{question.category}</TableCell>
                          <TableCell>{question.total_responses}</TableCell>
                          <TableCell>{question.completion_rate}%</TableCell>
                          <TableCell>
                            <div className={`flex items-center space-x-2 px-2 py-1 rounded-md ${getAnalysisColor(question.trend)}`}>
                              {getAnalysisIcon(question.trend)}
                              <span className="font-medium">{getTrendLabel(question.trend)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="text-sm">
                              {question.insights?.slice(0, 2).map((insight, idx) => (
                                <div key={idx} className="truncate">{insight}</div>
                              )) || <span className="text-gray-400">No insights</span>}
                            </div>
                          </TableCell>
                          {showDrillDown && (
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedQuestion(
                                  selectedQuestion === question.id ? null : question.id
                                )}
                              >
                                <ChevronRight className={`w-4 h-4 transition-transform ${
                                  selectedQuestion === question.id ? 'rotate-90' : ''
                                }`} />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                        {showDrillDown && selectedQuestion === question.id && (
                          <TableRow>
                            <TableCell colSpan={8} className="p-0">
                              <div className="p-4 bg-gray-50">
                                <QuestionDrillDown
                                  questionId={question.id}
                                  questionText={question.question_text}
                                  questionType={question.question_type}
                                  responses={[]}
                                  avgScore={0}
                                  completionRate={question.completion_rate}
                                />
                                
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm">Response Insights</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <ul className="text-sm space-y-1">
                                        {question.insights?.map((insight, idx) => (
                                          <li key={idx} className="flex items-start space-x-2">
                                            <span className="text-blue-500 mt-1">•</span>
                                            <span>{insight}</span>
                                          </li>
                                        )) || <li className="text-gray-400">No insights available</li>}
                                      </ul>
                                    </CardContent>
                                  </Card>
                                  
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm">Response Distribution</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="text-sm space-y-1">
                                        {question.response_distribution && Object.entries(question.response_distribution).length > 0 ? (
                                          Object.entries(question.response_distribution).slice(0, 3).map(([value, count], idx) => (
                                            <div key={idx} className="flex justify-between">
                                              <span className="truncate">{value}</span>
                                              <span className="font-medium">{count}</span>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="text-gray-400">No responses yet</div>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <List className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No questions found</p>
                  <p className="text-sm text-gray-400 mt-2">Questions will appear here once they are created</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="categories">
            {categories && categories.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Total Responses</TableHead>
                    <TableHead>Completion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{category.category}</TableCell>
                      <TableCell>{category.total_questions}</TableCell>
                      <TableCell>{category.total_responses}</TableCell>
                      <TableCell>{category.completion_rate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No categories found</p>
                <p className="text-sm text-gray-400 mt-2">Categories will appear here once questions are categorized</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
