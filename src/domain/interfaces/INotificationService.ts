
/**
 * Notification Service Interface
 * Defines contract for notification operations
 */

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  metadata?: Record<string, unknown>;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  browserNotifications: boolean;
  feedbackAlerts: boolean;
  systemUpdates: boolean;
}

export interface INotificationService {
  /**
   * Send a notification
   */
  sendNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void>;

  /**
   * Get notifications for a user
   */
  getNotifications(userId: string): Promise<Notification[]>;

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): Promise<void>;

  /**
   * Get notification preferences
   */
  getPreferences(userId: string): Promise<NotificationPreferences>;

  /**
   * Update notification preferences
   */
  updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void>;
}
