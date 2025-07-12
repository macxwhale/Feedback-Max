
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign';
import { ResponsiveGrid } from '@/components/ui/responsive-layout';

export interface StatCard {
  id: string;
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  explanation?: string;
}

interface EnhancedStatsGridProps {
  stats: StatCard[];
  isLoading?: boolean;
  className?: string;
}

const StatCardComponent = memo<{ stat: StatCard; isLoading: boolean }>(({ stat, isLoading }) => {
  const Icon = stat.icon;
  const { isMobile } = useResponsiveDesign();
  
  // Exclude unwanted cards
  const excludedCards = [
    'quality-score', 
    'team-performance', 
    'system-health', 
    'bounce-rate', 
    'operational-efficiency',
    'performance-tracking',
    'enhanced-dashboard'
  ];
  
  if (excludedCards.includes(stat.id)) {
    return null;
  }
  
  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </CardTitle>
          {Icon && (
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {stat.title}
        </CardTitle>
        {Icon && (
          <Icon className="h-5 w-5 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
          {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
        </div>
        
        {stat.change && (
          <div className="flex items-center space-x-1 mb-3">
            {getTrendIcon(stat.change.trend)}
            <span className={`text-sm font-medium ${getTrendColor(stat.change.trend)}`}>
              {stat.change.value > 0 ? '+' : ''}{stat.change.value}%
            </span>
            <span className="text-sm text-muted-foreground">
              vs {stat.change.period}
            </span>
          </div>
        )}
        
        {stat.explanation && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {stat.explanation}
          </p>
        )}
        
        {stat.description && !stat.explanation && (
          <p className="text-sm text-muted-foreground">
            {stat.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
});

StatCardComponent.displayName = 'StatCardComponent';

export const EnhancedStatsGrid = memo<EnhancedStatsGridProps>(({ 
  stats, 
  isLoading = false, 
  className = '' 
}) => {
  const { isMobile, isTablet } = useResponsiveDesign();
  
  // Filter out excluded cards
  const filteredStats = stats.filter(stat => {
    const excludedCards = [
      'quality-score', 
      'team-performance', 
      'system-health', 
      'bounce-rate', 
      'operational-efficiency',
      'performance-tracking',
      'enhanced-dashboard'
    ];
    return !excludedCards.includes(stat.id);
  });

  if (filteredStats.length === 0) {
    return null;
  }

  return (
    <ResponsiveGrid
      columns={{ 
        xs: 1, 
        sm: 1, 
        md: 2, 
        lg: Math.min(3, filteredStats.length), 
        xl: Math.min(4, filteredStats.length) 
      }}
      gap="lg"
      className={`w-full ${className}`}
    >
      {filteredStats.map((stat) => (
        <StatCardComponent
          key={stat.id}
          stat={stat}
          isLoading={isLoading}
        />
      ))}
    </ResponsiveGrid>
  );
});

EnhancedStatsGrid.displayName = 'EnhancedStatsGrid';
