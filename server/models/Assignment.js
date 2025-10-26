const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required'],
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required'],
  },
  // Assignment details
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
  },
  totalPoints: {
    type: Number,
    default: 100,
  },
  passingScore: {
    type: Number,
    default: 60,
  },
  // Assignment content
  instructions: {
    type: String,
    default: '',
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
  }],
  // Settings
  allowLateSubmission: {
    type: Boolean,
    default: false,
  },
  lateSubmissionPenalty: {
    type: Number,
    default: 10, // percentage
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  // AI detection settings
  enableAIDetection: {
    type: Boolean,
    default: true,
  },
  enablePlagiarismCheck: {
    type: Boolean,
    default: true,
  },
  // Statistics
  totalSubmissions: {
    type: Number,
    default: 0,
  },
  averageScore: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Virtual for checking if urgent (due within 24 hours)
assignmentSchema.virtual('isUrgent').get(function() {
  const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return this.dueDate <= oneDayFromNow;
});

// Virtual for days left
assignmentSchema.virtual('daysLeft').get(function() {
  const diff = this.dueDate - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Method to check if overdue
assignmentSchema.methods.isOverdue = function() {
  return new Date() > this.dueDate;
};

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
