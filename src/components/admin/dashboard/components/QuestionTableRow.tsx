
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { QuestionAnalytics } from '@/types/analytics';

interface QuestionTableRowProps {
  question: QuestionAnalytics;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export const QuestionTableRow: React.FC<QuestionTableRowProps> = ({
  question,
  isExpanded,
  onToggleExpanded
}) => {
  const getQuestionTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      'text': 'bg-blue-100 text-blue-800',
      'multiple_choice': 'bg-green-100 text-green-800',
      'scale': 'bg-purple-100 text-purple-800',
      'rating': 'bg-yellow-100 text-yellow-800',
      'nps': 'bg-orange-100 text-orange-800'
    };
    return typeColors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpanded}
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </TableCell>
      <TableCell className="max-w-xs">
        <div className="truncate" title={question.question_text}>
          {question.question_text}
        </div>
      </TableCell>
      <TableCell>
        <Badge className={getQuestionTypeColor(question.question_type)}>
          {question.question_type}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{question.category}</Badge>
      </TableCell>
      <TableCell className="text-right font-medium">
        {question.total_responses}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end space-x-2">
          <span className="font-medium">{question.completion_rate}%</span>
          <div className="w-12">
            <Progress value={question.completion_rate} className="h-2" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={question.trend === 'positive' ? 'default' : question.trend === 'negative' ? 'destructive' : 'secondary'}>
          {question.trend}
        </Badge>
      </TableCell>
    </TableRow>
  );
};
