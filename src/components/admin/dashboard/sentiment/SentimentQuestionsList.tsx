
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, MessageCircle } from 'lucide-react';
import { SentimentIcon } from './SentimentIcon';
import { getSentimentColor } from './sentimentUtils';
import { QuestionCommentsSection } from './QuestionCommentsSection';

interface SentimentQuestionsListProps {
  questionSentiments: Array<{
    question_text: string;
    sentiment: string;
    total_responses: number;
    completion_rate: number;
    question_type?: string;
    text_responses?: Array<{
      id: string;
      response_value: string;
      score: number;
      created_at: string;
      sentiment?: 'positive' | 'negative' | 'neutral';
    }>;
  }>;
}

export const SentimentQuestionsList: React.FC<SentimentQuestionsListProps> = ({
  questionSentiments
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Sentiment Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {questionSentiments.map((question, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <SentimentIcon sentiment={question.sentiment} />
                    <Badge className={getSentimentColor(question.sentiment)}>
                      {question.sentiment}
                    </Badge>
                    {question.question_type === 'text' && question.text_responses && question.text_responses.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MessageCircle className="w-4 h-4" />
                        {question.text_responses.length} comment{question.text_responses.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  <h4 className="font-medium text-sm">{question.question_text}</h4>
                  <p className="text-xs text-gray-600">
                    {question.total_responses} responses • {question.completion_rate}% completion
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{question.completion_rate}%</div>
                  {question.sentiment === 'negative' && (
                    <AlertTriangle className="w-4 h-4 text-red-500 ml-auto mt-1" />
                  )}
                  {question.sentiment === 'positive' && (
                    <CheckCircle className="w-4 h-4 text-green-500 ml-auto mt-1" />
                  )}
                </div>
              </div>
              
              {/* Show comments section for text questions */}
              {question.question_type === 'text' && question.text_responses && question.text_responses.length > 0 && (
                <QuestionCommentsSection
                  textResponses={question.text_responses}
                  questionText={question.question_text}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
