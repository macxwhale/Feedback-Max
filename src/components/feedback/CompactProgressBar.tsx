
import React from 'react';
import { CheckCircle, Clock, Star, Target, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CompactProgressBarProps {
  currentIndex: number;
  totalQuestions: number;
  completedQuestions: number[];
  estimatedTimeRemaining: number;
  averageResponseTime: number;
}

export const CompactProgressBar: React.FC<CompactProgressBarProps> = ({
  currentIndex,
  totalQuestions,
  completedQuestions,
  estimatedTimeRemaining,
  averageResponseTime,
}) => {
  const efficiency = averageResponseTime < 30 ? 'fast' : averageResponseTime < 60 ? 'steady' : 'thoughtful';
  
  const getEfficiencyColor = () => {
    switch (efficiency) {
      case 'fast': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'steady': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const getEfficiencyIcon = () => {
    switch (efficiency) {
      case 'fast': return <TrendingUp className="h-3 w-3" />;
      case 'steady': return <Target className="h-3 w-3" />;
      default: return <Star className="h-3 w-3" />;
    }
  };

  return (
    <div className="flex items-center justify-between mb-6 text-sm text-gray-600">
      <div className="flex items-center space-x-2">
        <span className="font-medium">
          {currentIndex + 1} of {totalQuestions}
        </span>
        {completedQuestions.includes(currentIndex) && (
          <CheckCircle className="h-4 w-4 text-green-500" />
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-blue-500" />
          <span>~{estimatedTimeRemaining}s left</span>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-orange-500" />
          <span>{averageResponseTime}s avg</span>
        </div>
        <Badge className={`${getEfficiencyColor()} shadow-sm border`}>
          <div className="flex items-center space-x-1">
            {getEfficiencyIcon()}
            <span className="font-medium">{efficiency}</span>
          </div>
        </Badge>
      </div>
    </div>
  );
};
