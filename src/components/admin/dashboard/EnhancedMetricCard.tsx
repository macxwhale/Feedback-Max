import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContextualActionMenu, createMetricActions } from './ContextualActionMenu';

interface SecondaryMetric {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  target?: number;
  change?: {
    value: number;
    period: string;
  };
  status?: 'good' | 'warning' | 'critical';
}

interface EnhancedMetricCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: {
    value: number;
    period: string;
    trend: 'up' | 'down' | 'neutral';
  };
  secondaryMetrics?: SecondaryMetric[];
  icon: React.ComponentType<{ className?: string }>;
  status?: 'normal' | 'warning' | 'critical' | 'success';
  actionLabel?: string;
  onAction?: () => void;
  onDrillDown?: () => void;
  contextualActions?: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  }>;
  insights?: string[];
  className?: string;
}

export const EnhancedMetricCard: React.FC<EnhancedMetricCardProps> = ({
  title,
  value,
  previousValue,
  change,
  secondaryMetrics = [],
  icon: Icon,
  status = 'normal',
  actionLabel,
  onAction,
  onDrillDown,
  contextualActions = [],
  insights = [],
  className
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'warning': return 'border-l-amber-500 bg-gradient-to-br from-amber-50/80 to-orange-50/50';
      case 'critical': return 'border-l-red-500 bg-gradient-to-br from-red-50/80 to-pink-50/50';
      case 'success': return 'border-l-green-500 bg-gradient-to-br from-green-50/80 to-emerald-50/50';
      default: return 'border-l-orange-500 bg-gradient-to-br from-orange-50/50 to-amber-50/30';
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
      case 'up': return <ArrowUpRight className="w-3 h-3 text-green-600" />;
      case 'down': return <ArrowDownRight className="w-3 h-3 text-red-600" />;
      default: return <Minus className="w-3 h-3 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-green-700 bg-green-100 border-green-200';
      case 'down': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getMetricStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'text-green-700';
      case 'warning': return 'text-amber-700';
      case 'critical': return 'text-red-700';
      default: return 'text-gray-700';
    }
  };

  // Enhanced contextual actions
  const metricActions = createMetricActions(
    () => onDrillDown?.(),
    () => console.log('Export metric data'),
    () => console.log('Share metric')
  );

  return (
    <Card 
      variant="elevated"
      className={cn(
        "group hover:shadow-2xl transition-all duration-300 border-l-4 hover:-translate-y-2",
        "bg-gradient-to-br from-white via-orange-50/30 to-amber-50/20 backdrop-blur-sm",
        getStatusColor(status),
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
        <div className="flex items-start space-x-4 flex-1">
          <div className="p-4 rounded-2xl bg-white shadow-lg ring-2 ring-black/5">
            <Icon className="w-6 h-6 text-orange-600" />
          </div>
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-700 tracking-tight">{title}</p>
              <div className="flex items-center space-x-2">
                {getStatusIcon(status)}
                {onDrillDown && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDrillDown}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 h-8 w-8 hover:bg-orange-50"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Enhanced Primary Value Display */}
            <div className="flex items-baseline space-x-4">
              <span className="text-4xl font-bold text-gray-900 tracking-tight">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              {previousValue && (
                <span className="text-sm text-gray-500 font-medium">
                  from {typeof previousValue === 'number' ? previousValue.toLocaleString() : previousValue}
                </span>
              )}
            </div>

            {/* Enhanced Change Indicator */}
            {change && (
              <div className="flex items-center space-x-3">
                <Badge 
                  variant="secondary" 
                  className={cn("text-sm px-3 py-1 font-bold border-2 shadow-sm", getTrendColor(change.trend))}
                >
                  <span className="flex items-center space-x-2">
                    {getTrendIcon(change.trend)}
                    <span>
                      {change.trend === 'up' ? '+' : change.trend === 'down' ? '-' : ''}
                      {Math.abs(change.value)}%
                    </span>
                  </span>
                </Badge>
                <span className="text-sm text-gray-600 font-medium">vs {change.period}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Enhanced Contextual Actions Menu */}
        <div className="flex items-center space-x-2">
          <ContextualActionMenu 
            actions={metricActions}
            title={`${title} Actions`}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-6">
        {/* Enhanced Secondary Metrics Grid */}
        {secondaryMetrics.length > 0 && (
          <div className="grid grid-cols-2 gap-6">
            {secondaryMetrics.map((metric, index) => (
              <div key={index} className="space-y-3 p-4 bg-white/70 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group/metric">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-600">{metric.label}</span>
                  <div className="flex items-center space-x-2">
                    {metric.trend && (
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(metric.trend)}
                        {metric.change && (
                          <span className={cn("text-sm font-bold", getMetricStatusColor(metric.status || 'good'))}>
                            {metric.change.value > 0 ? '+' : ''}{metric.change.value}%
                          </span>
                        )}
                      </div>
                    )}
                    {/* Mini contextual menu for secondary metrics */}
                    <ContextualActionMenu 
                      actions={[
                        {
                          id: 'view-metric',
                          label: 'View Details',
                          icon: ExternalLink,
                          onClick: () => console.log(`View ${metric.label} details`)
                        }
                      ]}
                      title={`${metric.label} Actions`}
                      className="opacity-0 group-hover/metric:opacity-100 transition-opacity"
                      buttonSize="sm"
                    />
                  </div>
                </div>
                
                <div className="flex items-baseline space-x-3">
                  <span className={cn("text-xl font-bold", getMetricStatusColor(metric.status || 'good'))}>
                    {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                  </span>
                </div>
                
                {metric.target && typeof metric.value === 'number' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 font-medium">Target</span>
                      <span className="font-bold text-gray-900">
                        {Math.round((metric.value / metric.target) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(metric.value / metric.target) * 100} 
                      className="h-2 bg-gray-100"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Insights Section */}
        {insights.length > 0 && (
          <div className="space-y-3">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Key Insights</h4>
              {insights.map((insight, index) => (
                <p key={index} className="text-sm text-gray-600 leading-relaxed pl-4 border-l-2 border-orange-200">
                  {insight}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Action Buttons */}
        {(actionLabel || contextualActions.length > 0) && (
          <div className="pt-4 space-y-3">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            <div className="flex items-center space-x-3">
              {actionLabel && onAction && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAction}
                  className="flex-1 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 shadow-sm"
                >
                  {actionLabel}
                </Button>
              )}
              {contextualActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={action.onClick}
                  className="text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                >
                  {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
