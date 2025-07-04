
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Settings,
  TrendingUp
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number | string;
}

interface BottomNavigationProps {
  items?: NavItem[];
  organizationSlug?: string;
}

const defaultItems: NavItem[] = [
  { id: 'overview', label: 'Analytics', icon: BarChart3, path: '/overview' },
  { id: 'members', label: 'Members', icon: Users, path: '/members' },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare, path: '/feedback' },
  { id: 'insights', label: 'Insights', icon: TrendingUp, path: '/insights' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items = defaultItems,
  organizationSlug
}) => {
  const location = useLocation();
  
  const getItemPath = (item: NavItem) => {
    return organizationSlug ? `/admin/${organizationSlug}${item.path}` : item.path;
  };

  const isActive = (item: NavItem) => {
    const itemPath = getItemPath(item);
    return location.pathname === itemPath || location.pathname.startsWith(itemPath);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-2 pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          
          return (
            <Link
              key={item.id}
              to={getItemPath(item)}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-3 min-w-[60px] rounded-lg transition-all duration-200',
                'active:scale-95 active:bg-gray-100',
                active ? 'text-primary' : 'text-gray-600 hover:text-gray-800'
              )}
            >
              <div className="relative">
                <Icon className={cn('w-5 h-5', active && 'scale-110')} />
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 w-4 h-4 p-0 text-xs flex items-center justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className={cn('text-xs font-medium', active && 'font-semibold')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
