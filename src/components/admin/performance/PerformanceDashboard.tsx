
/**
 * Performance Dashboard Component
 * Real-time monitoring and optimization insights
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Clock, 
  Database, 
  TrendingUp, 
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';
import { performanceMonitor } from '@/infrastructure/performance/PerformanceMonitor';
import { useInvitationPerformanceStats, useClearInvitationCache } from '@/hooks/useOptimizedUserInvitation';

export const PerformanceDashboard: React.FC = () => {
  const [performanceData, setPerformanceData] = useState(performanceMonitor.getPerformanceSummary());
  const { data: invitationStats, refetch: refetchStats } = useInvitationPerformanceStats();
  const clearCacheMutation = useClearInvitationCache();

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceData(performanceMonitor.getPerformanceSummary());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getPerformanceStatus = (value: number, threshold: number) => {
    if (value < threshold * 0.5) return { status: 'excellent', color: 'bg-green-500' };
    if (value < threshold) return { status: 'good', color: 'bg-yellow-500' };
    return { status: 'needs-attention', color: 'bg-red-500' };
  };

  const renderMetricCard = (
    title: string,
    value: number,
    unit: string,
    threshold: number,
    icon: React.ReactNode
  ) => {
    const { status, color } = getPerformanceStatus(value, threshold);
    
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {value.toFixed(1)} {unit}
          </div>
          <div className="flex items-center mt-2">
            <div className={`w-2 h-2 rounded-full ${color} mr-2`} />
            <span className="text-xs text-muted-foreground capitalize">
              {status.replace('-', ' ')}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time performance monitoring and optimization insights
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPerformanceData(performanceMonitor.getPerformanceSummary());
              refetchStats();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => clearCacheMutation.mutate()}
            disabled={clearCacheMutation.isPending}
          >
            <Database className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {renderMetricCard(
              "First Paint",
              performanceData.summary['first-paint'] || 0,
              "ms",
              100,
              <Zap className="h-4 w-4 text-muted-foreground" />
            )}
            {renderMetricCard(
              "Long Tasks",
              performanceData.summary['long-task'] || 0,
              "ms",
              50,
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            )}
            {renderMetricCard(
              "Total Load",
              performanceData.summary['total-load'] || 0,
              "ms",
              1000,
              <Clock className="h-4 w-4 text-muted-foreground" />
            )}
            {renderMetricCard(
              "Components",
              performanceData.components.length,
              "tracked",
              50,
              <Activity className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Alerts</CardTitle>
              <CardDescription>
                Issues that need attention to maintain optimal performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {performanceData.components
                .filter(component => component.renderTime > 16)
                .map((component) => (
                  <Alert key={component.componentName}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{component.componentName}</strong> is rendering slowly 
                      ({component.renderTime.toFixed(1)}ms). Consider optimization.
                    </AlertDescription>
                  </Alert>
                ))}
              
              {performanceData.summary['long-task'] > 50 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Long tasks detected ({performanceData.summary['long-task'].toFixed(1)}ms). 
                    This may cause UI blocking.
                  </AlertDescription>
                </Alert>
              )}
              
              {performanceData.components.length === 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    No performance issues detected. System is running optimally.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Component Performance</CardTitle>
              <CardDescription>
                Render times and re-render frequency for tracked components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.components.map((component) => (
                  <div key={component.componentName} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{component.componentName}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant={component.renderTime > 16 ? 'destructive' : 'secondary'}>
                          {component.renderTime.toFixed(1)}ms
                        </Badge>
                        <Badge variant="outline">
                          {component.rerenderCount} renders
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={Math.min((component.renderTime / 32) * 100, 100)} 
                      className="h-2"
                    />
                  </div>
                ))}
                
                {performanceData.components.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No component performance data available yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Size</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {invitationStats?.cacheSize || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cached entries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {invitationStats?.cacheHitRate.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Cache efficiency
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invitations</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {invitationStats?.totalInvitations || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Processed this session
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
              <CardDescription>
                Raw performance data collected from the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {performanceData.metrics.map((metric, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 rounded border"
                  >
                    <div>
                      <span className="font-medium">{metric.name}</span>
                      {metric.context && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {JSON.stringify(metric.context)}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-mono">
                        {metric.value.toFixed(1)} {metric.unit}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(metric.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {performanceData.metrics.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No performance metrics available yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
