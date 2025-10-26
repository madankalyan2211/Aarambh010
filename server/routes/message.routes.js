const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  markAsRead,
  getUnreadCount
} = require('../controllers/messageController');

// Apply authentication middleware to all routes
router.use(protect);

// Get user's conversations
router.get('/conversations', getConversations);

// Create a new conversation
router.post('/conversations', createConversation);

// Get messages for a conversation
router.get('/conversation/:conversationId', getMessages);

// Send a new message
router.post('/send', sendMessage);

// Mark conversation as read
router.post('/conversation/:conversationId/read', markAsRead);

// Get unread messages count
router.get('/unread-count', getUnreadCount);

module.exports = router;