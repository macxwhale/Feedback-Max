
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, CheckCircle, AlertTriangle, Info, X, Check, Trash2 } from 'lucide-react';
import { useRealtimeNotifications, Notification } from '@/hooks/useRealtimeNotifications';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationDropdownProps {
  organizationId: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  organizationId
}) => {
  const { 
    notifications, 
    isLoading, 
    error,
    markAsRead, 
    markAllAsRead,
    removeNotification,
    unreadCount
  } = useRealtimeNotifications(organizationId);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info': return <Info className="w-4 h-4 text-blue-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const formatNotificationMessage = (notification: Notification) => {
    let message = notification.message;
    
    // Replace "N/A" with more user-friendly text
    if (message.includes('N/A')) {
      message = message.replace('For question: N/A', 'New feedback response received');
    }
    
    // If we have question text in metadata, use it
    if (notification.metadata?.question_text && notification.metadata.question_text !== 'N/A') {
      message = `For question: ${notification.metadata.question_text}`;
    }
    
    return message;
  };

  // Show only recent notifications in dropdown (last 10)
  const recentNotifications = notifications.slice(0, 10);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2 flex items-center justify-between">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-6 px-2"
            >
              <Check className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {error ? (
          <div className="p-4 text-center text-red-500 text-sm">
            <AlertTriangle className="w-4 h-4 mx-auto mb-1" />
            Failed to load notifications
          </div>
        ) : isLoading ? (
          <div className="p-2 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            <Bell className="w-4 h-4 mx-auto mb-1 opacity-50" />
            You're all caught up!
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            {recentNotifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className="p-0" 
                onSelect={(e) => e.preventDefault()}
              >
                <div className={`w-full p-3 ${
                  !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      {getIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium truncate">
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                          {formatNotificationMessage(notification)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center shrink-0 pl-2 space-x-1">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Mark as read"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="h-7 w-7 p-0 hover:bg-green-100"
                        >
                          <CheckCircle className="w-4 h-4 text-gray-500 hover:text-green-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Dismiss"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="h-7 w-7 p-0 hover:bg-red-100"
                      >
                        <X className="w-4 h-4 text-gray-500 hover:text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            {notifications.length > 10 && (
              <>
                <DropdownMenuSeparator />
                <div className="p-2 text-center">
                  <span className="text-xs text-gray-500">
                    {notifications.length - 10} more notifications...
                  </span>
                </div>
              </>
            )}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
