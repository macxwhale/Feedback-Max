
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronDown, 
  ChevronUp, 
  Users,
  BarChart3
} from 'lucide-react';
import type { CategoryAnalytics } from '@/types/analytics';

interface CategoriesAnalyticsTableProps {
  categories: CategoryAnalytics[];
}

export const CategoriesAnalyticsTable: React.FC<CategoriesAnalyticsTableProps> = ({ categories }) => {
  const [sortField, setSortField] = useState<keyof CategoryAnalytics>('total_responses');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleSort = (field: keyof CategoryAnalytics) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedCategories = [...categories].sort((a, b) => {
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

  const SortButton = ({ field, children }: { field: keyof CategoryAnalytics; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-medium"
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
      )}
    </Button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Question Categories Analysis</h3>
        <Badge variant="outline">{categories.length} categories</Badge>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>
                <SortButton field="category">Category</SortButton>
              </TableHead>
              <TableHead className="text-right">
                <SortButton field="total_questions">Questions</SortButton>
              </TableHead>
              <TableHead className="text-right">
                <SortButton field="total_responses">Responses</SortButton>
              </TableHead>
              <TableHead className="text-right">
                <SortButton field="completion_rate">Completion Rate</SortButton>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCategories.map((category) => (
              <React.Fragment key={category.category}>
                <TableRow className="hover:bg-gray-50">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedCategory(
                        expandedCategory === category.category ? null : category.category
                      )}
                    >
                      {expandedCategory === category.category ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{category.category}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {category.total_questions}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {category.total_responses}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="font-medium">{category.completion_rate}%</span>
                      <div className="w-12">
                        <Progress value={category.completion_rate} className="h-2" />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
                
                {expandedCategory === category.category && (
                  <TableRow>
                    <TableCell colSpan={5} className="bg-gray-50">
                      <div className="p-4 space-y-4">
                        <h4 className="font-medium">Questions in this category</h4>
                        <div className="space-y-2">
                          {category.questions.map((question) => (
                            <div key={question.id} className="flex items-center justify-between p-3 bg-white rounded border">
                              <div className="flex-1">
                                <div className="font-medium text-sm truncate max-w-md" title={question.question_text}>
                                  {question.question_text}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {question.question_type} • {question.total_responses} responses
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 text-sm">
                                <div className="text-center">
                                  <Badge variant={question.trend === 'positive' ? 'default' : question.trend === 'negative' ? 'destructive' : 'secondary'}>
                                    {question.trend}
                                  </Badge>
                                  <div className="text-xs text-gray-500 mt-1">Trend</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">{question.completion_rate}%</div>
                                  <div className="text-xs text-gray-500">Complete</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
