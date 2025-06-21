
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  X
} from 'lucide-react';
import { useRealtimeNotifications, Notification } from '@/hooks/useRealtimeNotifications';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationCenterProps {
  organizationId: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  organizationId
}) => {
  const { notifications, isLoading, markAsRead, removeNotification } = useRealtimeNotifications(organizationId);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info': return <Info className="w-5 h-5 mt-0.5 text-blue-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 mt-0.5 text-yellow-600" />;
      case 'success': return <CheckCircle className="w-5 h-5 mt-0.5 text-green-600" />;
      case 'error': return <AlertTriangle className="w-5 h-5 mt-0.5 text-red-600" />;
      default: return <Info className="w-5 h-5 mt-0.5" />;
    }
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No new notifications</p>
              <p className="text-sm text-gray-400">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => {
              return (
                <div
                  key={notification.id}
                  className={`p-3 border rounded-lg transition-colors flex items-start justify-between ${
                    !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3 flex-1">
                    {getIcon(notification.type)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
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
                        className="h-7 w-7 p-0"
                      >
                        <CheckCircle className="w-4 h-4 text-gray-500 hover:text-green-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Dismiss"
                      onClick={() => handleDismiss(notification.id)}
                      className="h-7 w-7 p-0"
                    >
                      <X className="w-4 h-4 text-gray-500 hover:text-red-600" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
