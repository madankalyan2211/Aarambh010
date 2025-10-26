const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getNotifications, getUnreadCount, markAsRead, markAllAsRead } = require('../controllers/notificationController');

// Apply authentication middleware to all routes
router.use(protect);

// Get all notifications for current user
router.get('/', getNotifications);

// Get unread notifications count
router.get('/unread-count', getUnreadCount);

// Mark a notification as read
router.post('/:id/read', markAsRead);

// Mark all notifications as read
router.post('/mark-all-read', markAllAsRead);

module.exports = router;