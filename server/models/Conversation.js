const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Participant is required'],
  }],
  lastMessage: {
    type: String,
    trim: true,
  },
  lastMessageTime: {
    type: Date,
  },
  lastMessageSender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {},
  },
  // Conversation metadata
  isGroup: {
    type: Boolean,
    default: false,
  },
  groupName: {
    type: String,
    trim: true,
  },
  groupAdmins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Ensure there are exactly 2 participants for direct messages
conversationSchema.pre('save', function(next) {
  if (!this.isGroup && this.participants.length !== 2) {
    return next(new Error('Direct conversations must have exactly 2 participants'));
  }
  next();
});

// Index for querying conversations
conversationSchema.index({ participants: 1 });
conversationSchema.index({ 'participants.0': 1, 'participants.1': 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;