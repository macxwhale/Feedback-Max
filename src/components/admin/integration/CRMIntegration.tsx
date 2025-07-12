
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Database, 
  Users, 
  Zap, 
  CheckCircle,
  AlertCircle,
  Settings,
  RefreshCw,
  BarChart3
} from 'lucide-react';

interface CRMIntegrationProps {
  organizationId: string;
}

export const CRMIntegration: React.FC<CRMIntegrationProps> = ({
  organizationId
}) => {
  const [integrations, setIntegrations] = useState({
    salesforce: { enabled: true, status: 'connected', lastSync: '2 minutes ago' },
    hubspot: { enabled: false, status: 'disconnected', lastSync: 'Never' },
    pipedrive: { enabled: true, status: 'connected', lastSync: '5 minutes ago' },
    zendesk: { enabled: true, status: 'connected', lastSync: '1 minute ago' }
  });

  const [automations, setAutomations] = useState({
    autoFollowUp: true,
    customerHealthScore: true,
    ticketCreation: true,
    leadScoring: false,
    churnPrediction: true
  });

  const customerProfiles = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      company: 'Tech Corp',
      lastFeedback: '4.5/5',
      healthScore: 85,
      totalInteractions: 12,
      riskLevel: 'low',
      nextAction: 'Follow-up call scheduled'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      company: 'Business Ltd',
      lastFeedback: '2.5/5',
      healthScore: 45,
      totalInteractions: 8,
      riskLevel: 'high',
      nextAction: 'Immediate intervention required'
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike.chen@startup.io',
      company: 'Startup Inc',
      lastFeedback: '4.8/5',
      healthScore: 92,
      totalInteractions: 6,
      riskLevel: 'low',
      nextAction: 'Upsell opportunity identified'
    }
  ];

  const toggleIntegration = (platform: string) => {
    setIntegrations(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform as keyof typeof prev],
        enabled: !prev[platform as keyof typeof prev].enabled
      }
    }));
  };

  const toggleAutomation = (automation: string) => {
    setAutomations(prev => ({
      ...prev,
      [automation]: !prev[automation as keyof typeof prev]
    }));
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">CRM Integration</h2>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync All
        </Button>
      </div>

      {/* Integration Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(integrations).map(([platform, config]) => (
          <Card key={platform}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium capitalize">{platform}</h4>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={() => toggleIntegration(platform)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {config.status === 'connected' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">{config.status}</span>
                </div>
                <p className="text-xs text-gray-500">Last sync: {config.lastSync}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Automation Rules</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(automations).map(([automation, enabled]) => (
              <div key={automation} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor={automation} className="font-medium">
                    {automation.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {automation === 'autoFollowUp' && 'Automatically follow up on negative feedback'}
                    {automation === 'customerHealthScore' && 'Calculate customer health scores'}
                    {automation === 'ticketCreation' && 'Create support tickets for issues'}
                    {automation === 'leadScoring' && 'Score leads based on feedback'}
                    {automation === 'churnPrediction' && 'Predict customer churn risk'}
                  </p>
                </div>
                <Switch
                  id={automation}
                  checked={enabled}
                  onCheckedChange={() => toggleAutomation(automation)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Profiles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Customer Health Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customerProfiles.map(customer => (
              <div key={customer.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-medium">{customer.name}</h4>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                        <p className="text-sm text-gray-500">{customer.company}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Last Feedback</p>
                        <p className="font-bold text-lg">{customer.lastFeedback}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Health Score</p>
                        <div className={`px-2 py-1 rounded-full text-sm font-bold ${getHealthScoreColor(customer.healthScore)}`}>
                          {customer.healthScore}%
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Interactions</p>
                        <p className="font-bold text-lg">{customer.totalInteractions}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-3">
                      <Badge className={getRiskLevelColor(customer.riskLevel)}>
                        {customer.riskLevel} risk
                      </Badge>
                      <span className="text-sm text-gray-600">{customer.nextAction}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Integration Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">234</p>
              <p className="text-sm text-gray-600">Profiles Synced</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">89%</p>
              <p className="text-sm text-gray-600">Sync Success Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">12</p>
              <p className="text-sm text-gray-600">Automated Actions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
