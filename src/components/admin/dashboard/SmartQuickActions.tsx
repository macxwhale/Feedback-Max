
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Users, 
  MessageSquare, 
  Settings, 
  Download,
  Search,
  Zap,
  TrendingUp,
  Target,
  Bell,
  FileText,
  BarChart3,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  badge?: string;
  category: 'primary' | 'secondary' | 'suggestion';
  shortcut?: string;
  estimatedTime?: string;
}

interface SmartQuickActionsProps {
  onTabChange: (tab: string) => void;
  stats?: {
    pending_invitations: number;
    unread_responses: number;
    active_sessions: number;
    completion_rate: number;
  };
  className?: string;
}

export const SmartQuickActions: React.FC<SmartQuickActionsProps> = ({
  onTabChange,
  stats = { pending_invitations: 0, unread_responses: 0, active_sessions: 0, completion_rate: 0 },
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const quickActions: QuickAction[] = [
    // Primary Actions
    {
      id: 'invite-members',
      title: 'Invite Team Members',
      description: 'Add new people to your organization',
      icon: Users,
      onClick: () => onTabChange('members'),
      badge: stats.pending_invitations > 0 ? `${stats.pending_invitations} pending` : undefined,
      category: 'primary',
      shortcut: '⌘I',
      estimatedTime: '2 min'
    },
    {
      id: 'create-question',
      title: 'Create Survey Question',
      description: 'Add new feedback questions',
      icon: MessageSquare,
      onClick: () => onTabChange('questions'),
      category: 'primary',
      shortcut: '⌘Q',
      estimatedTime: '3 min'
    },
    {
      id: 'view-responses',
      title: 'Review Feedback',
      description: 'Check latest customer responses',
      icon: Bell,
      onClick: () => onTabChange('feedback'),
      badge: stats.unread_responses > 0 ? `${stats.unread_responses} new` : undefined,
      category: 'primary',
      shortcut: '⌘F',
      estimatedTime: '5 min'
    },
    
    // Secondary Actions
    {
      id: 'export-data',
      title: 'Export Analytics',
      description: 'Download performance reports',
      icon: Download,
      onClick: () => console.log('Export data'),
      category: 'secondary',
      estimatedTime: '1 min'
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'Configure organization preferences',
      icon: Settings,
      onClick: () => onTabChange('settings'),
      category: 'secondary',
      estimatedTime: '10 min'
    },
    {
      id: 'performance-review',
      title: 'Performance Dashboard',
      description: 'View detailed system metrics',
      icon: BarChart3,
      onClick: () => onTabChange('performance'),
      category: 'secondary',
      estimatedTime: '5 min'
    },

    // Smart Suggestions
    {
      id: 'optimize-completion',
      title: 'Optimize Completion Rate',
      description: `Current rate: ${stats.completion_rate}% - Get suggestions`,
      icon: Target,
      onClick: () => onTabChange('customer-insights'),
      category: 'suggestion',
      estimatedTime: '15 min'
    },
    {
      id: 'analyze-trends',
      title: 'Analyze Response Trends',
      description: 'AI-powered insights from recent feedback',
      icon: TrendingUp,
      onClick: () => onTabChange('sentiment'),
      category: 'suggestion',
      estimatedTime: '8 min'
    }
  ];

  const filteredActions = quickActions.filter(action =>
    action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    action.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const primaryActions = filteredActions.filter(a => a.category === 'primary');
  const secondaryActions = filteredActions.filter(a => a.category === 'secondary');
  const suggestions = filteredActions.filter(a => a.category === 'suggestion');

  const getActionCardClasses = (category: string) => {
    switch (category) {
      case 'primary':
        return 'border-orange-200 hover:border-orange-300 hover:shadow-lg bg-gradient-to-br from-orange-50/50 to-amber-50/30';
      case 'suggestion':
        return 'border-blue-200 hover:border-blue-300 hover:shadow-lg bg-gradient-to-br from-blue-50/50 to-indigo-50/30';
      default:
        return 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white';
    }
  };

  const ActionCard: React.FC<{ action: QuickAction }> = ({ action }) => (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:-translate-y-1",
        getActionCardClasses(action.category),
        "border-2"
      )}
      onClick={action.onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-lg bg-white shadow-sm ring-1 ring-black/5">
            <action.icon className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex items-center space-x-2">
            {action.badge && (
              <Badge variant="secondary" className="text-xs font-medium">
                {action.badge}
              </Badge>
            )}
            {action.category === 'suggestion' && (
              <Badge className="bg-blue-100 text-blue-700 text-xs">
                <Lightbulb className="w-3 h-3 mr-1" />
                Smart
              </Badge>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
            {action.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {action.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            {action.estimatedTime && (
              <span className="flex items-center space-x-1">
                <span>~{action.estimatedTime}</span>
              </span>
            )}
            {action.shortcut && (
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                {action.shortcut}
              </kbd>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className={cn("border-0 shadow-lg bg-gradient-to-br from-white via-orange-50/20 to-amber-50/10", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500 rounded-lg shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Quick Actions
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-orange-700 border-orange-200 bg-orange-50">
            {filteredActions.length} available
          </Badge>
        </div>
        
        {/* Smart Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/70 border-gray-200 focus:border-orange-300 focus:ring-orange-200"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Primary Actions */}
        {primaryActions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-2">
              <Target className="w-4 h-4 text-orange-600" />
              <span>Priority Tasks</span>
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {primaryActions.map(action => (
                <ActionCard key={action.id} action={action} />
              ))}
            </div>
          </div>
        )}

        {/* Secondary Actions */}
        {secondaryActions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <span>Management</span>
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {secondaryActions.map(action => (
                <ActionCard key={action.id} action={action} />
              ))}
            </div>
          </div>
        )}

        {/* Smart Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span>Smart Suggestions</span>
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {suggestions.map(action => (
                <ActionCard key={action.id} action={action} />
              ))}
            </div>
          </div>
        )}

        {filteredActions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No actions found matching "{searchQuery}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
