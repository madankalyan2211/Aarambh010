const { Notification } = require('../models');
const { emitUnreadCount } = require('../utils/notification.util');

/**
 * Get all notifications for current user
 * @route GET /api/notifications
 * @access Private
 */
exports.getNotifications = async (req, res) => {
  try {
    // Get all notifications for the current user, sorted by creation date
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 most recent notifications

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: notifications,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error retrieving notifications',
      error: error.message,
    });
  }
};

/**
 * Get unread notifications count for current user
 * @route GET /api/notifications/unread-count
 * @access Private
 */
exports.getUnreadCount = async (req, res) => {
  try {
    // Count unread notifications for the current user
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      message: 'Unread count retrieved successfully',
      data: {
        unreadCount
      },
    });
  } catch (error) {
    console.error('Get unread notifications count error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error retrieving unread notifications count',
      error: error.message,
    });
  }
};

/**
 * Mark notification as read and emit updated unread count
 * @route POST /api/notifications/:id/read
 * @access Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and update the notification
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }
    
    // Emit updated unread count to user
    await emitUnreadCount(req.user.id, req.app);
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message,
    });
  }
};

/**
 * Mark all notifications as read and emit updated unread count
 * @route POST /api/notifications/mark-all-read
 * @access Private
 */
exports.markAllAsRead = async (req, res) => {
  try {
    // Update all unread notifications for the current user
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    
    // Emit updated unread count to user
    await emitUnreadCount(req.user.id, req.app);
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message,
    });
  }
};