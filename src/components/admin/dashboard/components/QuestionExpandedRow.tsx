
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import type { QuestionAnalytics } from '@/types/analytics';

interface QuestionExpandedRowProps {
  question: QuestionAnalytics;
}

export const QuestionExpandedRow: React.FC<QuestionExpandedRowProps> = ({ question }) => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="bg-gray-50">
        <div className="p-4 space-y-4">
          <div>
            <h4 className="font-medium mb-2">Response Distribution</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(question.response_distribution).map(([value, count]) => (
                <div key={value} className="p-2 bg-white rounded border">
                  <div className="text-sm font-medium">{value}</div>
                  <div className="text-xs text-gray-600">{count} responses</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Insights</h4>
            <ul className="text-sm space-y-1">
              {question.insights.map((insight, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};
