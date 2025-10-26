const { Notification } = require('../models');

/**
 * Create a notification and emit event to recipient if online
 * @param {Object} notificationData - The notification data
 * @param {Object} app - Express app instance with io and connectedUsers
 */
const createNotification = async (notificationData, app) => {
  try {
    // Create the notification in the database
    const notification = new Notification(notificationData);
    const savedNotification = await notification.save();
    
    // Get io instance and connected users from app
    const io = app.get('io');
    const connectedUsers = app.get('connectedUsers');
    
    // If recipient is online, emit notification event
    const recipientSocketId = connectedUsers.get(notificationData.recipient.toString());
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('new-notification', {
        notification: savedNotification
      });
    }
    
    // Emit unread count update to recipient
    const unreadCount = await Notification.countDocuments({
      recipient: notificationData.recipient,
      isRead: false
    });
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('unread-notifications-count', {
        count: unreadCount
      });
    }
    
    return savedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Emit unread notifications count to a user
 * @param {string} userId - The user ID
 * @param {Object} app - Express app instance with io and connectedUsers
 */
const emitUnreadCount = async (userId, app) => {
  try {
    // Get io instance and connected users from app
    const io = app.get('io');
    const connectedUsers = app.get('connectedUsers');
    
    // Calculate unread count
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });
    
    // If user is online, emit unread count update
    const recipientSocketId = connectedUsers.get(userId.toString());
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('unread-notifications-count', {
        count: unreadCount
      });
    }
    
    return unreadCount;
  } catch (error) {
    console.error('Error emitting unread count:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  emitUnreadCount
};