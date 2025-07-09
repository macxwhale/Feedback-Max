
/**
 * Enhanced Notification Service Implementation
 * Implements INotificationService for managing notifications
 */

import { supabase } from '@/integrations/supabase/client';
import type { INotificationService, Notification, NotificationPreferences } from '@/domain/interfaces/INotificationService';

export class EnhancedNotificationService implements INotificationService {
  async sendNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .insert({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata ? JSON.parse(JSON.stringify(notification.metadata)) : null,
        organization_id: notification.metadata?.organizationId as string,
        user_id: notification.metadata?.userId as string || null
      });

    if (error) {
      console.error('Error sending notification:', error);
      throw new Error('Failed to send notification');
    }
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }

    return (data || []).map(notification => ({
      id: notification.id,
      type: notification.type as Notification['type'],
      title: notification.title,
      message: notification.message,
      timestamp: new Date(notification.created_at).getTime(),
      read: notification.is_read,
      metadata: notification.metadata as Record<string, unknown> || {}
    }));
  }

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  async getPreferences(userId: string): Promise<NotificationPreferences> {
    // Default preferences - in a real app, these would be stored in database
    return {
      emailNotifications: true,
      browserNotifications: true,
      feedbackAlerts: true,
      systemUpdates: true
    };
  }

  async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    // Implementation would update user preferences in database
    console.log('Updating preferences for user:', userId, preferences);
  }
}
