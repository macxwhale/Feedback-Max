
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  X,
  Check,
  Trash2
} from 'lucide-react';
import { useRealtimeNotifications, Notification } from '@/hooks/useRealtimeNotifications';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationCenterProps {
  organizationId: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  organizationId
}) => {
  const { 
    notifications, 
    isLoading, 
    error,
    markAsRead, 
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    unreadCount
  } = useRealtimeNotifications(organizationId);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info': return <Info className="w-5 h-5 mt-0.5 text-blue-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 mt-0.5 text-yellow-600" />;
      case 'success': return <CheckCircle className="w-5 h-5 mt-0.5 text-green-600" />;
      case 'error': return <AlertTriangle className="w-5 h-5 mt-0.5 text-red-600" />;
      default: return <Info className="w-5 h-5 mt-0.5" />;
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

  const handleDismiss = async (notificationId: string) => {
    try {
      await removeNotification(notificationId);
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>Failed to load notifications</p>
            <p className="text-sm text-gray-500">Please refresh the page</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
                <p className="text-sm text-gray-400">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border rounded-lg transition-all duration-200 hover:shadow-sm ${
                    !notification.is_read 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' 
                      : 'bg-white dark:bg-gray-800 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className={`font-medium text-sm truncate ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {formatNotificationMessage(notification)}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0 pl-2">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Mark as read"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="h-7 w-7 p-0 hover:bg-green-100"
                        >
                          <CheckCircle className="w-4 h-4 text-gray-500 hover:text-green-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Dismiss"
                        onClick={() => handleDismiss(notification.id)}
                        className="h-7 w-7 p-0 hover:bg-red-100"
                      >
                        <X className="w-4 h-4 text-gray-500 hover:text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
