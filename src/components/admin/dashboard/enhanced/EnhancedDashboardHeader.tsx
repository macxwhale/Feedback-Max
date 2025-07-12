/**
 * Enhanced Dashboard Header Component
 * Focused header component with performance optimizations
 */

import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Settings, Bell } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  onSettings?: () => void;
  isLoading?: boolean;
  notificationCount?: number;
}

export const EnhancedDashboardHeader = memo<DashboardHeaderProps>(({
  title,
  subtitle,
  onRefresh,
  onSettings,
  isLoading = false,
  notificationCount = 0,
}) => {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {title}
          </CardTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {notificationCount > 0 && (
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Button>
          )}
          
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh</span>
            </Button>
          )}
          
          {onSettings && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSettings}
              className="h-8"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  );
});

EnhancedDashboardHeader.displayName = 'EnhancedDashboardHeader';