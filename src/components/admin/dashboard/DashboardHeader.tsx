
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NotificationDropdown } from './NotificationDropdown';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, User, Search, Plus, Settings, Download, Command } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthWrapper';
import { useOrganization } from '@/context/OrganizationContext';

interface DashboardHeaderProps {
  organizationName: string;
  organizationId: string;
  currentPage: string;
  onNavigate: (url: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  organizationName,
  organizationId,
  currentPage,
  onNavigate
}) => {
  const { user } = useAuth();
  const { organization } = useOrganization();

  // Get user's first name from email or use 'there' as fallback
  const getUserName = () => {
    if (user?.email) {
      const emailUsername = user.email.split('@')[0];
      // Capitalize first letter and handle common name patterns
      return emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
    }
    return 'there';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getPageContext = () => {
    switch (currentPage) {
      case 'overview':
        return "Here's your dashboard overview for today.";
      case 'feedback':
        return "Here's your latest customer feedback activity.";
      case 'members':
        return "Manage your team members and their permissions.";
      case 'sentiment':
        return "Analyze customer sentiment trends and insights.";
      case 'performance':
        return "Track performance metrics and analytics.";
      case 'questions':
        return "Manage your survey questions and forms.";
      case 'integrations':
        return "Configure your integrations and API connections.";
      case 'settings':
        return "Customize your organization settings.";
      default:
        return "Welcome to your organization dashboard.";
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="border-b border-gray-100 bg-white">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          
          {/* Global search with keyboard shortcut */}
          <div className="hidden lg:block">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 min-w-[280px] justify-start text-gray-500 hover:text-gray-700 bg-gray-50 border-gray-200"
            >
              <Search className="w-4 h-4" />
              <span>Search dashboard...</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <Command className="w-3 h-3" />
                K
              </kbd>
            </Button>
          </div>
        </div>

        {/* Right section with user controls */}
        <div className="flex items-center space-x-4">
          {/* Location and time display */}
          <div className="hidden md:flex items-center text-sm text-gray-600 bg-blue-50 px-3 py-1.5 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span>{getCurrentTime()}</span>
          </div>

          {/* Notifications */}
          <NotificationDropdown organizationId={organizationId} />

          {/* User menu */}
          <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-sm">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-gray-900">
                {getUserName()}
              </div>
              <div className="text-xs text-gray-500">
                Administrator
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900">
              {getGreeting()}, {getUserName()}
            </h1>
            <p className="text-gray-600 text-sm">
              {getPageContext()}
            </p>
          </div>

          {/* Organization status with improved hover */}
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="flex items-center space-x-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 transition-colors">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">{organization?.name || organizationName}</span>
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
