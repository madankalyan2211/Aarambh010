const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
  },
  // Target audience - could be specific courses, all students, etc.
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'teachers', 'specific_courses'],
    default: 'all',
  },
  // If targetAudience is 'specific_courses', this field will contain course IDs
  targetCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  }],
  // If targetAudience is 'students' or 'teachers', we can filter by role
  targetRoles: [{
    type: String,
    enum: ['student', 'teacher', 'admin'],
  }],
  // Priority level for sorting and notifications
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  // Whether this announcement should be pinned to the top
  isPinned: {
    type: Boolean,
    default: false,
  },
  // Whether this announcement is published and visible
  isPublished: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Index for querying
announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ isPinned: -1, createdAt: -1 });
announcementSchema.index({ author: 1 });

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;