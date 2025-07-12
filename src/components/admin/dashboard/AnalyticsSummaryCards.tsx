
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  MessageSquare, 
  CheckCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface SummaryData {
  total_questions: number;
  total_responses: number;
  overall_completion_rate: number;
}

interface AnalyticsSummaryCardsProps {
  summary: SummaryData;
}

export const AnalyticsSummaryCards: React.FC<AnalyticsSummaryCardsProps> = ({ summary }) => {
  const cards = [
    {
      title: 'Total Questions',
      value: summary.total_questions,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: null
    },
    {
      title: 'Total Responses',
      value: summary.total_responses,
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+12%'
    },
    {
      title: 'Completion Rate',
      value: `${summary.overall_completion_rate}%`,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: summary.overall_completion_rate >= 80 ? '+8%' : '-2%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold">{card.value}</span>
                  {card.trend && (
                    <Badge 
                      variant={card.trend.startsWith('+') ? 'default' : 'destructive'} 
                      className="text-xs"
                    >
                      {card.trend.startsWith('+') ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {card.trend}
                    </Badge>
                  )}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
