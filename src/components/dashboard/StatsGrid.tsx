
import React from 'react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { H3, Body, Caption } from '@/components/ui/typography';
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  Activity,
  Star
} from 'lucide-react';

interface Stat {
  id: string;
  title: string;
  value: number | string;
  previousValue?: number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  format?: 'number' | 'percentage' | 'currency' | 'rating';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

interface StatsGridProps {
  stats: Stat[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  isLoading = false,
  columns = 4,
  className
}) => {
  const { isMobile, isTablet } = useResponsiveDesign();

  const getGridCols = () => {
    if (isMobile) return 'grid-cols-2';
    if (isTablet) return 'grid-cols-3';
    return `grid-cols-${columns}`;
  };

  const formatValue = (value: number | string, format?: string) => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD' 
        }).format(value);
      case 'rating':
        return `${value}/5`;
      default:
        return new Intl.NumberFormat().format(value);
    }
  };

  const getColorClasses = (color?: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      green: 'text-green-600 bg-green-50 border-green-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200',
      orange: 'text-orange-600 bg-orange-50 border-orange-200',
      red: 'text-red-600 bg-red-50 border-red-200',
    };
    return colors[color as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className={cn('grid gap-4', getGridCols(), className)}>
        <SkeletonLoader type="stats" count={1} />
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4', getGridCols(), className)}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === 'up' ? TrendingUp : 
                         stat.trend === 'down' ? TrendingDown : null;
        
        return (
          <EnhancedCard
            key={stat.id}
            className="p-4 hover:shadow-md transition-all duration-200"
            interactive
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Caption className="font-medium text-gray-600 mb-1">
                  {stat.title}
                </Caption>
                <H3 className="text-2xl font-bold mb-2">
                  {formatValue(stat.value, stat.format)}
                </H3>
                {stat.trendValue && TrendIcon && (
                  <div className={cn(
                    'flex items-center gap-1 text-sm',
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  )}>
                    <TrendIcon className="w-3 h-3" />
                    <span>{Math.abs(stat.trendValue)}%</span>
                    <Caption>vs last period</Caption>
                  </div>
                )}
              </div>
              <div className={cn(
                'p-2 rounded-lg',
                getColorClasses(stat.color)
              )}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </EnhancedCard>
        );
      })}
    </div>
  );
};
