
const { createClient } = require('@supabase/supabase-js');

class NotificationController {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async getNotifications(req, res) {
    try {
      const { organization_id } = req.query;
      const { limit = 50, offset = 0, unread_only = false } = req.query;

      let query = this.supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (organization_id) {
        query = query.eq('organization_id', organization_id);
      }

      if (unread_only === 'true') {
        query = query.eq('is_read', false);
      }

      const { data: notifications, error } = await query;

      if (error) throw error;

      res.json({
        success: true,
        data: notifications || [],
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: notifications?.length || 0
        }
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch notifications'
      });
    }
  }

  async createNotification(req, res) {
    try {
      const {
        organization_id,
        type,
        title,
        message,
        user_id,
        metadata
      } = req.body;

      if (!organization_id || !type || !title || !message) {
        return res.status(400).json({
          success: false,
          error: 'Organization ID, type, title, and message are required'
        });
      }

      const notificationData = {
        organization_id,
        type,
        title,
        message,
        user_id,
        metadata: metadata || {},
        is_read: false
      };

      const { data: notification, error } = await this.supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        data: notification,
        message: 'Notification created successfully'
      });
    } catch (error) {
      console.error('Create notification error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create notification'
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const { id } = req.params;

      const { data: notification, error } = await this.supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }

      res.json({
        success: true,
        data: notification,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark notification as read'
      });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const { organization_id } = req.body;

      if (!organization_id) {
        return res.status(400).json({
          success: false,
          error: 'Organization ID is required'
        });
      }

      const { data: notifications, error } = await this.supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('organization_id', organization_id)
        .eq('is_read', false)
        .select();

      if (error) throw error;

      res.json({
        success: true,
        data: {
          updated_count: notifications?.length || 0
        },
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark notifications as read'
      });
    }
  }

  async getNotificationStats(req, res) {
    try {
      const { organization_id } = req.params;

      const { data: stats, error } = await this.supabase
        .from('notifications')
        .select('id, is_read, type, created_at')
        .eq('organization_id', organization_id);

      if (error) throw error;

      const totalCount = stats?.length || 0;
      const unreadCount = stats?.filter(n => !n.is_read).length || 0;
      const readCount = totalCount - unreadCount;

      // Group by type
      const typeBreakdown = {};
      stats?.forEach(notification => {
        const type = notification.type;
        if (!typeBreakdown[type]) {
          typeBreakdown[type] = { total: 0, unread: 0 };
        }
        typeBreakdown[type].total++;
        if (!notification.is_read) {
          typeBreakdown[type].unread++;
        }
      });

      // Recent activity (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const recentCount = stats?.filter(n => 
        new Date(n.created_at) >= yesterday
      ).length || 0;

      res.json({
        success: true,
        data: {
          total_notifications: totalCount,
          unread_notifications: unreadCount,
          read_notifications: readCount,
          recent_notifications_24h: recentCount,
          type_breakdown: typeBreakdown
        }
      });
    } catch (error) {
      console.error('Get notification stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch notification statistics'
      });
    }
  }

  async deleteNotification(req, res) {
    try {
      const { id } = req.params;

      const { data: notification, error } = await this.supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete notification'
      });
    }
  }

  async sendBulkNotifications(req, res) {
    try {
      const {
        organization_id,
        type,
        title,
        message,
        user_ids, // Array of user IDs
        metadata
      } = req.body;

      if (!organization_id || !type || !title || !message || !user_ids?.length) {
        return res.status(400).json({
          success: false,
          error: 'Organization ID, type, title, message, and user_ids are required'
        });
      }

      const notifications = user_ids.map(user_id => ({
        organization_id,
        type,
        title,
        message,
        user_id,
        metadata: metadata || {},
        is_read: false
      }));

      const { data: createdNotifications, error } = await this.supabase
        .from('notifications')
        .insert(notifications)
        .select();

      if (error) throw error;

      res.status(201).json({
        success: true,
        data: {
          created_count: createdNotifications?.length || 0,
          notifications: createdNotifications
        },
        message: 'Bulk notifications sent successfully'
      });
    } catch (error) {
      console.error('Send bulk notifications error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send bulk notifications'
      });
    }
  }
}

module.exports = { NotificationController };
