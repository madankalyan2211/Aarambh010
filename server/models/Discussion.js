const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Discussion title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Discussion content is required'],
  },
  college: {
    type: String,
    trim: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false, // Make course optional to support global discussions
  },
  // Discussion metadata
  category: {
    type: String,
    enum: ['question', 'announcement', 'discussion', 'resource', 'global'],
    default: 'discussion',
  },
  tags: [String],
  // Replies
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  }],
  // Engagement
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  views: {
    type: Number,
    default: 0,
  },
  // Status
  isPinned: {
    type: Boolean,
    default: false,
  },
  isResolved: {
    type: Boolean,
    default: false,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Virtual for reply count
discussionSchema.virtual('replyCount').get(function() {
  return this.replies ? this.replies.length : 0;
});

// Virtual for like count
discussionSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

const Discussion = mongoose.model('Discussion', discussionSchema);

module.exports = Discussion;