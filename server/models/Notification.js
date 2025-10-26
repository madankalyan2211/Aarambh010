const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required'],
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Notification content
  type: {
    type: String,
    enum: [
      'assignment_created',
      'assignment_due',
      'assignment_graded',
      'course_enrolled',
      'discussion_reply',
      'global_discussion', // Add this for global discussions
      'announcement',
      'grade_posted',
      'system',
      'message', // Added this for direct messages
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  // Related entities
  relatedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  relatedAssignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
  },
  relatedDiscussion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion',
  },
  // Notification metadata
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  // Actions
  actionUrl: {
    type: String,
  },
  actionLabel: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for querying
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  await this.save();
  return this;
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;