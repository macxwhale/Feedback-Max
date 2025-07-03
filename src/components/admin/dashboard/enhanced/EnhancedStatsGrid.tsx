/**
 * Enhanced Stats Grid Component
 * Optimized statistics display with proper memoization
 */

import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

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
}

interface EnhancedStatsGridProps {
  stats: StatCard[];
  isLoading?: boolean;
  className?: string;
}

const StatCardComponent = memo<{ stat: StatCard; isLoading: boolean }>(({ stat, isLoading }) => {
  const Icon = stat.icon;
  
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </CardTitle>
          {Icon && (
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          )}
        </CardHeader>
        <CardContent>
          <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {stat.title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">
          {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
        </div>
        
        {stat.change && (
          <div className="flex items-center space-x-1 mt-2">
            {getTrendIcon(stat.change.trend)}
            <span className={`text-xs font-medium ${getTrendColor(stat.change.trend)}`}>
              {stat.change.value > 0 ? '+' : ''}{stat.change.value}%
            </span>
            <span className="text-xs text-muted-foreground">
              vs {stat.change.period}
            </span>
          </div>
        )}
        
        {stat.description && (
          <p className="text-xs text-muted-foreground mt-1">
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
  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {stats.map((stat) => (
        <StatCardComponent
          key={stat.id}
          stat={stat}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
});

EnhancedStatsGrid.displayName = 'EnhancedStatsGrid';