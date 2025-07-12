
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useExecutiveAnalytics } from '@/hooks/useExecutiveAnalytics';

interface RefactoredExecutiveDashboardProps {
  organizationId: string;
}

export const RefactoredExecutiveDashboard: React.FC<RefactoredExecutiveDashboardProps> = ({
  organizationId
}) => {
  const { data: kpis, isLoading, error } = useExecutiveAnalytics(organizationId);

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Executive Dashboard</h3>
        <p className="text-gray-600">Unable to load executive analytics data. Please try again.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Filter out cost per feedback metric
  const filteredKpis = kpis?.filter(kpi => kpi.title !== 'Cost per Feedback') || [];

  return (
    <div className="space-y-6">
      {/* Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredKpis.map((kpi, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {kpi.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {kpi.prefix}{kpi.value}{kpi.suffix}
                  </div>
                  <div className="text-sm text-gray-500">
                    Target: {kpi.prefix}{kpi.target}{kpi.suffix}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <Badge 
                    variant={kpi.isPositive ? "default" : "secondary"}
                    className="mb-2"
                  >
                    {kpi.isPositive ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {kpi.trend}
                  </Badge>
                  {kpi.title === 'Customer Satisfaction' && <Target className="w-5 h-5 text-blue-600" />}
                  {kpi.title === 'Response Rate' && <Users className="w-5 h-5 text-green-600" />}
                  {kpi.title === 'Issue Resolution Time' && <CheckCircle className="w-5 h-5 text-orange-600" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Critical Insights & Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Insights & Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Performance Above Target</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Customer satisfaction is consistently above 4.0/5 target
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Positive Trend</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Response rates have improved by 12% this month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data-Driven Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Data-Driven Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border-l-4 border-l-blue-500 bg-blue-50">
              <h4 className="font-medium">Optimize Response Collection</h4>
              <p className="text-sm text-gray-600">
                Consider implementing automated follow-ups to maintain high response rates
              </p>
            </div>
            <div className="p-3 border-l-4 border-l-green-500 bg-green-50">
              <h4 className="font-medium">Leverage High Satisfaction Areas</h4>
              <p className="text-sm text-gray-600">
                Replicate successful practices from high-performing categories
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
