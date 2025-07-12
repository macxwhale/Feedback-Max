
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';
import { DashboardSearch } from './dashboard/DashboardSearch';
import { NotificationDropdown } from './dashboard/NotificationDropdown';
import { DashboardUserMenu } from './dashboard/DashboardUserMenu';

interface OrganizationHeaderProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    status?: string;
  };
}

export const OrganizationHeader: React.FC<OrganizationHeaderProps> = ({ organization }) => {
  const handleNavigate = (url: string) => {
    // Navigate to the specified URL within the dashboard
    console.log('Navigate to:', url);
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Left side: Organization info */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {organization.name}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-gray-600 dark:text-gray-300">Organization Dashboard</p>
                {organization.status && (
                  <Badge variant={organization.status === 'active' ? 'default' : 'outline'}>
                    {organization.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right side: Search, Notifications, and User Menu */}
          <div className="flex items-center space-x-3 justify-end">
            <div className="hidden md:block">
              <DashboardSearch 
                organizationId={organization.id}
                onNavigate={handleNavigate}
              />
            </div>
            <NotificationDropdown organizationId={organization.id} />
            <DashboardUserMenu />
          </div>
        </div>

        {/* Mobile search bar - shown below on smaller screens */}
        <div className="md:hidden mt-4">
          <DashboardSearch 
            organizationId={organization.id}
            onNavigate={handleNavigate}
          />
        </div>
      </CardContent>
    </Card>
  );
};
