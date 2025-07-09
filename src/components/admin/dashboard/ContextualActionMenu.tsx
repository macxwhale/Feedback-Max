
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreVertical, 
  Download, 
  Share2, 
  Settings, 
  Trash2, 
  Edit,
  Eye,
  Copy,
  ExternalLink,
  Bookmark,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextualAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'secondary';
  shortcut?: string;
  badge?: string;
  separator?: boolean;
}

interface ContextualActionMenuProps {
  actions: ContextualAction[];
  title?: string;
  className?: string;
  buttonVariant?: 'ghost' | 'outline' | 'secondary';
  buttonSize?: 'sm' | 'default' | 'lg';
}

export const ContextualActionMenu: React.FC<ContextualActionMenuProps> = ({
  actions,
  title = "Actions",
  className,
  buttonVariant = 'ghost',
  buttonSize = 'sm'
}) => {
  const getActionClasses = (variant?: string) => {
    switch (variant) {
      case 'destructive':
        return 'text-red-600 hover:text-red-700 focus:text-red-700 hover:bg-red-50 focus:bg-red-50';
      case 'secondary':
        return 'text-gray-600 hover:text-gray-700 focus:text-gray-700';
      default:
        return 'text-gray-700 hover:text-gray-900 focus:text-gray-900';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={buttonVariant}
          size={buttonSize}
          className={cn(
            "h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            "focus:opacity-100 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800",
            className
          )}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">{title}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-white/95 backdrop-blur-sm border shadow-xl"
        align="end"
        side="bottom"
      >
        <DropdownMenuLabel className="font-semibold text-gray-900">
          {title}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((action, index) => (
          <React.Fragment key={action.id}>
            <DropdownMenuItem
              onClick={action.onClick}
              className={cn(
                "flex items-center justify-between cursor-pointer py-2.5 px-3",
                "transition-colors duration-150",
                getActionClasses(action.variant)
              )}
            >
              <div className="flex items-center space-x-3">
                <action.icon className="h-4 w-4" />
                <span className="font-medium">{action.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                {action.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {action.badge}
                  </Badge>
                )}
                {action.shortcut && (
                  <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    {action.shortcut}
                  </kbd>
                )}
              </div>
            </DropdownMenuItem>
            {action.separator && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Pre-configured action sets for common use cases
export const createMetricActions = (onView: () => void, onExport: () => void, onShare: () => void): ContextualAction[] => [
  {
    id: 'view-details',
    label: 'View Details',
    icon: Eye,
    onClick: onView,
    shortcut: '⌘D'
  },
  {
    id: 'export-data',
    label: 'Export Data',
    icon: Download,
    onClick: onExport,
    shortcut: '⌘E'
  },
  {
    id: 'share',
    label: 'Share',
    icon: Share2,
    onClick: onShare,
    separator: true
  },
  {
    id: 'bookmark',
    label: 'Bookmark',
    icon: Bookmark,
    onClick: () => console.log('Bookmark'),
    variant: 'secondary'
  }
];

export const createDashboardActions = (onRefresh: () => void, onSettings: () => void): ContextualAction[] => [
  {
    id: 'refresh',
    label: 'Refresh Data',
    icon: Copy,
    onClick: onRefresh,
    shortcut: '⌘R',
    badge: 'Live'
  },
  {
    id: 'customize',
    label: 'Customize View',
    icon: Settings,
    onClick: onSettings,
    separator: true
  },
  {
    id: 'external',
    label: 'Open in New Tab',
    icon: ExternalLink,
    onClick: () => window.open(window.location.href, '_blank'),
    variant: 'secondary'
  }
];
