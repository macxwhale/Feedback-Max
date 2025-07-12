
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useOperationalAnalytics } from '@/hooks/useOperationalAnalytics';
import { 
  Users, 
  MessageSquare, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Filter,
  Download
} from 'lucide-react';

interface OperationalAnalyticsProps {
  organizationId: string;
  department?: string;
}

export const OperationalAnalytics: React.FC<OperationalAnalyticsProps> = ({
  organizationId,
  department = 'all'
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const { data: departmentMetrics, isLoading } = useOperationalAnalytics(organizationId);

  const actionItems = [
    {
      id: 1,
      title: 'Analyze low satisfaction responses',
      priority: 'high',
      department: 'all',
      assignee: 'Analytics Team',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      status: 'pending',
      impact: 'Identify improvement opportunities'
    },
    {
      id: 2,
      title: 'Review response completion rates',
      priority: 'medium',
      department: 'all',
      assignee: 'Operations Team',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      status: 'in-progress',
      impact: 'Optimize feedback collection process'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const departments = departmentMetrics ? Object.keys(departmentMetrics) : [];

  return (
    <div className="space-y-6">
      {/* Department Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Operational Analytics</h2>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={activeFilter} 
              onChange={(e) => setActiveFilter(e.target.value)}
              className="border rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Categories</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {departmentMetrics![dept].name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Department Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {departments
          .filter(dept => activeFilter === 'all' || activeFilter === dept)
          .map(dept => {
            const data = departmentMetrics![dept];
            return (
              <Card key={dept}>
                <CardHeader>
                  <CardTitle className="text-lg">{data.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Avg Response Time</p>
                      <p className="text-lg font-bold">{data.metrics.responseTime}h</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Resolution Rate</p>
                      <p className="text-lg font-bold">{data.metrics.resolutionRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Satisfaction</p>
                      <p className="text-lg font-bold">{data.metrics.satisfaction}/5</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Volume</p>
                      <p className="text-lg font-bold">{data.metrics.volume}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Key Issues</p>
                    <div className="space-y-2">
                      {data.issues.map((issue, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="truncate">{issue.title}</span>
                          <div className="flex items-center space-x-1">
                            <span>{issue.count}</span>
                            <div className={`w-2 h-2 rounded-full ${
                              issue.trend === 'up' ? 'bg-red-500' :
                              issue.trend === 'down' ? 'bg-green-500' : 'bg-yellow-500'
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Action Items Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Action Items & Follow-up</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">Active Items</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-4">
              {actionItems
                .filter(item => item.status !== 'completed')
                .map(item => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.impact}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Assignee: {item.assignee}</span>
                        <span>Due: {item.dueDate}</span>
                        <span>Scope: {item.department === 'all' ? 'All Categories' : item.department}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        item.priority === 'high' ? 'destructive' :
                        item.priority === 'medium' ? 'outline' : 'secondary'
                      }>
                        {item.priority}
                      </Badge>
                      <Badge variant={
                        item.status === 'in-progress' ? 'default' :
                        item.status === 'completed' ? 'secondary' : 'outline'
                      }>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="completed">
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No completed items yet - keep tracking your progress!</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Real-time Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span>Live Feedback Monitoring</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">Total responses tracked</span>
                <Badge variant="default">
                  {departments.reduce((sum, dept) => sum + (departmentMetrics![dept]?.metrics.volume || 0), 0)} total
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                <span className="text-sm">Categories monitored</span>
                <Badge variant="outline">{departments.length} active</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                <span className="text-sm">Data collection</span>
                <Badge variant="secondary">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Real-time
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {departments.slice(0, 3).map(dept => {
              const data = departmentMetrics![dept];
              const satisfactionPercentage = (data.metrics.satisfaction / 5) * 100;
              return (
                <div key={dept}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{data.name}</span>
                    <span>{data.metrics.satisfaction}/5 ({Math.round(satisfactionPercentage)}%)</span>
                  </div>
                  <Progress value={satisfactionPercentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
