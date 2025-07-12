
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, MoreHorizontal, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryMetric {
  label: string;
  value: string | number;
  target?: number;
  status: 'good' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  description?: string;
  change?: {
    value: number;
    period: string;
  };
}

interface DataSummaryBarProps {
  metrics: SummaryMetric[];
  title?: string;
  lastUpdated?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const DataSummaryBar: React.FC<DataSummaryBarProps> = ({ 
  metrics, 
  title = "System Overview",
  lastUpdated,
  onRefresh,
  isRefreshing = false
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-800 bg-green-50/80 border-green-200 ring-green-100/50';
      case 'warning': return 'text-amber-800 bg-amber-50/80 border-amber-200 ring-amber-100/50';
      case 'critical': return 'text-red-800 bg-red-50/80 border-red-200 ring-red-100/50';
      default: return 'text-gray-800 bg-gray-50/80 border-gray-200 ring-gray-100/50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-600" />;
      default: return null;
    }
  };

  const getOverallStatus = () => {
    const criticalCount = metrics.filter(m => m.status === 'critical').length;
    const warningCount = metrics.filter(m => m.status === 'warning').length;
    
    if (criticalCount > 0) return 'critical';
    if (warningCount > 0) return 'warning';
    return 'good';
  };

  const overallStatus = getOverallStatus();
  const overallScore = Math.round((metrics.filter(m => m.status === 'good').length / metrics.length) * 100);

  return (
    <Card variant="glass" className="border-0 shadow-xl ring-1 ring-black/5">
      <CardContent className="p-8">
        {/* Enhanced Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-4">
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h3>
                  <div className={cn(
                    "flex items-center space-x-3 px-4 py-2 rounded-full text-sm font-bold ring-2 shadow-sm",
                    getStatusColor(overallStatus)
                  )}>
                    {getStatusIcon(overallStatus)}
                    <span className="capitalize">{overallStatus}</span>
                    <span className="text-xs opacity-80">• {overallScore}%</span>
                  </div>
                </div>
                {lastUpdated && (
                  <p className="text-sm text-gray-600 mt-2 flex items-center space-x-2">
                    <span>{lastUpdated}</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="default" className="h-10 w-10 p-0 hover:bg-gray-100">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Enhanced Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <div 
              key={index} 
              className={cn(
                "relative p-6 rounded-2xl border-2 ring-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-pointer",
                getStatusColor(metric.status)
              )}
            >
              {/* Metric Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-semibold text-gray-700">{metric.label}</span>
                    {metric.trend && getTrendIcon(metric.trend)}
                  </div>
                  {metric.description && (
                    <p className="text-xs text-gray-600 leading-relaxed">{metric.description}</p>
                  )}
                </div>
                {getStatusIcon(metric.status)}
              </div>
              
              {/* Main Value with Enhanced Typography */}
              <div className="flex items-baseline space-x-3 mb-3">
                <span className="text-3xl font-bold text-gray-900 tracking-tight">
                  {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                </span>
                {metric.change && (
                  <span className={cn(
                    "text-sm font-semibold px-2 py-1 rounded-full flex items-center space-x-1",
                    metric.change.value >= 0 
                      ? "text-green-700 bg-green-100/80" 
                      : "text-red-700 bg-red-100/80"
                  )}>
                    {getTrendIcon(metric.change.value >= 0 ? 'up' : 'down')}
                    <span>
                      {metric.change.value > 0 ? '+' : ''}{metric.change.value}%
                    </span>
                  </span>
                )}
              </div>
              
              {metric.change && (
                <p className="text-xs text-gray-600 mb-3 font-medium">
                  vs {metric.change.period}
                </p>
              )}
              
              {/* Progress Bar for Target Metrics */}
              {metric.target && typeof metric.value === 'number' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">Progress to Target</span>
                    <span className="font-bold text-gray-900">
                      {Math.round((metric.value / metric.target) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((metric.value / metric.target) * 100, 100)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Current: {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}</span>
                    <span>Target: {metric.target.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Enhanced Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Enhanced Summary Footer */}
        <div className="mt-10 pt-8 border-t border-gray-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
                <span className="text-gray-700 font-semibold">
                  {metrics.filter(m => m.status === 'good').length} Excellent
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-amber-500 rounded-full shadow-sm"></div>
                <span className="text-gray-700 font-semibold">
                  {metrics.filter(m => m.status === 'warning').length} Needs Attention
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
                <span className="text-gray-700 font-semibold">
                  {metrics.filter(m => m.status === 'critical').length} Critical
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
              <span className="font-semibold">Live monitoring active</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
