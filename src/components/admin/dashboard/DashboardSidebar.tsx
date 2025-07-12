import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Brain,
  Zap,
  Settings,
  LogOut,
} from 'lucide-react';
import { EnhancedLoadingSpinner } from './EnhancedLoadingSpinner';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthWrapper';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  organizationName: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  stats?: any;
  isLoading?: boolean;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  organizationName,
  activeTab,
  onTabChange,
  stats,
  isLoading = false
}) => {
  const { isMobile } = useMobileDetection();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  // Organized navigation with logical grouping and consistent labeling
  const navigationGroups = [
    {
      label: 'Overview',
      items: [
        { 
          id: 'overview', 
          label: 'Dashboard', 
          icon: LayoutDashboard, 
          badge: stats?.growth_metrics?.growth_rate > 0 ? `+${stats.growth_metrics.growth_rate}%` : undefined
        }
      ]
    },
    {
      label: 'Analytics',
      items: [
        { 
          id: 'feedback', 
          label: 'Feedback', 
          icon: MessageSquare, 
          badge: stats?.total_responses || 0
        },
        { 
          id: 'customer-insights', 
          label: 'Insights', 
          icon: TrendingUp
        },
        { 
          id: 'sentiment', 
          label: 'Sentiment', 
          icon: Brain
        },
        { 
          id: 'performance', 
          label: 'Performance', 
          icon: TrendingUp
        }
      ]
    },
    {
      label: 'Management',
      items: [
        { 
          id: 'questions', 
          label: 'Questions', 
          icon: HelpCircle, 
          badge: stats?.total_questions || 0
        },
        { 
          id: 'members', 
          label: 'Team', 
          icon: Users, 
          badge: stats?.active_members || 0
        }
      ]
    },
    {
      label: 'System',
      items: [
        { 
          id: 'integrations', 
          label: 'Integrations', 
          icon: Zap
        },
        { 
          id: 'settings', 
          label: 'Settings', 
          icon: Settings
        }
      ]
    }
  ];

  return (
    <Sidebar className="border-r-0 bg-white dark:bg-slate-900 shadow-lg">
      {/* Header with Pulsify branding */}
      <SidebarHeader className="p-0 border-b border-slate-100 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Pulsify
            </h1>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2 space-y-6">
        {navigationGroups.map((group, groupIndex) => (
          <SidebarGroup key={group.label} className="space-y-2">
            <SidebarGroupLabel className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-1">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onTabChange(item.id)}
                        className={cn(
                          "w-full h-10 px-3 rounded-md transition-all duration-200 group relative",
                          "flex items-center justify-between gap-3",
                          "hover:bg-orange-50 dark:hover:bg-orange-950/20",
                          "focus:bg-orange-50 dark:focus:bg-orange-950/20",
                          "focus:outline-none focus:ring-2 focus:ring-orange-200/50 dark:focus:ring-orange-800/50",
                          isActive && [
                            "bg-orange-100/70 dark:bg-orange-950/40",
                            "text-orange-700 dark:text-orange-300",
                            "shadow-sm shadow-orange-100/50 dark:shadow-orange-900/20",
                            "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                            "before:w-0.5 before:h-6 before:bg-orange-500 before:rounded-r-full"
                          ]
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <item.icon 
                            className={cn(
                              "w-4 h-4 shrink-0 transition-colors",
                              isActive 
                                ? "text-orange-600 dark:text-orange-400" 
                                : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                            )} 
                          />
                          <span className={cn(
                            "text-sm font-medium",
                            isActive 
                              ? "text-orange-700 dark:text-orange-300" 
                              : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100"
                          )}>
                            {item.label}
                          </span>
                        </div>
                        
                        {(isLoading && activeTab === item.id) ? (
                          <EnhancedLoadingSpinner size="sm" text="" className="w-4 h-4 shrink-0" />
                        ) : (
                          item.badge && (
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "text-xs px-1.5 py-0.5 min-w-0 shrink-0 font-medium",
                                isActive 
                                  ? "bg-orange-200/80 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200" 
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer with logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-start h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign out
        </Button>
      </div>
    </Sidebar>
  );
};
