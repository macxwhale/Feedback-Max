
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, MoreVertical, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: {
    value: number;
    period: string;
    trend: 'up' | 'down' | 'neutral';
  };
  secondaryMetrics?: Array<{
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    target?: number;
  }>;
  icon: React.ComponentType<{ className?: string }>;
  status?: 'normal' | 'warning' | 'critical' | 'success';
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  previousValue,
  change,
  secondaryMetrics = [],
  icon: Icon,
  status = 'normal',
  actionLabel,
  onAction,
  className
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'warning': return 'border-l-amber-500 bg-gradient-to-br from-amber-50/50 to-orange-50/30';
      case 'critical': return 'border-l-red-500 bg-gradient-to-br from-red-50/50 to-pink-50/30';
      case 'success': return 'border-l-green-500 bg-gradient-to-br from-green-50/50 to-emerald-50/30';
      default: return 'border-l-orange-500 bg-gradient-to-br from-orange-50/30 to-amber-50/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return null;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-600" />;
      default: return null;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-green-700 bg-green-100 border-green-200';
      case 'down': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-300 border-l-4 hover:-translate-y-1",
      "bg-white/80 backdrop-blur-sm",
      getStatusColor(status),
      className
    )}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-start space-x-3 flex-1">
          <div className="p-2.5 rounded-xl bg-white shadow-sm ring-1 ring-black/5">
            <Icon className="w-5 h-5 text-orange-600" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700 tracking-tight">{title}</p>
              {getStatusIcon(status)}
            </div>
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-bold text-gray-900 tracking-tight">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              {previousValue && (
                <span className="text-xs text-gray-500 font-medium">
                  from {typeof previousValue === 'number' ? previousValue.toLocaleString() : previousValue}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 h-8 w-8 hover:bg-gray-100"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Primary Change Indicator */}
        {change && (
          <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border">
            <div className="flex items-center space-x-2">
              <Badge 
                variant="secondary" 
                className={cn("text-xs px-2.5 py-1 font-semibold", getTrendColor(change.trend))}
              >
                <span className="flex items-center space-x-1">
                  {getTrendIcon(change.trend)}
                  <span>
                    {change.trend === 'up' ? '+' : change.trend === 'down' ? '-' : ''}
                    {Math.abs(change.value)}%
                  </span>
                </span>
              </Badge>
              <span className="text-xs text-gray-600 font-medium">vs {change.period}</span>
            </div>
          </div>
        )}

        {/* Secondary Metrics */}
        {secondaryMetrics.length > 0 && (
          <div className="space-y-3">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            {secondaryMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">{metric.label}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-900">
                      {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                    </span>
                    {metric.trend && (
                      <div className="flex items-center">
                        {getTrendIcon(metric.trend)}
                      </div>
                    )}
                  </div>
                </div>
                {metric.target && typeof metric.value === 'number' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Target Progress</span>
                      <span className="font-medium">{Math.round((metric.value / metric.target) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(metric.value / metric.target) * 100} 
                      className="h-1.5"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        {actionLabel && onAction && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAction}
              className="w-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700"
            >
              <span className="flex items-center space-x-1">
                <span>{actionLabel}</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
