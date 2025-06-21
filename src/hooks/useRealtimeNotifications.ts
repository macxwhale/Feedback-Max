
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast as sonnerToast } from 'sonner';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  organization_id: string;
  metadata?: any;
}

const fetchNotifications = async (organizationId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(50); // Industry standard: limit to reasonable number

  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
  return data as Notification[];
};

export const useRealtimeNotifications = (organizationId: string) => {
  const queryClient = useQueryClient();
  const [lastToastTime, setLastToastTime] = useState<number>(0);

  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications', organizationId],
    queryFn: () => fetchNotifications(organizationId),
    enabled: !!organizationId,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });

  useEffect(() => {
    if (!organizationId) return;

    const channel = supabase
      .channel(`notifications-${organizationId}`)
      .on<Notification>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          console.log('New notification received:', payload.new);
          
          // Update local state immediately
          queryClient.setQueryData(['notifications', organizationId], (oldData: Notification[] | undefined) => {
            return [payload.new, ...(oldData || [])];
          });
          
          // Rate limiting for toasts (max 1 per 3 seconds)
          const now = Date.now();
          if (now - lastToastTime > 3000) {
            // Show toast notification with action buttons
            sonnerToast(payload.new.title, {
              description: payload.new.message,
              action: {
                label: 'View',
                onClick: () => {
                  // Could navigate to specific view based on notification type
                  console.log('View notification:', payload.new.id);
                },
              },
              duration: 5000,
              className: getToastClassName(payload.new.type),
            });
            setLastToastTime(now);
          }
        }
      )
      .on<Notification>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          console.log('Notification updated:', payload.new);
          
          // Update local state
          queryClient.setQueryData(['notifications', organizationId], (oldData: Notification[] | undefined) => {
            return oldData?.map(n => n.id === payload.new.id ? payload.new : n) || [];
          });
        }
      )
      .on<Notification>(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          console.log('Notification deleted:', payload.old);
          
          // Update local state
          queryClient.setQueryData(['notifications', organizationId], (oldData: Notification[] | undefined) => {
            return oldData?.filter(n => n.id !== payload.old.id) || [];
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Unsubscribing from notifications channel');
      supabase.removeChannel(channel);
    };
  }, [organizationId, queryClient, lastToastTime]);

  const markAsRead = async (notificationId: string) => {
    // Optimistic update
    queryClient.setQueryData(['notifications', organizationId], (oldData: Notification[] | undefined) => 
      oldData?.map(n => n.id === notificationId ? { ...n, is_read: true } : n) || []
    );

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        // Revert optimistic update
        queryClient.invalidateQueries({ queryKey: ['notifications', organizationId] });
        sonnerToast.error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      queryClient.invalidateQueries({ queryKey: ['notifications', organizationId] });
      sonnerToast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.is_read);
    if (unreadNotifications.length === 0) return;

    // Optimistic update
    queryClient.setQueryData(['notifications', organizationId], (oldData: Notification[] | undefined) => 
      oldData?.map(n => ({ ...n, is_read: true })) || []
    );

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('organization_id', organizationId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        queryClient.invalidateQueries({ queryKey: ['notifications', organizationId] });
        sonnerToast.error('Failed to mark all notifications as read');
      } else {
        sonnerToast.success(`Marked ${unreadNotifications.length} notifications as read`);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      queryClient.invalidateQueries({ queryKey: ['notifications', organizationId] });
      sonnerToast.error('Failed to mark all notifications as read');
    }
  };

  const removeNotification = async (notificationId: string) => {
    // Store current state for potential rollback
    const previousNotifications = queryClient.getQueryData(['notifications', organizationId]);
    
    // Optimistic update
    queryClient.setQueryData(['notifications', organizationId], (oldData: Notification[] | undefined) => 
      oldData?.filter(n => n.id !== notificationId) || []
    );

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error removing notification:', error);
        // Rollback optimistic update
        queryClient.setQueryData(['notifications', organizationId], previousNotifications);
        sonnerToast.error('Failed to remove notification');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      // Rollback optimistic update
      queryClient.setQueryData(['notifications', organizationId], previousNotifications);
      sonnerToast.error('Failed to remove notification');
    }
  };

  const clearAllNotifications = async () => {
    if (notifications.length === 0) return;

    // Store current state for potential rollback
    const previousNotifications = queryClient.getQueryData(['notifications', organizationId]);
    
    // Optimistic update
    queryClient.setQueryData(['notifications', organizationId], []);

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('organization_id', organizationId);

      if (error) {
        console.error('Error clearing all notifications:', error);
        // Rollback optimistic update
        queryClient.setQueryData(['notifications', organizationId], previousNotifications);
        sonnerToast.error('Failed to clear all notifications');
      } else {
        sonnerToast.success('All notifications cleared');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      // Rollback optimistic update
      queryClient.setQueryData(['notifications', organizationId], previousNotifications);
      sonnerToast.error('Failed to clear all notifications');
    }
  };

  return { 
    notifications, 
    isLoading, 
    error,
    markAsRead, 
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    unreadCount: notifications.filter(n => !n.is_read).length
  };
};

// Helper function to get toast styling based on notification type
const getToastClassName = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'border-green-200 bg-green-50';
    case 'warning':
      return 'border-yellow-200 bg-yellow-50';
    case 'error':
      return 'border-red-200 bg-red-50';
    default:
      return 'border-blue-200 bg-blue-50';
  }
};
