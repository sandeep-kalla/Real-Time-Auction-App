const { Notification } = require('../../models');

/**
 * Get user notifications
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all notifications for the user
    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    
    // Process notifications to add parsed payload
    const processedNotifications = notifications.map(notification => {
      const notificationObj = notification.toJSON();
      try {
        notificationObj.parsedPayload = JSON.parse(notification.payload);
      } catch (e) {
        notificationObj.parsedPayload = {};
      }
      return notificationObj;
    });
    
    return res.json({ 
      notifications: processedNotifications,
      total: processedNotifications.length 
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

/**
 * Mark notification as read
 */
exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find the notification
    const notification = await Notification.findOne({
      where: { id, userId }
    });
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Mark as read
    await notification.update({ readAt: new Date() });
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

/**
 * Mark all notifications as read
 */
exports.markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Mark all unread notifications as read
    await Notification.update(
      { readAt: new Date() },
      { 
        where: { 
          userId,
          readAt: null 
        } 
      }
    );
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

/**
 * Get unread notification count
 */
exports.getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await Notification.count({
      where: { 
        userId,
        readAt: null 
      }
    });
    
    return res.json({ count });
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return res.status(500).json({ error: 'Failed to get unread notification count' });
  }
};