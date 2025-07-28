
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, MessageCircle, Calendar, Star } from 'lucide-react';
import { TextResponse } from '@/types/analytics';
import { format } from 'date-fns';

interface QuestionCommentsSectionProps {
  textResponses: TextResponse[];
  questionText: string;
}

export const QuestionCommentsSection: React.FC<QuestionCommentsSectionProps> = ({
  textResponses,
  questionText
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'low'>('all');

  const filteredResponses = textResponses.filter(response => {
    if (scoreFilter === 'all') return true;
    if (scoreFilter === 'high') return response.score >= 4;
    if (scoreFilter === 'low') return response.score <= 2;
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'bg-green-100 text-green-800';
    if (score <= 2) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4) return 'High Rated';
    if (score <= 2) return 'Low Rated';
    return 'Average';
  };

  const visibleResponses = filteredResponses.slice(0, visibleCount);
  const hasMore = filteredResponses.length > visibleCount;

  if (textResponses.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          View Comments ({textResponses.length})
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
        
        {isExpanded && (
          <div className="flex gap-2">
            <Button
              variant={scoreFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setScoreFilter('all')}
            >
              All
            </Button>
            <Button
              variant={scoreFilter === 'high' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setScoreFilter('high')}
            >
              High Rated (4-5★)
            </Button>
            <Button
              variant={scoreFilter === 'low' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setScoreFilter('low')}
            >
              Low Rated (1-2★)
            </Button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {visibleResponses.map((response) => (
            <Card key={response.id} className="p-4 bg-gray-50">
              <CardContent className="p-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {response.score > 0 && (
                      <>
                        <Badge className={getScoreColor(response.score)}>
                          {getScoreLabel(response.score)}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {response.score}/5
                        </div>
                      </>
                    )}
                    {response.score === 0 && (
                      <Badge className="bg-gray-100 text-gray-800">
                        No Rating
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(response.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
                
                <div className="text-sm text-gray-700 leading-relaxed">
                  <CommentText text={response.response_value} />
                </div>
              </CardContent>
            </Card>
          ))}

          {hasMore && (
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisibleCount(prev => prev + 5)}
              >
                Load More Comments
              </Button>
            </div>
          )}

          {filteredResponses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No comments match the selected filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CommentText: React.FC<{ text: string }> = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = text.length > 200;

  if (!shouldTruncate) {
    return <span>{text}</span>;
  }

  return (
    <div>
      <span>{isExpanded ? text : text.substring(0, 200) + '...'}</span>
      <Button
        variant="ghost"
        size="sm"
        className="ml-2 p-0 h-auto text-blue-600 hover:text-blue-800"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Read Less' : 'Read More'}
      </Button>
    </div>
  );
};
