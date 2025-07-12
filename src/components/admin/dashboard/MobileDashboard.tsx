
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Activity,
  Bell,
  Search,
  Plus
} from 'lucide-react';
import { StatsCards } from './StatsCards';
import { NotificationCenter } from './NotificationCenter';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { useOrganization } from '@/context/OrganizationContext';

interface MobileDashboardProps {
  organizationName: string;
  stats?: {
    active_members: number;
    total_questions: number;
    total_sessions: number;
    completed_sessions: number;
    total_responses: number;
    avg_session_score: number;
  };
  onTabChange: (tab: string) => void;
  activeTab: string;
}

export const MobileDashboard: React.FC<MobileDashboardProps> = ({
  organizationName,
  stats,
  onTabChange,
  activeTab
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isMobile } = useMobileDetection();
  const { organization } = useOrganization();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'members', label: 'Members', icon: Users, badge: stats?.active_members },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, badge: stats?.total_sessions },
    { id: 'questions', label: 'Questions', icon: MessageSquare, badge: stats?.total_questions },
  ];

  const mobileStats = [
    {
      title: 'Members',
      value: stats?.active_members || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Sessions',
      value: stats?.total_sessions || 0,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Responses',
      value: stats?.total_responses || 0,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Avg Score',
      value: stats?.avg_session_score || 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      suffix: '/5'
    }
  ];

  if (!isMobile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="py-4">
                  <h2 className="font-semibold text-lg mb-4">{organizationName}</h2>
                  <nav className="space-y-2">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.id}
                          variant={activeTab === item.id ? "default" : "ghost"}
                          onClick={() => {
                            onTabChange(item.id);
                            setIsMenuOpen(false);
                          }}
                          className="w-full justify-start"
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          {item.label}
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </Button>
                      );
                    })}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <div>
              <h1 className="font-semibold text-lg">{organizationName}</h1>
              <p className="text-sm text-muted-foreground">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>
            {organization && <NotificationCenter organizationId={organization.id} />}
            <Button size="icon" className="bg-primary">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Content */}
      <div className="p-4 space-y-4">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {mobileStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                    <p className="text-lg font-bold">
                      {stat.value}{stat.suffix || ''}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Active Tab Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {menuItems.find(item => item.id === activeTab)?.label || 'Overview'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Mobile-optimized view for {activeTab} content.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
