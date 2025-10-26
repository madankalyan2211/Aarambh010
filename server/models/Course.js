const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
  },
  image: {
    type: String,
    default: '',
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Teachers can be assigned later
  },
  // Course content
  modules: [{
    title: String,
    description: String,
    order: Number,
    lessons: [{
      title: String,
      videoUrl: String,
      duration: Number, // in minutes
      order: Number,
      type: {
        type: String,
        enum: ['video', 'pdf'],
        default: 'video'
      }
    }],
  }],
  // Enrollment settings
  maxStudents: {
    type: Number,
    default: 100,
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // Course status
  isPublished: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Course metadata
  category: {
    type: String,
    default: 'General',
  },
  tags: [String],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  // Statistics
  totalEnrollments: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for searching
courseSchema.index({ name: 'text', description: 'text' });

// Virtual for getting student count
courseSchema.virtual('studentCount').get(function() {
  return this.enrolledStudents ? this.enrolledStudents.length : 0;
});

// Method to enroll a student
courseSchema.methods.enrollStudent = async function(studentId) {
  if (this.enrolledStudents.includes(studentId)) {
    throw new Error('Student already enrolled');
  }
  
  if (this.enrolledStudents.length >= this.maxStudents) {
    throw new Error('Course is full');
  }
  
  this.enrolledStudents.push(studentId);
  this.totalEnrollments += 1;
  await this.save();
  
  return this;
};

// Method to unenroll a student
courseSchema.methods.unenrollStudent = async function(studentId) {
  this.enrolledStudents = this.enrolledStudents.filter(
    id => id.toString() !== studentId.toString()
  );
  await this.save();
  
  return this;
};

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;