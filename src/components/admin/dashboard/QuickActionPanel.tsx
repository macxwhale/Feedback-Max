
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Download, Settings, Users, MessageSquare, BarChart3, ArrowRight, Zap, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  category: 'primary' | 'secondary' | 'analytics';
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  priority?: 'high' | 'medium' | 'low';
  onClick: () => void;
}

interface QuickActionPanelProps {
  onTabChange: (tab: string) => void;
  stats?: any;
}

export const QuickActionPanel: React.FC<QuickActionPanelProps> = ({ onTabChange, stats }) => {
  const quickActions: QuickAction[] = [
    {
      id: 'add-members',
      category: 'primary',
      label: 'Invite Team Members',
      description: 'Add new team members to your organization',
      icon: Users,
      badge: stats?.pending_invitations ? `${stats.pending_invitations} pending` : undefined,
      priority: 'high',
      onClick: () => onTabChange('members')
    },
    {
      id: 'add-questions',
      category: 'primary',
      label: 'Create Questions',
      description: 'Design new survey questions and forms',
      icon: MessageSquare,
      priority: 'high',
      onClick: () => onTabChange('questions')
    },
    {
      id: 'view-feedback',
      category: 'analytics',
      label: 'Review Feedback',
      description: 'Analyze latest customer responses and insights',
      icon: BarChart3,
      badge: stats?.unread_responses ? `${stats.unread_responses} new` : undefined,
      priority: 'medium',
      onClick: () => onTabChange('feedback')
    },
    {
      id: 'export-data',
      category: 'secondary',
      label: 'Export Analytics',
      description: 'Download comprehensive reports and data',
      icon: Download,
      priority: 'medium',
      onClick: () => {
        console.log('Export data clicked');
      }
    },
    {
      id: 'settings',
      category: 'secondary',
      label: 'Organization Settings',
      description: 'Configure preferences and integrations',
      icon: Settings,
      priority: 'low',
      onClick: () => onTabChange('settings')
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'primary': return 'from-orange-500 to-amber-500';
      case 'analytics': return 'from-blue-500 to-indigo-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'primary': return 'bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border-orange-200';
      case 'analytics': return 'bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200';
      default: return 'bg-gradient-to-br from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 border-gray-200';
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high': return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      case 'medium': return <div className="w-2 h-2 bg-amber-500 rounded-full" />;
      default: return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  const primaryActions = quickActions.filter(action => action.category === 'primary');
  const secondaryActions = quickActions.filter(action => action.category !== 'primary');

  return (
    <div className="space-y-6">
      {/* Primary Actions Section */}
      <Card className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50/50 border-orange-100 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 mr-3">
                <Zap className="w-5 h-5 text-white" />
              </div>
              Quick Actions
            </CardTitle>
            <Badge variant="secondary" className="text-xs font-medium">
              High Priority
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {primaryActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className={cn(
                  "h-auto p-5 flex flex-col items-start space-y-3 text-left transition-all duration-200 group",
                  getCategoryBg(action.category)
                )}
                onClick={action.onClick}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "p-2.5 rounded-xl bg-gradient-to-br text-white shadow-sm",
                      getCategoryColor(action.category)
                    )}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    {getPriorityIndicator(action.priority || 'low')}
                  </div>
                  <div className="flex items-center space-x-2">
                    {action.badge && (
                      <Badge variant="secondary" className="text-xs font-semibold">
                        {action.badge}
                      </Badge>
                    )}
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-sm text-gray-900">{action.label}</div>
                  <div className="text-xs text-gray-600 leading-relaxed">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Actions Section */}
      <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
            <div className="p-2 rounded-lg bg-gradient-to-br from-gray-500 to-slate-500 mr-3">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            Additional Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {secondaryActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className={cn(
                  "h-auto p-4 flex flex-col items-start space-y-2 text-left transition-all duration-200 group",
                  getCategoryBg(action.category)
                )}
                onClick={action.onClick}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      "p-2 rounded-lg bg-gradient-to-br text-white shadow-sm",
                      getCategoryColor(action.category)
                    )}>
                      <action.icon className="w-4 h-4" />
                    </div>
                    {getPriorityIndicator(action.priority || 'low')}
                  </div>
                  {action.badge && (
                    <Badge variant="outline" className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-sm text-gray-900">{action.label}</div>
                  <div className="text-xs text-gray-600">{action.description}</div>
                </div>
                <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all self-end" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
