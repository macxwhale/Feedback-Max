
const express = require('express');
const { NotificationController } = require('../controllers/NotificationController');
const { authenticateToken } = require('../middleware/auth');
const { validateNotificationRequest } = require('../middleware/validation');

const router = express.Router();
const notificationController = new NotificationController();

// Notification CRUD routes
router.get('/', 
  authenticateToken,
  notificationController.getNotifications.bind(notificationController)
);

router.post('/',
  authenticateToken,
  validateNotificationRequest,
  notificationController.createNotification.bind(notificationController)
);

router.put('/:id/read',
  authenticateToken,
  notificationController.markAsRead.bind(notificationController)
);

router.put('/read-all',
  authenticateToken,
  notificationController.markAllAsRead.bind(notificationController)
);

router.delete('/:id',
  authenticateToken,
  notificationController.deleteNotification.bind(notificationController)
);

// Bulk operations
router.post('/bulk',
  authenticateToken,
  notificationController.sendBulkNotifications.bind(notificationController)
);

// Statistics
router.get('/organizations/:organization_id/stats',
  authenticateToken,
  notificationController.getNotificationStats.bind(notificationController)
);

module.exports = router;
