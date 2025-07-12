
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  LayoutDashboard, 
  ChevronRight,
  Star,
  Clock,
  ExternalLink,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbAction {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'outline' | 'ghost';
}

interface EnhancedNavigationBreadcrumbProps {
  organizationName: string;
  currentPage?: string;
  actions?: BreadcrumbAction[];
  showStatus?: boolean;
  lastUpdated?: string;
  className?: string;
}

export const EnhancedNavigationBreadcrumb: React.FC<EnhancedNavigationBreadcrumbProps> = ({ 
  organizationName,
  currentPage = "Overview",
  actions = [],
  showStatus = true,
  lastUpdated,
  className
}) => {
  const getPageIcon = (page: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      'Overview': LayoutDashboard,
      'Dashboard': LayoutDashboard,
      'Members': Building,
      'Settings': Building,
      'Performance': LayoutDashboard,
      'Analytics': LayoutDashboard
    };
    return iconMap[page] || LayoutDashboard;
  };

  const PageIcon = getPageIcon(currentPage);

  return (
    <div className={cn("flex items-center justify-between bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-100", className)}>
      {/* Enhanced Breadcrumb Navigation */}
      <div className="flex items-center space-x-4">
        <Breadcrumb>
          <BreadcrumbList className="flex items-center space-x-2">
            <BreadcrumbItem>
              <BreadcrumbLink 
                href="/admin" 
                className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="font-medium">Admin</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            <BreadcrumbSeparator>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </BreadcrumbSeparator>
            
            <BreadcrumbItem>
              <BreadcrumbLink className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors">
                <Building className="w-4 h-4" />
                <span className="font-medium">{organizationName}</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            <BreadcrumbSeparator>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </BreadcrumbSeparator>
            
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center space-x-2 text-gray-900 font-semibold">
                <PageIcon className="w-4 h-4 text-orange-600" />
                <span>{currentPage}</span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Status and Context Information */}
        {showStatus && (
          <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-gray-200">
            <Badge variant="outline" className="flex items-center space-x-2 bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live Data</span>
            </Badge>
            
            {lastUpdated && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Updated {lastUpdated}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contextual Actions */}
      {actions.length > 0 && (
        <div className="flex items-center space-x-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
              className="flex items-center space-x-2 h-8 px-3 text-sm font-medium"
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
