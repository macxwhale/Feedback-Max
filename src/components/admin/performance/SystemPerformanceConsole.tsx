/**
 * System Performance Console
 * Comprehensive performance management interface for administrators
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Cpu, 
  Database, 
  Download, 
  RefreshCw, 
  Settings,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Zap
} from 'lucide-react';
import { performanceMonitor } from '@/infrastructure/performance/PerformanceMonitor';
import { performanceReporter } from '@/infrastructure/performance/PerformanceReporter';
import { formatMetric, calculatePerformanceScore, PERFORMANCE_THRESHOLDS } from '@/utils/performanceUtils';
import { useInvitationPerformanceStats } from '@/hooks/useInvitationCache';
import type { PerformanceReport } from '@/infrastructure/performance/PerformanceReporter';

export const SystemPerformanceConsole: React.FC = () => {
  const [performanceData, setPerformanceData] = useState(performanceMonitor.getPerformanceSummary());
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { data: invitationStats, refetch: refetchStats } = useInvitationPerformanceStats();

  // Real-time performance updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceData(performanceMonitor.getPerformanceSummary());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const generateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const newReport = performanceMonitor.generateReport();
      setReport(newReport);
    } catch (error) {
      console.error('Failed to generate performance report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const exportReport = () => {
    if (!report) return;
    
    const dataStr = performanceReporter.exportReport(report);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-report-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (value: number, threshold: number) => {
    if (value < threshold * 0.5) return 'text-green-600';
    if (value < threshold) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (value: number, threshold: number) => {
    if (value < threshold * 0.5) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (value < threshold) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>;
  };

  const performanceScore = report ? performanceReporter.calculateScore(report) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Performance Console</h1>
          <p className="text-muted-foreground">
            Comprehensive performance monitoring and optimization tools
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
            onClick={generateReport}
            disabled={isGeneratingReport}
          >
            <Activity className="h-4 w-4 mr-2" />
            {isGeneratingReport ? 'Generating...' : 'Generate Report'}
          </Button>
          {report && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportReport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          )}
        </div>
      </div>

      {/* Performance Score */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold">
                {performanceScore}
                <span className="text-xl text-muted-foreground">/100</span>
              </div>
              <Progress value={performanceScore} className="flex-1" />
              <div>
                {performanceScore >= 90 && <Badge className="bg-green-100 text-green-800">Excellent</Badge>}
                {performanceScore >= 70 && performanceScore < 90 && <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>}
                {performanceScore < 70 && <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>}
              </div>
            </div>
            {report.alerts.length > 0 && (
              <div className="mt-4 space-y-2">
                {report.alerts.slice(0, 3).map((alert, index) => (
                  <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{alert.message}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">First Paint</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMetric(performanceData.summary['first-paint'] || 0, 'ms')}
                </div>
                {getStatusBadge(performanceData.summary['first-paint'] || 0, PERFORMANCE_THRESHOLDS.FIRST_PAINT)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Load Time</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMetric(performanceData.summary['total-load'] || 0, 'ms')}
                </div>
                {getStatusBadge(performanceData.summary['total-load'] || 0, PERFORMANCE_THRESHOLDS.TOTAL_LOAD)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Long Tasks</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMetric(performanceData.summary['long-task'] || 0, 'ms')}
                </div>
                {getStatusBadge(performanceData.summary['long-task'] || 0, PERFORMANCE_THRESHOLDS.LONG_TASK)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Components</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceData.components.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tracked components
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Component Performance</CardTitle>
              <CardDescription>
                Render times and optimization opportunities for React components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.components.map((component) => (
                  <div key={component.componentName} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{component.componentName}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant={component.renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME ? 'destructive' : 'secondary'}>
                          {formatMetric(component.renderTime, 'ms')}
                        </Badge>
                        <Badge variant="outline">
                          {component.renderCount} renders
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={Math.min((component.renderTime / 32) * 100, 100)} 
                      className="h-2"
                    />
                    {component.renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME && (
                      <p className="text-xs text-orange-600">
                        Consider optimization - render time exceeds 16ms threshold
                      </p>
                    )}
                  </div>
                ))}
                
                {performanceData.components.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Cpu className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No component performance data available yet.</p>
                    <p className="text-sm">Component tracking will appear as the application is used.</p>
                  </div>
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
                  {invitationStats?.cacheHitRate?.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Cache efficiency
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {invitationStats?.totalInvitations || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Invitations processed
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                System Performance Settings
              </CardTitle>
              <CardDescription>
                Configure performance monitoring and optimization settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Button
                  onClick={() => performanceMonitor.clearMetrics()}
                  variant="outline"
                >
                  Clear Performance Data
                </Button>
                <Button
                  onClick={() => {
                    // Force garbage collection if available
                    if (window.gc) {
                      window.gc();
                    }
                  }}
                  variant="outline"
                >
                  Force Memory Cleanup
                </Button>
              </div>
              
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Performance monitoring is active and collecting data in real-time.
                  Data is automatically cleaned up to prevent memory issues.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {report ? (
            <div className="space-y-4">
              {/* Report Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Report Summary</CardTitle>
                  <CardDescription>
                    Generated on {new Date(report.timestamp).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-2">Alerts ({report.alerts.length})</h4>
                      <div className="space-y-1">
                        {report.alerts.slice(0, 5).map((alert, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Badge variant={
                              alert.severity === 'critical' ? 'destructive' :
                              alert.severity === 'high' ? 'destructive' :
                              alert.severity === 'medium' ? 'secondary' : 'outline'
                            }>
                              {alert.severity}
                            </Badge>
                            <span className="text-sm">{alert.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Recommendations</h4>
                      <ul className="text-sm space-y-1">
                        {report.recommendations.slice(0, 5).map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-600" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">
                  No performance report generated yet.
                </p>
                <Button onClick={generateReport} disabled={isGeneratingReport}>
                  <Activity className="h-4 w-4 mr-2" />
                  Generate Performance Report
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
