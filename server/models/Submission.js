const mongoose = require('mongoose');

// Define attachment schema
const attachmentSchema = new mongoose.Schema({
  name: String,
  url: String,
  type: String,
  size: Number,
});

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment is required'],
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required'],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required'],
  },
  // Submission content - required only if no attachments
  content: {
    type: String,
    // Remove the required validation since content can be empty when files are attached
    default: '',
  },
  attachments: [attachmentSchema],
  // Submission metadata
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  isLate: {
    type: Boolean,
    default: false,
  },
  // Grading
  score: {
    type: Number,
    default: null,
  },
  feedback: {
    type: String,
    default: '',
  },
  gradedAt: {
    type: Date,
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Status
  status: {
    type: String,
    enum: ['submitted', 'graded', 'returned', 'resubmitted'],
    default: 'submitted',
  },
  // AI Detection
  aiDetectionScore: {
    type: Number,
    default: null,
  },
  plagiarismScore: {
    type: Number,
    default: null,
  },
  isFlagged: {
    type: Boolean,
    default: false,
  },
  flagReason: {
    type: String,
    default: '',
  },
  // Revision
  attempt: {
    type: Number,
    default: 1,
  },
  previousVersions: [{
    content: String,
    submittedAt: Date,
    score: Number,
  }],
}, {
  timestamps: true,
});

// Add a custom validator to ensure either content or attachments are provided
submissionSchema.pre('validate', function(next) {
  // If no content and no attachments, validation should fail
  if ((!this.content || this.content.trim() === '') && (!this.attachments || this.attachments.length === 0)) {
    next(new Error('Either submission content or file attachments are required'));
  } else {
    next();
  }
});

// Index for querying
submissionSchema.index({ assignment: 1, student: 1 });
submissionSchema.index({ course: 1, status: 1 });

// Method to calculate grade
submissionSchema.methods.calculateGrade = function(totalPoints) {
  if (!this.score) return null;
  
  const percentage = (this.score / totalPoints) * 100;
  
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
};

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;