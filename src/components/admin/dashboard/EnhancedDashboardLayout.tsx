
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from './DashboardSidebar';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { DashboardHeader } from './DashboardHeader';
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign';
import { ResponsiveLayout, ResponsiveStack } from '@/components/ui/responsive-layout';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { cn } from '@/lib/utils';
import { BarChart3, Users, MessageSquare, Settings } from 'lucide-react';

const iconMap = {
  BarChart3,
  Users,
  MessageSquare,
  Settings
};

interface EnhancedDashboardLayoutProps {
  children: React.ReactNode;
  organizationName: string;
  organizationId: string;
  organizationSlug: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  stats?: any;
  isLoading?: boolean;
}

export const EnhancedDashboardLayout: React.FC<EnhancedDashboardLayoutProps> = ({
  children,
  organizationName,
  organizationId,
  organizationSlug,
  activeTab,
  onTabChange,
  stats,
  isLoading = false
}) => {
  const { 
    isMobile, 
    isTablet, 
    screenWidth, 
    shouldUseCompactLayout,
    prefersReducedMotion,
    currentBreakpoint
  } = useResponsiveDesign();

  // Updated navigation items - Performance tab completely removed
  const navigationItems = [
    { 
      id: 'overview', 
      label: shouldUseCompactLayout ? 'Analytics' : 'Dashboard Analytics', 
      icon: 'BarChart3', 
      path: '', 
      badge: stats?.growth_rate > 0 ? `+${stats.growth_rate}%` : undefined 
    },
    { 
      id: 'members', 
      label: shouldUseCompactLayout ? 'Members' : 'Team Members', 
      icon: 'Users', 
      path: '/members', 
      badge: stats?.active_members 
    },
    { 
      id: 'feedback', 
      label: shouldUseCompactLayout ? 'Feedback' : 'Customer Feedback', 
      icon: 'MessageSquare', 
      path: '/feedback', 
      badge: stats?.total_responses 
    },
    { 
      id: 'questions', 
      label: shouldUseCompactLayout ? 'Questions' : 'Survey Questions', 
      icon: 'MessageSquare', 
      path: '/questions', 
      badge: stats?.total_questions 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: 'Settings', 
      path: '/settings' 
    }
  ];

  // Mobile Layout with consistent styling
  if (isMobile) {
    return (
      <ResponsiveContainer
        className="min-h-screen bg-gray-50 dark:bg-gray-900"
        padding="none"
        maxWidth="full"
      >
        <DashboardHeader
          organizationName={organizationName}
          organizationId={organizationId}
          currentPage={activeTab}
          onNavigate={() => {}}
        />
        
        <main 
          id="main-content" 
          className={cn(
            'transition-all px-4 py-6 pb-24 min-h-0 overflow-x-hidden',
            'bg-white dark:bg-gray-900',
            !prefersReducedMotion && 'duration-300 ease-out'
          )}
        >
          <div className="w-full max-w-full overflow-hidden">
            {children}
          </div>
        </main>
        
        <BottomNavigation
          items={navigationItems.map(item => ({
            ...item,
            icon: iconMap[item.icon as keyof typeof iconMap] || MessageSquare,
            path: item.path
          }))}
          organizationSlug={organizationSlug}
        />
      </ResponsiveContainer>
    );
  }

  // Desktop/Tablet Layout with consistent styling
  return (
    <ResponsiveContainer
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      padding="none"
      maxWidth="full"
    >
      <SidebarProvider 
        defaultOpen={!isTablet}
        className="w-full"
      >
        <ResponsiveStack 
          direction="horizontal"
          spacing="none"
          align="stretch"
          className="min-h-screen"
        >
          <DashboardSidebar
            organizationName={organizationName}
            activeTab={activeTab}
            onTabChange={onTabChange}
            stats={stats}
            isLoading={isLoading}
          />
          
          <ResponsiveStack 
            direction="vertical"
            spacing="none"
            align="stretch"
            className="flex-1 min-w-0 max-w-none overflow-hidden"
          >
            <DashboardHeader
              organizationName={organizationName}
              organizationId={organizationId}
              currentPage={activeTab}
              onNavigate={() => {}}
            />
            
            <main 
              id="main-content"
              className={cn(
                'flex-1 overflow-auto bg-white dark:bg-gray-900 transition-all',
                'p-6 lg:p-8 max-w-full',
                !prefersReducedMotion && 'duration-300 ease-out'
              )}
            >
              <div className="max-w-7xl mx-auto w-full space-y-6 overflow-hidden">
                {children}
              </div>
            </main>
          </ResponsiveStack>
        </ResponsiveStack>
      </SidebarProvider>
    </ResponsiveContainer>
  );
};
