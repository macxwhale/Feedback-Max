
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { QuestionAnalytics } from '@/types/analytics';
import { QuestionTableRow } from './components/QuestionTableRow';
import { QuestionExpandedRow } from './components/QuestionExpandedRow';
import { SortButton } from './components/SortButton';

interface QuestionsAnalyticsTableProps {
  questions: QuestionAnalytics[];
}

export const QuestionsAnalyticsTable: React.FC<QuestionsAnalyticsTableProps> = ({ questions }) => {
  const [sortField, setSortField] = useState<keyof QuestionAnalytics>('total_responses');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const handleSort = (field: keyof QuestionAnalytics) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedQuestions = [...questions].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Individual Questions Analysis</h3>
        <Badge variant="outline">{questions.length} questions</Badge>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>
                <SortButton 
                  field="question_text" 
                  currentField={sortField} 
                  direction={sortDirection}
                  onSort={handleSort}
                >
                  Question
                </SortButton>
              </TableHead>
              <TableHead>
                <SortButton 
                  field="question_type" 
                  currentField={sortField} 
                  direction={sortDirection}
                  onSort={handleSort}
                >
                  Type
                </SortButton>
              </TableHead>
              <TableHead>
                <SortButton 
                  field="category" 
                  currentField={sortField} 
                  direction={sortDirection}
                  onSort={handleSort}
                >
                  Category
                </SortButton>
              </TableHead>
              <TableHead className="text-right">
                <SortButton 
                  field="total_responses" 
                  currentField={sortField} 
                  direction={sortDirection}
                  onSort={handleSort}
                >
                  Responses
                </SortButton>
              </TableHead>
              <TableHead className="text-right">
                <SortButton 
                  field="completion_rate" 
                  currentField={sortField} 
                  direction={sortDirection}
                  onSort={handleSort}
                >
                  Completion Rate
                </SortButton>
              </TableHead>
              <TableHead>
                <SortButton 
                  field="trend" 
                  currentField={sortField} 
                  direction={sortDirection}
                  onSort={handleSort}
                >
                  Trend
                </SortButton>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedQuestions.map((question) => (
              <React.Fragment key={question.id}>
                <QuestionTableRow
                  question={question}
                  isExpanded={expandedQuestion === question.id}
                  onToggleExpanded={() => setExpandedQuestion(
                    expandedQuestion === question.id ? null : question.id
                  )}
                />
                
                {expandedQuestion === question.id && (
                  <QuestionExpandedRow question={question} />
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
