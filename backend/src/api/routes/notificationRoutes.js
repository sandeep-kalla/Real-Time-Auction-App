const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

// Get user notifications
router.get('/', requireAuth, notificationController.getUserNotifications);

// Get unread notification count
router.get('/unread/count', requireAuth, notificationController.getUnreadNotificationCount);

// Mark notification as read
router.patch('/:id/read', requireAuth, notificationController.markNotificationRead);

// Mark all notifications as read
router.patch('/read-all', requireAuth, notificationController.markAllNotificationsRead);

module.exports = router;