const { Message, Conversation } = require('../models');
const { User } = require('../models');
const { createNotification } = require('../utils/notification.util');

/**
 * Send a new message
 * @route POST /api/messages/send
 * @access Private
 */
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, conversationId } = req.body;
    
    // Validation
    if (!receiverId && !conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Either receiver ID or conversation ID is required',
      });
    }
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
    }
    
    // If conversation ID is provided, verify it exists and user is part of it
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        participants: req.user.id,
        isActive: true
      });
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found or access denied',
        });
      }
      
      // Set receiver ID from conversation if not provided
      if (!receiverId) {
        const otherParticipant = conversation.participants.find(
          participant => participant.toString() !== req.user.id
        );
        if (otherParticipant) {
          receiverId = otherParticipant.toString();
        }
      }
    } else {
      // Create new conversation if it doesn't exist
      // Check if conversation already exists between these two users
      conversation = await Conversation.findOne({
        isGroup: false,
        participants: {
          $all: [req.user.id, receiverId],
          $size: 2
        }
      });
      
      if (!conversation) {
        // Create new conversation
        conversation = new Conversation({
          participants: [req.user.id, receiverId],
          isGroup: false,
        });
        await conversation.save();
      }
    }
    
    // Create new message
    const message = new Message({
      sender: req.user.id,
      receiver: receiverId,
      content: content.trim(),
      conversationId: conversation._id,
    });
    
    await message.save();
    
    // Populate sender and receiver details
    await message.populate('sender', 'name email avatar');
    await message.populate('receiver', 'name email avatar');
    
    // Update conversation last message and unread count
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    
    // Increment unread count for receiver
    const currentUnread = conversation.unreadCount.get(receiverId) || 0;
    conversation.unreadCount.set(receiverId, currentUnread + 1);
    
    await conversation.save();
    
    // Create notification for receiver using utility function
    const sender = await User.findById(req.user.id);
    
    await createNotification({
      recipient: receiverId,
      sender: req.user.id,
      type: 'message',
      title: 'New Message',
      message: `${sender.name}: ${content.trim().substring(0, 50)}${content.trim().length > 50 ? '...' : ''}`,
      relatedUser: req.user.id,
    }, req.app);
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages based on the error type
    let errorMessage = 'Error sending message';
    if (error.name === 'ValidationError') {
      errorMessage = 'Invalid message data provided';
      // Log validation errors for debugging
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid ID format';
    } else if (error.code === 11000) {
      errorMessage = 'Duplicate message entry';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
    });
  }
};

/**
 * Create a new conversation
 * @route POST /api/messages/conversations
 * @access Private
 */
exports.createConversation = async (req, res) => {
  try {
    const { participantIds } = req.body;
    
    // Validation
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Participant IDs are required',
      });
    }
    
    // Add current user to participants if not already included
    const participants = [...new Set([...participantIds, req.user.id])];
    
    // Check if all participants exist
    const users = await User.find({ _id: { $in: participants } });
    if (users.length !== participants.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more participants not found',
      });
    }
    
    // Check if conversation already exists (for direct messages)
    let conversation;
    if (participants.length === 2) {
      conversation = await Conversation.findOne({
        isGroup: false,
        participants: {
          $all: participants,
          $size: 2
        }
      });
    }
    
    if (!conversation) {
      // Create new conversation
      const isGroup = participants.length > 2;
      conversation = new Conversation({
        participants,
        isGroup,
        groupName: isGroup ? `Group Chat` : undefined,
      });
      
      await conversation.save();
    }
    
    // Populate participants
    await conversation.populate('participants', 'name email avatar');
    
    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: conversation,
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating conversation',
      error: error.message,
    });
  }
};

/**
 * Get total unread messages count for current user
 * @route GET /api/messages/unread-count
 * @access Private
 */
exports.getUnreadCount = async (req, res) => {
  try {
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: req.user.id,
      isActive: true
    });

    // Calculate total unread count for current user
    let totalUnread = 0;
    conversations.forEach(conversation => {
      const unreadCount = conversation.unreadCount.get(req.user.id.toString()) || 0;
      totalUnread += unreadCount;
    });

    res.status(200).json({
      success: true,
      message: 'Unread count retrieved successfully',
      data: {
        unreadCount: totalUnread
      },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    
    // Provide more specific error messages based on the error type
    let errorMessage = 'Error retrieving unread count';
    if (error.name === 'ValidationError') {
      errorMessage = 'Invalid request data';
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid ID format';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
    });
  }
};

/**
 * Mark conversation as read
 * @route POST /api/messages/conversation/:conversationId/read
 * @access Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id,
      isActive: true
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }
    
    // Mark all messages from this conversation as read by the user
    await Message.updateMany(
      { 
        conversationId, 
        receiver: req.user.id, 
        read: false 
      },
      { read: true, readAt: new Date() }
    );
    
    // Reset unread count for this user in this conversation
    conversation.unreadCount.set(req.user.id.toString(), 0);
    await conversation.save();
    
    res.status(200).json({
      success: true,
      message: 'Conversation marked as read',
    });
  } catch (error) {
    console.error('Mark conversation as read error:', error);
    
    // Provide more specific error messages based on the error type
    let errorMessage = 'Error marking conversation as read';
    if (error.name === 'ValidationError') {
      errorMessage = 'Invalid request data';
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid ID format';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
    });
  }
};

/**
 * Get messages for a conversation
 * @route GET /api/messages/conversation/:conversationId
 * @access Private
 */
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id,
      isActive: true
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied',
      });
    }
    
    // Get messages for this conversation with pagination
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar');
    
    // Get total count of messages
    const totalMessages = await Message.countDocuments({ conversationId });
    
    // Mark conversation as read for this user
    await Message.updateMany(
      { 
        conversationId, 
        receiver: req.user.id, 
        read: false 
      },
      { read: true, readAt: new Date() }
    );
    
    // Reset unread count for this user in this conversation
    conversation.unreadCount.set(req.user.id.toString(), 0);
    await conversation.save();
    
    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: {
        messages: messages.reverse(), // Reverse to show newest last
        totalPages: Math.ceil(totalMessages / limit),
        currentPage: page * 1,
        totalMessages,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    
    // Provide more specific error messages based on the error type
    let errorMessage = 'Error retrieving messages';
    if (error.name === 'ValidationError') {
      errorMessage = 'Invalid request data';
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid ID format';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
    });
  }
};

/**
 * Get user's conversations
 * @route GET /api/messages/conversations
 * @access Private
 */
exports.getConversations = async (req, res) => {
  try {
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: req.user.id,
      isActive: true
    })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .populate('participants', 'name email avatar')
    .populate('lastMessage');
    
    // Add unread count for each conversation
    const conversationsWithUnread = conversations.map(conversation => {
      const unreadCount = conversation.unreadCount.get(req.user.id.toString()) || 0;
      return {
        ...conversation.toObject(),
        unreadCount,
      };
    });
    
    res.status(200).json({
      success: true,
      message: 'Conversations retrieved successfully',
      data: conversationsWithUnread,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    
    // Provide more specific error messages based on the error type
    let errorMessage = 'Error retrieving conversations';
    if (error.name === 'ValidationError') {
      errorMessage = 'Invalid request data';
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid ID format';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
    });
  }
};